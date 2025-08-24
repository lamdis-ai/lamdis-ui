import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Card } from './Card';
import { Field } from './Field';
import { Input, Select } from './Input';
import { Button } from './Button';
export function defaultPolicyModel() {
    return {
        rules: [
            {
                name: 'Allow when scope present',
                when: { combinator: 'AND', conditions: [{ left: 'scopes', op: 'contains', right: '"orders:write"' }] },
                then: { status: 'ALLOW', reasons: ['scope_present'] },
            },
        ],
        defaultOutcome: { status: 'BLOCKED', reasons: ['no_rule_matched'] },
    };
}
function isGroup(x) {
    return x.conditions !== undefined;
}
function parseLiteral(val) {
    if (val == null)
        return undefined;
    try {
        return JSON.parse(val);
    }
    catch {
        return val;
    }
}
function toPath(left) {
    const p = left.trim();
    if (!p)
        return 'input';
    return p.startsWith('input.') ? p : `input.${p}`;
}
function condToRego(c) {
    var _a;
    const left = toPath(c.left);
    const rightVal = parseLiteral(c.right);
    const right = c.right == null ? '' : typeof rightVal === 'string' ? JSON.stringify(rightVal) : String(rightVal);
    switch (c.op) {
        case '==': return `${left} == ${right}`;
        case '!=': return `${left} != ${right}`;
        case '>': return `to_number(${left}) > ${Number(rightVal)}`;
        case '>=': return `to_number(${left}) >= ${Number(rightVal)}`;
        case '<': return `to_number(${left}) < ${Number(rightVal)}`;
        case '<=': return `to_number(${left}) <= ${Number(rightVal)}`;
        case 'contains': return `contains(${left}, ${right})`;
        case 'not_contains': return `not contains(${left}, ${right})`;
        case 'exists': return `${left}`;
        case 'not_exists': return `not ${left}`;
        case 'matches': return `re_match(${JSON.stringify((_a = parseLiteral(c.right)) !== null && _a !== void 0 ? _a : '')}, to_string(${left}))`;
        default: return `${left} == ${right}`;
    }
}
function groupToRego(g, indent = '  ') {
    const parts = g.conditions.map((node) => {
        if (isGroup(node))
            return groupToRego(node, indent);
        return indent + condToRego(node);
    });
    if (g.combinator === 'AND') {
        return parts.join('\n');
    }
    else {
        const ors = g.conditions.map((node) => (isGroup(node) ? `(${groupToRego(node, '')})` : condToRego(node)));
        return `${indent}(${ors.join(' or ')})`;
    }
}
export function generateRegoFromModel(m) {
    const header = `package policy\n\n# Auto-generated from no-code builder\n`;
    const helpers = `default decide = ${JSON.stringify(m.defaultOutcome || { status: 'BLOCKED', reasons: ['no_rule_matched'] })}\n\ncontains(arr, v) {\n  some i\n  arr[i] == v\n}\n\n# to_string helper for matches\n to_string(x) = s { s := sprintf("%v", [x]) }\n`;
    // Expand a condition/group tree into disjunctive normal form: array of branches, each a list of expressions
    function expand(node) {
        if (node.conditions === undefined) {
            // condition
            return [[condToRego(node)]];
        }
        const g = node;
        if (!g.conditions || g.conditions.length === 0)
            return [[]];
        const childBranches = g.conditions.map((c) => expand(c));
        if (g.combinator === 'AND') {
            // cartesian product combine
            let acc = [[]];
            for (const branches of childBranches) {
                const next = [];
                for (const a of acc) {
                    for (const b of branches) {
                        next.push([...a, ...b]);
                    }
                }
                acc = next;
            }
            return acc;
        }
        else {
            // OR: union of branches
            return childBranches.flat();
        }
    }
    const rules = (m.rules || []).map((r) => {
        const branches = expand(r.when);
        const outcomeObj = (() => {
            const res = { status: r.then.status };
            if (r.then.reasons && r.then.reasons.length)
                res.reasons = r.then.reasons;
            if (r.then.status === 'ALLOW_WITH_CONDITIONS' && r.then.conditionsMap)
                res.conditions = r.then.conditionsMap;
            if (r.then.status === 'NEEDS_INPUT' && r.then.needs)
                res.needs = r.then.needs;
            if (r.then.alternatives && r.then.alternatives.length)
                res.alternatives = r.then.alternatives;
            return res;
        })();
        const name = r.name ? ` # ${r.name}` : '';
        const bodies = branches.map((conds, idx) => {
            const bodyLines = conds.map((c) => `  ${c}`).join('\n');
            const resLine = `  res := ${JSON.stringify(outcomeObj)}`;
            // Put the name comment on the first body for readability
            const comment = idx === 0 ? name : '';
            return `{${comment}\n${bodyLines}${bodyLines ? '\n' : ''}${resLine}\n}`;
        });
        if (bodies.length === 0) {
            // no conditions -> unconditional rule body
            const resLine = `  res := ${JSON.stringify(outcomeObj)}`;
            return `decide = res {${name}\n${resLine}\n}`;
        }
        return `decide = res ${bodies[0]}${bodies.slice(1).map((b) => ` or ${b}`).join('')}`;
    }).join('\n\n');
    return `${header}\n${helpers}\n${rules}\n`;
}
// Best-effort parser for Rego generated by generateRegoFromModel
export function parseModelFromRego(code) {
    const model = { rules: [], defaultOutcome: { status: 'BLOCKED', reasons: ['no_rule_matched'] } };
    if (!code)
        return model;
    // Try to extract default decide
    const defMatch = code.match(/default\s+decide\s*=\s*(\{[\s\S]*?\})/);
    if (defMatch) {
        try {
            model.defaultOutcome = JSON.parse(defMatch[1]);
        }
        catch { /* ignore */ }
    }
    // Find all occurrences of "decide = res"
    const rules = [];
    let idx = 0;
    while (true) {
        const start = code.indexOf('decide = res', idx);
        if (start === -1)
            break;
        idx = start + 12;
        // After head, collect one or more bodies: { ... } [or { ... }]*
        const bodies = [];
        let i = code.indexOf('{', idx);
        while (i !== -1) {
            // find matching closing '}' from position i
            let depth = 0;
            let j = i;
            while (j < code.length) {
                const ch = code[j];
                if (ch === '{')
                    depth++;
                else if (ch === '}') {
                    depth--;
                    if (depth === 0) {
                        j++;
                        break;
                    }
                }
                j++;
            }
            if (depth !== 0)
                break; // malformed
            const body = code.slice(i + 1, j - 1);
            bodies.push(body);
            // check for ' or ' pattern next
            const rest = code.slice(j).trimStart();
            if (rest.startsWith('or')) {
                // move idx to next '{'
                const k = code.indexOf('{', j);
                if (k === -1)
                    break;
                i = k;
                idx = k;
                continue;
            }
            idx = j;
            break;
        }
        if (bodies.length)
            rules.push({ bodies });
    }
    function parseCond(line) {
        const s = line.trim();
        if (!s)
            return null;
        if (s.startsWith('res :='))
            return null;
        // not exists
        let m = s.match(/^not\s+input\.(.+)$/);
        if (m)
            return { left: m[1], op: 'not_exists' };
        // exists
        m = s.match(/^input\.(.+)$/);
        if (m)
            return { left: m[1], op: 'exists' };
        // contains / not contains
        m = s.match(/^contains\(input\.(.+),\s*(.*)\)$/);
        if (m)
            return { left: m[1], op: 'contains', right: m[2] };
        m = s.match(/^not\s+contains\(input\.(.+),\s*(.*)\)$/);
        if (m)
            return { left: m[1], op: 'not_contains', right: m[2] };
        // comparisons with to_number
        m = s.match(/^to_number\(input\.(.+)\)\s*([><]=?)\s*(.+)$/);
        if (m)
            return { left: m[1], op: m[2], right: m[3] };
        // equals / not equals
        m = s.match(/^input\.(.+)\s*(==|!=)\s*(.+)$/);
        if (m)
            return { left: m[1], op: m[2], right: m[3] };
        // matches
        m = s.match(/^re_match\((.*),\s*to_string\(input\.(.+)\)\)$/);
        if (m)
            return { left: m[2], op: 'matches', right: m[1] };
        return null;
    }
    for (const r of rules) {
        const branches = [];
        let then = { status: 'ALLOW' };
        for (const b of r.bodies) {
            const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
            const conds = [];
            for (const line of lines) {
                if (line.startsWith('res :=')) {
                    const json = line.replace(/^res :=\s*/, '');
                    try {
                        const obj = JSON.parse(json);
                        then = obj;
                    }
                    catch { /* ignore */ }
                    continue;
                }
                const c = parseCond(line);
                if (c)
                    conds.push(c);
            }
            branches.push(conds);
        }
        const when = branches.length > 1
            ? { combinator: 'OR', conditions: branches.map((cs) => ({ combinator: 'AND', conditions: cs })) }
            : { combinator: 'AND', conditions: (branches[0] || []) };
        model.rules.push({ name: undefined, when, then });
    }
    return model;
}
export const PolicyBuilder = ({ value, onChange }) => {
    const m = value;
    const addRule = () => {
        const newRule = {
            name: 'New rule',
            when: { combinator: 'AND', conditions: [{ left: 'inputs.foo', op: '==', right: '"bar"' }] },
            then: { status: 'ALLOW', reasons: ['rule_matched'] },
        };
        onChange({ ...m, rules: [...(m.rules || []), newRule] });
    };
    const removeRule = (i) => () => onChange({ ...m, rules: m.rules.filter((_, idx) => idx !== i) });
    const setRule = (i, r) => onChange({ ...m, rules: m.rules.map((v, idx) => (idx === i ? r : v)) });
    const addNode = (g, node) => ({ ...g, conditions: [...g.conditions, node] });
    const removeNodeAt = (g, idx) => ({ ...g, conditions: g.conditions.filter((_, i) => i !== idx) });
    const setNodeAt = (g, idx, node) => ({ ...g, conditions: g.conditions.map((v, i) => (i === idx ? node : v)) });
    const renderGroup = (g, onChangeG) => {
        return (_jsxs("div", { className: "border rounded p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-sm", children: "Group" }), _jsxs(Select, { value: g.combinator, onChange: (e) => onChangeG({ ...g, combinator: e.target.value }), children: [_jsx("option", { value: "AND", children: "AND" }), _jsx("option", { value: "OR", children: "OR" })] }), _jsx(Button, { onClick: () => onChangeG(addNode(g, { left: 'inputs.key', op: '==', right: '"value"' })), children: "+ Condition" }), _jsx(Button, { onClick: () => onChangeG(addNode(g, { combinator: 'AND', conditions: [] })), children: "+ Group" })] }), _jsx("div", { className: "grid gap-2", children: g.conditions.map((node, idx) => {
                        var _a;
                        return (_jsx("div", { className: "grid sm:grid-cols-12 gap-2 items-center", children: isGroup(node) ? (_jsxs("div", { className: "sm:col-span-12", children: [renderGroup(node, (next) => onChangeG(setNodeAt(g, idx, next))), _jsx("div", { className: "mt-2", children: _jsx(Button, { onClick: () => onChangeG(removeNodeAt(g, idx)), children: "Remove group" }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Input, { className: "sm:col-span-5", value: node.left, onChange: (e) => onChangeG(setNodeAt(g, idx, { ...node, left: e.target.value })), placeholder: "inputs.total or facts.order.status" }), _jsxs(Select, { className: "sm:col-span-2", value: node.op, onChange: (e) => onChangeG(setNodeAt(g, idx, { ...node, op: e.target.value })), children: [_jsx("option", { value: "==", children: "==" }), _jsx("option", { value: "!=", children: "!=" }), _jsx("option", { value: ">", children: ">" }), _jsx("option", { value: ">=", children: ">=" }), _jsx("option", { value: "<", children: "<" }), _jsx("option", { value: "<=", children: "<=" }), _jsx("option", { value: "contains", children: "contains" }), _jsx("option", { value: "not_contains", children: "not contains" }), _jsx("option", { value: "exists", children: "exists" }), _jsx("option", { value: "not_exists", children: "not exists" }), _jsx("option", { value: "matches", children: "matches (regex)" })] }), (node.op === 'exists' || node.op === 'not_exists') ? (_jsx("div", { className: "sm:col-span-4 text-sm text-gray-500", children: "\u2014" })) : (_jsx(Input, { className: "sm:col-span-4", value: (_a = node.right) !== null && _a !== void 0 ? _a : '', onChange: (e) => onChangeG(setNodeAt(g, idx, { ...node, right: e.target.value })), placeholder: 'e.g. "orders:write" or 500 or true' })), _jsx("div", { className: "sm:col-span-1", children: _jsx(Button, { onClick: () => onChangeG(removeNodeAt(g, idx)), children: "\u2212" }) })] })) }, idx));
                    }) })] }));
    };
    const renderOutcome = (r, set) => {
        const st = r.then.status;
        const setStatus = (status) => set({ ...r, then: { ...r.then, status } });
        const setReasons = (reasons) => set({ ...r, then: { ...r.then, reasons } });
        const setAlt = (alts) => set({ ...r, then: { ...r.then, alternatives: alts } });
        const setNeeds = (needs) => set({ ...r, then: { ...r.then, needs } });
        const setCondsMap = (cm) => set({ ...r, then: { ...r.then, conditionsMap: cm } });
        return (_jsxs("div", { className: "grid gap-3", children: [_jsx(Field, { label: "Outcome", children: _jsxs("div", { className: "grid sm:grid-cols-2 gap-2", children: [_jsxs(Select, { value: st, onChange: (e) => setStatus(e.target.value), children: [_jsx("option", { value: "ALLOW", children: "ALLOW" }), _jsx("option", { value: "BLOCKED", children: "BLOCKED" }), _jsx("option", { value: "ALLOW_WITH_CONDITIONS", children: "ALLOW_WITH_CONDITIONS" }), _jsx("option", { value: "NEEDS_INPUT", children: "NEEDS_INPUT" })] }), _jsx(Input, { value: r.name || '', onChange: (e) => set({ ...r, name: e.target.value }), placeholder: "Rule name (optional)" })] }) }), _jsxs(Field, { label: "Reasons", children: [(r.then.reasons || []).map((x, i) => (_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Input, { value: x, onChange: (e) => setReasons((r.then.reasons || []).map((v, idx) => (idx === i ? e.target.value : v))) }), _jsx(Button, { onClick: () => setReasons((r.then.reasons || []).filter((_, idx) => idx !== i)), children: "\u2212" })] }, i))), _jsx(Button, { onClick: () => setReasons([...(r.then.reasons || []), '']), children: "+ Add reason" })] }), st === 'ALLOW_WITH_CONDITIONS' && (_jsxs(Field, { label: "Conditions map (key/value)", children: [Object.entries(r.then.conditionsMap || {}).map(([k, v], i) => (_jsxs("div", { className: "grid grid-cols-5 gap-2 mb-1", children: [_jsx(Input, { className: "col-span-2", value: k, onChange: (e) => {
                                        const cm = { ...(r.then.conditionsMap || {}) };
                                        const oldV = cm[k];
                                        delete cm[k];
                                        cm[e.target.value] = oldV;
                                        setCondsMap(cm);
                                    }, placeholder: "acr" }), _jsx(Input, { className: "col-span-2", value: typeof v === 'string' ? v : JSON.stringify(v), onChange: (e) => {
                                        const cm = { ...(r.then.conditionsMap || {}) };
                                        try {
                                            cm[k] = JSON.parse(e.target.value);
                                        }
                                        catch {
                                            cm[k] = e.target.value;
                                        }
                                        setCondsMap(cm);
                                    }, placeholder: '"urn:mfa" or 900' }), _jsx("div", { className: "col-span-1", children: _jsx(Button, { onClick: () => { const cm = { ...(r.then.conditionsMap || {}) }; delete cm[k]; setCondsMap(cm); }, children: "\u2212" }) })] }, i))), _jsx(Button, { onClick: () => setCondsMap({ ...(r.then.conditionsMap || {}), '': '' }), children: "+ Add condition" })] })), st === 'NEEDS_INPUT' && (_jsxs(Field, { label: "Needs fields", children: [(r.then.needs || []).map((nf, i) => (_jsxs("div", { className: "grid grid-cols-6 gap-2 mb-1", children: [_jsx(Input, { className: "col-span-2", value: nf.field, onChange: (e) => setNeeds((r.then.needs || []).map((v, idx) => (idx === i ? { ...v, field: e.target.value } : v))), placeholder: "reason" }), _jsx(Input, { className: "col-span-2", value: nf.title, onChange: (e) => setNeeds((r.then.needs || []).map((v, idx) => (idx === i ? { ...v, title: e.target.value } : v))), placeholder: "Why?" }), _jsxs(Select, { value: nf.type, onChange: (e) => setNeeds((r.then.needs || []).map((v, idx) => (idx === i ? { ...v, type: e.target.value } : v))), children: [_jsx("option", { value: "string", children: "string" }), _jsx("option", { value: "number", children: "number" }), _jsx("option", { value: "boolean", children: "boolean" })] }), _jsx("div", { children: _jsx(Button, { onClick: () => setNeeds((r.then.needs || []).filter((_, idx) => idx !== i)), children: "\u2212" }) })] }, i))), _jsx(Button, { onClick: () => setNeeds([...(r.then.needs || []), { field: '', title: '', type: 'string' }]), children: "+ Add field" })] })), st === 'BLOCKED' && (_jsxs(Field, { label: "Alternatives (optional)", children: [(r.then.alternatives || []).map((alt, i) => (_jsxs("div", { className: "grid grid-cols-5 gap-2 mb-1", children: [_jsx(Input, { className: "col-span-2", value: alt.action, onChange: (e) => setAlt((r.then.alternatives || []).map((v, idx) => (idx === i ? { ...v, action: e.target.value } : v))), placeholder: "contact_support" }), _jsx(Input, { className: "col-span-2", value: alt.title, onChange: (e) => setAlt((r.then.alternatives || []).map((v, idx) => (idx === i ? { ...v, title: e.target.value } : v))), placeholder: "Contact support" }), _jsx("div", { children: _jsx(Button, { onClick: () => setAlt((r.then.alternatives || []).filter((_, idx) => idx !== i)), children: "\u2212" }) })] }, i))), _jsx(Button, { onClick: () => setAlt([...(r.then.alternatives || []), { action: '', title: '' }]), children: "+ Add alternative" })] }))] }));
    };
    const regoPreview = useMemo(() => generateRegoFromModel(m), [m]);
    return (_jsx(Card, { children: _jsxs("div", { className: "grid gap-4", children: [_jsx("div", { className: "text-base font-semibold", children: "Policy builder" }), _jsxs("div", { className: "grid gap-4", children: [(m.rules || []).map((r, i) => (_jsxs("div", { className: "border rounded p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "font-medium", children: ["Rule ", i + 1, r.name ? `: ${r.name}` : ''] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { onClick: removeRule(i), children: "Remove" }) })] }), _jsx(Field, { label: "When", children: renderGroup(r.when, (next) => setRule(i, { ...r, when: next })) }), _jsx(Field, { label: "Then", children: renderOutcome(r, (next) => setRule(i, next)) })] }, i))), _jsx(Button, { onClick: addRule, children: "+ Add rule" })] }), _jsx(Field, { label: "Generated Rego (preview)", children: _jsx("pre", { className: "bg-neutral-900 text-neutral-100 p-3 rounded text-xs overflow-auto", children: regoPreview }) })] }) }));
};

import React, { useMemo } from 'react';
import { Card } from './Card';
import { Field } from './Field';
import { Input, Select } from './Input';
import { Button } from './Button';

// Dynamic model: rules with nested condition groups and generic outcomes
export type Condition = {
  left: string; // e.g., "inputs.reason" or "facts.order.total" or "scopes"
  op: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'matches';
  right?: string; // literal as string; JSON parsed if possible
};

export type ConditionGroup = {
  combinator: 'AND' | 'OR';
  conditions: Array<Condition | ConditionGroup>;
};

export type Outcome = {
  status: 'ALLOW' | 'BLOCKED' | 'ALLOW_WITH_CONDITIONS' | 'NEEDS_INPUT';
  reasons?: string[];
  conditionsMap?: Record<string, any>; // for ALLOW_WITH_CONDITIONS
  needs?: { field: string; title: string; type: 'string' | 'number' | 'boolean'; required?: boolean }[];
  alternatives?: { action: string; title: string }[]; // optional for BLOCKED UX
};

export type Rule = {
  name?: string;
  when: ConditionGroup;
  then: Outcome;
};

export type PolicyModel = {
  rules: Rule[];
  defaultOutcome?: Outcome; // used when no rule matches
};

export function defaultPolicyModel(): PolicyModel {
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

function isGroup(x: Condition | ConditionGroup): x is ConditionGroup {
  return (x as any).conditions !== undefined;
}

function parseLiteral(val?: string): any {
  if (val == null) return undefined;
  try { return JSON.parse(val); } catch { return val; }
}

function toPath(left: string): string {
  const p = left.trim();
  if (!p) return 'input';
  return p.startsWith('input.') ? p : `input.${p}`;
}

function condToRego(c: Condition): string {
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
    case 'matches': return `re_match(${JSON.stringify(parseLiteral(c.right) ?? '')}, to_string(${left}))`;
    default: return `${left} == ${right}`;
  }
}

function groupToRego(g: ConditionGroup, indent = '  '): string {
  const parts = g.conditions.map((node) => {
    if (isGroup(node)) return groupToRego(node as ConditionGroup, indent);
    return indent + condToRego(node as Condition);
  });
  if (g.combinator === 'AND') {
    return parts.join('\n');
  } else {
    const ors = g.conditions.map((node) => (isGroup(node) ? `(${groupToRego(node as ConditionGroup, '')})` : condToRego(node as Condition)));
    return `${indent}(${ors.join(' or ')})`;
  }
}

export function generateRegoFromModel(m: PolicyModel): string {
  const header = `package policy\n\n# Auto-generated from no-code builder\n`;
  const helpers = `default decide = ${JSON.stringify(m.defaultOutcome || { status: 'BLOCKED', reasons: ['no_rule_matched'] })}\n\ncontains(arr, v) {\n  some i\n  arr[i] == v\n}\n\n# to_string helper for matches\n to_string(x) = s { s := sprintf("%v", [x]) }\n`;

  // Expand a condition/group tree into disjunctive normal form: array of branches, each a list of expressions
  function expand(node: Condition | ConditionGroup): string[][] {
    if ((node as any).conditions === undefined) {
      // condition
      return [[condToRego(node as Condition)]];
    }
    const g = node as ConditionGroup;
    if (!g.conditions || g.conditions.length === 0) return [[]];
    const childBranches = g.conditions.map((c) => expand(c as any));
    if (g.combinator === 'AND') {
      // cartesian product combine
      let acc: string[][] = [[]];
      for (const branches of childBranches) {
        const next: string[][] = [];
        for (const a of acc) {
          for (const b of branches) {
            next.push([...a, ...b]);
          }
        }
        acc = next;
      }
      return acc;
    } else {
      // OR: union of branches
      return childBranches.flat();
    }
  }

  const rules = (m.rules || []).map((r) => {
    const branches = expand(r.when);
    const outcomeObj = (() => {
      const res: any = { status: r.then.status };
      if (r.then.reasons && r.then.reasons.length) res.reasons = r.then.reasons;
      if (r.then.status === 'ALLOW_WITH_CONDITIONS' && r.then.conditionsMap) res.conditions = r.then.conditionsMap;
      if (r.then.status === 'NEEDS_INPUT' && r.then.needs) res.needs = r.then.needs;
      if (r.then.alternatives && r.then.alternatives.length) res.alternatives = r.then.alternatives;
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
export function parseModelFromRego(code: string): PolicyModel {
  const model: PolicyModel = { rules: [], defaultOutcome: { status: 'BLOCKED', reasons: ['no_rule_matched'] } };
  if (!code) return model;

  // Try to extract default decide
  const defMatch = code.match(/default\s+decide\s*=\s*(\{[\s\S]*?\})/);
  if (defMatch) {
    try { model.defaultOutcome = JSON.parse(defMatch[1]); } catch { /* ignore */ }
  }

  // Find all occurrences of "decide = res"
  const rules: { bodies: string[] }[] = [];
  let idx = 0;
  while (true) {
    const start = code.indexOf('decide = res', idx);
    if (start === -1) break;
    idx = start + 12;
    // After head, collect one or more bodies: { ... } [or { ... }]*
    const bodies: string[] = [];
    let i = code.indexOf('{', idx);
    while (i !== -1) {
      // find matching closing '}' from position i
      let depth = 0;
      let j = i;
      while (j < code.length) {
        const ch = code[j];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { j++; break; } }
        j++;
      }
      if (depth !== 0) break; // malformed
      const body = code.slice(i + 1, j - 1);
      bodies.push(body);
      // check for ' or ' pattern next
      const rest = code.slice(j).trimStart();
      if (rest.startsWith('or')) {
        // move idx to next '{'
        const k = code.indexOf('{', j);
        if (k === -1) break;
        i = k;
        idx = k;
        continue;
      }
      idx = j;
      break;
    }
    if (bodies.length) rules.push({ bodies });
  }

  function parseCond(line: string): Condition | null {
    const s = line.trim();
    if (!s) return null;
    if (s.startsWith('res :=')) return null;
    // not exists
    let m = s.match(/^not\s+input\.(.+)$/);
    if (m) return { left: m[1], op: 'not_exists' } as Condition;
    // exists
    m = s.match(/^input\.(.+)$/);
    if (m) return { left: m[1], op: 'exists' } as Condition;
    // contains / not contains
    m = s.match(/^contains\(input\.(.+),\s*(.*)\)$/);
    if (m) return { left: m[1], op: 'contains', right: m[2] } as Condition;
    m = s.match(/^not\s+contains\(input\.(.+),\s*(.*)\)$/);
    if (m) return { left: m[1], op: 'not_contains', right: m[2] } as Condition;
    // comparisons with to_number
    m = s.match(/^to_number\(input\.(.+)\)\s*([><]=?)\s*(.+)$/);
    if (m) return { left: m[1], op: (m[2] as any), right: m[3] } as Condition;
    // equals / not equals
    m = s.match(/^input\.(.+)\s*(==|!=)\s*(.+)$/);
    if (m) return { left: m[1], op: (m[2] as any), right: m[3] } as Condition;
    // matches
    m = s.match(/^re_match\((.*),\s*to_string\(input\.(.+)\)\)$/);
    if (m) return { left: m[2], op: 'matches', right: m[1] } as Condition;
    return null;
  }

  for (const r of rules) {
    const branches: Condition[][] = [];
    let then: Outcome = { status: 'ALLOW' } as any;
    for (const b of r.bodies) {
      const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
      const conds: Condition[] = [];
      for (const line of lines) {
        if (line.startsWith('res :=')) {
          const json = line.replace(/^res :=\s*/, '');
          try { const obj = JSON.parse(json); then = obj as Outcome; } catch {/* ignore */}
          continue;
        }
        const c = parseCond(line);
        if (c) conds.push(c);
      }
      branches.push(conds);
    }
    const when: ConditionGroup = branches.length > 1
      ? { combinator: 'OR', conditions: branches.map((cs) => ({ combinator: 'AND', conditions: cs })) as any }
      : { combinator: 'AND', conditions: (branches[0] || []) };
    model.rules.push({ name: undefined, when, then });
  }

  return model;
}

type ActionRef = { key: string; display_name?: string } | string;
type Props = {
  value: PolicyModel;
  onChange: (v: PolicyModel) => void;
  actions?: ActionRef[]; // list of enabled actions for alternative suggestions
};

export const PolicyBuilder: React.FC<Props> = ({ value, onChange, actions }) => {
  const m = value;

  const addRule = () => {
    const newRule: Rule = {
      name: 'New rule',
      when: { combinator: 'AND', conditions: [{ left: 'inputs.foo', op: '==', right: '"bar"' }] },
      then: { status: 'ALLOW', reasons: ['rule_matched'] },
    };
    onChange({ ...m, rules: [...(m.rules || []), newRule] });
  };
  const removeRule = (i: number) => () => onChange({ ...m, rules: m.rules.filter((_, idx) => idx !== i) });
  const setRule = (i: number, r: Rule) => onChange({ ...m, rules: m.rules.map((v, idx) => (idx === i ? r : v)) });

  const addNode = (g: ConditionGroup, node: Condition | ConditionGroup): ConditionGroup => ({ ...g, conditions: [...g.conditions, node] });
  const removeNodeAt = (g: ConditionGroup, idx: number): ConditionGroup => ({ ...g, conditions: g.conditions.filter((_, i) => i !== idx) });
  const setNodeAt = (g: ConditionGroup, idx: number, node: Condition | ConditionGroup): ConditionGroup => ({ ...g, conditions: g.conditions.map((v, i) => (i === idx ? node : v)) });

  const renderGroup = (g: ConditionGroup, onChangeG: (next: ConditionGroup) => void) => {
    return (
      <div className="border rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">Group</span>
          <Select value={g.combinator} onChange={(e) => onChangeG({ ...g, combinator: e.target.value as any })}>
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </Select>
          <Button onClick={() => onChangeG(addNode(g, { left: 'inputs.key', op: '==', right: '"value"' }))}>+ Condition</Button>
          <Button onClick={() => onChangeG(addNode(g, { combinator: 'AND', conditions: [] }))}>+ Group</Button>
        </div>
        <div className="grid gap-2">
          {g.conditions.map((node, idx) => (
            <div key={idx} className="grid sm:grid-cols-12 gap-2 items-center">
              {isGroup(node) ? (
                <div className="sm:col-span-12">
                  {renderGroup(node as ConditionGroup, (next) => onChangeG(setNodeAt(g, idx, next)))}
                  <div className="mt-2"><Button onClick={() => onChangeG(removeNodeAt(g, idx))}>Remove group</Button></div>
                </div>
              ) : (
                <>
                  <Input className="sm:col-span-5" value={(node as Condition).left} onChange={(e) => onChangeG(setNodeAt(g, idx, { ...(node as Condition), left: e.target.value }))} placeholder="inputs.total or facts.order.status" />
                  <Select className="sm:col-span-2" value={(node as Condition).op} onChange={(e) => onChangeG(setNodeAt(g, idx, { ...(node as Condition), op: e.target.value as any }))}>
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="contains">contains</option>
                    <option value="not_contains">not contains</option>
                    <option value="exists">exists</option>
                    <option value="not_exists">not exists</option>
                    <option value="matches">matches (regex)</option>
                  </Select>
                  {((node as Condition).op === 'exists' || (node as Condition).op === 'not_exists') ? (
                    <div className="sm:col-span-4 text-sm text-gray-500">—</div>
                  ) : (
                    <Input className="sm:col-span-4" value={(node as Condition).right ?? ''} onChange={(e) => onChangeG(setNodeAt(g, idx, { ...(node as Condition), right: e.target.value }))} placeholder='e.g. "orders:write" or 500 or true' />
                  )}
                  <div className="sm:col-span-1"><Button onClick={() => onChangeG(removeNodeAt(g, idx))}>−</Button></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOutcome = (r: Rule, set: (nr: Rule) => void) => {
    const st = r.then.status;
    const setStatus = (status: Outcome['status']) => set({ ...r, then: { ...r.then, status } });
    const setReasons = (reasons: string[]) => set({ ...r, then: { ...r.then, reasons } });
    const setAlt = (alts: { action: string; title: string }[]) => set({ ...r, then: { ...r.then, alternatives: alts } });
    const setNeeds = (needs: NonNullable<Outcome['needs']>) => set({ ...r, then: { ...r.then, needs } });
    const setCondsMap = (cm: Record<string, any>) => set({ ...r, then: { ...r.then, conditionsMap: cm } });

    return (
      <div className="grid gap-3">
        <Field label="Outcome">
          <div className="grid sm:grid-cols-2 gap-2">
            <Select value={st} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="ALLOW">ALLOW</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="ALLOW_WITH_CONDITIONS">ALLOW_WITH_CONDITIONS</option>
              <option value="NEEDS_INPUT">NEEDS_INPUT</option>
            </Select>
            <Input value={r.name || ''} onChange={(e) => set({ ...r, name: e.target.value })} placeholder="Rule name (optional)" />
          </div>
        </Field>
        <Field label="Reasons">
          {(r.then.reasons || []).map((x, i) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <Input value={x} onChange={(e) => setReasons((r.then.reasons || []).map((v, idx) => (idx === i ? e.target.value : v)))} />
              <Button onClick={() => setReasons((r.then.reasons || []).filter((_, idx) => idx !== i))}>−</Button>
            </div>
          ))}
          <Button onClick={() => setReasons([...(r.then.reasons || []), ''])}>+ Add reason</Button>
        </Field>
        {st === 'ALLOW_WITH_CONDITIONS' && (
          <Field label="Conditions map (key/value)">
            {Object.entries(r.then.conditionsMap || {}).map(([k, v], i) => (
              <div key={i} className="grid grid-cols-5 gap-2 mb-1">
                <Input className="col-span-2" value={k} onChange={(e) => {
                  const cm = { ...(r.then.conditionsMap || {}) } as any; const oldV = cm[k]; delete cm[k]; cm[e.target.value] = oldV; setCondsMap(cm);
                }} placeholder="acr" />
                <Input className="col-span-2" value={typeof v === 'string' ? v : JSON.stringify(v)} onChange={(e) => {
                  const cm = { ...(r.then.conditionsMap || {}) } as any; try { cm[k] = JSON.parse(e.target.value); } catch { cm[k] = e.target.value; } setCondsMap(cm);
                }} placeholder='"urn:mfa" or 900' />
                <div className="col-span-1"><Button onClick={() => { const cm = { ...(r.then.conditionsMap || {}) } as any; delete cm[k]; setCondsMap(cm); }}>−</Button></div>
              </div>
            ))}
            <Button onClick={() => setCondsMap({ ...(r.then.conditionsMap || {}), '': '' })}>+ Add condition</Button>
          </Field>
        )}
        {st === 'NEEDS_INPUT' && (
          <Field label="Needs fields">
            {(r.then.needs || []).map((nf, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 mb-1">
                <Input className="col-span-2" value={nf.field} onChange={(e) => setNeeds((r.then.needs || []).map((v, idx) => (idx === i ? { ...v, field: e.target.value } : v)))} placeholder="reason" />
                <Input className="col-span-2" value={nf.title} onChange={(e) => setNeeds((r.then.needs || []).map((v, idx) => (idx === i ? { ...v, title: e.target.value } : v)))} placeholder="Why?" />
                <Select value={nf.type} onChange={(e) => setNeeds((r.then.needs || []).map((v, idx) => (idx === i ? { ...v, type: e.target.value as any } : v)))}>
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                </Select>
                <div><Button onClick={() => setNeeds((r.then.needs || []).filter((_, idx) => idx !== i))}>−</Button></div>
              </div>
            ))}
            <Button onClick={() => setNeeds([...(r.then.needs || []), { field: '', title: '', type: 'string' }])}>+ Add field</Button>
          </Field>
        )}
        {st === 'BLOCKED' && (
          <Field label="Alternatives (optional)">
            {(r.then.alternatives || []).map((alt, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 mb-1">
                <Select className="col-span-2" value={alt.action} onChange={(e) => setAlt((r.then.alternatives || []).map((v, idx) => (idx === i ? { ...v, action: e.target.value } : v)))}>
                  <option value="">(pick action)</option>
                  {(actions || []).map(act => {
                    const key = typeof act === 'string' ? act : act.key;
                    return <option key={key} value={key}>{key}</option>;
                  })}
                </Select>
                <Input className="col-span-3" value={alt.title} onChange={(e) => setAlt((r.then.alternatives || []).map((v, idx) => (idx === i ? { ...v, title: e.target.value } : v)))} placeholder="Label shown to user" />
                <div><Button onClick={() => setAlt((r.then.alternatives || []).filter((_, idx) => idx !== i))}>−</Button></div>
              </div>
            ))}
            <Button onClick={() => setAlt([...(r.then.alternatives || []), { action: '', title: '' }])}>+ Add alternative</Button>
          </Field>
        )}
      </div>
    );
  };

  const regoPreview = useMemo(() => generateRegoFromModel(m), [m]);

  return (
    <Card>
      <div className="grid gap-4">
        <div className="text-base font-semibold">Policy builder</div>

        <div className="grid gap-4">
          {(m.rules || []).map((r, i) => (
            <div key={i} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Rule {i + 1}{r.name ? `: ${r.name}` : ''}</div>
                <div className="flex gap-2">
                  <Button onClick={removeRule(i)}>Remove</Button>
                </div>
              </div>
              <Field label="When">
                {renderGroup(r.when, (next) => setRule(i, { ...r, when: next }))}
              </Field>
              <Field label="Then">
                {renderOutcome(r, (next) => setRule(i, next))}
              </Field>
            </div>
          ))}
          <Button onClick={addRule}>+ Add rule</Button>
        </div>

        <Field label="Generated Rego (preview)">
          <pre
            className="p-3 rounded text-xs overflow-auto transition-colors bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
          >
            {regoPreview}
          </pre>
        </Field>
      </div>
    </Card>
  );
};

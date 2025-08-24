import React from 'react';
export type Condition = {
    left: string;
    op: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'matches';
    right?: string;
};
export type ConditionGroup = {
    combinator: 'AND' | 'OR';
    conditions: Array<Condition | ConditionGroup>;
};
export type Outcome = {
    status: 'ALLOW' | 'BLOCKED' | 'ALLOW_WITH_CONDITIONS' | 'NEEDS_INPUT';
    reasons?: string[];
    conditionsMap?: Record<string, any>;
    needs?: {
        field: string;
        title: string;
        type: 'string' | 'number' | 'boolean';
        required?: boolean;
    }[];
    alternatives?: {
        action: string;
        title: string;
    }[];
};
export type Rule = {
    name?: string;
    when: ConditionGroup;
    then: Outcome;
};
export type PolicyModel = {
    rules: Rule[];
    defaultOutcome?: Outcome;
};
export declare function defaultPolicyModel(): PolicyModel;
export declare function generateRegoFromModel(m: PolicyModel): string;
export declare function parseModelFromRego(code: string): PolicyModel;
type Props = {
    value: PolicyModel;
    onChange: (v: PolicyModel) => void;
};
export declare const PolicyBuilder: React.FC<Props>;
export {};

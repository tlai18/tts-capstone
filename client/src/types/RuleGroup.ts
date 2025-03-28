export interface RuleGroup {
    id: number;
    remarks: string[];
    rules: Rule[];
}

export interface Rule {
    ruleGroupId: number;
    protocol: string;
    ruleType: string;
    ruleBody: string;
}

export interface Remark {
    ruleGroupId: number;
    remark: string;
}
export interface RuleGroup {
    remarks: string[];
    rules: Rule[];
}

interface Rule {
    ruleGroupId: number;
    protocol: string;
    ruleType: string;
    ruleBody: string;
}

interface Remark {
    ruleGroupId: number;
    remark: string;
}
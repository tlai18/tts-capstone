export interface RuleGroup {
    remarks: string[];
    rules: Rule[];
}

interface Rule {
    protocol: string;
    ruleType: string;
    ruleBody: string;
}

export const ruleGroups: RuleGroup[] = [
    {
      remarks: [
        "This rule group applies to traffic filtering based on protocol and type.",
        "Ensure proper logging for all denied traffic."
      ],
      rules: [
        {
          protocol: "TCP",
          ruleType: "Allow",
          ruleBody: "Allow incoming traffic on port 80 from all sources."
        },
        {
          protocol: "TCP",
          ruleType: "Deny",
          ruleBody: "Deny incoming traffic on port 22 from all sources except trusted IPs."
        },
        {
          protocol: "UDP",
          ruleType: "Allow",
          ruleBody: "Allow outgoing traffic on port 53 for DNS queries."
        }
      ]
    },
    {
      remarks: [
        "This rule group governs access to internal services based on IP ranges.",
        "Access control for the web application servers."
      ],
      rules: [
        {
          protocol: "TCP",
          ruleType: "Allow",
          ruleBody: "Allow incoming traffic on port 443 from trusted IP ranges."
        },
        {
          protocol: "TCP",
          ruleType: "Deny",
          ruleBody: "Deny incoming traffic on port 3306 from all sources."
        }
      ]
    },
    {
      remarks: [
        "This rule group manages outbound traffic from the web servers.",
        "Ensure that no sensitive data is leaked via untrusted protocols."
      ],
      rules: [
        {
          protocol: "TCP",
          ruleType: "Allow",
          ruleBody: "Allow outgoing traffic to port 443 (HTTPS) for secure web browsing."
        },
        {
          protocol: "UDP",
          ruleType: "Deny",
          ruleBody: "Deny outgoing traffic on port 123 (NTP) to external servers."
        },
        {
          protocol: "TCP",
          ruleType: "Allow",
          ruleBody: "Allow outgoing traffic on port 80 (HTTP) to trusted web services."
        }
      ]
    }
  ];
  
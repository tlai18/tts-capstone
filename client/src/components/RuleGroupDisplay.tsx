import React, { useState } from 'react';

// Define the interfaces
export interface RuleGroup {
  remarks: string[];
  rules: Rule[];
}

interface Rule {
  protocol: string;
  ruleType: string;
  ruleBody: string;
}

// Sample data
export const ruleGroups: RuleGroup[] = [
  {
    remarks: [
      "This rule group applies to traffic filtering based on protocol and type.",
      "Ensure proper logging for all denied traffic.",
    ],
    rules: [
      {
        protocol: "TCP",
        ruleType: "Allow",
        ruleBody: "Allow incoming traffic on port 80 from all sources.",
      },
      {
        protocol: "TCP",
        ruleType: "Deny",
        ruleBody: "Deny incoming traffic on port 22 from all sources except trusted IPs.",
      },
      {
        protocol: "UDP",
        ruleType: "Allow",
        ruleBody: "Allow outgoing traffic on port 53 for DNS queries.",
      },
    ],
  },
  {
    remarks: [
      "This rule group governs access to internal services based on IP ranges.",
      "Access control for the web application servers.",
    ],
    rules: [
      {
        protocol: "TCP",
        ruleType: "Allow",
        ruleBody: "Allow incoming traffic on port 443 from trusted IP ranges.",
      },
      {
        protocol: "TCP",
        ruleType: "Deny",
        ruleBody: "Deny incoming traffic on port 3306 from all sources.",
      },
    ],
  },
  {
    remarks: [
      "This rule group manages outbound traffic from the web servers.",
      "Ensure that no sensitive data is leaked via untrusted protocols.",
    ],
    rules: [
      {
        protocol: "TCP",
        ruleType: "Allow",
        ruleBody: "Allow outgoing traffic to port 443 (HTTPS) for secure web browsing.",
      },
      {
        protocol: "UDP",
        ruleType: "Deny",
        ruleBody: "Deny outgoing traffic on port 123 (NTP) to external servers.",
      },
      {
        protocol: "TCP",
        ruleType: "Allow",
        ruleBody: "Allow outgoing traffic on port 80 (HTTP) to trusted web services.",
      },
    ],
  },
];

// React component to display the rule groups with dropdown design
const RuleGroupDisplay: React.FC = () => {
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null);

  const toggleGroup = (index: number) => {
    setOpenGroupIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div style={styles.container}>
      {ruleGroups.map((group, groupIndex) => (
        <div key={groupIndex} style={styles.group}>
          <div
            style={styles.header}
            onClick={() => toggleGroup(groupIndex)}
          >
            <h3 style={styles.title}>Rule Group {groupIndex + 1}</h3>
            <span style={styles.arrow}>
              {openGroupIndex === groupIndex ? '▼' : '▶'}
            </span>
          </div>
          {openGroupIndex === groupIndex && (
            <div style={styles.content}>
              <div style={styles.remarks}>
                <strong>Remarks:</strong>
                <ul>
                  {group.remarks.map((remark, remarkIndex) => (
                    <li key={remarkIndex} style={styles.remarkItem}>
                      {remark}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={styles.rules}>
                <strong>Rules:</strong>
                <ul>
                  {group.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} style={styles.ruleItem}>
                      <div>
                        <strong>Protocol:</strong> {rule.protocol}
                      </div>
                      <div>
                        <strong>Type:</strong> {rule.ruleType}
                      </div>
                      <div>
                        <strong>Body:</strong> {rule.ruleBody}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Modern styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f0f8ff', // Matching the background color of Proof component
  },
  group: {
    marginBottom: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  title: {
    margin: '0',
    fontSize: '18px',
    color: '#333',
  },
  arrow: {
    fontSize: '14px',
    color: '#666',
  },
  content: {
    padding: '16px',
    backgroundColor: '#fff',
  },
  remarks: {
    marginBottom: '16px',
  },
  remarkItem: {
    marginBottom: '8px',
    fontSize: '14px',
    color: '#555',
  },
  rules: {
    marginTop: '16px',
  },
  ruleItem: {
    marginBottom: '12px',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
    fontSize: '14px',
    color: '#444',
  },
};

export default RuleGroupDisplay;
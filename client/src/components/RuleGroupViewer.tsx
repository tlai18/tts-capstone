import React, { useState } from 'react';

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

interface RuleGroup {
  remarks: string[];
  rules: Rule[];
}

const RuleGroupViewer: React.FC = () => {
  const [host, setHost] = useState<string>('');
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuleGroups = async () => {
    if (!host.trim()) {
      setError('Host parameter is required');
      return;
    }

    setLoading(true);
    setError(null);
    setRuleGroups([]);

    try {
      const groupsResponse = await fetch(
        `/api/ruleGroupsByHost?host=${encodeURIComponent(host)}`
      );

      if (!groupsResponse.ok) {
        throw new Error(`Failed to fetch rule groups: ${groupsResponse.status}`);
      }

      const ruleGroupIds: number[] = await groupsResponse.json();

      const detailedGroups = await Promise.all(
        ruleGroupIds.map(async (ruleGroupId) => {
          const [rulesResponse, remarksResponse] = await Promise.all([
            fetch(`/api/getRules?ruleGroupId=${ruleGroupId}`),
            fetch(`/api/getRemarks?ruleGroupId=${ruleGroupId}`),
          ]);

          if (!rulesResponse.ok || !remarksResponse.ok) {
            throw new Error('Failed to fetch rules or remarks');
          }

          const rules: Rule[] = await rulesResponse.json();
          const remarks: Remark[] = await remarksResponse.json();

          return {
            remarks: remarks.map(r => r.remark),
            rules: rules.map(rule => ({
              ruleGroupId: rule.ruleGroupId,
              protocol: rule.protocol,
              ruleType: rule.ruleType,
              ruleBody: rule.ruleBody,
            })),
          };
        })
      );

      setRuleGroups(detailedGroups);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRuleGroups();
  };

  // Style object
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      color: '#2a4e6b',
      marginBottom: '20px',
      borderBottom: '2px solid #a8d0e6',
      paddingBottom: '10px',
    },
    form: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginBottom: '20px',
      backgroundColor: '#e1f0fa',
      padding: '15px',
      borderRadius: '8px',
    },
    input: {
      flex: 1,
      padding: '10px',
      border: '1px solid #a8d0e6',
      borderRadius: '4px',
      fontSize: '16px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#4a90e2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
    },
    buttonDisabled: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
    error: {
      color: '#d32f2f',
      backgroundColor: '#ffebee',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    loading: {
      color: '#2a4e6b',
      textAlign: 'center',
      padding: '20px',
    },
    ruleGroup: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    ruleGroupHeader: {
      color: '#2a4e6b',
      marginTop: '0',
    },
    remarks: {
      backgroundColor: '#e1f0fa',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '15px',
    },
    ruleItem: {
      backgroundColor: '#f7fbff',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '10px',
      borderLeft: '4px solid #4a90e2',
    },
    noResults: {
      color: '#666',
      textAlign: 'center',
      padding: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Rule Groups by Host</h1>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <label htmlFor="host" style={{ fontWeight: 'bold', color: '#2a4e6b' }}>Host:</label>
        <input
          id="host"
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="e.g., 192.168.1.1"
          required
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={styles.error}>
          Error: {error}
        </div>
      )}

      {/* {loading && (
        // <div style={styles.loading}>
        //   <p>Loading rule groups...</p>
        // </div>
      )} */}

      {!loading && ruleGroups.length > 0 && (
        <div>
          <h2 style={{ color: '#2a4e6b' }}>Found {ruleGroups.length} Rule Groups</h2>
          {ruleGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={styles.ruleGroup}>
              <h3 style={styles.ruleGroupHeader}>Rule Group {groupIndex + 1}</h3>
              
              {group.remarks.length > 0 && (
                <div style={styles.remarks}>
                  <h4 style={{ marginTop: '0', color: '#2a4e6b' }}>Remarks:</h4>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {group.remarks.map((remark, remarkIndex) => (
                      <li key={remarkIndex} style={{ marginBottom: '8px' }}>{remark}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 style={{ color: '#2a4e6b' }}>Rules:</h4>
                {group.rules.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: '0' }}>
                    {group.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} style={styles.ruleItem}>
                        <div><strong style={{ color: '#2a4e6b' }}>Protocol:</strong> {rule.protocol}</div>
                        <div><strong style={{ color: '#2a4e6b' }}>Type:</strong> {rule.ruleType}</div>
                        <div><strong style={{ color: '#2a4e6b' }}>Rule:</strong> {rule.ruleBody}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666' }}>No rules in this group</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* {!loading && ruleGroups.length === 0 && host && (
        <p style={styles.noResults}>No rule groups found for host "{host}"</p>
      )} */}
    </div>
  );
};

export default RuleGroupViewer;
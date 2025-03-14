import React, { useState } from 'react';

interface Rule {
  id: string;
  name: string;
  description: string;
}

interface RuleGroup {
  id: string;
  name: string;
  rules?: Rule[]; // Make `rules` optional to handle cases where it might be missing
}

const RuleGroupsByHost: React.FC = () => {
  const [host, setHost] = useState<string>('');
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]); // Initialize as an empty array
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuleGroups = async () => {
    if (!host) {
      setError('Host parameter is required');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`http://localhost:3001/ruleGroupsByHost?host=${encodeURIComponent(host)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data); // Log the API response for debugging
  
      // Ensure the response is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }
  
      setRuleGroups(data); // Update the ruleGroups state with the fetched data
    } catch (err) {
      setError('Failed to fetch rule groups. Please try again.');
      console.error('Error fetching rule groups:', err);
      setRuleGroups([]); // Reset ruleGroups to an empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRuleGroups();
  };

  return (
    <div>
      <h1>Rule Groups by Host</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="host">Enter Host: </label>
        <input
          id="host"
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="e.g., example.com"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Rule Groups'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {ruleGroups.length > 0 ? (
        <div>
          <h2>Rule Groups</h2>
          <ul>
            {ruleGroups.map((group) => (
              <li key={group.id}>
                <h3>{group.name}</h3>
                <ul>
                  {group.rules && group.rules.map((rule) => (
                    <li key={rule.id}>
                      <strong>{rule.name}</strong>: {rule.description}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && <p>No rule groups found.</p>
      )}
    </div>
  );
};

export default RuleGroupsByHost;
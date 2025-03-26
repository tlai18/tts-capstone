import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import { Host } from '../types/Host';
import 'bootstrap/dist/css/bootstrap.min.css';
import RuleGroupDetails from '../components/RuleGroupDetails';

const Proof: React.FC = () => {
    const [ips, setIPs] = useState<Host[]>([]);
    const [filteredIPs, setFilteredIPs] = useState<Host[]>([]);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [ruleGroups, setRuleGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);


    // Fetch all data when the component mounts (only if logged in)
    useEffect(() => {
        if (isLoggedIn) {
            fetch('http://localhost:3001/getAllData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                setIPs(data);
                setFilteredIPs(data); // Initially, all data is shown
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        }
    }, [isLoggedIn]);

    // Fetch rule groups when selected host changes
    useEffect(() => {
        if (selectedHost?.host) {
            fetchRuleGroups(selectedHost.host);
        } else {
            setRuleGroups([]); // Clear rule groups if no host is selected
        }
        setExpandedGroups([]); // Reset when host changes
    }, [selectedHost]);

    const fetchRuleGroups = async (host: string) => {
        setLoading(true);
        setError(null);
        setRuleGroups([]);

        try {
            const groupsResponse = await fetch(
                `http://localhost:3001/ruleGroupsByHost?host=${encodeURIComponent(host)}`
            );

            if (!groupsResponse.ok) {
                throw new Error(`Failed to fetch rule groups: ${groupsResponse.status}`);
            }

            const ruleGroupIds: number[] = await groupsResponse.json();

            const detailedGroups = await Promise.all(
                ruleGroupIds.map(async (ruleGroupId) => {
                    const [rulesResponse, remarksResponse] = await Promise.all([
                        fetch(`http://localhost:3001/getRules?ruleGroupId=${ruleGroupId}`),
                        fetch(`http://localhost:3001/getRemarks?ruleGroupId=${ruleGroupId}`),
                    ]);

                    if (!rulesResponse.ok || !remarksResponse.ok) {
                        throw new Error('Failed to fetch rules or remarks');
                    }

                    const rules = await rulesResponse.json();
                    const remarks = await remarksResponse.json();

                    return {
                        remarks: remarks.map((r: any) => r.remark),
                        rules: rules.map((rule: any) => ({
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

    // Handle search input changes
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query) {
            setFilteredIPs(ips); // Reset to all data when input is empty
            return;
        }

        const filteredResults = ips.filter(ip => ip.host && ip.host.toLowerCase().includes(query));
        setFilteredIPs(filteredResults);
    };

    // Handle login/logout toggle
    const toggleAuth = () => {
        setIsLoggedIn(!isLoggedIn);
        if (!isLoggedIn) {
            setFilteredIPs([]); // Clear data when logging out
            setSelectedHost(null);
            setRuleGroups([]);
        }
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 px-4" style={{ position: 'relative' }}>
                {/* Invisible spacer for symmetry */}
                <div style={{ width: '150px' }}></div>

                    {/* Centered title */}
                    <h1 className="m-0 text-center" style={{ fontWeight: 700, color: '#004085', flexGrow: 1 }}>
                        Tufts Firewalls Manager
                    </h1>

                    {/* Right-aligned button */}
                    <div style={{ width: '150px', textAlign: 'right' }}>
                        <button
                            className="btn btn-outline-primary px-4 py-2"
                            style={{ fontWeight: 'bold' }}
                            onClick={toggleAuth}
                        >
                            {isLoggedIn ? 'Logout' : 'Login'}
                        </button>
                    </div>
                </div>

    
            {isLoggedIn && (
                <div className="px-4">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <input 
                            type="text"
                            className="form-control form-control-lg shadow-sm"
                            placeholder="🔎 Search by host..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{
                                textAlign: 'center',
                                border: '2px solid #007bff',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                            }}
                        />
                    </div>
    
                    {/* Hosts Section */}
                    <div className="mb-4 p-4 bg-white rounded shadow-sm">
                        <h3 className="text-primary mb-3" style={{ fontWeight: 600 }}>Available Hosts</h3>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '6px' }}>
                            <DataList ips={filteredIPs} onSelect={setSelectedHost} selectedHost={selectedHost} />
                        </div>
                    </div>
    
                    {/* Divider */}
                    <hr className="my-4 border-primary" />
    
                    {/* Rule Groups Section */}
                    <div className="p-4 bg-white rounded shadow-sm">
                        <h3 className="text-primary mb-3" style={{ fontWeight: 600 }}>Available Rule Groups</h3>
    
                        {loading ? (
                            <div className="text-center text-primary py-5">Loading rule groups...</div>
                        ) : error ? (
                            <div className="alert alert-danger text-center">{error}</div>
                        ) : selectedHost ? (
                            ruleGroups.length > 0 ? (
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    <table className="table table-hover" style={{ marginBottom: 0 }}>
                                        <tbody>
                                            {ruleGroups.map((group, index) => {
                                                const remark = group.remarks[0] || '(No remark)';
                                                const isExpanded = expandedGroups.includes(index);
    
                                                return (
                                                    <React.Fragment key={index}>
                                                        <tr
                                                            onClick={() =>
                                                                setExpandedGroups(prev =>
                                                                    prev.includes(index)
                                                                        ? prev.filter(i => i !== index)
                                                                        : [...prev, index]
                                                                )
                                                            }
                                                            style={{
                                                                cursor: 'pointer',
                                                                transition: '0.3s',
                                                                backgroundColor: isExpanded ? '#007bff' : 'white',
                                                                color: isExpanded ? 'white' : '#212529',
                                                                fontWeight: isExpanded ? 'bold' : 'normal',
                                                            }}
                                                        >
                                                            <td>
                                                                {remark}
                                                                <span style={{ float: 'right' }}>
                                                                    {isExpanded ? '▲' : '▼'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan={1} style={{ backgroundColor: '#f8f9fa' }}>
                                                                    <div className="p-3 border rounded">
                                                                        <RuleGroupDetails ruleGroup={group} />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-muted text-center py-4">No rule groups found for this host</div>
                            )
                        ) : (
                            <div className="text-muted text-center py-4">Select a host to see rule groups</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
    
    
};

export default Proof;
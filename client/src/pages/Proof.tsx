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
        <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100" style={{ textAlign: 'center', backgroundColor: '#f0f8ff' }}>
            <h1 className="mb-4 text-primary">Proof of Concept</h1>

            {/* Login/Logout Button */}
            <button 
                className="btn btn-primary mb-3"
                onClick={toggleAuth}
            >
                {isLoggedIn ? 'Logout' : 'Login'}
            </button>

            {/* Only show search and data if logged in */}
            {isLoggedIn && (
                <>
                    {/* Search Bar */}
                    <div className="mb-3 w-50">
                        <input 
                            type="text" 
                            className="form-control shadow-sm" 
                            placeholder="Search by host..." 
                            value={searchQuery} 
                            onChange={handleSearch}
                            style={{ textAlign: 'center', border: '2px solid #007bff' }}
                        />
                    </div>

                    <div className="d-flex w-100 h-50">
                        {/* Left: DataList (Filtered Data) */}
                        <div className="p-3" style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh', borderRight: '2px solid #007bff' }}>
                            <DataList ips={filteredIPs} onSelect={setSelectedHost} selectedHost={selectedHost} />
                        </div>

                        {/* Right: Host Details */}
                        <div className="p-3" style={{ flex: 1 }}>
                            {loading ? (
                                <div className="text-primary">Loading rule groups...</div>
                            ) : error ? (
                                <div className="alert alert-danger">Error: {error}</div>
                            ) : selectedHost ? (
                                ruleGroups.length > 0 ? (
                                    <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                                        <h3 className="text-primary mb-3">Rule Groups for {selectedHost.host}</h3>
                                        {ruleGroups.map((group, index) => (
                                            <RuleGroupDetails key={index} ruleGroup={group} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">No rule groups found for this host</p>
                                )
                            ) : (
                                <p className="text-muted">Select a host to see details</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Proof;
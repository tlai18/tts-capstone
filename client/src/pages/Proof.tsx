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

    // Fetch data when component mounts and login state changes
    useEffect(() => {
        if (isLoggedIn) {
            fetch('http://localhost:3001/getAllData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                setIPs(data);
                setFilteredIPs(data);
            })
            .catch(console.error);
        }
    }, [isLoggedIn]);

    // Fetch rule groups when selected host changes
    useEffect(() => {
        if (selectedHost?.host) {
            fetchRuleGroups(selectedHost.host);
        } else {
            setRuleGroups([]);
        }
        setExpandedGroups([]);
    }, [selectedHost]);

    const fetchRuleGroups = async (host: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:3001/ruleGroupsByHost?host=${encodeURIComponent(host)}`
            );
            const ruleGroupIds = await response.json();
            
            const detailedGroups = await Promise.all(
                ruleGroupIds.map(async (id: number) => {
                    const [rules, remarks] = await Promise.all([
                        fetch(`http://localhost:3001/getRules?ruleGroupId=${id}`).then(r => r.json()),
                        fetch(`http://localhost:3001/getRemarks?ruleGroupId=${id}`).then(r => r.json())
                    ]);
                    return {
                        id,
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
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredIPs(query ? ips.filter(ip => ip.host?.toLowerCase().includes(query)) : ips);
    };

    const toggleAuth = () => {
        setIsLoggedIn(!isLoggedIn);
        if (!isLoggedIn) {
            setFilteredIPs([]);
            setSelectedHost(null);
            setRuleGroups([]);
        }
    };

    const toggleGroup = (id: number) => {
        setExpandedGroups(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [...prev, id]
        );
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-4">
                <div style={{ width: '150px' }}></div>
                <h1 className="m-0 text-center" style={{ 
                    fontWeight: 700, 
                    color: '#1e40af',
                    fontSize: '1.8rem'
                }}>
                    Tufts Firewalls Manager
                </h1>
                <div style={{ width: '150px', textAlign: 'right' }}>
                    <button
                        className={`btn px-4 py-2 ${isLoggedIn ? 'btn-danger' : 'btn-primary'}`}
                        onClick={toggleAuth}
                        style={{ fontWeight: '600' }}
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
                            placeholder="🔍 Search by host..."
                            value={searchQuery}
                            onChange={handleSearch}
                            style={{
                                padding: '12px 20px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Main Card */}
                    <div className="card shadow-sm border-0 overflow-hidden">
                        <div className="card-body p-0">
                            <div className="row g-0">
                                {/* Hosts List - 1/3 */}
                                <div className="col-md-4 border-end" style={{ backgroundColor: '#ffffff' }}>
                                    <div className="p-4">
                                        <h3 className="text-primary mb-3" style={{ fontWeight: 600 }}>Hosts</h3>
                                        <div style={{ 
                                            height: 'calc(100vh - 250px)', 
                                            overflowY: 'auto',
                                            borderRadius: '8px'
                                        }}>
                                            <DataList 
                                                ips={filteredIPs} 
                                                onSelect={setSelectedHost} 
                                                selectedHost={selectedHost} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rule Groups - 2/3 */}
                                <div className="col-md-8" style={{ backgroundColor: '#f9fafb' }}>
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h3 className="text-primary" style={{ fontWeight: 600 }}>
                                                Rule Groups
                                            </h3>
                                            {selectedHost && (
                                                <span className="badge bg-primary">
                                                    {selectedHost.host}
                                                </span>
                                            )}
                                        </div>

                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary"></div>
                                            </div>
                                        ) : error ? (
                                            <div className="alert alert-danger">{error}</div>
                                        ) : selectedHost ? (
                                            ruleGroups.length > 0 ? (
                                                <div style={{ height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                                                    {ruleGroups.map((group, index) => (
                                                        <RuleGroupDetails 
                                                        key={group.id} // Use the actual ID as key
                                                        ruleGroup={group}
                                                        ruleGroupId={group.id} // Pass the ID as prop
                                                        index={index}
                                                        isExpanded={expandedGroups.includes(group.id)} // Use ID for expansion tracking
                                                        onToggle={(id) => setExpandedGroups(prev => 
                                                            prev.includes(id) 
                                                                ? prev.filter(i => i !== id) 
                                                                : [...prev, id]
                                                        )}
                                                    />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5 text-muted">
                                                    No rule groups found for this host
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                Select a host to view rule groups
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Proof;
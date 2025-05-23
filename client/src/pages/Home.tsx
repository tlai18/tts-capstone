import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import { Host } from '../types/Host';
import 'bootstrap/dist/css/bootstrap.min.css';
import RuleGroupDetails from '../components/RuleGroupDetails';

const Home: React.FC = () => {
    const [ips, setIPs] = useState<Host[]>([]);
    const [filteredIPs, setFilteredIPs] = useState<Host[]>([]);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [ruleGroups, setRuleGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string>("");
    const [userID, setUserID] = useState<string>("");
    const [owners, setOwners] = useState<string[]>([]);

    // Fetch data when component mounts and login state changes
    useEffect(() => {
        fetch('/api/getUserInfo', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            if (!response.ok) {
                throw new Error('User info fetch failed');
            }
            return response.json();
        }).then((userInfo) => {
            setUserEmail(userInfo.email);
            setUserID(userInfo.uid);
            setIsLoggedIn(true);
            
            return fetch(`/api/hostsByEmail`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response  when fetching hosts from email was not ok');
            }
            return response.json();
        }).then(data => {
            setIPs(data);
            setFilteredIPs(data);
        }).then(() => {
            return fetch (`/api/ownersByEmail`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response when fetching owners from email was not ok');
            }
            return response.json();
        }).then(data => {
            setOwners(data);
        }).catch(err => {
            console.error('Error:', err);
            setUserEmail("");
            setUserID("");
            setIsLoggedIn(false);
            setOwners([]);
        })
    }, []);

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
                `/api/ruleGroupsByHost?host=${encodeURIComponent(host)}`
            );

            const detailedGroups = await response.json();
            
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
        if (isLoggedIn) {
            window.location.href = '/Shibboleth.sso/Logout?return=https://shib-idp-stage.uit.tufts.edu/idp/profile/Logout';
        } else {
            window.location.reload();
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
            {/* Header with enhanced email display */}
            <div className="d-flex justify-content-between align-items-center mb-4 px-4">
                <div style={{ 
                    width: '150px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {isLoggedIn && (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                display: 'inline-block',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#1e40af',
                                color: 'white',
                                borderRadius: '50%',
                                textAlign: 'center',
                                lineHeight: '24px',
                                marginRight: '8px',
                                fontSize: '12px'
                            }}>
                                {userEmail.charAt(0).toUpperCase()}
                            </span>
                            <span style={{
                                maxWidth: '100px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '14px'
                            }}>
                                {userEmail}
                            </span>
                        </div>
                    )}
                </div>
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

            {/* isLoggedIn && */ (
                <div className="px-4">
                    {/* User welcome section */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        borderLeft: '4px solid #1e40af'
                    }}>
                        <div>
                            <h4 style={{ 
                                margin: 0,
                                color: '#64748b',
                                fontSize: '1.1rem'
                            }}>
                                Managing hosts for <span style={{ color: '#1e40af', fontWeight: 600 }}>{userEmail}</span>
                            </h4>
                            <small style={{ color: '#94a3b8' }}>
                                {ips.length} {ips.length === 1 ? 'host' : 'hosts'} available for: {owners.length > 0 ? owners.join(', ') : 'No organizations found'}
                            </small>
                        </div>
                        <span style={{
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontWeight: 500,
                            fontSize: '0.9rem'
                        }}>
                            {userID}
                        </span>
                    </div>

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
                                {/* Hosts List */}
                                <div className="col-md-2 border-end" style={{ backgroundColor: '#ffffff' }}>
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

                                {/* Rule Groups */}
                                <div className="col-md-10" style={{ backgroundColor: '#f9fafb' }}>
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

export default Home;

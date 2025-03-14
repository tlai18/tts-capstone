import React, { useState, useEffect } from 'react';
import UserDataForm from '../components/UserDataForm';
import DataList from '../components/DataList';
import HostDetails from '../components/HostDetails';
import { Host } from '../types/Host';
import 'bootstrap/dist/css/bootstrap.min.css';
import RuleGroupDisplay from '../components/RuleGroupDisplay';

const Proof: React.FC = () => {
    const [ips, setIPs] = useState<Host[]>([]);
    const [filteredIPs, setFilteredIPs] = useState<Host[]>([]);
    const [selectedHost, setSelectedHost] = useState<Host | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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
                            {selectedHost ? <HostDetails host={selectedHost} /> : <p className="text-muted">Select a host to see details</p>}
                            <RuleGroupDisplay/>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Proof;

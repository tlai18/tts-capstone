import React, { useState } from 'react';
import UserDataForm from '../components/UserDataForm';
import DataList from '../components/DataList';
import { Host } from '@prisma/client';

const Proof: React.FC = () => {
    const [ip, setIP] = useState<string>("");
    const [ips, setIPs] = useState<Host[]>([]);
    
    const getData = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (ip) {
            fetch('http://localhost:3001/getData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ip }),
            })
            .then(response => response.json())
            .then(data => {
                setIPs(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
    
    console.log(ips);
    
    return (
        <div>
            <h1>Proof of Concept</h1>
            <UserDataForm ip={ip} setIP={setIP} getData={getData}/>
            <DataList ips={ips}/>
        </div>
        
    )
};

export default Proof;

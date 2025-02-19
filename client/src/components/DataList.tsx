import React from 'react';
import { Host } from '../types/Host';

interface Props {
    ips: Host[];
    onSelect: (host: Host) => void;
    selectedHost: Host | null;
}

const DataList: React.FC<Props> = ({ ips, onSelect, selectedHost }) => {
    return (
        <div className="container">
            <h3 className="text-primary">Available Hosts</h3>
            <table className="table table-hover shadow-sm" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                <thead className="bg-primary text-white">
                    <tr>
                        <th scope="col">Host</th>
                    </tr>
                </thead>
                <tbody>
                    {ips
                        .filter(ip => ip.host) // Ensure no undefined hosts
                        .map((ip, index) => (
                            <tr 
                                key={index} 
                                onClick={() => onSelect(ip)} 
                                style={{ 
                                    cursor: 'pointer', 
                                    transition: '0.3s', 
                                    backgroundColor: selectedHost?.host === ip.host ? '#007bff' : 'white',
                                    color: selectedHost?.host === ip.host ? 'white' : 'black',
                                    fontWeight: selectedHost?.host === ip.host ? 'bold' : 'normal'
                                }} 
                                className="hover-effect"
                            >
                                <td>{ip.host}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataList;

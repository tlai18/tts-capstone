import React from 'react';
import { Host } from '../types/Host';

interface Props {
    host: Host;
}

const HostDetails: React.FC<Props> = ({ host }) => {
    return (
        <div className="container">
            <h3 className="text-primary">Host Details</h3>
            <table className="table table-bordered shadow-sm" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
                <thead className="bg-primary text-white">
                    <tr>
                        <th scope="col">Host</th>
                        <th scope="col">Network Object</th>
                        <th scope="col">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{host.host}</td>
                        <td>{host.objectNetwork}</td>
                        <td>{host.description}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default HostDetails;

import React from 'react'
import { Host } from '../types/Host';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {
    ips: Host[];
}

const DataList: React.FC<Props> = ({ips}) => {
  return (
    <table className="table" style={{width: "40%"}}>
        <thead className="thead-light">
            <tr>
                <th>Host</th>
                <th>Network Object</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            {ips.map((ip) => (
                <tr>
                    <td>{ip.host}</td>
                    <td>{ip.objectNetwork}</td>
                    <td>{ip.description}</td>
                </tr>
            ))}
        </tbody>
    </table>
  )
}

export default DataList
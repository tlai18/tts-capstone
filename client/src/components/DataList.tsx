import React from 'react'
import { Host } from '@prisma/client';

interface Props {
    ips: Host[];
}

const DataList: React.FC<Props> = ({ips}) => {
  return (
    <table>
        <tr>
            <th>Host</th>
            <th>Network Object</th>
            <th>Description</th>
        </tr>
        {ips.map((ip) => (
            <tr>
                <td>{ip.host}</td>
                <td>{ip.objectNetwork}</td>
                <td>{ip.description}</td>
            </tr>
        ))}
    </table>
  )
}

export default DataList
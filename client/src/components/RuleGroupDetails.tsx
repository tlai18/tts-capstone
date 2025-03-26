import React from 'react';
import { RuleGroup, Rule, Remark } from '../types/RuleGroup'; // Assuming these interfaces are defined in your types

interface Props {
    ruleGroup: RuleGroup;
}

const RuleGroupDetails: React.FC<Props> = ({ ruleGroup }) => {
    return (
        <div className="container" style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px' }}>
            <h3 className="text-primary" style={{ color: '#2a4e6b', marginBottom: '20px' }}>Rule Group Details</h3>
            
            {/* Remarks Section */}
            {ruleGroup.remarks.length > 0 && (
                <div className="mb-4" style={{ backgroundColor: '#e1f0fa', padding: '15px', borderRadius: '6px' }}>
                    <h4 style={{ color: '#2a4e6b', marginTop: '0' }}>Remarks</h4>
                    <ul className="mb-0" style={{ margin: '0', paddingLeft: '20px' }}>
                        {ruleGroup.remarks.map((remark, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>{remark}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Rules Section */}
            <div>
                <h4 style={{ color: '#2a4e6b', marginBottom: '15px' }}>Rules ({ruleGroup.rules.length})</h4>
                
                {ruleGroup.rules.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered shadow-sm" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
                            <thead className="bg-primary text-white" style={{ backgroundColor: '#4a90e2' }}>
                                <tr>
                                    <th scope="col">Protocol</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Rule Body</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ruleGroup.rules.map((rule, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: 'bold', color: '#2a4e6b' }}>{rule.protocol}</td>
                                        <td style={{ color: rule.ruleType === 'Allow' ? '#28a745' : '#dc3545' }}>
                                            {rule.ruleType}
                                        </td>
                                        <td>{rule.ruleBody}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="alert alert-info" style={{ backgroundColor: '#e1f0fa', color: '#2a4e6b' }}>
                        No rules in this group
                    </div>
                )}
            </div>
        </div>
    );
};

export default RuleGroupDetails;
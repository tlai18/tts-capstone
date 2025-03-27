// RuleGroupDetails.tsx
import React, { useState } from 'react';
import { RuleGroup } from '../types/RuleGroup';

interface Props {
    ruleGroup: RuleGroup;
    index: number;
    isExpanded: boolean;
    onToggle: (index: number) => void;
}

const RuleGroupDetails: React.FC<Props> = ({ ruleGroup, index, isExpanded, onToggle }) => {
    const containerStyle = {
        backgroundColor: '#f0f8ff',
        padding: '20px',
        borderRadius: '8px',
    };

    const remarksStyle = {
        backgroundColor: '#e1f0fa',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '15px',
    };

    const ruleItemStyle = {
        backgroundColor: '#f7fbff',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '10px',
        borderLeft: '4px solid #4a90e2',
    };

    return (
        <div className="mb-3">
            <button
                className={`btn w-100 text-start ${isExpanded ? 'bg-primary text-white' : 'bg-white'}`}
                onClick={() => onToggle(index)}
                style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontWeight: isExpanded ? '600' : '500',
                    transition: 'all 0.2s'
                }}
            >
                {ruleGroup.remarks[0] || '(No remark)'}
                <span className="float-end">
                    {isExpanded ? '▲' : '▼'}
                </span>
            </button>
            
            {isExpanded && (
                <div className="p-3 bg-white border rounded-bottom">
                    <div className="container" style={containerStyle}>
                        <h3 style={{ color: '#2a4e6b', marginBottom: '20px' }}>Rule Group Details</h3>
                        
                        {/* Remarks Section */}
                        {ruleGroup.remarks.length > 0 && (
                            <div style={remarksStyle}>
                                <h4 style={{ color: '#2a4e6b', marginTop: '0' }}>Remarks</h4>
                                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                    {ruleGroup.remarks.map((remark, index) => (
                                        <li key={index} style={{ marginBottom: '8px' }}>{remark}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Rules Section */}
                        <div>
                            <h4 style={{ color: '#2a4e6b', marginBottom: '15px' }}>
                                Rules ({ruleGroup.rules.length})
                            </h4>
                            
                            {ruleGroup.rules.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: '0' }}>
                                    {ruleGroup.rules.map((rule, index) => (
                                        <li key={index} style={ruleItemStyle}>
                                            <div>
                                                <strong style={{ color: '#2a4e6b' }}>Protocol:</strong> {rule.protocol}
                                            </div>
                                            <div>
                                                <strong style={{ color: '#2a4e6b' }}>Type:</strong>{' '}
                                                <span style={{ color: rule.ruleType === 'Allow' ? '#28a745' : '#dc3545', marginLeft: '4px' }}>
                                                    {rule.ruleType}
                                                </span>
                                            </div>
                                            <div>
                                                <strong style={{ color: '#2a4e6b' }}>Rule:</strong> {rule.ruleBody}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: '#666' }}>No rules in this group</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleGroupDetails;
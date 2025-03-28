// RuleGroupDetails.tsx
import React from 'react';
import { RuleGroup } from '../types/RuleGroup';

interface Props {
    ruleGroup: RuleGroup;
    ruleGroupId: number;
    index: number;
    isExpanded: boolean;
    onToggle: (id: number) => void;
}

const RuleGroupDetails: React.FC<Props> = ({ 
    ruleGroup, 
    ruleGroupId, 
    index, 
    isExpanded, 
    onToggle 
}) => {
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
        maxHeight: '200px',
        overflowY: 'auto' as const,
    };

    const ruleItemStyle = {
        backgroundColor: '#f7fbff',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '10px',
        borderLeft: '4px solid #4a90e2',
    };

    // Function to truncate long text for preview
    const truncateText = (text: string, maxLength: number = 50) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="mb-3">
            <button
                className={`btn w-100 text-start ${isExpanded ? 'bg-primary text-white' : 'bg-white'}`}
                onClick={() => onToggle(ruleGroupId)}  // Use ruleGroupId here
                style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontWeight: isExpanded ? '600' : '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    minWidth: 0,
                }}>
                    <span style={{
                        backgroundColor: '#4a90e2',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginRight: '12px',
                        flexShrink: 0,
                        fontSize: '0.9rem',
                    }}>
                        #{ruleGroupId}  {/* Display actual rule group ID */}
                    </span>
                    
                    <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                    }}>
                        {ruleGroup.remarks.length > 0 ? (
                            <>
                                {ruleGroup.remarks.slice(0, 2).map((remark, idx) => (
                                    <span key={idx}>
                                        {truncateText(remark)}
                                        {idx < ruleGroup.remarks.length - 1 && idx < 1 && ', '}
                                    </span>
                                ))}
                                {ruleGroup.remarks.length > 2 && ` +${ruleGroup.remarks.length - 2} more`}
                            </>
                        ) : (
                            '(No remark)'
                        )}
                    </div>
                </div>
                
                <span className="float-end" style={{ flexShrink: 0 }}>
                    {isExpanded ? '▲' : '▼'}
                </span>
            </button>
            
            {isExpanded && (
                <div className="p-3 bg-white border rounded-bottom">
                    <div className="container" style={containerStyle}>
                        <h3 style={{ color: '#2a4e6b', marginBottom: '20px' }}>
                            Rule Group Details <span style={{ color: '#4a90e2' }}>#{ruleGroupId}</span>
                        </h3>
                        
                        {/* Remarks Section */}
                        {ruleGroup.remarks.length > 0 && (
                            <div style={remarksStyle}>
                                <h4 style={{ color: '#2a4e6b', marginTop: '0' }}>Remarks</h4>
                                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                    {ruleGroup.remarks.map((remark, idx) => (
                                        <li key={idx} style={{ 
                                            marginBottom: '8px',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {remark}
                                        </li>
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
                                    {ruleGroup.rules.map((rule, idx) => (
                                        <li key={idx} style={ruleItemStyle}>
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
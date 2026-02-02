import React, { useState, useMemo } from 'react';

const CriticalDimensionForm = ({ batch, onSave, onCancel, targetPercentage }) => {
    // List of all sleepers in the batch
    const allSleepersPool = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            id: `${batch.batchNo}/${String(i + 1).padStart(3, '0')}`,
        }));
    }, [batch]);

    const [selectedSleepers, setSelectedSleepers] = useState([]);

    const toggleSleeperSelection = (id) => {
        setSelectedSleepers(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const parametersToCheck = [
        'ToeGap',
        'Slope Gauge',
        'WindGauge'
    ];

    const [checklistState, setChecklistState] = useState(
        parametersToCheck.reduce((acc, p) => ({ ...acc, [p]: false }), {})
    );

    const [overallResult, setOverallResult] = useState(null); // 'ok', 'partial-ok', 'all-rejected'
    const [rejectionDetails, setRejectionDetails] = useState({}); // { sleeperId: { mainReason: '', subReason: '' } }

    const isChecklistComplete = parametersToCheck.every(p => checklistState[p]);

    const handleChecklistChange = (param) => {
        setChecklistState(prev => ({ ...prev, [param]: !prev[param] }));
    };

    const handleResultChange = (result) => {
        if (!isChecklistComplete) return;
        setOverallResult(result);
        if (result === 'ok') {
            setRejectionDetails({});
        } else if (result === 'all-rejected') {
            // Auto-populate all selected sleepers as rejected? Or let user handle it?
            // User says "Table will come up to select Rejected sleepers".
            // If All Rejected, logically all should be in the rejection list.
            const allRejected = {};
            selectedSleepers.forEach(id => {
                allRejected[id] = { mainReason: '', subReason: '' };
            });
            setRejectionDetails(allRejected);
        } else {
            // Partial: clear rejections or keep existing? Keep existing to avoid data loss on toggle
        }
    };

    const handleRejectionChange = (sleeperId, field, value) => {
        setRejectionDetails(prev => ({
            ...prev,
            [sleeperId]: {
                ...prev[sleeperId],
                [field]: value
            }
        }));
    };

    const toggleRejection = (sleeperId) => {
        setRejectionDetails(prev => {
            if (prev[sleeperId]) {
                const newState = { ...prev };
                delete newState[sleeperId];
                return newState;
            } else {
                return { ...prev, [sleeperId]: { mainReason: '', subReason: '' } };
            }
        });
    };

    const getSubReasons = (mainReason) => {
        switch (mainReason) {
            case 'ToeGap':
                return ['ToeGap(LT) - Inner', 'ToeGap (LT) - Outer', 'ToeGap (RT)-Inner', 'ToeGap (RT) - Outer'];
            case 'Slope Gauge':
                return ['Slope Gauge (LT)', 'Slope Gauge (RT)'];
            case 'WindGauge':
                return ['Wind Gauge (LT)', 'Wind Gauge (RT)'];
            default:
                return [];
        }
    };

    return (
        <div className="critical-dimension-form" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#e2e8f0', padding: '12px 16px', borderRadius: '8px 8px 0 0' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Critical Dimensions - Full Inspection Form</h2>
                <button
                    onClick={onCancel}
                    style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                    ×
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                {/* Section 1: Initial Information */}
                <div style={{ marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>1. Initial Declaration</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                        <div><div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b' }}>BATCH NUMBER</div><div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{batch.batchNo}</div></div>
                        <div><div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b' }}>SLEEPER TYPE</div><div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{batch.sleeperType}</div></div>
                        <div><div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b' }}>TOTAL IN BATCH</div><div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{batch.typeQty || 255}</div></div>
                        <div><div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b' }}>TARGET REQ.</div><div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{targetPercentage}</div></div>
                    </div>
                </div>

                {/* Section 2: Available Sleepers */}
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>2. Available Sleepers (Select for Testing)</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>
                            Selected: {selectedSleepers.length} / {allSleepersPool.length}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '2px' }}>
                        {allSleepersPool.map(s => {
                            const isSelected = selectedSleepers.includes(s.id);
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => toggleSleeperSelection(s.id)}
                                    style={{
                                        padding: '6px 0',
                                        textAlign: 'center',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        background: isSelected ? '#15803d' : '#d1d5db',
                                        color: isSelected ? '#fff' : '#374151',
                                        border: '1px solid',
                                        borderColor: isSelected ? '#14532d' : '#9ca3af',
                                    }}
                                >
                                    {s.id.split('/')[1]}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 3: Critical Parameters Checklist */}
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>3. Critical Parameters to be Checked</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {parametersToCheck.map(param => (
                            <label key={param} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer', border: checklistState[param] ? '1px solid #10b981' : '1px solid #e2e8f0' }}>
                                <input
                                    type="checkbox"
                                    checked={checklistState[param]}
                                    onChange={() => handleChecklistChange(param)}
                                    style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                                />
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{param}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Section 4: Result of Checking */}
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', opacity: isChecklistComplete ? 1 : 0.6, pointerEvents: isChecklistComplete ? 'auto' : 'none' }}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>4. Result of Checking</h4>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        {[
                            { id: 'ok', label: 'All OK', color: '#10b981' },
                            { id: 'partial-ok', label: 'Partially OK', color: '#f59e0b' },
                            { id: 'all-rejected', label: 'All Rejected', color: '#ef4444' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleResultChange(opt.id)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: overallResult === opt.id ? opt.color : '#f1f5f9',
                                    color: overallResult === opt.id ? '#fff' : '#64748b',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {(overallResult === 'partial-ok' || overallResult === 'all-rejected') && (
                        <div className="rejection-table-section" style={{ animation: 'fadeIn 0.3s' }}>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444', marginBottom: '1rem' }}>
                                Details of Rejected Sleepers
                                {overallResult === 'partial-ok' && <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748b', marginLeft: '8px' }}>(Select sleepers to mark as rejected)</span>}
                            </h5>

                            {overallResult === 'partial-ok' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                    {selectedSleepers.map(sid => {
                                        const isRejected = !!rejectionDetails[sid];
                                        return (
                                            <button
                                                key={sid}
                                                onClick={() => toggleRejection(sid)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: isRejected ? '#ef4444' : '#cbd5e1',
                                                    background: isRejected ? '#fecaca' : '#fff',
                                                    color: isRejected ? '#991b1b' : '#64748b',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {sid.split('/')[1]}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <table className="ui-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>Sleeper No</th>
                                        <th style={{ width: '30%' }}>Main Reason</th>
                                        <th style={{ width: '40%' }}>Sub Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(rejectionDetails).map(sid => (
                                        <tr key={sid}>
                                            <td style={{ fontWeight: '700' }}>{sid.split('/')[1]}</td>
                                            <td>
                                                <select
                                                    value={rejectionDetails[sid].mainReason}
                                                    onChange={(e) => handleRejectionChange(sid, 'mainReason', e.target.value)}
                                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                >
                                                    <option value="">Select...</option>
                                                    {parametersToCheck.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    value={rejectionDetails[sid].subReason}
                                                    onChange={(e) => handleRejectionChange(sid, 'subReason', e.target.value)}
                                                    disabled={!rejectionDetails[sid].mainReason}
                                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                >
                                                    <option value="">Select...</option>
                                                    {getSubReasons(rejectionDetails[sid].mainReason).map(sub => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {Object.keys(rejectionDetails).length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                                                {overallResult === 'partial-ok' ? 'Select sleepers above to add rejection details.' : 'No rejected sleepers.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', padding: '0 16px 16px 16px' }}>
                <button
                    onClick={onSave}
                    disabled={selectedSleepers.length === 0}
                    style={{
                        flex: 1,
                        height: '44px',
                        background: '#0f3d3e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: selectedSleepers.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: selectedSleepers.length === 0 ? 0.7 : 1
                    }}
                >
                    Save Critical Inspection
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        height: '44px',
                        background: '#e2e8f0',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CriticalDimensionForm;

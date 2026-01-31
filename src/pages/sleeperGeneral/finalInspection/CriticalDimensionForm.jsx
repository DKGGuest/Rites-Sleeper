import React, { useState, useMemo } from 'react';

const CriticalDimensionForm = ({ batch, onSave, onCancel, targetPercentage }) => {
    // List of all sleepers in the batch
    const allSleepersPool = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            id: `${batch.batchNo}/${String(i + 1).padStart(3, '0')}`,
        }));
    }, [batch]);

    const [selectedSleepers, setSelectedSleepers] = useState([]);

    const sections = [
        { id: 'toeGapPrkInner', label: 'Toe Gap - PRK Side - Inner', section: 'Section 1' },
        { id: 'toeGapPrkOuter', label: 'Toe Gap - PRK Side - Outer', section: 'Section 1' },
        { id: 'toeGapRtInner', label: 'Toe Gap - RT Side - Inner', section: 'Section 1' },
        { id: 'toeGapRtOuter', label: 'Toe Gap - RT Side - Outer', section: 'Section 1' },
        { id: 'slopePrk', label: 'Slope - PRK Side', section: 'Section 2' },
        { id: 'slopeRt', label: 'Slope - RT Side', section: 'Section 2' },
        { id: 'windGaugePrk', label: 'Wind Gauge - PRK Side', section: 'Section 3' },
        { id: 'windGaugeRt', label: 'Wind Gauge - RT Side', section: 'Section 3' }
    ];

    const [sectionStates, setSectionStates] = useState(
        sections.reduce((acc, s) => ({
            ...acc,
            [s.id]: {
                allChecked: false,
                result: 'all-ok', // 'all-ok', 'partial-ok', 'all-rejected'
                failedSleepers: [],
                remarks: {}
            }
        }), {})
    );

    const toggleSleeperSelection = (id) => {
        setSelectedSleepers(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSectionChange = (sectionId, field, value) => {
        setSectionStates(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [field]: value
            }
        }));
    };

    const getSleeperStatus = (sleeperId) => {
        if (!selectedSleepers.includes(sleeperId)) return 'pending-select';

        let isRejected = false;
        let isAllSectionsChecked = true;

        sections.forEach(s => {
            const state = sectionStates[s.id];
            if (!state.allChecked) isAllSectionsChecked = false;
            if (state.result === 'all-rejected') isRejected = true;
            if (state.result === 'partial-ok' && state.failedSleepers.includes(sleeperId)) isRejected = true;
        });

        if (isRejected) return 'rejected';
        if (isAllSectionsChecked) return 'passed';
        return 'pending-check';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'passed': return '#22c55e'; // Green
            case 'rejected': return '#ef4444'; // Red
            case 'pending-check': return '#f59e0b'; // Yellow
            case 'pending-select': return '#f1f5f9'; // Grey/Light
            default: return '#f1f5f9';
        }
    };

    const selectionPercentage = ((selectedSleepers.length / allSleepersPool.length) * 100).toFixed(1);

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

            {/* Initial Information Section - Standardized Sleek Card */}
            <div style={{ marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>Batch Number</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{batch.batchNo}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>Sleeper Type</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{batch.sleeperType || 'RT 8746'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>Total In Batch</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{batch.typeQty || 255}</div>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>Nos</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' }}>Target Req.</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{targetPercentage}</div>
                    </div>
                </div>
            </div>

            {/* Selection Pool */}
            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '800', textTransform: 'uppercase' }}>Available Sleepers (Click to select for testing)</h4>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>
                        Selected: {selectedSleepers.length} / {allSleepersPool.length} ({selectionPercentage}%)
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
                                    background: isSelected ? '#15803d' : '#d1d5db', // Green or Grey
                                    color: isSelected ? '#fff' : '#374151',
                                    border: '1px solid',
                                    borderColor: isSelected ? '#14532d' : '#9ca3af',
                                    boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                                    transition: 'all 0.1s'
                                }}
                            >
                                {s.id.split('/')[1]}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Inspection Table */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#fce7d240', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table className="ui-table" style={{ fontSize: '12px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr style={{ background: '#eaddd0', color: '#4b5563', textTransform: 'uppercase', fontSize: '10px' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '800', width: '35%' }}>Critical Parameter</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '800', width: '15%' }}>Source</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '800' }}>Inspection Results (For selected {selectedSleepers.length} sleepers)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map((s, idx) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td style={{ padding: '12px', fontWeight: '700', color: '#1e293b' }}>{s.label}</td>
                                <td style={{ padding: '12px', color: '#64748b' }}>{s.section}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sectionStates[s.id].allChecked}
                                                    onChange={(e) => handleSectionChange(s.id, 'allChecked', e.target.checked)}
                                                    style={{ width: '14px', height: '14px', accentColor: '#0f172a' }}
                                                />
                                                Checked
                                            </label>

                                            <div style={{ display: 'flex', gap: '1px', background: '#94a3b8', padding: '1px', borderRadius: '4px', overflow: 'hidden' }}>
                                                {[
                                                    { id: 'all-ok', label: 'All OK' },
                                                    { id: 'partial-ok', label: 'Partial OK' },
                                                    { id: 'all-rejected', label: 'Rejected' }
                                                ].map(opt => {
                                                    const isActive = sectionStates[s.id].result === opt.id;
                                                    let activeBg = '#115e59'; // Default Dark Green
                                                    if (opt.id === 'all-rejected') activeBg = '#b91c1c'; // Red for Rejected

                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => handleSectionChange(s.id, 'result', opt.id)}
                                                            style={{
                                                                padding: '4px 12px',
                                                                fontSize: '10px',
                                                                border: 'none',
                                                                background: isActive ? '#0f3d3e' : '#cbd5e1', // Dark Green active, Grey inactive
                                                                color: isActive ? '#fff' : '#1e293b',
                                                                cursor: 'pointer',
                                                                fontWeight: '700',
                                                                flex: 1
                                                            }}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {sectionStates[s.id].result === 'partial-ok' && (
                                            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '6px', padding: '8px', animation: 'fadeIn 0.2s' }}>
                                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#be123c', display: 'block', marginBottom: '6px' }}>Select Failed Sleepers:</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {selectedSleepers.map(sid => {
                                                        const isFailed = sectionStates[s.id].failedSleepers.includes(sid);
                                                        return (
                                                            <div
                                                                key={sid}
                                                                onClick={() => {
                                                                    const failed = sectionStates[s.id].failedSleepers;
                                                                    const newVal = failed.includes(sid)
                                                                        ? failed.filter(fid => fid !== sid)
                                                                        : [...failed, sid];
                                                                    handleSectionChange(s.id, 'failedSleepers', newVal);
                                                                }}
                                                                style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px',
                                                                    cursor: 'pointer',
                                                                    border: '1px solid',
                                                                    borderColor: isFailed ? '#be123c' : '#cbd5e1',
                                                                    background: isFailed ? '#fecdd3' : '#fff',
                                                                    color: isFailed ? '#881337' : '#64748b',
                                                                    fontWeight: '700'
                                                                }}
                                                            >
                                                                {sid.split('/')[1]}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

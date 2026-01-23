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
        <div className="critical-dimension-form">
            {/* Batch Header Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>BATCH NUMBER</label><div style={{ fontWeight: '700' }}>{batch.batchNo}</div></div>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>SLEEPER TYPE</label><div style={{ fontWeight: '700' }}>{batch.sleeperType}</div></div>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>TOTAL IN BATCH</label><div style={{ fontWeight: '700' }}>{batch.typeQty} Nos</div></div>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>TARGET REQ.</label><div style={{ fontWeight: '700', color: '#42818c' }}>{targetPercentage}</div></div>
            </div>

            {/* Selection Pool */}
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Available Sleepers (Click to select for testing)</h4>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: parseFloat(selectionPercentage) >= parseFloat(targetPercentage) ? '#22c55e' : '#c2410c' }}>
                        Selected: {selectedSleepers.length} / {allSleepersPool.length} ({selectionPercentage}%)
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                    {allSleepersPool.map(s => {
                        const status = getSleeperStatus(s.id);
                        return (
                            <div
                                key={s.id}
                                onClick={() => toggleSleeperSelection(s.id)}
                                style={{
                                    padding: '4px',
                                    textAlign: 'center',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    background: getStatusColor(status),
                                    color: status === 'pending-select' ? '#64748b' : '#fff',
                                    border: status === 'pending-select' ? '1px solid #e2e8f0' : 'none',
                                    boxShadow: selectedSleepers.includes(s.id) ? '0 0 0 2px #42818c33' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {s.id.split('/')[1]}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Inspection Table */}
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                <table className="ui-table" style={{ fontSize: '11px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ width: '220px' }}>Critical Parameter</th>
                            <th style={{ width: '100px' }}>Source</th>
                            <th>Inspection Results (For selected {selectedSleepers.length} sleepers)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map(s => (
                            <tr key={s.id}>
                                <td style={{ fontWeight: '600' }}>{s.label}</td>
                                <td style={{ color: '#64748b' }}>{s.section}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sectionStates[s.id].allChecked}
                                                    onChange={(e) => handleSectionChange(s.id, 'allChecked', e.target.checked)}
                                                />
                                                Checked
                                            </label>

                                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '4px' }}>
                                                {[
                                                    { id: 'all-ok', label: 'All OK' },
                                                    { id: 'partial-ok', label: 'Partial OK' },
                                                    { id: 'all-rejected', label: 'Rejected' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSectionChange(s.id, 'result', opt.id)}
                                                        style={{
                                                            padding: '2px 8px',
                                                            fontSize: '9px',
                                                            border: 'none',
                                                            borderRadius: '3px',
                                                            background: sectionStates[s.id].result === opt.id ? '#42818c' : 'transparent',
                                                            color: sectionStates[s.id].result === opt.id ? '#fff' : '#64748b',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {sectionStates[s.id].result === 'partial-ok' && (
                                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                                                <span style={{ fontSize: '9px', fontWeight: '700', color: '#42818c', display: 'block', marginBottom: '6px' }}>Select Failed Sleepers (from selected set):</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {selectedSleepers.map(sid => (
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
                                                                padding: '2px 6px',
                                                                borderRadius: '3px',
                                                                fontSize: '9px',
                                                                cursor: 'pointer',
                                                                border: '1px solid',
                                                                borderColor: sectionStates[s.id].failedSleepers.includes(sid) ? '#ef4444' : '#e2e8f0',
                                                                background: sectionStates[s.id].failedSleepers.includes(sid) ? '#fee2e2' : '#fff',
                                                                color: sectionStates[s.id].failedSleepers.includes(sid) ? '#b91c1c' : '#64748b',
                                                                fontWeight: '700'
                                                            }}
                                                        >
                                                            {sid.split('/')[1]}
                                                        </div>
                                                    ))}
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

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn-verify" style={{ flex: 1, height: '40px' }} onClick={onSave} disabled={selectedSleepers.length === 0}>Save Critical Inspection</button>
                <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', height: '40px' }} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default CriticalDimensionForm;

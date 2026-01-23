import React, { useState, useMemo } from 'react';

const VisualInspectionForm = ({ batch, onSave, onCancel }) => {
    // Mock sleeper data for this specific batch
    const initialSleepers = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: `${batch.batchNo}/${String(i + 1).padStart(3, '0')}`,
            status: 'pending', // 'pending', 'passed', 'rejected'
            remarks: ''
        }));
    }, [batch]);

    const [sleepers, setSleepers] = useState(initialSleepers);

    const sections = [
        { id: 'visual', label: 'Visual Checking', section: 'Section 1' },
        { id: 'endDamage', label: 'Visual Checking (End Damage)', section: 'Section 1' },
        { id: 'railSeatPRK', label: 'Rail Seat (PRK Side)', section: 'Section 2' },
        { id: 'railSeatRT', label: 'Rail Seat (RT Side)', section: 'Section 2' },
        { id: 'outerGauge', label: 'Outer Gauge', section: 'Section 3' },
        { id: 'ftc', label: 'FTC', section: 'Section 4' },
        { id: 'dowel', label: 'Dowel', section: 'Section 1' }
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

    const handleSectionChange = (sectionId, field, value) => {
        setSectionStates(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [field]: value
            }
        }));

        // Update sleeper statuses based on all sections
        updateSleeperStatuses(sectionId, field, value);
    };

    const updateSleeperStatuses = (changedSectionId, field, value) => {
        // Logic: Any sleeper rejected in ANY section becomes Red
        // If all sections checked for a sleeper and none rejected, becomes Green
        // Else Pending (Yellow)

        setSleepers(prevSleepers => {
            return prevSleepers.map(sleeper => {
                let isRejected = false;
                let isAllChecked = true;

                // Check all sections (merging current change with existing states)
                sections.forEach(s => {
                    const state = s.id === changedSectionId ? { ...sectionStates[s.id], [field]: value } : sectionStates[s.id];

                    if (!state.allChecked) isAllChecked = false;

                    if (state.result === 'all-rejected') {
                        isRejected = true;
                    } else if (state.result === 'partial-ok' && state.failedSleepers.includes(sleeper.id)) {
                        isRejected = true;
                    }
                });

                if (isRejected) return { ...sleeper, status: 'rejected' };
                if (isAllChecked) return { ...sleeper, status: 'passed' };
                return { ...sleeper, status: 'pending' };
            });
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'passed': return '#22c55e'; // Green
            case 'rejected': return '#ef4444'; // Red
            default: return '#f59e0b'; // Yellow (Pending)
        }
    };

    return (
        <div className="visual-inspection-form">
            {/* Top Sleeper Status Grid */}
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Sleeper Batch Status Map ({batch.sleeperType})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px' }}>
                    {sleepers.map(s => (
                        <div key={s.id} style={{
                            padding: '4px',
                            textAlign: 'center',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            background: getStatusColor(s.status),
                            color: '#fff',
                            transition: 'all 0.3s ease'
                        }}>
                            {s.id.split('/')[1]}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '10px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }}></span> Pending</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '2px' }}></span> Passed</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }}></span> Rejected</div>
                </div>
            </div>

            {/* Inspection Sections */}
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                <table className="ui-table" style={{ fontSize: '12px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ width: '200px' }}>Data Field</th>
                            <th style={{ width: '100px' }}>Source</th>
                            <th>Inspection Results</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map(s => (
                            <tr key={s.id}>
                                <td style={{ fontWeight: '600', color: '#1e293b' }}>{s.label}</td>
                                <td style={{ color: '#64748b' }}>{s.section}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sectionStates[s.id].allChecked}
                                                    onChange={(e) => handleSectionChange(s.id, 'allChecked', e.target.checked)}
                                                />
                                                All Sleepers Checked
                                            </label>

                                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                                                {[
                                                    { id: 'all-ok', label: 'All OK' },
                                                    { id: 'partial-ok', label: 'Partially OK' },
                                                    { id: 'all-rejected', label: 'All Rejected' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSectionChange(s.id, 'result', opt.id)}
                                                        style={{
                                                            padding: '4px 12px',
                                                            fontSize: '10px',
                                                            border: 'none',
                                                            borderRadius: '4px',
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
                                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', animation: 'fadeIn 0.2s' }}>
                                                <div style={{ marginBottom: '8px', color: '#42818c', fontWeight: '700', fontSize: '11px' }}>Select Rejected Sleepers:</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {sleepers.map(sl => (
                                                        <div
                                                            key={sl.id}
                                                            onClick={() => {
                                                                const failed = sectionStates[s.id].failedSleepers;
                                                                const newVal = failed.includes(sl.id)
                                                                    ? failed.filter(fid => fid !== sl.id)
                                                                    : [...failed, sl.id];
                                                                handleSectionChange(s.id, 'failedSleepers', newVal);
                                                            }}
                                                            style={{
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '10px',
                                                                cursor: 'pointer',
                                                                border: '1px solid',
                                                                borderColor: sectionStates[s.id].failedSleepers.includes(sl.id) ? '#ef4444' : '#e2e8f0',
                                                                background: sectionStates[s.id].failedSleepers.includes(sl.id) ? '#fee2e2' : '#fff',
                                                                color: sectionStates[s.id].failedSleepers.includes(sl.id) ? '#b91c1c' : '#64748b',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            {sl.id.split('/')[1]}
                                                        </div>
                                                    ))}
                                                </div>

                                                {sectionStates[s.id].failedSleepers.length > 0 && (
                                                    <div style={{ marginTop: '12px' }}>
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Rejection Remarks:</div>
                                                        {sectionStates[s.id].failedSleepers.map(fid => (
                                                            <div key={fid} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                                <span style={{ fontSize: '10px', fontWeight: '700', width: '60px' }}>#{fid.split('/')[1]}</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Reason for rejection..."
                                                                    style={{ flex: 1, padding: '4px 8px', fontSize: '11px' }}
                                                                    value={sectionStates[s.id].remarks[fid] || ''}
                                                                    onChange={(e) => {
                                                                        const newRemarks = { ...sectionStates[s.id].remarks, [fid]: e.target.value };
                                                                        handleSectionChange(s.id, 'remarks', newRemarks);
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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
                <button className="btn-verify" style={{ flex: 1, height: '44px' }} onClick={onSave}>Save Visual Inspection Results</button>
                <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', height: '44px' }} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default VisualInspectionForm;

import React, { useState, useMemo } from 'react';
import { apiService } from '../../../services/api';
import './CriticalDimensionForm.css'; // Reusing styles if applicable or ensuring consistency

const VisualInspectionForm = ({ batch, onSave, onCancel, shift }) => {
    // Sleeper data from batch details
    const initialSleepers = useMemo(() => {
        return batch?.sleepers?.map(s => ({
            ...s,
            id: s.sleeperId,
            displayNo: s.sleeperNo,
            status: s.status?.toLowerCase() === 'pending' ? 'pending' : (s.status?.toLowerCase() === 'ok' ? 'passed' : 'rejected')
        })) || [];
    }, [batch]);

    const [sleepers, setSleepers] = useState(initialSleepers);
    const [selectedSleepers, setSelectedSleepers] = useState([]);
    const [saving, setSaving] = useState(false);

    const toggleSleeperSelection = (id) => {
        const sleeper = sleepers.find(s => s.id === id);
        if (sleeper?.status === 'rejected') return;

        setSelectedSleepers(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const sections = [
        { id: 'visual', label: 'Visual Checking', section: 'Section 1' },
        { id: 'dimension', label: 'Dimension Checking', section: 'Section 2' },
        { id: 'ftc', label: 'FTC', section: 'Section 3' },
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
        if (field !== 'globalRemark' && field !== 'remarks') {
            updateSleeperStatuses(sectionId, field, value);
        }
    };

    const updateSleeperStatuses = (changedSectionId, field, value) => {
        setSleepers(prevSleepers => {
            return prevSleepers.map(sleeper => {
                let isRejected = false;
                let isAllChecked = true;

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

    const getStatusColor = (status, isSelected) => {
        if (!isSelected) return '#d1d5db'; // Greyed out if not selected
        switch (status) {
            case 'passed': return '#22c55e'; // Green
            case 'rejected': return '#ef4444'; // Red
            default: return '#f59e0b'; // Yellow (Pending)
        }
    };

    const getRejectionOptions = (sectionId) => {
        if (sectionId === 'visual') return [
            'Rail Seat Damage (LT)',
            'Rail Seat Damage (RT)',
            'Surface Honeycomb',
            'Surface Damage',
            'Foreign Object in Sleeper',
            'Position of HTS Wire'
        ];
        if (sectionId === 'dimension') return [
            'Outer Gauge',
            'Depth',
            'Width',
            'Length of Sleeper',
            'Wind Gauge',
            'Camber Check'
        ];
        return null;
    };

    const handleSave = async () => {
        if (selectedSleepers.length === 0) {
            alert('Please select at least one sleeper for testing.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                batchId: batch.batchId,
                moduleId: 1,
                shift: shift || 'General',
                createdBy: 118,
                sleepers: sleepers.filter(s => selectedSleepers.includes(s.id)).map(s => {
                    const isPassed = s.status === 'passed';
                    const isRejected = s.status === 'rejected';

                    const sleeperParams = sections.map((sect, idx) => {
                        const sectState = sectionStates[sect.id];
                        let paramResult = 'OK';
                        if (sectState.result === 'all-rejected') paramResult = 'REJECTED';
                        else if (sectState.result === 'partial-ok' && sectState.failedSleepers.includes(s.id)) paramResult = 'REJECTED';

                        return {
                            parameterId: idx + 1,
                            result: paramResult
                        };
                    });

                    let rejectionReason = '';
                    sections.forEach(sect => {
                        const sectState = sectionStates[sect.id];
                        if (sectState.result === 'all-rejected') {
                            rejectionReason += `${sect.label}: ${sectState.globalRemark || 'Rejected'}; `;
                        } else if (sectState.result === 'partial-ok' && sectState.failedSleepers.includes(s.id)) {
                            rejectionReason += `${sect.label}: ${sectState.remarks[s.id] || 'Rejected'}; `;
                        }
                    });

                    return {
                        sleeperId: s.id,
                        sleeperNo: s.displayNo,
                        result: isPassed ? 'OK' : (isRejected ? 'REJECTED' : 'PENDING'),
                        rejectionReason: rejectionReason.trim(),
                        parameters: sleeperParams
                    };
                })
            };

            await apiService.saveFinalInspection(payload);
            alert('Visual Inspection results saved successfully.');
            onSave();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save inspection results');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="visual-inspection-form critical-dimension-form">
            <div className="critical-form-body">
                {/* 1. Initial Declaration */}
                <section className="critical-section">
                    <h4 className="section-label">1. Initial Declaration</h4>
                    <div className="declaration-grid">
                        <div className="declaration-item">
                            <span className="item-label">BATCH NUMBER</span>
                            <span className="item-value">{batch.batchNumber}</span>
                        </div>
                        <div className="declaration-item">
                            <span className="item-label">DATE OF CASTING</span>
                            <span className="item-value">{batch.castingDate || '-'}</span>
                        </div>
                        <div className="declaration-item">
                            <span className="item-label">SLEEPER TYPE</span>
                            <span className="item-value">{batch.sleeperType || 'N/A'}</span>
                        </div>
                        <div className="declaration-item">
                            <span className="item-label">TOTAL IN BATCH</span>
                            <span className="item-value">{batch.totalSleepers}</span>
                        </div>
                    </div>
                </section>

                {/* 2. Available Sleepers (Select for Testing) */}
                <section className="critical-section">
                    <h4 className="section-label">2. Available Sleepers (Select for Testing)</h4>
                    <div className="sleeper-selection-header">
                        <div className="count-label">Selected: {selectedSleepers.length} / {sleepers.length}</div>
                    </div>
                    <div className="sleeper-pool-grid">
                        {sleepers.map(s => {
                            const isSelected = selectedSleepers.includes(s.id);
                            const isAlreadyRejected = s.status === 'rejected';
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => !saving && toggleSleeperSelection(s.id)}
                                    className={`sleeper-chip ${isSelected ? 'selected' : ''} ${isAlreadyRejected ? 'already-rejected' : ''}`}
                                    style={{
                                        background: isAlreadyRejected ? '#fee2e2' : getStatusColor(s.status, isSelected),
                                        color: isAlreadyRejected ? '#b91c1c' : isSelected ? '#fff' : '#374151',
                                        borderColor: isAlreadyRejected ? '#ef4444' : isSelected ? 'transparent' : '#9ca3af',
                                        cursor: (saving || isAlreadyRejected) ? 'not-allowed' : 'pointer',
                                        textDecoration: isAlreadyRejected ? 'line-through' : 'none'
                                    }}
                                >
                                    {s.displayNo}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Inspection Sections */}
                <section className="critical-section-white">
                    <h4 className="section-label">3. Inspection Checkpoints</h4>
                    <div style={{ overflowX: 'auto' }}>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={sectionStates[s.id].allChecked}
                                                            onChange={(e) => handleSectionChange(s.id, 'allChecked', e.target.checked)}
                                                            disabled={selectedSleepers.length === 0}
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
                                                                disabled={selectedSleepers.length === 0 || saving}
                                                                style={{
                                                                    padding: '4px 12px',
                                                                    fontSize: '10px',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    background: sectionStates[s.id].result === opt.id ? '#42818c' : 'transparent',
                                                                    color: sectionStates[s.id].result === opt.id ? '#fff' : '#64748b',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600',
                                                                    opacity: selectedSleepers.length === 0 ? 0.5 : 1
                                                                }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {sectionStates[s.id].result === 'all-rejected' && s.id !== 'ftc' && (
                                                    <div style={{ marginTop: '12px', background: '#fee2e2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                                                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c', display: 'block', marginBottom: '6px' }}>Reason for rejecting ALL sleepers:</label>
                                                        {getRejectionOptions(s.id) ? (
                                                            <select
                                                                style={{ width: '100%', padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                                value={sectionStates[s.id].globalRemark || ''}
                                                                onChange={(e) => handleSectionChange(s.id, 'globalRemark', e.target.value)}
                                                            >
                                                                <option value="">-- Select --</option>
                                                                {getRejectionOptions(s.id).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                placeholder="Enter reason..."
                                                                style={{ width: '100%', padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                                value={sectionStates[s.id].globalRemark || ''}
                                                                onChange={(e) => handleSectionChange(s.id, 'globalRemark', e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                                {sectionStates[s.id].result === 'partial-ok' && (
                                                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                                                        <div style={{ marginBottom: '8px', color: '#42818c', fontWeight: '700', fontSize: '11px' }}>Select Rejected Sleepers:</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                            {sleepers.filter(sl => selectedSleepers.includes(sl.id)).map(sl => {
                                                                const isRejectedElsewhere = sections.some(otherSection =>
                                                                    otherSection.id !== s.id &&
                                                                    (sectionStates[otherSection.id].result === 'all-rejected' ||
                                                                        sectionStates[otherSection.id].failedSleepers.includes(sl.id))
                                                                );
                                                                const isCurrentlyRejected = sectionStates[s.id].failedSleepers.includes(sl.id);

                                                                return (
                                                                    <div
                                                                        key={sl.id}
                                                                        onClick={() => {
                                                                            if (isRejectedElsewhere) return;
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
                                                                            cursor: isRejectedElsewhere ? 'not-allowed' : 'pointer',
                                                                            border: '1px solid',
                                                                            borderColor: isCurrentlyRejected ? '#ef4444' : '#e2e8f0',
                                                                            background: isCurrentlyRejected ? '#fee2e2' : isRejectedElsewhere ? '#f1f5f9' : '#fff',
                                                                            color: isCurrentlyRejected ? '#b91c1c' : isRejectedElsewhere ? '#94a3b8' : '#64748b',
                                                                            fontWeight: '600',
                                                                            opacity: isRejectedElsewhere ? 0.5 : 1
                                                                        }}
                                                                    >
                                                                        {sl.displayNo}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {sectionStates[s.id].failedSleepers.length > 0 && s.id !== 'ftc' && (
                                                            <div style={{ marginTop: '12px' }}>
                                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Rejection Remarks:</div>
                                                                {sectionStates[s.id].failedSleepers.map(fid => (
                                                                    <div key={fid} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                                        <span style={{ fontSize: '10px', fontWeight: '700', width: '60px' }}>#{sleepers.find(sl => sl.id === fid)?.displayNo}</span>
                                                                        {getRejectionOptions(s.id) ? (
                                                                            <select
                                                                                style={{ flex: 1, padding: '4px 8px', fontSize: '11px' }}
                                                                                value={sectionStates[s.id].remarks[fid] || ''}
                                                                                onChange={(e) => {
                                                                                    const newRemarks = { ...sectionStates[s.id].remarks, [fid]: e.target.value };
                                                                                    handleSectionChange(s.id, 'remarks', newRemarks);
                                                                                }}
                                                                            >
                                                                                <option value="">-- Select --</option>
                                                                                {getRejectionOptions(s.id).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                            </select>
                                                                        ) : (
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
                                                                        )}
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
                </section>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', padding: '0 32px 32px 32px' }}>
                <button
                    className="btn-verify"
                    style={{ flex: '1 1 200px', height: '44px', opacity: (saving || selectedSleepers.length === 0) ? 0.7 : 1 }}
                    onClick={handleSave}
                    disabled={saving || selectedSleepers.length === 0}
                >
                    {saving ? 'Saving...' : 'Save Visual Inspection Results'}
                </button>
                <button 
                    className="btn-save" 
                    style={{ flex: '1 1 200px', background: '#f1f5f9', color: '#64748b', border: 'none', height: '44px' }} 
                    onClick={onCancel} 
                    disabled={saving}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default VisualInspectionForm;

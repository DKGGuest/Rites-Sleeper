import React, { useState, useMemo } from 'react';
import { apiService } from '../../../services/api';
import './CriticalDimensionForm.css'; // Reusing styles if applicable or ensuring consistency

const VisualInspectionForm = ({ batch, onSave, onCancel, shift }) => {
    // Sleeper data from batch details
    const initialSleepers = useMemo(() => {
        return batch?.sleepers
            ?.filter(s => s.status?.toUpperCase() !== 'REJECTED')
            ?.map(s => ({
                ...s,
                id: s.sleeperId,
                displayNo: s.sleeperNo,
                status: s.status?.toLowerCase() === 'pending' ? 'pending' : (s.status?.toLowerCase() === 'ok' ? 'passed' : 'rejected')
            })) || [];
    }, [batch]);

    const [sleepers, setSleepers] = useState(initialSleepers);
    const [selectedSleepers, setSelectedSleepers] = useState(() => 
        initialSleepers.filter(s => s.status === 'passed').map(s => s.id)
    );
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
                allChecked: initialSleepers.some(sl => sl.status === 'passed'), // Auto-check if some already passed
                result: 'all-ok', 
                failedSleepers: [],
                rejectionDetails: {},
                globalReason: '',
                globalSubReason: ''
            }
        }), {})
    );

    const handleSectionChange = (sectionId, field, value) => {
        setSectionStates(prev => {
            const newState = {
                ...prev,
                [sectionId]: {
                    ...prev[sectionId],
                    [field]: value
                }
            };

            // If switching to all-rejected, automatically fail all selected sleepers
            if (field === 'result' && value === 'all-rejected') {
                newState[sectionId].failedSleepers = [...selectedSleepers];
            } else if (field === 'result' && value === 'all-ok') {
                newState[sectionId].failedSleepers = [];
            }

            return newState;
        });

        // Update sleeper statuses based on all sections
        if (field !== 'globalReason' && field !== 'globalSubReason' && field !== 'rejectionDetails') {
            updateSleeperStatuses(sectionId, field, value);
        }
    };

    const handleSleeperRejectionUpdate = (sectionId, sleeperId, field, value) => {
        setSectionStates(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                rejectionDetails: {
                    ...prev[sectionId].rejectionDetails,
                    [sleeperId]: {
                        ...(prev[sectionId].rejectionDetails[sleeperId] || { reason: '', subReason: '' }),
                        [field]: value
                    }
                }
            }
        }));
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
            'Rail Seat Damage',
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

    const getSubReasons = (sectionId, reason) => {
        if (!reason) return [];
        if (sectionId === 'visual') {
            switch (reason) {
                case 'Rail Seat Damage': return ['Damage LT', 'Damage RT', 'Crack', 'Spalling'];
                case 'Surface Honeycomb': return ['Major Honeycomb', 'Minor Honeycomb', 'Side Face', 'Bottom Face'];
                case 'Surface Damage': return ['Corner Chipped', 'Edge Damage', 'Scratch'];
                case 'Position of HTS Wire': return ['Shifted LT', 'Shifted RT', 'Too High', 'Too Low'];
                case 'Foreign Object in Sleeper': return ['Wood', 'Stone', 'Metal Part'];
                default: return ['Others'];
            }
        }
        if (sectionId === 'dimension') {
            return ['+ve Deviation', '-ve Deviation', 'Out of Tolerance'];
        }
        return ['General Defect'];
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
                createdBy: parseInt(localStorage.getItem('userId') || '118', 10),
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
                        if (sectState.failedSleepers.includes(s.id)) {
                            const details = sectState.rejectionDetails[s.id] || {};
                            const reason = details.reason || (sectState.result === 'all-rejected' ? sectState.globalReason : '');
                            const subReason = details.subReason || (sectState.result === 'all-rejected' ? sectState.globalSubReason : '');
                            
                            if (reason) {
                                rejectionReason += `${sect.label}: ${reason}${subReason ? ' (' + subReason + ')' : ''}; `;
                            } else {
                                rejectionReason += `${sect.label}: Rejected; `;
                            }
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

                                                {(sectionStates[s.id].result === 'all-rejected' || sectionStates[s.id].result === 'partial-ok') && (
                                                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                <span style={{ color: '#42818c', fontWeight: '700', fontSize: '11px' }}>
                                                                    {sectionStates[s.id].result === 'all-rejected' ? 'All Sleepers Rejected' : 'Select Rejected Sleepers:'}
                                                                </span>
                                                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{sectionStates[s.id].failedSleepers.length} Sleeper(s)</span>
                                                            </div>
                                                            
                                                            {sectionStates[s.id].result === 'partial-ok' && (
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                    {sleepers.filter(sl => selectedSleepers.includes(sl.id)).map(sl => {
                                                                        const isRejectedElsewhere = sections.some(otherSect => 
                                                                            otherSect.id !== s.id && 
                                                                            (sectionStates[otherSect.id].result === 'all-rejected' || sectionStates[otherSect.id].failedSleepers.includes(sl.id))
                                                                        );
                                                                        const isCurrentlyRejected = sectionStates[s.id].failedSleepers.includes(sl.id);
                                                                        return (
                                                                            <div
                                                                                key={sl.id}
                                                                                onClick={() => {
                                                                                    if (isRejectedElsewhere) return;
                                                                                    const failed = sectionStates[s.id].failedSleepers;
                                                                                    const newVal = failed.includes(sl.id) ? failed.filter(fid => fid !== sl.id) : [...failed, sl.id];
                                                                                    handleSectionChange(s.id, 'failedSleepers', newVal);
                                                                                }}
                                                                                style={{
                                                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600',
                                                                                    cursor: isRejectedElsewhere ? 'not-allowed' : 'pointer',
                                                                                    border: '1px solid',
                                                                                    borderColor: isCurrentlyRejected ? '#ef4444' : '#e2e8f0',
                                                                                    background: isCurrentlyRejected ? '#fee2e2' : isRejectedElsewhere ? '#f1f5f9' : '#fff',
                                                                                    color: isCurrentlyRejected ? '#b91c1c' : isRejectedElsewhere ? '#94a3b8' : '#64748b'
                                                                                }}
                                                                            >
                                                                                {sl.displayNo}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {sectionStates[s.id].failedSleepers.length > 0 && s.id !== 'ftc' && (
                                                            <div style={{ marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                                                                    <thead>
                                                                        <tr style={{ color: '#64748b', textAlign: 'left' }}>
                                                                            <th style={{ padding: '4px' }}>Sleeper</th>
                                                                            <th style={{ padding: '4px' }}>Reason</th>
                                                                            <th style={{ padding: '4px' }}>Sub-Reason</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {sectionStates[s.id].failedSleepers.map(fid => {
                                                                            const sl = sleepers.find(item => item.id === fid);
                                                                            const details = sectionStates[s.id].rejectionDetails[fid] || { reason: '', subReason: '' };
                                                                            return (
                                                                                <tr key={fid} style={{ borderBottom: '1px dotted #f1f5f9' }}>
                                                                                    <td style={{ padding: '4px', fontWeight: '700', color: '#334155' }}>#{sl?.displayNo}</td>
                                                                                    <td style={{ padding: '4px' }}>
                                                                                        <select 
                                                                                            style={{ width: '100%', padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                                                                            value={details.reason}
                                                                                            onChange={(e) => handleSleeperRejectionUpdate(s.id, fid, 'reason', e.target.value)}
                                                                                        >
                                                                                            <option value="">-- Reason --</option>
                                                                                            {getRejectionOptions(s.id)?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                                        </select>
                                                                                    </td>
                                                                                    <td style={{ padding: '4px' }}>
                                                                                        <select 
                                                                                            style={{ width: '100%', padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                                                                            value={details.subReason}
                                                                                            onChange={(e) => handleSleeperRejectionUpdate(s.id, fid, 'subReason', e.target.value)}
                                                                                            disabled={!details.reason}
                                                                                        >
                                                                                            <option value="">-- Sub Reason --</option>
                                                                                            {getSubReasons(s.id, details.reason).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                                                                        </select>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
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

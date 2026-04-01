import React, { useState, useMemo } from 'react';
import { apiService } from '../../../services/api';
import './CriticalDimensionForm.css';

const NonCriticalDimensionForm = ({ batch, onSave, onCancel, shift }) => {
    // List of all sleepers in the batch
    const allSleepersPool = useMemo(() => {
        return (batch?.sleepers || [])
            .map(s => {
                const isAlreadyRejected = s.status?.toUpperCase() === 'REJECTED';
                return {
                    ...s,
                    id: s.sleeperId,
                    displayNo: s.sleeperNo,
                    isRejected: isAlreadyRejected,
                    isAlreadyPassed: s.status?.toUpperCase() === 'OK' || s.status?.toUpperCase() === 'PASSED'
                };
            });
    }, [batch]);

    const [selectedSleepers, setSelectedSleepers] = useState(() => 
        // Initial select: both OK and REJECTED ones.
        allSleepersPool.filter(s => s.isAlreadyPassed || s.isRejected).map(s => s.id)
    );
    const [saving, setSaving] = useState(false);

    const toggleSleeperSelection = (id) => {
        // Allow selecting even if rejected to allow re-inspection/acceptance
        // if (sleeper?.isRejected) return;

        setSelectedSleepers(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const parametersToCheck = [
        { id: 13, label: 'Position of HTS Wires' },
        { id: 14, label: 'Depth of Sleeper' },
        { id: 15, label: 'Width of Sleeper' },
        { id: 16, label: 'Length of Sleeper' },
        { id: 17, label: 'Wind Gauge' },
        { id: 18, label: 'Camber Check' }
    ];

    const [checklistState, setChecklistState] = useState(
        parametersToCheck.reduce((acc, p) => ({ 
            ...acc, 
            [p.label]: allSleepersPool.some(s => s.isAlreadyPassed) // Pre-check if any passed
        }), {})
    );

    const [overallResult, setOverallResult] = useState(() => 
        allSleepersPool.some(s => s.isRejected) ? 'partial-ok' : 'ok'
    );
    const [rejectionDetails, setRejectionDetails] = useState(() => {
        const initialRejections = {};
        allSleepersPool.filter(s => s.isRejected).forEach(s => {
            let main = '';
            let sub = '';
            if (s.rejectionReason && s.rejectionReason.includes(':')) {
                const parts = s.rejectionReason.split(':');
                main = parts[0]?.trim() || '';
                sub = parts[1]?.trim() || '';
            }
            initialRejections[s.id] = { mainReason: main, subReason: sub };
        });
        return initialRejections;
    });

    const isChecklistComplete = parametersToCheck.every(p => checklistState[p.label]);

    const handleChecklistChange = (param) => {
        setChecklistState(prev => ({ ...prev, [param]: !prev[param] }));
    };

    const handleResultChange = (result) => {
        if (!isChecklistComplete) return;
        setOverallResult(result);
        if (result === 'ok') {
            setRejectionDetails({});
        } else if (result === 'all-rejected') {
            const allRejected = {};
            selectedSleepers.forEach(id => {
                allRejected[id] = { mainReason: '', subReason: '' };
            });
            setRejectionDetails(allRejected);
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
            case 'Position of HTS Wires':
                return ['HTS Position - LT', 'HTS Position - RT'];
            case 'Depth of Sleeper':
                return ['Depth - Rail Seat', 'Depth - End', 'Depth - Centre'];
            case 'Width of Sleeper':
                return ['Width - Top', 'Width - Bottom'];
            case 'Length of Sleeper':
                return ['Length - Overall'];
            case 'Wind Gauge':
                return ['Wind Gauge (LT)', 'Wind Gauge (RT)'];
            case 'Camber Check':
                return ['Camber - LT', 'Camber - RT'];
            default:
                return [];
        }
    };

    const targetPercentage = useMemo(() => {
        const spec = batch?.designSpec || 'T-39';
        return spec === 'T-39' ? '1%' : '5%';
    }, [batch]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                batchId: batch.batchId,
                moduleId: 3,
                shift: shift || 'General',
                createdBy: parseInt(localStorage.getItem('userId') || '118', 10),
                sleepers: selectedSleepers.map(sid => {
                    const sleeper = allSleepersPool.find(s => s.id === sid);
                    const isRejected = !!rejectionDetails[sid];

                    const sleeperParams = parametersToCheck.map(p => ({
                        parameterId: p.id,
                        result: isRejected && rejectionDetails[sid].mainReason === p.label ? 'REJECTED' : 'OK'
                    }));

                    return {
                        sleeperId: sid,
                        sleeperNo: sleeper.displayNo,
                        result: isRejected ? 'REJECTED' : 'OK',
                        rejectionReason: isRejected ? `${rejectionDetails[sid].mainReason}: ${rejectionDetails[sid].subReason}` : '',
                        parameters: sleeperParams
                    };
                })
            };

            await apiService.saveFinalInspection(payload);
            alert('Non-Critical Dimension results saved successfully.');
            onSave();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save inspection results');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="non-critical-dimension-form critical-dimension-form">
            <header className="critical-form-header">
                <h2>Non-Critical Dimensions - Full Inspection Form</h2>
                <button onClick={onCancel} className="close-btn" disabled={saving}>✕</button>
            </header>

            <div className="critical-form-body">
                <section className="critical-section">
                    <h4 className="section-label">1. Initial Declaration</h4>
                    <div className="declaration-grid">
                        <div className="declaration-item"><span className="item-label">BATCH NUMBER</span><span className="item-value">{batch.batchNumber}</span></div>
                        <div className="declaration-item"><span className="item-label">SLEEPER TYPE</span><span className="item-value">{batch.sleeperType || 'N/A'}</span></div>
                        <div className="declaration-item"><span className="item-label">TOTAL IN BATCH</span><span className="item-value">{batch.totalSleepers ?? batch.noOfSleepers ?? batch.totalBatchQty ?? '—'}</span></div>
                        <div className="declaration-item"><span className="item-label">TARGET REQ.</span><span className="item-value">{targetPercentage}</span></div>
                    </div>
                </section>

                <section className="critical-section">
                    <h4 className="section-label">2. Available Sleepers (Select for Testing)</h4>
                    <div className="sleeper-selection-header">
                        <div className="count-label">Selected: {selectedSleepers.length} / {allSleepersPool.length}</div>
                    </div>
                    <div className="sleeper-pool-grid">
                        {allSleepersPool.map(s => {
                            const isSelected = selectedSleepers.includes(s.id);
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => !saving && toggleSleeperSelection(s.id)}
                                    className={`sleeper-chip ${isSelected ? 'selected' : ''} ${s.isRejected ? 'already-rejected' : ''}`}
                                    style={{
                                        background: isSelected ? (rejectionDetails[s.id] ? '#ef4444' : '#15803d') : (s.isRejected ? '#fee2e2' : '#f3f4f6'),
                                        color: isSelected ? '#fff' : (s.isRejected ? '#b91c1c' : '#374151'),
                                        borderColor: isSelected ? (rejectionDetails[s.id] ? '#991b1b' : 'transparent') : (s.isRejected ? '#ef4444' : '#9ca3af'),
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {s.displayNo}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="critical-section-white">
                    <h4 className="section-label">3. Non-Critical Parameters to be Checked</h4>
                    <div className="parameters-checklist-grid">
                        {parametersToCheck.map(p => (
                            <label key={p.id} className={`parameter-checkbox-card ${checklistState[p.label] ? 'checked' : ''}`} style={{ borderColor: checklistState[p.label] ? '#10b981' : '#e2e8f0' }}>
                                <input
                                    type="checkbox"
                                    checked={checklistState[p.label]}
                                    onChange={() => !saving && handleChecklistChange(p.label)}
                                    disabled={saving}
                                />
                                <span className="param-label">{p.label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <section className={`critical-section-white ${!isChecklistComplete ? 'locked' : ''}`}>
                    <h4 className="section-label">4. Result of Checking</h4>
                    <div className="result-options-row">
                        {[
                            { id: 'ok', label: 'All OK', color: '#10b981' },
                            { id: 'partial-ok', label: 'Partially OK', color: '#f59e0b' },
                            { id: 'all-rejected', label: 'All Rejected', color: '#ef4444' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleResultChange(opt.id)}
                                disabled={!isChecklistComplete || saving}
                                className="result-btn"
                                style={{
                                    background: overallResult === opt.id ? opt.color : '#f1f5f9',
                                    color: overallResult === opt.id ? '#fff' : '#64748b',
                                    opacity: (!isChecklistComplete || saving) ? 0.5 : 1
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {(overallResult === 'partial-ok' || overallResult === 'all-rejected') && (
                        <div className="rejection-table-section fade-in">
                            <h5 className="rejection-title">
                                Details of Rejected Sleepers
                                {overallResult === 'partial-ok' && <span className="rejection-subtitle"> (Select sleepers to mark as rejected)</span>}
                            </h5>

                            {overallResult === 'partial-ok' && (
                                <div className="rejection-sleepers-row">
                                    {selectedSleepers.map(sid => {
                                        const isRejected = !!rejectionDetails[sid];
                                        return (
                                            <button
                                                key={sid}
                                                onClick={() => !saving && toggleRejection(sid)}
                                                disabled={saving}
                                                className={`rejection-chip ${isRejected ? 'rejected' : ''}`}
                                                style={{
                                                    borderColor: isRejected ? '#ef4444' : '#cbd5e1',
                                                    background: isRejected ? '#fecaca' : '#fff',
                                                    color: isRejected ? '#991b1b' : '#64748b'
                                                }}
                                            >
                                                {allSleepersPool.find(s => s.id === sid)?.displayNo}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="table-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Sleeper No</th>
                                            <th>Main Reason</th>
                                            <th>Sub Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(rejectionDetails).map(sid => (
                                            <tr key={sid}>
                                                <td data-label="Sleeper No" className="fw-700">{allSleepersPool.find(s => String(s.id) === String(sid))?.displayNo}</td>
                                                <td data-label="Main Reason">
                                                    <select
                                                        value={rejectionDetails[sid].mainReason}
                                                        onChange={(e) => handleRejectionChange(sid, 'mainReason', e.target.value)}
                                                        className="ui-select"
                                                        disabled={saving}
                                                    >
                                                        <option value="">-- Select --</option>
                                                        {parametersToCheck.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                                                    </select>
                                                </td>
                                                <td data-label="Sub Reason">
                                                    <select
                                                        value={rejectionDetails[sid].subReason}
                                                        onChange={(e) => handleRejectionChange(sid, 'subReason', e.target.value)}
                                                        disabled={!rejectionDetails[sid].mainReason || saving}
                                                        className="ui-select"
                                                    >
                                                        <option value="">-- Select --</option>
                                                        {getSubReasons(rejectionDetails[sid].mainReason).map(sub => (
                                                            <option key={sub} value={sub}>{sub}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <footer className="critical-form-footer">
                <button
                    onClick={handleSave}
                    disabled={selectedSleepers.length === 0 || saving}
                    className="footer-btn footer-btn-primary"
                    style={{ opacity: (selectedSleepers.length === 0 || saving) ? 0.7 : 1 }}
                >
                    {saving ? 'Saving...' : 'Save Non-Critical Inspection'}
                </button>
                <button onClick={onCancel} className="footer-btn footer-btn-secondary" disabled={saving}>Cancel</button>
            </footer>
        </div>
    );
};

export default NonCriticalDimensionForm;

import React, { useState, useMemo } from 'react';
import './CriticalDimensionForm.css';

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
        'Dist b/w Inserts (Rail Seat)',
        'Slope Gauge'
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
            case 'ToeGap': return ['ToeGap(LT) - Inner', 'ToeGap (LT) - Outer', 'ToeGap (RT)-Inner', 'ToeGap (RT) - Outer'];
            case 'Slope Gauge': return ['Slope Gauge (LT)', 'Slope Gauge (RT)'];
            case 'Dist b/w Inserts (Rail Seat)': return ['Dist b/w Inserts (LT)', 'Dist b/w Inserts (RT)'];
            default: return [];
        }
    };

    return (
        <div className="critical-dimension-form">
            <header className="critical-form-header">
                <h2>Critical Dimensions - Full Inspection Form</h2>
                <button onClick={onCancel} className="close-btn">×</button>
            </header>

            <div className="critical-form-body">
                <section className="critical-section">
                    <h4 className="section-label">1. Initial Declaration</h4>
                    <div className="declaration-grid">
                        <div className="declaration-item"><span className="item-label">BATCH NUMBER</span><span className="item-value">{batch.batchNo}</span></div>
                        <div className="declaration-item"><span className="item-label">SLEEPER TYPE</span><span className="item-value">{batch.sleeperType}</span></div>
                        <div className="declaration-item"><span className="item-label">TOTAL IN BATCH</span><span className="item-value">{batch.typeQty || 255}</span></div>
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
                                    onClick={() => toggleSleeperSelection(s.id)}
                                    className={`sleeper-chip ${isSelected ? 'selected' : ''}`}
                                    style={{
                                        background: isSelected ? '#15803d' : '#d1d5db',
                                        color: isSelected ? '#fff' : '#374151',
                                        borderColor: isSelected ? '#14532d' : '#9ca3af'
                                    }}
                                >
                                    {s.id.split('/')[1]}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="critical-section-white">
                    <h4 className="section-label">3. Critical Parameters to be Checked</h4>
                    <div className="parameters-checklist-grid">
                        {parametersToCheck.map(param => (
                            <label key={param} className={`parameter-checkbox-card ${checklistState[param] ? 'checked' : ''}`} style={{ borderColor: checklistState[param] ? '#10b981' : '#e2e8f0' }}>
                                <input
                                    type="checkbox"
                                    checked={checklistState[param]}
                                    onChange={() => handleChecklistChange(param)}
                                />
                                <span className="param-label">{param}</span>
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
                                className="result-btn"
                                style={{
                                    background: overallResult === opt.id ? opt.color : '#f1f5f9',
                                    color: overallResult === opt.id ? '#fff' : '#64748b'
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
                                                onClick={() => toggleRejection(sid)}
                                                className={`rejection-chip ${isRejected ? 'rejected' : ''}`}
                                                style={{
                                                    borderColor: isRejected ? '#ef4444' : '#cbd5e1',
                                                    background: isRejected ? '#fecaca' : '#fff',
                                                    color: isRejected ? '#991b1b' : '#64748b'
                                                }}
                                            >
                                                {sid.split('/')[1]}
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
                                                <td data-label="Sleeper No" className="fw-700">{sid.split('/')[1]}</td>
                                                <td data-label="Main Reason">
                                                    <select
                                                        value={rejectionDetails[sid].mainReason}
                                                        onChange={(e) => handleRejectionChange(sid, 'mainReason', e.target.value)}
                                                        className="ui-select"
                                                    >
                                                        <option value="">-- Select --</option>
                                                        {parametersToCheck.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                </td>
                                                <td data-label="Sub Reason">
                                                    <select
                                                        value={rejectionDetails[sid].subReason}
                                                        onChange={(e) => handleRejectionChange(sid, 'subReason', e.target.value)}
                                                        disabled={!rejectionDetails[sid].mainReason}
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
                                        {Object.keys(rejectionDetails).length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="empty-msg">
                                                    {overallResult === 'partial-ok' ? 'Select sleepers above to add rejection details.' : 'No rejected sleepers.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <footer className="critical-form-footer">
                <button
                    onClick={onSave}
                    disabled={selectedSleepers.length === 0}
                    className="footer-btn footer-btn-primary"
                    style={{ opacity: selectedSleepers.length === 0 ? 0.7 : 1 }}
                >
                    Save Critical Inspection
                </button>
                <button onClick={onCancel} className="footer-btn footer-btn-secondary">Cancel</button>
            </footer>
        </div>
    );
};

export default CriticalDimensionForm;

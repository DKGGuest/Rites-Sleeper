import React, { useState, useEffect, useMemo } from 'react';

const MoistureAnalysis = ({ onBack, onSave, initialView = 'list' }) => {
    const [view, setView] = useState(initialView); // 'list', 'entry'
    const [editRecord, setEditRecord] = useState(null);
    const [records, setRecords] = useState([
        {
            id: 1,
            date: '2026-01-17',
            shift: 'A',
            timing: '08:30',
            ca1Free: '1.20',
            ca2Free: '0.80',
            faFree: '3.20',
            totalFree: '5.20',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
        },
        {
            id: 2,
            date: '2026-01-16',
            shift: 'C',
            timing: '20:15',
            ca1Free: '1.10',
            ca2Free: '0.95',
            faFree: '2.90',
            totalFree: '4.95',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
        },
    ]);

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (60 * 60 * 1000); // 1 hour window
    };

    const handleSaveEntry = (newEntry) => {
        if (editRecord) {
            setRecords(records.map(r => r.id === editRecord.id ? { ...newEntry, id: r.id } : r));
        } else {
            setRecords([newEntry, ...records]);
        }
        setView('list');
        setEditRecord(null);
        onSave();
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setView('entry');
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Moisture Analysis Records</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {view === 'list' ? (
                        <div className="list-view">
                            <div className="data-table-section">
                                <div className="table-title-bar">Historical Quality Logs (Aggregate Moisture)</div>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Shift</th>
                                            <th>Timing</th>
                                            <th>Free Moisture (CA1)</th>
                                            <th>Free Moisture (CA2)</th>
                                            <th>Free Moisture (FA)</th>
                                            <th>Total Free</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((r) => (
                                            <tr key={r.id}>
                                                <td data-label="Date & Shift"><span>{r.date} (Shift {r.shift})</span></td>
                                                <td data-label="Timing"><span>{r.timing}</span></td>
                                                <td data-label="Free Moisture (CA1)"><span>{r.ca1Free}%</span></td>
                                                <td data-label="Free Moisture (CA2)"><span>{r.ca2Free}%</span></td>
                                                <td data-label="Free Moisture (FA)"><span>{r.faFree}%</span></td>
                                                <td data-label="Total Free" style={{ fontWeight: '500', color: 'var(--primary-color)' }}><span>{r.totalFree} Kg</span></td>
                                                <td data-label="Actions">
                                                    {isRecordEditable(r.timestamp) ? (
                                                        <button className="toggle-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }} onClick={() => handleEdit(r)}>Modify</button>
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Read-only</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                                <button className="toggle-btn" onClick={() => { setEditRecord(null); setView('entry'); }}>+ Add New Analysis</button>
                            </div>
                        </div>
                    ) : (
                        <MoistureEntryForm
                            onCancel={() => setView('list')}
                            onSave={handleSaveEntry}
                            initialData={editRecord}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const MoistureEntryForm = ({ onCancel, onSave, initialData }) => {
    const [activeSection, setActiveSection] = useState('ca1');

    const [commonData, setCommonData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        shift: initialData?.shift || 'A',
        timing: initialData?.timing || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: initialData?.batchNo || '',
        dryCA1: 436.2, dryCA2: 178.6, dryFA: 207.1,
        dryWater: 37.0, dryAdmix: 1.44, dryCement: 175.5
    });

    const [aggData, setAggData] = useState({
        ca1: initialData?.ca1Details || { wet: 0, dried: 0, absorption: 0.5 },
        ca2: initialData?.ca2Details || { wet: 0, dried: 0, absorption: 0.5 },
        fa: initialData?.faDetails || { wet: 0, dried: 0, absorption: 1.0 }
    });

    // Calculations Helper
    const calcAgg = (data, dryBatchWt) => {
        const moistureGms = Math.max(0, data.wet - data.dried);
        const moisturePct = data.dried > 0 ? (moistureGms / data.dried) * 100 : 0;
        const freeMoisturePct = Math.max(0, moisturePct - data.absorption);
        const freeMoistureKg = (dryBatchWt * freeMoisturePct) / 100;
        const adjustedWt = dryBatchWt + freeMoistureKg;
        const adoptedWt = Math.ceil(adjustedWt);
        return { moistureGms, moisturePct, freeMoisturePct, freeMoistureKg, adjustedWt, adoptedWt };
    };

    const ca1Res = useMemo(() => calcAgg(aggData.ca1, commonData.dryCA1), [aggData.ca1, commonData.dryCA1]);
    const ca2Res = useMemo(() => calcAgg(aggData.ca2, commonData.dryCA2), [aggData.ca2, commonData.dryCA2]);
    const faRes = useMemo(() => calcAgg(aggData.fa, commonData.dryFA), [aggData.fa, commonData.dryFA]);

    const totalFreeMoisture = ca1Res.freeMoistureKg + ca2Res.freeMoistureKg + faRes.freeMoistureKg;
    const adjustedWater = commonData.dryWater - totalFreeMoisture;
    const wcRatio = commonData.dryCement > 0 ? adjustedWater / commonData.dryCement : 0;
    const acRatio = commonData.dryCement > 0 ? (commonData.dryCA1 + commonData.dryCA2 + commonData.dryFA) / commonData.dryCement : 0;

    const handleAggChange = (agg, field, val) => {
        setAggData(prev => ({
            ...prev,
            [agg]: { ...prev[agg], [field]: parseFloat(val) || 0 }
        }));
    };

    const handleCommonChange = (field, val) => {
        setCommonData(prev => ({ ...prev, [field]: field === 'batchNo' ? val : (parseFloat(val) || 0) }));
    };

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>Common Form Section</h3>
            </div>

            <div className="form-grid">
                <div className="form-field">
                    <label>Batch Number <span className="required">*</span></label>
                    <input type="number" value={commonData.batchNo} onChange={e => handleCommonChange('batchNo', e.target.value)} placeholder="e.g. 601" />
                </div>
                <div className="form-field">
                    <label>Timing <span className="required">*</span></label>
                    <input type="time" value={commonData.timing} onChange={e => setCommonData({ ...commonData, timing: e.target.value })} />
                </div>
            </div>

            <div className="calculated-section">
                <span className="calculated-title">Batch Dry Weights (KGs / L)</span>
                <div className="calculated-grid">
                    <div className="calc-card">
                        <span className="calc-label">CA1 (20mm)</span>
                        <input type="number" step="0.1" value={commonData.dryCA1} onChange={e => handleCommonChange('dryCA1', e.target.value)} />
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">CA2 (10mm)</span>
                        <input type="number" step="0.1" value={commonData.dryCA2} onChange={e => handleCommonChange('dryCA2', e.target.value)} />
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">Fine Aggregate</span>
                        <input type="number" step="0.1" value={commonData.dryFA} onChange={e => handleCommonChange('dryFA', e.target.value)} />
                    </div>
                </div>
                <div className="calculated-grid" style={{ marginTop: '1rem' }}>
                    <div className="calc-card">
                        <span className="calc-label">Water</span>
                        <input type="number" step="0.1" value={commonData.dryWater} onChange={e => handleCommonChange('dryWater', e.target.value)} />
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">Admix</span>
                        <input type="number" step="0.01" value={commonData.dryAdmix} onChange={e => handleCommonChange('dryAdmix', e.target.value)} />
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">Cement</span>
                        <input type="number" step="0.1" value={commonData.dryCement} onChange={e => handleCommonChange('dryCement', e.target.value)} />
                    </div>
                </div>
            </div>

            <nav className="modal-tabs">
                <button className={`modal-tab-btn ${activeSection === 'ca1' ? 'active' : ''}`} onClick={() => setActiveSection('ca1')}>20mm Aggregate (CA1)</button>
                <button className={`modal-tab-btn ${activeSection === 'ca2' ? 'active' : ''}`} onClick={() => setActiveSection('ca2')}>10mm Aggregate (CA2)</button>
                <button className={`modal-tab-btn ${activeSection === 'fa' ? 'active' : ''}`} onClick={() => setActiveSection('fa')}>Fine Aggregate (FA)</button>
            </nav>

            <div className="form-grid">
                <div className="form-field">
                    <label>Wt. of Wet Sample (Gms) <span className="required">*</span></label>
                    <input type="number" value={aggData[activeSection].wet} onChange={e => handleAggChange(activeSection, 'wet', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Wt. of Dried Sample (Gms) <span className="required">*</span></label>
                    <input type="number" value={aggData[activeSection].dried} onChange={e => handleAggChange(activeSection, 'dried', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Absorption (%) <span className="required">*</span></label>
                    <input type="number" step="0.01" value={aggData[activeSection].absorption} onChange={e => handleAggChange(activeSection, 'absorption', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Free Moisture (%)</label>
                    <div className="calc-value" style={{ fontSize: '1.2rem' }}>
                        {activeSection === 'ca1' ? ca1Res.freeMoisturePct.toFixed(2) : activeSection === 'ca2' ? ca2Res.freeMoisturePct.toFixed(2) : faRes.freeMoisturePct.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="calculated-section" style={{ background: 'var(--accent-bg)', padding: '2rem', borderRadius: '12px' }}>
                <span className="calculated-title">Mix Summary & Live Ratios</span>
                <div className="calculated-grid">
                    <div className="calc-card">
                        <span className="calc-label">Total Free Moisture</span>
                        <div className="calc-value">{totalFreeMoisture.toFixed(2)} Kg</div>
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">Adjusted Water</span>
                        <div className="calc-value">{adjustedWater.toFixed(2)} L</div>
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">W/C Ratio</span>
                        <div className="calc-value" style={{ color: wcRatio > 0.4 ? 'red' : 'inherit' }}>{wcRatio.toFixed(3)}</div>
                    </div>
                    <div className="calc-card">
                        <span className="calc-label">Adopted CA1 / CA2 / FA</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem' }}>{ca1Res.adoptedWt} / {ca2Res.adoptedWt} / {faRes.adoptedWt}</div>
                    </div>
                </div>
            </div>

            <div className="form-actions-center">
                <button className="toggle-btn secondary" onClick={onCancel}>Cancel</button>
                <button className="toggle-btn" onClick={() => onSave({
                    id: initialData?.id || Date.now(),
                    ...commonData,
                    ca1Free: ca1Res.freeMoisturePct.toFixed(2),
                    ca2Free: ca2Res.freeMoisturePct.toFixed(2),
                    faFree: faRes.freeMoisturePct.toFixed(2),
                    totalFree: totalFreeMoisture.toFixed(2),
                    ca1Details: aggData.ca1,
                    ca2Details: aggData.ca2,
                    faDetails: aggData.fa,
                    timestamp: initialData?.timestamp || new Date().toISOString()
                })}>{initialData ? 'Update Analysis' : 'Submit & Adopt Weights'}</button>
            </div>
        </div>
    );
};

export default MoistureAnalysis;

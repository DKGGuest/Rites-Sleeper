import React, { useState, useEffect, useMemo } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';

import { 
    getMorPendingDeclarations, 
    saveMorSampleDeclaration, 
    getMorActiveDeclarations,
    getMorHistoricalDeclarations,
    saveMorTestResults,
    deleteMorSample
} from '../../../services/workflowService';
import { getStoredUser } from '../../../services/authService';

const DESIRED_VALUES = {
    centreTop: 450,
    centreBottom: 550,
    railSeat: 650
};

const MomentOfResistance = () => {
    const [activeTab, setActiveTab] = useState('declaration');
    const [pendingDeclarations, setPendingDeclarations] = useState([]);
    const [activeDeclarations, setActiveDeclarations] = useState([]);
    const [historicalRecords, setHistoricalRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const user = getStoredUser();
    const currentUserId = user?.id || user?.userId;

    useEffect(() => {
        fetchPending();
        fetchActive();
        fetchHistorical();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this MR record?")) return;
        try {
            setLoading(true);
            await deleteMorSample(id);
            alert("Deleted successfully!");
            fetchPending();
            fetchActive();
            fetchHistorical();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPending = async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const data = await getMorPendingDeclarations(currentUserId);
            setPendingDeclarations(data);
        } finally {
            setLoading(false);
        }
    };

    const fetchActive = async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const data = await getMorActiveDeclarations(currentUserId);
            setActiveDeclarations(data);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistorical = async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const data = await getMorHistoricalDeclarations(currentUserId);
            setHistoricalRecords(data);
        } finally {
            setLoading(false);
        }
    };

    const handleDeclareSamples = async (batch, samples) => {
        try {
            const payload = {
                samplingDate: new Date().toISOString().split('T')[0],
                concreteGrade: batch.concreteGrade,
                plantType: 'General', // Default or fallback
                shedLine: 'N/A', // Default or fallback
                sampleIdentificationNumber: `MR-${batch.batchNumber}-${Date.now()}`,
                waterCubeStrengthTestId: batch.waterCubeStrengthTestId,
                batchNumber: batch.batchNumber,
                castingDate: batch.castingDate,
                shift: batch.shift,
                lineNo: batch.lineNo,
                mrSamplesRequired: batch.mrSamplesRequired,
                mrTestType: batch.mrTestType || 'Fresh',
                details: samples.map(s => ({
                    benchNumber: s.bench,
                    sleeperNo: s.no
                })),
                createdBy: currentUserId
            };

            await saveMorSampleDeclaration(payload);
            alert("MR Sample declaration saved successfully!");
            setShowDeclareModal(false);
            fetchPending();
            fetchActive();
        } catch (error) {
            console.error("Error saving MR declaration:", error);
            alert("Failed to save MR declaration.");
        }
    };

    const handleSaveTestResults = async (batch, resultsData) => {
        try {
            setLoading(true);
            // resultsData: { results: Array, result: 'Pass'|'Fail'|'Retest' }
            const payload = resultsData.results.map(r => ({
                benchNumber: r.benchNumber,
                sleeperNo: r.sleeperNo,
                ctKn: parseFloat(r.ct),
                cbKn: parseFloat(r.cb),
                rsKn: parseFloat(r.rs),
                weight: parseFloat(r.weight) || null,
                remarks: r.remarks,
                loadKn: Math.max(parseFloat(r.ct) || 0, parseFloat(r.cb) || 0, parseFloat(r.rs) || 0), // Mapping highest load as loadKn
                result: (parseFloat(r.ct) >= DESIRED_VALUES.centreTop && 
                         parseFloat(r.cb) >= DESIRED_VALUES.centreBottom && 
                         parseFloat(r.rs) >= DESIRED_VALUES.railSeat) ? 'Pass' : 'Fail',
                isPass: parseFloat(r.ct) >= DESIRED_VALUES.centreTop && 
                        parseFloat(r.cb) >= DESIRED_VALUES.centreBottom && 
                        parseFloat(r.rs) >= DESIRED_VALUES.railSeat
            }));

            await saveMorTestResults(batch.id, payload);
            alert(`MR Test results saved as ${resultsData.result}!`);
            setShowTestModal(false);
            fetchActive();
            fetchHistorical();
        } catch (error) {
            console.error("Error saving MR test results:", error);
            alert("Failed to save MR test results.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'declaration') fetchPending();
        if (activeTab === 'testing') fetchActive();
        if (activeTab === 'historical') fetchHistorical();
    }, [activeTab, currentUserId]);

    const historicalList = useMemo(() => historicalRecords, [historicalRecords]);

    const columnsDeclaration = [
        { key: 'batchNumber', label: 'Batch Number' },
        { key: 'shift', label: 'Shift' },
        { key: 'lineNo', label: 'Line No' },
        { key: 'concreteGrade', label: 'Sleeper Type / Grade' },
        { key: 'castingDate', label: 'Date of Casting' },
        {
            key: 'waterCubeStatus',
            label: 'Water Cube Testing',
            render: () => (
                <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                    background: '#ecfdf5',
                    color: '#059669'
                }}>
                    Completed
                </span>
            )
        },
        { key: 'mrSamplesRequired', label: 'Samples to Test' },
        { key: 'mrTestType', label: 'MR Test Type' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    onClick={() => { setSelectedBatch(row); setShowDeclareModal(true); }}
                >
                    Declare Samples
                </button>
            )
        }
    ];

    const columnsTesting = [
        { key: 'batchNumber', label: 'Batch Number' },
        { key: 'shift', label: 'Shift' },
        { key: 'lineNo', label: 'Line No' },
        { key: 'concreteGrade', label: 'Sleeper Type / Grade' },
        {
            key: 'details',
            label: 'Sleeper Number',
            render: (val) => val?.map(s => `${s.benchNumber}${s.sleeperNo}`).join(', ')
        },
        { key: 'castingDate', label: 'Date of Casting' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const canModify = (new Date() - new Date(row.createdDate)) < (60 * 60 * 1000);
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {canModify && (
                            <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => { setSelectedBatch(row); setShowDeclareModal(true); }}>Modify</button>
                        )}
                        <button className="btn-verify" onClick={() => { setSelectedBatch(row); setShowTestModal(true); }}>Enter Test Details</button>
                        <button className="btn-save" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDelete(row.id)}>Delete</button>
                    </div>
                );
            }
        }
    ];

    const columnsHistorical = [
        { key: 'batchNumber', label: 'Batch Number' },
        { key: 'concreteGrade', label: 'Sleeper Type / Grade' },
        {
            key: 'details',
            label: 'Sleeper Number',
            render: (val) => val?.map(s => `${s.benchNumber}${s.sleeperNo}`).join(', ')
        },
        { key: 'castingDate', label: 'Date of Casting' },
        { key: 'createdDate', label: 'Date of Testing', render: (val) => val?.split('T')[0] },
        {
            key: 'overallResult',
            label: 'Result',
            render: (val) => (
                <span style={{ fontWeight: '700', color: val === 'Pass' ? '#059669' : '#dc2626' }}>{val || 'N/A'}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button className="btn-save" style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', fontSize: '10px' }} onClick={() => handleDelete(row.id)}>Delete</button>
            )
        }
    ];

    return (
        <div className="mr-module cement-forms-scope">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Moment of Resistance (Final Inspection)</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Structural integrity testing for concrete sleepers</p>
            </header>

            <div className="nav-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <button className={`nav-tab ${activeTab === 'declaration' ? 'active' : ''}`} onClick={() => setActiveTab('declaration')}>Sample Declaration</button>
                <button className={`nav-tab ${activeTab === 'testing' ? 'active' : ''}`} onClick={() => setActiveTab('testing')}>Enter Test Results</button>
                <button className={`nav-tab ${activeTab === 'historical' ? 'active' : ''}`} onClick={() => setActiveTab('historical')}>Historical Records</button>
            </div>

            <div className="tab-content">
                {activeTab === 'declaration' && (
                    <div className="section-card">
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Pending MR Sample Declaration</h4>
                        </div>
                        <EnhancedDataTable columns={columnsDeclaration} data={pendingDeclarations} loading={loading} />
                    </div>
                )}
                {activeTab === 'testing' && (
                    <div className="section-card">
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Samples Declared (Pending Testing)</h4>
                        </div>
                        <EnhancedDataTable columns={columnsTesting} data={activeDeclarations} loading={loading} />
                    </div>
                )}
                {activeTab === 'historical' && (
                    <div className="section-card">
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Recent Testing Results</h4>
                        </div>
                        <EnhancedDataTable columns={columnsHistorical} data={historicalRecords} loading={loading} />
                    </div>
                )}
            </div>

            {showDeclareModal && (
                <DeclareSampleModal
                    batch={selectedBatch}
                    onClose={() => setShowDeclareModal(false)}
                    onSave={handleDeclareSamples}
                />
            )}

            {showTestModal && (
                <TestDetailsModal
                    batch={selectedBatch}
                    onClose={() => setShowTestModal(false)}
                    onSave={handleSaveTestResults}
                />
            )}
        </div>
    );
};

const DeclareSampleModal = ({ batch, onClose, onSave }) => {
    const [samples, setSamples] = useState(
        Array.from({ length: batch.mrSamplesRequired || 1 }, () => ({ bench: '', no: '' }))
    );

    const handleUpdate = (idx, field, val) => {
        const updated = [...samples];
        updated[idx][field] = val;
        setSamples(updated);
    };

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Declare Sleeper Sample for MR Testing</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <div className="form-grid">
                            <div className="input-group"><label>Batch</label><input readOnly value={batch?.batchNumber} className="readOnly" /></div>
                            <div className="input-group"><label>Sleeper Type</label><input readOnly value={batch?.concreteGrade} className="readOnly" /></div>
                        </div>
                    </div>

                    <h4 style={{ fontSize: '13px', color: '#42818c', marginBottom: '16px', fontWeight: '700' }}>Enter Sleeper Details ({batch.mrSamplesRequired} needed)</h4>

                    {samples.map((s, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div className="input-group">
                                <label>Bench Number</label>
                                <input type="number" value={s.bench} onChange={(e) => handleUpdate(idx, 'bench', e.target.value)} placeholder="e.g. 201" />
                            </div>
                            <div className="input-group">
                                <label>Sleeper No.</label>
                                <select value={s.no} onChange={(e) => handleUpdate(idx, 'no', e.target.value)}>
                                    <option value="">Select No.</option>
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => {
                            if (samples.some(s => !s.bench || !s.no)) {
                                alert("Please provide both Bench Number and Sleeper Number for all samples.");
                                return;
                            }
                            onSave(batch, samples);
                        }}>Save Declaration</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TestDetailsModal = ({ batch, onClose, onSave }) => {
    const [manualResults, setManualResults] = useState(
        batch.details?.map(s => ({ ...s, ct: '', cb: '', rs: '', weight: '', remarks: '', date: new Date().toISOString().split('T')[0] })) || []
    );
    const [witnessed, setWitnessed] = useState(batch.details?.map(() => false) || []);

    const mockScadaData = useMemo(() => {
        return batch.details?.map(() => ({
            ct: Math.floor(460 + Math.random() * 100),
            cb: Math.floor(560 + Math.random() * 100),
            rs: Math.floor(660 + Math.random() * 100)
        })) || [];
    }, [batch]);

    const handleWitness = (idx) => {
        const updatedManual = [...manualResults];
        updatedManual[idx] = { ...updatedManual[idx], ct: mockScadaData[idx].ct, cb: mockScadaData[idx].cb, rs: mockScadaData[idx].rs };
        setManualResults(updatedManual);

        const updatedWitnessed = [...witnessed];
        updatedWitnessed[idx] = true;
        setWitnessed(updatedWitnessed);
    };

    const handleUpdateManual = (idx, field, val) => {
        if (witnessed[idx]) return;
        const updated = [...manualResults];
        updated[idx][field] = val;
        setManualResults(updated);
    };

    const calculateResult = () => {
        const results = manualResults.map(r => {
            const pass = r.ct >= DESIRED_VALUES.centreTop && r.cb >= DESIRED_VALUES.centreBottom && r.rs >= DESIRED_VALUES.railSeat;
            return pass;
        });

        if (batch.mrTestType === 'Fresh') {
            if (manualResults.length === 1) {
                return results[0] ? 'Pass' : 'Retest';
            } else {
                return results.every(r => r) ? 'Pass' : 'Fail';
            }
        } else { // Retest
            return results.every(r => r) ? 'Pass' : 'Fail';
        }
    };

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter MR Test Details - Batch {batch.batchNumber}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {/* Section 1: Sample Details */}
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <div className="form-grid">
                            <div className="input-group"><label>Batch</label><input readOnly value={batch?.batchNumber} className="readOnly" /></div>
                            <div className="input-group"><label>Sleeper Type</label><input readOnly value={batch?.concreteGrade} className="readOnly" /></div>
                            <div className="input-group"><label>Casting Date</label><input readOnly value={batch?.castingDate} className="readOnly" /></div>
                        </div>
                    </div>

                    {/* Section 2 & 3: SCADA & Manual Entry */}
                    {manualResults.map((res, idx) => (
                        <div key={idx} style={{ marginBottom: '24px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, color: '#42818c' }}>Test for Sleeper: {res.benchNumber}{res.sleeperNo}</h4>
                                <button className="btn-verify" style={{ fontSize: '11px' }} onClick={() => handleWitness(idx)}>Witness through SCADA</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* SCADA View */}
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>MR SCADA DATA</span>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
                                        <div><div style={{ fontSize: '9px' }}>CT</div><div style={{ fontWeight: '700' }}>{mockScadaData[idx].ct}</div></div>
                                        <div><div style={{ fontSize: '9px' }}>CB</div><div style={{ fontWeight: '700' }}>{mockScadaData[idx].cb}</div></div>
                                        <div><div style={{ fontSize: '9px' }}>RS</div><div style={{ fontWeight: '700' }}>{mockScadaData[idx].rs}</div></div>
                                    </div>
                                </div>

                                {/* Manual Form */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <div className="input-group">
                                        <label>CT (KN)</label>
                                        <input type="number" readOnly={witnessed[idx]} value={res.ct} onChange={(e) => handleUpdateManual(idx, 'ct', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>CB (KN)</label>
                                        <input type="number" readOnly={witnessed[idx]} value={res.cb} onChange={(e) => handleUpdateManual(idx, 'cb', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>RS (KN)</label>
                                        <input type="number" readOnly={witnessed[idx]} value={res.rs} onChange={(e) => handleUpdateManual(idx, 'rs', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Weight (kg)</label>
                                        <input type="number" value={res.weight} onChange={(e) => handleUpdateManual(idx, 'weight', e.target.value)} />
                                    </div>
                                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Remarks</label>
                                        <input type="text" value={res.remarks} onChange={(e) => handleUpdateManual(idx, 'remarks', e.target.value)} placeholder="Optional" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => onSave(batch, { results: manualResults, result: calculateResult() })}>Confirm results: {calculateResult()}</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomentOfResistance;

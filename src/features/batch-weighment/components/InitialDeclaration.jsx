import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { apiService } from '../../../services/api';

/**
 * InitialDeclaration Component
 * Configures sensors and batch set values for the shift.
 */
const InitialDeclaration = ({ batches: externalBatches, onBatchUpdate, onSensorUpdate, activeContainer, loadShiftData, initialSensors }) => {
    const [sensors, setSensors] = useState(initialSensors || {
        sensorStatus: 'working', // 'working', 'notAvailable', 'notWorking'
        sandType: ''
    });

    const [batches, setBatches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [lastFiveMoisture, setLastFiveMoisture] = useState([]);
    const [selectedMoistureReportId, setSelectedMoistureReportId] = useState('');
    const [fetchingMoistureDetail, setFetchingMoistureDetail] = useState(false);

    // Fetch last five moisture reports on mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await apiService.getLastFiveMoisture();
                if (res?.responseData) {
                    setLastFiveMoisture(res.responseData);
                }
            } catch (err) {
                console.error("Failed to fetch last 5 moisture reports:", err);
            }
        };
        fetchReports();
    }, []);

    // Handle Moisture Report Selection
    const handleMoistureReportSelect = async (e) => {
        const id = e.target.value;
        setSelectedMoistureReportId(id);
        if (!id) {
            setBatches([]);
            return;
        }

        const report = lastFiveMoisture.find(r => String(r.id) === String(id));
        
        setFetchingMoistureDetail(true);
        try {
            const res = await apiService.getMoistureAnalysisById(id);
            if (res?.responseData) {
                const detail = res.responseData;
                
                // Initialize/Update the batch card for this specific report
                setBatches([{
                    id: 1, 
                    batchNo: detail.batchNo || report?.batchNo || "",
                    parentId: id,
                    setValues: { ca1: 0, ca2: 0, fa: 0, cement: 0, water: 0, admixture: 0 },
                    adjustedWeights: { 
                        ca1: detail.ca1AdjWeight || 436.2, 
                        ca2: detail.ca2AdjWeight || 178.6, 
                        fa: detail.faAdjWeight || 207.1, 
                        cement: detail.cementWeight || 175.5, 
                        water: detail.waterWeight || 37.0, 
                        admixture: detail.admixtureWeight || 1.440 
                    },
                    proportionMatch: 'NOT OK'
                }]);
            }
        } catch (err) {
            console.error("Failed to fetch moisture details:", err);
        } finally {
            setFetchingMoistureDetail(false);
        }
    };

    // Only sync external batches if they match the selected lab report context
    useEffect(() => {
        if (externalBatches && externalBatches.length > 0 && lastFiveMoisture.length > 0) {
            const match = lastFiveMoisture.find(r => String(r.batchNo) === String(externalBatches[0].batchNo));
            if (match && !selectedMoistureReportId) {
                setSelectedMoistureReportId(match.id);
                setBatches(externalBatches);
            }
        }
    }, [externalBatches, lastFiveMoisture, selectedMoistureReportId]);

    const handleSensorChange = (e) => {
        const { name, value, type } = e.target;
        setSensors(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBatchChange = (id, section, field, value) => {
        setBatches(prev => prev.map(batch => {
            if (batch.id === id) {
                const updatedBatch = { ...batch };
                if (section === 'batchNo') {
                    updatedBatch.batchNo = value;
                } else if (section === 'setValues') {
                    updatedBatch.setValues = { ...batch.setValues, [field]: parseFloat(value) || 0 };
                }

                const isMatch = Object.keys(updatedBatch.setValues).every(ing => {
                    const setVal = updatedBatch.setValues[ing];
                    const adjVal = updatedBatch.adjustedWeights[ing];
                    return adjVal > 0 ? (Math.abs(setVal - adjVal) / adjVal <= 0.01) : (setVal === 0);
                });
                updatedBatch.proportionMatch = isMatch ? 'OK' : 'NOT OK';
                return updatedBatch;
            }
            return batch;
        }));
    };

    const removeBatch = (id) => {
        setBatches([]);
        setSelectedMoistureReportId('');
    };

    const handleSaveDeclaration = async () => {
        if (batches.length === 0 || !selectedMoistureReportId) {
            alert("No Batch Selected. Please select a Batch Number from the dropdown above to start configuration.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                lineNo: activeContainer?.name || "Line I",
                entryDate: new Date().toLocaleDateString('en-GB'),
                sandType: sensors.sandType || "River Sand",
                moistureSensorStatus: String(sensors.sensorStatus || "WORKING").toUpperCase(),
                verifiedBy: "Operator",
                remarks: "Initial declaration",
                entryMode: "MANUAL",
                createdBy: parseInt(localStorage.getItem('userId') || '118', 10),
                updatedBy: parseInt(localStorage.getItem('userId') || '118', 10),
                batchDetails: batches.map(b => ({
                    batchNo: String(b.batchNo || "0"),
                    proportionStatus: b.proportionMatch || "OK",
                    ca1Ref: parseFloat(b.adjustedWeights?.ca1) || 0,
                    ca2Ref: parseFloat(b.adjustedWeights?.ca2) || 0,
                    faRef: parseFloat(b.adjustedWeights?.fa) || 0,
                    cementRef: parseFloat(b.adjustedWeights?.cement) || 0,
                    waterRef: parseFloat(b.adjustedWeights?.water) || 0,
                    admixtureRef: parseFloat(b.adjustedWeights?.admixture) || 0,
                    ca1Set: parseFloat(b.setValues?.ca1) || 0,
                    ca2Set: parseFloat(b.setValues?.ca2) || 0,
                    faSet: parseFloat(b.setValues?.fa) || 0,
                    cementSet: parseFloat(b.setValues?.cement) || 0,
                    waterSet: parseFloat(b.setValues?.water) || 0,
                    admixtureSet: parseFloat(b.setValues?.admixture) || 0
                })),
                scadaRecords: [],
                manualRecords: []
            };

            const existingId = batches.find(b => b.parentId)?.parentId;

            if (existingId) {
                await apiService.updateBatchWeighment(existingId, payload);
            } else {
                await apiService.createBatchWeighment(payload);
            }

            if (loadShiftData) loadShiftData().catch(() => { });
            alert("Declaration deployed successfully!");
            if (onBatchUpdate) onBatchUpdate(batches);

        } catch (error) {
            console.error("Save error:", error);
            alert(`Failed to save to backend: ${error.message}. Data preserved in local session.`);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            onBatchUpdate(batches);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [batches, onBatchUpdate]);

    useEffect(() => {
        if (onSensorUpdate) {
            onSensorUpdate(sensors);
        }
    }, [sensors, onSensorUpdate]);

    return (
        <div className="declaration-flow">
            <div className="form-section-header">
                <h4>Sensor & Lab Integration</h4>
            </div>

            <div className="form-grid" style={{ marginBottom: '2rem' }}>
                <div className="form-field">
                    <label>Moisture Sensor Status</label>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="sensorStatus"
                                value="working"
                                checked={sensors.sensorStatus === 'working'}
                                onChange={handleSensorChange}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                            />
                            <span style={{ color: '#059669', fontWeight: '600' }}>Working</span>
                        </label>
                        <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="sensorStatus"
                                value="notAvailable"
                                checked={sensors.sensorStatus === 'notAvailable'}
                                onChange={handleSensorChange}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                            />
                            <span style={{ color: '#64748b', fontWeight: '600' }}>Not Available</span>
                        </label>
                        <label className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="sensorStatus"
                                value="notWorking"
                                checked={sensors.sensorStatus === 'notWorking'}
                                onChange={handleSensorChange}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                            />
                            <span style={{ color: '#d97706', fontWeight: '600' }}>Not Working</span>
                        </label>
                    </div>
                </div>

                <div className="form-field">
                    <label>Sand Type</label>
                    <select name="sandType" value={sensors.sandType} onChange={handleSensorChange}>
                        <option value="">-- Select Sand Type --</option>
                        <option value="M-Sand">M-Sand</option>
                        <option value="Natural Sand">Natural Sand</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Select Batch (From Last 5 Lab Reports) <span className="required">*</span> {fetchingMoistureDetail && <span style={{ fontSize: '0.65rem', color: '#42818c' }}>(Fetching Detail...)</span>}</label>
                    <select 
                        value={selectedMoistureReportId} 
                        onChange={handleMoistureReportSelect}
                        style={{ 
                            border: (selectedMoistureReportId ? '1px solid #42818c' : '2px solid #ef4444'),
                            background: (selectedMoistureReportId ? '#eff6f7' : '#fef2f2'),
                            fontWeight: '700'
                        }}
                    >
                        <option value="">-- Choose Batch No --</option>
                        {lastFiveMoisture.map(report => (
                            <option key={report.id} value={report.id}>
                                Batch #{report.batchNo} ({report.entryDate})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {(!selectedMoistureReportId || batches.length === 0) && !fetchingMoistureDetail && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}>📊</div>
                    <h5 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '1.1rem', fontWeight: '800' }}>No Batch Selected</h5>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Please select a Batch Number from the dropdown above to start configuration.</p>
                </div>
            )}

            {batches.map((batch) => (
                <div key={batch.id} className="batch-card fade-in" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: '#42818c', color: 'white', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                                <span style={{ margin: 'auto' }}>{batch.batchNo.slice(-1) || 'B'}</span>
                            </div>
                            <div>
                                <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>Batch Configuration: #{batch.batchNo}</h5>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>Verified and Adjusted from Lab Analysis</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="mini-label">Status</div>
                                <div style={{
                                    fontSize: '0.65rem', fontWeight: '800', padding: '4px 12px', borderRadius: '50px',
                                    border: `1px solid ${batch.proportionMatch === 'OK' ? '#059669' : '#dc2626'}`,
                                    color: batch.proportionMatch === 'OK' ? '#059669' : '#dc2626',
                                    background: batch.proportionMatch === 'OK' ? '#f0fdf4' : '#fef2f2'
                                }}>{batch.proportionMatch}</div>
                            </div>
                            <button className="toggle-btn secondary" onClick={() => removeBatch(batch.id)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Clear Selection</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f0f9fa', borderRadius: '8px', fontSize: '0.8rem', color: '#42818c', border: '1px solid #c8e2e6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#42818c' }}></div>
                        <strong>Active Calibration:</strong> Lab Report #{lastFiveMoisture.find(r => String(r.id) === String(selectedMoistureReportId))?.batchNo}
                    </div>

                    <div className="calculated-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                        {Object.keys(batch.setValues).map(ing => {
                            const setVal = batch.setValues[ing];
                            const adjVal = batch.adjustedWeights[ing];
                            const deviation = adjVal > 0 ? (Math.abs(setVal - adjVal) / adjVal * 100) : 0;
                            const isError = deviation > 1;

                            return (
                                <div key={ing} className="calc-card" style={{ padding: '0.75rem', border: isError ? '1px solid #fee2e2' : '1px solid #e2e8f0', background: isError ? '#fff5f5' : '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span className="calc-label" style={{ textTransform: 'uppercase' }}>{ing}</span>
                                        {isError && <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: '800' }}>MISMATCH ({deviation.toFixed(1)}%)</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div className="mini-label">SET (Manual)</div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={batch.setValues[ing]}
                                                onChange={e => handleBatchChange(batch.id, 'setValues', ing, e.target.value)}
                                                style={{ borderColor: isError ? '#ef4444' : '#cbd5e1' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="mini-label">ADJ (Ref)</div>
                                            <div className="calc-value" style={{ height: '32px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', padding: '0 8px', borderRadius: '6px', background: '#f8fafc' }}>{batch.adjustedWeights[ing]}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="form-actions-center" style={{ marginTop: '2.5rem', flexWrap: 'wrap', gap: '12px' }}>
                <button className="toggle-btn" style={{ flex: '1 1 180px' , height: '48px', maxWidth: '300px' }} onClick={handleSaveDeclaration} disabled={saving}>{saving ? 'Saving...' : 'Deploy Configuration'}</button>
            </div>
        </div>
    );
};

export default InitialDeclaration;

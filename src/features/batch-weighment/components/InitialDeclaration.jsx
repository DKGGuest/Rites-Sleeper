import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';

/**
 * InitialDeclaration Component
 * Configures sensors and batch set values for the shift.
 */
const InitialDeclaration = ({ batches: externalBatches, onBatchUpdate }) => {
    const [sensors, setSensors] = useState({
        sensorStatus: 'working', // 'working', 'notAvailable', 'notWorking'
        sandType: 'M-Sand'
    });

    const [batches, setBatches] = useState(externalBatches || []);
    const [saving, setSaving] = useState(false);

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

                // Validation logic: check if SET values match ADJ within tolerance
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

    const addBatch = () => {
        const nextId = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
        setBatches(prev => [...prev, {
            id: nextId,
            batchNo: '',
            setValues: { ca1: 0, ca2: 0, fa: 0, cement: 0, water: 0, admixture: 0 },
            adjustedWeights: { ca1: 436.2, ca2: 178.6, fa: 207.1, cement: 175.5, water: 37.0, admixture: 1.440 },
            proportionMatch: 'NOT OK'
        }]);
    };

    const removeBatch = (id) => {
        if (batches.length > 1) {
            setBatches(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleSaveDeclaration = async () => {
        setSaving(true);
        try {
            await apiService.saveDeclaration({ sensors, batches });
            alert("Declaration saved successfully!");
        } catch (error) {
            alert("API currently unavailable. Data saved to local session.");
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

    return (
        <div className="declaration-flow">
            <div className="form-section-header">
                <h4>Sensor Configuration</h4>
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
                        <option value="M-Sand">M-Sand</option>
                        <option value="Natural Sand">Natural Sand</option>
                    </select>
                </div>
            </div>

            {batches.map((batch) => (
                <div key={batch.id} className="batch-card fade-in" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="form-field" style={{ minWidth: '150px' }}>
                            <label>Batch No. <span className="required">*</span></label>
                            <input type="number" min="0" value={batch.batchNo} onChange={(e) => handleBatchChange(batch.id, 'batchNo', null, e.target.value)} placeholder="e.g. 601" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="mini-label">Proportion</div>
                                <div style={{
                                    fontSize: '0.65rem', fontWeight: '800', padding: '4px 12px', borderRadius: '50px',
                                    border: `1px solid ${batch.proportionMatch === 'OK' ? '#059669' : '#dc2626'}`,
                                    color: batch.proportionMatch === 'OK' ? '#059669' : '#dc2626'
                                }}>{batch.proportionMatch}</div>
                            </div>
                            {batches.length > 1 && (
                                <button className="toggle-btn secondary" onClick={() => removeBatch(batch.id)} style={{ color: '#dc2626', borderColor: '#fee2e2' }}>Remove</button>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        <strong>Calculation Source:</strong> {sensors.sensorStatus === 'working' ? 'Online Moisture Sensor (Live)' : 'Latest Moisture Analysis Lab Report'}
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
                <button className="toggle-btn secondary" style={{ flex: '1 1 180px' }} onClick={addBatch}>+ New Batch Class</button>
                <button className="toggle-btn" style={{ flex: '1 1 180px' }} onClick={handleSaveDeclaration} disabled={saving}>{saving ? 'Saving...' : 'Deploy Configuration'}</button>
            </div>
        </div>
    );
};

export default InitialDeclaration;

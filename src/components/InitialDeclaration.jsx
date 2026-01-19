import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const InitialDeclaration = ({ batches: externalBatches, onBatchUpdate }) => {
    const [sensors, setSensors] = useState({
        notAvailable: false,
        notWorking: false,
        sandType: 'M-Sand'
    });

    const [batches, setBatches] = useState(externalBatches || []);
    const [saving, setSaving] = useState(false);

    const handleSensorChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSensors(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBatchChange = (id, section, field, value) => {
        setBatches(prev => prev.map(batch => {
            if (batch.id === id) {
                const updatedBatch = { ...batch };

                if (section === 'batchNo') {
                    updatedBatch.batchNo = value;
                } else if (section === 'setValues') {
                    const floatVal = parseFloat(value) || 0;
                    updatedBatch.setValues = { ...batch.setValues, [field]: floatVal };
                }

                // Logic check for proportion
                const ingredients = Object.keys(updatedBatch.setValues);
                let isMatch = true;
                for (const ing of ingredients) {
                    const setVal = updatedBatch.setValues[ing];
                    const adjVal = updatedBatch.adjustedWeights[ing];
                    if (adjVal > 0) {
                        const diff = Math.abs(setVal - adjVal) / adjVal;
                        if (diff > 0.01) { isMatch = false; break; }
                    } else if (setVal > 0) { isMatch = false; break; }
                }
                updatedBatch.proportionMatch = isMatch ? 'OK' : 'NOT OK';
                return updatedBatch;
            }
            return batch;
        }));
    };

    const addBatch = () => {
        const nextId = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
        setBatches([...batches, {
            id: nextId,
            batchNo: '',
            setValues: { ca1: 0, ca2: 0, fa: 0, cement: 0, water: 0, admixture: 0 },
            adjustedWeights: { ca1: 436.2, ca2: 178.6, fa: 207.1, cement: 175.5, water: 37.0, admixture: 1.440 },
            proportionMatch: 'NOT OK'
        }]);
    };

    const handleSaveDeclaration = async () => {
        setSaving(true);
        try {
            await apiService.saveDeclaration({ sensors, batches });
            alert("Configuration saved successfully!");
        } catch (error) {
            console.warn("API Offline, configuration not saved to database.");
            alert("Note: API is offline. Changes are updated locally but not saved to the database.");
        }
        setSaving(false);
    };

    useEffect(() => {
        onBatchUpdate(batches);
    }, [batches]);

    return (
        <div className="declaration-flow">
            <div className="form-section-header">
                <h3>Moisture Sensor Configuration</h3>
            </div>

            <div className="form-grid">
                <div className="form-field">
                    <label>Moisture Sensor Status</label>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                            <input type="checkbox" name="notAvailable" checked={sensors.notAvailable} onChange={handleSensorChange} />
                            Not Available
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                            <input type="checkbox" name="notWorking" checked={sensors.notWorking} onChange={handleSensorChange} />
                            Not Working
                        </label>
                    </div>
                    <span className="helper-text">Check if physical sensors are bypassed</span>
                </div>
                <div className="form-field">
                    <label>Type of Sand <span className="required">*</span></label>
                    <select name="sandType" value={sensors.sandType} onChange={handleSensorChange}>
                        <option value="M-Sand">M-Sand</option>
                        <option value="Natural Sand">Natural Sand</option>
                    </select>
                    <span className="helper-text">Primary fine aggregate source</span>
                </div>
            </div>

            {batches.map((batch) => (
                <div key={batch.id} className="batch-entry-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
                    <div className="batch-header-row">
                        <div className="form-field">
                            <label>Batch Number <span className="required">*</span></label>
                            <input
                                type="number"
                                value={batch.batchNo}
                                onChange={(e) => handleBatchChange(batch.id, 'batchNo', null, e.target.value)}
                                placeholder="e.g. 601"
                            />
                        </div>
                        <div className="status-container">
                            <span className="calc-label">Proportion Status</span>
                            <span style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                background: batch.proportionMatch === 'OK' ? '#f0fdf4' : '#fef2f2',
                                color: batch.proportionMatch === 'OK' ? '#166534' : '#991b1b',
                                border: `1px solid ${batch.proportionMatch === 'OK' ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                {batch.proportionMatch}
                            </span>
                        </div>
                    </div>

                    <div className="calculated-section">
                        <span className="calculated-title">Mix Weights (KGs / Litres)</span>
                        <div className="calculated-grid">
                            <div className="calc-card">
                                <span className="calc-label">CA 1 (20MM)</span>
                                <div className="calc-inputs-row">
                                    <div style={{ flex: 1 }}>
                                        <span className="mini-label">SET</span>
                                        <input type="number" step="0.01" value={batch.setValues.ca1} onChange={e => handleBatchChange(batch.id, 'setValues', 'ca1', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="mini-label">ADJ</span>
                                        <div className="calc-value">{batch.adjustedWeights.ca1}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="calc-card">
                                <span className="calc-label">CA 2 (10MM)</span>
                                <div className="calc-inputs-row">
                                    <div style={{ flex: 1 }}>
                                        <span className="mini-label">SET</span>
                                        <input type="number" step="0.01" value={batch.setValues.ca2} onChange={e => handleBatchChange(batch.id, 'setValues', 'ca2', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="mini-label">ADJ</span>
                                        <div className="calc-value">{batch.adjustedWeights.ca2}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="calc-card">
                                <span className="calc-label">Fine Aggregate</span>
                                <div className="calc-inputs-row">
                                    <div style={{ flex: 1 }}>
                                        <span className="mini-label">SET</span>
                                        <input type="number" step="0.01" value={batch.setValues.fa} onChange={e => handleBatchChange(batch.id, 'setValues', 'fa', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="mini-label">ADJ</span>
                                        <div className="calc-value">{batch.adjustedWeights.fa}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="calculated-grid second-row">
                            <div className="calc-card">
                                <span className="calc-label">Cement</span>
                                <div className="calc-inputs-row">
                                    <div style={{ flex: 1 }}>
                                        <span className="mini-label">SET</span>
                                        <input type="number" step="0.01" value={batch.setValues.cement} onChange={e => handleBatchChange(batch.id, 'setValues', 'cement', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="mini-label">ADJ</span>
                                        <div className="calc-value">{batch.adjustedWeights.cement}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="calc-card">
                                <span className="calc-label">Water</span>
                                <div className="calc-inputs-row">
                                    <div style={{ flex: 1 }}>
                                        <span className="mini-label">SET</span>
                                        <input type="number" step="0.01" value={batch.setValues.water} onChange={e => handleBatchChange(batch.id, 'setValues', 'water', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="mini-label">ADJ</span>
                                        <div className="calc-value">{batch.adjustedWeights.water}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="calc-card">
                                <span className="calc-label">Admixture</span>
                                <div className="calc-inputs-row">
                                    <div style={{ flex: 1 }}>
                                        <span className="mini-label">SET</span>
                                        <input type="number" step="0.01" value={batch.setValues.admixture} onChange={e => handleBatchChange(batch.id, 'setValues', 'admixture', e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <span className="mini-label">ADJ</span>
                                        <div className="calc-value">{batch.adjustedWeights.admixture}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="declaration-actions">
                <button className="toggle-btn secondary" onClick={addBatch}>+ Add New Batch Definition</button>
                <button className="toggle-btn" onClick={handleSaveDeclaration} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};

export default InitialDeclaration;

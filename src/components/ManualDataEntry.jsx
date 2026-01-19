import React, { useState } from 'react';
import { apiService } from '../services/api';

const ManualDataEntry = ({ batches, witnessedRecords, onSave }) => {
    const defaultFormData = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: batches[0]?.batchNo || '',
        ca1: '', ca2: '', fa: '', cement: '', water: '', admixture: ''
    };

    const [formData, setFormData] = useState(defaultFormData);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (record) => {
        setFormData({
            time: record.time,
            batchNo: record.batchNo,
            ca1: record.ca1,
            ca2: record.ca2,
            fa: record.fa,
            cement: record.cement,
            water: record.water,
            admixture: record.admixture
        });
        setEditingId(record.id);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async () => {
        setSaving(true);
        const record = {
            ...formData,
            id: editingId || Date.now(),
            source: editingId ? (witnessedRecords.find(r => r.id === editingId)?.source || 'Manual Entry') : 'Manual Entry'
        };

        try {
            await apiService.saveWitnessRecord(record);
        } catch (error) {
            console.warn("API Offline, storing locally.");
        }

        onSave(record);
        setFormData(defaultFormData);
        setEditingId(null);
        setSaving(false);
        alert(editingId ? "Record updated successfully!" : "Entry saved successfully!");
    };

    return (
        <div className="manual-entry-form">
            <div className="form-grid">
                <div className="form-field">
                    <label>Time <span className="required">*</span></label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>Batch No. <span className="required">*</span></label>
                    <select name="batchNo" value={formData.batchNo} onChange={handleChange}>
                        {batches.map(b => (
                            <option key={b.id} value={b.batchNo}>{b.batchNo}</option>
                        ))}
                    </select>
                </div>
                <div className="form-field">
                    <label>Actual CA1 (20mm)</label>
                    <input type="number" name="ca1" value={formData.ca1} onChange={handleChange} placeholder="Kgs" />
                </div>
                <div className="form-field">
                    <label>Actual CA2 (10mm)</label>
                    <input type="number" name="ca2" value={formData.ca2} onChange={handleChange} placeholder="Kgs" />
                </div>
                <div className="form-field">
                    <label>Actual FA (Sand)</label>
                    <input type="number" name="fa" value={formData.fa} onChange={handleChange} placeholder="Kgs" />
                </div>
                <div className="form-field">
                    <label>Actual Cement</label>
                    <input type="number" name="cement" value={formData.cement} onChange={handleChange} placeholder="Kgs" />
                </div>
                <div className="form-field">
                    <label>Actual Water</label>
                    <input type="number" name="water" value={formData.water} onChange={handleChange} placeholder="Ltrs" />
                </div>
                <div className="form-field">
                    <label>Actual Admixture</label>
                    <input type="number" name="admixture" value={formData.admixture} onChange={handleChange} placeholder="Kgs" />
                </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {editingId && (
                    <button className="toggle-btn secondary" onClick={() => { setFormData(defaultFormData); setEditingId(null); }}>Cancel Edit</button>
                )}
                <button className="toggle-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Manual Entry'}
                </button>
            </div>

            <div className="data-table-section" style={{ marginTop: '2.5rem' }}>
                <div className="table-title-bar">Witnessed & Manual Logs</div>
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Batch</th>
                            <th>Source</th>
                            <th>Cement</th>
                            <th>Water</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {witnessedRecords.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No witnessed records yet.</td></tr>
                        ) : (
                            witnessedRecords.map(r => (
                                <tr key={r.id}>
                                    <td data-label="Time">{r.time}</td>
                                    <td data-label="Batch">{r.batchNo || r.batch}</td>
                                    <td data-label="Source">{r.source}</td>
                                    <td data-label="Cement">{r.cement}</td>
                                    <td data-label="Water">{r.water}</td>
                                    <td data-label="Actions">
                                        {r.source === 'Manual Entry' || r.source === 'Manual' ? (
                                            <button
                                                className="toggle-btn"
                                                style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                                                onClick={() => handleEdit(r)}
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>Verified</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManualDataEntry;

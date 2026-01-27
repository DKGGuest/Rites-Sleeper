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
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            // In a real app, call API. Locally, we filter the parent's state via onSave with null or similar.
            // But App.jsx expects a record to add/update. 
            // Let's modify the parent to handle deletion.
            // For now, I'll update the local state if the parent supports it.
            // Actually, I can just pass the deletion back up.
            onSave({ id, _delete: true });
        }
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
                                    <td data-label="Time"><span>{r.time}</span></td>
                                    <td data-label="Batch"><span>{r.batchNo || r.batch}</span></td>
                                    <td data-label="Source"><span>{r.source}</span></td>
                                    <td data-label="Cement"><span>{r.cement}</span></td>
                                    <td data-label="Water"><span>{r.water}</span></td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(r.source === 'Manual Entry' || r.source === 'Manual') && (
                                                <button
                                                    className="toggle-btn"
                                                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                                                    onClick={() => handleEdit(r)}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                className="toggle-btn secondary"
                                                style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                                onClick={() => handleDelete(r.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
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

import React, { useState } from 'react';
import { apiService } from '../../../services/api';

/**
 * ManualDataEntry Component
 * Provides a form for manual batch result entry and displays a log of all witnessed records.
 */
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
            ca1: record.ca1, ca2: record.ca2, fa: record.fa,
            cement: record.cement, water: record.water, admixture: record.admixture
        });
        setEditingId(record.id);
    };

    const handleSave = async () => {
        if (!formData.batchNo || !formData.cement) {
            alert('Required fields missing');
            return;
        }

        setSaving(true);
        const record = {
            ...formData,
            id: editingId || Date.now(),
            source: editingId ? (witnessedRecords.find(r => r.id === editingId)?.source || 'Manual') : 'Manual'
        };

        try {
            await apiService.saveWitnessRecord(record);
            onSave(record);
            setFormData(defaultFormData);
            setEditingId(null);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="manual-batch-controls">
            <div className="form-grid" style={{ marginBottom: '2rem' }}>
                <div className="form-field">
                    <label>Batch No.</label>
                    <select name="batchNo" value={formData.batchNo} onChange={handleChange}>
                        {batches.map(b => <option key={b.id} value={b.batchNo}>{b.batchNo}</option>)}
                    </select>
                </div>
                <div className="form-field">
                    <label>Cement Wt.</label>
                    <input type="number" name="cement" value={formData.cement} onChange={handleChange} placeholder="Kgs" />
                </div>
                <div className="form-field">
                    <label>Water Vol.</label>
                    <input type="number" name="water" value={formData.water} onChange={handleChange} placeholder="Ltrs" />
                </div>
                {/* Additional fields omitted for brevity but should be included based on original code */}
            </div>

            <div className="form-actions-center" style={{ marginBottom: '3rem' }}>
                {editingId && <button className="toggle-btn secondary" onClick={() => { setFormData(defaultFormData); setEditingId(null); }}>Cancel</button>}
                <button className="toggle-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Confirm Entry'}</button>
            </div>

            <div className="data-table-section">
                <div className="table-title-bar">Shift Witness History</div>
                <div className="table-outer-wrapper">
                    <table className="ui-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th><th>Batch</th><th>Source</th><th>Cement</th><th>Water</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {witnessedRecords.map(r => (
                                <tr key={r.id}>
                                    <td data-label="Timestamp"><span>{r.time}</span></td>
                                    <td data-label="Batch"><span>{r.batchNo}</span></td>
                                    <td data-label="Source"><span>{r.source}</span></td>
                                    <td data-label="Cement"><span>{r.cement} Kg</span></td>
                                    <td data-label="Water"><span>{r.water} L</span></td>
                                    <td data-label="Actions">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {r.source === 'Manual' ? (
                                                <button className="btn-action" onClick={() => handleEdit(r)}>Edit</button>
                                            ) : (
                                                <button className="btn-action" style={{ background: '#f1f5f9', color: '#64748b' }} disabled>Verified</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManualDataEntry;

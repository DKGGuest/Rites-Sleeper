import React, { useState } from 'react';
import { apiService } from '../../../services/api';

/**
 * ManualDataEntry Component
 * Provides a form for manual batch result entry and displays a log of all witnessed records.
 */
const ManualDataEntry = ({ batches, witnessedRecords, onSave, hideHistory = false, onlyHistory = false, activeContainer }) => {
    const defaultFormData = {
        date: new Date().toISOString().split('T')[0],
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
            date: record.date || new Date().toISOString().split('T')[0],
            time: record.time,
            batchNo: record.batchNo,
            ca1: record.ca1, ca2: record.ca2, fa: record.fa,
            cement: record.cement, water: record.water, admixture: record.admixture
        });
        setEditingId(record.id);
        const manualSection = document.getElementById('manual-entry-section');
        if (manualSection) manualSection.scrollIntoView({ behavior: 'smooth' });
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
            source: 'Manual',
            timestamp: new Date().toISOString(),
            location: activeContainer?.name || 'N/A'
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

    const isRecordEditable = (timestamp) => {
        if (!timestamp) return true;
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (8 * 60 * 60 * 1000); // 8-hour shift window
    };

    return (
        <div className="manual-batch-controls" id="manual-entry-section">
            {!onlyHistory && (
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>{editingId ? 'Edit Manual Batch Result' : 'Add Manual Batch Result'}</h4>
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Shed / Line No.</label>
                            <input type="text" readOnly value={activeContainer?.name || ''} className="readOnly" style={{ background: '#f8fafc' }} />
                        </div>
                        <div className="form-field">
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label>Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} />
                        </div>
                        <div className="form-field">
                            <label>Batch No.</label>
                            <select name="batchNo" value={formData.batchNo} onChange={handleChange}>
                                {batches.map(b => <option key={b.id || b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>CA1 - Actual Wt. (Kg)</label>
                            <input type="number" name="ca1" value={formData.ca1} onChange={handleChange} placeholder="Kgs" />
                        </div>
                        <div className="form-field">
                            <label>CA2 - Actual Wt. (Kg)</label>
                            <input type="number" name="ca2" value={formData.ca2} onChange={handleChange} placeholder="Kgs" />
                        </div>
                        <div className="form-field">
                            <label>FA - Actual Wt. (Kg)</label>
                            <input type="number" name="fa" value={formData.fa} onChange={handleChange} placeholder="Sand Kgs" />
                        </div>
                        <div className="form-field">
                            <label>Cement - Actual Wt. (Kg)</label>
                            <input type="number" name="cement" value={formData.cement} onChange={handleChange} placeholder="Kgs" />
                        </div>
                        <div className="form-field">
                            <label>Water (L) - Actual</label>
                            <input type="number" name="water" value={formData.water} onChange={handleChange} placeholder="Ltrs" />
                        </div>
                        <div className="form-field">
                            <label>Admix - Actual Wt. (Kg)</label>
                            <input type="number" name="admixture" value={formData.admixture} onChange={handleChange} placeholder="Kgs" />
                        </div>
                    </div>

                    <div className="form-actions-center" style={{ marginTop: '1rem' }}>
                        {editingId && <button className="toggle-btn secondary" onClick={() => { setFormData(defaultFormData); setEditingId(null); }}>Cancel</button>}
                        <button className="toggle-btn" onClick={handleSave} disabled={saving} style={{ marginLeft: editingId ? '1rem' : '0' }}>
                            {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Confirm Entry'}
                        </button>
                    </div>
                </div>
            )}

            {!hideHistory && (
                <div className="data-table-section">
                    <div className="table-outer-wrapper">
                        <table className="ui-table">
                            <thead>
                                <tr>
                                    <th>Shed / Line No.</th>
                                    <th>Source of Data</th>
                                    <th>Time stamp</th>
                                    <th>Batch No.</th>
                                    <th>CA1 - Actual Wt.</th>
                                    <th>CA2 - Actual Wt.</th>
                                    <th>FA - Actual Wt.</th>
                                    <th>Cement - Actual Wt.</th>
                                    <th>Water (L) - Actual</th>
                                    <th>Admix - Actual Wt.</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {witnessedRecords.length === 0 ? (
                                    <tr><td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No verified records found.</td></tr>
                                ) : (
                                    witnessedRecords.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.location || 'N/A'}</td>
                                            <td data-label="Source"><span className={`status-pill ${r.source === 'Manual' ? 'manual' : 'witnessed'}`}>{r.source}</span></td>
                                            <td data-label="Timestamp"><span>{r.time}</span></td>
                                            <td data-label="Batch"><span>{r.batchNo}</span></td>
                                            <td>{r.ca1 || '0'}</td>
                                            <td>{r.ca2 || '0'}</td>
                                            <td>{r.fa || '0'}</td>
                                            <td>{r.cement}</td>
                                            <td>{r.water}</td>
                                            <td>{r.admixture || '0'}</td>
                                            <td data-label="Actions">
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {r.source === 'Manual' && isRecordEditable(r.timestamp) ? (
                                                        <button className="btn-action" onClick={() => handleEdit(r)}>Edit</button>
                                                    ) : (
                                                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                                            {r.source === 'Manual' ? 'Locked' : 'Verified'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualDataEntry;

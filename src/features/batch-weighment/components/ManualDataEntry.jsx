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

        // Scroll to form and add visual highlight
        setTimeout(() => {
            const manualSection = document.getElementById('manual-entry-section');
            if (manualSection) {
                manualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Add temporary highlight
                manualSection.style.border = '3px solid #fbbf24';
                manualSection.style.borderRadius = '12px';
                setTimeout(() => {
                    manualSection.style.border = '';
                    manualSection.style.borderRadius = '';
                }, 2000);
            }
        }, 100);
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
        return diffMs < (12 * 60 * 60 * 1000); // 12-hour shift window
    };

    return (
        <div className="manual-batch-controls" id="manual-entry-section">
            {(!onlyHistory || editingId) && (
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingId ? '1rem' : 0 }}>
                        <h4 style={{ margin: 0, color: '#1e293b' }}>{editingId ? 'Edit Manual Batch Result' : 'Add Manual Batch Result'}</h4>
                        {editingId && (
                            <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '4px 12px', borderRadius: '6px', fontWeight: '700' }}>
                                Editing Record ID: {editingId}
                            </span>
                        )}
                    </div>
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

            {/* Historical Table */}
            {!hideHistory && (
                <div className="table-outer-wrapper" style={{ marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '4px', height: '16px', background: '#10b981', borderRadius: '2px' }}></span>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.9rem', fontWeight: '800' }}>Historical Witnessed Logs</h4>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', background: '#fff', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            {witnessedRecords.length} Records Found
                        </span>
                    </div>
                    <div className="table-responsive">
                        <table className="ui-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Batch</th>
                                    <th>CA1 (Kg)</th>
                                    <th>CA2 (Kg)</th>
                                    <th>FA (Kg)</th>
                                    <th>Cement (Kg)</th>
                                    <th>Water (L)</th>
                                    <th>Admix (Kg)</th>
                                    <th>Source</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {witnessedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                                            No witnessed declarations found.
                                        </td>
                                    </tr>
                                ) : (
                                    witnessedRecords.map((record) => (
                                        <tr key={record.id} className="hover-row">
                                            <td data-label="Date">{record.date}</td>
                                            <td data-label="Time">{record.time}</td>
                                            <td data-label="Batch"><strong>{record.batchNo}</strong></td>
                                            <td data-label="CA1">{record.ca1}</td>
                                            <td data-label="CA2">{record.ca2}</td>
                                            <td data-label="FA">{record.fa}</td>
                                            <td data-label="Cement">{record.cement}</td>
                                            <td data-label="Water">{record.water}</td>
                                            <td data-label="Admix">{record.admixture}</td>
                                            <td data-label="Source">
                                                <span className={`status-pill ${record.source?.toLowerCase().includes('scada') ? 'witnessed' : 'manual'}`}>
                                                    {record.source}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {isRecordEditable(record.timestamp || record.id) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="btn-action mini"
                                                                style={{ padding: '4px 10px', fontSize: '0.7rem', background: '#3b82f6' }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete(record.id)}
                                                                className="btn-action danger mini"
                                                                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
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

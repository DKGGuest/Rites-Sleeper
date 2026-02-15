import React, { useState } from 'react';
import { apiService } from '../../../services/api';

/**
 * ManualDataEntry Component
 * Provides a form for manual batch result entry and displays a log of all witnessed records.
 */
const ManualDataEntry = ({ batches, witnessedRecords, onSave, hideHistory = false, onlyHistory = false, activeContainer, onDelete, small = false }) => {
    const defaultFormData = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '',
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
                <div style={{ background: '#f8fafc', padding: small ? '1rem' : '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingId ? '1rem' : 0 }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: small ? '0.85rem' : '1rem' }}>{editingId ? 'Edit Manual Batch Result' : 'Add Manual Batch Result'}</h4>
                        {editingId && (
                            <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '4px 12px', borderRadius: '6px', fontWeight: '700' }}>
                                Editing Record ID: {editingId}
                            </span>
                        )}
                    </div>
                    <div className="form-grid" style={{ gap: small ? '1rem' : '1.25rem 2rem' }}>
                        <div className="form-field">
                            <label htmlFor="manual-shed" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Shed / Line No.</label>
                            <input id="manual-shed" name="lineShed" type="text" readOnly value={activeContainer?.name || ''} className="readOnly" style={{ background: '#f8fafc', height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-date" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Date</label>
                            <input id="manual-date" name="date" type="text" readOnly value={formData.date ? formData.date.split('-').reverse().join('/') : ''} style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem', background: '#f8fafc' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-time" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Time</label>
                            <input id="manual-time" type="time" name="time" value={formData.time} onChange={handleChange} style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-batch" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Batch No.</label>
                            <select id="manual-batch" name="batchNo" value={formData.batchNo} onChange={handleChange} style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }}>
                                <option value="">-- Select --</option>
                                {batches.map(b => <option key={b.id || b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-ca1" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>CA1 - Actual Wt. (Kg)</label>
                            <input id="manual-ca1" type="number" name="ca1" value={formData.ca1} onChange={handleChange} placeholder="Kgs" style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-ca2" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>CA2 - Actual Wt. (Kg)</label>
                            <input id="manual-ca2" type="number" name="ca2" value={formData.ca2} onChange={handleChange} placeholder="Kgs" style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-fa" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>FA - Actual Wt. (Kg)</label>
                            <input id="manual-fa" type="number" name="fa" value={formData.fa} onChange={handleChange} placeholder="Sand Kgs" style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-cement" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Cement - Actual Wt. (Kg)</label>
                            <input id="manual-cement" type="number" name="cement" value={formData.cement} onChange={handleChange} placeholder="Kgs" style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-water" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Water (L) - Actual</label>
                            <input id="manual-water" type="number" name="water" value={formData.water} onChange={handleChange} placeholder="Ltrs" style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="manual-admix" style={{ fontSize: small ? '0.65rem' : '0.725rem' }}>Admix - Actual Wt. (Kg)</label>
                            <input id="manual-admix" type="number" name="admixture" value={formData.admixture} onChange={handleChange} placeholder="Kgs" style={{ height: small ? '28px' : '32px', fontSize: small ? '0.75rem' : '0.8rem' }} />
                        </div>
                    </div>

                    <div className="form-actions-center" style={{ marginTop: '1rem' }}>
                        {editingId && <button className="toggle-btn secondary" onClick={() => { setFormData(defaultFormData); setEditingId(null); }} style={{ height: small ? '32px' : '36px', fontSize: small ? '0.75rem' : '0.8125rem' }}>Cancel</button>}
                        <button className="toggle-btn" onClick={handleSave} disabled={saving} style={{ marginLeft: editingId ? '1rem' : '0', height: small ? '32px' : '36px', fontSize: small ? '0.75rem' : '0.8125rem' }}>
                            {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Confirm Entry'}
                        </button>
                    </div>
                </div>
            )}

            {/* Historical Table */}
            {!hideHistory && (
                <div className="table-outer-wrapper" style={{ marginTop: small ? '1rem' : '1.5rem' }}>
                    <div style={{ padding: small ? '0.5rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '4px', height: small ? '12px' : '16px', background: '#10b981', borderRadius: '2px' }}></span>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: small ? '0.75rem' : '0.9rem', fontWeight: '800' }}>Historical Witnessed Logs</h4>
                        </div>
                        <span style={{ fontSize: small ? '0.65rem' : '0.75rem', color: '#64748b', fontWeight: '700', background: '#fff', padding: small ? '2px 8px' : '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            {witnessedRecords.length} Records Found
                        </span>
                    </div>
                    <div className="table-responsive">
                        <table className="ui-table">
                            <thead>
                                <tr>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Date</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Time</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Batch</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>CA1 (Kg)</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>CA2 (Kg)</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>FA (Kg)</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Cement (Kg)</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Water (L)</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Admix (Kg)</th>
                                    <th style={{ fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Source</th>
                                    <th style={{ textAlign: 'center', fontSize: small ? '0.6rem' : '0.7rem', padding: small ? '0.4rem 0.25rem' : '0.75rem 0.5rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {witnessedRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" style={{ padding: small ? '2rem' : '3rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: small ? '0.75rem' : '0.8rem' }}>
                                            No witnessed declarations found.
                                        </td>
                                    </tr>
                                ) : (
                                    witnessedRecords.map((record) => (
                                        <tr key={record.id} className="hover-row">
                                            <td data-label="Date" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.date ? record.date.split('-').reverse().join('/') : ''}</td>
                                            <td data-label="Time" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.time}</td>
                                            <td data-label="Batch" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}><strong>{record.batchNo}</strong></td>
                                            <td data-label="CA1" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.ca1}</td>
                                            <td data-label="CA2" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.ca2}</td>
                                            <td data-label="FA" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.fa}</td>
                                            <td data-label="Cement" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.cement}</td>
                                            <td data-label="Water" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.water}</td>
                                            <td data-label="Admix" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>{record.admixture}</td>
                                            <td data-label="Source" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>
                                                <span className={`status-pill ${record.source?.toLowerCase().includes('scada') ? 'witnessed' : 'manual'}`} style={{ fontSize: small ? '0.6rem' : '0.65rem', padding: small ? '2px 6px' : '4px 10px' }}>
                                                    {record.source}
                                                </span>
                                            </td>
                                            <td data-label="Actions" style={{ fontSize: small ? '0.65rem' : '0.8rem', padding: small ? '0.25rem' : '0.5rem 0.25rem' }}>
                                                <div style={{ display: 'flex', gap: small ? '4px' : '8px', justifyContent: 'center' }}>
                                                    {isRecordEditable(record.timestamp || record.id) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="btn-action mini"
                                                                style={{ padding: small ? '2px 8px' : '4px 10px', fontSize: small ? '0.65rem' : '0.7rem', background: '#3b82f6' }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete(record.id)}
                                                                className="btn-action danger mini"
                                                                style={{ padding: small ? '2px 8px' : '4px 10px', fontSize: small ? '0.65rem' : '0.7rem' }}
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

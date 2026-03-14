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

    const handleEdit = async (record) => {
        try {
            let fetchedData = { ...record };
            const lookupId = record.parentId || record.id;
            
            // Only fetch from backend if ID is a real numeric ID (not a local timestamp or string)
            if (lookupId && !isNaN(lookupId) && !String(lookupId).includes('-')) {
                const response = await apiService.getBatchWeighmentById(lookupId);
                if (response?.responseData) {
                    // Find the specific nested record if available
                    const batchData = response.responseData;
                    const combinedRecords = [
                        ...(batchData.scadaRecords || []).map(r => ({ ...r, source: 'Scada' })),
                        ...(batchData.manualRecords || []).map(r => ({ ...r, source: 'Manual' }))
                    ];
                    
                    const specificRecord = combinedRecords.find(r => r.id === record.id) || record;
                    fetchedData = {
                        ...specificRecord,
                        parentId: batchData.id,
                        entryDate: batchData.entryDate // Keep parent date context
                    };
                }
            }

            // Normalize Date for internal use (Dash/ISO) from DD/MM/YYYY
            const internalDate = (fetchedData.date && fetchedData.date.includes('/')) 
                ? fetchedData.date.split('/').reverse().join('-')
                : (fetchedData.date || new Date().toISOString().split('T')[0]);

            setFormData({
                date: internalDate,
                time: fetchedData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                batchNo: fetchedData.batchNo || '',
                ca1: fetchedData.ca1Actual || fetchedData.ca1 || '',
                ca2: fetchedData.ca2Actual || fetchedData.ca2 || '',
                fa: fetchedData.faActual || fetchedData.fa || '',
                cement: fetchedData.cementActual || fetchedData.cement || '',
                water: fetchedData.waterActual || fetchedData.water || '',
                admixture: fetchedData.admixtureActual || fetchedData.admixture || ''
            });
            setEditingId(fetchedData.id);
            // Attach parent ID to form context if available
            setFormData(prev => ({ ...prev, parentId: fetchedData.parentId }));

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
        } catch (error) {
            console.error("Error fetching batch weighment details:", error);
            // Fallback
            setFormData({
                date: record.date || new Date().toISOString().split('T')[0],
                time: record.time,
                batchNo: record.batchNo,
                ca1: record.ca1, ca2: record.ca2, fa: record.fa,
                cement: record.cement, water: record.water, admixture: record.admixture
            });
            setEditingId(record.id);
        }
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

        onSave(record);
        setFormData(defaultFormData);
        setEditingId(null);
        setSaving(false);
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
                <div className="table-outer-wrapper" style={{ marginTop: small ? '1rem' : '1.5rem', background: 'transparent', border: 'none', padding: 0 }}>
                    <div style={{ padding: small ? '0.5rem 1rem' : '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '4px', height: small ? '12px' : '16px', background: '#10b981', borderRadius: '2px' }}></span>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: small ? '0.75rem' : '0.9rem', fontWeight: '800' }}>Historical Witnessed Logs</h4>
                        </div>
                        <span style={{ fontSize: small ? '0.65rem' : '0.75rem', color: '#64748b', fontWeight: '700', background: '#fff', padding: small ? '2px 8px' : '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            {witnessedRecords.length} {witnessedRecords.length === 1 ? 'Record' : 'Records'} Found
                        </span>
                    </div>

                    {(() => {
                        const lineRecords = witnessedRecords.filter(r => !(r.location || '').toLowerCase().includes('shed'));
                        const shedRecords = witnessedRecords.filter(r => (r.location || '').toLowerCase().includes('shed'));

                        const renderTable = (recordsSubset, title, groupColor) => (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ padding: '8px 16px', background: `${groupColor}10`, borderLeft: `4px solid ${groupColor}`, marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: groupColor, fontWeight: '800' }}>{title} ({recordsSubset.length})</h4>
                                </div>
                                <div className="table-responsive" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Location</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Date</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Time</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Grade</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Batch</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>CA1 (Kg)</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>CA2 (Kg)</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>FA (Kg)</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Cement (Kg)</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Water (L)</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Admix (Kg)</th>
                                                <th style={{ fontSize: small ? '0.6rem' : '0.7rem' }}>Source</th>
                                                <th style={{ textAlign: 'center', fontSize: small ? '0.6rem' : '0.7rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsSubset.map((record) => (
                                                <tr key={record.id} className="hover-row">
                                                    <td style={{ fontSize: small ? '0.65rem' : '0.75rem', color: '#64748b' }}>{record.location || 'N/A'}</td>
                                                    <td data-label="Date" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.date ? record.date.split('-').reverse().join('/') : ''}</td>
                                                    <td data-label="Time" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.time}</td>
                                                    <td data-label="Grade" style={{ fontSize: small ? '0.65rem' : '0.8rem', color: '#0369a1', fontWeight: '700' }}>{record.concreteGrade || '-'}</td>
                                                    <td data-label="Batch" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}><strong>{record.batchNo}</strong></td>
                                                    <td data-label="CA1" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.ca1}</td>
                                                    <td data-label="CA2" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.ca2}</td>
                                                    <td data-label="FA" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.fa}</td>
                                                    <td data-label="Cement" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.cement}</td>
                                                    <td data-label="Water" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.water}</td>
                                                    <td data-label="Admix" style={{ fontSize: small ? '0.65rem' : '0.8rem' }}>{record.admixture}</td>
                                                    <td data-label="Source">
                                                        <span className={`status-pill ${record.source?.toLowerCase().includes('scada') ? 'witnessed' : 'manual'}`} style={{ fontSize: small ? '0.6rem' : '0.65rem' }}>
                                                            {record.source}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions">
                                                        <div style={{ display: 'flex', gap: small ? '4px' : '8px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => handleEdit(record)}
                                                                className="btn-action mini"
                                                                style={{ background: '#3b82f6', color: '#fff' }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete(record.id)}
                                                                className="btn-action danger mini"
                                                                style={{ background: '#ef4444', color: '#fff' }}
                                                            >
                                                                Del
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );

                        return (
                            <>
                                {lineRecords.length > 0 && renderTable(lineRecords, "LONG LINE BATCHES", "#3b82f6")}
                                {shedRecords.length > 0 && renderTable(shedRecords, "SHED BATCHES", "#8b5cf6")}
                                {witnessedRecords.length === 0 && (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        No witnessed declarations found.
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default ManualDataEntry;

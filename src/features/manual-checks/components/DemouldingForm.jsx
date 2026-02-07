import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const DemouldingForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer }) => {
    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        dateOfCasting: new Date().toLocaleDateString('en-GB'),
        batchNo: '',
        benchNo: '',
        sleeperType: '',
        processSatisfactory: '',
        visualCheck: '',
        dimCheck: '',
        defectiveSleepers: [],
        remarks: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date || new Date().toLocaleDateString('en-GB'),
                time: initialData.time || '',
                dateOfCasting: initialData.dateOfCasting || new Date().toLocaleDateString('en-GB'),
                batchNo: initialData.batchNo || '',
                benchNo: initialData.benchNo || '',
                sleeperType: initialData.sleeperType || '',
                processSatisfactory: initialData.processSatisfactory || '',
                visualCheck: initialData.visualCheck || '',
                dimCheck: initialData.dimCheck || '',
                defectiveSleepers: initialData.defectiveSleepers || [],
                remarks: initialData.remarks || ''
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.benchNo && !initialData) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            setFormData(prev => ({ ...prev, sleeperType: types[parseInt(formData.benchNo) % 3] || 'RT-1234' }));
        }
    }, [formData.benchNo, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            // If both checks go back to All OK, clear the defective list (optional, but cleaner)
            if (newState.visualCheck === 'All OK' && newState.dimCheck === 'All OK') {
                newState.defectiveSleepers = [];
            }
            return newState;
        });
    };

    const addDefectiveSleeper = () => {
        setFormData(prev => ({
            ...prev,
            defectiveSleepers: [...prev.defectiveSleepers, { benchNo: '', sequence: '', sleeperNo: '', visualReason: '', dimReason: '' }]
        }));
    };

    const updateDefectiveSleeper = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.defectiveSleepers];
            updated[index] = { ...updated[index], [field]: value };

            // Auto-generate sleeperNo when benchNo or sequence changes
            if (field === 'benchNo' || field === 'sequence') {
                const benchNo = field === 'benchNo' ? value : updated[index].benchNo;
                const sequence = field === 'sequence' ? value : updated[index].sequence;
                updated[index].sleeperNo = (benchNo && sequence) ? `${benchNo}-${sequence}` : '';
            }

            return { ...prev, defectiveSleepers: updated };
        });
    };

    const removeDefectiveSleeper = (index) => {
        setFormData(prev => ({
            ...prev,
            defectiveSleepers: prev.defectiveSleepers.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        if (!formData.benchNo || !formData.batchNo || !formData.remarks) {
            alert('Please fill in required fields (Batch, Bench & Remarks).');
            return;
        }

        const isDefectRecordNeeded = formData.visualCheck !== 'All OK' || formData.dimCheck !== 'All OK';
        if (isDefectRecordNeeded && formData.defectiveSleepers.length === 0) {
            alert('Please add at least one defective sleeper detail as check is not "All OK".');
            return;
        }

        onSave(formData);
        setFormData(prev => ({
            ...prev,
            benchNo: '',
            processSatisfactory: '',
            visualCheck: '',
            dimCheck: '',
            defectiveSleepers: [],
            remarks: ''
        }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard" style={{ marginBottom: '20px' }}>
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Line / Shed No.</label>
                    <div className="form-info-card">
                        {activeContainer?.name || 'N/A'}
                    </div>
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Date</label>
                    <div className="form-info-card">
                        {formData.date}
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="demould-time" style={{ fontSize: '11px', fontWeight: '700' }}>Time <span className="required">*</span></label>
                    <input id="demould-time" type="time" className="form-input-standard" value={formData.time} onChange={e => handleChange('time', e.target.value)} />
                </div>

                <div className="form-field">
                    <label htmlFor="casting-date" style={{ fontSize: '11px', fontWeight: '700' }}>Date of Casting <span className="required">*</span></label>
                    <input id="casting-date" type="text" placeholder="DD/MM/YYYY" className="form-input-standard" value={formData.dateOfCasting} onChange={e => handleChange('dateOfCasting', e.target.value)} />
                </div>

                <div className="form-field">
                    <label htmlFor="batch-no" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <input id="batch-no" type="number" placeholder="Batch No" className="form-input-standard" value={formData.batchNo} onChange={e => handleChange('batchNo', e.target.value)} />
                </div>

                <div className="form-field">
                    <label htmlFor="demould-bench" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <input id="demould-bench" type="number" min="0" placeholder={`${fieldLabel} No`} className="form-input-standard" value={formData.benchNo} onChange={e => handleChange('benchNo', e.target.value)} />
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Type of Sleeper</label>
                    <div className="form-info-card" style={{ background: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
                        {formData.sleeperType || 'N/A'}
                    </div>
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Process Status <span className="required">*</span></label>
                    <select value={formData.processSatisfactory} className="form-input-standard" onChange={e => handleChange('processSatisfactory', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="Satisfactory">Satisfactory</option>
                        <option value="Not Satisfactory">Not Satisfactory</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="visual-check" style={{ fontSize: '11px', fontWeight: '700' }}>Visual Check <span className="required">*</span></label>
                    <select id="visual-check" value={formData.visualCheck} className="form-input-standard" onChange={e => handleChange('visualCheck', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="All OK">All OK</option>
                        <option value="Partially OK">Partially OK</option>
                        <option value="All Rejected">All Rejected</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-check" style={{ fontSize: '11px', fontWeight: '700' }}>Dim. Check <span className="required">*</span></label>
                    <select id="dim-check" value={formData.dimCheck} className="form-input-standard" onChange={e => handleChange('dimCheck', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="All OK">All OK</option>
                        <option value="Partially OK">Partially OK</option>
                        <option value="All Rejected">All Rejected</option>
                    </select>
                </div>

                <div className="form-field form-field-full">
                    <label htmlFor="demould-remarks" style={{ fontSize: '11px', fontWeight: '700' }}>Overall Findings / Remarks <span className="required">*</span></label>
                    <input id="demould-remarks" type="text" placeholder="Enter observations" className="form-input-standard" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} />
                </div>
            </div>

            {/* Defective Sleepers Dynamic Section */}
            {(formData.visualCheck !== 'All OK' || formData.dimCheck !== 'All OK') && (
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: '#1e293b' }}>Defective Sleepers Details</h4>
                        <button className="toggle-btn mini" onClick={addDefectiveSleeper} style={{ padding: '4px 12px' }}>+ Add Sleeper</button>
                    </div>

                    {formData.defectiveSleepers.map((sleeper, idx) => (
                        <div key={idx} style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto auto auto 1fr 1fr auto',
                            gap: '8px',
                            alignItems: 'end',
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div className="form-field">
                                <label style={{ fontSize: '10px' }}>Bench/Gang No.</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-input-standard"
                                    value={sleeper.benchNo}
                                    onChange={e => updateDefectiveSleeper(idx, 'benchNo', e.target.value)}
                                    placeholder="401"
                                    style={{ padding: '6px', fontSize: '12px', width: '80px' }}
                                />
                            </div>
                            <div className="form-field">
                                <label style={{ fontSize: '10px' }}>Sequence</label>
                                <select
                                    value={sleeper.sequence}
                                    className="form-input-standard"
                                    onChange={e => updateDefectiveSleeper(idx, 'sequence', e.target.value)}
                                    style={{ padding: '6px', fontSize: '12px', width: '70px' }}
                                >
                                    <option value="">--</option>
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <label style={{ fontSize: '10px' }}>Sleeper No.</label>
                                <div style={{
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: sleeper.sleeperNo ? '#42818c' : '#94a3b8',
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    minWidth: '80px',
                                    textAlign: 'center'
                                }}>
                                    {sleeper.sleeperNo || '--'}
                                </div>
                            </div>
                            <div className="form-field">
                                <label style={{ fontSize: '10px' }}>Visual Reason</label>
                                <select value={sleeper.visualReason} className="form-input-standard" onChange={e => updateDefectiveSleeper(idx, 'visualReason', e.target.value)} style={{ padding: '6px', fontSize: '12px' }}>
                                    <option value="">-- Select --</option>
                                    <option value="Cracks">Cracks</option>
                                    <option value="Honey Combing">Honey Combing</option>
                                    <option value="Chipping">Chipping</option>
                                    <option value="Edge Damage">Edge Damage</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label style={{ fontSize: '10px' }}>Dim. Reason</label>
                                <select value={sleeper.dimReason} className="form-input-standard" onChange={e => updateDefectiveSleeper(idx, 'dimReason', e.target.value)} style={{ padding: '6px', fontSize: '12px' }}>
                                    <option value="">-- Select --</option>
                                    <option value="Length deviation">Length deviation</option>
                                    <option value="Width deviation">Width deviation</option>
                                    <option value="Height deviation">Height deviation</option>
                                    <option value="Insert Misalignment">Insert Misalignment</option>
                                </select>
                            </div>
                            <div style={{ minWidth: '40px', textAlign: 'right' }}>
                                <button onClick={() => removeDefectiveSleeper(idx)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', height: '32px', width: '32px' }}>×</button>
                            </div>
                        </div>
                    ))}
                    {formData.defectiveSleepers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '12px', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                            No sleeper details added yet. Click "+ Add Sleeper" to record defects.
                        </div>
                    )}
                </div>
            )}

            <div className="form-actions-row">
                <button className="toggle-btn" onClick={handleSave}>
                    {initialData ? 'Update Record' : 'Save Record'}
                </button>
                {initialData && <button className="toggle-btn secondary" onClick={onCancel}>Cancel</button>}
            </div>
        </div>

    );
};

export default DemouldingForm;

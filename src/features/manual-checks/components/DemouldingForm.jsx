import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';
import { formatDateForBackend } from '../../../utils/helpers';

const DemouldingForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer }) => {
    const getTodayDateISO = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        date: getTodayDateISO(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        dateOfCasting: getTodayDateISO(),
        batchNo: '',
        benchNo: '',
        sleeperType: '',
        processSatisfactory: '',
        visualCheck: '',
        dimCheck: '',
        defectiveSleeperDetails: [],
        remarks: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date || getTodayDateISO(),
                time: initialData.time || '',
                dateOfCasting: initialData.dateOfCasting || getTodayDateISO(),
                batchNo: initialData.batchNo || '',
                benchNo: initialData.benchNo || '',
                sleeperType: initialData.sleeperType || '',
                processSatisfactory: initialData.processSatisfactory || '',
                visualCheck: initialData.visualCheck || '',
                dimCheck: initialData.dimCheck || '',
                defectiveSleeperDetails: initialData.defectiveSleeperDetails || [],
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
                newState.defectiveSleeperDetails = [];
            }
            return newState;
        });
    };

    const addDefectiveSleeper = () => {
        setFormData(prev => ({
            ...prev,
            defectiveSleeperDetails: [...prev.defectiveSleeperDetails, { benchNo: '', sequence: '', sleeperNo: '', visualReason: '', dimReason: '' }]
        }));
    };

    const updateDefectiveSleeper = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.defectiveSleeperDetails];
            updated[index] = { ...updated[index], [field]: value };

            // Auto-generate sleeperNo when benchNo or sequence changes
            if (field === 'benchNo' || field === 'sequence') {
                const benchNo = field === 'benchNo' ? value : updated[index].benchNo;
                const sequence = field === 'sequence' ? value : updated[index].sequence;
                updated[index].sleeperNo = (benchNo && sequence) ? `${benchNo}-${sequence}` : '';
            }

            return { ...prev, defectiveSleeperDetails: updated };
        });
    };

    const removeDefectiveSleeper = (index) => {
        setFormData(prev => ({
            ...prev,
            defectiveSleeperDetails: prev.defectiveSleeperDetails.filter((_, i) => i !== index)
        }));
    };


    const convertToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        // If already dd/MM/yyyy, return as is
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

        // If yyyy-MM-dd (standard HTML date input), convert it
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split("-");
            return `${day}/${month}/${year}`;
        }

        // If dd-MM-yyyy, convert to slashes
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            return dateStr.replace(/-/g, '/');
        }

        return dateStr;
    };

    // Convert date to dd/MM/yyyy for BACKEND (Matches index 2 parsing requirement)
    const formatToBackendDate = (dateStr) => {
        if (!dateStr) return null;

        // If yyyy-MM-dd (HTML date input), convert to dd/MM/yyyy
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split("-");
            return `${day}/${month}/${year}`;
        }

        // If dd-MM-yyyy, convert to dd/MM/yyyy
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            return dateStr.replace(/-/g, '/');
        }

        // If already dd/MM/yyyy, return as is
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            return dateStr;
        }

        return dateStr;
    };

    const handleSave = () => {
        if (!formData.benchNo || !formData.batchNo || !formData.remarks) {
            alert('Please fill in required fields (Batch, Bench & Remarks).');
            return;
        }

        // Map status values to Backend Expected Constants (matching logs)
        const visualCheckMapped = formData.visualCheck || "All OK";
        const dimCheckMapped = formData.dimCheck || "All OK";

        // Transform defective sleepers
        let mappedDefectiveSleepers = (formData.defectiveSleeperDetails && formData.defectiveSleeperDetails.length > 0)
            ? formData.defectiveSleeperDetails.map(item => ({
                benchGangNo: item.benchNo ? String(item.benchNo) : "",
                sequenceNo: item.sequence || "",
                sleeperNo: item.sleeperNo || "",
                visualReason: item.visualReason || "",
                dimReason: item.dimReason || ""
            }))
            : [];

        // Backend requirement: defectiveSleepers must not be empty
        if (mappedDefectiveSleepers.length === 0) {
            mappedDefectiveSleepers = [{
                benchGangNo: "",
                sequenceNo: "",
                sleeperNo: "",
                visualReason: "",
                dimReason: ""
            }];
        }

        // VALIDATION: If checks are not "All OK", at least one defect detail is required
        if ((visualCheckMapped !== 'All OK' || dimCheckMapped !== 'All OK') && mappedDefectiveSleepers.length === 0) {
            alert('Please add details for the defective sleepers found during inspection.');
            return;
        }

        // Construct Payload matching DTO precisely (Per User Latest Instructions)
        const payload = {
            lineShedNo: activeContainer?.name || "",
            inspectionDate: formatToBackendDate(formData.date),
            inspectionTime: formData.time,
            castingDate: formatToBackendDate(formData.dateOfCasting),
            batchNo: String(formData.batchNo || ""),
            benchNo: String(formData.benchNo || ""),
            sleeperType: formData.sleeperType || "",
            processStatus: formData.processSatisfactory || "",
            visualCheck: visualCheckMapped || "",
            dimCheck: dimCheckMapped || "",
            overallRemarks: formData.remarks || "",
            createdBy: "Urvi",
            updatedBy: "Urvi",
            defectiveSleepers: mappedDefectiveSleepers
        };

        // DEBUG LOGGING
        console.log('📋 DemouldingForm - Preparing Payload...');
        console.log(JSON.stringify(payload, null, 2));

        onSave(payload);

        setFormData(prev => ({
            ...prev,
            benchNo: '',
            processSatisfactory: '',
            visualCheck: '',
            dimCheck: '',
            defectiveSleeperDetails: [],
            remarks: ''
        }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard" style={{ marginBottom: '20px' }}>
                <div className="form-field">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Line / Shed No.</span>
                    <div className="form-info-card">
                        {activeContainer?.name || 'N/A'}
                    </div>
                </div>

                <div className="form-field">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Date</span>
                    <div className="form-info-card">
                        {formatToBackendDate(formData.date)}
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="demould-time" style={{ fontSize: '11px', fontWeight: '700' }}>Time <span className="required">*</span></label>
                    <input id="demould-time" name="time" type="time" className="form-input-standard" value={formData.time} onChange={e => handleChange('time', e.target.value)} />
                </div>

                <div className="form-field">
                    <label htmlFor="casting-date" style={{ fontSize: '11px', fontWeight: '700' }}>Date of Casting <span className="required">*</span></label>
                    <input id="casting-date" name="dateOfCasting" type="date" className="form-input-standard" value={formData.dateOfCasting} onChange={e => handleChange('dateOfCasting', e.target.value)} />
                </div>

                <div className="form-field">
                    <label htmlFor="batch-no" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <input id="batch-no" name="batchNo" type="number" placeholder="Batch No" className="form-input-standard" value={formData.batchNo} onChange={e => handleChange('batchNo', e.target.value)} />
                </div>

                <div className="form-field">
                    <label htmlFor="demould-bench" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <input id="demould-bench" name="benchNo" type="number" min="0" placeholder={`${fieldLabel} No`} className="form-input-standard" value={formData.benchNo} onChange={e => handleChange('benchNo', e.target.value)} />
                </div>

                <div className="form-field">
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Type of Sleeper</span>
                    <div className="form-info-card" style={{ background: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
                        {formData.sleeperType || 'N/A'}
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="process-status" style={{ fontSize: '11px', fontWeight: '700' }}>Process Status <span className="required">*</span></label>
                    <select id="process-status" name="processSatisfactory" value={formData.processSatisfactory} className="form-input-standard" onChange={e => handleChange('processSatisfactory', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="Satisfactory">Satisfactory</option>
                        <option value="Not Satisfactory">Not Satisfactory</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="visual-check" style={{ fontSize: '11px', fontWeight: '700' }}>Visual Check <span className="required">*</span></label>
                    <select id="visual-check" name="visualCheck" value={formData.visualCheck} className="form-input-standard" onChange={e => handleChange('visualCheck', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="All OK">All OK</option>
                        <option value="Partially OK">Partially OK</option>
                        <option value="All Rejected">All Rejected</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-check" style={{ fontSize: '11px', fontWeight: '700' }}>Dim. Check <span className="required">*</span></label>
                    <select id="dim-check" name="dimCheck" value={formData.dimCheck} className="form-input-standard" onChange={e => handleChange('dimCheck', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="All OK">All OK</option>
                        <option value="Partially OK">Partially OK</option>
                        <option value="All Rejected">All Rejected</option>
                    </select>
                </div>

                <div className="form-field form-field-full">
                    <label htmlFor="demould-remarks" style={{ fontSize: '11px', fontWeight: '700' }}>Overall Findings / Remarks <span className="required">*</span></label>
                    <input id="demould-remarks" name="remarks" type="text" placeholder="Enter observations" className="form-input-standard" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} />
                </div>
            </div>

            {/* Defective Sleepers Dynamic Section */}
            {(formData.visualCheck !== 'All OK' || formData.dimCheck !== 'All OK') && (
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: '#1e293b' }}>Defective Sleepers Details</h4>
                        <button className="toggle-btn mini" onClick={addDefectiveSleeper} style={{ padding: '4px 12px' }}>+ Add Sleeper</button>
                    </div>

                    {formData.defectiveSleeperDetails.map((sleeper, idx) => (
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
                                <label htmlFor={`sleeper-bench-${idx}`} style={{ fontSize: '10px' }}>Bench/Gang No.</label>
                                <input
                                    id={`sleeper-bench-${idx}`}
                                    name={`sleeper-bench-no-${idx}`}
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
                                <label htmlFor={`sleeper-seq-${idx}`} style={{ fontSize: '10px' }}>Sequence</label>
                                <select
                                    id={`sleeper-seq-${idx}`}
                                    name={`sleeper-sequence-${idx}`}
                                    value={sleeper.sequence}
                                    className="form-input-standard"
                                    onChange={e => updateDefectiveSleeper(idx, 'sequence', e.target.value)}
                                    style={{ padding: '6px', fontSize: '12px', width: '70px' }}
                                >
                                    <option value="">--</option>
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-field">
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Sleeper No.</span>
                                <div
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: sleeper.sleeperNo ? '#42818c' : '#94a3b8',
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        minWidth: '80px',
                                        textAlign: 'center'
                                    }}
                                >
                                    {sleeper.sleeperNo || '--'}
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor={`sleeper-type-${idx}`} style={{ fontSize: '10px' }}>Defect Type</label>
                                <select
                                    id={`sleeper-type-${idx}`}
                                    name={`sleeper-defect-type-${idx}`}
                                    value={sleeper.defectType || ''}
                                    className="form-input-standard"
                                    onChange={e => {
                                        const type = e.target.value;
                                        // Reset reasons when type changes
                                        setFormData(prev => {
                                            const updated = [...prev.defectiveSleeperDetails];
                                            updated[idx] = {
                                                ...updated[idx],
                                                defectType: type,
                                                visualReason: '',
                                                dimReason: ''
                                            };
                                            return { ...prev, defectiveSleeperDetails: updated };
                                        });
                                    }}
                                    style={{ padding: '6px', fontSize: '12px' }}
                                >
                                    <option value="">-- Type --</option>
                                    <option value="Visual" disabled={formData.visualCheck === 'All OK'}>Visual</option>
                                    <option value="Dimensional" disabled={formData.dimCheck === 'All OK'}>Dimensional</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor={`sleeper-reason-${idx}`} style={{ fontSize: '10px' }}>Defect Reason</label>
                                {sleeper.defectType === 'Visual' ? (
                                    <select
                                        id={`sleeper-reason-${idx}`}
                                        name={`sleeper-visual-reason-${idx}`}
                                        value={sleeper.visualReason}
                                        className="form-input-standard"
                                        onChange={e => updateDefectiveSleeper(idx, 'visualReason', e.target.value)}
                                        style={{ padding: '6px', fontSize: '12px' }}
                                    >
                                        <option value="">-- Visual Reason --</option>
                                        <option value="Cracks">Cracks</option>
                                        <option value="Honey Combing">Honey Combing</option>
                                        <option value="Chipping">Chipping</option>
                                        <option value="Edge Damage">Edge Damage</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : sleeper.defectType === 'Dimensional' ? (
                                    <select
                                        id={`sleeper-reason-${idx}`}
                                        name={`sleeper-dim-reason-${idx}`}
                                        value={sleeper.dimReason}
                                        className="form-input-standard"
                                        onChange={e => updateDefectiveSleeper(idx, 'dimReason', e.target.value)}
                                        style={{ padding: '6px', fontSize: '12px' }}
                                    >
                                        <option value="">-- Dim. Reason --</option>
                                        <option value="Length deviation">Length deviation</option>
                                        <option value="Width deviation">Width deviation</option>
                                        <option value="Height deviation">Height deviation</option>
                                        <option value="Insert Misalignment">Insert Misalignment</option>
                                    </select>
                                ) : (
                                    <div id={`sleeper-reason-${idx}`} style={{ padding: '6px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', background: '#e2e8f0', borderRadius: '6px' }}>Select Type First</div>
                                )}
                            </div>

                            <div style={{ minWidth: '40px', textAlign: 'right' }}>
                                <button onClick={() => removeDefectiveSleeper(idx)} type="button" aria-label="Remove Sleeper" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', height: '32px', width: '32px' }}>×</button>
                            </div>
                        </div>
                    ))}
                    {formData.defectiveSleeperDetails.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '12px', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                            No sleeper details added yet. Click "+ Add Sleeper" to record defects.
                        </div>
                    )}
                </div>
            )}

            <div className="form-actions-row">
                <button className="toggle-btn" type="button" onClick={handleSave}>
                    {initialData ? 'Update Record' : 'Save Record'}
                </button>
                {initialData && <button className="toggle-btn secondary" type="button" onClick={onCancel}>Cancel</button>}
            </div>
        </div>

    );
};

export default DemouldingForm;

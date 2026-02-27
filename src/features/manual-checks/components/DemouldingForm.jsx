import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const DemouldingForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer, sharedBatchNo, sharedBenchNo, onShiftFieldChange }) => {
    // 1. Exact State Mapping as requested by User
    // Helper for safe date/time (Forcing Asia/Kolkata to stop 12:54/UTC issues)
    const getSafeToday = () => {
        try {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date()); // Returns YYYY-MM-DD
        } catch (e) {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
    };

    const getSafeNowTime = () => {
        try {
            return new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(new Date());
        } catch (e) {
            const d = new Date();
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
    };

    const [formData, setFormData] = useState({
        location: activeContainer?.name || 'N/A',
        inspectionDate: getSafeToday(),
        inspectionTime: getSafeNowTime(),
        batch: sharedBatchNo || '',
        gangNo: sharedBenchNo || '',
        type: '',
        casting: getSafeToday(),
        process: '',
        visualCheck: 'All OK',
        dimCheck: 'All OK',
        remarks: '',
        defectiveSleeperDetails: []
    });

    // Helper for DateTime/Date input compatibility
    const formatFromBackendDatePart = (dateStr) => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
            const [d, m, y] = dateStr.split('/');
            return `${y}-${m}-${d}`;
        }
        return dateStr;
    };

    const formatDateTimeForInput = (dt, time) => {
        if (!dt) return "";
        if (dt.includes('T')) return dt.substring(0, 16);
        const datePart = formatFromBackendDatePart(dt);
        const timePart = time || '00:00';
        return `${datePart}T${timePart.substring(0, 5)}`;
    };

    const formatDateForInput = (d) => {
        if (!d) return "";
        if (d.includes('T')) return d.substring(0, 10);
        return d;
    };

    // 5. Modify Must Spread Full Row
    useEffect(() => {
        if (initialData) {
            console.log("Fetched Time:", initialData.inspectionTime);
            setFormData({
                ...initialData,
                location: initialData.lineShedNo || initialData.location || activeContainer?.name || 'N/A',
                inspectionDate: formatFromBackendDatePart(initialData.inspectionDate || (initialData.dateTime ? initialData.dateTime.split('T')[0] : '') || initialData.date || ''),
                inspectionTime: initialData.inspectionTime?.slice(0, 5) || "",
                batch: initialData.batch || initialData.batchNo || '',
                gangNo: initialData.gangNo || initialData.benchNo || '',
                type: initialData.sleeperType || initialData.type || '',
                casting: formatFromBackendDatePart(initialData.castingDate || initialData.casting || initialData.dateOfCasting),
                process: initialData.processStatus || initialData.process || '',
                visualCheck: initialData.visualCheck || 'All OK',
                dimCheck: initialData.dimCheck || 'All OK',
                remarks: initialData.overallRemarks || initialData.remarks || '',
                defectiveSleeperDetails: (initialData.defectiveSleepers || initialData.defectiveSleeperDetails || []).map(d => ({
                    benchNo: d.benchGangNo || d.benchNo || "",
                    sequence: d.sequenceNo || d.sequence || "",
                    sleeperNo: d.sleeperNo || "",
                    visualReason: d.visualReason || "",
                    dimReason: d.dimReason || "",
                    defectType: d.visualReason ? "Visual" : (d.dimReason ? "Dimensional" : "")
                }))
            });
        } else {
            // sync with shared shift data
            setFormData(prev => ({
                ...prev,
                batch: sharedBatchNo || prev.batch,
                gangNo: sharedBenchNo || prev.gangNo
            }));
        }
    }, [initialData, activeContainer, sharedBatchNo, sharedBenchNo]);

    // Auto-Type logic
    useEffect(() => {
        if (formData.gangNo && !initialData) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            const derivedType = types[parseInt(formData.gangNo) % 3] || 'RT-1234';
            setFormData(prev => ({ ...prev, type: derivedType }));
        }
    }, [formData.gangNo, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            if (newState.visualCheck === 'All OK' && newState.dimCheck === 'All OK') {
                newState.defectiveSleeperDetails = [];
            }
            return newState;
        });

        // 🔥 Shared Shift logic: Update parent state when batch or bench changes
        if (field === 'batch') onShiftFieldChange('batchNo', value);
        if (field === 'gangNo') onShiftFieldChange('benchNo', value);
    };

    const formatToBackendDate = (dateStr) => {
        if (!dateStr) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split("-");
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    const handleSave = () => {
        if (!formData.gangNo || !formData.batch || !formData.remarks) {
            alert('Please fill in required fields (Batch, Bench/Gang No. & Remarks).');
            return;
        }

        // Transform defective sleepers for backend sub-object
        const mappedDefectiveSleepers = formData.defectiveSleeperDetails.length > 0
            ? formData.defectiveSleeperDetails.map(item => ({
                benchGangNo: String(item.benchNo || ""),
                sequenceNo: String(item.sequence || ""),
                sleeperNo: String(item.sleeperNo || ""),
                // ONLY send reason if the top-level check permits it
                visualReason: formData.visualCheck !== 'All OK' ? String(item.visualReason || "") : "",
                dimReason: formData.dimCheck !== 'All OK' ? String(item.dimReason || "") : ""
            }))
            : [{
                benchGangNo: "",
                sequenceNo: "",
                sleeperNo: "",
                visualReason: "",
                dimReason: ""
            }];

        console.log("Saving Date:", formData.inspectionDate);
        console.log("Saving Time:", formData.inspectionTime);

        // Payload matching demoulding-inspection-controller schema exactly
        const payload = {
            lineShedNo: formData.location || activeContainer?.name || 'N/A',
            inspectionDate: formatToBackendDate(formData.inspectionDate),
            inspectionTime: formData.inspectionTime,
            castingDate: formatToBackendDate(formData.casting),
            batchNo: parseInt(formData.batch) || 0,
            benchNo: parseInt(formData.gangNo) || 0,
            sleeperType: formData.type || 'RT-1234',
            processStatus: formData.process || 'Satisfactory',
            visualCheck: formData.visualCheck || 'All OK',
            dimCheck: formData.dimCheck || 'All OK',
            overallRemarks: formData.remarks || '',
            createdBy: "0",
            updatedBy: "0",
            defectiveSleepers: mappedDefectiveSleepers
        };

        onSave(payload);

        // Reset non-shared fields
        setFormData(prev => ({
            ...prev,
            inspectionDate: getSafeToday(),
            inspectionTime: getSafeNowTime(),
            process: '',
            visualCheck: 'All OK',
            dimCheck: 'All OK',
            defectiveSleeperDetails: [],
            remarks: ''
        }));
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
            if (field === 'benchNo' || field === 'sequence') {
                const b = field === 'benchNo' ? value : updated[index].benchNo;
                const s = field === 'sequence' ? value : updated[index].sequence;
                updated[index].sleeperNo = (b && s) ? `${b}-${s}` : '';
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

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard" style={{ marginBottom: '20px' }}>
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Location</label>
                    <div className="form-info-card">{formData.location}</div>
                </div>

                {/* 2. Properly Bound using VALUE and ONCHANGE */}
                <div className="form-field">
                    <label htmlFor="dim-inspectionDate" style={{ fontSize: '11px', fontWeight: '700' }}>Date <span className="required">*</span></label>
                    <input
                        id="dim-inspectionDate"
                        type="date"
                        className="form-input-standard"
                        value={formData.inspectionDate}
                        onChange={e => handleChange('inspectionDate', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="dim-inspectionTime" style={{ fontSize: '11px', fontWeight: '700' }}>Time <span className="required">*</span></label>
                    <input
                        id="dim-inspectionTime"
                        type="time"
                        className="form-input-standard"
                        value={formData.inspectionTime}
                        onChange={e => handleChange('inspectionTime', e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="dim-casting" style={{ fontSize: '11px', fontWeight: '700' }}>Date of Casting <span className="required">*</span></label>
                    <input
                        id="dim-casting"
                        type="date"
                        className="form-input-standard"
                        value={formData.casting}
                        onChange={e => handleChange('casting', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="dim-batch" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <input
                        id="dim-batch"
                        type="number"
                        placeholder="Batch No"
                        className="form-input-standard"
                        value={formData.batch}
                        onChange={e => handleChange('batch', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="dim-gang" style={{ fontSize: '11px', fontWeight: '700' }}>Bench No. <span className="required">*</span></label>
                    <input
                        id="dim-gang"
                        type="number"
                        min="0"
                        placeholder="Bench No"
                        className="form-input-standard"
                        value={formData.gangNo}
                        onChange={e => handleChange('gangNo', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="dim-type" style={{ fontSize: '11px', fontWeight: '700' }}>Sleeper Type <span className="required">*</span></label>
                    <select
                        id="dim-type"
                        className="form-input-standard"
                        value={formData.type}
                        onChange={e => handleChange('type', e.target.value)}
                    >
                        <option value="">-- Select Type --</option>
                        <option value="RT-1234">RT-1234 (Line I)</option>
                        <option value="RT-5678">RT-5678 (Standard)</option>
                        <option value="RT-9012">RT-9012 (Special)</option>
                        <option value="G-101">G-101 (Broad Gauge)</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-process" style={{ fontSize: '11px', fontWeight: '700' }}>Process Status <span className="required">*</span></label>
                    <select id="dim-process" value={formData.process} className="form-input-standard" onChange={e => handleChange('process', e.target.value)}>
                        <option value="">-- Select --</option>
                        <option value="Satisfactory">Satisfactory</option>
                        <option value="Not Satisfactory">Not Satisfactory</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-visual" style={{ fontSize: '11px', fontWeight: '700' }}>Visual Check <span className="required">*</span></label>
                    <select id="dim-visual" value={formData.visualCheck} className="form-input-standard" onChange={e => handleChange('visualCheck', e.target.value)}>
                        <option value="All OK">All OK</option>
                        <option value="Partially OK">Partially OK</option>
                        <option value="All Rejected">All Rejected</option>
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-dim" style={{ fontSize: '11px', fontWeight: '700' }}>Dim. Check <span className="required">*</span></label>
                    <select id="dim-dim" value={formData.dimCheck} className="form-input-standard" onChange={e => handleChange('dimCheck', e.target.value)}>
                        <option value="All OK">All OK</option>
                        <option value="Partially OK">Partially OK</option>
                        <option value="All Rejected">All Rejected</option>
                    </select>
                </div>

                <div className="form-field form-field-full">
                    <label htmlFor="dim-remarks" style={{ fontSize: '11px', fontWeight: '700' }}>Overall Findings / Remarks <span className="required">*</span></label>
                    <input
                        id="dim-remarks"
                        type="text"
                        placeholder="Enter observations"
                        className="form-input-standard"
                        value={formData.remarks}
                        onChange={e => handleChange('remarks', e.target.value)}
                    />
                </div>
            </div>

            {/* Defective Section */}
            {(formData.visualCheck !== 'All OK' || formData.dimCheck !== 'All OK') && (
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: '#1e293b' }}>Defective Sleepers</h4>
                        <button className="toggle-btn mini" onClick={addDefectiveSleeper}>+ Add</button>
                    </div>
                    {formData.defectiveSleeperDetails.map((sleeper, idx) => (
                        <div key={idx} style={{
                            display: 'grid',
                            gridTemplateColumns: `140px 80px 100px ${formData.visualCheck !== 'All OK' ? '1fr ' : ''}${formData.dimCheck !== 'All OK' ? '1fr ' : ''}auto`,
                            gap: '8px',
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            alignItems: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <input
                                type="number"
                                className="form-input-standard"
                                value={sleeper.benchNo}
                                placeholder="Bench No"
                                onChange={e => updateDefectiveSleeper(idx, 'benchNo', e.target.value)}
                            />
                            <select className="form-input-standard" value={sleeper.sequence} onChange={e => updateDefectiveSleeper(idx, 'sequence', e.target.value)}>
                                <option value="">Seq</option>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div style={{ padding: '8px', fontSize: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', fontWeight: '700' }}>
                                {sleeper.sleeperNo || '--'}
                            </div>

                            {formData.visualCheck !== 'All OK' && (
                                <select
                                    className="form-input-standard"
                                    value={sleeper.visualReason}
                                    onChange={e => updateDefectiveSleeper(idx, 'visualReason', e.target.value)}
                                >
                                    <option value="">-- Visual Reason --</option>
                                    <option value="Surface Cracks">Surface Cracks</option>
                                    <option value="Corner Breakage">Corner Breakage</option>
                                    <option value="Rail Seat Damage">Rail Seat Damage</option>
                                    <option value="Insert Missing">Insert Missing</option>
                                    <option value="Improper Finish">Improper Finish</option>
                                    <option value="Blowholes">Blowholes</option>
                                    <option value="Other">Other</option>
                                </select>
                            )}

                            {formData.dimCheck !== 'All OK' && (
                                <select
                                    className="form-input-standard"
                                    value={sleeper.dimReason}
                                    onChange={e => updateDefectiveSleeper(idx, 'dimReason', e.target.value)}
                                >
                                    <option value="">-- Dim. Reason --</option>
                                    <option value="Length Out of Tolerance">Length Out of Tolerance</option>
                                    <option value="Gauge Out of Tolerance">Gauge Out of Tolerance</option>
                                    <option value="Rail Seat Slanted">Rail Seat Slanted</option>
                                    <option value="Height Variation">Height Variation</option>
                                    <option value="Insert Alignment Error">Insert Alignment Error</option>
                                    <option value="Other">Other</option>
                                </select>
                            )}

                            <button
                                onClick={() => removeDefectiveSleeper(idx)}
                                style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 8px' }}
                                title="Remove row"
                            >×</button>
                        </div>
                    ))}
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

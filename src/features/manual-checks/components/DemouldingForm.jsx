import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../services/api';
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
        batch: '',
        gangNo: '',
        type: '',
        casting: getSafeToday(),
        process: '',
        visualCheck: 'All OK',
        dimCheck: 'All OK',
        remarks: '',
        defectiveSleeperDetails: []
    });

    const [verifiedDeclarations, setVerifiedDeclarations] = useState([]);
    const [declSearchTerm, setDeclSearchTerm] = useState('');
    const [isDeclDropdownOpen, setIsDeclDropdownOpen] = useState(false);
    const declDropdownRef = useRef(null);

    useEffect(() => {
        const fetchDecls = async () => {
            try {
                const response = await apiService.getVerifiedProductionDeclarations();
                if (response?.responseData) {
                    setVerifiedDeclarations(response.responseData);
                }
            } catch (error) {
                console.error("Error fetching declarations:", error);
            }
        };
        fetchDecls();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (declDropdownRef.current && !declDropdownRef.current.contains(event.target)) {
                setIsDeclDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        }
    }, [initialData, activeContainer]);

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
            
            // Auto-update defective sleepers bench number if bench (gangNo) changes
            if (field === 'gangNo') {
                newState.defectiveSleeperDetails = (newState.defectiveSleeperDetails || []).map(d => ({
                    ...d,
                    benchNo: value,
                    sleeperNo: (value && d.sequence) ? `${value}-${d.sequence}` : d.sleeperNo
                }));
            }

            // Handle "All Rejected" transition automatically
            const isAllRejectedVisual = newState.visualCheck === 'All Rejected';
            const isAllRejectedDim = newState.dimCheck === 'All Rejected';

            if (isAllRejectedVisual || isAllRejectedDim) {
                const ALL_SEQS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                const currentDecls = [...newState.defectiveSleeperDetails];
                
                ALL_SEQS.forEach(seq => {
                    if (!currentDecls.find(d => d.sequence === seq)) {
                        currentDecls.push({
                            benchNo: newState.gangNo || '',
                            sequence: seq,
                            sleeperNo: newState.gangNo ? `${newState.gangNo}-${seq}` : seq,
                            visualReason: '',
                            dimReason: ''
                        });
                    }
                });
                newState.defectiveSleeperDetails = currentDecls;
            } else if (newState.visualCheck === 'All OK' && newState.dimCheck === 'All OK') {
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
            batchNo: String(formData.batch || ''),
            benchNo: String(formData.gangNo || ''),
            sleeperType: formData.type || 'RT-1234',
            processStatus: formData.process || 'Satisfactory',
            visualCheck: formData.visualCheck || 'All OK',
            dimCheck: formData.dimCheck || 'All OK',
            overallRemarks: formData.remarks || '',
            createdBy: localStorage.getItem('userId') || "0",
            updatedBy: localStorage.getItem('userId') || "0",
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
            defectiveSleeperDetails: [...prev.defectiveSleeperDetails, { 
                benchNo: prev.gangNo || '', 
                sequence: '', 
                sleeperNo: '', 
                visualReason: '', 
                dimReason: '' 
            }]
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

    const renderDeclarationDropdown = (label, fieldId, stateValue, onChangeHandler, placeholder) => {
        const isOpen = isDeclDropdownOpen === fieldId;
        return (
            <div className="form-field" ref={isOpen ? declDropdownRef : null}>
                <label htmlFor={fieldId} style={{ fontSize: '11px', fontWeight: '700' }}>{label} <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                    <input
                        id={fieldId}
                        type="text"
                        placeholder={placeholder}
                        value={isOpen ? declSearchTerm : stateValue}
                        onClick={() => {
                            setIsDeclDropdownOpen(fieldId);
                            setDeclSearchTerm('');
                        }}
                        onChange={(e) => {
                            setDeclSearchTerm(e.target.value);
                            if(e.target.value === '') onChangeHandler('');
                            setIsDeclDropdownOpen(fieldId);
                        }}
                        className="form-input-standard"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        autoComplete="off"
                    />
                    {isOpen && (
                        <ul style={{
                            position: 'absolute', zIndex: 10, background: 'white',
                            border: '1px solid #cbd5e1', width: '100%', maxHeight: '200px',
                            overflowY: 'auto', listStyle: 'none', padding: 0, margin: '4px 0 0 0',
                            borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {verifiedDeclarations
                                .filter(m => m.toLowerCase().includes(declSearchTerm.toLowerCase()))
                                .map((m, idx) => (
                                    <li key={idx} 
                                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' }}
                                        onClick={() => {
                                            onChangeHandler(m);
                                            setDeclSearchTerm('');
                                            setIsDeclDropdownOpen(false);
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >{m}</li>
                                ))}
                            {verifiedDeclarations.filter(m => m.toLowerCase().includes(declSearchTerm.toLowerCase())).length === 0 && (
                                <li style={{ padding: '8px 12px', color: '#94a3b8' }}>No results found</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard" style={{ marginBottom: '20px' }}>
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Location</label>
                    <div className="form-info-card">{formData.location}</div>
                </div>

                {/* 2. Properly Bound using VALUE and ONCHANGE */}
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="dim-inspectionDateTime" style={{ fontSize: '11px', fontWeight: '700' }}>Inspection Date & Time <span className="required">*</span></label>
                    <input
                        id="dim-inspectionDateTime"
                        type="datetime-local"
                        className="form-input-standard"
                        value={`${formData.inspectionDate}T${formData.inspectionTime}`}
                        onChange={e => {
                            const [d, t] = e.target.value.split('T');
                            setFormData(prev => ({ ...prev, inspectionDate: d, inspectionTime: t }));
                        }}
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

                {renderDeclarationDropdown("Batch No.", "dim-batch", formData.batch, (val) => handleChange('batch', val), "Search Batch...")}
                {renderDeclarationDropdown("Bench No.", "dim-gang", formData.gangNo, (val) => handleChange('gangNo', val), "Search Bench...")}

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

            {/* Defective Section: Visual Grid of Sleepers A-H */}
            {(formData.visualCheck !== 'All OK' || formData.dimCheck !== 'All OK') && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '800' }}>RECORDING DEFECTIVE SLEEPERS (BENCH {formData.gangNo || '—'})</h4>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                            {formData.visualCheck === 'All Rejected' || formData.dimCheck === 'All Rejected' ? '* All sleepers are marked rejected' : '* Click to mark sleeper as defective'}
                        </div>
                    </div>

                    {/* The Grid Tooltips/Chips */}
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '10px', 
                        padding: '16px', 
                        background: '#f8fafc', 
                        borderRadius: '12px', 
                        border: '1px dashed #cbd5e1',
                        marginBottom: '20px'
                    }}>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(seq => {
                            // Check if this sleeper is currently marked as defective
                            const isDefective = formData.defectiveSleeperDetails.some(d => d.sequence === seq);
                            
                            // Check if rejection is forced by "All Rejected" status
                            const isAllRejectedVisual = formData.visualCheck === 'All Rejected';
                            const isAllRejectedDim = formData.dimCheck === 'All Rejected';
                            const isForced = isAllRejectedVisual || isAllRejectedDim;

                            const handleClick = () => {
                                if (isForced) return; // Cannot toggle if forced by "All Rejected"
                                
                                setFormData(prev => {
                                    const exists = prev.defectiveSleeperDetails.some(d => d.sequence === seq);
                                    let updated;
                                    if (exists) {
                                        updated = prev.defectiveSleeperDetails.filter(d => d.sequence !== seq);
                                    } else {
                                        updated = [...prev.defectiveSleeperDetails, {
                                            benchNo: prev.gangNo || '',
                                            sequence: seq,
                                            sleeperNo: prev.gangNo ? `${prev.gangNo}-${seq}` : seq,
                                            visualReason: '',
                                            dimReason: ''
                                        }];
                                    }
                                    return { ...prev, defectiveSleeperDetails: updated };
                                });
                            };

                            return (
                                <div
                                    key={seq}
                                    onClick={handleClick}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '800',
                                        cursor: isForced ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        background: (isDefective || isForced) ? '#fee2e2' : '#fff',
                                        color: (isDefective || isForced) ? '#b91c1c' : '#64748b',
                                        border: '2px solid',
                                        borderColor: (isDefective || isForced) ? '#ef4444' : '#e2e8f0',
                                        boxShadow: (isDefective || isForced) ? '0 4px 12px rgba(239, 68, 68, 0.2)' : 'none',
                                        transform: (isDefective || isForced) ? 'scale(1.05)' : 'scale(1)'
                                    }}
                                >
                                    {seq}
                                </div>
                            );
                        })}
                    </div>

                    {/* Defect Reasons Table */}
                    {formData.defectiveSleeperDetails.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '10px 12px', width: '90px' }}>Sleeper</th>
                                        {/* Logic: Show Visual reason if not OK, UNLESS it's Partial + the other is All Rejected */}
                                        {(formData.visualCheck !== 'All OK' && !(formData.visualCheck === 'Partially OK' && formData.dimCheck === 'All Rejected')) && (
                                            <th style={{ padding: '10px 12px' }}>Visual Defect Reason</th>
                                        )}
                                        {/* Logic: Show Dim reason if not OK, UNLESS it's Partial + the other is All Rejected */}
                                        {(formData.dimCheck !== 'All OK' && !(formData.dimCheck === 'Partially OK' && formData.visualCheck === 'All Rejected')) && (
                                            <th style={{ padding: '10px 12px' }}>Dimensional Defect Reason</th>
                                        )}
                                        <th style={{ padding: '10px 12px', width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.defectiveSleeperDetails.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px', fontWeight: '800', color: '#1e293b' }}>
                                                {item.sleeperNo || `${item.benchNo}-${item.sequence}`}
                                            </td>
                                            
                                            {(formData.visualCheck !== 'All OK' && !(formData.visualCheck === 'Partially OK' && formData.dimCheck === 'All Rejected')) && (
                                                <td style={{ padding: '8px 12px' }}>
                                                    <select
                                                        className="form-input-standard"
                                                        style={{ width: '100%', fontSize: '11px', height: '32px' }}
                                                        value={item.visualReason}
                                                        onChange={e => updateDefectiveSleeper(idx, 'visualReason', e.target.value)}
                                                    >
                                                        <option value="">-- Select Visual Reason --</option>
                                                        <option value="Surface Cracks">Surface Cracks</option>
                                                        <option value="Corner Breakage">Corner Breakage</option>
                                                        <option value="Rail Seat Damage">Rail Seat Damage</option>
                                                        <option value="Insert Missing">Insert Missing</option>
                                                        <option value="Improper Finish">Improper Finish</option>
                                                        <option value="Blowholes">Blowholes</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </td>
                                            )}

                                            {(formData.dimCheck !== 'All OK' && !(formData.dimCheck === 'Partially OK' && formData.visualCheck === 'All Rejected')) && (
                                                <td style={{ padding: '8px 12px' }}>
                                                    <select
                                                        className="form-input-standard"
                                                        style={{ width: '100%', fontSize: '11px', height: '32px' }}
                                                        value={item.dimReason}
                                                        onChange={e => updateDefectiveSleeper(idx, 'dimReason', e.target.value)}
                                                    >
                                                        <option value="">-- Select Dim. Reason --</option>
                                                        <option value="Length Out of Tolerance">Length Out of Tolerance</option>
                                                        <option value="Gauge Out of Tolerance">Gauge Out of Tolerance</option>
                                                        <option value="Rail Seat Slanted">Rail Seat Slanted</option>
                                                        <option value="Height Variation">Height Variation</option>
                                                        <option value="Insert Alignment Error">Insert Alignment Error</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </td>
                                            )}

                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                {(formData.visualCheck === 'Partially OK' || formData.dimCheck === 'Partially OK') && (
                                                    <button
                                                        onClick={() => removeDefectiveSleeper(idx)}
                                                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                                                    >×</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <div className="form-actions-row">
                <button className="toggle-btn" type="button" onClick={handleSave} style={{ minWidth: '160px', height: '42px' }}>
                    {initialData ? 'Update Record' : 'Save Record'}
                </button>
                {initialData && <button className="toggle-btn secondary" type="button" onClick={onCancel}>Cancel</button>}
            </div>
        </div>
    );
};

export default DemouldingForm;

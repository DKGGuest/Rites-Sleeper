import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../services/api';
import '../../../components/common/Checkbox.css';
import { useShift } from '../../../context/ShiftContext';

const DemouldingForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer, sharedBatchNo, sharedBenchNo, onShiftFieldChange }) => {
    const { allWitnessedRecords, dutyUnit, dutyLocation, vendorId: contextVendorId } = useShift();
    
    // Exact State Mapping as requested by User
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

    const [validationErrors, setValidationErrors] = useState([]);
    const [batches, setBatches] = useState([]);
    const [benches, setBenches] = useState([]);
    const [sleeperTypes, setSleeperTypes] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);

    const vendorId = contextVendorId || localStorage.getItem('vendorId') || "134";

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

    // Modify Must Spread Full Row
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
                defectiveSleeperDetails: (initialData.defectiveSleepers || initialData.defectiveSleeperDetails || [])
                    .filter(d => Boolean(d.sequenceNo || d.sequence || d.sleeperNo)) // Filter out empty defaults
                    .map(d => ({
                        benchNo: d.benchGangNo || d.benchNo || "",
                        sequence: d.sequenceNo || d.sequence || "",
                        sleeperNo: d.sleeperNo || "",
                        visualReason: d.visualReason || "",
                        dimReason: d.dimReason || "",
                        defectType: d.visualReason ? "Visual" : (d.dimReason ? "Dimensional" : "")
                    }))
            });
        }
    }, [initialData, activeContainer]);

    // Fetch Dynamic Locations for current Unit
    useEffect(() => {
        const fetchLocations = async () => {
            const vId = contextVendorId || localStorage.getItem('vendorId');
            if (dutyUnit && vId) {
                try {
                    // Reusing the same service function updated for the new API
                    const sheds = await apiService.getPlantSheds(vId, dutyUnit);

                    let locList = [];
                    const data = sheds?.responseData || sheds;
                    if (typeof data === 'object' && data !== null) {
                        Object.entries(data).forEach(([type, ids]) => {
                            if (Array.isArray(ids)) {
                                ids.forEach(id => {
                                    const roman = id === 1 ? 'I' : id === 2 ? 'II' : id === 3 ? 'III' : id === 4 ? 'IV' : id;
                                    locList.push(`${type} ${roman}`);
                                });
                            }
                        });
                    }
                    setAvailableLocations(locList);
                    if (locList.length > 0 && !formData.location) {
                        setFormData(prev => ({ ...prev, location: locList[0] }));
                    }
                } catch (err) {
                    console.error("Error fetching locations in form:", err);
                }
            }
        };
        fetchLocations();
    }, [dutyUnit, contextVendorId]);

    const formatToBackendDate = (dateStr) => {
        if (!dateStr) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split("-");
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    // Fetch batches when casting date changes
    useEffect(() => {
        if (formData.casting && !initialData) {
            const fetchBatches = async () => {
                try {
                    const formattedDate = formatToBackendDate(formData.casting);
                    // Pass selected plant id (dutyUnit) and location (dutyLocation) as requested
                    const response = await apiService.getAllProductionBatches(
                        vendorId, 
                        formattedDate, 
                        dutyUnit, 
                        dutyLocation
                    );
                    if (response?.responseData) {
                        setBatches(response.responseData);
                        if (!response.responseData.includes(formData.batch)) {
                            setFormData(prev => ({ ...prev, batch: '', gangNo: '', type: '' }));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching batches:", error);
                }
            };
            fetchBatches();
        }
    }, [formData.casting, vendorId, initialData, dutyUnit, dutyLocation]);

    // Fetch benches when batch changes
    useEffect(() => {
        if (formData.batch && !initialData) {
            const fetchBenches = async () => {
                try {
                    const response = await apiService.getAllProductionBenches(formData.batch);
                    if (response?.responseData) {
                        const newBenches = response.responseData;
                        setBenches(newBenches);
                        
                        // Autofetch: If there's a bench, select the first one (ALWAYS on batch change)
                        if (newBenches.length > 0) {
                            setFormData(prev => ({ 
                                ...prev, 
                                gangNo: String(newBenches[0]) 
                            }));
                        }
                    }

                    // Autofetch Location on Batch selection
                    let foundLoc = '';
                    Object.values(allWitnessedRecords || {}).forEach(records => {
                        const match = records.find(r => String(r.batchNo) === String(formData.batch));
                        if (match && match.location) foundLoc = match.location;
                    });
                    if (foundLoc) {
                        setFormData(prev => ({ ...prev, location: foundLoc }));
                    }
                } catch (error) {
                    console.error("Error fetching benches:", error);
                }
            };
            fetchBenches();
        } else if (!formData.batch) {
            setBenches([]);
        }
    }, [formData.batch, initialData, allWitnessedRecords]);

    // Fetch sleeper types when bench changes
    useEffect(() => {
        if (formData.batch && formData.gangNo && !initialData) {
            const fetchSleeperTypes = async () => {
                try {
                    const response = await apiService.getAllProductionSleeperTypes(formData.batch, formData.gangNo);
                    if (response?.responseData) {
                        const newTypes = response.responseData;
                        setSleeperTypes(newTypes);
                        
                        // Autofetch: If there's a type, select the first one (ALWAYS on bench change)
                        if (newTypes.length > 0) {
                            setFormData(prev => ({ 
                                ...prev, 
                                type: newTypes[0] 
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching sleeper types:", error);
                }
            };
            fetchSleeperTypes();
        } else if (!formData.gangNo) {
            setSleeperTypes([]);
        }
    }, [formData.batch, formData.gangNo, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            
            // If selecting a new batch, reset sub-selections to allow fresh autofetch
            if (field === 'batch') {
                newState.gangNo = '';
                newState.type = '';
            }
            if (field === 'gangNo') {
                newState.type = '';
            }

            // Auto-update defective sleepers bench number if bench (gangNo) changes
            if (field === 'gangNo') {
                newState.defectiveSleeperDetails = (newState.defectiveSleeperDetails || []).map(d => ({
                    ...d,
                    benchNo: value,
                    sleeperNo: (value && d.sequence) ? `${value}${d.sequence}` : d.sleeperNo
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
                            sleeperNo: newState.gangNo ? `${newState.gangNo}${seq}` : seq,
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

    const [showValidation, setShowValidation] = useState(false);

    const handleSave = () => {
        const errors = [];
        if (!formData.batch) errors.push('Batch No.');
        if (!formData.gangNo) errors.push(`${fieldLabel} No.`);
        if (!formData.type) errors.push('Sleeper Type');
        if (!formData.process) errors.push('Process Status');
        if (!formData.remarks) errors.push('Overall Remarks');

        // Validation: only require manual sleeper selection when checks are non-OK
        const bothAllOk = formData.visualCheck === 'All OK' && formData.dimCheck === 'All OK';
        if (!bothAllOk && formData.defectiveSleeperDetails.length === 0) {
            errors.push(`At least one ${fieldLabel} sleeper must be selected from the grid below`);
        }

        // If checks are not OK, ensure reasons are filled
        if (!bothAllOk && formData.defectiveSleeperDetails.length > 0) {
            const hasUnfilledReasons = formData.defectiveSleeperDetails.some(d => {
                const needsVisual = formData.visualCheck !== 'All OK';
                const needsDim = formData.dimCheck !== 'All OK';
                return (needsVisual && !d.visualReason) || (needsDim && !d.dimReason);
            });
            if (hasUnfilledReasons) {
                errors.push('All selected defective sleepers must have a defect reason filled in');
            }
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidation(true);
            return;
        }
        setShowValidation(false);
        setValidationErrors([]);

        // Build defective sleepers payload:
        // - "All OK": auto-send all 8 positions with empty reasons (backend requires non-empty array)
        // - Non-OK: use manually selected sleepers with their reasons
        const gangNo = formData.gangNo || '';
        const allSleeperSeqs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        const mappedDefectiveSleepers = bothAllOk
            ? allSleeperSeqs.map(seq => ({
                benchGangNo: gangNo,
                sequenceNo: seq,
                sleeperNo: gangNo ? `${gangNo}${seq}` : seq,
                visualReason: "",
                dimReason: ""
            }))
            : formData.defectiveSleeperDetails.map(item => ({
                benchGangNo: String(item.benchNo || gangNo || ""),
                sequenceNo: String(item.sequence || ""),
                sleeperNo: String(item.sleeperNo || `${item.benchNo || gangNo}${item.sequence}` || ""),
                visualReason: formData.visualCheck !== 'All OK' ? String(item.visualReason || "") : "",
                dimReason: formData.dimCheck !== 'All OK' ? String(item.dimReason || "") : ""
            }));

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
            createdBy: String(localStorage.getItem('userId') || "0"),
            updatedBy: String(localStorage.getItem('userId') || "0"),
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
                updated[index].sleeperNo = (b && s) ? `${b}${s}` : '';
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

    const fieldLabel = (formData.location || '').toLowerCase().includes('line') ? 'Gang' : 'Bench';

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard" style={{ marginBottom: '20px' }}>
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Location</label>
                    <select
                        className="form-input-standard"
                        value={formData.location}
                        onChange={e => handleChange('location', e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                        <option value="N/A">-- Select --</option>
                        {availableLocations.length > 0 ? (
                            availableLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))
                        ) : (
                            <>
                                <option value="Long Line">Long Line</option>
                                <option value="Line 1">Line 1</option>
                                <option value="Line 2">Line 2</option>
                                <option value="Line 3">Line 3</option>
                                <option value="Shed 1">Shed 1</option>
                                <option value="Shed 2">Shed 2</option>
                                <option value="Shed 3">Shed 3</option>
                            </>
                        )}
                    </select>
                </div>

                {/* Properly Bound using VALUE and ONCHANGE */}
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

                <div className="form-field">
                    <label htmlFor="dim-batch" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <select
                        id="dim-batch"
                        className="form-input-standard"
                        value={formData.batch}
                        onChange={e => handleChange('batch', e.target.value)}
                        style={{ border: (showValidation && !formData.batch) ? '2px solid #ef4444' : '', background: (showValidation && !formData.batch) ? '#fef2f2' : '' }}
                    >
                        <option value="">-- Select Batch --</option>
                        {batches.map((b, idx) => (
                            <option key={idx} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-gang" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <select
                        id="dim-gang"
                        className="form-input-standard"
                        value={formData.gangNo}
                        onChange={e => handleChange('gangNo', e.target.value)}
                        style={{ border: (showValidation && !formData.gangNo) ? '2px solid #ef4444' : '', background: (showValidation && !formData.gangNo) ? '#fef2f2' : '' }}
                    >
                        <option value="">-- Select Bench --</option>
                        {benches.map((b, idx) => (
                            <option key={idx} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-type" style={{ fontSize: '11px', fontWeight: '700' }}>Sleeper Type <span className="required">*</span></label>
                    <select
                        id="dim-type"
                        className="form-input-standard"
                        value={formData.type}
                        onChange={e => handleChange('type', e.target.value)}
                        style={{ border: (showValidation && !formData.type) ? '2px solid #ef4444' : '', background: (showValidation && !formData.type) ? '#fef2f2' : '' }}
                    >
                        <option value="">-- Select Type --</option>
                        {sleeperTypes.map((t, idx) => (
                            <option key={idx} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="dim-process" style={{ fontSize: '11px', fontWeight: '700' }}>Process Status <span className="required">*</span></label>
                    <select id="dim-process" value={formData.process} className="form-input-standard" onChange={e => handleChange('process', e.target.value)} style={{ border: (showValidation && !formData.process) ? '2px solid #ef4444' : '', background: (showValidation && !formData.process) ? '#fef2f2' : '' }}>
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
                        style={{ border: (showValidation && !formData.remarks) ? '2px solid #ef4444' : '', background: (showValidation && !formData.remarks) ? '#fef2f2' : '' }}
                    />
                </div>
            </div>

            {/* Defective Section: Only shown when at least one check is non-OK */}
            {(formData.visualCheck !== 'All OK' || formData.dimCheck !== 'All OK') && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '800' }}>
                                DEFECTIVE SLEEPERS — {fieldLabel.toUpperCase()} {formData.gangNo || '—'}
                            </h4>
                        </div>
                        <div style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic', fontWeight: '700', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                            {formData.visualCheck === 'All Rejected' || formData.dimCheck === 'All Rejected'
                                ? '* All sleepers are marked rejected'
                                : '⚠ Required: Click sleepers to mark as defective'}
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
                                            sleeperNo: prev.gangNo ? `${prev.gangNo}${seq}` : seq,
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
                                        minWidth: '56px',
                                        height: '44px',
                                        padding: '0 10px',
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
                                    {formData.gangNo ? `${formData.gangNo}${seq}` : seq}
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
                                                {item.sleeperNo || `${item.benchNo}${item.sequence}`}
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
                                                {/* Show remove button always — not just for Partially OK */}
                                                {!(formData.visualCheck === 'All Rejected' || formData.dimCheck === 'All Rejected') && (
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

            {/* Validation Errors Modal */}
            {validationErrors.length > 0 && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.45)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                    padding: '24px'
                }}>
                    <div className="fade-in" style={{
                        maxWidth: '400px',
                        width: '100%',
                        background: '#fff',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: '#ef4444',
                            fontSize: '20px'
                        }}>!</div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>Incomplete Data</h3>
                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                            The following mandatory fields are required before saving:
                        </p>
                        
                        <div style={{ 
                            background: '#f8fafc', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            marginBottom: '2rem',
                            textAlign: 'left',
                            border: '1px solid #f1f5f9'
                        }}>
                            <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#dc2626', fontSize: '0.875rem', fontWeight: '700', lineHeight: '1.8' }}>
                                {validationErrors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => setValidationErrors([])}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '14px',
                                border: 'none',
                                background: '#1e293b',
                                color: '#fff',
                                fontWeight: '800',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.2)',
                                transition: 'all 0.2s'
                            }}
                        >Understand & Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemouldingForm;

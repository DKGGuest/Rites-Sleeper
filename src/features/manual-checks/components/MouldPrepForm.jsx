import React, { useState } from 'react';
import '../../../components/common/Checkbox.css';

/**
 * MouldPrepForm Component
 * Refactored to follow enterprise standards:
 * - Functional component with hooks
 * - Clear props and state management
 * - Responsive layout support (via CSS classes)
 * - Separation of concerns
 */
const MouldPrepForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer }) => {
    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-GB'), // Auto date
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '',
        benchNo: '',
        lumpsFree: '',
        oilApplied: '',
        remarks: ''
    });

    React.useEffect(() => {
        if (initialData) {
            // Helper function to convert backend value to Yes/No
            const convertToYesNo = (value) => {
                if (value === 1 || value === true || value === 'Yes') return 'Yes';
                if (value === 0 || value === false || value === 'No') return 'No';
                return '';
            };

            setFormData({
                date: initialData.date || new Date().toLocaleDateString('en-GB'),
                time: initialData.time,
                batchNo: initialData.batchNo || '',
                benchNo: initialData.benchNo,
                lumpsFree: convertToYesNo(initialData.lumpsFree),
                oilApplied: convertToYesNo(initialData.oilApplied),
                remarks: initialData.remarks || ''
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.time || !formData.benchNo || !formData.batchNo || !formData.lumpsFree || !formData.oilApplied) {
            alert('Please fill in all required fields (Batch No, Time, Number and Dropdowns).');
            return;
        }

        // Strict Duplicate Check (Bench/Batch)
        const isDuplicate = (existingEntries || []).some(entry =>
            entry.benchNo === formData.benchNo &&
            entry.batchNo === formData.batchNo &&
            entry.id !== initialData?.id
        );
        if (isDuplicate) {
            const fieldLabel = isLongLine ? 'Gang' : 'Bench';
            alert(`${fieldLabel} No. ${formData.benchNo} for Batch ${formData.batchNo} has already been entered. Duplicate entries are not allowed.`);
            return;
        }

        // Convert Yes/No to 1/0 for backend
        const payload = {
            ...formData,
            lumpsFree: formData.lumpsFree === 'Yes' ? 1 : 0,
            oilApplied: formData.oilApplied === 'Yes' ? 1 : 0
        };

        console.log('🔧 MouldPrepForm - Converting Yes/No to numeric values');
        console.log('Original values:', { lumpsFree: formData.lumpsFree, oilApplied: formData.oilApplied });
        console.log('Converted values:', { lumpsFree: payload.lumpsFree, oilApplied: payload.oilApplied });
        console.log('Full payload:', payload);

        onSave(payload);

        // Reset specific fields after save
        // Reset fields after save to ensure dropdowns go back to "-- Select --"
        setFormData(prev => ({
            ...prev,
            benchNo: '',
            lumpsFree: '',
            oilApplied: '',
            remarks: ''
        }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard">
                {/* 1. Line/Shed No (Auto) */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Line / Shed No.</label>
                    <div className="form-info-card">
                        {activeContainer?.name || 'N/A'}
                    </div>
                </div>

                {/* 2. Date (Auto) */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Date</label>
                    <div className="form-info-card">
                        {formData.date}
                    </div>
                </div>

                {/* 3. Time */}
                <div className="form-field">
                    <label htmlFor="prep-time" style={{ fontSize: '11px', fontWeight: '700' }}>Time <span className="required">*</span></label>
                    <input
                        id="prep-time"
                        type="time"
                        className="form-input-standard"
                        value={formData.time}
                        onChange={e => handleChange('time', e.target.value)}
                    />
                </div>

                {/* 4. Batch No (Int) */}
                <div className="form-field">
                    <label htmlFor="batch-no" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <input
                        id="batch-no"
                        type="number"
                        placeholder="Batch No"
                        className="form-input-standard"
                        value={formData.batchNo}
                        onChange={e => handleChange('batchNo', e.target.value)}
                    />
                </div>

                {/* 5. Bench/Gang No (Int) */}
                <div className="form-field">
                    <label htmlFor="bench-no" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <input
                        id="bench-no"
                        type="number"
                        placeholder={`${fieldLabel} No`}
                        className="form-input-standard"
                        value={formData.benchNo}
                        onChange={e => handleChange('benchNo', e.target.value)}
                    />
                </div>

                {/* 6. Lumps Free (Dropdown) */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Mould Cleaned? <span className="required">*</span></label>
                    <select
                        className="form-input-standard"
                        value={formData.lumpsFree}
                        onChange={e => handleChange('lumpsFree', e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        <option value="Yes">Yes (Lumps Free)</option>
                        <option value="No">No (Has Lumps)</option>
                    </select>
                </div>

                {/* 7. Mould Oil (Dropdown) */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Oil Applied? <span className="required">*</span></label>
                    <select
                        className="form-input-standard"
                        value={formData.oilApplied}
                        onChange={e => handleChange('oilApplied', e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>

                {/* Remarks - Span wider if possible */}
                <div className="form-field form-field-full">
                    <label htmlFor="remarks" style={{ fontSize: '11px', fontWeight: '700' }}>Remarks</label>
                    <input
                        id="remarks"
                        type="text"
                        placeholder="Additional remarks"
                        className="form-input-standard"
                        value={formData.remarks}
                        onChange={e => handleChange('remarks', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-actions-row">
                <button className="toggle-btn" onClick={handleSave}>
                    {initialData ? 'Update Entry' : 'Save Entry'}
                </button>
                {initialData && (
                    <button className="toggle-btn secondary" onClick={onCancel}>Cancel</button>
                )}
            </div>
        </div>

    );
};

export default MouldPrepForm;

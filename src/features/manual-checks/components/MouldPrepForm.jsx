import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const MouldPrepForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer }) => {
    const getLocalISOString = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return (new Date(now - offset)).toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        location: activeContainer?.name || 'N/A',
        dateTime: getLocalISOString(),
        batchNo: '',
        benchNo: '',
        sleeperType: '',
        mouldCleaned: '',
        oilApplied: '',
        remarks: ''
    });

    const formatFromBackendDatePart = (dateStr) => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
            const [d, m, y] = dateStr.split('/');
            return `${y}-${m}-${d}`;
        }
        return dateStr;
    };

    const formatForInput = (dt, time) => {
        if (!dt) return getLocalISOString();
        if (dt.includes('T')) return dt.substring(0, 16);
        const datePart = formatFromBackendDatePart(dt);
        const timePart = time || '00:00';
        return `${datePart}T${timePart.substring(0, 5)}`;
    };

    useEffect(() => {
        if (initialData) {
            const convertToYesNo = (value) => {
                if (value === 1 || value === true || value === 'Yes') return 'Yes';
                if (value === 0 || value === false || value === 'No') return 'No';
                return '';
            };

            setFormData({
                ...initialData,
                location: initialData.lineShedNo || initialData.location || activeContainer?.name || 'N/A',
                dateTime: formatForInput(initialData.dateTime || initialData.preparationDate || initialData.date || initialData.createdDate, initialData.preparationTime || initialData.time),
                batchNo: initialData.batchNo || initialData.batch || '',
                benchNo: initialData.benchNo || initialData.benchGangNo || '',
                mouldCleaned: convertToYesNo(initialData.mouldCleaned !== undefined ? initialData.mouldCleaned : initialData.lumpsFree),
                oilApplied: convertToYesNo(initialData.oilApplied)
            });
            console.log('📋 MouldPrepForm - Prefilled from:', initialData);
        }
    }, [initialData, activeContainer]);

    // Auto-fetch Sleeper Type derivation
    useEffect(() => {
        if (formData.benchNo && !initialData) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            const type = types[parseInt(formData.benchNo) % 3] || 'RT-1234';
            setFormData(prev => ({ ...prev, sleeperType: type }));
        }
    }, [formData.benchNo, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        if (!formData.benchNo || !formData.batchNo || !formData.mouldCleaned || !formData.oilApplied) {
            alert('Please fill in all required fields (Batch, Bench, Cleaning & Oiling).');
            return;
        }

        // Payload matching mould-preparation-controller schema exactly
        const payload = {
            lineShedNo: formData.location || activeContainer?.name || 'N/A',
            preparationDate: formatToBackendDate(formData.dateTime.split('T')[0]),
            preparationTime: formData.dateTime.split('T')[1],
            batchNo: parseInt(formData.batchNo) || 0,
            benchNo: parseInt(formData.benchNo) || 0,
            mouldCleaned: formData.mouldCleaned === 'Yes',
            oilApplied: formData.oilApplied === 'Yes',
            remarks: formData.remarks || '',
            createdBy: 0,
            updateBy: 0
        };

        onSave(payload);

        // Reset fields after save
        setFormData(prev => ({
            ...prev,
            benchNo: '',
            mouldCleaned: '',
            oilApplied: '',
            remarks: ''
        }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard">
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Location</label>
                    <div className="form-info-card">{formData.location}</div>
                </div>

                <div className="form-field">
                    <label htmlFor="prep-datetime" style={{ fontSize: '11px', fontWeight: '700' }}>Date & Time <span className="required">*</span></label>
                    <input
                        id="prep-datetime"
                        type="datetime-local"
                        className="form-input-standard"
                        value={formData.dateTime}
                        onChange={e => handleChange('dateTime', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="batchNo" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <input
                        id="batchNo"
                        type="number"
                        placeholder="Batch No"
                        className="form-input-standard"
                        value={formData.batchNo}
                        onChange={e => handleChange('batchNo', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="benchNo" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <input
                        id="benchNo"
                        type="number"
                        placeholder={`${fieldLabel} No`}
                        className="form-input-standard"
                        value={formData.benchNo}
                        onChange={e => handleChange('benchNo', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Sleeper Type</label>
                    <div className="form-info-card" style={{ background: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
                        {formData.sleeperType || 'N/A'}
                    </div>
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Mould Cleaned? <span className="required">*</span></label>
                    <select
                        className="form-input-standard"
                        value={formData.mouldCleaned}
                        onChange={e => handleChange('mouldCleaned', e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        <option value="Yes">Yes (Lumps Free)</option>
                        <option value="No">No (Has Lumps)</option>
                    </select>
                </div>

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
                    {initialData ? 'Update Record' : 'Save Record'}
                </button>
                {initialData && <button className="toggle-btn secondary" onClick={onCancel}>Cancel</button>}
            </div>
        </div>
    );
};

export default MouldPrepForm;

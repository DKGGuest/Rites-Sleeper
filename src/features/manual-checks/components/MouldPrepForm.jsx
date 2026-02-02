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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        lumpsFree: false,
        oilApplied: false,
        remarks: ''
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                time: initialData.time,
                benchNo: initialData.benchNo,
                lumpsFree: initialData.lumpsFree,
                oilApplied: initialData.oilApplied,
                remarks: initialData.remarks
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.time || !formData.benchNo) {
            alert('Please fill in all required fields.');
            return;
        }

        // Strict Duplicate Check
        const isDuplicate = (existingEntries || []).some(entry => entry.benchNo === formData.benchNo && entry.id !== initialData?.id);
        if (isDuplicate) {
            const fieldLabel = isLongLine ? 'Gang' : 'Bench';
            alert(`${fieldLabel} No. ${formData.benchNo} has already been entered in this shift. Duplicate entries are not allowed.`);
            return;
        }

        onSave(formData);
        // Reset specific fields after save
        setFormData(prev => ({ ...prev, benchNo: '', remarks: '' }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>Mould Preparation Details ({isLongLine ? 'Long Line Plant' : 'Short Line Plant'})</h3>
            </div>
            <div className="form-grid">
                <div className="form-field">
                    <label>{activeContainer?.type === 'Line' ? 'Line No.' : 'Shed No.'}</label>
                    <input
                        type="text"
                        readOnly
                        value={activeContainer?.name || ''}
                        className="readOnly"
                        style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="prep-time">Time <span className="required">*</span></label>
                    <input
                        id="prep-time"
                        type="time"
                        value={formData.time}
                        onChange={e => handleChange('time', e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="bench-no">{fieldLabel} No. <span className="required">*</span></label>
                    <input
                        id="bench-no"
                        type="number"
                        placeholder={`Enter ${fieldLabel} Number`}
                        value={formData.benchNo}
                        onChange={e => handleChange('benchNo', e.target.value)}
                    />
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label>Quality Checks</label>
                    <div className="checkbox-group" style={{ display: 'flex', gap: '2.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input
                                type="checkbox"
                                checked={formData.lumpsFree}
                                onChange={e => handleChange('lumpsFree', e.target.checked)}
                            />
                            Free from concrete lumps & foreign matters etc.
                        </label>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input
                                type="checkbox"
                                checked={formData.oilApplied}
                                onChange={e => handleChange('oilApplied', e.target.checked)}
                            />
                            Mould Oil Applied
                        </label>
                    </div>
                </div>
                <div className="form-field">
                    <label htmlFor="remarks">Remarks</label>
                    <input
                        id="remarks"
                        type="text"
                        placeholder="Enter additional remarks"
                        value={formData.remarks}
                        onChange={e => handleChange('remarks', e.target.value)}
                    />
                </div>
            </div>
            <div className="form-actions-center" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="toggle-btn" onClick={handleSave}>Save Entry</button>
                <button className="toggle-btn" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default MouldPrepForm;

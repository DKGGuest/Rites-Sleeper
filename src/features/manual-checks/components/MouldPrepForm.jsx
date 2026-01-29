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
const MouldPrepForm = ({ onSave }) => {
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        lumpsFree: false,
        oilApplied: false,
        remarks: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.time || !formData.benchNo) {
            alert('Please fill in all required fields.');
            return;
        }
        onSave(formData);
        // Reset specific fields after save
        setFormData(prev => ({ ...prev, benchNo: '', remarks: '' }));
    };

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>Mould Preparation Details</h3>
            </div>
            <div className="form-grid">
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
                    <label htmlFor="bench-no">Bench No. <span className="required">*</span></label>
                    <input
                        id="bench-no"
                        type="number"
                        placeholder="Enter Bench Number"
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
            <div className="form-actions-center">
                <button className="toggle-btn" onClick={handleSave}>Save Entry</button>
            </div>
        </div>
    );
};

export default MouldPrepForm;

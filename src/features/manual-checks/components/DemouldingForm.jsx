import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const DemouldingForm = ({ onSave, isLongLine, initialData, activeContainer }) => {
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        sleeperType: '',
        processSatisfactory: false,
        visualCheck: 'Ok',
        visualDefect: '',
        dimCheck: 'Ok',
        dimDefect: '',
        remarks: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                time: initialData.time || '',
                benchNo: initialData.benchNo || '',
                sleeperType: initialData.sleeperType || '',
                processSatisfactory: initialData.processSatisfactory || false,
                visualCheck: initialData.visualCheck || 'Ok',
                visualDefect: initialData.visualDefect || '',
                dimCheck: initialData.dimCheck || 'Ok',
                dimDefect: initialData.dimDefect || '',
                remarks: initialData.remarks || ''
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.benchNo && !initialData) { // Only auto-fetch if not editing
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            setFormData(prev => ({ ...prev, sleeperType: types[parseInt(formData.benchNo) % 3] }));
        }
    }, [formData.benchNo, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            // Clear defects if check is OK
            if (field === 'visualCheck' && value === 'Ok') newState.visualDefect = '';
            if (field === 'dimCheck' && value === 'Ok') newState.dimDefect = '';
            return newState;
        });
    };

    const handleSave = () => {
        if (!formData.benchNo || !formData.remarks) {
            alert('Please fill in all required fields.');
            return;
        }
        onSave(formData);
        setFormData(prev => ({ ...prev, benchNo: '', visualDefect: '', dimDefect: '', remarks: '' }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>Demoulding of Sleepers Details ({isLongLine ? 'Long Line Plant' : 'Short Line Plant'})</h3>
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
                    <label htmlFor="demould-time">Time <span className="required">*</span></label>
                    <input id="demould-time" type="time" value={formData.time} onChange={e => handleChange('time', e.target.value)} />
                </div>
                <div className="form-field">
                    <label htmlFor="demould-bench">{fieldLabel} No. <span className="required">*</span></label>
                    <input id="demould-bench" type="number" placeholder={`Enter ${fieldLabel} No`} value={formData.benchNo} onChange={e => handleChange('benchNo', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Type of Sleeper (Auto)</label>
                    <input type="text" readOnly value={formData.sleeperType} className="readOnly" style={{ background: '#f8fafc', color: '#64748b' }} placeholder="Auto-populated" />
                </div>
                <div className="form-field" style={{ gridColumn: formData.visualCheck === 'Not OK' ? 'auto' : 'span 2' }}>
                    <label>Process Satisfactory?</label>
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                        <input type="checkbox" checked={formData.processSatisfactory} onChange={e => handleChange('processSatisfactory', e.target.checked)} />
                        Demoulding Process OK
                    </label>
                </div>

                <div className="form-field">
                    <label htmlFor="visual-check">Visual Check <span className="required">*</span></label>
                    <select id="visual-check" value={formData.visualCheck} onChange={e => handleChange('visualCheck', e.target.value)}>
                        <option value="Ok">Ok</option>
                        <option value="Not OK">Not OK</option>
                    </select>
                </div>
                {formData.visualCheck === 'Not OK' && (
                    <div className="form-field">
                        <label htmlFor="visual-defect">Visual Defect <span className="required">*</span></label>
                        <select id="visual-defect" value={formData.visualDefect} onChange={e => handleChange('visualDefect', e.target.value)}>
                            <option value="">Select Defect</option>
                            <option value="Cracks">Cracks</option>
                            <option value="Honey Combing">Honey Combing</option>
                            <option value="Chipping">Chipping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                )}

                <div className="form-field">
                    <label htmlFor="dim-check">Dimensional Check <span className="required">*</span></label>
                    <select id="dim-check" value={formData.dimCheck} onChange={e => handleChange('dimCheck', e.target.value)}>
                        <option value="Ok">Ok</option>
                        <option value="Not OK">Not OK</option>
                    </select>
                </div>
                {formData.dimCheck === 'Not OK' && (
                    <div className="form-field">
                        <label htmlFor="dim-defect">Dimensional Defect <span className="required">*</span></label>
                        <select id="dim-defect" value={formData.dimDefect} onChange={e => handleChange('dimDefect', e.target.value)}>
                            <option value="">Select Defect</option>
                            <option value="Length deviation">Length deviation</option>
                            <option value="Width deviation">Width deviation</option>
                            <option value="Height deviation">Height deviation</option>
                        </select>
                    </div>
                )}

                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="demould-remarks">Remarks <span className="required">*</span></label>
                    <input id="demould-remarks" type="text" placeholder="Enter findings" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} />
                </div>
            </div>
            <div className="form-actions-center">
                <button className="toggle-btn" onClick={handleSave}>Save Entry</button>
            </div>
        </div>
    );
};

export default DemouldingForm;

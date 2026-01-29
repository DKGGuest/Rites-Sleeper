import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const HTSWireForm = ({ onSave }) => {
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        sleeperType: '',
        wiresUsed: '',
        satisfactory: false,
        layLengthCheck: false,
        htsArrangementCheck: false,
        wireDia: '',
        remarks: ''
    });

    // Business Logic: Auto-fetch Sleeper Type based on Bench No
    useEffect(() => {
        if (formData.benchNo) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            setFormData(prev => ({ ...prev, sleeperType: types[parseInt(formData.benchNo) % 3] }));
        } else {
            setFormData(prev => ({ ...prev, sleeperType: '' }));
        }
    }, [formData.benchNo]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.benchNo || !formData.wiresUsed || !formData.wireDia) {
            alert('Please fill in all required fields.');
            return;
        }
        onSave(formData);
        setFormData(prev => ({ ...prev, benchNo: '', wiresUsed: '', wireDia: '', remarks: '' }));
    };

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>Placement of HTS Wire</h3>
            </div>
            <div className="form-grid">
                <div className="form-field">
                    <label htmlFor="hts-time">Time <span className="required">*</span></label>
                    <input id="hts-time" type="time" value={formData.time} onChange={e => handleChange('time', e.target.value)} />
                </div>
                <div className="form-field">
                    <label htmlFor="hts-bench">Bench No. <span className="required">*</span></label>
                    <input id="hts-bench" type="number" placeholder="Enter Bench No" value={formData.benchNo} onChange={e => handleChange('benchNo', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Type of Sleeper (Auto)</label>
                    <input type="text" readOnly value={formData.sleeperType} className="readOnly" style={{ background: '#f8fafc', color: '#64748b' }} placeholder="Auto-populated" />
                </div>
                <div className="form-field">
                    <label htmlFor="wires-used">No. of Wires Used <span className="required">*</span></label>
                    <input id="wires-used" type="number" placeholder="Integer" value={formData.wiresUsed} onChange={e => handleChange('wiresUsed', e.target.value)} />
                </div>
                <div className="form-field">
                    <label htmlFor="wire-dia">HTS Wire Dia (mm) <span className="required">*</span></label>
                    <input id="wire-dia" type="number" step="0.01" placeholder="Float (e.g. 3.00)" value={formData.wireDia} onChange={e => handleChange('wireDia', e.target.value)} />
                    <span className="helper-text" style={{
                        fontSize: '10px',
                        marginTop: '4px',
                        color: (formData.wireDia && (parseFloat(formData.wireDia) < 2.97 || parseFloat(formData.wireDia) > 3.03)) ? 'var(--color-danger)' : 'var(--neutral-500)'
                    }}>
                        Required Range: 2.97 - 3.03 mm
                    </span>
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label>Quality Checks</label>
                    <div className="checkbox-list" style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '0.75rem' }}>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={formData.layLengthCheck} onChange={e => handleChange('layLengthCheck', e.target.checked)} />
                            Lay Length (72 to 108mm) OK?
                        </label>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={formData.htsArrangementCheck} onChange={e => handleChange('htsArrangementCheck', e.target.checked)} />
                            Arrangement of HTS wires as per sleeper drawing OK?
                        </label>
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={formData.satisfactory} onChange={e => handleChange('satisfactory', e.target.checked)} />
                            Overall Placement Satisfactory?
                        </label>
                    </div>
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="hts-remarks">Remarks</label>
                    <input id="hts-remarks" type="text" placeholder="Additional observations" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} />
                </div>
            </div>
            <div className="form-actions-center">
                <button className="toggle-btn" onClick={handleSave}>Save Entry</button>
            </div>
        </div>
    );
};

export default HTSWireForm;

import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const HTSWireForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer }) => {
    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '',
        benchNo: '',
        sleeperType: '',
        wiresUsed: '',
        wireDia: '',
        layLength: '',
        htsArrangementCheck: 'OK',
        overallStatus: 'OK',
        remarks: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date || new Date().toLocaleDateString('en-GB'),
                time: initialData.time || '',
                batchNo: initialData.batchNo || '',
                benchNo: initialData.benchNo || '',
                sleeperType: initialData.sleeperType || '',
                wiresUsed: initialData.wiresUsed || '',
                wireDia: initialData.wireDia || '',
                layLength: initialData.layLength || '',
                htsArrangementCheck: initialData.htsArrangementCheck || 'OK',
                overallStatus: initialData.overallStatus || 'OK',
                remarks: initialData.remarks || ''
            });
        }
    }, [initialData]);

    // Validation Mapping
    const SLEEPER_RULES = {
        'RT-1234': { wires: 18, diaMin: 2.97, diaMax: 3.03 },
        'RT-5678': { wires: 20, diaMin: 2.97, diaMax: 3.03 },
        'RT-9012': { wires: 24, diaMin: 2.97, diaMax: 3.03 }
    };

    // 6. Auto-fetch Sleeper Type and Overall Status calculation
    useEffect(() => {
        if (formData.benchNo && !initialData) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            const type = types[parseInt(formData.benchNo) % 3] || 'RT-1234';
            setFormData(prev => ({ ...prev, sleeperType: type }));
        }
    }, [formData.benchNo, initialData]);

    // 11. Auto Overall Status calculation
    useEffect(() => {
        const rules = SLEEPER_RULES[formData.sleeperType] || { wires: 18, diaMin: 2.97, diaMax: 3.03 };
        const wires = parseInt(formData.wiresUsed);
        const dia = parseFloat(formData.wireDia);

        const isWiresOk = wires === rules.wires;
        const isDiaOk = dia >= rules.diaMin && dia <= rules.diaMax;
        const isArrangementOk = formData.htsArrangementCheck === 'OK';

        const status = (isWiresOk && isDiaOk && isArrangementOk) ? 'OK' : 'Not OK';
        setFormData(prev => ({ ...prev, overallStatus: status }));
    }, [formData.wireDia, formData.htsArrangementCheck, formData.sleeperType, formData.wiresUsed]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!formData.benchNo || !formData.batchNo || !formData.wiresUsed || !formData.wireDia || !formData.layLength) {
            alert('Please fill in all required fields (Batch, Bench, Wires, Dia, Lay Length).');
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
            alert(`${fieldLabel} No. ${formData.benchNo} for Batch ${formData.batchNo} has already been entered.`);
            return;
        }

        onSave(formData);
        setFormData(prev => ({ ...prev, benchNo: '', wiresUsed: '', wireDia: '', layLength: '', remarks: '' }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';
    const currentRules = SLEEPER_RULES[formData.sleeperType] || { wires: '...', diaMin: '...', diaMax: '...' };

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard">
                {/* 1. Line/Shed No */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Line / Shed No.</label>
                    <div className="form-info-card">
                        {activeContainer?.name || 'N/A'}
                    </div>
                </div>

                {/* 2. Date */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Date</label>
                    <div className="form-info-card">
                        {formData.date}
                    </div>
                </div>

                {/* 3. Time */}
                <div className="form-field">
                    <label htmlFor="hts-time" style={{ fontSize: '11px', fontWeight: '700' }}>Time <span className="required">*</span></label>
                    <input id="hts-time" type="time" className="form-input-standard" value={formData.time} onChange={e => handleChange('time', e.target.value)} />
                </div>

                {/* 4. Batch No */}
                <div className="form-field">
                    <label htmlFor="batch-no" style={{ fontSize: '11px', fontWeight: '700' }}>Batch No. <span className="required">*</span></label>
                    <input id="batch-no" type="number" placeholder="Batch No" className="form-input-standard" value={formData.batchNo} onChange={e => handleChange('batchNo', e.target.value)} />
                </div>

                {/* 5. Bench/Gang No */}
                <div className="form-field">
                    <label htmlFor="hts-bench" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <input id="hts-bench" type="number" min="0" placeholder={`${fieldLabel} No`} className="form-input-standard" value={formData.benchNo} onChange={e => handleChange('benchNo', e.target.value)} />
                </div>

                {/* 6. Sleeper Type */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Sleeper Type</label>
                    <div className="form-info-card" style={{ background: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
                        {formData.sleeperType || 'N/A'}
                    </div>
                </div>

                {/* 7. No. of Wire */}
                <div className="form-field">
                    <label htmlFor="wires-used" style={{ fontSize: '11px', fontWeight: '700' }}>No. of Wires Used <span className="required">*</span></label>
                    <input id="wires-used" type="number" min="0" placeholder="Integer" className="form-input-standard" value={formData.wiresUsed} onChange={e => handleChange('wiresUsed', e.target.value)} />
                    <div style={{ fontSize: '9px', marginTop: '4px', color: formData.wiresUsed && (parseInt(formData.wiresUsed) !== currentRules.wires) ? '#ef4444' : '#64748b' }}>
                        Required: {currentRules.wires} wires
                    </div>
                </div>

                {/* 8. HTS Wire Dia */}
                <div className="form-field">
                    <label htmlFor="wire-dia" style={{ fontSize: '11px', fontWeight: '700' }}>HTS Wire Dia (mm) <span className="required">*</span></label>
                    <input id="wire-dia" type="number" step="0.01" placeholder="e.g. 3.00" className="form-input-standard" value={formData.wireDia} onChange={e => handleChange('wireDia', e.target.value)} />
                    <div style={{ fontSize: '9px', marginTop: '4px', color: (formData.wireDia && (parseFloat(formData.wireDia) < currentRules.diaMin || parseFloat(formData.wireDia) > currentRules.diaMax)) ? '#ef4444' : '#64748b' }}>
                        Range: {currentRules.diaMin} - {currentRules.diaMax} mm
                    </div>
                </div>

                {/* 9. Lay Length */}
                <div className="form-field">
                    <label htmlFor="lay-length" style={{ fontSize: '11px', fontWeight: '700' }}>Lay Length (mm) <span className="required">*</span></label>
                    <input id="lay-length" type="number" step="0.01" placeholder="72.0 - 108.0" className="form-input-standard" value={formData.layLength} onChange={e => handleChange('layLength', e.target.value)} />
                </div>

                {/* 10. Arrangement */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Arrangement OK? <span className="required">*</span></label>
                    <select value={formData.htsArrangementCheck} className="form-input-standard" onChange={e => handleChange('htsArrangementCheck', e.target.value)}>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                    </select>
                </div>

                {/* 11. Overall Placement Status (Auto) */}
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Overall Status (Auto)</label>
                    <div style={{
                        padding: '10px',
                        background: formData.overallStatus === 'OK' ? '#ecfdf5' : '#fef2f2',
                        borderRadius: '6px',
                        fontWeight: '800',
                        color: formData.overallStatus === 'OK' ? '#059669' : '#dc2626',
                        fontSize: '13px',
                        border: '1px solid',
                        borderColor: formData.overallStatus === 'OK' ? '#10b981' : '#ef4444',
                        textAlign: 'center'
                    }}>
                        {formData.overallStatus}
                    </div>
                </div>

                <div className="form-field form-field-full">
                    <label htmlFor="hts-remarks" style={{ fontSize: '11px', fontWeight: '700' }}>Remarks</label>
                    <input id="hts-remarks" type="text" placeholder="Observations" className="form-input-standard" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} />
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

export default HTSWireForm;

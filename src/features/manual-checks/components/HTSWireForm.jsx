import React, { useState, useEffect } from 'react';
import '../../../components/common/Checkbox.css';

const HTSWireForm = ({ onSave, onCancel, isLongLine, existingEntries = [], initialData, activeContainer }) => {
    // 1. dateTime, noOfWires, and arrangement Stored in form state
    const getLocalISOString = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return (new Date(now - offset)).toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        location: activeContainer?.name || 'N/A',
        dateTime: getLocalISOString(),
        batch: '',
        gangNo: '',
        sleeperType: '',
        noOfWires: '',
        wireDia: '',
        layLength: '',
        arrangement: '',
        status: 'Not OK',
        remarks: ''
    });

    const formatFromBackendDate = (dateStr) => {
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
        const datePart = formatFromBackendDate(dt);
        const timePart = time || '00:00';
        return `${datePart}T${timePart.substring(0, 5)}`;
    };

    // 7. Prefilled when Modify is clicked (using setFormData({...initialData}))
    // We only explicitly format dateTime to ensure the HTML input can display it.
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                location: initialData.lineShedNo || initialData.location || activeContainer?.name || 'N/A',
                dateTime: formatForInput(initialData.placementDate || initialData.dateTime || initialData.inspectionDate || initialData.date || initialData.createdDate, initialData.placementTime || initialData.time),
                batch: initialData.batch || initialData.batchNo || '',
                gangNo: initialData.gangNo || initialData.benchNo || '',
                noOfWires: initialData.noOfWires || initialData.noOfWiresUsed || initialData.wiresUsed || '',
                wireDia: initialData.wireDia || initialData.htsWireDiaMm || '',
                layLength: initialData.layLength || initialData.layLengthMm || '',
                arrangement: initialData.arrangement || (initialData.arrangementOk !== undefined ? (initialData.arrangementOk ? 'OK' : 'Not OK') : (initialData.htsArrangementCheck || '')),
                status: initialData.status || initialData.overallStatus || 'Not OK',
                remarks: initialData.remarks || ''
            });
            console.log('📋 HTSWireForm - Prefilled from:', initialData);
        }
    }, [initialData, activeContainer]);

    // Validation Mapping
    const SLEEPER_RULES = {
        'RT-1234': { wires: 18, diaMin: 2.97, diaMax: 3.03 },
        'RT-5678': { wires: 20, diaMin: 2.97, diaMax: 3.03 },
        'RT-9012': { wires: 24, diaMin: 2.97, diaMax: 3.03 }
    };

    // Auto-fetch Sleeper Type derivation
    useEffect(() => {
        if (formData.gangNo && !initialData) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            const type = types[parseInt(formData.gangNo) % 3] || 'RT-1234';
            setFormData(prev => ({ ...prev, sleeperType: type }));
        }
    }, [formData.gangNo, initialData]);

    // Auto Overall Status calculation
    useEffect(() => {
        const rules = SLEEPER_RULES[formData.sleeperType] || { wires: 18, diaMin: 2.97, diaMax: 3.03 };
        const wires = parseInt(formData.noOfWires);
        const dia = parseFloat(formData.wireDia);

        const isWiresOk = wires === rules.wires;
        const isDiaOk = dia >= rules.diaMin && dia <= rules.diaMax;
        const isArrangementOk = formData.arrangement === 'OK';

        const status = (isWiresOk && isDiaOk && isArrangementOk) ? 'OK' : 'Not OK';
        setFormData(prev => ({ ...prev, status }));
    }, [formData.wireDia, formData.arrangement, formData.sleeperType, formData.noOfWires]);

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
        if (!formData.gangNo || !formData.batch || !formData.noOfWires || !formData.wireDia || !formData.layLength || !formData.arrangement) {
            alert('Please fill in all required fields.');
            return;
        }

        // Numeric validation for Lay Length (Strict Tolerance: 72-108mm)
        const layLenNum = parseFloat(formData.layLength);
        if (layLenNum < 72 || layLenNum > 108) {
            alert(`Lay Length error: ${layLenNum}mm is out of tolerance. Required range is 72mm to 108mm.`);
            return;
        }

        // Payload matching hts-wire-placement-controller schema exactly
        const payload = {
            lineShedNo: formData.location || activeContainer?.name || 'N/A',
            placementDate: formatToBackendDate(formData.dateTime.split('T')[0]),
            placementTime: formData.dateTime.split('T')[1],
            batchNo: parseInt(formData.batch) || 0,
            benchNo: parseInt(formData.gangNo) || 0,
            sleeperType: formData.sleeperType || 'RT-1234',
            noOfWiresUsed: parseInt(formData.noOfWires) || 0,
            htsWireDiaMm: parseFloat(formData.wireDia) || 0,
            layLengthMm: layLenNum,
            arrangementOk: formData.arrangement === 'OK',
            overallStatus: formData.status,
            remarks: formData.remarks || '',
            createdBy: 0,
            updatedBy: 0
        };

        onSave(payload);

        // Reset fields after save (keeping location and dateTime for next entry)
        setFormData(prev => ({
            ...prev,
            gangNo: '',
            noOfWires: '',
            wireDia: '',
            layLength: '',
            arrangement: '',
            status: 'Not OK',
            remarks: ''
        }));
    };

    const fieldLabel = isLongLine ? 'Gang' : 'Bench';
    const currentRules = SLEEPER_RULES[formData.sleeperType] || { wires: '...', diaMin: '...', diaMax: '...' };

    return (
        <div className="form-container" style={{ padding: '20px' }}>
            <div className="form-grid-standard">
                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Location</label>
                    <div className="form-info-card">{formData.location}</div>
                </div>

                <div className="form-field">
                    <label htmlFor="hts-datetime" style={{ fontSize: '11px', fontWeight: '700' }}>Date & Time <span className="required">*</span></label>
                    {/* 2. Bound using value and onChange */}
                    <input
                        id="hts-datetime"
                        type="datetime-local"
                        className="form-input-standard"
                        value={formData.dateTime}
                        onChange={e => handleChange('dateTime', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="batch" style={{ fontSize: '11px', fontWeight: '700' }}>Batch <span className="required">*</span></label>
                    <input
                        id="batch"
                        type="number"
                        placeholder="Batch No"
                        className="form-input-standard"
                        value={formData.batch}
                        onChange={e => handleChange('batch', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="gangNo" style={{ fontSize: '11px', fontWeight: '700' }}>{fieldLabel} No. <span className="required">*</span></label>
                    <input
                        id="gangNo"
                        type="number"
                        min="0"
                        placeholder={`${fieldLabel} No`}
                        className="form-input-standard"
                        value={formData.gangNo}
                        onChange={e => handleChange('gangNo', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Sleeper Type</label>
                    <div className="form-info-card" style={{ background: '#f8fafc', color: '#64748b', fontWeight: '600' }}>
                        {formData.sleeperType || 'N/A'}
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="noOfWires" style={{ fontSize: '11px', fontWeight: '700' }}>No. of Wires Used <span className="required">*</span></label>
                    <input
                        id="noOfWires"
                        type="number"
                        min="0"
                        placeholder="Integer"
                        className="form-input-standard"
                        value={formData.noOfWires}
                        onChange={e => handleChange('noOfWires', e.target.value)}
                    />
                    <div style={{ fontSize: '9px', marginTop: '4px', color: formData.noOfWires && (parseInt(formData.noOfWires) !== currentRules.wires) ? '#ef4444' : '#64748b' }}>
                        Required: {currentRules.wires} wires
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="wireDia" style={{ fontSize: '11px', fontWeight: '700' }}>HTS Wire Dia (mm) <span className="required">*</span></label>
                    <input
                        id="wireDia"
                        type="number"
                        step="0.01"
                        placeholder="3.00"
                        className="form-input-standard"
                        value={formData.wireDia}
                        onChange={e => handleChange('wireDia', e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="layLength" style={{ fontSize: '11px', fontWeight: '700' }}>Lay Length (mm) <span className="required">*</span></label>
                    <input
                        id="layLength"
                        type="number"
                        step="0.1"
                        placeholder="e.g. 100.0"
                        className="form-input-standard"
                        value={formData.layLength}
                        onChange={e => handleChange('layLength', e.target.value)}
                    />
                    <div style={{ fontSize: '9px', marginTop: '4px', color: formData.layLength && (parseFloat(formData.layLength) < 72 || parseFloat(formData.layLength) > 108) ? '#ef4444' : '#64748b' }}>
                        Required: 72-108 mm
                    </div>
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', fontWeight: '700' }}>Arrangement OK? <span className="required">*</span></label>
                    <select
                        value={formData.arrangement}
                        className="form-input-standard"
                        onChange={e => handleChange('arrangement', e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                    </select>
                </div>

                <div className="form-field">
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Status</label>
                    <div style={{
                        padding: '10px',
                        background: formData.status === 'OK' ? '#ecfdf5' : '#fef2f2',
                        borderRadius: '6px',
                        fontWeight: '800',
                        color: formData.status === 'OK' ? '#059669' : '#dc2626',
                        fontSize: '13px',
                        border: '1px solid',
                        borderColor: formData.status === 'OK' ? '#10b981' : '#ef4444',
                        textAlign: 'center'
                    }}>
                        {formData.status}
                    </div>
                </div>

                <div className="form-field form-field-full">
                    <label htmlFor="remarks" style={{ fontSize: '11px', fontWeight: '700' }}>Remarks</label>
                    <input
                        id="remarks"
                        type="text"
                        placeholder="Observations"
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

export default HTSWireForm;

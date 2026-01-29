import React, { useState, useMemo } from 'react';

/**
 * MoistureEntryForm Component
 * Specialized form for entering aggregate moisture details and calculating mix adjustments.
 */
const MoistureEntryForm = ({ onCancel, onSave, initialData }) => {
    const [activeSection, setActiveSection] = useState('ca1');

    const [commonData, setCommonData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        shift: initialData?.shift || 'A',
        timing: initialData?.timing || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: initialData?.batchNo || '',
        dryCA1: initialData?.dryCA1 || 436.2,
        dryCA2: initialData?.dryCA2 || 178.6,
        dryFA: initialData?.dryFA || 207.1,
        dryWater: initialData?.dryWater || 37.0,
        dryAdmix: initialData?.dryAdmix || 1.44,
        dryCement: initialData?.dryCement || 175.5
    });

    const [aggData, setAggData] = useState({
        ca1: initialData?.ca1Details || { wet: 0, dried: 0, absorption: 0.5 },
        ca2: initialData?.ca2Details || { wet: 0, dried: 0, absorption: 0.5 },
        fa: initialData?.faDetails || { wet: 0, dried: 0, absorption: 1.0 }
    });

    const calcAgg = (data, dryBatchWt) => {
        const moistureGms = Math.max(0, data.wet - data.dried);
        const moisturePct = data.dried > 0 ? (moistureGms / data.dried) * 100 : 0;
        const freeMoisturePct = Math.max(0, moisturePct - data.absorption);
        const freeMoistureKg = (dryBatchWt * freeMoisturePct) / 100;
        const adjustedWt = dryBatchWt + freeMoistureKg;
        const adoptedWt = Math.ceil(adjustedWt);
        return { moistureGms, moisturePct, freeMoisturePct, freeMoistureKg, adjustedWt, adoptedWt };
    };

    const ca1Res = useMemo(() => calcAgg(aggData.ca1, commonData.dryCA1), [aggData.ca1, commonData.dryCA1]);
    const ca2Res = useMemo(() => calcAgg(aggData.ca2, commonData.dryCA2), [aggData.ca2, commonData.dryCA2]);
    const faRes = useMemo(() => calcAgg(aggData.fa, commonData.dryFA), [aggData.fa, commonData.dryFA]);

    const totalFreeMoisture = ca1Res.freeMoistureKg + ca2Res.freeMoistureKg + faRes.freeMoistureKg;
    const adjustedWater = commonData.dryWater - totalFreeMoisture;
    const wcRatio = commonData.dryCement > 0 ? adjustedWater / commonData.dryCement : 0;

    const handleAggChange = (agg, field, val) => {
        setAggData(prev => ({
            ...prev,
            [agg]: { ...prev[agg], [field]: parseFloat(val) || 0 }
        }));
    };

    const handleCommonChange = (field, val) => {
        setCommonData(prev => ({ ...prev, [field]: field === 'batchNo' ? val : (parseFloat(val) || 0) }));
    };

    const handleSubmit = () => {
        if (!commonData.batchNo) {
            alert('Batch Number is required');
            return;
        }
        onSave({
            id: initialData?.id || Date.now(),
            ...commonData,
            ca1Free: ca1Res.freeMoisturePct.toFixed(2),
            ca2Free: ca2Res.freeMoisturePct.toFixed(2),
            faFree: faRes.freeMoisturePct.toFixed(2),
            totalFree: totalFreeMoisture.toFixed(2),
            ca1Details: aggData.ca1,
            ca2Details: aggData.ca2,
            faDetails: aggData.fa,
            timestamp: initialData?.timestamp || new Date().toISOString()
        });
    };

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>Moisture Analysis Entry</h3>
            </div>

            <div className="form-grid">
                <div className="form-field">
                    <label>Batch Number <span className="required">*</span></label>
                    <input type="number" value={commonData.batchNo} onChange={e => handleCommonChange('batchNo', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Timing <span className="required">*</span></label>
                    <input type="time" value={commonData.timing} onChange={e => setCommonData({ ...commonData, timing: e.target.value })} />
                </div>
            </div>

            <div className="calculated-section">
                <span className="calculated-title">Design Mix Weights (Static)</span>
                <div className="calculated-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                    <div className="calc-card"><span className="calc-label">CA1</span><div className="calc-value">{commonData.dryCA1}</div></div>
                    <div className="calc-card"><span className="calc-label">CA2</span><div className="calc-value">{commonData.dryCA2}</div></div>
                    <div className="calc-card"><span className="calc-label">FA</span><div className="calc-value">{commonData.dryFA}</div></div>
                    <div className="calc-card"><span className="calc-label">W</span><div className="calc-value">{commonData.dryWater}</div></div>
                    <div className="calc-card"><span className="calc-label">C</span><div className="calc-value">{commonData.dryCement}</div></div>
                </div>
            </div>

            <nav className="modal-tabs">
                <button className={`modal-tab-btn ${activeSection === 'ca1' ? 'active' : ''}`} onClick={() => setActiveSection('ca1')}>CA1 (20mm)</button>
                <button className={`modal-tab-btn ${activeSection === 'ca2' ? 'active' : ''}`} onClick={() => setActiveSection('ca2')}>CA2 (10mm)</button>
                <button className={`modal-tab-btn ${activeSection === 'fa' ? 'active' : ''}`} onClick={() => setActiveSection('fa')}>FA (Fine)</button>
            </nav>

            <div className="form-grid">
                <div className="form-field">
                    <label>Wt. of Wet Sample (Gms)</label>
                    <input type="number" value={aggData[activeSection].wet} onChange={e => handleAggChange(activeSection, 'wet', e.target.value)} />
                </div>
                <div className="form-field">
                    <label>Wt. of Dried Sample (Gms)</label>
                    <input type="number" value={aggData[activeSection].dried} onChange={e => handleAggChange(activeSection, 'dried', e.target.value)} />
                </div>
            </div>

            <div className="summary-section" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4>Calculation Summary</h4>
                <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Free Moisture</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#13343b' }}>{totalFreeMoisture.toFixed(2)} Kg</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>W/C Ratio</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: wcRatio > 0.4 ? 'var(--color-danger)' : '#059669' }}>{wcRatio.toFixed(3)}</div>
                    </div>
                </div>
            </div>

            <div className="form-actions-center">
                <button className="toggle-btn secondary" onClick={onCancel}>Cancel</button>
                <button className="toggle-btn" onClick={handleSubmit}>
                    {initialData ? 'Update Analysis' : 'Submit Analysis'}
                </button>
            </div>
        </div>
    );
};

export default MoistureEntryForm;

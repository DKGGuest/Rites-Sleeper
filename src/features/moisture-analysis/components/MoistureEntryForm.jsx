import React, { useState, useMemo, useEffect } from 'react';
const MIX_DESIGNS = [
    { id: 'MIX-01', name: 'M60 - Standard Sleeper (Approved)', cement: '175.5', ca1: '436.2', ca2: '178.6', fa: '207.1', water: '37.0', ac: '4.69', wc: '0.211' },
    { id: 'MIX-02', name: 'M55 - Special Project (Approved)', cement: '170.0', ca1: '440.0', ca2: '180.0', fa: '210.0', water: '38.0', ac: '4.88', wc: '0.223' },
];

/**
 * MoistureEntryForm Component
 * Complete moisture analysis form matching specification with:
 * - Common Form Section (batch details and dry weights)
 * - CA1, CA2, FA Toggle Sections (with all calculations)
 */
const MoistureEntryForm = ({ onCancel, onSave, initialData }) => {
    const [activeSection, setActiveSection] = useState('ca1');

    // Common Form Section Data
    const [commonData, setCommonData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        shift: initialData?.shift || 'A',
        timing: initialData?.timing || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: initialData?.batchNo || '',
        mixDesignId: initialData?.mixDesignId || '',
        // Batch Wt. Dry (Target/Approved from Mix Design)
        batchDryCA1: initialData?.batchDryCA1 || '',
        batchDryCA2: initialData?.batchDryCA2 || '',
        batchDryFA: initialData?.batchDryFA || '',
        batchDryWater: initialData?.batchDryWater || '',
        batchDryAdmix: initialData?.batchDryAdmix || '1.44',
        batchDryCement: initialData?.batchDryCement || '',
        designAC: initialData?.designAC || '',
        designWC: initialData?.designWC || ''
    });

    // Aggregate Data for CA1, CA2, FA
    const [aggData, setAggData] = useState({
        ca1: initialData?.ca1Details || { wetSample: '', driedSample: '', absorption: '' },
        ca2: initialData?.ca2Details || { wetSample: '', driedSample: '', absorption: '' },
        fa: initialData?.faDetails || { wetSample: '', driedSample: '', absorption: '' }
    });

    const handleCommonChange = (field, val) => {
        if (field === 'mixDesignId') {
            const mix = MIX_DESIGNS.find(m => m.id === val);
            if (mix) {
                setCommonData(prev => ({
                    ...prev,
                    mixDesignId: val,
                    batchDryCA1: mix.ca1,
                    batchDryCA2: mix.ca2,
                    batchDryFA: mix.fa,
                    batchDryWater: mix.water,
                    batchDryCement: mix.cement,
                    designAC: mix.ac,
                    designWC: mix.wc
                }));
                return;
            }
        }
        setCommonData(prev => ({ ...prev, [field]: val }));
    };

    const handleAggChange = (agg, field, val) => {
        setAggData(prev => ({
            ...prev,
            [agg]: { ...prev[agg], [field]: val }
        }));
    };

    // Calculation functions for each aggregate
    const calculateAggregate = (aggType) => {
        const data = aggData[aggType];
        const wetSample = parseFloat(data.wetSample) || 0;
        const driedSample = parseFloat(data.driedSample) || 0;
        const absorption = parseFloat(data.absorption) || 0;

        let batchDry = 0;
        if (aggType === 'ca1') batchDry = parseFloat(commonData.batchDryCA1) || 0;
        if (aggType === 'ca2') batchDry = parseFloat(commonData.batchDryCA2) || 0;
        if (aggType === 'fa') batchDry = parseFloat(commonData.batchDryFA) || 0;

        // Wt. of Moisture in Sample (Gms) = B17 - B16 (wet - dried)
        const moistureInSample = wetSample - driedSample;

        // Moisture % = B18/B16 * 100
        const moisturePct = driedSample > 0 ? (moistureInSample / driedSample) * 100 : 0;

        // Free Moisture % = B19 - B20 (moisture% - absorption%)
        const freeMoisturePct = moisturePct - absorption;

        // Batch Wt. (Dry) = B5 (from common data)
        const batchWtDry = batchDry;

        // Free Moisture (Kgs) = (B21 * B22)/100
        const freeMoistureKg = (freeMoisturePct * batchWtDry) / 100;

        // Adjusted Wt. (Kgs) = B23 + B22
        const adjustedWt = freeMoistureKg + batchWtDry;

        // Wt. Adopted (Kgs) = ROUND UP B24
        const wtAdopted = Math.ceil(adjustedWt);

        return {
            moistureInSample: moistureInSample.toFixed(2),
            moisturePct: moisturePct.toFixed(2),
            freeMoisturePct: freeMoisturePct.toFixed(2),
            batchWtDry: batchWtDry.toFixed(2),
            freeMoistureKg: freeMoistureKg.toFixed(2),
            adjustedWt: adjustedWt.toFixed(2),
            wtAdopted: wtAdopted
        };
    };

    const ca1Calc = useMemo(() => calculateAggregate('ca1'), [aggData.ca1, commonData.batchDryCA1]);
    const ca2Calc = useMemo(() => calculateAggregate('ca2'), [aggData.ca2, commonData.batchDryCA2]);
    const faCalc = useMemo(() => calculateAggregate('fa'), [aggData.fa, commonData.batchDryFA]);

    // Total Free Moisture (Wt.) = B24 + B35 + B46
    const totalFreeMoisture = (
        parseFloat(ca1Calc.freeMoistureKg) +
        parseFloat(ca2Calc.freeMoistureKg) +
        parseFloat(faCalc.freeMoistureKg)
    ).toFixed(2);

    // Adjusted / Adopted wt. of Water = B7 - B13
    const adjustedWater = (parseFloat(commonData.batchDryWater) - parseFloat(totalFreeMoisture)).toFixed(2);

    // W/C Ratio = B7 / B9
    const wcRatio = parseFloat(commonData.batchDryCement) > 0
        ? (parseFloat(adjustedWater) / parseFloat(commonData.batchDryCement)).toFixed(3)
        : '0.000';

    // A/C Ratio = ((B10+B11+B12)/B9)
    const acRatio = parseFloat(commonData.batchDryCement) > 0
        ? ((parseFloat(ca1Calc.wtAdopted) + parseFloat(ca2Calc.wtAdopted) + parseFloat(faCalc.wtAdopted)) / parseFloat(commonData.batchDryCement)).toFixed(2)
        : '0.00';

    const handleSubmit = () => {
        if (!commonData.batchNo) {
            alert('Batch Number is required');
            return;
        }

        // Validate that at least wet and dried samples are entered for all aggregates
        if (!aggData.ca1.wetSample || !aggData.ca1.driedSample) {
            alert('Please enter CA1 wet and dried sample weights');
            return;
        }
        if (!aggData.ca2.wetSample || !aggData.ca2.driedSample) {
            alert('Please enter CA2 wet and dried sample weights');
            return;
        }
        if (!aggData.fa.wetSample || !aggData.fa.driedSample) {
            alert('Please enter FA wet and dried sample weights');
            return;
        }

        onSave({
            id: initialData?.id || Date.now(),
            ...commonData,
            ca1Free: ca1Calc.freeMoisturePct,
            ca2Free: ca2Calc.freeMoisturePct,
            faFree: faCalc.freeMoisturePct,
            totalFree: totalFreeMoisture,
            ca1Details: aggData.ca1,
            ca2Details: aggData.ca2,
            faDetails: aggData.fa,
            timestamp: initialData?.timestamp || new Date().toISOString()
        });
    };

    return (
        <div className="form-container">
            <div className="form-section-header">
                <h3>{initialData ? 'Edit Moisture Analysis' : 'New Moisture Analysis Entry'}</h3>
            </div>

            {/* Common Form Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1rem' }}>Common Form Section</h4>

                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div className="form-field">
                        <label>Date</label>
                        <input type="date" value={commonData.date} onChange={e => handleCommonChange('date', e.target.value)} readOnly style={{ background: '#f1f5f9', padding: '6px' }} />
                    </div>
                    <div className="form-field">
                        <label>Shift</label>
                        <select value={commonData.shift} onChange={e => handleCommonChange('shift', e.target.value)} style={{ background: '#f1f5f9', padding: '6px' }} disabled>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Time <span className="required">*</span></label>
                        <input type="time" value={commonData.timing} onChange={e => handleCommonChange('timing', e.target.value)} style={{ padding: '6px' }} />
                    </div>
                    <div className="form-field">
                        <label>Batch No. <span className="required">*</span></label>
                        <input type="text" value={commonData.batchNo} onChange={e => handleCommonChange('batchNo', e.target.value)} placeholder="Enter Batch Number" style={{ padding: '6px' }} />
                    </div>
                </div>

                <div className="form-grid" style={{ marginTop: '1rem' }}>
                    <div className="form-field" style={{ gridColumn: 'span 2' }}>
                        <label>Approved Mix Design <span className="required">*</span></label>
                        <select
                            value={commonData.mixDesignId}
                            onChange={e => handleCommonChange('mixDesignId', e.target.value)}
                            style={{ border: '2px solid #8b5cf6', background: '#fefaff' }}
                        >
                            <option value="">-- Select Approved Mix Design --</option>
                            {MIX_DESIGNS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    {commonData.mixDesignId && (
                        <>
                            <div className="calc-card" style={{ height: 'fit-content', padding: '8px 12px' }}>
                                <span className="mini-label">Design A/C</span>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#8b5cf6' }}>{commonData.designAC}</div>
                            </div>
                            <div className="calc-card" style={{ height: 'fit-content', padding: '8px 12px' }}>
                                <span className="mini-label">Design W/C</span>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#8b5cf6' }}>{commonData.designWC}</div>
                            </div>
                        </>
                    )}
                </div>

                <h5 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Batch Wt. Dry (Kgs) - Populated from Mix Design</h5>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                    <div className="form-field">
                        <label style={{ fontSize: '10px' }}>CA1</label>
                        <input style={{ padding: '6px' }} type="number" step="0.01" value={commonData.batchDryCA1} onChange={e => handleCommonChange('batchDryCA1', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label style={{ fontSize: '10px' }}>CA2</label>
                        <input style={{ padding: '6px' }} type="number" step="0.01" value={commonData.batchDryCA2} onChange={e => handleCommonChange('batchDryCA2', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label style={{ fontSize: '10px' }}>FA</label>
                        <input style={{ padding: '6px' }} type="number" step="0.01" value={commonData.batchDryFA} onChange={e => handleCommonChange('batchDryFA', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label style={{ fontSize: '10px' }}>Water</label>
                        <input style={{ padding: '6px' }} type="number" step="0.01" value={commonData.batchDryWater} onChange={e => handleCommonChange('batchDryWater', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label style={{ fontSize: '10px' }}>Admix</label>
                        <input style={{ padding: '6px' }} type="number" step="0.01" value={commonData.batchDryAdmix} onChange={e => handleCommonChange('batchDryAdmix', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label style={{ fontSize: '10px' }}>Cement</label>
                        <input style={{ padding: '6px' }} type="number" step="0.01" value={commonData.batchDryCement} onChange={e => handleCommonChange('batchDryCement', e.target.value)} />
                    </div>
                </div>

                {/* Auto-calculated fields */}
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                    <div className="calc-card" style={{ padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>Wt. Adopt. (CA1)</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem' }}>{ca1Calc.wtAdopted}</div>
                    </div>
                    <div className="calc-card" style={{ padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>Wt. Adopt. (CA2)</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem' }}>{ca2Calc.wtAdopted}</div>
                    </div>
                    <div className="calc-card" style={{ padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>Wt. Adopt. (FA)</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem' }}>{faCalc.wtAdopted}</div>
                    </div>
                    <div className="calc-card" style={{ borderLeft: '3px solid #10b981', padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>Free Moist. (Wt.)</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem', color: '#10b981' }}>{totalFreeMoisture}</div>
                    </div>
                    <div className="calc-card" style={{ padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>Adj. Water</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem' }}>{adjustedWater}</div>
                    </div>
                    <div className="calc-card" style={{ padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>W/C Ratio</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem', color: parseFloat(wcRatio) > 0.4 ? '#ef4444' : '#059669' }}>{wcRatio}</div>
                    </div>
                    <div className="calc-card" style={{ padding: '8px' }}>
                        <span className="mini-label" style={{ fontSize: '9px' }}>A/C Ratio</span>
                        <div className="calc-value" style={{ fontSize: '0.9rem' }}>{acRatio}</div>
                    </div>
                </div>
            </div>

            {/* Toggle Sections for CA1, CA2, FA */}
            <nav className="modal-tabs" style={{ marginBottom: '1.5rem' }}>
                <button className={`modal-tab-btn ${activeSection === 'ca1' ? 'active' : ''}`} onClick={() => setActiveSection('ca1')}>
                    CA1 (20mm Aggregate)
                </button>
                <button className={`modal-tab-btn ${activeSection === 'ca2' ? 'active' : ''}`} onClick={() => setActiveSection('ca2')}>
                    CA2 (10mm Aggregate)
                </button>
                <button className={`modal-tab-btn ${activeSection === 'fa' ? 'active' : ''}`} onClick={() => setActiveSection('fa')}>
                    FA (Fine Aggregate)
                </button>
            </nav>

            {/* Active Section Form */}
            <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1rem' }}>
                    {activeSection === 'ca1' ? 'CA1 (20mm) Details' : activeSection === 'ca2' ? 'CA2 (10mm) Details' : 'FA (Fine Aggregate) Details'}
                </h4>

                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div className="form-field">
                        <label>Wet Sample (Gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            value={aggData[activeSection].wetSample}
                            onChange={e => handleAggChange(activeSection, 'wetSample', e.target.value)}
                            placeholder="Gms"
                            style={{ padding: '6px' }}
                        />
                    </div>
                    <div className="form-field">
                        <label>Dried Sample (Gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            value={aggData[activeSection].driedSample}
                            onChange={e => handleAggChange(activeSection, 'driedSample', e.target.value)}
                            placeholder="Gms"
                            style={{ padding: '6px' }}
                        />
                    </div>
                    <div className="form-field">
                        <label>Absorption % <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            value={aggData[activeSection].absorption}
                            onChange={e => handleAggChange(activeSection, 'absorption', e.target.value)}
                            placeholder="%"
                            style={{ padding: '6px' }}
                        />
                    </div>
                </div>

                {/* Auto-calculated fields for active section */}
                <div style={{ marginTop: '1.5rem' }}>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '1rem' }}>Auto-Calculated Values</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Wt. of Moisture in Sample</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                {activeSection === 'ca1' ? ca1Calc.moistureInSample : activeSection === 'ca2' ? ca2Calc.moistureInSample : faCalc.moistureInSample} Gms
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Moisture %</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                {activeSection === 'ca1' ? ca1Calc.moisturePct : activeSection === 'ca2' ? ca2Calc.moisturePct : faCalc.moisturePct}%
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Free Moisture %</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#3b82f6' }}>
                                {activeSection === 'ca1' ? ca1Calc.freeMoisturePct : activeSection === 'ca2' ? ca2Calc.freeMoisturePct : faCalc.freeMoisturePct}%
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Batch Wt. (Dry)</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                {activeSection === 'ca1' ? ca1Calc.batchWtDry : activeSection === 'ca2' ? ca2Calc.batchWtDry : faCalc.batchWtDry} Kg
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Free Moisture (Kgs)</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>
                                {activeSection === 'ca1' ? ca1Calc.freeMoistureKg : activeSection === 'ca2' ? ca2Calc.freeMoistureKg : faCalc.freeMoistureKg} Kg
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Adjusted Wt.</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                {activeSection === 'ca1' ? ca1Calc.adjustedWt : activeSection === 'ca2' ? ca2Calc.adjustedWt : faCalc.adjustedWt} Kg
                            </div>
                        </div>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Wt. Adopted (Rounded)</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f59e0b' }}>
                                {activeSection === 'ca1' ? ca1Calc.wtAdopted : activeSection === 'ca2' ? ca2Calc.wtAdopted : faCalc.wtAdopted} Kg
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-actions-center" style={{ marginTop: '2rem' }}>
                <button className="toggle-btn secondary" onClick={onCancel}>Cancel</button>
                <button className="toggle-btn" onClick={handleSubmit}>
                    {initialData ? 'Update Analysis' : 'Submit Analysis'}
                </button>
            </div>
        </div>
    );
};

export default MoistureEntryForm;

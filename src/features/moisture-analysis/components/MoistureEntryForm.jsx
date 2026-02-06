import React, { useState, useMemo, useEffect } from 'react';
import './MoistureEntryForm.css';

const MIX_DESIGNS = [
    { id: 'MIX-01', name: 'M60 - Standard Sleeper (Approved)', cement: '175.5', ca1: '436.2', ca2: '178.6', fa: '207.1', water: '37.0', admix: '1.44', ac: '4.69', wc: '0.211' },
    { id: 'MIX-02', name: 'M55 - Special Project (Approved)', cement: '170.0', ca1: '440.0', ca2: '180.0', fa: '210.0', water: '38.0', admix: '1.40', ac: '4.88', wc: '0.223' },
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
    // Common Form Section Data
    const [commonData, setCommonData] = useState({
        date: initialData?.date || new Date().toISOString().split('T')[0],
        shift: initialData?.shift || 'A',
        timing: initialData?.timing || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: initialData?.batchNo || '',
        mixDesignId: initialData?.mixDesignId || '',

        // Selected Design Values (Read Only Reference)
        designValues: initialData?.designValues || null,

        // User Entered Weights (Dry State)
        userDryCA1: initialData?.userDryCA1 || '',
        userDryCA2: initialData?.userDryCA2 || '',
        userDryFA: initialData?.userDryFA || '',
        userDryWater: initialData?.userDryWater || '',
        userDryAdmix: initialData?.userDryAdmix || '1.44',
        userDryCement: initialData?.userDryCement || '',

        designAC: initialData?.designAC || '',
        designWC: initialData?.designWC || '',
        designValues: initialData?.designValues || null
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
                    designValues: mix,
                    designAC: mix.ac,
                    designWC: mix.wc,
                    userDryCA1: '',
                    userDryCA2: '',
                    userDryFA: '',
                    userDryWater: '',
                    userDryCement: '',
                    userDryAdmix: mix.admix // Default to design admix but editable
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
        if (aggType === 'ca1') batchDry = parseFloat(commonData.userDryCA1) || 0;
        if (aggType === 'ca2') batchDry = parseFloat(commonData.userDryCA2) || 0;
        if (aggType === 'fa') batchDry = parseFloat(commonData.userDryFA) || 0;

        // Wt. of Moisture in Sample (Gms) = wet - dried
        const moistureInSample = wetSample - driedSample;

        // Moisture % = (wet - dried) / dried * 100
        const moisturePct = driedSample > 0 ? (moistureInSample / driedSample) * 100 : 0;

        // Free Moisture % = moisture% - absorption%
        const freeMoisturePct = moisturePct - absorption;

        // Batch Wt. (Dry) = from User Input
        const batchWtDry = batchDry;

        // Free Moisture (Kgs) = (free% * batchWtDry)/100
        const freeMoistureKg = (freeMoisturePct * batchWtDry) / 100;

        // Adjusted Wt. (Kgs) = freeMoistureKg + batchWtDry
        const adjustedWt = freeMoistureKg + batchWtDry;

        // Wt. Adopted (Kgs) = ROUND UP adjustedWt
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

    const ca1Calc = useMemo(() => calculateAggregate('ca1'), [aggData.ca1, commonData.userDryCA1]);
    const ca2Calc = useMemo(() => calculateAggregate('ca2'), [aggData.ca2, commonData.userDryCA2]);
    const faCalc = useMemo(() => calculateAggregate('fa'), [aggData.fa, commonData.userDryFA]);

    // Total Free Moisture (Wt.) = user inputs
    const totalFreeMoisture = (
        parseFloat(ca1Calc.freeMoistureKg) +
        parseFloat(ca2Calc.freeMoistureKg) +
        parseFloat(faCalc.freeMoistureKg)
    ).toFixed(2);

    // Adjusted / Adopted wt. of Water = User Water - Total Free Moisture
    const adjustedWater = (parseFloat(commonData.userDryWater) - parseFloat(totalFreeMoisture)).toFixed(2);

    // W/C Ratio = Adjusted Water / User Cement
    const wcRatio = parseFloat(commonData.userDryCement) > 0
        ? (parseFloat(adjustedWater) / parseFloat(commonData.userDryCement)).toFixed(3)
        : '0.000';

    // A/C Ratio = (Sum of Adopted Wts) / User Cement
    const acRatio = parseFloat(commonData.userDryCement) > 0
        ? ((parseFloat(ca1Calc.wtAdopted) + parseFloat(ca2Calc.wtAdopted) + parseFloat(faCalc.wtAdopted)) / parseFloat(commonData.userDryCement)).toFixed(2)
        : '0.00';

    const handleSubmit = () => {
        if (!commonData.batchNo) {
            alert('Batch Number is required');
            return;
        }

        // Validate that at least wet and dried samples are entered for all aggregates
        const aggregates = ['ca1', 'ca2', 'fa'];
        for (const agg of aggregates) {
            if (!aggData[agg].wetSample || !aggData[agg].driedSample) {
                alert(`Please enter ${agg.toUpperCase()} wet and dried sample weights`);
                return;
            }
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

    const activeCalc = activeSection === 'ca1' ? ca1Calc : activeSection === 'ca2' ? ca2Calc : faCalc;

    return (
        <div className="moisture-form-container">
            <div className="form-section-header">
                <h3>{initialData ? 'Edit Moisture Analysis' : 'New Moisture Analysis Entry'}</h3>
            </div>

            {/* Common Form Section */}
            <div className="moisture-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Common Form Section</h4>
                    <div style={{ display: 'flex', gap: '1rem', background: '#fff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div className="form-field-compact">
                            <label>Date</label>
                            <strong>{commonData.date}</strong>
                        </div>
                        <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                        <div className="form-field-compact">
                            <label>Shift</label>
                            <strong>{commonData.shift}</strong>
                        </div>
                    </div>
                </div>

                <div className="moisture-grid">
                    <div className="form-field">
                        <label>Time <span className="required">*</span></label>
                        <input type="time" value={commonData.timing} onChange={e => handleCommonChange('timing', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label>Batch No. <span className="required">*</span></label>
                        <input type="number" min="0" value={commonData.batchNo} onChange={e => handleCommonChange('batchNo', e.target.value)} placeholder="000" />
                    </div>
                    <div className="form-field" style={{ gridColumn: 'span 2' }}>
                        <label>Approved Mix Design <span className="required">*</span></label>
                        <select
                            value={commonData.mixDesignId}
                            onChange={e => handleCommonChange('mixDesignId', e.target.value)}
                            className="highlight-select"
                        >
                            <option value="">-- Select --</option>
                            {MIX_DESIGNS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {commonData.mixDesignId && (
                    <div className="design-comparison-container" style={{ marginTop: '24px', animation: 'fadeIn 0.3s' }}>

                        <div className="comparison-table-header">
                            <div style={{ flex: 1 }}>Design Parameters & Input Verification</div>
                            <div className="header-status-badge">Mix: {commonData.designValues?.name}</div>
                        </div>

                        <div className="comparison-grid-wrapper">
                            {/* Column Headers */}
                            <div className="comparison-grid-row header-row">
                                <div className="cell col-label">Category</div>
                                <div className="cell col-label">Design A/C</div>
                                <div className="cell col-label">Design W/C</div>
                                <div className="cell col-label">Cement</div>
                                <div className="cell col-label">CA1 (20)</div>
                                <div className="cell col-label">CA2 (10)</div>
                                <div className="cell col-label">FA</div>
                                <div className="cell col-label">Water</div>
                                <div className="cell col-label">Admix</div>
                            </div>

                            {/* Row 1: Autofetched (Design) */}
                            <div className="comparison-grid-row design-row">
                                <div className="cell row-label design-text">Approved Design</div>
                                <div className="cell data-cell highlight">{commonData.designAC}</div>
                                <div className="cell data-cell highlight">{commonData.designWC}</div>
                                <div className="cell data-cell">{commonData.designValues?.cement}</div>
                                <div className="cell data-cell">{commonData.designValues?.ca1}</div>
                                <div className="cell data-cell">{commonData.designValues?.ca2}</div>
                                <div className="cell data-cell">{commonData.designValues?.fa}</div>
                                <div className="cell data-cell">{commonData.designValues?.water}</div>
                                <div className="cell data-cell">{commonData.designValues?.admix}</div>
                            </div>

                            {/* Row 2: User Inputs (Manual) */}
                            <div className="comparison-grid-row input-row">
                                <div className="cell row-label input-text">Actual Batch</div>
                                <div className="cell data-cell calculated-cell">--</div>
                                <div className="cell data-cell calculated-cell">--</div>
                                <div className="cell data-cell">
                                    <input type="number" step="0.01" value={commonData.userDryCement} onChange={e => handleCommonChange('userDryCement', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="cell data-cell">
                                    <input type="number" step="0.01" value={commonData.userDryCA1} onChange={e => handleCommonChange('userDryCA1', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="cell data-cell">
                                    <input type="number" step="0.01" value={commonData.userDryCA2} onChange={e => handleCommonChange('userDryCA2', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="cell data-cell">
                                    <input type="number" step="0.01" value={commonData.userDryFA} onChange={e => handleCommonChange('userDryFA', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="cell data-cell">
                                    <input type="number" step="0.01" value={commonData.userDryWater} onChange={e => handleCommonChange('userDryWater', e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="cell data-cell">
                                    <input type="number" step="0.01" value={commonData.userDryAdmix} onChange={e => handleCommonChange('userDryAdmix', e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="moisture-calc-grid">
                            <div className="calc-card">
                                <span className="mini-label">Wt. Adopt. (CA1)</span>
                                <div className="calc-value">{ca1Calc.wtAdopted}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">Wt. Adopt. (CA2)</span>
                                <div className="calc-value">{ca2Calc.wtAdopted}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">Wt. Adopt. (FA)</span>
                                <div className="calc-value">{faCalc.wtAdopted}</div>
                            </div>
                            <div className="calc-card highlight-border">
                                <span className="mini-label">Free Moist. (Wt.)</span>
                                <div className="calc-value success-text">{totalFreeMoisture}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">Adj. Water</span>
                                <div className="calc-value">{adjustedWater}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">W/C Ratio</span>
                                <div className={`calc-value ${parseFloat(wcRatio) > 0.4 ? 'error-text' : 'success-text'}`}>
                                    {wcRatio}
                                </div>
                                <span className="hint-text">Design: {commonData.designWC}</span>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">A/C Ratio</span>
                                <div className="calc-value">{acRatio}</div>
                                <span className="hint-text">Design: {commonData.designAC}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toggle Sections for CA1, CA2, FA */}
            <div className="moisture-tabs">
                {['ca1', 'ca2', 'fa'].map(sec => (
                    <button
                        key={sec}
                        className={`moisture-tab-btn ${activeSection === sec ? 'active' : ''}`}
                        onClick={() => setActiveSection(sec)}
                    >
                        {sec.toUpperCase()} ({sec === 'ca1' ? '20mm' : sec === 'ca2' ? '10mm' : 'Fine'} Aggregate)
                    </button>
                ))}
            </div>

            {/* Active Section Form */}
            <div className="moisture-details-section">
                <h4>
                    {activeSection.toUpperCase()} ({activeSection === 'ca1' ? '20mm' : activeSection === 'ca2' ? '10mm' : 'Fine'}) Details
                </h4>

                <div className="moisture-details-grid">
                    <div className="form-field">
                        <label>Wet Sample (Gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={aggData[activeSection].wetSample}
                            onChange={e => handleAggChange(activeSection, 'wetSample', e.target.value)}
                            placeholder="Gms"
                        />
                    </div>
                    <div className="form-field">
                        <label>Dried Sample (Gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={aggData[activeSection].driedSample}
                            onChange={e => handleAggChange(activeSection, 'driedSample', e.target.value)}
                            placeholder="Gms"
                        />
                    </div>
                    <div className="form-field">
                        <label>Absorption % <span className="required">*</span></label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={aggData[activeSection].absorption}
                            onChange={e => handleAggChange(activeSection, 'absorption', e.target.value)}
                            placeholder="%"
                        />
                    </div>
                </div>

                {/* Auto-calculated fields for active section */}
                <div className="moisture-auto-vals-section">
                    <h5 className="sub-header-mini">Auto-Calculated Values</h5>
                    <div className="moisture-auto-vals">
                        {[
                            { label: 'Wt. of Moisture in Sample', value: `${activeCalc.moistureInSample} Gms` },
                            { label: 'Moisture %', value: `${activeCalc.moisturePct}%` },
                            { label: 'Free Moisture %', value: `${activeCalc.freeMoisturePct}%`, highlight: true },
                            { label: 'Batch Wt. (Dry)', value: `${activeCalc.batchWtDry} Kg` },
                            { label: 'Free Moisture (Kgs)', value: `${activeCalc.freeMoistureKg} Kg`, success: true },
                            { label: 'Adjusted Wt.', value: `${activeCalc.adjustedWt} Kg` },
                            { label: 'Wt. Adopted (Rounded)', value: `${activeCalc.wtAdopted} Kg`, warning: true }
                        ].map((item, idx) => (
                            <div key={idx} className={`auto-val-card ${item.warning ? 'warning-border' : ''}`}>
                                <div className="val-label">{item.label}</div>
                                <div className={`val-content ${item.highlight ? 'accent-text' : ''} ${item.success ? 'success-text' : ''} ${item.warning ? 'warning-text' : ''}`}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-actions-center">
                <button className="toggle-btn" onClick={handleSubmit}>
                    {initialData ? 'Update Analysis' : 'Submit Analysis'}
                </button>
            </div>
        </div>
    );
};

export default MoistureEntryForm;

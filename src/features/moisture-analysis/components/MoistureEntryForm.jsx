import React, { useState, useMemo, useEffect } from 'react';
import './MoistureEntryForm.css';

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
                <h4>Common Form Section</h4>

                <div className="moisture-grid">
                    <div className="form-field">
                        <label>Date</label>
                        <input type="date" value={commonData.date} onChange={e => handleCommonChange('date', e.target.value)} readOnly className="read-only-input" />
                    </div>
                    <div className="form-field">
                        <label>Shift</label>
                        <select value={commonData.shift} onChange={e => handleCommonChange('shift', e.target.value)} disabled className="read-only-input">
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Time <span className="required">*</span></label>
                        <input type="time" value={commonData.timing} onChange={e => handleCommonChange('timing', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label>Batch No. <span className="required">*</span></label>
                        <input type="number" min="0" value={commonData.batchNo} onChange={e => handleCommonChange('batchNo', e.target.value)} placeholder="Enter Batch Number" />
                    </div>
                </div>

                <div className="moisture-mix-grid">
                    <div className="form-field">
                        <label>Approved Mix Design <span className="required">*</span></label>
                        <select
                            value={commonData.mixDesignId}
                            onChange={e => handleCommonChange('mixDesignId', e.target.value)}
                            className="highlight-select"
                        >
                            <option value="">-- Select Approved Mix Design --</option>
                            {MIX_DESIGNS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    {commonData.mixDesignId && (
                        <>
                            <div className="calc-card">
                                <span className="mini-label">Design A/C</span>
                                <div className="calc-value accent-text">{commonData.designAC}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">Design W/C</span>
                                <div className="calc-value accent-text">{commonData.designWC}</div>
                            </div>
                        </>
                    )}
                </div>

                <h5 className="sub-header-mini">Batch Wt. Dry (Kgs) - Populated from Mix Design</h5>
                <div className="moisture-batch-grid">
                    {['CA1', 'CA2', 'FA', 'Water', 'Admix', 'Cement'].map(field => (
                        <div className="form-field" key={field}>
                            <label className="label-tiny">{field}</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={commonData[`batchDry${field}`]}
                                onChange={e => handleCommonChange(`batchDry${field}`, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* Auto-calculated fields */}
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
                    </div>
                    <div className="calc-card">
                        <span className="mini-label">A/C Ratio</span>
                        <div className="calc-value">{acRatio}</div>
                    </div>
                </div>
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

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { apiService } from '../../../services/api';
import './MoistureEntryForm.css';

const DEFAULT_MIX_VALUES = {
    name: 'Select Design',
    ac: '0',
    wc: '0',
    cement: '0',
    ca1: '0',
    ca2: '0',
    fa: '0',
    water: '0',
    admix: '1.44'
};

/**
 * MoistureEntryForm Component
 * Complete moisture analysis form matching specification with:
 * - Common Form Section (batch details and dry weights)
 * - CA1, CA2, FA Toggle Sections (with all calculations)
 */
const MoistureEntryForm = ({ onCancel, onSave, initialData }) => {
    const [activeSection, setActiveSection] = useState('ca1');
    const [mixDesignPlans, setMixDesignPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchMixDesigns = async () => {
            try {
                // Fetch full mix design records for selection
                const response = await apiService.getApprovedMixDesigns(1);
                if (response?.responseData) {
                    setMixDesignPlans(response.responseData);
                }
            } catch (error) {
                console.error("Error fetching mix designs:", error);
            }
        };
        fetchMixDesigns();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getLocalTimeData = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const local = new Date(now - offset);
        const iso = local.toISOString();
        return {
            date: iso.slice(0, 10),
            time: iso.slice(11, 16)
        };
    };

    const localInit = getLocalTimeData();

    // Common Form Section Data
    const [commonData, setCommonData] = useState({
        date: initialData?.date || localInit.date,
        shift: initialData?.shift || 'A',
        timing: initialData?.timing || localInit.time,
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
        designWC: initialData?.designWC || ''
    });

    // Aggregate Data for CA1, CA2, FA
    const [aggData, setAggData] = useState({
        ca1: initialData?.ca1Details || { wetSample: '', driedSample: '', absorption: '' },
        ca2: initialData?.ca2Details || { wetSample: '', driedSample: '', absorption: '' },
        fa: initialData?.faDetails || { wetSample: '', driedSample: '', absorption: '' }
    });

    // Sync state when initialData changes (to fix 'no value on modification' bug)
    useEffect(() => {
        if (initialData) {
            setCommonData({
                date: initialData.date || localInit.date,
                shift: initialData.shift || 'A',
                timing: initialData.timing || localInit.time,
                batchNo: initialData.batchNo || '',
                mixDesignId: initialData.mixDesignId || '',
                designValues: initialData.designValues || null,
                userDryCA1: initialData.userDryCA1 || '',
                userDryCA2: initialData.userDryCA2 || '',
                userDryFA: initialData.userDryFA || '',
                userDryWater: initialData.userDryWater || '',
                userDryAdmix: initialData.userDryAdmix || '1.44',
                userDryCement: initialData.userDryCement || '',
                designAC: initialData.designAC || '',
                designWC: initialData.designWC || ''
            });
            setAggData({
                ca1: initialData.ca1Details || { wetSample: '', driedSample: '', absorption: '' },
                ca2: initialData.ca2Details || { wetSample: '', driedSample: '', absorption: '' },
                fa: initialData.faDetails || { wetSample: '', driedSample: '', absorption: '' }
            });
        }
    }, [initialData]);

    const handleCommonChange = (field, val) => {
        if (field === 'mixDesignId') {
            const selectedPlan = mixDesignPlans.find(plan => plan.identification === val);
            if (selectedPlan) {
                const planValues = {
                    name: selectedPlan.identification,
                    ac: selectedPlan.acRatio || '0',
                    wc: selectedPlan.wcRatio || '0',
                    cement: selectedPlan.cement || '0',
                    ca1: selectedPlan.ca1 || '0',
                    ca2: selectedPlan.ca2 || '0',
                    fa: selectedPlan.fa || '0',
                    water: selectedPlan.water || '0',
                    admix: selectedPlan.admix || selectedPlan.admixtureLabel || '1.44'
                };
                
                setCommonData(prev => ({
                    ...prev,
                    mixDesignId: val,
                    designValues: planValues,
                    designAC: planValues.ac,
                    designWC: planValues.wc,
                    userDryCA1: '',
                    userDryCA2: '',
                    userDryFA: '',
                    userDryWater: '',
                    userDryCement: '',
                    userDryAdmix: planValues.admix
                }));
            } else {
                setCommonData(prev => ({
                    ...prev,
                    mixDesignId: val,
                    designValues: null,
                    designAC: '',
                    designWC: '',
                    userDryCA1: '',
                    userDryCA2: '',
                    userDryFA: '',
                    userDryWater: '',
                    userDryCement: '',
                    userDryAdmix: ''
                }));
            }
            return;
        }
        if (field === 'userDryCement') {
            const valNum = parseFloat(val);
            setCommonData(prev => {
                const design = prev.designValues;
                if (!design || !design.cement) {
                    // No design selected or missing cement data
                    return {
                        ...prev,
                        userDryCement: val,
                        userDryWater: '',
                        userDryAdmix: '',
                        userDryCA1: '',
                        userDryCA2: '',
                        userDryFA: ''
                    };
                }

                if (!isNaN(valNum) && valNum > 0) {
                    const L = parseFloat(design.cement) || 1; // Prevent div/0
                    const M = valNum;
                    const K = M / L; // Factor K = M/L

                    // Extract Mix Design WTs (A, B, C, D, E)
                    const A = parseFloat(design.ca1) || 0;
                    const B = parseFloat(design.ca2) || 0;
                    const C = parseFloat(design.fa) || 0;
                    const D = parseFloat(design.water) || 0;
                    const E = parseFloat(design.admix) || 0;

                    // Calculate Actual Batch WTs (F, G, H, I, J)
                    const ca1 = (K * A).toFixed(2);
                    const ca2 = (K * B).toFixed(2);
                    const fa = (K * C).toFixed(2);
                    const water = (K * D).toFixed(2);
                    const admix = (K * E).toFixed(2);

                    return {
                        ...prev,
                        userDryCement: val,
                        userDryCA1: ca1,
                        userDryCA2: ca2,
                        userDryFA: fa,
                        userDryWater: water,
                        userDryAdmix: admix
                    };
                } else {
                    return {
                        ...prev,
                        userDryCement: val,
                        userDryWater: '',
                        userDryAdmix: '',
                        userDryCA1: '',
                        userDryCA2: '',
                        userDryFA: ''
                    };
                }
            });
            return;
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

        // Wt. Adopted (Kgs) = Rounded of Adjusted Wt
        const wtAdopted = Math.round(adjustedWt);

        return {
            wetSample,
            driedSample,
            absorption,
            moistureInSample: moistureInSample.toFixed(3),
            moisturePct: moisturePct.toFixed(3),
            freeMoisturePct: freeMoisturePct.toFixed(3),
            batchWtDry: batchWtDry.toFixed(2),
            freeMoistureKg: freeMoistureKg.toFixed(3),
            adjustedWt: adjustedWt.toFixed(3),
            wtAdopted: wtAdopted
        };
    };

    const ca1Calc = useMemo(() => calculateAggregate('ca1'), [aggData.ca1, commonData.userDryCA1]);
    const ca2Calc = useMemo(() => calculateAggregate('ca2'), [aggData.ca2, commonData.userDryCA2]);
    const faCalc = useMemo(() => calculateAggregate('fa'), [aggData.fa, commonData.userDryFA]);

    // 31 = Water Content (D * M / L) -> Already stored as userDryWater
    const step31_WaterContent = parseFloat(commonData.userDryWater) || 0;

    // 32 = Actual Batch Free Moisture (8 + 18 + 28)
    const step32_TotalFreeMoisture = (
        parseFloat(ca1Calc.freeMoistureKg) +
        parseFloat(ca2Calc.freeMoistureKg) +
        parseFloat(faCalc.freeMoistureKg)
    );

    // 33 = Adjusted Water in Actual Batch (31 - 32)
    const step33_AdjustedWater = (step31_WaterContent - step32_TotalFreeMoisture);

    // 34 = (Aggregate / Cement) Ratio = (7 + 17 + 27) / M
    const M = parseFloat(commonData.userDryCement) || 0;
    const step34_ACRatio = M > 0 
        ? ((parseFloat(ca1Calc.batchWtDry) + parseFloat(ca2Calc.batchWtDry) + parseFloat(faCalc.batchWtDry)) / M)
        : 0;

    // 35 = (Water / Cement) Ratio = D / M (Using D from mix design)
    const D = parseFloat(commonData.designValues?.water) || 0;
    const step35_WCRatio = M > 0 ? (D / M) : 0;

    const totalFreeMoisture = step32_TotalFreeMoisture.toFixed(3);
    const adjustedWater = step33_AdjustedWater.toFixed(3);
    const acRatio = step34_ACRatio.toFixed(2);
    const wcRatio = step35_WCRatio.toFixed(3);

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
            // Aggregate Results
            ca1Result: ca1Calc,
            ca2Result: ca2Calc,
            faResult: faCalc,

            // Shared Stats
            totalFree: totalFreeMoisture,
            adjustedWater: adjustedWater,
            wcRatio: wcRatio,
            acRatio: acRatio,

            // Legacy/UI props
            ca1Free: ca1Calc.freeMoisturePct,
            ca2Free: ca2Calc.freeMoisturePct,
            faFree: faCalc.freeMoisturePct,

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
                            <span className="mini-label">Date</span>
                            <strong>{commonData.date ? commonData.date.split('-').reverse().join('/') : ''}</strong>
                        </div>
                        <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                        <div className="form-field-compact">
                            <span className="mini-label">Shift</span>
                            <strong>{commonData.shift}</strong>
                        </div>
                    </div>
                </div>

                <div className="moisture-grid">
                    <div className="form-field">
                        <label htmlFor="moisture-timing">Time <span className="required">*</span></label>
                        <input id="moisture-timing" name="timing" type="time" value={commonData.timing} onChange={e => handleCommonChange('timing', e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="moisture-batch">Batch No. <span className="required">*</span></label>
                        <input id="moisture-batch" name="batchNo" type="number" min="0" value={commonData.batchNo} onChange={e => handleCommonChange('batchNo', e.target.value)} placeholder="000" />
                    </div>
                    <div className="form-field" style={{ gridColumn: 'span 2' }} ref={dropdownRef}>
                        <label htmlFor="moisture-mix-design">Approved Mix Design <span className="required">*</span></label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="moisture-mix-design"
                                type="text"
                                placeholder="Search by Identification or Created By..."
                                value={isDropdownOpen ? searchTerm : commonData.mixDesignId}
                                onClick={() => {
                                    setIsDropdownOpen(true);
                                    setSearchTerm('');
                                }}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if(e.target.value === '') handleCommonChange('mixDesignId', '');
                                    setIsDropdownOpen(true);
                                }}
                                className="highlight-select"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                autoComplete="off"
                            />
                            {isDropdownOpen && (
                                <ul style={{
                                    position: 'absolute', zIndex: 10, background: 'white',
                                    border: '1px solid #cbd5e1', width: '100%', maxHeight: '200px',
                                    overflowY: 'auto', listStyle: 'none', padding: 0, margin: '4px 0 0 0',
                                    borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {mixDesignPlans
                                        .filter(m => m.identification.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((m, idx) => (
                                            <li key={idx} 
                                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#334155' }}
                                                onClick={() => {
                                                    handleCommonChange('mixDesignId', m.identification);
                                                    setSearchTerm('');
                                                    setIsDropdownOpen(false);
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >{m.identification}</li>
                                        ))}
                                    {mixDesignPlans.filter(m => m.identification.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                        <li style={{ padding: '8px 12px', color: '#94a3b8' }}>No results found</li>
                                    )}
                                </ul>
                            )}
                        </div>
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
                                    <input id="moisture-actual-cement" name="actualCement" type="number" step="0.01" value={commonData.userDryCement} onChange={e => handleCommonChange('userDryCement', e.target.value)} placeholder="0.00" aria-label="Actual Cement Weight" />
                                </div>
                                <div className="cell data-cell">
                                    <input id="moisture-actual-ca1" name="actualCA1" type="number" step="0.01" value={commonData.userDryCA1} readOnly tabIndex={-1} placeholder="0.00" aria-label="Actual CA1 Weight" style={{ background: '#f8fafc', color: '#64748b' }} />
                                </div>
                                <div className="cell data-cell">
                                    <input id="moisture-actual-ca2" name="actualCA2" type="number" step="0.01" value={commonData.userDryCA2} readOnly tabIndex={-1} placeholder="0.00" aria-label="Actual CA2 Weight" style={{ background: '#f8fafc', color: '#64748b' }} />
                                </div>
                                <div className="cell data-cell">
                                    <input id="moisture-actual-fa" name="actualFA" type="number" step="0.01" value={commonData.userDryFA} readOnly tabIndex={-1} placeholder="0.00" aria-label="Actual FA Weight" style={{ background: '#f8fafc', color: '#64748b' }} />
                                </div>
                                <div className="cell data-cell">
                                    <input id="moisture-actual-water" name="actualWater" type="number" step="0.01" value={commonData.userDryWater} readOnly tabIndex={-1} placeholder="0.00" aria-label="Actual Water Weight" style={{ background: '#f8fafc', color: '#64748b' }} />
                                </div>
                                <div className="cell data-cell">
                                    <input id="moisture-actual-admix" name="actualAdmix" type="number" step="0.01" value={commonData.userDryAdmix} readOnly tabIndex={-1} placeholder="0.00" aria-label="Actual Admix Weight" style={{ background: '#f8fafc', color: '#64748b' }} />
                                </div>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="moisture-calc-grid">
                            <div className="calc-card">
                                <span className="mini-label">Water Content (31)</span>
                                <div className="calc-value">{step31_WaterContent.toFixed(2)}</div>
                            </div>
                            <div className="calc-card highlight-border">
                                <span className="mini-label">Total Free Moist. (32)</span>
                                <div className="calc-value success-text">{totalFreeMoisture}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">Adj. Water (33)</span>
                                <div className="calc-value">{adjustedWater}</div>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">A/C Ratio (34)</span>
                                <div className="calc-value">{acRatio}</div>
                                <span className="hint-text">Target: {commonData.designAC}</span>
                            </div>
                            <div className="calc-card">
                                <span className="mini-label">D / M Ratio (35)</span>
                                <div className="calc-value">{wcRatio}</div>
                                <span className="hint-text">Mix Design D: {D}</span>
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
                        <label htmlFor="agg-wet-sample">Wet Sample (Gms) <span className="required">*</span></label>
                        <input
                            id="agg-wet-sample"
                            name="wetSample"
                            type="number"
                            min="0"
                            step="0.01"
                            value={aggData[activeSection].wetSample}
                            onChange={e => handleAggChange(activeSection, 'wetSample', e.target.value)}
                            placeholder="Gms"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="agg-dried-sample">Dried Sample (Gms) <span className="required">*</span></label>
                        <input
                            id="agg-dried-sample"
                            name="driedSample"
                            type="number"
                            min="0"
                            step="0.01"
                            value={aggData[activeSection].driedSample}
                            onChange={e => handleAggChange(activeSection, 'driedSample', e.target.value)}
                            placeholder="Gms"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="agg-absorption">Absorption % <span className="required">*</span></label>
                        <input
                            id="agg-absorption"
                            name="absorption"
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

            <div className="form-actions-center" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="toggle-btn" onClick={handleSubmit}>
                    {initialData ? 'Update Analysis' : 'Submit Analysis'}
                </button>
                {onCancel && (
                    <button
                        className="toggle-btn secondary"
                        type="button"
                        onClick={onCancel}
                        style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default MoistureEntryForm;

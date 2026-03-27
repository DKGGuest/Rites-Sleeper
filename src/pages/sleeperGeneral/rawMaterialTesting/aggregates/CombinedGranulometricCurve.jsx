import React, { useState, useEffect } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { saveAggregateGranulometric, getAggregateGranulometricByReqId } from "../../../../services/workflowService";
import TrendChart from "../../../../components/common/TrendChart";

const SieveTable = ({ title, sectionType, sieveSizes, sampleWeight, onDataChange }) => {
    const [rows, setRows] = useState(sieveSizes.map(size => ({
        sieveSize: size,
        wtRetained: 0,
        cummWtRetained: 0,
        pctRetained: 0,
        pctPassing: 100
    })));

    const handleWtChange = (idx, val) => {
        const newRows = [...rows];
        newRows[idx].wtRetained = Number(val);

        let cumulative = 0;
        const A = sampleWeight > 0 ? sampleWeight : 1; // Prevent division by zero

        newRows.forEach((r) => {
            cumulative += r.wtRetained;
            r.cummWtRetained = cumulative;
            r.pctRetained = (cumulative / A) * 100;
            r.pctPassing = Math.max(0, 100 - r.pctRetained);
        });

        setRows(newRows);
        onDataChange(newRows.map(r => r.pctPassing));
    };

    // Recalculate if sampleWeight changes
    useEffect(() => {
        handleWtChange(0, rows[0].wtRetained);
        // eslint-disable-next-line
    }, [sampleWeight]);

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div className="section-title" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', color: '#101828', fontWeight: 700, marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                {title}
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Sieve Size</th>
                            <th>Wt. Retained (gms)</th>
                            <th>Cumm. Wt. Retained</th>
                            <th>% Retained</th>
                            <th>% Passing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td data-label="Sieve Size" style={{ fontWeight: 600 }}>{row.sieveSize}</td>
                                <td data-label="Wt. Retained (gms)"><input type="number" min="0" step="0.01" value={row.wtRetained || ''} onChange={(e) => handleWtChange(idx, e.target.value)} /></td>
                                <td data-label="Cumm. Wt. Retained" className="readOnly">{row.cummWtRetained.toFixed(2)}</td>
                                <td data-label="% Retained" className="readOnly">{row.pctRetained.toFixed(2)}%</td>
                                <td data-label="% Passing" className="readOnly">{row.pctPassing.toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function CombinedGranulometricCurve({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", activeRequestId }) {
    const { selectedShift, dutyLocation, dutyDate } = useShift();
    const toast = useToast();
    const sieveSizes = [
        "20 mm", "10 mm", "4.75 mm", "2.36 mm", "1.18 mm",
        "0.60 mm", "0.30 mm", "0.15 mm"
    ];

    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [consignmentNo, setConsignmentNo] = useState("");
    
    // Sample Weights
    const [wtCA1, setWtCA1] = useState("");
    const [wtCA2, setWtCA2] = useState("");
    const [wtFA, setWtFA] = useState("");

    // Mix Design %
    const [mixCA1, setMixCA1] = useState("");
    const [mixCA2, setMixCA2] = useState("");
    const [mixFA, setMixFA] = useState("");

    // % Passing arrays from SieveTables
    const [pctPassingCA1, setPctPassingCA1] = useState(Array(8).fill(100));
    const [pctPassingCA2, setPctPassingCA2] = useState(Array(8).fill(100));
    const [pctPassingFA, setPctPassingFA] = useState(Array(8).fill(100));

    // Grading Ranges manually defined or fetched
    const [limits, setLimits] = useState(sieveSizes.map(() => ({ lower: 0, upper: 100 })));

    const [submitting, setSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (activeRequestId) {
            const row = inventoryData.find(i => i.requestId === activeRequestId);
            if (row) setConsignmentNo(row.consignmentNo);

            getAggregateGranulometricByReqId(activeRequestId).then(record => {
                if (record && record.id) {
                    setEditId(record.id);
                    setTestDate(record.testDate ? record.testDate.substring(0, 10) : new Date().toISOString().split('T')[0]);
                }
            });
        }
    }, [activeRequestId, inventoryData]);

    const handleLimitChange = (idx, field, val) => {
        const newLimits = [...limits];
        newLimits[idx][field] = Number(val);
        setLimits(newLimits);
    };

    // Calculate Combined Data for Graph
    const combinedGraphData = sieveSizes.map((size, idx) => {
        const n = Number(mixCA1) || 0;
        const o = Number(mixCA2) || 0;
        const p = Number(mixFA) || 0;

        const Q = (pctPassingCA1[idx] * n) / 100;
        const R = (pctPassingCA2[idx] * o) / 100;
        const S = (pctPassingFA[idx] * p) / 100;
        const T = Q + R + S;

        return {
            sieveSize: size,
            combined: Number(T.toFixed(2)),
            lower: limits[idx].lower,
            upper: limits[idx].upper
        };
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!consignmentNo) {
            toast.warning("Please select a consignment");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                testDate,
                consignmentNo,
                sampleWeights: { CA1: wtCA1, CA2: wtCA2, FA: wtFA },
                mixProportions: { CA1: mixCA1, CA2: mixCA2, FA: mixFA },
                combinedPassing: combinedGraphData.map(d => d.combined),
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate || new Date().toISOString().split('T')[0],
                requestId: activeRequestId || null,
                createdBy: parseInt(localStorage.getItem('userId') || '1', 10)
            };

            await saveAggregateGranulometric(payload, editId);
            toast.success(`Granulometric report ${editId ? 'updated' : 'saved'}!`);
            onSave && onSave(payload);
        } catch (error) {
            console.error("Error saving granulometric data:", error);
            toast.error("Failed to save Granulometric report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cement-forms-scope">
            <div className="form-card">
                <div className="form-header">
                    <h2>Combined Granulometric Curve</h2>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Sieve Analysis & Grading Range Mapping</p>
                </div>
                <div className="form-body">
                    
                    {/* Basic Info & Sample Weights */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div className="form-grid" style={{ marginBottom: '16px' }}>
                            <div className="input-group">
                                <label>Date of Testing <span className="required">*</span></label>
                                <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Consignment No. <span className="required">*</span></label>
                                {activeRequestId ? (
                                    <input type="text" value={consignmentNo} readOnly className="readOnly" style={{ background: '#f8fafc' }} />
                                ) : initialType === "Periodic" ? (
                                    <input type="text" value={consignmentNo} placeholder="Enter Consignment No" onChange={(e) => setConsignmentNo(e.target.value)} required />
                                ) : (
                                    <select value={consignmentNo} onChange={(e) => setConsignmentNo(e.target.value)} required>
                                        <option value="">-- Select --</option>
                                        {inventoryData.map((c, i) => (
                                            <option key={i} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="section-title" style={{ fontSize: '12px', color: '#475569', marginBottom: '10px' }}>Initial Sample Weights (Grams)</div>
                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div className="input-group">
                                <label>CA1 Weight (A)</label>
                                <input type="number" placeholder="Grams" value={wtCA1} onChange={(e) => setWtCA1(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>CA2 Weight (B)</label>
                                <input type="number" placeholder="Grams" value={wtCA2} onChange={(e) => setWtCA2(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>FA Weight (C)</label>
                                <input type="number" placeholder="Grams" value={wtFA} onChange={(e) => setWtFA(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <SieveTable title="🟡 SUB-SECTION 1: CA1" sectionType="CA1" sieveSizes={sieveSizes} sampleWeight={Number(wtCA1)} onDataChange={setPctPassingCA1} />
                    <SieveTable title="🟡 SUB-SECTION 2: CA2" sectionType="CA2" sieveSizes={sieveSizes} sampleWeight={Number(wtCA2)} onDataChange={setPctPassingCA2} />
                    <SieveTable title="🟡 SUB-SECTION 3: FA (Fine Aggregate)" sectionType="FA" sieveSizes={sieveSizes} sampleWeight={Number(wtFA)} onDataChange={setPctPassingFA} />

                    <div className="section-title" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', color: '#101828', fontWeight: 700, marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        🟡 SUB-SECTION 4: COMBINED PASSING TABLE
                    </div>
                    
                    <div style={{ background: '#f0f9ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '12px', color: '#0369a1' }}>Mix Design Proportions (%):</strong>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700 }}>CA1 (N)</label>
                            <input type="number" style={{ width: '80px', padding: '4px' }} placeholder="%" value={mixCA1} onChange={(e) => setMixCA1(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700 }}>CA2 (O)</label>
                            <input type="number" style={{ width: '80px', padding: '4px' }} placeholder="%" value={mixCA2} onChange={(e) => setMixCA2(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label style={{ fontSize: '11px', fontWeight: 700 }}>FA (P)</label>
                            <input type="number" style={{ width: '80px', padding: '4px' }} placeholder="%" value={mixFA} onChange={(e) => setMixFA(e.target.value)} />
                        </div>
                    </div>

                    <div className="table-container" style={{ marginBottom: '24px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sieve Size</th>
                                    <th>Q = (ExN)/100</th>
                                    <th>R = (IxO)/100</th>
                                    <th>S = (MxP)/100</th>
                                    <th style={{ background: '#ecfdf5', color: '#065f46' }}>Combined Passing (T)</th>
                                    <th>Grading Range (Lower % - Upper %)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sieveSizes.map((size, idx) => {
                                    const n = Number(mixCA1) || 0;
                                    const o = Number(mixCA2) || 0;
                                    const p = Number(mixFA) || 0;

                                    const Q = (pctPassingCA1[idx] * n) / 100;
                                    const R = (pctPassingCA2[idx] * o) / 100;
                                    const S = (pctPassingFA[idx] * p) / 100;
                                    const T = Q + R + S;

                                    return (
                                        <tr key={idx}>
                                            <td data-label="Sieve" style={{ fontWeight: 600 }}>{size}</td>
                                            <td data-label="Q" className="readOnly" style={{ color: '#64748b' }}>{Q.toFixed(2)}</td>
                                            <td data-label="R" className="readOnly" style={{ color: '#64748b' }}>{R.toFixed(2)}</td>
                                            <td data-label="S" className="readOnly" style={{ color: '#64748b' }}>{S.toFixed(2)}</td>
                                            <td data-label="Combined" className="readOnly" style={{ fontWeight: 800, background: '#f0fdf4', color: '#059669' }}>
                                                {T.toFixed(2)}%
                                            </td>
                                            <td data-label="Range" style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                <input type="number" style={{ width: '60px', padding: '2px 4px', fontSize: '11px' }} value={limits[idx].lower} onChange={(e) => handleLimitChange(idx, 'lower', e.target.value)} />
                                                <span style={{ color: '#94a3b8' }}>-</span>
                                                <input type="number" style={{ width: '60px', padding: '2px 4px', fontSize: '11px' }} value={limits[idx].upper} onChange={(e) => handleLimitChange(idx, 'upper', e.target.value)} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Chart Visualization */}
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#334155' }}>Granulometric Curve Visualization</h4>
                        <TrendChart
                            data={combinedGraphData}
                            xKey="sieveSize"
                            lines={[
                                { key: 'combined', color: '#059669', label: 'Actual Combined % (T)' },
                                { key: 'upper', color: '#ef4444', label: 'Upper Limit' },
                                { key: 'lower', color: '#f59e0b', label: 'Lower Limit' }
                            ]}
                            title=""
                            description=""
                            yAxisLabel="% Passing"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button type="submit" className="btn-save" style={{ minWidth: '200px' }} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Submit Curve Report'}
                        </button>
                        {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ background: '#f1f5f9', color: '#64748b', border: 'none', minWidth: '120px' }} disabled={submitting}>Cancel</button>}
                    </div>
                </div>
            </div>
        </form>
    );
}

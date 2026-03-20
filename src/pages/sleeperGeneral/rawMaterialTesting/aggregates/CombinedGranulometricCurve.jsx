import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { saveAggregateGranulometric } from "../../../../services/workflowService";

const SieveTable = ({ title, sectionType, sieveSizes, onDataChange }) => {
    const [rows, setRows] = useState(sieveSizes.map(size => ({
        sectionType: sectionType,
        sieveSize: size,
        wtRetained: 0,
        cummWtRetained: 0,
        pctRetained: 0,
        pctPassing: 100
    })));

    const handleWtChange = (idx, val) => {
        const newRows = [...rows];
        newRows[idx].wtRetained = Number(val);

        // Recalculate everything
        let cumulative = 0;
        const totalWt = newRows.reduce((acc, r) => acc + r.wtRetained, 0);

        newRows.forEach((r, i) => {
            cumulative += r.wtRetained;
            r.cummWtRetained = cumulative;
            r.pctRetained = totalWt > 0 ? (cumulative / totalWt) * 100 : 0;
            r.pctPassing = 100 - r.pctRetained;
        });

        setRows(newRows);
    };

    useEffect(() => {
        onDataChange({ rows, pctPassingList: rows.map(r => r.pctPassing) });
    }, [rows]);

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
                                <td data-label="Wt. Retained (gms)"><input type="number" step="0.01" value={row.wtRetained || ''} onChange={(e) => handleWtChange(idx, e.target.value)} /></td>
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

export default function CombinedGranulometricCurve({ onSave, onCancel, inventoryData = [], initialType = "New Inventory" }) {
    const { userId } = useSelector(state => state.auth);
    const { selectedShift, dutyLocation, dutyDate } = useShift();
    const { showToast } = useToast();
    const sieveSizes = [
        "20 mm", "10 mm", "4.75 mm", "2.36 mm", "1.18 mm",
        "600 microns", "300 microns", "150 microns", "< 150 microns"
    ];

    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [consignmentNo, setConsignmentNo] = useState("");
    const [ca1Data, setCa1Data] = useState({ rows: [], pctPassingList: Array(9).fill(100) });
    const [ca2Data, setCa2Data] = useState({ rows: [], pctPassingList: Array(9).fill(100) });
    const [faData, setFaData] = useState({ rows: [], pctPassingList: Array(9).fill(100) });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!consignmentNo) {
            showToast("Please select a consignment", "warning");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                testDate,
                consignmentNo,
                observations: [...ca1Data.rows, ...ca2Data.rows, ...faData.rows],
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate || new Date().toISOString().split('T')[0],
                createdBy: userId || 1
            };

            await saveAggregateGranulometric(payload);
            showToast("Granulometric Curve report saved successfully!", "success");
            setConsignmentNo("");
            onSave && onSave(payload);
        } catch (error) {
            console.error("Error saving granulometric data:", error);
            showToast("Failed to save Granulometric report.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cement-forms-scope">
            <div className="form-card">
                <div className="form-header">
                    <h2>Combined Granulometric Curve</h2>
                </div>
                <div className="form-body">
                    <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label>Date of Testing <span className="required">*</span></label>
                            <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label>Consignment No. <span className="required">*</span></label>
                            <select
                                value={consignmentNo}
                                onChange={(e) => setConsignmentNo(e.target.value)}
                                required
                            >
                                <option value="">-- Select --</option>
                                {inventoryData.map((c, i) => (
                                    <option key={i} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                ))}
                                <option value="PERIODIC">-- Periodic Testing --</option>
                            </select>
                        </div>
                    </div>

                    <SieveTable title="🟡 SUB-SECTION 1: CA1" sectionType="CA1" sieveSizes={sieveSizes} onDataChange={setCa1Data} />
                    <SieveTable title="🟡 SUB-SECTION 2: CA2" sectionType="CA2" sieveSizes={sieveSizes} onDataChange={setCa2Data} />
                    <SieveTable title="🟡 SUB-SECTION 3: FA (Fine Aggregate)" sectionType="FA" sieveSizes={sieveSizes} onDataChange={setFaData} />

                    <div className="section-title" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', color: '#101828', fontWeight: 700, marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        🟡 SUB-SECTION 4: COMBINED PASSING TABLE
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sieve Size</th>
                                    <th>CA1 % Passing</th>
                                    <th>CA2 % Passing</th>
                                    <th>FA % Passing</th>
                                    <th>Combined Passing</th>
                                    <th>Grading Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sieveSizes.map((size, idx) => (
                                    <tr key={idx}>
                                        <td data-label="Sieve Size" style={{ fontWeight: 600 }}>{size}</td>
                                        <td data-label="CA1 % Passing" className="readOnly">{ca1Data.pctPassingList[idx].toFixed(2)}%</td>
                                        <td data-label="CA2 % Passing" className="readOnly">{ca2Data.pctPassingList[idx].toFixed(2)}%</td>
                                        <td data-label="FA % Passing" className="readOnly">{faData.pctPassingList[idx].toFixed(2)}%</td>
                                        <td data-label="Combined Passing" className="readOnly" style={{ color: '#64748b' }}>TBD</td>
                                        <td data-label="Grading Range" className="readOnly" style={{ color: '#64748b' }}>TBD</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-save" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Submit Test Report'}
                        </button>
                        {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ background: '#64748b' }} disabled={submitting}>Cancel</button>}
                    </div>
                </div>
            </div>
        </form>
    );
}

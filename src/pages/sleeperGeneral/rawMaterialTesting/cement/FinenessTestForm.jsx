import React, { useEffect, useState } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { saveCementFineness, getCementFinenessByReqId } from "../../../../services/workflowService";

export default function FinenessTestForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", activeRequestId, editData }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const user = getStoredUser();

    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        typeOfTesting: initialType,
        consignmentNo: "",
        sampleWt: 100,
        residue1: "",
        residue2: "",
        residue3: ""
    });

    const [calcData, setCalcData] = useState({
        r1: 0,
        r2: 0,
        r3: 0,
        diff: 0,
        showTrial3: false,
        mean: 0
    });

    const [result, setResult] = useState("");
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (activeRequestId) {
            const row = inventoryData.find(i => i.requestId === activeRequestId);
            if (row && !header.consignmentNo) {
                setHeader(prev => ({ ...prev, consignmentNo: row.consignmentNo }));
            }
            getCementFinenessByReqId(activeRequestId).then(record => {
                if (record && record.id) {
                    setEditId(record.id);
                    setHeader(prev => ({
                        ...prev,
                        typeOfTesting: record.typeOfTesting || prev.typeOfTesting,
                        consignmentNo: record.consignmentNo || prev.consignmentNo,
                        sampleWt: record.sampleWeightW1 || prev.sampleWt,
                        residue1: record.residue1 || record.residueWeightW2 || "",
                        residue2: record.residue2 || "",
                        residue3: record.residue3 || ""
                    }));
                }
            });
        } else if (initialType === "Periodic" && editData) {
            setEditId(editData.id);
            setHeader(prev => ({
                ...prev,
                typeOfTesting: "Periodic",
                consignmentNo: editData.consignmentNo || "",
                sampleWt: editData.sampleWeightW1 || 100,
                residue1: editData.residue1 || "",
                residue2: editData.residue2 || "",
                residue3: editData.residue3 || ""
            }));
        }
    }, [activeRequestId, editData, initialType]);

    useEffect(() => {
        const { sampleWt, residue1, residue2, residue3 } = header;
        const s = parseFloat(sampleWt) || 0;
        const b = parseFloat(residue1) || 0;
        const c = parseFloat(residue2) || 0;
        const h = parseFloat(residue3) || 0;

        if (s > 0 && (residue1 !== "" && residue2 !== "")) {
            const r1 = (b / s) * 100;
            const r2 = (c / s) * 100;
            const diff = Math.abs(r1 - r2);
            const showTrial3 = diff > 1;
            
            let mean = 0;
            let r3 = 0;

            if (showTrial3) {
                r3 = (h / s) * 100;
                mean = (r1 + r2 + r3) / 3;
            } else {
                mean = (r1 + r2) / 2;
            }

            setCalcData({
                r1: r1.toFixed(2),
                r2: r2.toFixed(2),
                r3: r3.toFixed(2),
                diff: diff.toFixed(2),
                showTrial3,
                mean: mean.toFixed(2)
            });

            setResult(mean < 10 ? "Satisfactory" : "Unsatisfactory");
        } else {
            setCalcData({
                r1: 0,
                r2: 0,
                r3: 0,
                diff: 0,
                showTrial3: false,
                mean: 0
            });
            setResult("");
        }
    }, [header.sampleWt, header.residue1, header.residue2, header.residue3]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: header.typeOfTesting,
                consignmentNo: header.consignmentNo,
                sampleWeightW1: parseFloat(header.sampleWt),
                residueWeightW2: parseFloat(calcData.mean * header.sampleWt / 100), // Calculated back for existing field
                residue1: parseFloat(header.residue1),
                residue2: parseFloat(header.residue2),
                residue3: header.residue3 ? parseFloat(header.residue3) : null,
                percentageFineness: parseFloat(calcData.mean),
                result: result,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                requestId: activeRequestId || null,
                createdBy: user?.userId || 0
            };

            await saveCementFineness(payload, editId);
            toast.success(`Cement Fineness Test record ${editId ? 'updated' : 'saved'} successfully!`);
            if (onSave) onSave(payload);
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Error saving record. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-card">
            <div className="form-header">
                <h2>Fineness Test – Cement (Sieve Method)</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="form-body">
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f1f5f9' }} />
                    </div>

                    <div className="input-group">
                        <label>Consignment No <span className="required">*</span></label>
                        {activeRequestId ? (
                            <input 
                                type="text"
                                value={header.consignmentNo}
                                readOnly
                                style={{ background: '#f8fafc' }}
                            />
                        ) : header.typeOfTesting === 'Periodic' ? (
                            <input 
                                type="text"
                                placeholder="Enter Consignment No"
                                value={header.consignmentNo}
                                onChange={(e) => setHeader({ ...header, consignmentNo: e.target.value })}
                                required
                            />
                        ) : (
                            <select 
                                value={header.consignmentNo}
                                onChange={(e) => setHeader({ ...header, consignmentNo: e.target.value })}
                                required
                            >
                                <option value="">-- Select --</option>
                                {inventoryData.map(c => (
                                    <option key={c.consignmentNo} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Sample Weight (W1) (gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            value={header.sampleWt}
                            onChange={(e) => setHeader({ ...header, sampleWt: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Trial 1: Residue on Sieve (B) (gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            value={header.residue1}
                            onChange={(e) => setHeader({ ...header, residue1: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Trial 2: Residue on Sieve (C) (gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            value={header.residue2}
                            onChange={(e) => setHeader({ ...header, residue2: e.target.value })}
                            required
                        />
                    </div>

                    {calcData.showTrial3 && (
                        <div className="input-group">
                            <label>Trial 3: Residue on Sieve (H) (gms) <span className="required">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="gms"
                                value={header.residue3}
                                onChange={(e) => setHeader({ ...header, residue3: e.target.value })}
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="section-title">Calculations</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div className="calc-item">
                        <span style={{ fontSize: '12px', color: '#64748b' }}>R1 = (B/A) × 100 = </span>
                        <span style={{ fontWeight: '600' }}>{calcData.r1}%</span>
                    </div>
                    <div className="calc-item">
                        <span style={{ fontSize: '12px', color: '#64748b' }}>R2 = (C/A) × 100 = </span>
                        <span style={{ fontWeight: '600' }}>{calcData.r2}%</span>
                    </div>
                    {calcData.showTrial3 && (
                        <div className="calc-item">
                            <span style={{ fontSize: '12px', color: '#64748b' }}>R3 = (H/A) × 100 = </span>
                            <span style={{ fontWeight: '600' }}>{calcData.r3}%</span>
                        </div>
                    )}
                    <div className="calc-item" style={{ gridColumn: 'span 2', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Difference (D - E) = </span>
                        <span style={{ fontWeight: '600', color: parseFloat(calcData.diff) > 1 ? '#ef4444' : '#059669' }}>{calcData.diff}%</span>
                        {parseFloat(calcData.diff) > 1 && <span style={{ fontSize: '10px', marginLeft: '8px', color: '#ef4444' }}>( &gt; 1%, Trial 3 Required)</span>}
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-title">Test Calculations</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Mean Fineness</div>
                            <div className="info-card-value">{calcData.mean || "-"} %</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Requirement (IS 4031)</div>
                            <div className="info-card-value">&lt; 10%</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Overall Result</div>
                            <div className="info-card-value" style={{ color: result === "Satisfactory" ? '#059669' : '#ef4444' }}>
                                {result || "-"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="btn-group" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn-save" disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Saving..." : editId ? "Update Test Report" : "Submit Test Report"}
                    </button>
                    <button type="button" onClick={onCancel} className="btn-save" style={{ flex: 1, background: '#64748b' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

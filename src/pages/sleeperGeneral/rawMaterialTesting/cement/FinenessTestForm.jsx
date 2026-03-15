import React, { useEffect, useState } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { saveCementFineness } from "../../../../services/workflowService";

export default function FinenessTestForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory" }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const { showToast } = useToast();
    const user = getStoredUser();

    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        typeOfTesting: initialType,
        consignmentNo: "",
        sampleWt: 100,
        residueWt: ""
    });

    const [fineness, setFineness] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        const { sampleWt, residueWt } = header;
        if (sampleWt && residueWt) {
            const s = parseFloat(sampleWt);
            const r = parseFloat(residueWt);
            if (s > 0) {
                const f = (r / s) * 100;
                setFineness(f.toFixed(2));
                // OPC usually < 10%
                setResult(f <= 10 ? "Satisfactory" : "Unsatisfactory");
            }
        } else {
            setFineness("");
            setResult("");
        }
    }, [header.sampleWt, header.residueWt]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: header.typeOfTesting,
                consignmentNo: header.consignmentNo,
                sampleWeightW1: parseFloat(header.sampleWt),
                residueWeightW2: parseFloat(header.residueWt),
                percentageFineness: parseFloat(fineness),
                result: result,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                createdBy: user?.userId || 0
            };

            await saveCementFineness(payload);
            showToast("Cement Fineness Test record saved successfully!", "success");
            if (onSave) onSave();
        } catch (error) {
            console.error("Save failed:", error);
            showToast("Error saving record. Please check console.", "error");
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
                        <select 
                            value={header.consignmentNo}
                            onChange={(e) => setHeader({ ...header, consignmentNo: e.target.value })}
                            required
                        >
                            <option value="">-- Select --</option>
                            {inventoryData.map(c => (
                                <option key={c.consignmentNo} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                            ))}
                            <option value="PERIODIC">-- Periodic Testing --</option>
                        </select>
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
                        <label>Weight of Residue (W2) (gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            value={header.residueWt}
                            onChange={(e) => setHeader({ ...header, residueWt: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-title">Test Calculations</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Percentage Fineness</div>
                            <div className="info-card-value">{fineness || "-"} %</div>
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
                        {loading ? "Saving..." : "Submit Test Report"}
                    </button>
                    <button type="button" onClick={onCancel} className="btn-save" style={{ flex: 1, background: '#64748b' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

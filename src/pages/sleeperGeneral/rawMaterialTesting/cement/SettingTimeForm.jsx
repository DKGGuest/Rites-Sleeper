import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { saveCementSettingTime } from "../../../../services/workflowService";

const emptyRow = { time: "", needle: "", spot: "" };

export default function SettingTimeForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory" }) {
    const { userId } = useSelector(state => state.auth);
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        type: initialType,
        consignment: "",
        temp: "",
        weight: "",
        nc: "",
        waterQty: "",
        waterAddTime: "",
        mouldTime: ""
    });

    const [rows, setRows] = useState(
        Array.from({ length: 20 }, () => ({ ...emptyRow }))
    );

    const [initialTime, setInitialTime] = useState(null);
    const [finalTime, setFinalTime] = useState(null);
    const [result, setResult] = useState("");

    const updateRow = (i, field, val) => {
        const copy = [...rows];
        copy[i][field] = val;
        setRows(copy);
    };

    // Calculate difference in minutes
    const diffMinutes = (t1, t2) => {
        if (!t1 || !t2) return null;
        const [h1, m1] = t1.split(":").map(Number);
        const [h2, m2] = t2.split(":").map(Number);
        return h2 * 60 + m2 - (h1 * 60 + m1);
    };

    useEffect(() => {
        if (!header.waterAddTime) return;

        let init = null;
        let fin = null;

        rows.forEach((r) => {
            const mins = diffMinutes(header.waterAddTime, r.time);

            if (init === null && r.needle && Number(r.needle) > 5 && mins >= 0) {
                init = mins;
            }

            if (fin === null && r.spot === "yes" && mins >= 0) {
                fin = mins;
            }
        });

        setInitialTime(init);
        setFinalTime(fin);

        if (init !== null && fin !== null) {
            if (init >= 60 && fin <= 600) setResult("OK");
            else setResult("NOT OK");
        } else {
            setResult("");
        }
    }, [rows, header.waterAddTime]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: header.type,
                consignmentNo: header.consignment,
                roomTemp: parseFloat(header.temp),
                weight: parseFloat(header.weight),
                normalConsistency: parseFloat(header.nc),
                waterAdded: parseFloat(header.waterQty),
                timeOfAddingWater: header.waterAddTime ? `${header.waterAddTime}:00` : null,
                mouldReadyAt: header.mouldTime ? `${header.mouldTime}:00` : null,
                initialSettingTime: initialTime,
                finalSettingTime: finalTime,
                result: result,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                createdBy: userId || 0,
                observations: rows
                    .filter(r => r.time && r.needle)
                    .map(r => ({
                        readingTime: `${r.time}:00`,
                        needlePenetration: parseFloat(r.needle),
                        finalSpot: r.spot
                    }))
            };

            await saveCementSettingTime(payload);
            showToast("Setting Time Test record saved successfully!", "success");
            if (onSave) onSave();
        } catch (error) {
            console.error("Save failed:", error);
            showToast("Error saving record. Please check console.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="form-card" onSubmit={handleFormSubmit}>
            <div className="form-header">
                <h2>Setting Time Test – Cement</h2>
            </div>

            <div className="form-body">
                {/* HEADER */}
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date <span className="required">*</span></label>
                        <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f8fafc' }} />
                    </div>

                    <div className="input-group">
                        <label>Type <span className="required">*</span></label>
                        <select 
                            value={header.type}
                            onChange={(e) => setHeader({ ...header, type: e.target.value })}
                            required
                        >
                            <option value="">-- Select --</option>
                            <option value="New Inventory">New Inventory</option>
                            <option value="Periodic">Periodic</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Consignment No <span className="required">*</span></label>
                        <select 
                            value={header.consignment}
                            onChange={(e) => setHeader({ ...header, consignment: e.target.value })}
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
                        <label>Room Temp (°C)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="°C" 
                            value={header.temp}
                            onChange={(e) => setHeader({ ...header, temp: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Weight (gms)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="gms" 
                            value={header.weight}
                            onChange={(e) => setHeader({ ...header, weight: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Normal Consistency (%)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="%" 
                            value={header.nc}
                            onChange={(e) => setHeader({ ...header, nc: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Water Added (ml)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="ml" 
                            value={header.waterQty}
                            onChange={(e) => setHeader({ ...header, waterQty: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Time of Adding Water</label>
                        <input 
                            type="time" 
                            value={header.waterAddTime}
                            onChange={(e) => setHeader({ ...header, waterAddTime: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Mould Ready at</label>
                        <input 
                            type="time" 
                            value={header.mouldTime}
                            onChange={(e) => setHeader({ ...header, mouldTime: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="section-title">Observations</div>
                <div className="section-subtitle">Monitor needle penetration at regular intervals</div>

                <div className="table-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Reading Time</th>
                                <th>Needle (mm)</th>
                                <th>Final Spot?</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i}>
                                    <td data-label="#" style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                                    <td data-label="Reading Time">
                                        <input
                                            type="time"
                                            value={r.time}
                                            onChange={(e) => updateRow(i, "time", e.target.value)}
                                        />
                                    </td>
                                    <td data-label="Needle (mm)">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={r.needle}
                                            onChange={(e) => updateRow(i, "needle", e.target.value)}
                                        />
                                    </td>
                                    <td data-label="Final Spot?">
                                        <select
                                            value={r.spot}
                                            onChange={(e) => updateRow(i, "spot", e.target.value)}
                                        >
                                            <option value="">-- Select --</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* RESULTS */}
                <div className="info-section">
                    <div className="info-title">Calculated Setting Times</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Initial Setting Time</div>
                            <div className="info-card-value">{initialTime !== null ? `${initialTime} min` : "-"}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Final Setting Time</div>
                            <div className="info-card-value">{finalTime !== null ? `${finalTime} min` : "-"}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Overall Result</div>
                            <div className="info-card-value" style={{ color: result === "OK" ? "#10b981" : "#ef4444" }}>
                                {result || "-"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="btn-group" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? "Saving..." : "Submit Test Report"}
                    </button>
                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}

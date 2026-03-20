import React, { useEffect, useState } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { saveCementSpecificSurface, getCementSpecificSurfaceByReqId } from "../../../../services/workflowService";

export default function SpecificSurfaceForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", activeRequestId }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const user = getStoredUser();

    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        type: initialType,
        consignment: "",
        roomTemp: "",
        weight: "",
        standardTime: "",
        standardSurface: ""
    });

    const [readings, setReadings] = useState({
        t1: "",
        t2: "",
        t3: ""
    });

    const [avgTime, setAvgTime] = useState(0);
    const [Fm, setFm] = useState(0);
    const [result, setResult] = useState("");
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (activeRequestId) {
            const row = inventoryData.find(i => i.requestId === activeRequestId);
            if (row && !header.consignment) {
                setHeader(prev => ({ ...prev, consignment: row.consignmentNo }));
            }
            getCementSpecificSurfaceByReqId(activeRequestId).then(record => {
                if (record && record.id) {
                    setEditId(record.id);
                    setHeader(prev => ({
                        ...prev,
                        type: record.typeOfTesting || prev.type,
                        consignment: record.consignmentNo || prev.consignment,
                        roomTemp: record.roomTemp || prev.roomTemp,
                        weight: record.weight || prev.weight,
                        standardTime: record.standardTimeTs || prev.standardTime,
                        standardSurface: record.standardSurfaceFs || prev.standardSurface
                    }));
                    setReadings({
                        t1: record.sampleTime1 || "",
                        t2: record.sampleTime2 || "",
                        t3: record.sampleTime3 || ""
                    });
                }
            });
        }
    }, [activeRequestId]);

    // Calculate Average Time
    useEffect(() => {
        const { t1, t2, t3 } = readings;
        if (t1 && t2 && t3) {
            const avg = (Number(t1) + Number(t2) + Number(t3)) / 3;
            setAvgTime(avg.toFixed(2));
        } else {
            setAvgTime(0);
        }
    }, [readings]);

    // Calculate Specific Surface Fm
    useEffect(() => {
        const { standardTime, standardSurface } = header;
        if (avgTime && standardTime && standardSurface) {
            const fm = Number(standardSurface) * Math.sqrt(avgTime / Number(standardTime));
            setFm(fm.toFixed(2));
            setResult(fm > 3700 ? "OK" : "NOT OK");
        } else {
            setFm(0);
            setResult("");
        }
    }, [avgTime, header.standardTime, header.standardSurface]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: header.type,
                consignmentNo: header.consignment,
                roomTemp: parseFloat(header.roomTemp),
                weight: parseFloat(header.weight),
                standardTimeTs: parseFloat(header.standardTime),
                standardSurfaceFs: parseFloat(header.standardSurface),
                sampleTime1: parseFloat(readings.t1),
                sampleTime2: parseFloat(readings.t2),
                sampleTime3: parseFloat(readings.t3),
                avgTime: parseFloat(avgTime),
                specificSurfaceFm: parseFloat(Fm),
                result: result,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                requestId: activeRequestId || null,
                createdBy: user?.userId || 0
            };

            await saveCementSpecificSurface(payload, editId);
            toast.success(`Specific Surface Test record ${editId ? 'updated' : 'saved'} successfully!`);
            if (onSave) onSave();
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Error saving record. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="form-card" onSubmit={handleFormSubmit}>
            <div className="form-header">
                <h2>Specific Surface Test – Cement</h2>
            </div>

            <div className="form-body">
                {/* HEADERS & MAIN INPUTS */}
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input
                            type="text"
                            value={new Date().toLocaleDateString('en-GB')}
                            readOnly
                            style={{ background: '#f8fafc' }}
                        />
                    </div>

                    <div className="input-group">
                        <label>Type of Testing <span className="required">*</span></label>
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
                        <label>Consignment No. <span className="required">*</span></label>
                        {activeRequestId ? (
                            <input 
                                type="text"
                                value={header.consignment}
                                readOnly
                                style={{ background: '#f8fafc' }}
                            />
                        ) : header.type === 'Periodic' ? (
                            <input 
                                type="text"
                                placeholder="Enter Consignment No"
                                value={header.consignment}
                                onChange={(e) => setHeader({ ...header, consignment: e.target.value })}
                                required
                            />
                        ) : (
                            <select 
                                value={header.consignment}
                                onChange={(e) => setHeader({ ...header, consignment: e.target.value })}
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
                        <label>Room Temperature (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="°C"
                            value={header.roomTemp}
                            onChange={(e) => setHeader({ ...header, roomTemp: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Weight of Sample (gms)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            value={header.weight}
                            onChange={(e) => setHeader({ ...header, weight: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="section-divider"></div>

                {/* Standard Cement Section */}
                <div className="section-title">Standard Cement Parameters</div>
                <div className="section-subtitle">Reference values for calculation</div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Liquid Falling Time Ts (sec)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Standard time"
                            value={header.standardTime}
                            onChange={(e) => setHeader({ ...header, standardTime: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Specific Surface Fs</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Standard surface"
                            value={header.standardSurface}
                            onChange={(e) => setHeader({ ...header, standardSurface: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Sample Times */}
                <div className="section-title">Liquid Failing Time of Sample Cement</div>
                <div className="section-subtitle">Enter three independent readings</div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Sample Time 1 (sec)</label>
                        <input
                            placeholder="Reading 1"
                            type="number"
                            step="0.01"
                            value={readings.t1}
                            onChange={(e) => setReadings({ ...readings, t1: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Sample Time 2 (sec)</label>
                        <input
                            placeholder="Reading 2"
                            type="number"
                            step="0.01"
                            value={readings.t2}
                            onChange={(e) => setReadings({ ...readings, t2: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Sample Time 3 (sec)</label>
                        <input
                            placeholder="Reading 3"
                            type="number"
                            step="0.01"
                            value={readings.t3}
                            onChange={(e) => setReadings({ ...readings, t3: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* RESULTS */}
                <div className="info-section">
                    <div className="info-title">Calculated Results</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Average Time</div>
                            <div className="info-card-value">{avgTime || "-"}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Specific Surface Fm</div>
                            <div className="info-card-value">{Fm || "-"}</div>
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
                        {loading ? "Saving..." : editId ? "Update Test Report" : "Submit Test Report"}
                    </button>
                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}

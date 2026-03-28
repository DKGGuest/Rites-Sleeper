import React, { useState, useEffect } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { saveCementNormalConsistency, getCementNormalConsistencyByReqId } from "../../../../services/workflowService";


const emptyRow = {
    percent: "",
    volume: "",
    addTime: "",
    readTime: "",
    needle: "",
};

export default function NormalConsistencyForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", activeRequestId, onValueChange }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const user = getStoredUser();

    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        typeOfTesting: initialType,
        consignmentNo: "",
        roomTemp: "",
        sampleWeight: 400
    });

    // Handle sampleWeight changes to recalculate all volumes
    useEffect(() => {
        const weight = parseFloat(header.sampleWeight) || 0;
        if (weight > 0) {
            setRows(prev => prev.map(row => {
                if (row.percent) {
                    return { ...row, volume: ((parseFloat(row.percent) / 100) * weight).toFixed(1) };
                }
                return row;
            }));
        }
    }, [header.sampleWeight]);

    const [rows, setRows] = useState([
        { ...emptyRow },
        { ...emptyRow },
        { ...emptyRow },
        { ...emptyRow },
    ]);

    const [normalConsistency, setNormalConsistency] = useState("");
    const [qtyOfWater, setQtyOfWater] = useState("");
    const [water85, setWater85] = useState("");
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (activeRequestId) {
            const row = inventoryData.find(i => i.requestId === activeRequestId);
            if (row && !header.consignmentNo) {
                setHeader(prev => ({ ...prev, consignmentNo: row.consignmentNo }));
            }
            getCementNormalConsistencyByReqId(activeRequestId).then(record => {
                if (record && record.id) {
                    setEditId(record.id);
                    setHeader(prev => ({
                        ...prev,
                        typeOfTesting: record.typeOfTesting || prev.typeOfTesting,
                        consignmentNo: record.consignmentNo || prev.consignmentNo,
                        roomTemp: record.roomTemp || prev.roomTemp,
                        sampleWeight: record.sampleWeight || prev.sampleWeight
                    }));
                    if (record.observations && record.observations.length > 0) {
                        const mapped = record.observations.map(o => ({
                            percent: o.percentWaterAdded || "",
                            volume: o.volume || "",
                            addTime: o.timeOfAdding ? o.timeOfAdding.substring(0, 5) : "",
                            readTime: o.readingTime ? o.readingTime.substring(0, 5) : "",
                            needle: o.needleReading || ""
                        }));
                        const totalMap = mapped.length < 4 
                            ? [...mapped, ...Array(4 - mapped.length).fill({ ...emptyRow })] 
                            : mapped;
                        setRows(totalMap);
                    }
                }
            });
        }
    }, [activeRequestId]);

    // handle table input
    const updateRow = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        
        const weight = parseFloat(header.sampleWeight) || 0;
        
        // Auto-calculate volume if percent changes: Volume = (%/100) * weight
        if (field === "percent" && weight > 0) {
            const percentValue = parseFloat(value) || 0;
            updated[index].volume = ((percentValue / 100) * weight).toFixed(1);
        }
        
        // Auto-calculate percent if volume changes: % = (Volume/weight) * 100
        if (field === "volume" && weight > 0) {
            const volumeValue = parseFloat(value) || 0;
            updated[index].percent = ((volumeValue / weight) * 100).toFixed(1);
        }

        setRows(updated);
    };

    // auto calculations
    useEffect(() => {
        // Find row where needle reading is between 5 to 7mm
        const consistentRow = rows.find(r => {
            const v = parseFloat(r.needle);
            return !isNaN(v) && v >= 5 && v <= 7;
        });

        if (consistentRow) {
            setNormalConsistency(consistentRow.percent);
            setQtyOfWater(consistentRow.volume);
            setWater85((Number(consistentRow.volume) * 0.85).toFixed(1));
            // Trigger callback for shared data
            if (onValueChange) onValueChange(consistentRow.percent);
        } else {
            // Keep empty if none reach 5-7
            setNormalConsistency("");
            setQtyOfWater("");
            setWater85("");
        }
    }, [rows, onValueChange]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: header.typeOfTesting,
                consignmentNo: header.consignmentNo,
                roomTemp: parseFloat(header.roomTemp),
                sampleWeight: parseFloat(header.sampleWeight),
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                requestId: activeRequestId || null,
                createdBy: user?.userId || 0,
                observations: rows
                    .filter(r => r.percent && r.volume)
                    .map(r => ({
                        percentWaterAdded: parseFloat(r.percent),
                        volume: parseFloat(r.volume),
                        timeOfAdding: r.addTime ? `${r.addTime}:00` : null,
                        readingTime: r.readTime ? `${r.readTime}:00` : null,
                        needleReading: parseFloat(r.needle)
                    }))
            };

            await saveCementNormalConsistency(payload, editId);
            toast.success(`Cement Normal Consistency record ${editId ? 'updated' : 'saved'} successfully!`);
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
                <h2>Normal Consistency Test – Cement</h2>
            </div>

            <div className="form-body">
                {/* HEADER FIELDS */}
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f8fafc' }} />
                    </div>

                    <div className="input-group">
                        <label>Type of Testing <span className="required">*</span></label>
                        <select
                            value={header.typeOfTesting}
                            onChange={e => setHeader({ ...header, typeOfTesting: e.target.value })}
                            required
                        >
                            <option value="">-- Select --</option>
                            <option value="New Inventory">New Inventory</option>
                            <option value="Periodic">Periodic</option>
                        </select>
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
                                onChange={e => setHeader({ ...header, consignmentNo: e.target.value })}
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
                            onChange={e => setHeader({ ...header, roomTemp: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Weight of Sample (gms)</label>
                        <input
                            type="number"
                            placeholder="gms"
                            value={header.sampleWeight}
                            onChange={e => setHeader({ ...header, sampleWeight: e.target.value })}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="section-title">Observations</div>
                <div className="section-subtitle">Record needle readings for varying water percentages</div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>% Water Added</th>
                                <th>Volume (ml)</th>
                                <th>Time of Adding</th>
                                <th>Reading Time</th>
                                <th>Needle Reading (mm)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className={(parseFloat(row.needle) >= 5 && parseFloat(row.needle) <= 7) ? "success-row" : ""}>
                                    <td data-label="#" style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                                    <td data-label="% Water Added">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={row.percent}
                                            onChange={(e) => updateRow(i, "percent", e.target.value)}
                                        />
                                    </td>
                                    <td data-label="Volume (ml)">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={row.volume}
                                            onChange={(e) => updateRow(i, "volume", e.target.value)}
                                        />
                                    </td>
                                    <td data-label="Time of Adding">
                                        <input
                                            type="time"
                                            value={row.addTime}
                                            onChange={(e) => updateRow(i, "addTime", e.target.value)}
                                        />
                                    </td>
                                    <td data-label="Reading Time">
                                        <input
                                            type="time"
                                            value={row.readTime}
                                            onChange={(e) => updateRow(i, "readTime", e.target.value)}
                                        />
                                    </td>
                                    <td data-label="Needle Reading (mm)">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={row.needle}
                                            onChange={(e) => updateRow(i, "needle", e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* RESULTS */}
                <div className="info-section">
                    <div className="info-title">Test Results</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Normal Consistency</div>
                            <div className="info-card-value">{normalConsistency || "-"} %</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Qty of Water</div>
                            <div className="info-card-value">{qtyOfWater || "-"} ml</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">85% of Water</div>
                            <div className="info-card-value">{water85 || "-"} ml</div>
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

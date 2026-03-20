import React, { useState, useEffect } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { saveCementNormalConsistency, getCementNormalConsistencyByRequestId, updateCementNormalConsistency } from "../../../../services/workflowService";


const emptyRow = {
    percent: "",
    volume: "",
    addTime: "",
    readTime: "",
    needle: "",
};

export default function NormalConsistencyForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", selectedRow = null }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const user = getStoredUser();

    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState({
        typeOfTesting: initialType,
        consignmentNo: selectedRow ? selectedRow.consignmentNo : "",
        roomTemp: "",
        sampleWeight: 400
    });

    const [rows, setRows] = useState([
        { ...emptyRow },
        { ...emptyRow },
        { ...emptyRow },
        { ...emptyRow },
    ]);
    const [editId, setEditId] = useState(null);

    // Fetch previously saved data
    useEffect(() => {
        if (selectedRow && selectedRow.requestId) {
            const fetchData = async () => {
                const data = await getCementNormalConsistencyByRequestId(selectedRow.requestId);
                if (data) {
                    setEditId(data.id);
                    setHeader(prev => ({
                        ...prev,
                        typeOfTesting: data.typeOfTesting || initialType,
                        consignmentNo: data.consignmentNo || selectedRow.consignmentNo,
                        roomTemp: data.roomTemp || "",
                        sampleWeight: data.sampleWeight || 400
                    }));
                    if (data.observations && data.observations.length > 0) {
                        const newRows = data.observations.map(o => ({
                            percent: o.percentWaterAdded || "",
                            volume: o.volume || "",
                            addTime: o.timeOfAdding ? o.timeOfAdding.substring(0, 5) : "",
                            readTime: o.readingTime ? o.readingTime.substring(0, 5) : "",
                            needle: o.needleReading || ""
                        }));
                        while (newRows.length < 4) newRows.push({ ...emptyRow });
                        setRows(newRows);
                    }
                }
            };
            fetchData();
        }
    }, [selectedRow, initialType]);

    const [normalConsistency, setNormalConsistency] = useState("");
    const [water85, setWater85] = useState("");

    // handle table input
    const updateRow = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    // auto calculations
    useEffect(() => {
        // Find last row with percent and volume
        const validRows = rows.filter(r => r.percent && r.volume);
        if (validRows.length > 0) {
            const last = validRows[validRows.length - 1];
            setNormalConsistency(last.percent);
            setWater85((Number(last.volume) * 0.85).toFixed(1));
        }
    }, [rows]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: header.typeOfTesting,
                requestId: selectedRow ? selectedRow.requestId : null,
                consignmentNo: header.consignmentNo,
                roomTemp: parseFloat(header.roomTemp),
                sampleWeight: parseFloat(header.sampleWeight),
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
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

            if (editId) {
                await updateCementNormalConsistency(editId, payload);
                toast.success("Cement Normal Consistency record updated successfully!");
            } else {
                await saveCementNormalConsistency(payload);
                toast.success("Cement Normal Consistency record saved successfully!");
            }
            if (onSave) onSave(2);
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
                        {selectedRow ? (
                            <input 
                                type="text" 
                                value={`${selectedRow.consignmentNo} ${selectedRow.vendor ? `(${selectedRow.vendor})` : ''}`} 
                                readOnly 
                                className="readonly-input"
                                style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} 
                            />
                        ) : header.typeOfTesting === 'Periodic' ? (
                            <input 
                                type="text" 
                                value={header.consignmentNo}
                                onChange={e => setHeader({ ...header, consignmentNo: e.target.value })}
                                placeholder="Enter Consignment No"
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
                                <tr key={i}>
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
                            <div className="info-card-value">{rows.find(r => r.percent === normalConsistency)?.volume || "-"} ml</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">85% of Water</div>
                            <div className="info-card-value">{water85 || "-"} ml</div>
                        </div>
                    </div>
                </div>

                <div className="btn-group" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? "Saving..." : (editId ? "Update Test Report" : "Submit Test Report")}
                    </button>
                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}

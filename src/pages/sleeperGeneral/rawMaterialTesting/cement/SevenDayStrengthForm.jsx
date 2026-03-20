import React, { useState, useEffect } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { saveCement7DayStrength, getCement7DayStrengthByRequestId, updateCement7DayStrength } from "../../../../services/workflowService";

export default function SevenDayStrengthForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", selectedRow = null }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const user = getStoredUser();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        typeOfTesting: initialType,
        consignmentNo: selectedRow ? selectedRow.consignmentNo : "",
        roomTemp: "",
        normalConsistency: "",
        waterRequired: 0,
        cubes: [
            { castDate: new Date().toLocaleDateString('en-GB').split('/').join('-'), castTime: "08:00", testDate: new Date().toLocaleDateString('en-GB').split('/').join('-'), testTime: "08:00", load: "", strength: "" },
            { castDate: new Date().toLocaleDateString('en-GB').split('/').join('-'), castTime: "08:00", testDate: new Date().toLocaleDateString('en-GB').split('/').join('-'), testTime: "08:00", load: "", strength: "" },
            { castDate: new Date().toLocaleDateString('en-GB').split('/').join('-'), castTime: "08:00", testDate: new Date().toLocaleDateString('en-GB').split('/').join('-'), testTime: "08:00", load: "", strength: "" }
        ],
        minStrength: "",
        cubeResult: "",
        soundness: "",
        soundnessResult: ""
    });
    const [editId, setEditId] = useState(null);

    // Fetch previously saved data
    useEffect(() => {
        if (selectedRow && selectedRow.requestId) {
            const fetchData = async () => {
                const data = await getCement7DayStrengthByRequestId(selectedRow.requestId);
                if (data) {
                    setEditId(data.id);
                    setForm(prev => ({
                        ...prev,
                        typeOfTesting: data.typeOfTesting || initialType,
                        consignmentNo: data.consignmentNo || selectedRow.consignmentNo,
                        roomTemp: data.roomTemp || "",
                        normalConsistency: data.normalConsistency || "",
                        waterRequired: data.waterRequired || 0,
                        cubes: data.cubes && data.cubes.length > 0 ? data.cubes.map(c => ({
                            castDate: c.castDate ? c.castDate.split('-').reverse().join('-') : "",
                            castTime: c.castTime ? c.castTime.substring(0, 5) : "08:00",
                            testDate: c.testDate ? c.testDate.split('-').reverse().join('-') : "",
                            testTime: c.testTime ? c.testTime.substring(0, 5) : "08:00",
                            load: c.loadKn || "",
                            strength: c.strengthNmm2 || ""
                        })) : prev.cubes,
                        minStrength: data.minStrength || "",
                        cubeResult: data.cubeResult || "",
                        soundness: data.soundness || "",
                        soundnessResult: data.soundnessResult || ""
                    }));
                }
            };
            fetchData();
        }
    }, [selectedRow, initialType]);

    // Auto calculate water required
    useEffect(() => {
        if (form.normalConsistency) {
            const water = ((parseFloat(form.normalConsistency) + 3) / 4) * 800 / 100;
            setForm(prev => ({ ...prev, waterRequired: water.toFixed(2) }));
        }
    }, [form.normalConsistency]);

    // Auto calculate minimum strength & result
    useEffect(() => {
        const strengths = form.cubes
            .map(c => parseFloat(c.strength))
            .filter(v => !isNaN(v));

        if (strengths.length >= 3) {
            const min = Math.min(...strengths);
            setForm(prev => ({
                ...prev,
                minStrength: min,
                cubeResult: min >= 37.5 ? "Satisfactory" : "Not Satisfactory"
            }));
        }
    }, [form.cubes]);

    const updateCube = (index, field, value) => {
        const updated = [...form.cubes];
        updated[index][field] = value;
        setForm({ ...form, cubes: updated });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Helper to convert date from DD-MM-YYYY to YYYY-MM-DD
            const formatToISO = (dateStr) => {
                if (!dateStr) return null;
                const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
                if (parts.length !== 3) return dateStr;
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            };

            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: form.typeOfTesting,
                requestId: selectedRow ? selectedRow.requestId : null,
                consignmentNo: form.consignmentNo,
                roomTemp: parseFloat(form.roomTemp),
                normalConsistency: parseFloat(form.normalConsistency),
                waterRequired: parseFloat(form.waterRequired),
                minStrength: parseFloat(form.minStrength),
                cubeResult: form.cubeResult,
                soundness: parseFloat(form.soundness),
                soundnessResult: form.soundnessResult,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A', // Using dutyLocation as shown in the screenshot pill
                dateOfInspection: dutyDate,
                createdBy: user?.userId || 0,
                cubes: form.cubes.map(c => ({
                    castDate: formatToISO(c.castDate),
                    castTime: c.castTime ? `${c.castTime}:00` : null,
                    testDate: formatToISO(c.testDate),
                    testTime: c.testTime ? `${c.testTime}:00` : null,
                    loadKn: parseFloat(c.load),
                    strengthNmm2: parseFloat(c.strength)
                }))
            };

            if (editId) {
                await updateCement7DayStrength(editId, payload);
                toast.success("Cement 7-Day Strength record updated successfully!");
            } else {
                await saveCement7DayStrength(payload);
                toast.success("Cement 7-Day Strength record saved successfully!");
            }
            if (onSave) onSave(1);
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
                <h2>7 Day Compressive Strength of Cement Mortar Cubes</h2>
            </div>

            <div className="form-body">
                {/* Header Fields */}
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f8fafc' }} />
                    </div>
                    <div className="input-group">
                        <label>Type of Testing <span className="required">*</span></label>
                        <select
                            value={form.typeOfTesting}
                            onChange={e => setForm({ ...form, typeOfTesting: e.target.value })}
                            required
                        >
                            <option value="">-- Select --</option>
                            <option value="New Inventory">New Inventory</option>
                            <option value="Periodic">Periodic</option>
                        </select>
                        <div className="hint-text">Select testing category</div>
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
                        ) : form.typeOfTesting === 'Periodic' ? (
                            <input 
                                type="text" 
                                value={form.consignmentNo}
                                onChange={e => setForm({ ...form, consignmentNo: e.target.value })}
                                placeholder="Enter Consignment No"
                                required 
                            />
                        ) : (
                            <select
                                value={form.consignmentNo}
                                onChange={e => setForm({ ...form, consignmentNo: e.target.value })}
                                required
                            >
                                <option value="">-- Select --</option>
                                {inventoryData.map(c => (
                                    <option key={c.consignmentNo} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                ))}
                                
                            </select>
                        )}
                        <div className="hint-text">Select verified consignment or enter for Periodic</div>
                    </div>

                    <div className="input-group">
                        <label>Room Temp (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="°C"
                            value={form.roomTemp}
                            onChange={e => setForm({ ...form, roomTemp: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Normal Consistency (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="%"
                            value={form.normalConsistency}
                            onChange={e => setForm({ ...form, normalConsistency: e.target.value })}
                        />
                    </div>
                </div>

                <div className="info-section">
                    <div className="info-title">Calculated parameters</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Cement Weight</div>
                            <div className="info-card-value">800 gm</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Sand Weight</div>
                            <div className="info-card-value">2400 gm</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Water Required</div>
                            <div className="info-card-value">{form.waterRequired || '0.00'} gm</div>
                        </div>
                    </div>
                </div>

                {/* Cube Table */}
                <div className="section-title">Cube Test Details</div>
                <div className="section-subtitle">Enter measurements for each cube</div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Cast Date</th>
                                <th>Cast Time</th>
                                <th>Test Date</th>
                                <th>Test Time</th>
                                <th>Load (kN)</th>
                                <th>Strength (N/mm²)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.cubes.map((cube, i) => (
                                <tr key={i}>
                                    <td data-label="Cast Date"><input type="text" placeholder="DD-MM-YYYY" value={cube.castDate} onChange={e => updateCube(i, "castDate", e.target.value)} /></td>
                                    <td data-label="Cast Time"><input type="time" value={cube.castTime} onChange={e => updateCube(i, "castTime", e.target.value)} /></td>
                                    <td data-label="Test Date"><input type="text" placeholder="DD-MM-YYYY" value={cube.testDate} onChange={e => updateCube(i, "testDate", e.target.value)} /></td>
                                    <td data-label="Test Time"><input type="time" value={cube.testTime} onChange={e => updateCube(i, "testTime", e.target.value)} /></td>
                                    <td data-label="Load (kN)"><input type="number" step="0.1" value={cube.load} onChange={e => updateCube(i, "load", e.target.value)} /></td>
                                    <td data-label="Strength (N/mm²)"><input type="number" step="0.01" value={cube.strength} onChange={e => updateCube(i, "strength", e.target.value)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Results Section */}
                <div className="info-section">
                    <div className="info-title">Test Summary</div>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-card-label">Minimum Strength</div>
                            <div className="info-card-value">{form.minStrength || '-'}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Test Result</div>
                            <div className="info-card-value" style={{ color: form.cubeResult === "Satisfactory" ? "#10b981" : "#ef4444" }}>
                                {form.cubeResult || '-'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-divider"></div>

                {/* Soundness */}
                <div className="section-title">Soundness of Cement</div>
                <div className="section-subtitle">Measure the expansion of cement</div>

                <div className="form-grid">
                    <div className="input-group">
                        <label>Expansion (mm) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Enter expansion"
                            value={form.soundness}
                            required
                            onChange={e =>
                                setForm({
                                    ...form,
                                    soundness: e.target.value,
                                    soundnessResult: e.target.value && e.target.value <= 5 ? "Satisfactory" : "Not Satisfactory"
                                })
                            }
                        />
                    </div>
                    <div className="input-group">
                        <label>Soundness Result</label>
                        <input value={form.soundnessResult} disabled style={{ background: '#f1f5f9' }} />
                    </div>
                </div>

                <div className="btn-group" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? "Saving..." : (editId ? "Update Inspection Report" : "Save Inspection Report")}
                    </button>
                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}

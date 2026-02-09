import React, { useState, useEffect } from "react";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";


export default function SevenDayStrengthForm() {
    const [form, setForm] = useState({
        typeOfTesting: "",
        consignmentNo: "",
        roomTemp: "",
        normalConsistency: "",
        waterRequired: 0,
        cubes: [
            { castDate: "", castTime: "", testDate: "", testTime: "", load: "", strength: "" },
            { castDate: "", castTime: "", testDate: "", testTime: "", load: "", strength: "" },
            { castDate: "", castTime: "", testDate: "", testTime: "", load: "", strength: "" }
        ],
        minStrength: "",
        cubeResult: "",
        soundness: "",
        soundnessResult: ""
    });

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

    return (
        <div className="form-card">
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
                        >
                            <option value="">-- Select --</option>
                            <option>New Inventory</option>
                            <option>Periodic</option>
                        </select>
                        <div className="hint-text">Select testing category</div>
                    </div>

                    <div className="input-group">
                        <label>Consignment No <span className="required">*</span></label>
                        <select
                            value={form.consignmentNo}
                            onChange={e => setForm({ ...form, consignmentNo: e.target.value })}
                        >
                            <option value="">-- Select --</option>
                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <div className="hint-text">Select verified consignment</div>
                    </div>

                    <div className="input-group">
                        <label>Room Temp (°C)</label>
                        <input
                            type="number"
                            placeholder="°C"
                            value={form.roomTemp}
                            onChange={e => setForm({ ...form, roomTemp: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Normal Consistency (%)</label>
                        <input
                            type="number"
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
                            <div className="info-card-value">{form.waterRequired || '0.00'} %</div>
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
                                    <td data-label="Cast Date"><input type="text" placeholder="DD/MM/YYYY" value={cube.castDate} onChange={e => updateCube(i, "castDate", e.target.value)} /></td>
                                    <td data-label="Cast Time"><input type="time" value={cube.castTime} onChange={e => updateCube(i, "castTime", e.target.value)} /></td>
                                    <td data-label="Test Date"><input type="text" placeholder="DD/MM/YYYY" value={cube.testDate} onChange={e => updateCube(i, "testDate", e.target.value)} /></td>
                                    <td data-label="Test Time"><input type="time" value={cube.testTime} onChange={e => updateCube(i, "testTime", e.target.value)} /></td>
                                    <td data-label="Load (kN)"><input type="number" value={cube.load} onChange={e => updateCube(i, "load", e.target.value)} /></td>
                                    <td data-label="Strength (N/mm²)"><input type="number" value={cube.strength} onChange={e => updateCube(i, "strength", e.target.value)} /></td>
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
                            placeholder="Enter expansion"
                            value={form.soundness}
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
                        <input value={form.soundnessResult} disabled />
                    </div>
                </div>

                <button className="btn-save">Save Inspection Report</button>
            </div>
        </div>
    );
}

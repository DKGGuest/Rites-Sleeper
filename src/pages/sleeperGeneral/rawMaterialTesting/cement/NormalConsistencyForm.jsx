import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";


const emptyRow = {
    percent: "",
    volume: "",
    addTime: "",
    readTime: "",
    needle: "",
};

export default function NormalConsistencyForm() {
    const { register, watch } = useForm();

    const [rows, setRows] = useState([
        { ...emptyRow },
        { ...emptyRow },
        { ...emptyRow },
        { ...emptyRow },
    ]);

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
        // assume last row is final accepted reading
        const last = rows[rows.length - 1];

        if (last.percent && last.volume) {
            setNormalConsistency(last.percent);
            setWater85((Number(last.volume) * 0.85).toFixed(1));
        }
    }, [rows]);

    return (
        <div className="form-card">
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
                        <select {...register("type")}>
                            <option value="">-- Select --</option>
                            <option>New Inventory</option>
                            <option>Periodic</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Consignment No <span className="required">*</span></label>
                        <select {...register("consignment")}>
                            <option value="">-- Select --</option>
                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Room Temperature (°C)</label>
                        <input type="number" placeholder="°C" {...register("temp")} />
                    </div>

                    <div className="input-group">
                        <label>Weight of Sample (gms)</label>
                        <input type="number" placeholder="gms" {...register("weight")} />
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
                            <div className="info-card-value">{rows[3]?.volume || "-"} ml</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">85% of Water</div>
                            <div className="info-card-value">{water85 || "-"} ml</div>
                        </div>
                    </div>
                </div>

                <button className="btn-save">Submit Test Report</button>
            </div>
        </div>
    );
}

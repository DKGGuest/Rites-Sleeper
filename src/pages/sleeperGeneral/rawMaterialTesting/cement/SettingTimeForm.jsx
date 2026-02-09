import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";


const emptyRow = { time: "", needle: "", spot: "" };

export default function SettingTimeForm() {
    const { register, watch } = useForm();

    const startTime = watch("waterAddTime");

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

    // calculate difference in minutes
    const diffMinutes = (t1, t2) => {
        if (!t1 || !t2) return null;
        const [h1, m1] = t1.split(":").map(Number);
        const [h2, m2] = t2.split(":").map(Number);
        return h2 * 60 + m2 - (h1 * 60 + m1);
    };

    useEffect(() => {
        if (!startTime) return;

        let init = null;
        let fin = null;

        rows.forEach((r) => {
            const mins = diffMinutes(startTime, r.time);

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
        }
    }, [rows, startTime]);

    return (
        <div className="form-card">
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
                        <select {...register("type")}>
                            <option value="">-- Select --</option>
                            <option>New Inventory</option>
                            <option>Periodic</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Consignment No <span className="required">*</span></label>
                        <select {...register("consignment", { required: true })}>
                            <option value="">-- Select --</option>
                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Room Temp (°C)</label>
                        <input type="number" placeholder="°C" {...register("temp")} />
                    </div>

                    <div className="input-group">
                        <label>Weight (gms)</label>
                        <input type="number" placeholder="gms" {...register("weight")} />
                    </div>

                    <div className="input-group">
                        <label>Normal Consistency (%)</label>
                        <input type="number" placeholder="%" {...register("nc")} />
                    </div>

                    <div className="input-group">
                        <label>Water Added (ml)</label>
                        <input type="number" placeholder="ml" {...register("waterQty")} />
                    </div>

                    <div className="input-group">
                        <label>Time of Adding Water</label>
                        <input type="time" {...register("waterAddTime")} />
                    </div>

                    <div className="input-group">
                        <label>Mould Ready at</label>
                        <input type="time" {...register("mouldTime")} />
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

                <button className="btn-save">Submit Test Report</button>
            </div>
        </div>
    );
}

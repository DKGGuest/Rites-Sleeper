import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";


export default function SpecificSurfaceForm() {
    const {
        register,
        watch,
        formState: { errors },
    } = useForm();

    const t1 = watch("sampleTime1");
    const t2 = watch("sampleTime2");
    const t3 = watch("sampleTime3");
    const Ts = watch("standardTime");
    const Fs = watch("standardSurface");

    const [avgTime, setAvgTime] = useState(0);
    const [Fm, setFm] = useState(0);
    const [result, setResult] = useState("");

    useEffect(() => {
        if (t1 && t2 && t3) {
            const avg = (Number(t1) + Number(t2) + Number(t3)) / 3;
            setAvgTime(avg.toFixed(2));
        }
    }, [t1, t2, t3]);

    useEffect(() => {
        if (avgTime && Ts && Fs) {
            const fm = Number(Fs) * Math.sqrt(avgTime / Number(Ts));
            setFm(fm.toFixed(2));
            setResult(fm > 3700 ? "OK" : "NOT OK");
        }
    }, [avgTime, Ts, Fs]);

    return (
        <div className="form-card">
            <div className="form-header">
                <h2>Specific Surface Test – Cement</h2>
            </div>

            <div className="form-body">
                {/* HEADERS & MAIN INPUTS */}
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input
                            type="date"
                            {...register("date", { required: true })}
                        />
                        {errors.date && <small className="text-danger">Required</small>}
                    </div>

                    <div className="input-group">
                        <label>Type of Testing <span className="required">*</span></label>
                        <select {...register("type", { required: true })}>
                            <option value="">-- Select --</option>
                            <option value="New Inventory">New Inventory</option>
                            <option value="Periodic">Periodic</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Consignment No. <span className="required">*</span></label>
                        <select {...register("consignment", { required: true })}>
                            <option value="">-- Select --</option>
                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Room Temperature (°C)</label>
                        <input
                            type="number"
                            placeholder="°C"
                            {...register("roomTemp", { required: true })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Weight of Sample (gms)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            {...register("weight", { required: true })}
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
                            {...register("standardTime", { required: true })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Specific Surface Fs</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Standard surface"
                            {...register("standardSurface", { required: true })}
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
                            {...register("sampleTime1", { required: true })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Sample Time 2 (sec)</label>
                        <input
                            placeholder="Reading 2"
                            type="number"
                            {...register("sampleTime2", { required: true })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Sample Time 3 (sec)</label>
                        <input
                            placeholder="Reading 3"
                            type="number"
                            {...register("sampleTime3", { required: true })}
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

                <button className="btn-save">Submit Test Report</button>
            </div>
        </div>
    );
}

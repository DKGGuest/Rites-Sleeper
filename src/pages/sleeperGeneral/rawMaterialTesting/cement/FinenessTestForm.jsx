import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";

export default function FinenessTestForm({ onSave, onCancel }) {
    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            sampleWt: 100
        }
    });

    const sampleWt = watch("sampleWt");
    const residueWt = watch("residueWt");
    const [fineness, setFineness] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        if (sampleWt && residueWt) {
            const s = parseFloat(sampleWt);
            const r = parseFloat(residueWt);
            if (s > 0) {
                const f = (r / s) * 100;
                setFineness(f.toFixed(2));
                // OPC usually < 10%
                setResult(f <= 10 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [sampleWt, residueWt]);

    const onSubmit = (data) => {
        const payload = {
            ...data,
            fineness,
            result,
            testDate: new Date().toLocaleDateString('en-GB')
        };
        onSave && onSave(payload);
    };

    return (
        <div className="form-card">
            <div className="form-header">
                <h2>Fineness Test – Cement (Sieve Method)</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="form-body">
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f1f5f9' }} />
                    </div>

                    <div className="input-group">
                        <label>Consignment No <span className="required">*</span></label>
                        <select {...register("consignment", { required: "Required" })}>
                            <option value="">-- Select --</option>
                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {errors.consignment && <span className="hint-text" style={{ color: 'red' }}>Required</span>}
                    </div>

                    <div className="input-group">
                        <label>Sample Weight (W1) (gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            {...register("sampleWt", { required: "Required" })}
                        />
                        {errors.sampleWt && <span className="hint-text" style={{ color: 'red' }}>Required</span>}
                    </div>

                    <div className="input-group">
                        <label>Weight of Residue (W2) (gms) <span className="required">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="gms"
                            {...register("residueWt", { required: "Required" })}
                        />
                        {errors.residueWt && <span className="hint-text" style={{ color: 'red' }}>Required</span>}
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

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn-save" style={{ flex: 1 }}>Submit Test Report</button>
                    {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ flex: 1, background: '#64748b' }}>Cancel</button>}
                </div>
            </form>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";


export default function CrushingImpactAbrasion20mm({ onSave, onCancel, consignment, lot }) {
    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        }
    });

    // Sections toggle state
    const [expanded, setExpanded] = useState({
        crushing: true,
        impact: false,
        abrasion: false
    });

    const toggle = (section) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

    // Crushing watch
    const mouldWtC = watch("crushing.mouldWt");
    const mouldSampleWtC = watch("crushing.mouldSampleWt");
    const passingWtC = watch("crushing.passingWt");

    // Impact watch
    const mouldWtI = watch("impact.mouldWt");
    const mouldSampleWtI = watch("impact.mouldSampleWt");
    const passingWtI = watch("impact.passingWt");

    // Abrasion watch
    const sampleWtA = watch("abrasion.sampleWt");
    const passingWtA = watch("abrasion.passingWt");

    // Calculations
    useEffect(() => {
        if (mouldWtC && mouldSampleWtC) {
            const sampleWt = Number(mouldSampleWtC) - Number(mouldWtC);
            setValue("crushing.sampleWt", sampleWt.toFixed(2));
            if (passingWtC && sampleWt > 0) {
                const val = (Number(passingWtC) / sampleWt) * 100;
                setValue("crushing.value", val.toFixed(2));
                setValue("crushing.result", val < 30 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [mouldWtC, mouldSampleWtC, passingWtC, setValue]);

    useEffect(() => {
        if (mouldWtI && mouldSampleWtI) {
            const sampleWt = Number(mouldSampleWtI) - Number(mouldWtI);
            setValue("impact.sampleWt", sampleWt.toFixed(2));
            if (passingWtI && sampleWt > 0) {
                const val = (Number(passingWtI) / sampleWt) * 100;
                setValue("impact.value", val.toFixed(2));
                setValue("impact.result", val < 30 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [mouldWtI, mouldSampleWtI, passingWtI, setValue]);

    useEffect(() => {
        if (sampleWtA && passingWtA) {
            const sampleWt = Number(sampleWtA);
            if (sampleWt > 0) {
                const val = (Number(passingWtA) / sampleWt) * 100;
                setValue("abrasion.value", val.toFixed(2));
                setValue("abrasion.result", val < 30 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [sampleWtA, passingWtA, setValue]);

    const onSubmit = (data) => {
        console.log("Saving 20mm data:", { ...data, consignment, lot });
        onSave && onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="cement-forms-scope">
            <div className="form-card">
                <div className="form-header">
                    <h2>Aggregate – Raw Material Testing: 20mm Crushing, Impact and Abrasion</h2>
                </div>

                <div className="form-body">
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Date of Testing <span className="required">*</span></label>
                            <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f1f5f9' }} />
                        </div>

                        {!consignment && (
                            <div className="input-group">
                                <label>Consignment No. <span className="required">*</span></label>
                                <select {...register("consignmentNo", { required: "Required" })}>
                                    <option value="">-- Select --</option>
                                    {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {errors.consignmentNo && <span className="hint-text" style={{ color: 'red' }}>{errors.consignmentNo.message}</span>}
                            </div>
                        )}
                    </div>

                    {/* Section 1: Crushing (20mm) */}
                    <div className="section-divider"></div>
                    <div className="section-title" onClick={() => toggle('crushing')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {expanded.crushing ? '▼' : '▶'} Section 1: Crushing Test (20mm)
                    </div>
                    {expanded.crushing && (
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Weight of Mould (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("crushing.mouldWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Mould + Sample (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("crushing.mouldSampleWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Sample (gms)</label>
                                <input type="number" readOnly className="readOnly" {...register("crushing.sampleWt")} />
                            </div>
                            <div className="input-group">
                                <label>Passing through 3.35mm sieve (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("crushing.passingWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Aggregate Crushing Value (%)</label>
                                <input type="number" readOnly className="readOnly" {...register("crushing.value")} />
                            </div>
                            <div className="input-group">
                                <label>Result of Crushing Test</label>
                                <input type="text" readOnly className="readOnly" {...register("crushing.result")} />
                            </div>
                        </div>
                    )}

                    {/* Section 2: Impact (20mm) */}
                    <div className="section-divider"></div>
                    <div className="section-title" onClick={() => toggle('impact')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {expanded.impact ? '▼' : '▶'} Section 2: Impact Test (20mm)
                    </div>
                    {expanded.impact && (
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Weight of Mould (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("impact.mouldWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Mould + Sample (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("impact.mouldSampleWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Sample (gms)</label>
                                <input type="number" readOnly className="readOnly" {...register("impact.sampleWt")} />
                            </div>
                            <div className="input-group">
                                <label>Passing through 2.36mm sieve (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("impact.passingWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Aggregate Impact Value (%)</label>
                                <input type="number" readOnly className="readOnly" {...register("impact.value")} />
                            </div>
                            <div className="input-group">
                                <label>Result of Impact Test</label>
                                <input type="text" readOnly className="readOnly" {...register("impact.result")} />
                            </div>
                        </div>
                    )}

                    {/* Section 3: Abrasion (20mm) */}
                    <div className="section-divider"></div>
                    <div className="section-title" onClick={() => toggle('abrasion')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {expanded.abrasion ? '▼' : '▶'} Section 3: Abrasion Test (20mm)
                    </div>
                    {expanded.abrasion && (
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Weight of Sample (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("abrasion.sampleWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Passing through 1.7mm sieve (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("abrasion.passingWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Aggregate Abrasion Value (%)</label>
                                <input type="number" readOnly className="readOnly" {...register("abrasion.value")} />
                            </div>
                            <div className="input-group">
                                <label>Result of Abrasion Test</label>
                                <input type="text" readOnly className="readOnly" {...register("abrasion.result")} />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-save">Submit Test Report</button>
                        {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ background: '#64748b' }}>Cancel</button>}
                    </div>
                </div>
            </div>
        </form>
    );
}

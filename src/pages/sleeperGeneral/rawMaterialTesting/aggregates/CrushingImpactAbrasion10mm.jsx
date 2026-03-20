import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { saveAggregate10mmQuality } from "../../../../services/workflowService";

export default function CrushingImpactAbrasion10mm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory" }) {
    const { userId } = useSelector(state => state.auth);
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            testDate: new Date().toISOString().split('T')[0],
            typeOfTesting: initialType
        }
    });

    // Sections toggle state
    const [expanded, setExpanded] = useState({
        crushing: true,
        impact: false,
        abrasion: false
    });

    const toggle = (section) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

    // Watch fields for calculations
    const cMouldWt = watch("crushingMouldWt");
    const cMouldSampleWt = watch("crushingMouldSampleWt");
    const cPassingWt = watch("crushingPassingWt");

    const iMouldWt = watch("impactMouldWt");
    const iMouldSampleWt = watch("impactMouldSampleWt");
    const iPassingWt = watch("impactPassingWt");

    const aSampleWt = watch("abrasionSampleWt");
    const aPassingWt = watch("abrasionPassingWt");

    // Crushing Calculations
    useEffect(() => {
        if (cMouldWt && cMouldSampleWt) {
            const sampleWt = Number(cMouldSampleWt) - Number(cMouldWt);
            setValue("crushingSampleWt", sampleWt.toFixed(2));
            if (cPassingWt && sampleWt > 0) {
                const val = (Number(cPassingWt) / sampleWt) * 100;
                setValue("crushingValue", val.toFixed(2));
                setValue("crushingResult", val < 30 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [cMouldWt, cMouldSampleWt, cPassingWt, setValue]);

    // Impact Calculations
    useEffect(() => {
        if (iMouldWt && iMouldSampleWt) {
            const sampleWt = Number(iMouldSampleWt) - Number(iMouldWt);
            setValue("impactSampleWt", sampleWt.toFixed(2));
            if (iPassingWt && sampleWt > 0) {
                const val = (Number(iPassingWt) / sampleWt) * 100;
                setValue("impactValue", val.toFixed(2));
                setValue("impactResult", val < 30 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [iMouldWt, iMouldSampleWt, iPassingWt, setValue]);

    // Abrasion Calculations
    useEffect(() => {
        if (aSampleWt && aPassingWt) {
            const sampleWt = Number(aSampleWt);
            if (sampleWt > 0) {
                const val = (Number(aPassingWt) / sampleWt) * 100;
                setValue("abrasionValue", val.toFixed(2));
                setValue("abrasionResult", val < 30 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [aSampleWt, aPassingWt, setValue]);

    const onSubmit = async (formData) => {
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                createdBy: userId || 1
            };

            await saveAggregate10mmQuality(payload);
            showToast("Test Report for 10mm Quality saved successfully!", "success");
            reset();
            onSave && onSave(payload);
        } catch (error) {
            console.error("Error saving 10mm quality data:", error);
            showToast("Failed to save 10mm Quality report. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="cement-forms-scope">
            <div className="form-card">
                <div className="form-header">
                    <h2>Aggregate – Raw Material Testing: 10mm Crushing, Impact and Abrasion</h2>
                </div>

                <div className="form-body">
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Date of Testing <span className="required">*</span></label>
                            <input type="date" {...register("testDate", { required: "Required" })} />
                        </div>

                        <div className="input-group">
                            <label>Consignment No. <span className="required">*</span></label>
                            <select {...register("consignmentNo", { required: "Required" })}>
                                <option value="">-- Select --</option>
                                {inventoryData.map((c, i) => (
                                    <option key={i} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                ))}
                                <option value="PERIODIC">-- Periodic Testing --</option>
                            </select>
                            {errors.consignmentNo && <span className="hint-text" style={{ color: 'red' }}>{errors.consignmentNo.message}</span>}
                        </div>

                        <div className="input-group">
                            <label>Type of Testing</label>
                            <select {...register("typeOfTesting")}>
                                <option value="New Inventory">New Inventory</option>
                                <option value="Periodic">Periodic</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 1: Crushing */}
                    <div className="section-divider"></div>
                    <div className="section-title" onClick={() => toggle('crushing')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {expanded.crushing ? '▼' : '▶'} Section 1: Crushing Test
                    </div>
                    {expanded.crushing && (
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Weight of Mould (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("crushingMouldWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Mould + Sample (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("crushingMouldSampleWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Sample (gms)</label>
                                <input type="number" readOnly className="readOnly" {...register("crushingSampleWt")} />
                            </div>
                            <div className="input-group">
                                <label>Passing through 1.7mm sieve (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("crushingPassingWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Aggregate Crushing Value (%)</label>
                                <input type="number" readOnly className="readOnly" {...register("crushingValue")} />
                            </div>
                            <div className="input-group">
                                <label>Result of Crushing Test</label>
                                <input type="text" readOnly className="readOnly" {...register("crushingResult")} />
                            </div>
                        </div>
                    )}

                    {/* Section 2: Impact */}
                    <div className="section-divider"></div>
                    <div className="section-title" onClick={() => toggle('impact')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {expanded.impact ? '▼' : '▶'} Section 2: Impact Test
                    </div>
                    {expanded.impact && (
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Weight of Mould (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("impactMouldWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Mould + Sample (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("impactMouldSampleWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Weight of Sample (gms)</label>
                                <input type="number" readOnly className="readOnly" {...register("impactSampleWt")} />
                            </div>
                            <div className="input-group">
                                <label>Passing through 2.36mm sieve (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("impactPassingWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Aggregate Impact Value (%)</label>
                                <input type="number" readOnly className="readOnly" {...register("impactValue")} />
                            </div>
                            <div className="input-group">
                                <label>Result of Impact Test</label>
                                <input type="text" readOnly className="readOnly" {...register("impactResult")} />
                            </div>
                        </div>
                    )}

                    {/* Section 3: Abrasion */}
                    <div className="section-divider"></div>
                    <div className="section-title" onClick={() => toggle('abrasion')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {expanded.abrasion ? '▼' : '▶'} Section 3: Abrasion Test
                    </div>
                    {expanded.abrasion && (
                        <div className="form-grid" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Weight of Sample (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("abrasionSampleWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Passing through 1.7mm sieve (gms) <span className="required">*</span></label>
                                <input type="number" step="0.01" {...register("abrasionPassingWt", { required: "Required" })} />
                            </div>
                            <div className="input-group">
                                <label>Aggregate Abrasion Value (%)</label>
                                <input type="number" readOnly className="readOnly" {...register("abrasionValue")} />
                            </div>
                            <div className="input-group">
                                <label>Result of Abrasion Test</label>
                                <input type="text" readOnly className="readOnly" {...register("abrasionResult")} />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-save" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Submit Test Report'}
                        </button>
                        {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ background: '#64748b' }} disabled={submitting}>Cancel</button>}
                    </div>
                </div>
            </div>
        </form>
    );
}

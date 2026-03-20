import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { saveAggregateSoundness, getAggregateSoundnessByReqId } from "../../../../services/workflowService";

export default function SoundnessTestForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", activeRequestId }) {
    const { selectedShift, dutyLocation, dutyDate } = useShift();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    const { register, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            testDate: new Date().toISOString().split('T')[0],
            cycles: 5
        }
    });

    useEffect(() => {
        if (activeRequestId) {
            const row = inventoryData.find(i => i.requestId === activeRequestId);
            if (row) {
                setValue("consignmentNo", row.consignmentNo);
            }
            getAggregateSoundnessByReqId(activeRequestId).then(record => {
                if (record && record.id) {
                    setEditId(record.id);
                    reset({
                        ...record,
                        testDate: record.testDate ? record.testDate.substring(0, 10) : new Date().toISOString().split('T')[0]
                    });
                }
            });
        }
    }, [activeRequestId, inventoryData, reset, setValue]);

    const initialWt = watch("initialWt");
    const finalWt = watch("finalWt");

    useEffect(() => {
        if (initialWt && finalWt) {
            const i = parseFloat(initialWt);
            const f = parseFloat(finalWt);
            if (i > 0) {
                const loss = i - f;
                const lossPercent = (loss / i) * 100;
                setValue("lossWt", loss.toFixed(2));
                setValue("lossPercent", lossPercent.toFixed(2));
                setValue("result", lossPercent < 12 ? "Satisfactory" : "Unsatisfactory");
            }
        }
    }, [initialWt, finalWt, setValue]);

    const onSubmit = async (formData) => {
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate || new Date().toISOString().split('T')[0],
                requestId: activeRequestId || null,
                createdBy: parseInt(localStorage.getItem('userId') || '1', 10)
            };

            await saveAggregateSoundness(payload, editId);
            toast.success(`Soundness Test report ${editId ? 'updated' : 'saved'} successfully!`);
            reset();
            onSave && onSave(payload);
        } catch (error) {
            console.error("Error saving soundness data:", error);
            toast.error("Failed to save Soundness report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="cement-forms-scope">
            <div className="form-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                <div className="form-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Aggregate – Raw Material Testing: Soundness Test (IS 2386 Part 5)</h2>
                </div>

                <div className="form-body" style={{ padding: '24px' }}>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Date of Testing <span className="required" style={{ color: 'red' }}>*</span></label>
                            <input type="date" {...register("testDate", { required: "Required" })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Consignment No. <span className="required" style={{ color: 'red' }}>*</span></label>
                            {activeRequestId ? (
                                <input
                                    type="text"
                                    readOnly
                                    className="readOnly"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                                    {...register("consignmentNo")}
                                />
                            ) : initialType === "Periodic" ? (
                                <input
                                    type="text"
                                    placeholder="Enter Consignment No"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    {...register("consignmentNo", { required: "Required" })}
                                />
                            ) : (
                                <select
                                    {...register("consignmentNo", { required: "Required" })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">-- Select --</option>
                                    {inventoryData.map((c, i) => (
                                        <option key={i} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                    ))}
                                    <option value="PERIODIC">-- Periodic Testing --</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Test Method</label>
                            <select {...register("method")} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                <option value="">-- Select --</option>
                                <option value="Sodium Sulphate">Sodium Sulphate</option>
                                <option value="Magnesium Sulphate">Magnesium Sulphate</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>No. of Cycles</label>
                            <input type="number" {...register("cycles")} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                    </div>

                    <div style={{ margin: '24px 0', height: '1px', background: '#e2e8f0' }}></div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Initial Weight of Sample (gms) <span className="required" style={{ color: 'red' }}>*</span></label>
                            <input type="number" step="0.01" {...register("initialWt", { required: "Required" })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Weight after test (gms) <span className="required" style={{ color: 'red' }}>*</span></label>
                            <input type="number" step="0.01" {...register("finalWt", { required: "Required" })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Loss in Weight (gms)</label>
                            <input type="number" readOnly className="readOnly" {...register("lossWt")} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9' }} />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Percentage Loss (%)</label>
                            <input type="number" readOnly className="readOnly" {...register("lossPercent")} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: '700' }} />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Result</label>
                            <input type="text" readOnly className="readOnly" {...register("result")} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f0fdf4', color: '#166534', fontWeight: '700' }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                        <button type="submit" className="btn-save" style={{ flex: 1, padding: '12px', background: '#42818c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} disabled={submitting}>
                            {submitting ? 'Saving...' : editId ? 'Update Test Report' : 'Save Test Report'}
                        </button>
                        {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ flex: 1, padding: '12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} disabled={submitting}>Cancel</button>}
                    </div>
                </div>
            </div>
        </form>
    );
}
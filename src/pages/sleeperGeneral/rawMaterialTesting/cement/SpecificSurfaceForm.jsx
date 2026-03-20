import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { getStoredUser } from "../../../../services/authService";
import { 
    saveCementSpecificSurface, 
    getCementSpecificSurfaceByRequestId, 
    updateCementSpecificSurface 
} from "../../../../services/workflowService";

export default function SpecificSurfaceForm({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", selectedRow = null }) {
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const user = getStoredUser();
    const {
        register,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            type: initialType,
            consignment: selectedRow ? selectedRow.consignmentNo : ""
        }
    });

    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    const t1 = watch("sampleTime1");
    const t2 = watch("sampleTime2");
    const t3 = watch("sampleTime3");
    const Ts = watch("standardTime");
    const Fs = watch("standardSurface");

    const [avgTime, setAvgTime] = useState(0);
    const [Fm, setFm] = useState(0);
    const [result, setResult] = useState("");

    // Fetch previously saved data
    useEffect(() => {
        if (selectedRow && selectedRow.requestId) {
            const fetchData = async () => {
                const data = await getCementSpecificSurfaceByRequestId(selectedRow.requestId);
                if (data) {
                    setEditId(data.id);
                    setValue("type", data.typeOfTesting || initialType);
                    setValue("consignment", data.consignmentNo || selectedRow.consignmentNo);
                    setValue("roomTemp", data.roomTemp || "");
                    setValue("weight", data.weight || "");
                    setValue("standardTime", data.standardTimeTs || "");
                    setValue("standardSurface", data.standardSurfaceFs || "");
                    setValue("sampleTime1", data.sampleTime1 || "");
                    setValue("sampleTime2", data.sampleTime2 || "");
                    setValue("sampleTime3", data.sampleTime3 || "");
                }
            };
            fetchData();
        }
    }, [selectedRow, initialType, setValue]);

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

    const handleFormSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                testDate: new Date().toISOString().split('T')[0],
                typeOfTesting: data.type,
                requestId: selectedRow ? selectedRow.requestId : null,
                consignmentNo: data.consignment,
                roomTemp: parseFloat(data.roomTemp),
                weight: parseFloat(data.weight),
                standardTimeTs: parseFloat(data.standardTime),
                standardSurfaceFs: parseFloat(data.standardSurface),
                sampleTime1: parseFloat(data.sampleTime1),
                sampleTime2: parseFloat(data.sampleTime2),
                sampleTime3: parseFloat(data.sampleTime3),
                avgTime: parseFloat(avgTime),
                specificSurfaceFm: parseFloat(Fm),
                result: result,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate,
                createdBy: user?.userId || 0
            };

            if (editId) {
                await updateCementSpecificSurface(editId, payload);
                toast.success("Specific Surface Test record updated successfully!");
            } else {
                await saveCementSpecificSurface(payload);
                toast.success("Specific Surface Test record saved successfully!");
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
        <div className="form-card">
            <div className="form-header">
                <h2>Specific Surface Test – Cement</h2>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="form-body">
                {/* HEADERS & MAIN INPUTS */}
                <div className="form-grid">
                    <div className="input-group">
                        <label>Date of Testing <span className="required">*</span></label>
                        <input
                            type="text"
                            value={new Date().toLocaleDateString('en-GB')}
                            readOnly
                            style={{ background: '#f8fafc' }}
                        />
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
                        {selectedRow ? (
                            <input 
                                type="text" 
                                value={`${selectedRow.consignmentNo} ${selectedRow.vendor ? `(${selectedRow.vendor})` : ''}`} 
                                readOnly 
                                className="readonly-input"
                                style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} 
                            />
                        ) : watch("type") === 'Periodic' ? (
                            <input 
                                type="text" 
                                {...register("consignment", { required: true })}
                                placeholder="Enter Consignment No"
                            />
                        ) : (
                            <select {...register("consignment", { required: true })}>
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

                <div className="btn-group" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn-save" disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Saving..." : (editId ? "Update Test Report" : "Submit Test Report")}
                    </button>
                    <button type="button" onClick={onCancel} className="btn-save" style={{ flex: 1, background: '#64748b' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

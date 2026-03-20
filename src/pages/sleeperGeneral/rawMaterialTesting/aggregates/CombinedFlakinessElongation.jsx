import React, { useState, useEffect } from "react";
import { useShift } from "../../../../context/ShiftContext";
import { useToast } from "../../../../context/ToastContext";
import { saveAggregateFlakiness, updateAggregateFlakiness, getAggregateFlakinessByRequestId } from "../../../../services/workflowService";

const FlakinessTable = ({ title, category, sieveData, onDataChange, initialRows }) => {
    const [rows, setRows] = useState(sieveData.map(s => ({
        category: category,
        passingSize: s.passing,
        retainedSize: s.retained,
        weightSampleA: 0,
        weightPassedB: 0,
        weightRetainedC: 0,
        weightRetainedLengthD: 0
    })));

    useEffect(() => {
        if (initialRows && initialRows.length > 0) {
            setRows(initialRows);
        }
    }, [initialRows]);

    const handleInputChange = (idx, field, val) => {
        const newRows = [...rows];
        newRows[idx][field] = Number(val);
        if (field === 'weightSampleA' || field === 'weightPassedB') {
            newRows[idx].weightRetainedC = newRows[idx].weightSampleA - newRows[idx].weightPassedB;
        }
        setRows(newRows);
    };

    const sumA = rows.reduce((acc, r) => acc + r.weightSampleA, 0);
    const sumB = rows.reduce((acc, r) => acc + r.weightPassedB, 0);
    const sumC = rows.reduce((acc, r) => acc + r.weightRetainedC, 0);
    const sumD = rows.reduce((acc, r) => acc + r.weightRetainedLengthD, 0);

    const combinedIndex = (sumA > 0 && sumC > 0) ? (((sumB / sumA) + (sumD / sumC)) * 100) : 0;
    const result = combinedIndex < 40 ? "OK" : "Not OK";

    useEffect(() => {
        onDataChange({ rows, combinedIndex, result });
    }, [rows, combinedIndex, result]);

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div className="section-title" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px', color: '#101828', fontWeight: 700, marginBottom: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                {title}
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th colSpan="2">IS SIEVE (mm)</th>
                            <th colSpan="2">FLAKINESS INDEX</th>
                            <th colSpan="2">ELONGATION INDEX</th>
                        </tr>
                        <tr>
                            <th>Passing</th>
                            <th>Retained</th>
                            <th>Wt. Sample (A)</th>
                            <th>Wt. Passed (B)</th>
                            <th>Wt. Retained (C=A-B)</th>
                            <th>Wt. Retained Length (D)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                <td data-label="IS Sieve Passing">{row.passingSize}</td>
                                <td data-label="IS Sieve Retained">{row.retainedSize}</td>
                                <td data-label="Wt. Sample (A)"><input type="number" step="0.01" value={row.weightSampleA || ''} onChange={(e) => handleInputChange(idx, 'weightSampleA', e.target.value)} /></td>
                                <td data-label="Wt. Passed (B)"><input type="number" step="0.01" value={row.weightPassedB || ''} onChange={(e) => handleInputChange(idx, 'weightPassedB', e.target.value)} /></td>
                                <td data-label="Wt. Retained (C=A-B)" className="readOnly">{row.weightRetainedC.toFixed(2)}</td>
                                <td data-label="Wt. Retained Length (D)"><input type="number" step="0.01" value={row.weightRetainedLengthD || ''} onChange={(e) => handleInputChange(idx, 'weightRetainedLengthD', e.target.value)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="info-section" style={{ marginTop: '1rem' }}>
                <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="info-card">
                        <div className="info-card-label">Combined Flakiness & Elongation Index (%)</div>
                        <div className="info-card-value" style={{ color: combinedIndex >= 40 ? '#ef4444' : '#059669' }}>
                            {combinedIndex.toFixed(2)}%
                        </div>
                    </div>
                    <div className="info-card">
                        <div className="info-card-label">Overall Result</div>
                        <div className="info-card-value" style={{ color: result === "OK" ? '#059669' : '#ef4444' }}>
                            {result}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CombinedFlakinessElongation({ onSave, onCancel, inventoryData = [], initialType = "New Inventory", selectedRow }) {
    const { selectedShift, dutyLocation, dutyDate } = useShift();
    const toast = useToast();
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [consignmentNo, setConsignmentNo] = useState("");
    const [data20, setData20] = useState({ rows: [] });
    const [data10, setData10] = useState({ rows: [] });
    const [initialRows20, setInitialRows20] = useState(null);
    const [initialRows10, setInitialRows10] = useState(null);
    const [existingId, setExistingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (selectedRow?.requestId) {
            getAggregateFlakinessByRequestId(selectedRow.requestId).then((data) => {
                if (data) {
                    setExistingId(data.id);
                    if (data.testDate) setTestDate(data.testDate.split('T')[0]);
                    if (data.consignmentNo) setConsignmentNo(data.consignmentNo);
                    if (data.observations) {
                        setInitialRows20(data.observations.filter(o => o.category === '20mm'));
                        setInitialRows10(data.observations.filter(o => o.category === '10mm'));
                    }
                }
            });
        }
    }, [selectedRow]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!consignmentNo) {
            toast.warning("Please select a consignment");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                testDate,
                consignmentNo,
                combinedIndex20mm: data20.combinedIndex,
                result20mm: data20.result,
                combinedIndex10mm: data10.combinedIndex,
                result10mm: data10.result,
                observations: [...data20.rows, ...data10.rows],
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate || new Date().toISOString().split('T')[0],
                requestId: selectedRow?.requestId || null,
                createdBy: JSON.parse(localStorage.getItem('user'))?.id || 1
            };

            if (existingId) {
                await updateAggregateFlakiness(existingId, payload);
                toast.success("Flakiness & Elongation report updated successfully!");
            } else {
                await saveAggregateFlakiness(payload);
                toast.success("Flakiness & Elongation report saved successfully!");
            }
            
            setConsignmentNo("");
            onSave && onSave(3);
        } catch (error) {
            console.error("Error saving flakiness data:", error);
            toast.error("Failed to save Flakiness report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cement-forms-scope">
            <div className="form-card">
                <div className="form-header">
                    <h2>Combined Flakiness and Elongation Index Test</h2>
                </div>
                <div className="form-body">
                    <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                        <div className="input-group">
                            <label>Date of Testing <span className="required">*</span></label>
                            <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
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
                            ) : initialType === 'Periodic' ? (
                                <input 
                                    type="text" 
                                    value={consignmentNo}
                                    onChange={(e) => setConsignmentNo(e.target.value)}
                                    placeholder="Enter Consignment No"
                                    required 
                                />
                            ) : (
                                <select
                                    value={consignmentNo}
                                    onChange={(e) => setConsignmentNo(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select --</option>
                                    {inventoryData.map((c, i) => (
                                        <option key={i} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                    ))}
                                </select>
                            )}
                            <div className="hint-text">Select verified consignment or enter for Periodic</div>
                        </div>
                    </div>

                    <FlakinessTable
                        title="🔹 SUB-FORM 1: Combined Flakiness & Elongation Index of 20 mm Aggregate"
                        category="20mm"
                        sieveData={[
                            { passing: 20, retained: 16 },
                            { passing: 16, retained: 12.5 },
                            { passing: 12.5, retained: 10 }
                        ]}
                        onDataChange={setData20}
                        initialRows={initialRows20}
                    />

                    <FlakinessTable
                        title="🔹 SUB-FORM 2: Combined Flakiness & Elongation Index of 10 mm Aggregate"
                        category="10mm"
                        sieveData={[
                            { passing: 12.5, retained: 10 },
                            { passing: 10, retained: 6.3 }
                        ]}
                        onDataChange={setData10}
                        initialRows={initialRows10}
                    />

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

import React, { useState, useEffect } from "react";
import { MOCK_VERIFIED_CONSIGNMENTS } from "../../../../utils/rawMaterialMockData";


const FlakinessTable = ({ title, sieveData, onDataChange }) => {
    const [rows, setRows] = useState(sieveData.map(s => ({
        passing: s.passing,
        retained: s.retained,
        a: 0, // Weight of sample
        b: 0, // Weight passed on thickness gauge
        c: 0, // A - B (auto)
        d: 0  // Weight retained on length gauge
    })));

    const handleInputChange = (idx, field, val) => {
        const newRows = [...rows];
        newRows[idx][field] = Number(val);
        if (field === 'a' || field === 'b') {
            newRows[idx].c = newRows[idx].a - newRows[idx].b;
        }
        setRows(newRows);
    };

    const sumA = rows.reduce((acc, r) => acc + r.a, 0);
    const sumB = rows.reduce((acc, r) => acc + r.b, 0);
    const sumC = rows.reduce((acc, r) => acc + r.c, 0);
    const sumD = rows.reduce((acc, r) => acc + r.d, 0);

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
                                <td data-label="IS Sieve Passing">{row.passing}</td>
                                <td data-label="IS Sieve Retained">{row.retained}</td>
                                <td data-label="Wt. Sample (A)"><input type="number" step="0.01" value={row.a || ''} onChange={(e) => handleInputChange(idx, 'a', e.target.value)} /></td>
                                <td data-label="Wt. Passed (B)"><input type="number" step="0.01" value={row.b || ''} onChange={(e) => handleInputChange(idx, 'b', e.target.value)} /></td>
                                <td data-label="Wt. Retained (C=A-B)" className="readOnly">{row.c.toFixed(2)}</td>
                                <td data-label="Wt. Retained Length (D)"><input type="number" step="0.01" value={row.d || ''} onChange={(e) => handleInputChange(idx, 'd', e.target.value)} /></td>
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

export default function CombinedFlakinessElongation({ onSave, onCancel, consignment, lot }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedConsignment, setSelectedConsignment] = useState("");
    const [data20, setData20] = useState({});
    const [data10, setData10] = useState({});


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave && onSave({ date, data20, data10, consignment, lot });
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
                            <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f1f5f9' }} />
                        </div>

                        {!consignment && (
                            <div className="input-group">
                                <label>Consignment No. <span className="required">*</span></label>
                                <select
                                    value={selectedConsignment}
                                    onChange={(e) => setSelectedConsignment(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select --</option>
                                    {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <FlakinessTable
                        title="🔹 SUB-FORM 1: Combined Flakiness & Elongation Index of 20 mm Aggregate"
                        sieveData={[
                            { passing: 20, retained: 16 },
                            { passing: 16, retained: 12.5 },
                            { passing: 12.5, retained: 10 }
                        ]}
                        onDataChange={setData20}
                    />

                    <FlakinessTable
                        title="🔹 SUB-FORM 2: Combined Flakiness & Elongation Index of 10 mm Aggregate"
                        sieveData={[
                            { passing: 12.5, retained: 10 },
                            { passing: 10, retained: 6.3 }
                        ]}
                        onDataChange={setData10}
                    />

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn-save">Submit Test Report</button>
                        {onCancel && <button type="button" onClick={onCancel} className="btn-save" style={{ background: '#64748b' }}>Cancel</button>}
                    </div>
                </div>
            </div>
        </form>
    );
}

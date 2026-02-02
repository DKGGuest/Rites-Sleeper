import React, { useState, useEffect, useMemo } from 'react';

const WaterCuredCubeForm = ({ batch, onSave, onCancel }) => {
    // Basic Batch Info
    const fck = parseInt(batch.grade.replace('M', ''), 10);
    const dateOfCasting = batch.castingDate || batch.date;

    // Initialize 6 cubes data (3 for S1, 3 for S2)
    const initialCubes = useMemo(() => {
        const s1 = (batch.sample1 || []).map(id => ({ id, sample: 1 }));
        const s2 = (batch.sample2 || []).map(id => ({ id, sample: 2 }));
        return [...s1, ...s2].map(c => ({
            ...c,
            dateOfTesting: new Date().toISOString().split('T')[0],
            timeOfTesting: '10:00',
            age: 0,
            weight: '',
            load: '',
            strength: 0
        }));
    }, [batch]);

    const [cubes, setCubes] = useState(initialCubes);

    // Update Age and Strength when inputs change
    useEffect(() => {
        setCubes(prev => prev.map(c => {
            // Calculate Age
            const castDate = new Date(dateOfCasting);
            const testDate = new Date(c.dateOfTesting);
            const ageDays = Math.floor((testDate - castDate) / (1000 * 60 * 60 * 24));

            // Calculate Strength
            const loadVal = parseFloat(c.load);
            const strengthVal = loadVal ? (loadVal * 1000 / 22500).toFixed(2) : 0;

            return { ...c, age: ageDays > 0 ? ageDays : 0, strength: strengthVal };
        }));
    }, [dateOfCasting, cubes.map(c => c.dateOfTesting + c.load).join('|')]); // minimal dependency to avoid loop

    const handleCubeChange = (idx, field, value) => {
        setCubes(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    // Calculations
    const s1Cubes = cubes.filter(c => c.sample === 1);
    const s2Cubes = cubes.filter(c => c.sample === 2);

    const calcAvg = (arr) => {
        const valid = arr.filter(c => parseFloat(c.strength) > 0);
        if (valid.length === 0) return 0;
        const sum = valid.reduce((acc, c) => acc + parseFloat(c.strength), 0);
        return (sum / valid.length).toFixed(2);
    };

    const s1Avg = parseFloat(calcAvg(s1Cubes));
    const s2Avg = parseFloat(calcAvg(s2Cubes));

    const X = parseFloat(((s1Avg + s2Avg) / 2).toFixed(2));
    const allStrengths = cubes.map(c => parseFloat(c.strength)).filter(s => s > 0);
    const Y = allStrengths.length > 0 ? Math.min(...allStrengths) : 0;

    // Conditions
    // C1: X >= Fck+3 && Y >= Fck-3
    const cond1 = X >= (fck + 3) && Y >= (fck - 3);

    // C2: (Fck+3 > X >= Fck) OR (Fck-3 > Y >= Fck-5)
    // Note: The prompt says "& / OR". Usually logic is checking strictly if C1 failed.
    // If C1 is true, C2 might be false or irrelevant. But user says "1 Sleeper if C1 True, 2 if C2 True".
    // This implies exclusive zones.
    // Let's explicitly check the ranges.
    const cond2_partX = (X >= fck && X < (fck + 3));
    const cond2_partY = (Y >= (fck - 5) && Y < (fck - 3));
    const cond2 = !cond1 && (cond2_partX || cond2_partY);

    // C3: X < Fck OR Y < Fck-5
    const cond3 = X < fck || Y < (fck - 5);

    // Result
    // Pass if C1 or C2
    // Fail if C3
    // Note: C2 is "Pass" but with stricter MR requirements (2 sleepers).
    let status = 'Pending';
    let mrSamples = 0;
    let resultColor = '#64748b';

    if (allStrengths.length === 6) {
        if (cond1) {
            status = 'Passed (Condition 1)';
            mrSamples = 1;
            resultColor = '#10b981'; // Green
        } else if (cond2) {
            status = 'Passed (Condition 2)';
            mrSamples = 2;
            resultColor = '#f59e0b'; // Amber/Orange
        } else if (cond3) {
            status = 'Failed (Condition 3)';
            mrSamples = 0; // Fail implies rejection usually? Or retest? User didn't specify MR for fail.
            resultColor = '#ef4444'; // Red
        } else {
            status = 'Check Manual'; // Should cover all cases
        }
    }

    const maxVariation = (arr, avg) => {
        if (avg === 0 || arr.length === 0) return 0;
        const strengths = arr.map(c => parseFloat(c.strength));
        const max = Math.max(...strengths);
        const min = Math.min(...strengths);
        const varMax = Math.abs((max - avg) / avg * 100);
        const varMin = Math.abs((min - avg) / avg * 100);
        return Math.max(varMax, varMin).toFixed(1);
    };

    const s1Var = maxVariation(s1Cubes, s1Avg);
    const s2Var = maxVariation(s2Cubes, s2Avg);

    return (
        <div className="water-cured-cube-form">
            {/* Header */}
            <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: '10px', color: '#64748b' }}>BATCH NO</div><div style={{ fontWeight: '700' }}>{batch.batchNo}</div></div>
                <div><div style={{ fontSize: '10px', color: '#64748b' }}>GRADE</div><div style={{ fontWeight: '700' }}>{batch.grade} (Fck: {fck})</div></div>
                <div><div style={{ fontSize: '10px', color: '#64748b' }}>CASTING DATE</div><div style={{ fontWeight: '700' }}>{dateOfCasting}</div></div>
            </div>

            {/* Input Table */}
            <div style={{ overflowX: 'auto', marginBottom: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <table className="ui-table">
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th>Sample</th>
                            <th>Cube ID</th>
                            <th>Date Test</th>
                            <th>Time</th>
                            <th>Age (Days)</th>
                            <th>Weight (Kg)</th>
                            <th>Load (KN)</th>
                            <th>Strength (N/mm²)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cubes.map((c, i) => (
                            <tr key={i} style={i === 2 ? { borderBottom: '2px solid #cbd5e1' } : {}}>
                                {i % 3 === 0 && (
                                    <td rowSpan={3} style={{ fontWeight: '700', color: '#42818c', background: '#f8fafc', verticalAlign: 'middle', textAlign: 'center' }}>
                                        Sample {c.sample}
                                    </td>
                                )}
                                <td style={{ fontWeight: '600' }}>{c.id}</td>
                                <td><input type="date" value={c.dateOfTesting} onChange={e => handleCubeChange(i, 'dateOfTesting', e.target.value)} style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></td>
                                <td><input type="time" value={c.timeOfTesting} onChange={e => handleCubeChange(i, 'timeOfTesting', e.target.value)} style={{ padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></td>
                                <td><input value={c.age} readOnly style={{ width: '40px', background: '#f1f5f9', border: 'none', textAlign: 'center' }} /></td>
                                <td><input type="number" step="0.01" value={c.weight} onChange={e => handleCubeChange(i, 'weight', e.target.value)} style={{ width: '60px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></td>
                                <td><input type="number" step="0.1" value={c.load} onChange={e => handleCubeChange(i, 'load', e.target.value)} style={{ width: '70px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }} /></td>
                                <td><span style={{ fontWeight: '700' }}>{c.strength}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Calculations & Results */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>Calculated Metrics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                        <div>Sample 1 Avg: <b>{s1Avg}</b> <span style={{ fontSize: '10px', color: '#64748b' }}>(Var: {s1Var}%)</span></div>
                        <div>Sample 2 Avg: <b>{s2Avg}</b> <span style={{ fontSize: '10px', color: '#64748b' }}>(Var: {s2Var}%)</span></div>
                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>X (Mean Avg): <b>{X}</b></div>
                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>Y (Min Cube): <b>{Y}</b></div>
                    </div>
                </div>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '2px solid', borderColor: resultColor }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '16px', color: resultColor }}>Test Result: {status}</h4>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                        Required Fck: <b>{fck}</b>
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '16px' }}>
                        Condition 1 (X ≥ {fck + 3}, Y ≥ {fck - 3}): <b>{cond1 ? 'Pass' : 'Fail'}</b><br />
                        Condition 2 (Intermediate): <b>{cond2 ? 'True' : 'False'}</b><br />
                        Condition 3 (Fail): <b>{cond3 ? 'True' : 'False'}</b>
                    </div>
                    {mrSamples > 0 && (
                        <div style={{ marginTop: '12px', padding: '8px', background: resultColor + '20', borderRadius: '6px', color: resultColor, fontWeight: '700' }}>
                            Requires {mrSamples} Sleeper(s) for MR Testing
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn-verify" style={{ flex: 1, height: '44px' }} onClick={() => onSave({ cubes, s1Avg, s2Avg, X, Y, result: status })}>Save Test Details</button>
                <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', height: '44px' }} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default WaterCuredCubeForm;

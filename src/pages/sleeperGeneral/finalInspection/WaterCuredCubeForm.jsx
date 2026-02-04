import React, { useState, useEffect } from 'react';
import './WaterCuredCubeForm.css';

const WaterCuredCubeForm = ({ batch, onSave, onCancel }) => {
    // Area for 150mm cube is 22500 mm2
    const AREA = 22500;
    const FCK = batch.grade === 'M55' ? 55 : (batch.grade === 'M60' ? 60 : 55);

    const initialCubes = [
        { id: 1, sample: 1, weight: '', load: '', strength: 0, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) },
        { id: 2, sample: 1, weight: '', load: '', strength: 0, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) },
        { id: 3, sample: 1, weight: '', load: '', strength: 0, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) },
        { id: 4, sample: 2, weight: '', load: '', strength: 0, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) },
        { id: 5, sample: 2, weight: '', load: '', strength: 0, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) },
        { id: 6, sample: 2, weight: '', load: '', strength: 0, date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) },
    ];

    const [cubes, setCubes] = useState(initialCubes);
    const [results, setResults] = useState({
        s1Avg: 0,
        s2Avg: 0,
        x: 0,
        y: 0,
        condition1: false,
        condition2: false,
        condition3: false,
        s1Variation: 0,
        s2Variation: 0,
        mrSamples: 0,
        testResult: 'Pending'
    });

    const calculateAge = (castingDate) => {
        const diffTime = Math.abs(new Date() - new Date(castingDate));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const age = calculateAge(batch.castingDate);

    useEffect(() => {
        const updatedCubes = cubes.map(cube => {
            const loadVal = parseFloat(cube.load);
            const strength = loadVal ? (loadVal * 1000 / AREA).toFixed(2) : 0;
            return { ...cube, strength: parseFloat(strength) };
        });

        // Calculate Averages
        const s1Cubes = updatedCubes.filter(c => c.sample === 1 && c.strength > 0);
        const s2Cubes = updatedCubes.filter(c => c.sample === 2 && c.strength > 0);

        const s1Avg = s1Cubes.length > 0 ? s1Cubes.reduce((acc, c) => acc + c.strength, 0) / s1Cubes.length : 0;
        const s2Avg = s2Cubes.length > 0 ? s2Cubes.reduce((acc, c) => acc + c.strength, 0) / s2Cubes.length : 0;

        // X = Avg of Sample 1 Avg & Sample 2 Avg
        const x = (s1Avg > 0 && s2Avg > 0) ? (s1Avg + s2Avg) / 2 : 0;

        // Y = min of all cubes
        const allStrengths = updatedCubes.filter(c => c.strength > 0).map(c => c.strength);
        const y = allStrengths.length > 0 ? Math.min(...allStrengths) : 0;

        // Variations
        const calcVariation = (sampleCubes, avg) => {
            if (sampleCubes.length < 3 || avg === 0) return 0;
            const variations = sampleCubes.map(c => Math.abs((c.strength - avg) / avg) * 100);
            return Math.max(...variations);
        };

        const s1Variation = calcVariation(s1Cubes, s1Avg);
        const s2Variation = calcVariation(s2Cubes, s2Avg);

        // Conditions
        // Condition 1: X >= (Fck + 3) && Y >= (Fck - 3)
        const condition1 = allStrengths.length === 6 && x >= (FCK + 3) && y >= (FCK - 3);

        // Condition 2: (Fck + 3) > X >= Fck & / OR (Fck - 3) > Y >= (Fck - 5)
        // Wait, Condition 2 says "IF True if (Fck +3) > X >= Fck & / OR (Fck-3)>Y >= (Fck-5)"
        // This is tricky logic. Let's break it down:
        // C2 is true if:
        // ((X < Fck + 3) AND (X >= Fck))  OR  ((Y < Fck - 3) AND (Y >= Fck - 5))
        // But wait, if Condition 1 is already true, it shouldn't be C2?
        // Usually these are mutually exclusive or hierarchical.
        const condition2 = allStrengths.length === 6 && !condition1 && (
            ((x < FCK + 3) && (x >= FCK)) ||
            ((y < FCK - 3) && (y >= FCK - 5))
        );

        // Condition 3: X < Fck & / OR Y < Fck-5
        const condition3 = allStrengths.length === 6 && !condition1 && !condition2 && (
            (x < FCK) || (y < FCK - 5)
        );

        let mrSamples = 0;
        let testResult = 'Pending';

        if (allStrengths.length === 6) {
            if (condition1) {
                mrSamples = 1;
                testResult = 'PASS';
            } else if (condition2) {
                mrSamples = 2;
                testResult = 'PASS';
            } else if (condition3) {
                mrSamples = 0; // Or as required
                testResult = 'FAIL';
            }
        }

        setResults({
            s1Avg, s2Avg, x, y,
            condition1, condition2, condition3,
            s1Variation, s2Variation, mrSamples, testResult
        });
    }, [cubes, FCK]);

    const handleCubeChange = (id, field, value) => {
        setCubes(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <div className="water-cube-form">
            <div className="form-summary-card">
                <div className="summary-grid">
                    <div className="summary-item"><label>Batch No</label><span>{batch.batchNo}</span></div>
                    <div className="summary-item"><label>Concrete Grade</label><span>{batch.grade}</span></div>
                    <div className="summary-item"><label>Casting Date</label><span>{batch.castingDate}</span></div>
                    <div className="summary-item"><label>Age (Days)</label><span>{age}</span></div>
                    <div className="summary-item"><label>Fck (Target)</label><span>{FCK} N/mm²</span></div>
                </div>
            </div>

            <div className="cubes-grid">
                <div className="sample-section">
                    <h4>Sample 1 (Cubes declared: {batch.sample1?.join(', ')})</h4>
                    <div className="table-container">
                        <table className="cubes-table">
                            <thead>
                                <tr>
                                    <th>Date/Time</th>
                                    <th>Cube #</th>
                                    <th>Weight (kg)</th>
                                    <th>Load (KN)</th>
                                    <th>Strength</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cubes.filter(c => c.sample === 1).map((cube, idx) => (
                                    <tr key={cube.id}>
                                        <td>
                                            <div className="date-time-inputs">
                                                <input type="date" value={cube.date} onChange={(e) => handleCubeChange(cube.id, 'date', e.target.value)} />
                                                <input type="time" value={cube.time} onChange={(e) => handleCubeChange(cube.id, 'time', e.target.value)} />
                                            </div>
                                        </td>
                                        <td><strong>1-{idx + 1}</strong></td>
                                        <td><input type="number" step="0.01" value={cube.weight} onChange={(e) => handleCubeChange(cube.id, 'weight', e.target.value)} /></td>
                                        <td><input type="number" step="0.1" value={cube.load} onChange={(e) => handleCubeChange(cube.id, 'load', e.target.value)} /></td>
                                        <td className="strength-cell">{cube.strength || '0.00'}</td>
                                    </tr>
                                ))}
                                <tr className="avg-row">
                                    <td colSpan="4">Sample 1 Average Strength</td>
                                    <td className="strength-cell">{results.s1Avg.toFixed(2)}</td>
                                </tr>
                                <tr className="variation-row">
                                    <td colSpan="4">Sample 1 Max Variation %</td>
                                    <td>{results.s1Variation.toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="sample-section">
                    <h4>Sample 2 (Cubes declared: {batch.sample2?.join(', ')})</h4>
                    <div className="table-container">
                        <table className="cubes-table">
                            <thead>
                                <tr>
                                    <th>Date/Time</th>
                                    <th>Cube #</th>
                                    <th>Weight (kg)</th>
                                    <th>Load (KN)</th>
                                    <th>Strength</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cubes.filter(c => c.sample === 2).map((cube, idx) => (
                                    <tr key={cube.id}>
                                        <td>
                                            <div className="date-time-inputs">
                                                <input type="date" value={cube.date} onChange={(e) => handleCubeChange(cube.id, 'date', e.target.value)} />
                                                <input type="time" value={cube.time} onChange={(e) => handleCubeChange(cube.id, 'time', e.target.value)} />
                                            </div>
                                        </td>
                                        <td><strong>2-{idx + 1}</strong></td>
                                        <td><input type="number" step="0.01" value={cube.weight} onChange={(e) => handleCubeChange(cube.id, 'weight', e.target.value)} /></td>
                                        <td><input type="number" step="0.1" value={cube.load} onChange={(e) => handleCubeChange(cube.id, 'load', e.target.value)} /></td>
                                        <td className="strength-cell">{cube.strength || '0.00'}</td>
                                    </tr>
                                ))}
                                <tr className="avg-row">
                                    <td colSpan="4">Sample 2 Average Strength</td>
                                    <td className="strength-cell">{results.s2Avg.toFixed(2)}</td>
                                </tr>
                                <tr className="variation-row">
                                    <td colSpan="4">Sample 2 Max Variation %</td>
                                    <td>{results.s2Variation.toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="results-analysis">
                <h3>Statistical Analysis & Compliance</h3>
                <div className="analysis-grid">
                    <div className={`analysis-card ${results.x > 0 ? 'active' : ''}`}>
                        <label>X (Avg of S1 & S2)</label>
                        <div className="value">{results.x.toFixed(2)} <span className="unit">N/mm²</span></div>
                    </div>
                    <div className={`analysis-card ${results.y > 0 ? 'active' : ''}`}>
                        <label>Y (Min of all Cubes)</label>
                        <div className="value">{results.y.toFixed(2)} <span className="unit">N/mm²</span></div>
                    </div>
                    <div className={`analysis-card condition ${results.condition1 ? 'true' : ''}`}>
                        <label>Condition 1</label>
                        <div className="status">{results.condition1 ? 'TRUE' : 'FALSE'}</div>
                        <div className="desc">X ≥ {FCK + 3} & Y ≥ {FCK - 3}</div>
                    </div>
                    <div className={`analysis-card condition ${results.condition2 ? 'true' : ''}`}>
                        <label>Condition 2</label>
                        <div className="status">{results.condition2 ? 'TRUE' : 'FALSE'}</div>
                        <div className="desc">{FCK + 3} &gt; X ≥ {FCK} OR {FCK - 3} &gt; Y ≥ {FCK - 5}</div>
                    </div>
                    <div className={`analysis-card condition ${results.condition3 ? 'error' : ''}`}>
                        <label>Condition 3</label>
                        <div className="status">{results.condition3 ? 'TRUE' : 'FALSE'}</div>
                        <div className="desc">X &lt; {FCK} OR Y &lt; {FCK - 5}</div>
                    </div>
                </div>

                <div className="final-verdict">
                    <div className="verdict-item">
                        <label>MR Test Samples Required</label>
                        <div className="verdict-value">{results.mrSamples} Sleeper(s) per lot</div>
                    </div>
                    <div className={`verdict-item result ${results.testResult.toLowerCase()}`}>
                        <label>Final Test Result</label>
                        <div className="verdict-value">{results.testResult}</div>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button className="btn-save" onClick={() => onSave({ cubes, results })} disabled={results.testResult === 'Pending'}>Save Test Details</button>
                <button className="btn-cancel" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default WaterCuredCubeForm;

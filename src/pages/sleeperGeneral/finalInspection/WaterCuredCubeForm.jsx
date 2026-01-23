import React, { useState, useMemo } from 'react';

const WaterCuredCubeForm = ({ batch, onSave, onCancel }) => {
    // Mock SCADA data for 6 cubes
    const initialScadaData = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => ({
            cubeNo: `${batch.batchNo}/C${i + 1}`,
            castingDateTime: '2026-01-01 10:30',
            testingDateTime: '2026-01-23 11:15',
            ageHrs: 528.7,
            weightKg: (8.1 + Math.random() * 0.4).toFixed(3),
            loadKn: (1200 + Math.random() * 200).toFixed(1),
            strengthNmm2: 0, // Calculated later
            verified: false
        })).map(c => ({
            ...c,
            strengthNmm2: (parseFloat(c.loadKn) * 1000 / 22500).toFixed(2)
        }));
    }, [batch]);

    const [cubeData, setCubeData] = useState(initialScadaData);
    const [s1Selection, setS1Selection] = useState([]);
    const [s2Selection, setS2Selection] = useState([]);

    const toggleVerify = (idx) => {
        const updated = [...cubeData];
        updated[idx].verified = !updated[idx].verified;
        setCubeData(updated);
    };

    const handleS1Select = (cubeNo) => {
        if (s1Selection.includes(cubeNo)) {
            setS1Selection(s1Selection.filter(id => id !== cubeNo));
        } else if (s1Selection.length < 3 && !s2Selection.includes(cubeNo)) {
            setS1Selection([...s1Selection, cubeNo]);
        }
    };

    const handleS2Select = (cubeNo) => {
        if (s2Selection.includes(cubeNo)) {
            setS2Selection(s2Selection.filter(id => id !== cubeNo));
        } else if (s2Selection.length < 3 && !s1Selection.includes(cubeNo)) {
            setS2Selection([...s2Selection, cubeNo]);
        }
    };

    const isAllVerified = cubeData.every(c => c.verified);
    const isSelectionComplete = s1Selection.length === 3 && s2Selection.length === 3;

    return (
        <div className="water-cured-cube-form">
            {/* Header / Info Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>SHED NO.</label><div style={{ fontWeight: '700' }}>SH-01</div></div>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>DATE & SHIFT</label><div style={{ fontWeight: '700' }}>{batch.castingDate} / Day</div></div>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>BATCH NO.</label><div style={{ fontWeight: '700' }}>{batch.batchNo}</div></div>
                <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>NO. OF CUBES</label><div style={{ fontWeight: '700' }}>6 Nos</div></div>
            </div>

            {/* SCADA Data Verification Table */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', color: '#42818c', marginBottom: '16px', textTransform: 'uppercase', fontWeight: '800' }}>SCADA Data Verification</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table className="ui-table" style={{ fontSize: '11px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th>Cube No.</th>
                                <th>Date/Time of Casting</th>
                                <th>Date/Time of Testing</th>
                                <th>Age (Hrs)</th>
                                <th>Weight (Kg)</th>
                                <th>Load (KN)</th>
                                <th>Strength (N/mm²)</th>
                                <th>Verify</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cubeData.map((cube, idx) => (
                                <tr key={idx} style={{ background: cube.verified ? '#ecfdf5' : 'transparent' }}>
                                    <td style={{ fontWeight: '700' }}>{cube.cubeNo}</td>
                                    <td>{cube.castingDateTime}</td>
                                    <td>{cube.testingDateTime}</td>
                                    <td>{cube.ageHrs}</td>
                                    <td>{cube.weightKg}</td>
                                    <td>{cube.loadKn}</td>
                                    <td style={{ fontWeight: '800', color: '#13343b' }}>{cube.strengthNmm2}</td>
                                    <td>
                                        <label className="checkbox-cell" style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={cube.verified}
                                                onChange={() => toggleVerify(idx)}
                                            />
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sample Selection Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Selection pool */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '12px', color: '#42818c', marginBottom: '16px', textTransform: 'uppercase', fontWeight: '800' }}>Assign Samples</h4>
                    <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '16px' }}>Verify all data first, then assign cubes to Sample 1 (S1) and Sample 2 (S2).</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {cubeData.map((cube, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontWeight: '700', fontSize: '12px' }}>{cube.cubeNo}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleS1Select(cube.cubeNo)}
                                        disabled={!cube.verified || (s2Selection.includes(cube.cubeNo))}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: '10px',
                                            borderRadius: '4px',
                                            border: '1px solid #42818c',
                                            background: s1Selection.includes(cube.cubeNo) ? '#42818c' : 'transparent',
                                            color: s1Selection.includes(cube.cubeNo) ? '#fff' : '#42818c',
                                            cursor: 'pointer',
                                            fontWeight: '700'
                                        }}
                                    >
                                        S1
                                    </button>
                                    <button
                                        onClick={() => handleS2Select(cube.cubeNo)}
                                        disabled={!cube.verified || (s1Selection.includes(cube.cubeNo))}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: '10px',
                                            borderRadius: '4px',
                                            border: '1px solid #42818c',
                                            background: s2Selection.includes(cube.cubeNo) ? '#42818c' : 'transparent',
                                            color: s2Selection.includes(cube.cubeNo) ? '#fff' : '#42818c',
                                            cursor: 'pointer',
                                            fontWeight: '700'
                                        }}
                                    >
                                        S2
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selection Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
                        <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Sample S1 (Selected {s1Selection.length}/3)</h5>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {s1Selection.map(id => (
                                <div key={id} style={{ padding: '6px 12px', background: '#42818c10', color: '#42818c', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: '1px solid #42818c33' }}>
                                    {id.split('/')[1]}
                                </div>
                            ))}
                            {s1Selection.length === 0 && <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No cubes selected</span>}
                        </div>
                    </div>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
                        <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Sample S2 (Selected {s2Selection.length}/3)</h5>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {s2Selection.map(id => (
                                <div key={id} style={{ padding: '6px 12px', background: '#42818c10', color: '#42818c', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: '1px solid #42818c33' }}>
                                    {id.split('/')[1]}
                                </div>
                            ))}
                            {s2Selection.length === 0 && <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No cubes selected</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                    className="btn-verify"
                    style={{ flex: 1, height: '44px' }}
                    disabled={!isAllVerified || !isSelectionComplete}
                    onClick={() => onSave({ s1Selection, s2Selection, cubeData })}
                >
                    Confirm Verification & Save
                </button>
                <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', height: '44px' }} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default WaterCuredCubeForm;

import React, { useState, useMemo } from 'react';
import EnhancedDataTable from '../../../components/EnhancedDataTable';

// Mock Data for Batches manufactured in plant
const MOCK_MANUFACTURED_BATCHES = [
    { batchNo: 'B-701', date: '2026-01-05', grade: 'M55', sleepers: 160, typesCount: 1 },
    { batchNo: 'B-702', date: '2026-01-06', grade: 'M60', sleepers: 160, typesCount: 2 },
    { batchNo: 'B-703', date: '2026-01-07', grade: 'M55', sleepers: 80, typesCount: 1 },
    { batchNo: 'B-704', date: '2026-01-08', grade: 'M60', sleepers: 160, typesCount: 1 },
    { batchNo: 'B-705', date: '2026-01-09', grade: 'M55', sleepers: 160, typesCount: 1 },
];

export const WaterCubeStats = ({ mini = false }) => {
    const stats = {
        readyCount: 12,
        pendingSamples: 8,
        avgStrength: 58.4,
        minStrength: 52.1,
        maxStrength: 64.2,
        deviation: 4.2
    };

    if (mini) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Avg</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{stats.avgStrength}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Pending</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#42818c' }}>{stats.pendingSamples}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', margin: 0 }}>Water Cube Statistics</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select className="dash-select" style={{ fontSize: '11px', padding: '4px 8px' }}><option>All Grades</option><option>M55</option><option>M60</option></select>
                    <input type="date" className="dash-select" style={{ fontSize: '11px', padding: '4px 8px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Batches Ready (>15d)', value: stats.readyCount, color: '#1e293b' },
                    { label: 'Pending Samples', value: stats.pendingSamples, color: '#42818c' },
                    { label: 'Avg Strength (N/mm²)', value: stats.avgStrength, color: '#1e293b' },
                    { label: 'Min Strength', value: stats.minStrength, color: '#ef4444' },
                    { label: 'Max Strength', value: stats.maxStrength, color: '#059669' },
                    { label: 'Deviation %', value: `${stats.deviation}%`, color: '#f59e0b' },
                ].map((s, idx) => (
                    <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{s.label}</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WaterCubeTesting = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('pending'); // 'declaration', 'pending', 'done'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showTestModal, setShowTestModal] = useState(false);

    const [declaredBatches, setDeclaredBatches] = useState([
        {
            batchNo: 'B-690', grade: 'M55', castingDate: '2026-01-01',
            sample1: ['201A', '210B', '315D'], sample2: ['209D', '415B', '410B'],
            status: 'Testing Pending'
        }
    ]);

    const [doneTests] = useState([]);

    const pendingColumns = [
        { key: 'batchNo', label: 'Batch Number' },
        { key: 'grade', label: 'Grade' },
        { key: 'castingDate', label: 'Date of Casting' },
        {
            key: 'sample1',
            label: 'Sample 1 Cubes',
            render: (val) => <span style={{ fontSize: '11px', color: '#64748b' }}>{val.join(', ')}</span>
        },
        {
            key: 'sample2',
            label: 'Sample 2 Cubes',
            render: (val) => <span style={{ fontSize: '11px', color: '#64748b' }}>{val.join(', ')}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, row) => {
                const isEligible = new Date(row.castingDate) <= new Date(new Date().setDate(new Date().getDate() - 15));
                return (
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: isEligible ? '#ecfdf5' : '#f1f5f9',
                        color: isEligible ? '#059669' : '#94a3b8'
                    }}>
                        {isEligible ? 'Testing Pending' : 'Not Eligible'}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-action"
                    onClick={() => { setSelectedBatch(row); setShowTestModal(true); }}
                    style={{ fontSize: '10px', padding: '4px 10px' }}
                >
                    Record Test
                </button>
            )
        }
    ];

    const declarationColumns = [
        { key: 'batchNo', label: 'Batch No' },
        { key: 'date', label: 'Date of Casting' },
        { key: 'grade', label: 'Grade' },
        { key: 'sleepers', label: 'Sleepers' },
        { key: 'typesCount', label: 'Sleeper Types' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    onClick={() => { setSelectedBatch(row); setShowDeclareModal(true); }}
                >
                    Declare Samples
                </button>
            )
        }
    ];

    return (
        <div className="water-cube-module cement-forms-scope">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button className="back-button" onClick={onBack} style={{ padding: '8px' }}>← Back</button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Water Cured Cube Strength (Sub Card 4)</h2>
            </header>

            <WaterCubeStats />

            <div className="nav-tabs" style={{ marginBottom: '20px', justifyContent: 'flex-start' }}>
                <button className={`nav-tab ${activeTab === 'declaration' ? 'active' : ''}`} onClick={() => setActiveTab('declaration')}>Samples Declaration</button>
                <button className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending for Testing</button>
                <button className={`nav-tab ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>List of Testing Done</button>
            </div>

            <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
                {activeTab === 'declaration' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                        <h4 style={{ marginBottom: '16px', color: '#475569' }}>Batches Manufactured (Declaration Pending)</h4>
                        <EnhancedDataTable columns={declarationColumns} data={MOCK_MANUFACTURED_BATCHES} />
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                        <h4 style={{ marginBottom: '16px', color: '#475569' }}>Batches with Declared Samples (Awaiting Test)</h4>
                        <EnhancedDataTable columns={pendingColumns} data={declaredBatches} />
                    </div>
                )}

                {activeTab === 'done' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                        <h4 style={{ marginBottom: '16px', color: '#475569' }}>Completed Strength Tests</h4>
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records found. Complete tests to see logs here.</div>
                    </div>
                )}
            </div>

            {/* Declaration Modal */}
            {showDeclareModal && (
                <SampleDeclarationModal
                    batch={selectedBatch}
                    onClose={() => setShowDeclareModal(false)}
                    onSave={(data) => {
                        setDeclaredBatches([{ ...data, status: 'Testing Pending' }, ...declaredBatches]);
                        setShowDeclareModal(false);
                    }}
                />
            )}

            {/* Test Entry Modal */}
            {showTestModal && (
                <TestEntryModal
                    batch={selectedBatch}
                    onClose={() => setShowTestModal(false)}
                    onSave={(data) => {
                        // Handle save to done list
                        setShowTestModal(false);
                    }}
                />
            )}
        </div>
    );
};

const SampleDeclarationModal = ({ batch, onClose, onSave }) => {
    const [form, setForm] = useState({
        sample1: [{ bench: '', seq: 'A' }, { bench: '', seq: 'A' }, { bench: '', seq: 'A' }],
        sample2: [{ bench: '', seq: 'A' }, { bench: '', seq: 'A' }, { bench: '', seq: 'A' }]
    });

    const sequences = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const handleUpdate = (sampleIdx, cubeIdx, field, val) => {
        const key = `sample${sampleIdx + 1}`;
        const updated = [...form[key]];
        updated[cubeIdx][field] = val;
        setForm({ ...form, [key]: updated });
    };

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Declare Test Samples: Batch {batch?.batchNo}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ marginBottom: '24px' }}>
                        <div className="input-group"><label>Batch Number</label><input readOnly value={batch?.batchNo} /></div>
                        <div className="input-group"><label>Date of Casting</label><input readOnly value={batch?.date} /></div>
                        <div className="input-group"><label>Concrete Grade</label><input readOnly value={batch?.grade} /></div>
                    </div>

                    {[0, 1].map(sIdx => (
                        <div key={sIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '13px', color: '#13343b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '20px', height: '20px', background: '#42818c', color: '#fff', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{sIdx + 1}</span>
                                Sample {sIdx + 1} (3 Cubes)
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px', fontWeight: '600', fontSize: '11px', color: '#64748b', marginBottom: '8px', padding: '0 8px' }}>
                                <span>Cube No</span><span>Bench Number</span><span>Sequence</span>
                            </div>
                            {form[`sample${sIdx + 1}`].map((c, cIdx) => (
                                <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '10px', marginBottom: '8px' }}>
                                    <input value={`${c.bench || '???'}${c.seq}`} readOnly style={{ background: '#fff', border: '1px dashed #cbd5e1' }} />
                                    <input
                                        type="number"
                                        placeholder="Enter Bench"
                                        value={c.bench}
                                        onChange={(e) => handleUpdate(sIdx, cIdx, 'bench', e.target.value)}
                                    />
                                    <select value={c.seq} onChange={(e) => handleUpdate(sIdx, cIdx, 'seq', e.target.value)}>
                                        {sequences.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => onSave({
                            batchNo: batch.batchNo,
                            grade: batch.grade,
                            castingDate: batch.date,
                            sample1: form.sample1.map(c => `${c.bench}${c.seq}`),
                            sample2: form.sample2.map(c => `${c.bench}${c.seq}`)
                        })}>Submit Declaration</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TestEntryModal = ({ batch, onClose, onSave }) => {
    const fck = batch.grade === 'M55' ? 55 : 60;
    const [form, setForm] = useState({
        testDate: new Date().toISOString().split('T')[0],
        testTime: '10:00',
        readings: [...batch.sample1, ...batch.sample2].map(cube => ({
            id: cube,
            weight: '',
            load: '',
            strength: 0
        }))
    });

    const handleReadingChange = (idx, field, val) => {
        const updated = [...form.readings];
        updated[idx][field] = val;

        if (field === 'load' && val) {
            // Area = 150x150 = 22500 mm2. Strength = Load (KN) * 1000 / 22500
            updated[idx].strength = parseFloat((parseFloat(val) * 1000 / 22500).toFixed(2));
        }
        setForm({ ...form, readings: updated });
    };

    const calculation = useMemo(() => {
        const s1 = form.readings.slice(0, 3).map(r => r.strength);
        const s2 = form.readings.slice(3, 6).map(r => r.strength);

        const avg1 = s1.every(v => v > 0) ? (s1.reduce((a, b) => a + b, 0) / 3) : 0;
        const avg2 = s2.every(v => v > 0) ? (s2.reduce((a, b) => a + b, 0) / 3) : 0;

        const X = (avg1 > 0 && avg2 > 0) ? (avg1 + avg2) / 2 : 0;
        const Y = Math.min(...form.readings.map(r => r.strength || 9999));

        const cond1 = (X >= (fck + 3)) && (Y >= (fck - 3));
        const cond2 = ((fck + 3) > X && X >= fck) || ((fck - 3) > Y && Y >= (fck - 5));
        const cond3 = (X < fck) || (Y < (fck - 5));

        let mrSamples = 0;
        if (cond1) mrSamples = 1;
        else if (cond2) mrSamples = 2;

        const pass = cond1 || cond2;

        // Max Variation Calculation
        const var1 = avg1 > 0 ? Math.max(...s1.map(v => Math.abs(v - avg1) / avg1 * 100)) : 0;
        const var2 = avg2 > 0 ? Math.max(...s2.map(v => Math.abs(v - avg2) / avg2 * 100)) : 0;

        return { avg1, avg2, X, Y, cond1, cond2, cond3, mrSamples, pass, var1, var2 };
    }, [form.readings, fck]);

    const age = useMemo(() => {
        const cast = new Date(batch.castingDate);
        const test = new Date(form.testDate);
        return Math.floor((test - cast) / (1000 * 60 * 60 * 24));
    }, [batch.castingDate, form.testDate]);

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '95vw', width: '1200px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter Cube Test Details: Batch {batch.batchNo}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div className="input-group"><label>Batch</label><input readOnly value={batch.batchNo} /></div>
                        <div className="input-group"><label>Grade</label><input readOnly value={batch.grade} /></div>
                        <div className="input-group"><label>Date of Casting</label><input readOnly value={batch.castingDate} /></div>
                        <div className="input-group"><label>Test Age (Days)</label><input readOnly value={age} style={{ color: age >= 15 ? '#059669' : '#dc2626', fontWeight: 'bold' }} /></div>
                        <div className="input-group"><label>Date of Testing</label><input type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} /></div>
                        <div className="input-group"><label>Time of Testing</label><input type="time" value={form.testTime} onChange={e => setForm({ ...form, testTime: e.target.value })} /></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Sample 1 Table */}
                        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '13px', color: '#13343b', marginBottom: '12px' }}>Sample 1 (Cubes)</h4>
                            <table className="ui-table">
                                <thead><tr><th>Cube No</th><th>Weight (Kgs)</th><th>Load (KN)</th><th>Strength</th></tr></thead>
                                <tbody>
                                    {form.readings.slice(0, 3).map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 'bold' }}>{r.id}</td>
                                            <td><input type="number" step="0.01" value={r.weight} onChange={e => handleReadingChange(i, 'weight', e.target.value)} placeholder="0.00" /></td>
                                            <td><input type="number" step="0.1" value={r.load} onChange={e => handleReadingChange(i, 'load', e.target.value)} placeholder="0.0" /></td>
                                            <td style={{ fontWeight: '700', color: '#13343b' }}>{r.strength || '-'}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td colSpan="3" style={{ fontWeight: '600', textAlign: 'right' }}>Sample 1 Avg</td>
                                        <td style={{ fontWeight: '800', color: '#42818c' }}>{calculation.avg1.toFixed(2)}</td>
                                    </tr>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td colSpan="3" style={{ fontSize: '10px', textAlign: 'right' }}>Max Variation (%)</td>
                                        <td style={{ fontSize: '11px', fontWeight: '600', color: calculation.var1 > 15 ? '#dc2626' : '#64748b' }}>{calculation.var1.toFixed(1)}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Sample 2 Table */}
                        <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '13px', color: '#13343b', marginBottom: '12px' }}>Sample 2 (Cubes)</h4>
                            <table className="ui-table">
                                <thead><tr><th>Cube No</th><th>Weight (Kgs)</th><th>Load (KN)</th><th>Strength</th></tr></thead>
                                <tbody>
                                    {form.readings.slice(3, 6).map((r, i) => (
                                        <tr key={i + 3}>
                                            <td style={{ fontWeight: 'bold' }}>{r.id}</td>
                                            <td><input type="number" step="0.01" value={r.weight} onChange={e => handleReadingChange(i + 3, 'weight', e.target.value)} placeholder="0.00" /></td>
                                            <td><input type="number" step="0.1" value={r.load} onChange={e => handleReadingChange(i + 3, 'load', e.target.value)} placeholder="0.0" /></td>
                                            <td style={{ fontWeight: '700', color: '#13343b' }}>{r.strength || '-'}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td colSpan="3" style={{ fontWeight: '600', textAlign: 'right' }}>Sample 2 Avg</td>
                                        <td style={{ fontWeight: '800', color: '#42818c' }}>{calculation.avg2.toFixed(2)}</td>
                                    </tr>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td colSpan="3" style={{ fontSize: '10px', textAlign: 'right' }}>Max Variation (%)</td>
                                        <td style={{ fontSize: '11px', fontWeight: '600', color: calculation.var2 > 15 ? '#dc2626' : '#64748b' }}>{calculation.var2.toFixed(1)}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Final Analysis Summary */}
                    <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                        <div style={{ gridColumn: 'span 5', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '14px' }}>Acceptance Criteria & Final Result</h4>
                            <span style={{ fontSize: '11px', fontWeight: '700', background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '20px' }}>Fck = {fck} N/mm²</span>
                        </div>

                        <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>X (Avg of Samples)</div>
                            <div style={{ fontSize: '18px', fontWeight: '800' }}>{calculation.X.toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Y (Min of 6 Cubes)</div>
                            <div style={{ fontSize: '18px', fontWeight: '800' }}>{calculation.Y === 9999 ? '-' : calculation.Y.toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                                <span>{`Cond 1: X≥(Fck+3) & Y≥(Fck-3)`}</span>
                                <span style={{ color: calculation.cond1 ? '#059669' : '#94a3b8' }}>{calculation.cond1 ? '✔️ TRUE' : 'FALSE'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                                <span>{`Cond 2: (Fck+3)>X≥Fck & (Fck-3)>Y≥(Fck-5)`}</span>
                                <span style={{ color: calculation.cond2 ? '#f59e0b' : '#94a3b8' }}>{calculation.cond2 ? '✔️ TRUE' : 'FALSE'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                                <span>{`Cond 3: X < Fck & / OR Y < Fck-5`}</span>
                                <span style={{ color: calculation.cond3 ? '#dc2626' : '#94a3b8' }}>{calculation.cond3 ? '❌ TRUE (FAILED)' : 'FALSE'}</span>
                            </div>
                        </div>
                        <div style={{ background: calculation.pass ? '#ecfdf5' : '#fef2f2', padding: '10px', borderRadius: '8px', border: `1.5px solid ${calculation.pass ? '#059669' : '#dc2626'}`, textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: calculation.pass ? '#059669' : '#dc2626', fontWeight: '700' }}>FINAL RESULT</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: calculation.pass ? '#059669' : '#dc2626' }}>{calculation.pass ? 'PASS' : 'FAIL'}</div>
                        </div>

                        <div style={{ gridColumn: 'span 5', background: '#42818c10', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#42818c' }}>Number of MR Test Samples Required:</span>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#13343b' }}>{calculation.mrSamples} {calculation.mrSamples === 1 ? 'Sleeper' : 'Sleepers'} per lot</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="btn-verify" style={{ flex: 1, height: '40px' }} onClick={onSave} disabled={!calculation.X}>Save Test Details</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', height: '40px' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterCubeTesting;

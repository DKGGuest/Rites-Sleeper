import React, { useState, useMemo, useEffect } from 'react';

const SteamCubeTesting = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState('declared'); // 'declared', 'recent'
    const [showAddForm, setShowAddForm] = useState(false);
    const [showTestForm, setShowTestForm] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);

    // Mock initial data
    const [declaredSamples, setDeclaredSamples] = useState([
        {
            id: 1, batchNo: 610, chamberNo: 1, benchNo: 401, sequence: 'A',
            cubeNo: '401A', grade: 'M55', castDate: '2026-01-21',
            lbcTime: '10:30', benchesInChamber: '401, 402',
            sleeperType: 'Pre-stressed Single'
        },
        {
            id: 2, batchNo: 610, chamberNo: 2, benchNo: 415, sequence: 'B',
            cubeNo: '415B', grade: 'M60', castDate: '2026-01-21',
            lbcTime: '11:15', benchesInChamber: '415, 416, 417',
            sleeperType: 'Pre-stressed Twin'
        }
    ]);

    const [testedRecords, setTestedRecords] = useState([
        {
            id: 101, batchNo: 609, chamberNo: 5, benchesInChamber: '501, 502',
            cubeNo: '501C', grade: 'M55', strength: 42.5,
            testDate: '2026-01-22', testTime: '08:00', entryTime: new Date(Date.now() - 30 * 60000).toISOString()
        },
        {
            id: 102, batchNo: 608, chamberNo: 3, benchesInChamber: '305',
            cubeNo: '305A', grade: 'M60', strength: 48.2,
            testDate: '2026-01-21', testTime: '16:45', entryTime: new Date(Date.now() - 2 * 3600000).toISOString()
        }
    ]);

    // Add Form State
    const [addForm, setAddForm] = useState({
        batchNo: '',
        chamberNo: '',
        benchNo: '',
        sequence: 'A',
        grade: 'M55',
        castDate: new Date().toISOString().split('T')[0],
        lbcTime: '',
        benchesInChamber: ''
    });

    // Test Detail Form State
    const [testForm, setTestForm] = useState({
        testDate: new Date().toISOString().split('T')[0],
        testTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        weight: '',
        load: ''
    });

    // Calculations
    const calculatedCubeNo = `${addForm.benchNo}${addForm.sequence}`;
    const calculatedStrength = useMemo(() => {
        if (!testForm.load) return '0.00';
        // Mock area for calculation (Cube 150x150mm = 22500 mm2)
        const area = 22500;
        return ((parseFloat(testForm.load) * 1000) / area).toFixed(2);
    }, [testForm.load]);

    const calculatedAge = useMemo(() => {
        if (!selectedSample || !testForm.testDate || !testForm.testTime) return '0';
        const start = new Date(`${selectedSample.castDate}T${selectedSample.lbcTime}`);
        const end = new Date(`${testForm.testDate}T${testForm.testTime}`);
        const diff = (end - start) / 3600000;
        return diff > 0 ? diff.toFixed(1) : '0';
    }, [selectedSample, testForm.testDate, testForm.testTime]);

    const handleAddSample = () => {
        const newSample = {
            id: Date.now(),
            ...addForm,
            cubeNo: calculatedCubeNo,
            sleeperType: addForm.sequence <= 'D' ? 'Single' : 'Twin' // Simplification
        };
        setDeclaredSamples([...declaredSamples, newSample]);
        setShowAddForm(false);
        setAddForm({
            batchNo: '', chamberNo: '', benchNo: '', sequence: 'A',
            grade: 'M55', castDate: new Date().toISOString().split('T')[0],
            lbcTime: '', benchesInChamber: ''
        });
    };

    const handleSaveTest = () => {
        const newTested = {
            id: Date.now(),
            batchNo: selectedSample.batchNo,
            chamberNo: selectedSample.chamberNo,
            benchesInChamber: selectedSample.benchesInChamber,
            cubeNo: selectedSample.cubeNo,
            grade: selectedSample.grade,
            strength: parseFloat(calculatedStrength),
            testDate: testForm.testDate,
            testTime: testForm.testTime,
            entryTime: new Date().toISOString()
        };
        setTestedRecords([newTested, ...testedRecords]);
        setDeclaredSamples(declaredSamples.filter(s => s.id !== selectedSample.id));
        setShowTestForm(false);
        setSelectedSample(null);
    };

    const isEditable = (entryTime) => {
        const diff = (new Date() - new Date(entryTime)) / 3600000;
        return diff < 1;
    };

    const getResultStatus = (grade, strength) => {
        const threshold = grade === 'M55' ? 40 : 50;
        return strength >= threshold ? 'OK' : 'Not OK';
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px', width: '95vw' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h2 style={{ margin: 0 }}>Steam Cube Testing</h2>
                        <nav className="modal-tabs" style={{ border: 'none', padding: 0, margin: 0 }}>
                            <button className={`modal-tab-btn ${activeSection === 'declared' ? 'active' : ''}`} onClick={() => setActiveSection('declared')}>Samples Declared</button>
                            <button className={`modal-tab-btn ${activeSection === 'recent' ? 'active' : ''}`} onClick={() => setActiveSection('recent')}>Recent Testing Results</button>
                        </nav>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ minHeight: '500px' }}>

                    {activeSection === 'declared' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <button className="toggle-btn" onClick={() => setShowAddForm(true)}>+ Add Test Sample</button>
                            </div>

                            <div className="data-table-section" style={{ margin: 0 }}>
                                <div className="table-scroll-container">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Batch</th>
                                                <th>Chamber</th>
                                                <th>Cube No.</th>
                                                <th>Cast Date</th>
                                                <th>Grade</th>
                                                <th>Benches</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {declaredSamples.map(sample => (
                                                <tr key={sample.id}>
                                                    <td>{sample.batchNo}</td>
                                                    <td>{sample.chamberNo}</td>
                                                    <td style={{ fontWeight: '600' }}>{sample.cubeNo}</td>
                                                    <td>{sample.castDate}</td>
                                                    <td>{sample.grade}</td>
                                                    <td style={{ fontSize: '11px' }}>{sample.benchesInChamber}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button className="btn-action" onClick={() => { setSelectedSample(sample); setShowTestForm(true); }}>Enter Results</button>
                                                            <button className="btn-action secondary" style={{ fontSize: '10px' }}>Edit</button>
                                                            <button className="btn-action" style={{ background: 'var(--color-danger)', fontSize: '10px' }}>Del</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {declaredSamples.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No samples declared</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'recent' && (
                        <div className="fade-in">
                            <div className="data-table-section" style={{ margin: 0 }}>
                                <div className="table-scroll-container">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Batch</th>
                                                <th>Chamber</th>
                                                <th>Cube No.</th>
                                                <th>Grade</th>
                                                <th>Strength (N/mm²)</th>
                                                <th>Result</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {testedRecords.map(record => {
                                                const result = getResultStatus(record.grade, record.strength);
                                                const editable = isEditable(record.entryTime);
                                                return (
                                                    <tr key={record.id}>
                                                        <td>{record.batchNo}</td>
                                                        <td>{record.chamberNo}</td>
                                                        <td style={{ fontWeight: '600' }}>{record.cubeNo}</td>
                                                        <td>{record.grade}</td>
                                                        <td style={{ fontWeight: '700', color: result === 'OK' ? 'var(--color-success)' : 'var(--color-danger)' }}>{record.strength}</td>
                                                        <td>
                                                            <span className={`status-pill ${result === 'OK' ? 'witnessed' : 'manual'}`}>
                                                                {result}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {editable ? (
                                                                <button className="btn-action secondary" style={{ fontSize: '10px' }}>Edit</button>
                                                            ) : (
                                                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals for Add and Test */}
                {showAddForm && (
                    <div className="modal-overlay" style={{ zIndex: 1100 }}>
                        <div className="modal-content" style={{ maxWidth: '600px' }}>
                            <header className="modal-header">
                                <h3>Declare New Cube Sample</h3>
                                <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                            </header>
                            <div className="modal-body">
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-field">
                                        <label>Batch Number</label>
                                        <input type="number" value={addForm.batchNo} onChange={e => setAddForm({ ...addForm, batchNo: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Chamber Number</label>
                                        <input type="number" value={addForm.chamberNo} onChange={e => setAddForm({ ...addForm, chamberNo: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Bench Number</label>
                                        <input type="number" value={addForm.benchNo} onChange={e => setAddForm({ ...addForm, benchNo: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Sleeper Sequence</label>
                                        <select value={addForm.sequence} onChange={e => setAddForm({ ...addForm, sequence: e.target.value })}>
                                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                            <option value="E">E</option><option value="F">F</option><option value="G">G</option><option value="H">H</option>
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Cube Number (Auto)</label>
                                        <input type="text" value={calculatedCubeNo} readOnly style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-field">
                                        <label>Concrete Grade</label>
                                        <select value={addForm.grade} onChange={e => setAddForm({ ...addForm, grade: e.target.value })}>
                                            <option value="M55">M55</option>
                                            <option value="M60">M60</option>
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Date of Casting</label>
                                        <input type="date" value={addForm.castDate} onChange={e => setAddForm({ ...addForm, castDate: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>LBC Time</label>
                                        <input type="time" value={addForm.lbcTime} onChange={e => setAddForm({ ...addForm, lbcTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-field" style={{ marginTop: '1rem' }}>
                                    <label>Benches in Chamber (Comma separated)</label>
                                    <input type="text" placeholder="e.g. 401, 402, 403" value={addForm.benchesInChamber} onChange={e => setAddForm({ ...addForm, benchesInChamber: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button className="toggle-btn" onClick={handleAddSample}>Declare Sample</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showTestForm && selectedSample && (
                    <div className="modal-overlay" style={{ zIndex: 1100 }}>
                        <div className="modal-content" style={{ maxWidth: '700px' }}>
                            <header className="modal-header">
                                <h3>Enter Test Details - Cube {selectedSample.cubeNo}</h3>
                                <button className="close-btn" onClick={() => setShowTestForm(false)}>×</button>
                            </header>
                            <div className="modal-body">
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    <div><span className="mini-label">Batch</span><div style={{ fontWeight: '600' }}>{selectedSample.batchNo}</div></div>
                                    <div><span className="mini-label">Chamber</span><div style={{ fontWeight: '600' }}>{selectedSample.chamberNo}</div></div>
                                    <div><span className="mini-label">Grade</span><div style={{ fontWeight: '600' }}>{selectedSample.grade}</div></div>
                                </div>

                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <div className="form-field">
                                        <label>Date of Testing</label>
                                        <input type="date" value={testForm.testDate} onChange={e => setTestForm({ ...testForm, testDate: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Time of Testing</label>
                                        <input type="time" value={testForm.testTime} onChange={e => setTestForm({ ...testForm, testTime: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Age in Hrs (Auto)</label>
                                        <input type="text" value={calculatedAge} readOnly style={{ background: '#f8fafc', fontWeight: 'bold' }} />
                                    </div>
                                    <div className="form-field">
                                        <label>Weight (Kgs)</label>
                                        <input type="number" step="0.01" value={testForm.weight} onChange={e => setTestForm({ ...testForm, weight: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Load (KN)</label>
                                        <input type="number" step="0.1" value={testForm.load} onChange={e => setTestForm({ ...testForm, load: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Strength (N/mm²)</label>
                                        <input type="text" value={calculatedStrength} readOnly style={{ background: '#f1f5f9', fontWeight: 'bold', color: 'var(--primary-color)' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button className="toggle-btn" onClick={handleSaveTest}>Save & Move to Tested</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export Stat Component for App.jsx
export const SteamCubeStats = ({ records }) => {
    const categories = ['M55', 'M60'];

    const getStatsForGrade = (grade) => {
        const filtered = records.filter(r => r.grade === grade);
        if (!filtered.length) return null;

        const strengths = filtered.map(r => r.strength);
        const min = Math.min(...strengths);
        const max = Math.max(...strengths);
        const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;

        const threshold = grade === 'M55' ? 40 : 50;
        const unsatisfactory = filtered.filter(r => r.strength < threshold).length;
        const belowAvg = filtered.filter(r => r.strength < avg).length;

        return { min, max, avg, unsatisfactory, belowAvgPct: ((belowAvg / filtered.length) * 100).toFixed(1) };
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {categories.map(grade => {
                const stats = getStatsForGrade(grade);
                return (
                    <div key={grade} className="collapsible-section" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>GRADE {grade} STATS</span>
                            <span>{records.filter(r => r.grade === grade).length} Records</span>
                        </div>
                        {stats ? (
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                <div className="calc-card">
                                    <span className="mini-label">Min Strength</span>
                                    <div className="calc-value" style={{ fontSize: '1rem' }}>{stats.min.toFixed(1)}</div>
                                </div>
                                <div className="calc-card">
                                    <span className="mini-label">Max Strength</span>
                                    <div className="calc-value" style={{ fontSize: '1rem' }}>{stats.max.toFixed(1)}</div>
                                </div>
                                <div className="calc-card">
                                    <span className="mini-label">Avg Strength</span>
                                    <div className="calc-value" style={{ fontSize: '1rem' }}>{stats.avg.toFixed(1)}</div>
                                </div>
                                <div className="calc-card" style={{ gridColumn: 'span 2' }}>
                                    <span className="mini-label">Unsatisfactory Results</span>
                                    <div className="calc-value" style={{ fontSize: '1rem', color: stats.unsatisfactory > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                        {stats.unsatisfactory}
                                    </div>
                                </div>
                                <div className="calc-card">
                                    <span className="mini-label">Below Avg %</span>
                                    <div className="calc-value" style={{ fontSize: '1rem' }}>{stats.belowAvgPct}%</div>
                                </div>
                            </div>
                        ) : <div style={{ fontSize: '11px', color: '#94a3b8', padding: '10px' }}>No records for {grade}</div>}
                    </div>
                );
            })}
        </div>
    );
};

export default SteamCubeTesting;

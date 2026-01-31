import React, { useState, useMemo, useEffect } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * SteamCubeStats Component
 */
export const SteamCubeStats = ({ records }) => {
    const grades = ['M55', 'M60'];
    const thresholds = { 'M55': 40, 'M60': 50 };

    const calculateStats = (grade) => {
        const filtered = records.filter(r => r.grade === grade);
        if (filtered.length === 0) return null;

        const strengths = filtered.map(r => parseFloat(r.strength));
        const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        const unsatisfactory = filtered.filter(r => parseFloat(r.strength) < thresholds[grade]).length;
        const belowAvg = strengths.filter(s => s < avg).length;

        return {
            min: Math.min(...strengths).toFixed(2),
            max: Math.max(...strengths).toFixed(2),
            avg: avg.toFixed(2),
            unsatisfactory,
            belowAvgPct: ((belowAvg / strengths.length) * 100).toFixed(1)
        };
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {grades.map(grade => {
                const stats = calculateStats(grade);
                if (!stats) return (
                    <div key={grade} className="calc-card" style={{ opacity: 0.6 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>{grade} Statistics</h4>
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>No data available</p>
                    </div>
                );
                return (
                    <div key={grade} className="calc-card" style={{ borderLeft: `4px solid ${grade === 'M55' ? '#10b981' : '#3b82f6'}` }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>{grade} Category</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <span className="mini-label">Min Strength</span>
                                <div className="calc-value" style={{ fontSize: '1.25rem' }}>{stats.min}</div>
                            </div>
                            <div>
                                <span className="mini-label">Max Strength</span>
                                <div className="calc-value" style={{ fontSize: '1.25rem' }}>{stats.max}</div>
                            </div>
                            <div>
                                <span className="mini-label">Avg Strength</span>
                                <div className="calc-value" style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>{stats.avg}</div>
                            </div>
                            <div>
                                <span className="mini-label">Unsatisfactory</span>
                                <div className="calc-value" style={{ fontSize: '1.25rem', color: stats.unsatisfactory > 0 ? '#ef4444' : '#10b981' }}>{stats.unsatisfactory}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#64748b' }}>
                            <span style={{ fontWeight: '600' }}>{stats.belowAvgPct}%</span> of results below average
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const SteamCubeTesting = ({ onBack, testedRecords: propTestedRecords, setTestedRecords: propSetTestedRecords }) => {
    // Mock initial data for samples
    const [samples, setSamples] = useState([
        { id: 1, batchNo: 610, chamberNo: 1, benchNo: 401, sequence: 'A', cubeNo: '401A', castDate: '2026-01-29', lbcTime: '10:30', grade: 'M55', benchesInChamber: '401, 402', sleeperType: 'RT-1' },
        { id: 2, batchNo: 611, chamberNo: 2, benchNo: 405, sequence: 'H', cubeNo: '405H', castDate: '2026-01-30', lbcTime: '09:15', grade: 'M60', benchesInChamber: '405, 406, 407, 408', sleeperType: 'RT-2' }
    ]);

    const [localTestedRecords, setLocalTestedRecords] = useState([
        { id: 101, batchNo: 608, chamberNo: 3, benchesInChamber: '301, 302', cubeNo: '301B', grade: 'M55', strength: '42.5', testDate: '2026-01-30', testTime: '11:00', weight: '8.1', load: '956', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
    ]);

    const testedRecords = propTestedRecords || localTestedRecords;
    const setTestedRecords = propSetTestedRecords || setLocalTestedRecords;

    const [selectedBatch, setSelectedBatch] = useState('All');

    // Form States
    const [sampleForm, setSampleForm] = useState({
        batchNo: '', chamberNo: '', benchNo: '', sequence: 'A', castDate: new Date().toISOString().split('T')[0], lbcTime: '', grade: 'M55', benchesInChamber: '', sleeperType: 'RT-1'
    });

    const [testForm, setTestForm] = useState({
        testDate: new Date().toISOString().split('T')[0], testTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), weight: '', load: '', strength: ''
    });

    const [selectedSampleForTest, setSelectedSampleForTest] = useState(null);
    const [editingRecordId, setEditingRecordId] = useState(null);

    useEffect(() => {
        if (testForm.load && !isNaN(testForm.load)) {
            const strength = (parseFloat(testForm.load) * 1000 / 22500).toFixed(2);
            setTestForm(prev => ({ ...prev, strength }));
        }
    }, [testForm.load]);

    const handleDeclareSample = () => {
        if (!sampleForm.batchNo || !sampleForm.benchNo) {
            alert('Required fields missing');
            return;
        }
        const cubeNo = `${sampleForm.benchNo}${sampleForm.sequence}`;
        const newSample = {
            ...sampleForm,
            id: Date.now(),
            cubeNo
        };
        setSamples(prev => [...prev, newSample]);
        setSampleForm({ batchNo: '', chamberNo: '', benchNo: '', sequence: 'A', castDate: new Date().toISOString().split('T')[0], lbcTime: '', grade: 'M55', benchesInChamber: '', sleeperType: 'RT-1' });
    };

    const handleSaveTestResult = () => {
        if (!selectedSampleForTest || !testForm.load) {
            alert('Please select a sample and enter test data');
            return;
        }

        const newRecord = {
            ...selectedSampleForTest,
            ...testForm,
            id: editingRecordId || Date.now(),
            timestamp: new Date().toISOString(),
            source: 'Manual'
        };

        if (editingRecordId) {
            setTestedRecords(prev => prev.map(r => r.id === editingRecordId ? newRecord : r));
            setEditingRecordId(null);
        } else {
            setTestedRecords(prev => [newRecord, ...prev]);
            setSamples(prev => prev.filter(s => s.id !== selectedSampleForTest.id));
        }

        setSelectedSampleForTest(null);
        setTestForm({ testDate: new Date().toISOString().split('T')[0], testTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), weight: '', load: '', strength: '' });
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (8 * 60 * 60 * 1000); // 8 hours
    };

    const handleEditResult = (record) => {
        setEditingRecordId(record.id);
        setSelectedSampleForTest(record);
        setTestForm({
            testDate: record.testDate,
            testTime: record.testTime,
            weight: record.weight,
            load: record.load,
            strength: record.strength
        });
        const manualSection = document.getElementById('manual-entry-section');
        if (manualSection) manualSection.scrollIntoView({ behavior: 'smooth' });
    };

    const batches = ['All', ...new Set(samples.map(s => s.batchNo.toString()))];

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Steam Cube Testing Console</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Transfer Strength Verification</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select Batch:</span>
                            <select
                                className="dash-select"
                                style={{ margin: 0, width: '100px' }}
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                            >
                                {batches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    <CollapsibleSection title="SCADA Data Fetched (Pending Samples)" defaultOpen={true}>
                        <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Declare New Sample</h4>
                            <div className="form-grid">
                                <div className="form-field"><label>Batch Number</label><input type="number" value={sampleForm.batchNo} onChange={e => setSampleForm({ ...sampleForm, batchNo: e.target.value })} /></div>
                                <div className="form-field"><label>Bench Number</label><input type="number" value={sampleForm.benchNo} onChange={e => setSampleForm({ ...sampleForm, benchNo: e.target.value })} /></div>
                                <div className="form-field">
                                    <label>Sleeper Sequence</label>
                                    <select value={sampleForm.sequence} onChange={e => setSampleForm({ ...sampleForm, sequence: e.target.value })}>
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Concrete Grade</label>
                                    <select value={sampleForm.grade} onChange={e => setSampleForm({ ...sampleForm, grade: e.target.value })}>
                                        <option value="M55">M55</option>
                                        <option value="M60">M60</option>
                                    </select>
                                </div>
                                <div className="form-actions-center" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                                    <button className="toggle-btn" onClick={handleDeclareSample}>Declare Sample</button>
                                </div>
                            </div>
                        </div>

                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Cube No</th><th>Batch</th><th>Chamber</th><th>Casting Date</th><th>Grade</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {samples.filter(s => selectedBatch === 'All' || s.batchNo.toString() === selectedBatch).length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No pending samples declared.</td></tr>
                                    ) : (
                                        samples.filter(s => selectedBatch === 'All' || s.batchNo.toString() === selectedBatch).map(s => (
                                            <tr key={s.id}>
                                                <td data-label="Cube"><strong>{s.cubeNo}</strong></td>
                                                <td data-label="Batch">{s.batchNo}</td>
                                                <td data-label="Chamber">{s.chamberNo}</td>
                                                <td data-label="Date">{s.castDate}</td>
                                                <td data-label="Grade">{s.grade}</td>
                                                <td data-label="Action">
                                                    <button className="btn-action" onClick={() => setSelectedSampleForTest(s)}>Test Sample</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Scada Witness / Manual Data Entry" defaultOpen={true} id="manual-entry-section">
                        {!selectedSampleForTest ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b', marginBottom: '2rem' }}>
                                Select a sample from the list above to enter results.
                            </div>
                        ) : (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }} className="fade-in">
                                <h4 style={{ margin: '0 0 1rem 0' }}>Results for Cube: {selectedSampleForTest.cubeNo}</h4>
                                <div className="form-grid">
                                    <div className="form-field"><label>Weight (Kgs)</label><input type="number" step="0.001" value={testForm.weight} onChange={e => setTestForm({ ...testForm, weight: e.target.value })} /></div>
                                    <div className="form-field"><label>Load (KN)</label><input type="number" step="0.1" value={testForm.load} onChange={e => setTestForm({ ...testForm, load: e.target.value })} /></div>
                                    <div className="form-field"><label>Strength (N/mm²)</label><input type="number" step="0.01" value={testForm.strength} onChange={e => setTestForm({ ...testForm, strength: e.target.value })} /></div>
                                    <div className="form-field"><label>Test Time</label><input type="time" value={testForm.testTime} onChange={e => setTestForm({ ...testForm, testTime: e.target.value })} /></div>
                                    <div className="form-actions-center" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                        <button className="toggle-btn" onClick={handleSaveTestResult}>{editingRecordId ? 'Update Result' : 'Save Test Result'}</button>
                                        <button className="toggle-btn secondary" onClick={() => setSelectedSampleForTest(null)} style={{ marginLeft: '1rem' }}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Cube No</th><th>Batch</th><th>Grade</th><th>Load</th><th>Strength</th><th>Result</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testedRecords.length === 0 ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No tested results yet.</td></tr>
                                    ) : (
                                        testedRecords.map(t => (
                                            <tr key={t.id}>
                                                <td data-label="Cube"><strong>{t.cubeNo}</strong></td>
                                                <td data-label="Batch">{t.batchNo}</td>
                                                <td data-label="Grade">{t.grade}</td>
                                                <td data-label="Load">{t.load} KN</td>
                                                <td data-label="Strength">{t.strength} N/mm²</td>
                                                <td data-label="Result">
                                                    <span className={`status-pill ${parseFloat(t.strength) >= (t.grade === 'M55' ? 40 : 50) ? 'witnessed' : 'manual'}`}>
                                                        {parseFloat(t.strength) >= (t.grade === 'M55' ? 40 : 50) ? 'OK' : 'NOT OK'}
                                                    </span>
                                                </td>
                                                <td data-label="Action">
                                                    {isRecordEditable(t.timestamp) ? (
                                                        <button className="btn-action" onClick={() => handleEditResult(t)}>Edit</button>
                                                    ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
};

export default SteamCubeTesting;

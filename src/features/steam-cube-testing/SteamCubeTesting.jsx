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

const SteamCubeTesting = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('declared');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTestDetailsModal, setShowTestDetailsModal] = useState(null); // Sample being tested
    const [editingSample, setEditingSample] = useState(null); // Sample being edited

    // Mock initial data
    const [samples, setSamples] = useState([
        { id: 1, batchNo: 610, chamberNo: 1, benchNo: 401, sequence: 'A', cubeNo: '401A', castDate: '2026-01-29', lbcTime: '10:30', grade: 'M55', benchesInChamber: '401, 402', sleeperType: 'RT-1' },
        { id: 2, batchNo: 611, chamberNo: 2, benchNo: 405, sequence: 'H', cubeNo: '405H', castDate: '2026-01-30', lbcTime: '09:15', grade: 'M60', benchesInChamber: '405, 406, 407, 408', sleeperType: 'RT-2' }
    ]);

    const [testedRecords, setTestedRecords] = useState([
        { id: 101, batchNo: 608, chamberNo: 3, benchesInChamber: '301, 302', cubeNo: '301B', grade: 'M55', strength: '42.5', testDate: '2026-01-30', testTime: '11:00', weight: '8.1', load: '956', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
    ]);

    // Form States
    const [sampleForm, setSampleForm] = useState({
        batchNo: '', chamberNo: '', benchNo: '', sequence: 'A', castDate: new Date().toISOString().split('T')[0], lbcTime: '', grade: 'M55', benchesInChamber: '', sleeperType: 'RT-1'
    });

    const [testForm, setTestForm] = useState({
        testDate: new Date().toISOString().split('T')[0], testTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), weight: '', load: '', strength: ''
    });

    // Auto calculate age
    const ageHrs = useMemo(() => {
        if (!showTestDetailsModal) return 0;
        const castDateTime = new Date(`${showTestDetailsModal.castDate}T${showTestDetailsModal.lbcTime}`);
        const testDateTime = new Date(`${testForm.testDate}T${testForm.testTime}`);
        const diffMs = testDateTime - castDateTime;
        return (diffMs / (1000 * 60 * 60)).toFixed(1);
    }, [showTestDetailsModal, testForm.testDate, testForm.testTime]);

    // Auto calculate strength if load is entered (Standard 150mm cube implies Area = 22500 mm2)
    useEffect(() => {
        if (testForm.load && !isNaN(testForm.load)) {
            const strength = (parseFloat(testForm.load) * 1000 / 22500).toFixed(2);
            setTestForm(prev => ({ ...prev, strength }));
        }
    }, [testForm.load]);

    const handleAddOrUpdateSample = () => {
        const cubeNo = `${sampleForm.benchNo}${sampleForm.sequence}`;
        const newSample = {
            ...sampleForm,
            id: editingSample ? editingSample.id : Date.now(),
            cubeNo
        };

        if (editingSample) {
            setSamples(prev => prev.map(s => s.id === editingSample.id ? newSample : s));
            setEditingSample(null);
        } else {
            setSamples(prev => [...prev, newSample]);
        }

        setSampleForm({ batchNo: '', chamberNo: '', benchNo: '', sequence: 'A', castDate: new Date().toISOString().split('T')[0], lbcTime: '', grade: 'M55', benchesInChamber: '', sleeperType: 'RT-1' });
        setShowAddModal(false);
    };

    const handleDeleteSample = (id) => {
        if (window.confirm('Are you sure you want to delete this sample?')) {
            setSamples(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleSaveTestResult = () => {
        const newRecord = {
            ...showTestDetailsModal,
            ...testForm,
            ageHrs,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };

        setTestedRecords(prev => [newRecord, ...prev]);
        setSamples(prev => prev.filter(s => s.id !== showTestDetailsModal.id));
        setShowTestDetailsModal(null);
        setTestForm({ testDate: new Date().toISOString().split('T')[0], testTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), weight: '', load: '', strength: '' });
        setActiveTab('tested');
    };

    const getTestResult = (grade, strength) => {
        const threshold = grade === 'M55' ? 40 : 50;
        return parseFloat(strength) >= threshold ? 'OK' : 'Not OK';
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (60 * 60 * 1000); // 1 hour
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Steam Cube Testing</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Transfer Strength Verification</p>
                        </div>
                        <nav className="modal-tabs" style={{ border: 'none', margin: 0 }}>
                            <button className={`modal-tab-btn ${activeTab === 'declared' ? 'active' : ''}`} onClick={() => setActiveTab('declared')}>Test Sample Declared</button>
                            <button className={`modal-tab-btn ${activeTab === 'tested' ? 'active' : ''}`} onClick={() => setActiveTab('tested')}>Recent Testing Results</button>
                        </nav>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    <SteamCubeStats records={testedRecords} />

                    {activeTab === 'declared' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Declared Samples List</h3>
                                <button className="toggle-btn" onClick={() => setShowAddModal(true)}>+ Add Test Sample</button>
                            </div>

                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Batch No</th>
                                            <th>Chamber No</th>
                                            <th>Cube No</th>
                                            <th>Date of Casting</th>
                                            <th>Type & Grade</th>
                                            <th>Benches in Chamber</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {samples.map(s => (
                                            <tr key={s.id}>
                                                <td data-label="Batch">{s.batchNo}</td>
                                                <td data-label="Chamber">{s.chamberNo}</td>
                                                <td data-label="Cube No."><strong>{s.cubeNo}</strong></td>
                                                <td data-label="Casting Date">{s.castDate}</td>
                                                <td data-label="Type/Grade">{s.sleeperType} / {s.grade}</td>
                                                <td data-label="Benches">{s.benchesInChamber}</td>
                                                <td data-label="Actions">
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="btn-action" onClick={() => { setEditingSample(s); setSampleForm(s); setShowAddModal(true); }}>Edit</button>
                                                        <button className="btn-action" style={{ background: '#fee2e2', color: '#dc2626' }} onClick={() => handleDeleteSample(s.id)}>Delete</button>
                                                        <button className="btn-action" style={{ background: '#dcfce7', color: '#166534' }} onClick={() => setShowTestDetailsModal(s)}>Enter Results</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tested' && (
                        <div className="fade-in">
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Successfully Tested Samples</h3>
                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Batch</th>
                                            <th>Chamber</th>
                                            <th>Benches</th>
                                            <th>Cube No</th>
                                            <th>Grade</th>
                                            <th>Strength</th>
                                            <th>Result</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testedRecords.map(t => (
                                            <tr key={t.id}>
                                                <td data-label="Batch">{t.batchNo}</td>
                                                <td data-label="Chamber">{t.chamberNo}</td>
                                                <td data-label="Benches">{t.benchesInChamber}</td>
                                                <td data-label="Cube No.">{t.cubeNo}</td>
                                                <td data-label="Grade">{t.grade}</td>
                                                <td data-label="Strength"><strong>{t.strength} N/mm²</strong></td>
                                                <td data-label="Result">
                                                    <span className={`status-pill ${getTestResult(t.grade, t.strength) === 'OK' ? 'witnessed' : 'manual'}`}>
                                                        {getTestResult(t.grade, t.strength)}
                                                    </span>
                                                </td>
                                                <td data-label="Action">
                                                    {isRecordEditable(t.timestamp) ? (
                                                        <button className="btn-action" onClick={() => {
                                                            // Logic to move back to declared or direct edit
                                                            alert('Edit functionality (within 1h window) active');
                                                        }}>Edit</button>
                                                    ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Sample Modal */}
                {showAddModal && (
                    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1100 }}>
                        <div className="modal-content" style={{ maxWidth: '600px' }}>
                            <header className="modal-header">
                                <h3>{editingSample ? 'Edit Test Sample' : 'Declare New Test Sample'}</h3>
                                <button className="close-btn" onClick={() => { setShowAddModal(false); setEditingSample(null); }}>×</button>
                            </header>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-field"><label>Batch Number</label><input type="number" value={sampleForm.batchNo} onChange={e => setSampleForm({ ...sampleForm, batchNo: e.target.value })} /></div>
                                    <div className="form-field"><label>Chamber Number</label><input type="number" value={sampleForm.chamberNo} onChange={e => setSampleForm({ ...sampleForm, chamberNo: e.target.value })} /></div>
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
                                    <div className="form-field"><label>Date of Casting</label><input type="date" value={sampleForm.castDate} onChange={e => setSampleForm({ ...sampleForm, castDate: e.target.value })} /></div>
                                    <div className="form-field"><label>LBC Time</label><input type="time" value={sampleForm.lbcTime} onChange={e => setSampleForm({ ...sampleForm, lbcTime: e.target.value })} /></div>
                                    <div className="form-field" style={{ gridColumn: 'span 2' }}>
                                        <label>Benches in Chamber (Comma separated)</label>
                                        <input type="text" placeholder="e.g. 401, 402, 403" value={sampleForm.benchesInChamber} onChange={e => setSampleForm({ ...sampleForm, benchesInChamber: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-actions-center" style={{ marginTop: '1.5rem' }}>
                                    <button className="toggle-btn" onClick={handleAddOrUpdateSample}>{editingSample ? 'Update Sample' : 'Declare Sample'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enter Test Details Modal */}
                {showTestDetailsModal && (
                    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1100 }}>
                        <div className="modal-content" style={{ maxWidth: '800px' }}>
                            <header className="modal-header">
                                <h3>Enter Test Details: Cube {showTestDetailsModal.cubeNo}</h3>
                                <button className="close-btn" onClick={() => setShowTestDetailsModal(null)}>×</button>
                            </header>
                            <div className="modal-body">
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div><span className="mini-label">Batch</span><div>{showTestDetailsModal.batchNo}</div></div>
                                    <div><span className="mini-label">Grade</span><div>{showTestDetailsModal.grade}</div></div>
                                    <div><span className="mini-label">Cast Date</span><div>{showTestDetailsModal.castDate}</div></div>
                                    <div><span className="mini-label">LBC Time</span><div>{showTestDetailsModal.lbcTime}</div></div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-field"><label>Date of Testing</label><input type="date" value={testForm.testDate} onChange={e => setTestForm({ ...testForm, testDate: e.target.value })} /></div>
                                    <div className="form-field"><label>Time of Testing</label><input type="time" value={testForm.testTime} onChange={e => setTestForm({ ...testForm, testTime: e.target.value })} /></div>
                                    <div className="form-field"><label>Age (Hrs)</label><input type="text" value={ageHrs} readOnly style={{ background: '#f1f5f9' }} /></div>
                                    <div className="form-field"><label>Weight (Kgs)</label><input type="number" step="0.001" value={testForm.weight} onChange={e => setTestForm({ ...testForm, weight: e.target.value })} /></div>
                                    <div className="form-field"><label>Load (KN)</label><input type="number" step="0.1" value={testForm.load} onChange={e => setTestForm({ ...testForm, load: e.target.value })} /></div>
                                    <div className="form-field"><label>Strength (N/mm²)</label><input type="number" step="0.01" value={testForm.strength} onChange={e => setTestForm({ ...testForm, strength: e.target.value })} /></div>
                                </div>
                                <div className="form-actions-center" style={{ marginTop: '1.5rem' }}>
                                    <button className="toggle-btn" style={{ minWidth: '200px' }} onClick={handleSaveTestResult}>Save Testing Result</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SteamCubeTesting;


import React, { useState, useMemo, useEffect } from 'react';
import EnhancedDataTable from '../../components/common/EnhancedDataTable';
import './SteamCubeTesting.css';

const SteamCubeTesting = ({ onBack, testedRecords: propTestedRecords, setTestedRecords: propSetTestedRecords }) => {
    const [viewMode, setViewMode] = useState('statistics'); // 'statistics', 'declared', 'tested'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [isModifying, setIsModifying] = useState(false);

    // Mock initial data for samples declared but not yet tested
    const [declaredSamples, setDeclaredSamples] = useState([
        { id: 1, batchNo: 610, chamberNo: 1, benchNo: 401, sequence: 'A', cubeNo: '401A', castDate: '2026-01-29', lbcTime: '10:30', grade: 'M55', sleeperType: 'RT-1', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 2, batchNo: 611, chamberNo: 2, benchNo: 405, sequence: 'H', cubeNo: '405H', castDate: '2026-01-30', lbcTime: '09:15', grade: 'M60', sleeperType: 'RT-2', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
    ]);

    const [localTestedRecords, setLocalTestedRecords] = useState([
        {
            id: 101, batchNo: 608, chamberNo: 3, cubeNo: '301B', grade: 'M55', strength: '42.50', weight: '8.1', load: '956',
            testDate: '2026-01-30', testTime: '11:00', result: 'PASS', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
    ]);

    const testedRecords = propTestedRecords || localTestedRecords;
    const setTestedRecords = propSetTestedRecords || setLocalTestedRecords;

    // Statistics Calculation
    const stats = useMemo(() => {
        const allTests = testedRecords;
        const totalTests = allTests.length;
        const strengths = allTests.map(r => parseFloat(r.strength)).filter(s => !isNaN(s));

        const avgStrength = strengths.length > 0 ? (strengths.reduce((a, b) => a + b, 0) / strengths.length).toFixed(2) : '0.00';
        const minStrength = strengths.length > 0 ? Math.min(...strengths).toFixed(2) : '0.00';
        const maxStrength = strengths.length > 0 ? Math.max(...strengths).toFixed(2) : '0.00';
        const passRate = totalTests > 0 ? ((allTests.filter(t => t.result === 'PASS').length / totalTests) * 100).toFixed(1) : '0.0';

        const m55Tests = allTests.filter(t => t.grade === 'M55');
        const m60Tests = allTests.filter(t => t.grade === 'M60');

        return {
            totalDeclared: declaredSamples.length,
            totalTests,
            avgStrength,
            minStrength,
            maxStrength,
            passRate,
            m55Count: m55Tests.length,
            m60Count: m60Tests.length,
            lastTest: allTests.length > 0 ? allTests[0].testDate : 'N/A'
        };
    }, [declaredSamples, testedRecords]);

    const isWithinHour = (isoString) => {
        if (!isoString) return false;
        const diff = Date.now() - new Date(isoString).getTime();
        return diff < (60 * 60 * 1000);
    };

    const handleAddSample = () => {
        setSelectedSample(null);
        setIsModifying(false);
        setShowDeclareModal(true);
    };

    const handleModifySample = (sample) => {
        setSelectedSample(sample);
        setIsModifying(true);
        setShowDeclareModal(true);
    };

    const handleEnterTestDetails = (sample) => {
        setSelectedSample(sample);
        setShowTestModal(true);
    };

    const saveDeclaration = (formData) => {
        if (isModifying) {
            setDeclaredSamples(prev => prev.map(s => s.id === selectedSample.id ? { ...s, ...formData } : s));
        } else {
            const newSample = {
                ...formData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            setDeclaredSamples(prev => [newSample, ...prev]);
        }
        setShowDeclareModal(false);
    };

    const handleEditTest = (record) => {
        setSelectedSample(record);
        setIsModifying(true);
        setShowTestModal(true);
    };

    const saveTestDetails = (testData) => {
        const completedTest = {
            ...selectedSample,
            ...testData,
            timestamp: selectedSample.timestamp || new Date().toISOString()
        };

        if (isModifying) {
            setTestedRecords(prev => prev.map(r => r.id === selectedSample.id ? completedTest : r));
        } else {
            setTestedRecords(prev => [completedTest, ...prev]);
            setDeclaredSamples(prev => prev.filter(s => s.id !== selectedSample.id));
        }

        setShowTestModal(false);
        setIsModifying(false);
    };

    const handleDeleteTest = (id) => {
        if (window.confirm('Are you sure you want to delete this test record?')) {
            setTestedRecords(prev => prev.filter(r => r.id !== id));
        }
    };

    const columnsDeclared = [
        { key: 'cubeNo', label: 'Cube No' },
        { key: 'batchNo', label: 'Batch No' },
        { key: 'chamberNo', label: 'Chamber' },
        { key: 'castDate', label: 'Casting Date' },
        { key: 'grade', label: 'Grade' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {isWithinHour(row.createdAt) && (
                        <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleModifySample(row)}>Modify</button>
                    )}
                    <button className="btn-verify" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleEnterTestDetails(row)}>Enter Test Details</button>
                </div>
            )
        }
    ];

    const columnsTested = [
        { key: 'cubeNo', label: 'Cube No' },
        { key: 'batchNo', label: 'Batch No' },
        { key: 'grade', label: 'Grade' },
        { key: 'load', label: 'Load (KN)' },
        { key: 'strength', label: 'Strength (N/mm²)' },
        {
            key: 'result',
            label: 'Result',
            render: (val) => (
                <span className={`status-pill ${val === 'PASS' ? 'witnessed' : 'manual'}`}>{val}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                isWithinHour(row.timestamp) ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleEditTest(row)}>Edit</button>
                        <button className="btn-action" style={{ fontSize: '10px', padding: '4px 8px', background: '#fee2e2', color: '#ef4444' }} onClick={() => handleDeleteTest(row.id)}>Delete</button>
                    </div>
                ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
            )
        }
    ];

    return (
        <div className="steam-cube-testing-module cement-forms-scope">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Steam Cube Testing Record</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Transfer strength verification for steam cured sleepers</p>
            </header>

            <div className="nav-tabs" style={{
                marginBottom: '24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div
                    className={`nav-tab-card ${viewMode === 'statistics' ? 'active' : ''}`}
                    onClick={() => setViewMode('statistics')}
                    style={cardTabStyle(viewMode === 'statistics', '#10b981')}
                >
                    <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>ANALYSIS</span>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>Statistics Dashboard</span>
                </div>
                <div
                    className={`nav-tab-card ${viewMode === 'declared' ? 'active' : ''}`}
                    onClick={() => setViewMode('declared')}
                    style={cardTabStyle(viewMode === 'declared', '#3b82f6')}
                >
                    <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>PENDING</span>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>Test Sample Declared</span>
                </div>
                <div
                    className={`nav-tab-card ${viewMode === 'tested' ? 'active' : ''}`}
                    onClick={() => setViewMode('tested')}
                    style={cardTabStyle(viewMode === 'tested', '#f59e0b')}
                >
                    <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8 }}>COMPLETED</span>
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>Recent Testing Done</span>
                </div>
            </div>

            <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease' }}>
                {viewMode === 'statistics' && (
                    <div className="fade-in">
                        <div className="steam-cube-stats-grid">
                            <StatCard label="Total Declared" value={stats.totalDeclared} />
                            <StatCard label="Total Tests" value={stats.totalTests} />
                            <StatCard label="Avg Strength" value={stats.avgStrength} unit="N/mm²" />
                            <StatCard label="Pass Rate" value={stats.passRate} unit="%" color={parseFloat(stats.passRate) > 95 ? '#10b981' : '#f59e0b'} />
                            <StatCard label="Min Strength" value={stats.minStrength} unit="N/mm²" />
                            <StatCard label="Max Strength" value={stats.maxStrength} unit="N/mm²" />
                            <StatCard label="M55 Tests" value={stats.m55Count} />
                            <StatCard label="M60 Tests" value={stats.m60Count} />
                            <StatCard label="Last Test Date" value={stats.lastTest} />
                        </div>

                        <div className="steam-cube-charts-grid">
                            <div className="steam-cube-chart-card">
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#1e293b', fontWeight: '800' }}>Strength Trend (Last 10 Tests)</h4>
                                <div className="steam-cube-bar-chart-container">
                                    {[45, 52, 48, 55, 60, 58, 49, 53, 57, 51].map((h, i) => (
                                        <div key={i} className="steam-cube-bar" style={{ height: `${(h / 70) * 100}%` }}>
                                            <span className="steam-cube-bar-label">{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="steam-cube-chart-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(#10b981 ${stats.passRate}%, #e2e8f0 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{stats.passRate}%</span>
                                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>PASS RATE</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></span><span style={{ fontSize: '12px', fontWeight: '600' }}>Pass</span></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: '#e2e8f0', borderRadius: '2px' }}></span><span style={{ fontSize: '12px', fontWeight: '600' }}>Fail</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'declared' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Pending Strength Verification</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Tested Samples Log (Transfer Strength)</h4>
                        </div>
                        <EnhancedDataTable columns={columnsTested} data={testedRecords} />
                    </div>
                )}
            </div>

            {showDeclareModal && (
                <SampleDeclarationModal
                    sample={selectedSample}
                    isModifying={isModifying}
                    onClose={() => setShowDeclareModal(false)}
                    onSave={saveDeclaration}
                />
            )}

            {showTestModal && (
                <TestDetailsModal
                    sample={selectedSample}
                    onClose={() => setShowTestModal(false)}
                    onSave={saveTestDetails}
                    isModifying={isModifying}
                />
            )}
        </div>
    );
};

const cardTabStyle = (active, color) => ({
    flex: '1 1 200px',
    padding: '16px 20px',
    background: active ? '#fff' : '#f8fafc',
    border: `1px solid ${active ? color : '#e2e8f0'}`,
    borderTop: `4px solid ${color}`,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: active ? `0 4px 12px ${color}20` : 'none',
    transform: active ? 'translateY(-2px)' : 'none'
});

const StatCard = ({ label, value, unit = '', color = '#1e293b' }) => (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color }}>{value} <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>{unit}</span></div>
    </div>
);

const SampleDeclarationModal = ({ sample, isModifying, onClose, onSave }) => {
    const [formData, setFormData] = useState(sample || {
        batchNo: '', chamberNo: '', benchNo: '', sequence: 'A', castDate: new Date().toISOString().split('T')[0], grade: 'M60', sleeperType: 'RT-1234'
    });

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify' : 'New'} Steam Cube Declaration</span>
                    <button className="form-modal-close" onClick={onClose}>X</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group"><label>Batch Number</label><input type="number" min="0" value={formData.batchNo} onChange={e => setFormData({ ...formData, batchNo: e.target.value })} /></div>
                        <div className="input-group"><label>Chamber Number</label><input type="number" min="0" value={formData.chamberNo} onChange={e => setFormData({ ...formData, chamberNo: e.target.value })} /></div>
                        <div className="input-group"><label>Bench Number</label><input type="number" min="0" value={formData.benchNo} onChange={e => setFormData({ ...formData, benchNo: e.target.value })} /></div>
                        <div className="input-group">
                            <label>Sleeper Sequence</label>
                            <select value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: e.target.value })}>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="input-group"><label>Casting Date</label><input type="date" value={formData.castDate} onChange={e => setFormData({ ...formData, castDate: e.target.value })} /></div>
                        <div className="input-group">
                            <label>Concrete Grade</label>
                            <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })}>
                                <option>M55</option><option>M60</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => onSave({ ...formData, cubeNo: `${formData.benchNo}${formData.sequence}` })}>
                            {isModifying ? 'Update Declaration' : 'Save Declaration'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TestDetailsModal = ({ sample, onClose, onSave, isModifying }) => {
    const [testData, setTestData] = useState({
        testDate: sample.testDate || new Date().toISOString().split('T')[0],
        testTime: sample.testTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        weight: sample.weight || '',
        load: sample.load || '',
        strength: sample.strength || ''
    });

    useEffect(() => {
        if (testData.load && !isNaN(testData.load)) {
            const strength = (parseFloat(testData.load) * 1000 / 22500).toFixed(2);
            setTestData(prev => ({ ...prev, strength }));
        }
    }, [testData.load]);

    const result = parseFloat(testData.strength) >= (sample.grade === 'M55' ? 40 : 50) ? 'PASS' : 'FAIL';

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter Strength Results: {sample.cubeNo}</span>
                    <button className="form-modal-close" onClick={onClose}>X</button>
                </div>
                <div className="form-modal-body">
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div><div style={{ fontSize: '10px', color: '#64748b' }}>Batch</div><div style={{ fontWeight: '700' }}>{sample.batchNo}</div></div>
                        <div><div style={{ fontSize: '10px', color: '#64748b' }}>Grade</div><div style={{ fontWeight: '700' }}>{sample.grade}</div></div>
                        <div><div style={{ fontSize: '10px', color: '#64748b' }}>Cast Date</div><div style={{ fontWeight: '700' }}>{sample.castDate}</div></div>
                    </div>
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group"><label>Weight (Kgs)</label><input type="number" step="0.001" value={testData.weight} onChange={e => setTestData({ ...testData, weight: e.target.value })} /></div>
                        <div className="input-group"><label>Load (KN)</label><input type="number" step="0.1" value={testData.load} onChange={e => setTestData({ ...testData, load: e.target.value })} /></div>
                        <div className="input-group"><label>Strength (N/mm²)</label><input readOnly value={testData.strength} style={{ background: '#f8fafc' }} /></div>
                        <div className="input-group"><label>Result</label><input readOnly value={testData.strength ? result : ''} style={{ color: result === 'PASS' ? '#10b981' : '#ef4444', fontWeight: '800', background: '#f8fafc' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => onSave({ ...testData, result })}>Save & Move to Tested</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SteamCubeTesting;

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
        {
            id: 1,
            lineNumber: 'Line-1',
            batchNo: 610,
            chamberNo: 1,
            castDate: '2026-01-29',
            castTime: '10:30',
            lbcTime: '10:30',
            grade: 'M-55',
            cubes: [
                { benchNo: 401, sequence: 'A', cubeNo: '401A' },
                { benchNo: 401, sequence: 'B', cubeNo: '401B' }
            ],
            otherBenches: [402, 403],
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            lineNumber: 'Shed-3',
            batchNo: 611,
            chamberNo: 2,
            castDate: '2026-01-30',
            castTime: '09:15',
            lbcTime: '09:15',
            grade: 'M-60',
            cubes: [
                { benchNo: 405, sequence: 'H', cubeNo: '405H' }
            ],
            otherBenches: [406],
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
    ]);

    const [localTestedRecords, setLocalTestedRecords] = useState([
        {
            id: 101,
            lineNumber: 'Line-1',
            batchNo: 608,
            chamberNo: 3,
            grade: 'M-55',
            castDate: '2026-01-30',
            castTime: '10:00',
            testDate: '2026-01-30',
            testTime: '11:00',
            cubeResults: [
                {
                    cubeNo: '301B',
                    weight: 8.1,
                    load: 956,
                    strength: 42.50,
                    ageHrs: 25.0
                }
            ],
            avgStrength: 42.50,
            result: 'OK',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
    ]);

    const testedRecords = propTestedRecords || localTestedRecords;
    const setTestedRecords = propSetTestedRecords || setLocalTestedRecords;

    // Statistics Calculation
    const stats = useMemo(() => {
        const allTests = testedRecords;
        const totalTests = allTests.length;
        const avgStrengths = allTests.map(r => parseFloat(r.avgStrength)).filter(s => !isNaN(s));

        const avgStrength = avgStrengths.length > 0 ? (avgStrengths.reduce((a, b) => a + b, 0) / avgStrengths.length).toFixed(2) : '0.00';
        const minStrength = avgStrengths.length > 0 ? Math.min(...avgStrengths).toFixed(2) : '0.00';
        const maxStrength = avgStrengths.length > 0 ? Math.max(...avgStrengths).toFixed(2) : '0.00';
        const passRate = totalTests > 0 ? ((allTests.filter(t => t.result === 'OK').length / totalTests) * 100).toFixed(1) : '0.0';

        return {
            totalDeclared: declaredSamples.length,
            totalTests,
            avgStrength,
            minStrength,
            maxStrength,
            passRate,
            lastTest: (allTests.length > 0 && allTests[0].testDate) ? allTests[0].testDate.split('-').reverse().join('/') : 'N/A'
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
        { key: 'lineNumber', label: 'Shed No. / Line No.' },
        { key: 'batchNo', label: 'Batch No.' },
        { key: 'chamberNo', label: 'Chamber No.' },
        {
            key: 'castDateTime',
            label: 'Date & Time of Casting',
            render: (_, row) => `${row.castDate ? row.castDate.split('-').reverse().join('/') : ''} ${row.castTime}`
        },
        { key: 'grade', label: 'Concrete Grade' },
        {
            key: 'cubeCount',
            label: 'No. of Cubes',
            render: (_, row) => row.cubes?.length || 0
        },
        {
            key: 'benches',
            label: 'Benches in Chamber',
            render: (_, row) => {
                const allBenches = [...new Set([
                    ...row.cubes.map(c => c.benchNo),
                    ...(row.otherBenches || [])
                ])].sort((a, b) => a - b);
                return allBenches.join(', ');
            }
        },
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
        { key: 'lineNumber', label: 'Shed No. / Line No.' },
        { key: 'batchNo', label: 'Batch No.' },
        { key: 'chamberNo', label: 'Chamber No.' },
        { key: 'grade', label: 'Concrete Grade' },
        {
            key: 'castDateTime',
            label: 'Date & Time of Casting',
            render: (_, row) => `${row.castDate ? row.castDate.split('-').reverse().join('/') : ''} ${row.castTime}`
        },
        {
            key: 'testDateTime',
            label: 'Date & Time of Testing',
            render: (_, row) => `${row.testDate ? row.testDate.split('-').reverse().join('/') : ''} ${row.testTime}`
        },
        {
            key: 'avgStrength',
            label: 'Strength (N/mm²)',
            render: (val) => parseFloat(val).toFixed(2)
        },
        {
            key: 'result',
            label: 'Result of Testing',
            render: (val) => (
                <span className={`status-pill ${val === 'OK' ? 'witnessed' : 'manual'}`}>{val}</span>
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
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>Witnessed Testing Log</span>
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
                            <h4 style={{ margin: 0, color: '#475569' }}>Declared Sample Table</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample Declaration</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Witnessed Log Table</h4>
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
        lineNumber: 'Line-1', // Auto from SCADA
        castDate: new Date().toISOString().split('T')[0],
        batchNo: '',
        lbcTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        grade: '',
        cubes: [],
        chamberNo: '',
        otherBenches: []
    });

    const [currentCube, setCurrentCube] = useState({ benchNo: '', sequence: '' });
    const [otherBenchInput, setOtherBenchInput] = useState('');

    const addCube = () => {
        if (currentCube.benchNo && currentCube.sequence) {
            const cubeNo = `${currentCube.benchNo}${currentCube.sequence}`;
            setFormData({
                ...formData,
                cubes: [...formData.cubes, { ...currentCube, cubeNo }]
            });
            setCurrentCube({ benchNo: '', sequence: '' });
        }
    };

    const removeCube = (index) => {
        setFormData({
            ...formData,
            cubes: formData.cubes.filter((_, i) => i !== index)
        });
    };

    const addOtherBench = () => {
        if (otherBenchInput && !formData.otherBenches.includes(parseInt(otherBenchInput))) {
            setFormData({
                ...formData,
                otherBenches: [...formData.otherBenches, parseInt(otherBenchInput)]
            });
            setOtherBenchInput('');
        }
    };

    const removeOtherBench = (bench) => {
        setFormData({
            ...formData,
            otherBenches: formData.otherBenches.filter(b => b !== bench)
        });
    };

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify' : 'New'} Sample Declaration</span>
                    <button className="form-modal-close" onClick={onClose}>X</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label>Shed No. / Line No.</label>
                            <input type="text" readOnly value={formData.lineNumber} className="readOnly" style={{ background: '#f8fafc' }} />
                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>Auto-filled from SCADA</span>
                        </div>
                        <div className="input-group">
                            <label>Date of Casting</label>
                            <input type="text" readOnly value={formData.castDate ? formData.castDate.split('-').reverse().join('/') : ''} style={{ background: '#f8fafc' }} />
                        </div>
                        <div className="input-group">
                            <label>Batch No.</label>
                            <input type="number" min="0" value={formData.batchNo} onChange={e => setFormData({ ...formData, batchNo: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>LBC Time</label>
                            <input type="time" value={formData.lbcTime} onChange={e => setFormData({ ...formData, lbcTime: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Concrete Grade</label>
                            <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })}>
                                <option value="">-- Select --</option>
                                <option>M-55</option>
                                <option>M-60</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Chamber No. <span style={{ fontSize: '9px', color: '#94a3b8' }}>(for Stress Bench)</span></label>
                            <input type="number" min="0" value={formData.chamberNo} onChange={e => setFormData({ ...formData, chamberNo: e.target.value })} />
                        </div>
                    </div>

                    {/* Cube Addition Section */}
                    <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', fontWeight: '700' }}>Add Cubes</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div className="input-group">
                                <label>Bench or Gang No.</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={currentCube.benchNo}
                                    onChange={e => setCurrentCube({ ...currentCube, benchNo: e.target.value })}
                                    placeholder="e.g., 401"
                                />
                            </div>
                            <div className="input-group">
                                <label>Sleeper Sequence</label>
                                <select value={currentCube.sequence} onChange={e => setCurrentCube({ ...currentCube, sequence: e.target.value })}>
                                    <option value="">-- Select --</option>
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button className="btn-verify" onClick={addCube} style={{ height: '40px' }}>+ Add Cube</button>
                        </div>

                        {/* Display Added Cubes */}
                        {formData.cubes.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Added Cubes:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.cubes.map((cube, idx) => (
                                        <div key={idx} style={{
                                            background: '#fff',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontWeight: '700', color: '#42818c' }}>{cube.cubeNo}</span>
                                            <button
                                                onClick={() => removeCube(idx)}
                                                style={{
                                                    background: '#fee2e2',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                    fontSize: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '700'
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Other Benches Section */}
                    <div style={{ marginTop: '16px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', fontWeight: '700' }}>Other Bench No. Present in Chamber</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div className="input-group">
                                <label>Bench No.</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={otherBenchInput}
                                    onChange={e => setOtherBenchInput(e.target.value)}
                                    placeholder="e.g., 402"
                                />
                            </div>
                            <button className="btn-save" onClick={addOtherBench} style={{ height: '40px' }}>+ Add Bench</button>
                        </div>

                        {formData.otherBenches.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Other Benches:</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.otherBenches.map((bench, idx) => (
                                        <div key={idx} style={{
                                            background: '#f8fafc',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontWeight: '700', color: '#1e293b' }}>{bench}</span>
                                            <button
                                                onClick={() => removeOtherBench(bench)}
                                                style={{
                                                    background: '#fee2e2',
                                                    color: '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                    fontSize: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '700'
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px', marginBottom: 0 }}>Can be auto-fetched from SCADA data</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button
                            className="btn-verify"
                            style={{ flex: 1 }}
                            onClick={() => onSave({
                                ...formData,
                                castTime: formData.lbcTime
                            })}
                            disabled={!formData.batchNo || !formData.grade || formData.cubes.length === 0}
                        >
                            {isModifying ? 'Update Declaration' : 'Save Declaration'}
                        </button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={onClose}>Cancel</button>
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
        cubeResults: sample.cubeResults || (sample.cubes || []).map(cube => ({
            cubeNo: cube.cubeNo,
            weight: '',
            load: '',
            strength: '',
            ageHrs: '0.0',
            testDate: sample.testDate || new Date().toISOString().split('T')[0],
            testTime: sample.testTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }))
    });

    const calculateAge = (castDate, castTime, testDate, testTime) => {
        if (!castDate || !castTime || !testDate || !testTime) return '0.0';
        const cast = new Date(`${castDate}T${castTime}`);
        const test = new Date(`${testDate}T${testTime}`);
        const diffMs = test - cast;
        return (diffMs / (1000 * 60 * 60)).toFixed(1);
    };

    // Initialize ageHrs for all cubes on mount (or if sample changes)
    useEffect(() => {
        setTestData(prev => ({
            ...prev,
            cubeResults: prev.cubeResults.map(cube => ({
                ...cube,
                ageHrs: calculateAge(sample.castDate, sample.castTime, cube.testDate, cube.testTime)
            }))
        }));
    }, []); // Run once on mount

    const updateCubeData = (index, field, value) => {
        const newCubeResults = [...testData.cubeResults];
        newCubeResults[index][field] = value;

        // Auto-calculate strength when load changes
        if (field === 'load' && value && !isNaN(value)) {
            newCubeResults[index].strength = (parseFloat(value) / 22.5).toFixed(2);
        }

        // Recalculate age if date or time changes
        if (field === 'testDate' || field === 'testTime') {
            const currentCube = newCubeResults[index];
            newCubeResults[index].ageHrs = calculateAge(
                sample.castDate,
                sample.castTime,
                currentCube.testDate,
                currentCube.testTime
            );
        }

        setTestData({ ...testData, cubeResults: newCubeResults });
    };

    // Calculate average strength
    const avgStrength = useMemo(() => {
        const strengths = testData.cubeResults
            .map(c => parseFloat(c.strength))
            .filter(s => !isNaN(s));

        if (strengths.length === 0) return 0;
        return (strengths.reduce((a, b) => a + b, 0) / strengths.length).toFixed(2);
    }, [testData.cubeResults]);

    // Determine result
    const threshold = sample.grade === 'M-55' ? 40 : 50;
    const allStrengths = testData.cubeResults.map(c => parseFloat(c.strength)).filter(s => !isNaN(s));
    const result = allStrengths.length > 0 && allStrengths.every(s => s > threshold) ? 'OK' : 'Not OK';

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Test Form - Batch {sample.batchNo}</span>
                    <button className="form-modal-close" onClick={onClose}>X</button>
                </div>
                <div className="form-modal-body">
                    {/* Pre-filled Information */}
                    <div style={{ marginBottom: '20px' }}>
                        <label className="mini-label" style={{ color: '#42818c', fontSize: '11px' }}>PRE-FILLED INFORMATION</label>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                            <div><div style={{ fontSize: '10px', color: '#64748b' }}>Shed No. / Line No.</div><div style={{ fontWeight: '700', fontSize: '13px' }}>{sample.lineNumber}</div></div>
                            <div><div style={{ fontSize: '10px', color: '#64748b' }}>Date of Casting</div><div style={{ fontWeight: '700', fontSize: '13px' }}>{sample.castDate ? sample.castDate.split('-').reverse().join('/') : ''}</div></div>
                            <div><div style={{ fontSize: '10px', color: '#64748b' }}>Batch No.</div><div style={{ fontWeight: '700', fontSize: '13px' }}>{sample.batchNo}</div></div>
                            <div><div style={{ fontSize: '10px', color: '#64748b' }}>LBC Time</div><div style={{ fontWeight: '700', fontSize: '13px' }}>{sample.lbcTime || sample.castTime}</div></div>
                            <div><div style={{ fontSize: '10px', color: '#64748b' }}>Concrete Grade</div><div style={{ fontWeight: '700', fontSize: '13px' }}>{sample.grade}</div></div>
                            <div><div style={{ fontSize: '10px', color: '#64748b' }}>Other Bench No.</div><div style={{ fontWeight: '700', fontSize: '13px' }}>{sample.otherBenches?.join(', ') || 'N/A'}</div></div>
                        </div>
                    </div>

                    {/* Cube Testing Table */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', fontWeight: '700' }}>Individual Cube Testing</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px' }}>Cube No.</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px', minWidth: '110px' }}>Date of Testing</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px', minWidth: '90px' }}>Time</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px' }}>Age (Hrs)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px' }}>Weight (Kgs)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px' }}>Load (KN)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '11px' }}>Strength (N/mm²)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testData.cubeResults.map((cube, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '700', color: '#42818c' }}>{cube.cubeNo}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={cube.testDate ? cube.testDate.split('-').reverse().join('/') : ''}
                                                    style={{ width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', background: '#f8fafc' }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="time"
                                                    value={cube.testTime}
                                                    onChange={e => updateCubeData(idx, 'testTime', e.target.value)}
                                                    style={{ width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px' }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={cube.ageHrs}
                                                    style={{
                                                        width: '60px',
                                                        padding: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        background: '#f8fafc',
                                                        fontWeight: '700',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={cube.weight}
                                                    onChange={e => updateCubeData(idx, 'weight', e.target.value)}
                                                    placeholder="8.25"
                                                    style={{
                                                        width: '80px',
                                                        padding: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={cube.load}
                                                    onChange={e => updateCubeData(idx, 'load', e.target.value)}
                                                    placeholder="950"
                                                    style={{
                                                        width: '80px',
                                                        padding: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={cube.strength}
                                                    style={{
                                                        width: '80px',
                                                        padding: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        background: '#f0fdf4',
                                                        fontWeight: '800',
                                                        color: '#166534',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '2px solid #42818c', marginBottom: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Avg. Strength (N/mm²)</label>
                                <div style={{
                                    padding: '12px',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    fontSize: '20px',
                                    fontWeight: '800',
                                    color: '#42818c',
                                    textAlign: 'center'
                                }}>{avgStrength}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Result of Testing</label>
                                <div style={{
                                    padding: '12px',
                                    background: result === 'OK' ? '#ecfdf5' : '#fee2e2',
                                    borderRadius: '8px',
                                    fontSize: '20px',
                                    fontWeight: '800',
                                    color: result === 'OK' ? '#059669' : '#dc2626',
                                    textAlign: 'center',
                                    border: `2px solid ${result === 'OK' ? '#059669' : '#dc2626'}`
                                }}>{result}</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '12px', marginBottom: 0, textAlign: 'center' }}>
                            Threshold: {sample.grade === 'M-55' ? '> 40 N/mm²' : '> 50 N/mm²'} for all cubes
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                            className="btn-verify"
                            style={{ flex: 1, padding: '14px' }}
                            onClick={() => onSave({
                                ...testData,
                                avgStrength,
                                result,
                                castDate: sample.castDate,
                                castTime: sample.castTime,
                                lineNumber: sample.lineNumber,
                                batchNo: sample.batchNo,
                                chamberNo: sample.chamberNo,
                                grade: sample.grade
                            })}
                        >
                            Complete Test & Archive
                        </button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SteamCubeTesting;

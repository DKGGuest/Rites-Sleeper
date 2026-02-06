import React, { useState, useMemo, useEffect } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import CollapsibleSection from '../../../components/common/CollapsibleSection';

const ModulusOfRupture = () => {
    const [viewMode, setViewMode] = useState('statistics'); // 'statistics', 'declared', 'tested'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [isModifying, setIsModifying] = useState(false);

    // Mock initial data
    const [declaredSamples, setDeclaredSamples] = useState([
        {
            id: 1,
            dateOfSampling: '2026-01-15', // Older than 15 days from Feb 02
            concreteGrade: 'M60',
            shedLineNo: 'Shed 1',
            sampleId: 'MOR-2026-001',
            plant: 'Stress Bench',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            dateOfSampling: '2026-02-01', // New sampling, should be deactivated for test
            concreteGrade: 'M55',
            shedLineNo: 'Shed 2',
            sampleId: 'MOR-2026-005',
            plant: 'Long Line',
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        }
    ]);

    const [testedSamples, setTestedSamples] = useState([
        {
            id: 101,
            dateOfSampling: '2026-01-10',
            dateOfTesting: '2026-02-01',
            sampleId: 'MOR-2026-XX',
            concreteGrade: 'M60',
            strength: 6.5,
            result: 'PASS',
            testedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
    ]);

    // Statistics Calculation
    const stats = useMemo(() => {
        const totalSampling = declaredSamples.length + testedSamples.length;
        const totalTests = testedSamples.length;
        const strengths = testedSamples.map(s => s.strength).filter(s => s > 0);
        const avgStrength = strengths.length > 0 ? (strengths.reduce((a, b) => a + b, 0) / strengths.length).toFixed(2) : 0;
        const minStrength = strengths.length > 0 ? Math.min(...strengths) : 0;
        const maxStrength = strengths.length > 0 ? Math.max(...strengths) : 0;
        const passRate = totalTests > 0 ? ((testedSamples.filter(s => s.result === 'PASS').length / totalTests) * 100).toFixed(1) : 0;

        let sd = 0;
        if (strengths.length > 1) {
            const mean = parseFloat(avgStrength);
            const squareDiffs = strengths.map(s => Math.pow(s - mean, 2));
            sd = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / strengths.length).toFixed(2);
        }

        return {
            totalSampling,
            totalTests,
            avgStrength,
            minStrength,
            maxStrength,
            passRate,
            sd,
            lastSamplingDate: declaredSamples.length > 0 ? declaredSamples[0].dateOfSampling : 'N/A',
            lastTestDate: testedSamples.length > 0 ? testedSamples[0].dateOfTesting : 'N/A'
        };
    }, [declaredSamples, testedSamples]);

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

    const saveTestDetails = (testData) => {
        const completedTest = {
            ...selectedSample,
            ...testData,
            testedAt: new Date().toISOString()
        };
        setTestedSamples(prev => [completedTest, ...prev]);
        setDeclaredSamples(prev => prev.filter(s => s.id !== selectedSample.id));
        setShowTestModal(false);
    };

    const isWithinHour = (isoString) => {
        if (!isoString) return false;
        const diff = Date.now() - new Date(isoString).getTime();
        return diff < (60 * 60 * 1000);
    };

    const isAgedForTesting = (samplingDate) => {
        if (!samplingDate) return false;
        const sampling = new Date(samplingDate);
        const today = new Date();
        const diffTime = today - sampling;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 15;
    };

    const columnsDeclared = [
        { key: 'dateOfSampling', label: 'Date of Sampling' },
        { key: 'concreteGrade', label: 'Concrete Grade' },
        { key: 'shedLineNo', label: 'Shed/Line No.' },
        { key: 'sampleId', label: 'Sample Identification Number' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const canTest = isAgedForTesting(row.dateOfSampling);
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isWithinHour(row.createdAt) && (
                            <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleModifySample(row)}>Modify</button>
                        )}
                        <button
                            className="btn-verify"
                            disabled={!canTest}
                            style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                opacity: canTest ? 1 : 0.5,
                                cursor: canTest ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => handleEnterTestDetails(row)}
                        >
                            Enter Test Details {!canTest && '(Needs 15 Days)'}
                        </button>
                    </div>
                );
            }
        }
    ];

    const columnsTested = [
        { key: 'dateOfSampling', label: 'Date of Sampling' },
        { key: 'dateOfTesting', label: 'Date of Testing' },
        { key: 'sampleId', label: 'Sample Identification' },
        { key: 'concreteGrade', label: 'Concrete Grade' },
        { key: 'strength', label: 'Strength' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                isWithinHour(row.testedAt) ? (
                    <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }}>Edit</button>
                ) : (
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                )
            )
        }
    ];

    return (
        <div className="mor-module cement-forms-scope">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Modulus of Rupture (MOR)</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Quality monitoring for flexural strength</p>
            </header>

            <div className="nav-tabs" style={{
                marginBottom: '24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <button className={`nav-tab ${viewMode === 'statistics' ? 'active' : ''}`} style={{ flex: '1 1 auto', minWidth: '120px' }} onClick={() => setViewMode('statistics')}>Statistics</button>
                <button className={`nav-tab ${viewMode === 'declared' ? 'active' : ''}`} style={{ flex: '1 1 auto', minWidth: '120px' }} onClick={() => setViewMode('declared')}>Samples Declared</button>
                <button className={`nav-tab ${viewMode === 'tested' ? 'active' : ''}`} style={{ flex: '1 1 auto', minWidth: '120px' }} onClick={() => setViewMode('tested')}>Samples Tested</button>
            </div>

            <div className="tab-content">
                {viewMode === 'statistics' && (
                    <div className="fade-in">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '12px',
                            marginBottom: '32px'
                        }}>
                            <StatCard label="Total MOR Samples" value={stats.totalSampling} />
                            <StatCard label="Total MOR Tests" value={stats.totalTests} />
                            <StatCard label="Avg. MOR Value" value={stats.avgStrength} unit="N/mm²" />
                            <StatCard label="Pass Rate" value={stats.passRate} unit="%" />
                            <StatCard label="Min / Max MOR" value={`${stats.minStrength} / ${stats.maxStrength}`} />
                            <StatCard label="Std. Deviation" value={stats.sd} />
                            <StatCard label="Last Sampling" value={stats.lastSamplingDate} />
                            <StatCard label="Last Test" value={stats.lastTestDate} />
                        </div>
                        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            📈 Modulus of Rupture Trend Analysis Chart
                        </div>
                    </div>
                )}

                {viewMode === 'declared' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>MOR Samples Pending Testing (15 Day Aging)</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>MOR Historical Tested Samples</h4>
                        </div>
                        <EnhancedDataTable columns={columnsTested} data={testedSamples} />
                    </div>
                )}
            </div>

            {showDeclareModal && (
                <MORSampleDeclarationModal
                    sample={selectedSample}
                    isModifying={isModifying}
                    onClose={() => setShowDeclareModal(false)}
                    onSave={saveDeclaration}
                />
            )}

            {showTestModal && (
                <MORTestDetailsModal
                    sample={selectedSample}
                    onClose={() => setShowTestModal(false)}
                    onSave={saveTestDetails}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value, unit = '', color = '#1e293b' }) => (
    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color }}>{value} <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>{unit}</span></div>
    </div>
);

const MORSampleDeclarationModal = ({ sample, isModifying, onClose, onSave }) => {
    const [formData, setFormData] = useState(sample || {
        dateOfSampling: new Date().toISOString().split('T')[0],
        concreteGrade: '',
        plant: '',
        shedLineNo: '',
        sampleId: ''
    });

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify' : 'Declare'} MOR Sample</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label>Date of Sampling</label>
                            <input type="date" value={formData.dateOfSampling} onChange={e => setFormData({ ...formData, dateOfSampling: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Concrete Grade</label>
                            <select value={formData.concreteGrade} onChange={e => setFormData({ ...formData, concreteGrade: e.target.value })}>
                                <option value="">Select Grade</option>
                                <option>M55</option>
                                <option>M60</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Plant Type</label>
                            <select value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value })}>
                                <option value="">Select Plant</option>
                                <option>Long Line</option>
                                <option>Stress Bench</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Shed / Line</label>
                            <select value={formData.shedLineNo} onChange={e => setFormData({ ...formData, shedLineNo: e.target.value })}>
                                <option value="">Select Shed/Line</option>
                                <option>Shed 1</option>
                                <option>Shed 2</option>
                                <option>Line 1</option>
                                <option>Line 2</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Sample Identification Number</label>
                            <input type="text" value={formData.sampleId} onChange={e => setFormData({ ...formData, sampleId: e.target.value })} placeholder="e.g. MOR-2026-XYZ" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                        <button className="btn-verify" style={{ flex: '1 1 200px' }} onClick={() => {
                            if (!formData.concreteGrade || !formData.plant || !formData.shedLineNo || !formData.sampleId) {
                                alert("Please fill in all mandatory fields (Grade, Plant, Shed/Line, and ID).");
                                return;
                            }
                            onSave(formData);
                        }}>{isModifying ? 'Update Sample' : 'Save Declaration'}</button>
                        <button className="btn-save" style={{ flex: '1 1 200px', background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MORTestDetailsModal = ({ sample, onClose, onSave }) => {
    const [testData, setTestData] = useState({
        dateOfTesting: new Date().toISOString().split('T')[0],
        weight: '',
        load: '',
        strength: '',
        remarks: ''
    });

    const result = parseFloat(testData.strength) >= 6.0 ? 'PASS' : 'FAIL'; // Example limit 6.0

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter MOR Test Details: {sample.sampleId}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Sampling Date</span><div style={{ fontWeight: '700' }}>{sample.dateOfSampling}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Grade</span><div style={{ fontWeight: '700' }}>{sample.concreteGrade}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Identification</span><div style={{ fontWeight: '700' }}>{sample.sampleId}</div></div>
                        </div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Date of Testing</label>
                            <input type="date" value={testData.dateOfTesting} onChange={e => setTestData({ ...testData, dateOfTesting: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Weight (in Kgs)</label>
                            <input type="number" step="0.01" value={testData.weight} onChange={e => setTestData({ ...testData, weight: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Load in KN</label>
                            <input type="number" step="0.01" value={testData.load} onChange={e => setTestData({ ...testData, load: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Strength (N/mm²)</label>
                            <input type="number" step="0.01" value={testData.strength} onChange={e => setTestData({ ...testData, strength: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Result (Auto)</label>
                            <input readOnly value={testData.strength ? result : 'PENDING'} style={{ color: result === 'PASS' ? '#059669' : '#dc2626', fontWeight: '800', background: '#f8fafc' }} />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Remarks</label>
                            <textarea value={testData.remarks} onChange={e => setTestData({ ...testData, remarks: e.target.value })} style={{ minHeight: '60px', padding: '12px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                        <button className="btn-verify" style={{ flex: '1 1 200px' }} onClick={() => onSave({ ...testData, result })}>Save Test Results</button>
                        <button className="btn-save" style={{ flex: '1 1 200px', background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulusOfRupture;

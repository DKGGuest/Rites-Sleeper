import React, { useState, useMemo, useEffect } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import CollapsibleSection from '../../../components/common/CollapsibleSection';

const MomentOfFailure = () => {
    const [viewMode, setViewMode] = useState('statistics'); // 'statistics', 'declared', 'tested'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [isModifying, setIsModifying] = useState(false);

    // Mock initial data
    const [declaredSamples, setDeclaredSamples] = useState([
        {
            id: 1,
            dateOfSampling: '2026-02-01',
            batchNo: 'B-710',
            dateOfCasting: '2026-01-25',
            concreteGrade: 'M60',
            sleeperType: 'RT-1234',
            shedLineNo: 'Shed 1',
            sleeperNo: '405-A',
            typeOfSample: 'Fresh',
            benchNo: '405',
            mouldNo: 'A',
            plant: 'Stress Bench',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
        }
    ]);

    const [testedSamples, setTestedSamples] = useState([
        {
            id: 101,
            dateOfSampling: '2026-01-30',
            dateOfTesting: '2026-02-01',
            shedLineNo: 'Shed 2',
            batchNo: 'B-705',
            sleeperNo: '201-C',
            dateOfCasting: '2026-01-20',
            concreteGrade: 'M60',
            strength: 8.5,
            result: 'PASS',
            remarks: 'Within limits',
            testedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 mins ago
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

        // SD calculation
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
            lastTestDate: testedSamples.length > 0 ? testedSamples[0].dateOfTesting : 'N/A',
            sleepersSinceLastTest: 150, // Mock
            retestPending: declaredSamples.filter(s => s.typeOfSample === 'Retest').length
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
        return diff < (60 * 60 * 1000); // 1 hour
    };

    const columnsDeclared = [
        { key: 'dateOfSampling', label: 'Date of Sampling' },
        { key: 'batchNo', label: 'Batch Number' },
        { key: 'dateOfCasting', label: 'Date of Casting' },
        { key: 'concreteGrade', label: 'Concrete Grade' },
        { key: 'sleeperType', label: 'Sleeper Type' },
        { key: 'shedLineNo', label: 'Shed/Line No.' },
        { key: 'sleeperNo', label: 'Sleeper Number' },
        { key: 'typeOfSample', label: 'Type' },
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
        { key: 'dateOfSampling', label: 'Date of Sampling' },
        { key: 'dateOfTesting', label: 'Date of Testing' },
        { key: 'shedLineNo', label: 'Shed/Line' },
        { key: 'batchNo', label: 'Batch & Sleeper', render: (_, row) => `${row.batchNo} / ${row.sleeperNo}` },
        { key: 'dateOfCasting', label: 'Casting Date' },
        { key: 'concreteGrade', label: 'Grade' },
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
        <div className="mof-module cement-forms-scope">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Modulus of Failure (Moment of Failure)</h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Quality monitoring for structural failure limits</p>
            </header>

            <div className="nav-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <button className={`nav-tab ${viewMode === 'statistics' ? 'active' : ''}`} onClick={() => setViewMode('statistics')}>Statistics</button>
                <button className={`nav-tab ${viewMode === 'declared' ? 'active' : ''}`} onClick={() => setViewMode('declared')}>Samples Declared</button>
                <button className={`nav-tab ${viewMode === 'tested' ? 'active' : ''}`} onClick={() => setViewMode('tested')}>Samples Tested</button>
            </div>

            <div className="tab-content">
                {viewMode === 'statistics' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <StatCard label="Total MF Sampling" value={stats.totalSampling} />
                            <StatCard label="Total MF Tests" value={stats.totalTests} />
                            <StatCard label="Average MF Value" value={stats.avgStrength} unit="N/mm²" />
                            <StatCard label="Pass Rate" value={stats.passRate} unit="%" />
                            <StatCard label="Min / Max MF" value={`${stats.minStrength} / ${stats.maxStrength}`} />
                            <StatCard label="Standard Deviation" value={stats.sd} />
                            <StatCard label="Pending Retests" value={stats.retestPending} color="#f59e0b" />
                            <StatCard label="Latest Test" value={stats.lastTestDate} />
                        </div>
                        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            📊 Failure Trend Charts & Distribution Visualization
                        </div>
                    </div>
                )}

                {viewMode === 'declared' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Pending Samples for Testing</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Historical Tested Samples</h4>
                        </div>
                        <EnhancedDataTable columns={columnsTested} data={testedSamples} />
                    </div>
                )}
            </div>

            {showDeclareModal && (
                <MFSampleDeclarationModal
                    sample={selectedSample}
                    isModifying={isModifying}
                    onClose={() => setShowDeclareModal(false)}
                    onSave={saveDeclaration}
                />
            )}

            {showTestModal && (
                <MFTestDetailsModal
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

const MFSampleDeclarationModal = ({ sample, isModifying, onClose, onSave }) => {
    const [formData, setFormData] = useState(sample || {
        dateOfSampling: new Date().toISOString().split('T')[0],
        concreteGrade: 'M60',
        plant: 'Stress Bench',
        shedLineNo: 'Shed 1',
        batchNo: '',
        dateOfCasting: '',
        benchNo: '',
        mouldNo: 'A',
        resultOfMR: '',
        typeOfSample: 'Fresh',
        sleeperType: 'RT-1234'
    });

    const identification = `${formData.shedLineNo} + ${formData.benchNo} + ${formData.mouldNo}`;

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify' : 'Declare'} Sample for MF Testing</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label>Date of Sampling</label>
                            <input type="date" value={formData.dateOfSampling} onChange={e => setFormData({ ...formData, dateOfSampling: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Concrete Grade</label>
                            <select value={formData.concreteGrade} onChange={e => setFormData({ ...formData, concreteGrade: e.target.value })}>
                                <option>M55</option>
                                <option>M60</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Plant Type</label>
                            <select value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value })}>
                                <option>Long Line</option>
                                <option>Stress Bench</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Shed / Line Number</label>
                            <select value={formData.shedLineNo} onChange={e => setFormData({ ...formData, shedLineNo: e.target.value })}>
                                <option>Shed 1</option>
                                <option>Shed 2</option>
                                <option>Line 1</option>
                                <option>Line 2</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Batch Number</label>
                            <input type="text" value={formData.batchNo} onChange={e => setFormData({ ...formData, batchNo: e.target.value })} placeholder="e.g. B-710" />
                        </div>
                        <div className="input-group">
                            <label>Date of Casting</label>
                            <input type="date" value={formData.dateOfCasting} onChange={e => setFormData({ ...formData, dateOfCasting: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Bench / Gang Number</label>
                            <input type="text" value={formData.benchNo} onChange={e => setFormData({ ...formData, benchNo: e.target.value })} placeholder="e.g. 405" />
                        </div>
                        <div className="input-group">
                            <label>Mould No. (A-H)</label>
                            <select value={formData.mouldNo} onChange={e => setFormData({ ...formData, mouldNo: e.target.value })}>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Sample Identification</label>
                            <input readOnly value={identification} style={{ background: '#f8fafc', fontWeight: '700', color: '#42818c' }} />
                        </div>
                        <div className="input-group">
                            <label>Type of Sample</label>
                            <select value={formData.typeOfSample} onChange={e => setFormData({ ...formData, typeOfSample: e.target.value })}>
                                <option>Fresh</option>
                                <option>Retest</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Result of MR for Batch</label>
                            <input type="text" value={formData.resultOfMR} onChange={e => setFormData({ ...formData, resultOfMR: e.target.value })} placeholder="e.g. PASS" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => {
                            const updatedData = {
                                ...formData,
                                sleeperNo: `${formData.benchNo}-${formData.mouldNo}`
                            };
                            onSave(updatedData);
                        }}>{isModifying ? 'Update Sample' : 'Declare Sample'}</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MFTestDetailsModal = ({ sample, onClose, onSave }) => {
    const [testData, setTestData] = useState({
        dateOfTesting: new Date().toISOString().split('T')[0],
        strength1: '',
        strength2: '',
        remarks: ''
    });

    const isRetest = sample.typeOfSample === 'Retest';
    const strength = isRetest ? (parseFloat(testData.strength1) + parseFloat(testData.strength2)) / 2 : parseFloat(testData.strength1);
    const result = !isNaN(strength) && strength >= 7.5 ? 'PASS' : 'FAIL'; // Example limit 7.5

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter Test Details: {sample.sleeperNo}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Batch No</span><div style={{ fontWeight: '700' }}>{sample.batchNo}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Grade</span><div style={{ fontWeight: '700' }}>{sample.concreteGrade}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Shed/Line</span><div style={{ fontWeight: '700' }}>{sample.shedLineNo}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Identification</span><div style={{ fontWeight: '700' }}>{sample.sleeperNo}</div></div>
                        </div>
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label>Date of Testing</label>
                            <input type="date" value={testData.dateOfTesting} onChange={e => setTestData({ ...testData, dateOfTesting: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isRetest ? '1fr 1fr' : '1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label>Strength (N/mm²) {isRetest && 'Input 1'}</label>
                                <input type="number" step="0.01" value={testData.strength1} onChange={e => setTestData({ ...testData, strength1: e.target.value })} />
                            </div>
                            {isRetest && (
                                <div className="input-group">
                                    <label>Strength (N/mm²) Input 2</label>
                                    <input type="number" step="0.01" value={testData.strength2} onChange={e => setTestData({ ...testData, strength2: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="input-group">
                                <label>Result (Auto)</label>
                                <input readOnly value={isNaN(strength) ? 'PENDING' : result} style={{ color: result === 'PASS' ? '#059669' : '#dc2626', fontWeight: '800', background: '#f8fafc' }} />
                            </div>
                            <div className="input-group">
                                <label>Average Strength</label>
                                <input readOnly value={isNaN(strength) ? '-' : strength.toFixed(2)} style={{ background: '#f8fafc', fontWeight: '700' }} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Remarks</label>
                            <textarea value={testData.remarks} onChange={e => setTestData({ ...testData, remarks: e.target.value })} style={{ minHeight: '80px', padding: '12px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => onSave({ ...testData, strength: strength.toFixed(2), result })}>Save Test Results</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomentOfFailure;

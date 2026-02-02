import React, { useState, useMemo, useEffect } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';

const MomentOfFailure = () => {
    const [viewMode, setViewMode] = useState('statistics'); // 'statistics', 'declared', 'tested'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [isModifying, setIsModifying] = useState(false);
    const [selectedSleeperType, setSelectedSleeperType] = useState('RT-1234');

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
            benchNo: '405',
            mouldNo: 'A',
            sleeperNo: '405-A',
            typeOfSample: 'Fresh',
            plant: 'Stress Bench',
            resultOfMR: 'PASS',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
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
            testedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
            id: 102,
            dateOfSampling: '2026-01-28',
            dateOfTesting: '2026-02-01',
            shedLineNo: 'Line 1',
            batchNo: 'B-698',
            sleeperNo: '105-D',
            dateOfCasting: '2026-01-18',
            concreteGrade: 'M55',
            strength: 7.2,
            result: 'FAIL',
            remarks: 'Hairline crack',
            testedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
        }
    ]);

    // Statistics Calculation filtered by sleeper type
    const stats = useMemo(() => {
        // For simulation, we'll use all samples but represent the logic
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
            lastTestDate: testedSamples.length > 0 ? testedSamples[0].dateOfTesting : 'N/A',
            sleepersSinceLastTest: 245,
            retestPending: declaredSamples.filter(s => s.typeOfSample === 'Retest').length
        };
    }, [declaredSamples, testedSamples, selectedSleeperType]);

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
        { key: 'shedLineNo', label: 'Shed Number / Line Number' },
        { key: 'batchNo', label: 'Batch Number & Sleeper No.', render: (_, row) => `${row.batchNo} / ${row.sleeperNo}` },
        { key: 'dateOfCasting', label: 'Date of Casting' },
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
        <div className="mof-module cement-forms-scope fade-in">
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Modulus of Failure (MF)</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Structural integrity monitoring and failure limits</p>
                </div>
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

            <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease' }}>
                {viewMode === 'statistics' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            {['RT-1234', 'RT-5678', 'RT-9012'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedSleeperType(type)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        background: selectedSleeperType === type ? '#42818c' : '#fff',
                                        color: selectedSleeperType === type ? '#fff' : '#64748b',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <StatCard label="Total MF Sampling" value={stats.totalSampling} />
                            <StatCard label="Total MF Tests" value={stats.totalTests} />
                            <StatCard label="Average MF Value" value={stats.avgStrength} unit="N/mm²" />
                            <StatCard label="Pass Rate (%)" value={stats.passRate} unit="%" color={parseFloat(stats.passRate) > 95 ? '#10b981' : '#f59e0b'} />
                            <StatCard label="Minimum MF" value={stats.minStrength} unit="N/mm²" />
                            <StatCard label="Maximum MF" value={stats.maxStrength} unit="N/mm²" />
                            <StatCard label="Standard Deviation" value={stats.sd} />
                            <StatCard label="No. of Retest Pending" value={stats.retestPending} color={stats.retestPending > 0 ? '#ef4444' : '#1e293b'} />
                            <StatCard label="Last Test Date" value={stats.lastTestDate} />
                            <StatCard label="Sleepers Since Last Test" value={stats.sleepersSinceLastTest} color="#6366f1" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '300px' }}>
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#1e293b' }}>MF Strength Distribution (Simulated)</h4>
                                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 10px' }}>
                                    {[40, 65, 85, 100, 75, 50, 30].map((h, i) => (
                                        <div key={i} style={{ flex: 1, background: i === 3 ? '#42818c' : '#e2e8f0', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                                            <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: '#94a3b8' }}>{h}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '9px', color: '#94a3b8' }}>
                                    <span>7.0</span><span>7.5</span><span>8.0</span><span>8.5</span><span>9.0</span><span>9.5</span><span>10.0</span>
                                </div>
                            </div>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '300px' }}>
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#1e293b' }}>Pass Rate Trend (Last 7 Days)</h4>
                                <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                                    <svg width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="none">
                                        <path d="M0,150 L60,140 L120,160 L180,130 L240,145 L300,120 L360,110" fill="none" stroke="#42818c" strokeWidth="3" />
                                        <circle cx="0" cy="150" r="4" fill="#42818c" /><circle cx="60" cy="140" r="4" fill="#42818c" />
                                        <circle cx="120" cy="160" r="4" fill="#42818c" /><circle cx="180" cy="130" r="4" fill="#42818c" />
                                        <circle cx="240" cy="145" r="4" fill="#42818c" /><circle cx="300" cy="120" r="4" fill="#42818c" />
                                        <circle cx="360" cy="110" r="4" fill="#42818c" />
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '9px', color: '#94a3b8' }}>
                                    <span>Jan 27</span><span>Jan 28</span><span>Jan 29</span><span>Jan 30</span><span>Jan 31</span><span>Feb 01</span><span>Feb 02</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'declared' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Pending Samples for MF Testing</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>MF Test Record Archive</h4>
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
        dateOfCasting: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        benchNo: '',
        mouldNo: 'A',
        resultOfMR: 'PASS',
        typeOfSample: 'Fresh',
        sleeperType: 'RT-1234'
    });

    const identification = `${formData.shedLineNo} + ${formData.benchNo} + ${formData.mouldNo}`;

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify' : 'Enter'} Sample Details</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                            <label>Plant – Long Line / Stress Bench</label>
                            <select value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value })}>
                                <option>Long Line</option>
                                <option>Stress Bench</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Shed/ Line Number - Drop down</label>
                            <select value={formData.shedLineNo} onChange={e => setFormData({ ...formData, shedLineNo: e.target.value })}>
                                <option>Shed 1</option><option>Shed 2</option>
                                <option>Line 1</option><option>Line 2</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Batch No.</label>
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
                            <label>Mould No.à A to H</label>
                            <select value={formData.mouldNo} onChange={e => setFormData({ ...formData, mouldNo: e.target.value })}>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Sample Identification (Shed/ Line No. + Bench / Gang No. + Mould No. (A-H))</label>
                            <input readOnly value={identification} style={{ background: '#f8fafc', fontWeight: '800', color: '#42818c', fontSize: '15px' }} />
                        </div>
                        <div className="input-group">
                            <label>Result of MR for the Batch</label>
                            <input type="text" value={formData.resultOfMR} onChange={e => setFormData({ ...formData, resultOfMR: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Type of Sample (Retest/ Fresh)</label>
                            <select value={formData.typeOfSample} onChange={e => setFormData({ ...formData, typeOfSample: e.target.value })}>
                                <option>Fresh</option>
                                <option>Retest</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => {
                            const updatedData = { ...formData, sleeperNo: `${formData.benchNo}-${formData.mouldNo}` };
                            onSave(updatedData);
                        }}>{isModifying ? 'Update Sample Detail' : 'Save Sample Detail'}</button>
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
    const strength = isRetest ? (parseFloat(testData.strength1 || 0) + parseFloat(testData.strength2 || 0)) / 2 : parseFloat(testData.strength1 || 0);
    const result = !isNaN(strength) && strength >= 7.5 ? 'PASS' : 'FAIL';

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter MF Test Details: {sample.sleeperNo}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <h5 style={{ margin: '0 0 16px 0', color: '#42818c', fontSize: '14px' }}>Declaration Summary</h5>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Batch No</span><div style={{ fontWeight: '700' }}>{sample.batchNo}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Casting Date</span><div style={{ fontWeight: '700' }}>{sample.dateOfCasting}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Grade</span><div style={{ fontWeight: '700' }}>{sample.concreteGrade}</div></div>
                            <div style={{ gridColumn: 'span 3' }}><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Sample Identification</span><div style={{ fontWeight: '800', color: '#42818c' }}>{sample.shedLineNo} + {sample.benchNo} + {sample.mouldNo}</div></div>
                        </div>
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label>Date of Testing</label>
                            <input type="date" value={testData.dateOfTesting} onChange={e => setTestData({ ...testData, dateOfTesting: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isRetest ? '1fr 1fr' : '1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label>Strength (N/mm²) {isRetest && '(Input 1)'}</label>
                                <input type="number" step="0.01" value={testData.strength1} onChange={e => setTestData({ ...testData, strength1: e.target.value })} placeholder="0.00" />
                            </div>
                            {isRetest && (
                                <div className="input-group">
                                    <label>Strength (N/mm²) (Input 2)</label>
                                    <input type="number" step="0.01" value={testData.strength2} onChange={e => setTestData({ ...testData, strength2: e.target.value })} placeholder="0.00" />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label>Result à Auto fill</label>
                                <input readOnly value={testData.strength1 ? result : 'PENDING'} style={{ color: result === 'PASS' ? '#059669' : '#dc2626', fontWeight: '900', background: '#f8fafc', textAlign: 'center' }} />
                            </div>
                            <div className="input-group">
                                <label>Final Strength Calculated</label>
                                <input readOnly value={testData.strength1 ? strength.toFixed(2) : '-'} style={{ background: '#f8fafc', fontWeight: '700', textAlign: 'center' }} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Remarks à String</label>
                            <textarea value={testData.remarks} onChange={e => setTestData({ ...testData, remarks: e.target.value })} placeholder="Enter observations..." style={{ minHeight: '80px', padding: '12px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1 }} onClick={() => onSave({ ...testData, strength: strength.toFixed(2), result })}>Save & Finalize Test</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomentOfFailure;

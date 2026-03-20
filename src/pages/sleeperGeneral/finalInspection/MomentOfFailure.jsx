import React, { useState, useMemo, useEffect } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import { apiService } from '../../../services/api';

const MomentOfFailure = () => {
    const [viewMode, setViewMode] = useState('statistics'); // 'statistics', 'declared', 'tested'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [isModifying, setIsModifying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSleeperType, setSelectedSleeperType] = useState('RT-1234');

    // API Data
    const [declaredSamples, setDeclaredSamples] = useState([]);
    const [testedSamples, setTestedSamples] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [samplesRes, testsRes] = await Promise.all([
                apiService.getAllMFSamples(),
                apiService.getAllMFTests()
            ]);

            setDeclaredSamples(samplesRes.responseData || []);
            setTestedSamples(testsRes.responseData || []);
        } catch (error) {
            console.error('Failed to fetch MF data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Statistics Calculation filtered by sleeper type
    const stats = useMemo(() => {
        const totalSampling = declaredSamples.length;
        const totalTests = testedSamples.length;
        const strengths = testedSamples.map(s => parseFloat(s.strength)).filter(s => !isNaN(s) && s > 0);
        const avgStrength = strengths.length > 0 ? (strengths.reduce((a, b) => a + b, 0) / strengths.length).toFixed(2) : 0;
        const minStrength = strengths.length > 0 ? Math.min(...strengths) : 0;
        const maxStrength = strengths.length > 0 ? Math.max(...strengths) : 0;
        const passRate = totalTests > 0 ? ((testedSamples.filter(s => s.result?.toLowerCase() === 'pass').length / totalTests) * 100).toFixed(1) : 0;

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
            lastTestDate: testedSamples.length > 0 ? testedSamples[0].testingDate : 'N/A',
            sleepersSinceLastTest: 245, // Static for now as per design
            retestPending: declaredSamples.filter(s => s.sampleType === 'Retest').length
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

    const saveDeclaration = async (formData) => {
        try {
            setLoading(true);
            if (isModifying) {
                await apiService.updateMFSample(selectedSample.id, {
                    ...formData,
                    updatedBy: parseInt(localStorage.getItem('userId') || '118', 10)
                });
            } else {
                await apiService.createMFSample({
                    ...formData,
                    createdBy: parseInt(localStorage.getItem('userId') || '118', 10)
                });
            }
            setShowDeclareModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to save declaration: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const saveTestDetails = async (testData) => {
        try {
            setLoading(true);
            await apiService.createMFTest({
                ...testData,
                modulusOfFailureId: selectedSample.id,
                createdBy: parseInt(localStorage.getItem('userId') || '118', 10)
            });
            setShowTestModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to save test results: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isWithinHour = (dateString) => {
        if (!dateString) return false;
        const diff = Date.now() - new Date(dateString).getTime();
        return diff < (60 * 60 * 1000);
    };

    const columnsDeclared = [
        { key: 'samplingDate', label: 'Date of Sampling' },
        { key: 'batchNo', label: 'Batch Number' },
        { key: 'castingDate', label: 'Date of Casting' },
        { key: 'concreteGrade', label: 'Concrete Grade' },
        { key: 'shedLineNumber', label: 'Shed/Line No.' },
        { key: 'sleeperType', label: 'Drawing No.' },
        { key: 'sampleIdentification', label: 'Sample Identification' },
        { key: 'sampleType', label: 'Type' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const isTested = testedSamples.some(t => t.modulusOfFailureId === row.id);
                if (isTested) return <span style={{ color: '#059669', fontSize: '10px', fontWeight: '700' }}>✓ TESTED</span>;

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isWithinHour(row.createdDate) && (
                            <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleModifySample(row)}>Modify</button>
                        )}
                        <button className="btn-verify" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleEnterTestDetails(row)}>Enter Test Details</button>
                    </div>
                );
            }
        }
    ];

    const columnsTested = [
        { key: 'samplingDate', label: 'Date of Sampling', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.modulusOfFailureId);
            return sample ? sample.samplingDate : '-';
        }},
        { key: 'testingDate', label: 'Date of Testing' },
        { key: 'sampleIdentification', label: 'Shed / Identification', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.modulusOfFailureId);
            return sample ? `${sample.shedLineNumber} / ${sample.sampleIdentification} (${sample.sleeperType || '-'})` : '-';
        }},
        { key: 'batchNo', label: 'Batch No.', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.modulusOfFailureId);
            return sample ? sample.batchNo : '-';
        }},
        { key: 'concreteGrade', label: 'Concrete Grade', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.modulusOfFailureId);
            return sample ? sample.concreteGrade : '-';
        }},
        { key: 'strength', label: 'Strength' },
        { key: 'result', label: 'Result', render: (val) => (
            <span style={{ color: val?.toLowerCase() === 'pass' ? '#059669' : '#dc2626', fontWeight: '700' }}>{val}</span>
        )},
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                isWithinHour(row.createdDate) ? (
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
                {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}

                {viewMode === 'statistics' && !loading && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            {['RT-8746', 'RT-1234', 'RT-5678', 'RT-9012'].map(type => (
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
                    </div>
                )}

                {viewMode === 'declared' && !loading && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Pending Samples for MF Testing</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && !loading && (
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
                    saving={loading}
                />
            )}

            {showTestModal && (
                <MFTestDetailsModal
                    sample={selectedSample}
                    onClose={() => setShowTestModal(false)}
                    onSave={saveTestDetails}
                    saving={loading}
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

const MFSampleDeclarationModal = ({ sample, isModifying, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState(sample ? {
        samplingDate: sample.samplingDate,
        concreteGrade: sample.concreteGrade,
        plantType: sample.plantType,
        shedLineNumber: sample.shedLineNumber,
        batchNo: sample.batchNo,
        castingDate: sample.castingDate,
        benchGangNumber: sample.benchGangNumber,
        mouldNo: sample.mouldNo,
        mrResult: sample.mrResult,
        sampleType: sample.sampleType,
        sleeperType: sample.sleeperType || ''
    } : {
        samplingDate: new Date().toISOString().split('T')[0],
        concreteGrade: '',
        plantType: '',
        shedLineNumber: '',
        batchNo: '',
        castingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        benchGangNumber: '',
        mouldNo: '',
        mrResult: 'PASS',
        sampleType: '',
        sleeperType: 'RT-8746'
    });

    const identification = `${formData.shedLineNumber} + ${formData.benchGangNumber} + ${formData.mouldNo}`;

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
                            <input type="date" value={formData.samplingDate} onChange={e => setFormData({ ...formData, samplingDate: e.target.value })} />
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
                            <label>Plant – Long Line / Stress Bench</label>
                            <select value={formData.plantType} onChange={e => setFormData({ ...formData, plantType: e.target.value })}>
                                <option value="">Select Plant</option>
                                <option>Long Line</option>
                                <option>Stress Bench</option>
                                <option>General</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Shed/ Line Number</label>
                            <select value={formData.shedLineNumber} onChange={e => setFormData({ ...formData, shedLineNumber: e.target.value })}>
                                <option value="">Select Shed/Line</option>
                                <option>Shed 1</option><option>Shed 2</option>
                                <option>Line 1</option><option>Line 2</option>
                                <option>N/A</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Batch No.</label>
                            <input type="text" value={formData.batchNo} onChange={e => setFormData({ ...formData, batchNo: e.target.value })} placeholder="e.g. B-710" />
                        </div>
                        <div className="input-group">
                            <label>Date of Casting</label>
                            <input type="date" value={formData.castingDate} onChange={e => setFormData({ ...formData, castingDate: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Bench / Gang Number</label>
                            <input type="text" value={formData.benchGangNumber} onChange={e => setFormData({ ...formData, benchGangNumber: e.target.value })} placeholder="e.g. 405" />
                        </div>
                        <div className="input-group">
                            <label>Mould No. (A to H)</label>
                            <select value={formData.mouldNo} onChange={e => setFormData({ ...formData, mouldNo: e.target.value })}>
                                <option value="">Select Mould</option>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Sample Identification (Shed/ Line No. + Bench / Gang No. + Mould No. (A-H))</label>
                            <input readOnly value={identification} style={{ background: '#f8fafc', fontWeight: '800', color: '#42818c', fontSize: '15px' }} />
                        </div>
                        <div className="input-group">
                            <label>Result of MR for the Batch</label>
                            <input type="text" value={formData.mrResult} onChange={e => setFormData({ ...formData, mrResult: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Drawing No. (Sleeper Type)</label>
                            <select value={formData.sleeperType} onChange={e => setFormData({ ...formData, sleeperType: e.target.value })}>
                                <option value="">Select Drawing</option>
                                <option>RT-8746</option>
                                <option>RT-1234</option>
                                <option>RT-5678</option>
                                <option>RT-9012</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Type of Sample (Retest/ Fresh)</label>
                            <select value={formData.sampleType} onChange={e => setFormData({ ...formData, sampleType: e.target.value })}>
                                <option value="">Select Type</option>
                                <option>Fresh</option>
                                <option>Retest</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" disabled={saving} style={{ flex: 1 }} onClick={() => {
                            if (!formData.concreteGrade || !formData.plantType || !formData.shedLineNumber || !formData.mouldNo || !formData.sampleType || !formData.batchNo || !formData.benchGangNumber) {
                                alert("Please fill in all mandatory fields (Grade, Plant, Shed/Line, Batch, Bench, Mould, and Type).");
                                return;
                            }
                            onSave({ ...formData, sampleIdentification: identification });
                        }}>{saving ? 'Saving...' : (isModifying ? 'Update Sample Detail' : 'Save Sample Detail')}</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MFTestDetailsModal = ({ sample, onClose, onSave, saving }) => {
    const [testData, setTestData] = useState({
        testingDate: new Date().toISOString().split('T')[0],
        strength: '',
        remarks: ''
    });

    const isRetest = sample.sampleType === 'Retest';
    const strengthVal = parseFloat(testData.strength || 0);
    
    // Dynamic Requirement based on Drawing
    const getMinRequired = (drawing) => {
        if (drawing === 'RT-8746') return 535;
        return 500; // Default or as provided later
    };
    
    const minReq = getMinRequired(sample.sleeperType);
    const result = !isNaN(strengthVal) && testData.strength !== '' && strengthVal >= minReq ? 'Pass' : 'Fail';

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter MF Test Details: {sample.benchGangNumber}-{sample.mouldNo}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body">
                    <h5 style={{ margin: '0 0 16px 0', color: '#42818c', fontSize: '14px' }}>Declaration Summary</h5>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Batch No</span><div style={{ fontWeight: '700' }}>{sample.batchNo}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Casting Date</span><div style={{ fontWeight: '700' }}>{sample.castingDate}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Grade</span><div style={{ fontWeight: '700' }}>{sample.concreteGrade}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Drawing No</span><div style={{ fontWeight: '700', color: '#7c3aed' }}>{sample.sleeperType}</div></div>
                            <div style={{ gridColumn: 'span 3' }}><span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Sample Identification</span><div style={{ fontWeight: '800', color: '#42818c' }}>{sample.sampleIdentification}</div></div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', fontWeight: '700', color: '#92400e' }}>
                        Minimum MF Required for {sample.sleeperType}: {minReq} N/mm²
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                        <div className="input-group">
                            <label>Date of Testing</label>
                            <input type="date" value={testData.testingDate} onChange={e => setTestData({ ...testData, testingDate: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label>Strength (N/mm²)</label>
                                <input type="number" step="0.01" value={testData.strength} onChange={e => setTestData({ ...testData, strength: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="input-group">
                                <label>Result à Auto fill</label>
                                <input readOnly value={testData.strength ? result : 'PENDING'} style={{ color: result === 'Pass' ? '#059669' : '#dc2626', fontWeight: '900', background: '#f8fafc', textAlign: 'center' }} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Remarks à String</label>
                            <textarea value={testData.remarks} onChange={e => setTestData({ ...testData, remarks: e.target.value })} placeholder="Enter observations..." style={{ minHeight: '80px', padding: '12px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="btn-verify" disabled={saving} style={{ flex: 1 }} onClick={() => onSave({ ...testData, result })}>{saving ? 'Saving...' : 'Save & Finalize Test'}</button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MomentOfFailure;

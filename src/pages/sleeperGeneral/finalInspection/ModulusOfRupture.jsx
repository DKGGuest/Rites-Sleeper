import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import CollapsibleSection from '../../../components/common/CollapsibleSection';
import TrendChart from '../../../components/common/TrendChart';
import { apiService } from '../../../services/api';

const ModulusOfRupture = () => {
    const { userId } = useSelector(state => state.auth);
    const [viewMode, setViewMode] = useState('statistics'); // 'statistics', 'declared', 'tested'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [isModifying, setIsModifying] = useState(false);
    const [loading, setLoading] = useState(false);

    // API Data
    const [declaredSamples, setDeclaredSamples] = useState([]);
    const [testedSamples, setTestedSamples] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [samplesRes, testsRes] = await Promise.all([
                apiService.getAllMORSamples(),
                apiService.getAllMORTests()
            ]);

            setDeclaredSamples(samplesRes.responseData || []);
            setTestedSamples(testsRes.responseData || []);
        } catch (error) {
            console.error('Failed to fetch MOR data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Statistics Calculation
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
            lastSamplingDate: declaredSamples.length > 0 ? declaredSamples[0].samplingDate : 'N/A',
            lastTestDate: testedSamples.length > 0 ? testedSamples[0].testingDate : 'N/A'
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

    const saveDeclaration = async (formData) => {
        try {
            setLoading(true);
            if (isModifying) {
                await apiService.updateMORSample(selectedSample.id, {
                    ...formData,
                    updatedBy: userId || 118
                });
            } else {
                await apiService.createMORSample({
                    ...formData,
                    createdBy: userId || 118
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
            await apiService.createMORTest({
                ...testData,
                morSampleId: selectedSample.id,
                createdBy: userId || 118
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

    const isAgedForTesting = (samplingDate) => {
        if (!samplingDate) return false;
        const sampling = new Date(samplingDate);
        const today = new Date();
        const diffTime = today - sampling;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Using 0 for testing convenience if needed, but keeping 15 as per requirement
        return diffDays >= 15;
    };

    const columnsDeclared = [
        { key: 'samplingDate', label: 'Date of Sampling' },
        { key: 'concreteGrade', label: 'Concrete Grade' },
        { key: 'shedLine', label: 'Shed/Line No.' },
        { key: 'sampleIdentificationNumber', label: 'Sample Identification Number' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const canTest = isAgedForTesting(row.samplingDate);
                const isTested = testedSamples.some(t => t.morSampleId === row.id);
                
                if (isTested) return <span style={{ color: '#059669', fontSize: '10px', fontWeight: '700' }}>✓ TESTED</span>;

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isWithinHour(row.createdDate) && (
                            <button className="btn-save" style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => handleModifySample(row)}>Modify</button>
                        )}
                        <button
                            className="btn-verify"
                            style={{
                                fontSize: '10px',
                                padding: '4px 8px',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleEnterTestDetails(row)}
                        >
                            Enter Test Details
                        </button>
                    </div>
                );
            }
        }
    ];

    const columnsTested = [
        { key: 'samplingDate', label: 'Date of Sampling', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.morSampleId);
            return sample ? sample.samplingDate : '-';
        }},
        { key: 'testingDate', label: 'Date of Testing' },
        { key: 'sampleIdentificationNumber', label: 'Sample Identification', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.morSampleId);
            return sample ? sample.sampleIdentificationNumber : '-';
        }},
        { key: 'concreteGrade', label: 'Concrete Grade', render: (_, row) => {
            const sample = declaredSamples.find(s => s.id === row.morSampleId);
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
                {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
                
                {viewMode === 'statistics' && !loading && (
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
                        <TrendChart
                            data={testedSamples}
                            xKey="testingDate"
                            lines={[
                                { key: 'strength', color: '#3b82f6', label: 'Flexural Strength' }
                            ]}
                            title="Modulus of Rupture Trend"
                            description="Historical flexural strength results (N/mm²)"
                            yAxisLabel=""
                        />
                    </div>
                )}

                {viewMode === 'declared' && !loading && (
                    <div className="section-card fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>MOR Samples Pending Testing (15 Day Aging)</h4>
                            <button className="btn-verify" onClick={handleAddSample}>+ Add New Sample</button>
                        </div>
                        <EnhancedDataTable columns={columnsDeclared} data={declaredSamples} />
                    </div>
                )}

                {viewMode === 'tested' && !loading && (
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
                    saving={loading}
                />
            )}

            {showTestModal && (
                <MORTestDetailsModal
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

const MORSampleDeclarationModal = ({ sample, isModifying, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState(sample ? {
        samplingDate: sample.samplingDate,
        concreteGrade: sample.concreteGrade,
        plantType: sample.plantType,
        shedLine: sample.shedLine,
        sampleIdentificationNumber: sample.sampleIdentificationNumber
    } : {
        samplingDate: new Date().toISOString().split('T')[0],
        concreteGrade: '',
        plantType: '',
        shedLine: '',
        sampleIdentificationNumber: ''
    });

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify' : 'Declare'} MOR Sample</span>
                    <button className="form-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="form-modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
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
                            <label>Plant Type</label>
                            <select value={formData.plantType} onChange={e => setFormData({ ...formData, plantType: e.target.value })}>
                                <option value="">Select Plant</option>
                                <option>Long Line</option>
                                <option>Stress Bench</option>
                                <option>General</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Shed / Line</label>
                            <select value={formData.shedLine} onChange={e => setFormData({ ...formData, shedLine: e.target.value })}>
                                <option value="">Select Shed/Line</option>
                                <option>Shed 1</option>
                                <option>Shed 2</option>
                                <option>Line 1</option>
                                <option>Line 2</option>
                                <option>N/A</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Sample Identification Number</label>
                            <input type="text" value={formData.sampleIdentificationNumber} onChange={e => setFormData({ ...formData, sampleIdentificationNumber: e.target.value })} placeholder="e.g. MOR-2026-XYZ" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                        <button className="btn-verify" disabled={saving} style={{ flex: '1 1 200px' }} onClick={() => {
                            if (!formData.concreteGrade || !formData.plantType || !formData.shedLine || !formData.sampleIdentificationNumber) {
                                alert("Please fill in all mandatory fields (Grade, Plant, Shed/Line, and ID).");
                                return;
                            }
                            onSave(formData);
                        }}>{saving ? 'Saving...' : (isModifying ? 'Update Sample' : 'Save Declaration')}</button>
                        <button className="btn-save" style={{ flex: '1 1 200px', background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MORTestDetailsModal = ({ sample, onClose, onSave, saving }) => {
    const [testData, setTestData] = useState({
        testingDate: new Date().toISOString().split('T')[0],
        weight: '',
        loadKn: '',
        strength: '',
        remarks: ''
    });

    const result = parseFloat(testData.strength) >= 6.0 ? 'Pass' : 'Fail'; // Example limit 6.0

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Enter MOR Test Details: {sample.sampleIdentificationNumber}</span>
                    <button className="form-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="form-modal-body">
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Sampling Date</span><div style={{ fontWeight: '700' }}>{sample.samplingDate}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Grade</span><div style={{ fontWeight: '700' }}>{sample.concreteGrade}</div></div>
                            <div><span style={{ fontSize: '10px', color: '#64748b' }}>Identification</span><div style={{ fontWeight: '700' }}>{sample.sampleIdentificationNumber}</div></div>
                        </div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Date of Testing</label>
                            <input type="date" value={testData.testingDate} onChange={e => setTestData({ ...testData, testingDate: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Weight (in Kgs)</label>
                            <input type="number" step="0.01" value={testData.weight} onChange={e => setTestData({ ...testData, weight: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Load in KN</label>
                            <input type="number" step="0.01" value={testData.loadKn} onChange={e => setTestData({ ...testData, loadKn: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Strength (N/mm²)</label>
                            <input type="number" step="0.01" value={testData.strength} onChange={e => setTestData({ ...testData, strength: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Result (Auto)</label>
                            <input readOnly value={testData.strength ? result : 'PENDING'} style={{ color: result === 'Pass' ? '#059669' : '#dc2626', fontWeight: '800', background: '#f8fafc' }} />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Remarks</label>
                            <textarea value={testData.remarks} onChange={e => setTestData({ ...testData, remarks: e.target.value })} style={{ minHeight: '60px', padding: '12px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                        <button className="btn-verify" disabled={saving} style={{ flex: '1 1 200px' }} onClick={() => onSave({ ...testData, result })}>{saving ? 'Saving...' : 'Save Test Results'}</button>
                        <button className="btn-save" style={{ flex: '1 1 200px', background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulusOfRupture;

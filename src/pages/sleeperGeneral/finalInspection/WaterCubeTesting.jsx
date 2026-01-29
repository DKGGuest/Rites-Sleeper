import React, { useState, useMemo } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';

// Mock Data for Batches manufactured in plant
const MOCK_MANUFACTURED_BATCHES = [
    { batchNo: 'B-701', date: '2026-01-20', grade: 'M55', sleepers: 160, typesCount: 1 },
    { batchNo: 'B-702', date: '2026-01-21', grade: 'M60', sleepers: 160, typesCount: 2 },
    { batchNo: 'B-703', date: '2026-01-22', grade: 'M55', sleepers: 80, typesCount: 1 },
];

export const WaterCubeStats = ({ mini = false }) => {
    const stats = {
        readyCount: 12,
        pendingSamples: 8,
        avgStrength: 58.4,
        minStrength: 52.1,
        maxStrength: 64.2,
        deviation: 4.2
    };

    if (mini) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Avg</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{stats.avgStrength}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Pending</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#42818c' }}>{stats.pendingSamples}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', margin: 0 }}>Water Cube Statistics</h3>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Monitor strength metrics and testing readiness</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select className="dash-select" style={{ fontSize: '11px', padding: '4px 8px' }}><option>All Grades</option><option>M55</option><option>M60</option></select>
                    <input type="date" className="dash-select" style={{ fontSize: '11px', padding: '4px 8px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                {[
                    { label: 'Batches Ready (>15d)', value: stats.readyCount, color: '#1e293b' },
                    { label: 'Pending Samples', value: stats.pendingSamples, color: '#42818c' },
                    { label: 'Avg Strength (N/mm²)', value: stats.avgStrength, color: '#1e293b' },
                    { label: 'Min Strength', value: stats.minStrength, color: '#ef4444' },
                    { label: 'Max Strength', value: stats.maxStrength, color: '#059669' },
                    { label: 'Deviation %', value: `${stats.deviation}%`, color: '#f59e0b' },
                ].map((s, idx) => (
                    <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{s.label}</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WaterCubeTesting = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'declaration', 'pending', 'done'
    const [showDeclareModal, setShowDeclareModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showTestModal, setShowTestModal] = useState(false);
    const [isModifying, setIsModifying] = useState(false);

    const [declaredBatches, setDeclaredBatches] = useState([
        {
            batchNo: 'B-690', grade: 'M55', castingDate: '2026-01-01',
            declarationTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10h ago
            sample1Raw: [{ bench: '201', seq: 'A' }, { bench: '210', seq: 'B' }, { bench: '315', seq: 'D' }],
            sample2Raw: [{ bench: '209', seq: 'D' }, { bench: '415', seq: 'B' }, { bench: '410', seq: 'B' }],
            sample1: ['201A', '210B', '315D'], sample2: ['209D', '415B', '410B'],
            status: 'Testing Pending'
        },
        {
            batchNo: 'B-705', grade: 'M60', castingDate: new Date().toISOString().split('T')[0],
            declarationTime: new Date().toISOString(),
            sample1Raw: [{ bench: '101', seq: 'A' }, { bench: '102', seq: 'A' }, { bench: '103', seq: 'A' }],
            sample2Raw: [{ bench: '104', seq: 'A' }, { bench: '105', seq: 'A' }, { bench: '106', seq: 'A' }],
            sample1: ['101A', '102A', '103A'], sample2: ['104A', '105A', '106A'],
            status: 'Not Eligible for Testing'
        }
    ]);

    const pendingColumns = [
        { key: 'batchNo', label: 'Batch Number' },
        { key: 'grade', label: 'Grade' },
        { key: 'castingDate', label: 'Date of Casting' },
        {
            key: 'sample1',
            label: 'Sample 1 - 3 Cubes',
            render: (val) => <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{val.join(', ')}</span>
        },
        {
            key: 'sample2',
            label: 'Sample 2 - 3 Cubes',
            render: (val) => <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{val.join(', ')}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, row) => {
                const diffDays = Math.floor((new Date() - new Date(row.castingDate)) / (1000 * 60 * 60 * 24));
                const isEligible = diffDays >= 15;
                const displayStatus = isEligible ? 'Testing Pending' : 'Not Eligible for Testing';

                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: isEligible ? '#ecfdf5' : '#fef2f2',
                        color: isEligible ? '#059669' : '#dc2626'
                    }}>
                        {displayStatus}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const canModify = (new Date() - new Date(row.declarationTime)) < (24 * 60 * 60 * 1000);
                const isEligible = Math.floor((new Date() - new Date(row.castingDate)) / (1000 * 60 * 60 * 24)) >= 15;

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {canModify && (
                            <button
                                className="btn-save"
                                onClick={() => { setSelectedBatch(row); setIsModifying(true); setShowDeclareModal(true); }}
                                style={{ fontSize: '10px', padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                            >
                                Modify
                            </button>
                        )}
                        {isEligible && (
                            <button
                                className="btn-verify"
                                onClick={() => { setSelectedBatch(row); setShowTestModal(true); }}
                                style={{ fontSize: '10px', padding: '4px 10px' }}
                            >
                                Save Test Details
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const declarationColumns = [
        { key: 'batchNo', label: 'Batch No' },
        { key: 'date', label: 'Date of Casting' },
        { key: 'grade', label: 'Grade' },
        { key: 'sleepers', label: 'Sleepers in Batch' },
        { key: 'typesCount', label: 'Sleeper Types' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    onClick={() => { setSelectedBatch(row); setIsModifying(false); setShowDeclareModal(true); }}
                >
                    Declare Samples
                </button>
            )
        }
    ];

    return (
        <div className="water-cube-module cement-forms-scope">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Water Cured Cube Strength</h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Sub Card- 4 (Final Inspection)</span>
                </div>
            </header>

            <WaterCubeStats />

            <div className="nav-tabs" style={{ marginBottom: '24px', justifyContent: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <button className={`nav-tab ${activeTab === 'declaration' ? 'active' : ''}`} onClick={() => setActiveTab('declaration')}>
                    Declare Samples for Testing
                </button>
                <button className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    List of Batch remaining for Testing
                </button>
                <button className={`nav-tab ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>
                    List of Testing Done
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'declaration' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Batches Pending Sample Declaration</h4>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>* Source: SCADA / Vendor Module</span>
                        </div>
                        <EnhancedDataTable columns={declarationColumns} data={MOCK_MANUFACTURED_BATCHES} selectable={false} />
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#475569' }}>Batches with Declared Samples</h4>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>* Modify available for 24h from declaration</span>
                        </div>
                        <EnhancedDataTable columns={pendingColumns} data={declaredBatches} selectable={false} />
                    </div>
                )}

                {activeTab === 'done' && (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '100px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📜</div>
                        <h4 style={{ color: '#475569', marginBottom: '8px' }}>Historical Strength Logs</h4>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Completed tests will appear here once verified.</p>
                    </div>
                )}
            </div>

            {/* Declaration Modal */}
            {showDeclareModal && (
                <SampleDeclarationModal
                    batch={selectedBatch}
                    isModifying={isModifying}
                    onClose={() => setShowDeclareModal(false)}
                    onSave={(data) => {
                        if (isModifying) {
                            setDeclaredBatches(prev => prev.map(b => b.batchNo === data.batchNo ? { ...b, ...data } : b));
                        } else {
                            setDeclaredBatches([{ ...data, declarationTime: new Date().toISOString() }, ...declaredBatches]);
                        }
                        setShowDeclareModal(false);
                    }}
                />
            )}

            {/* Test Entry Modal */}
            {showTestModal && (
                <TestEntryModal
                    batch={selectedBatch}
                    onClose={() => setShowTestModal(false)}
                    onSave={() => {
                        // Normally move to 'done' list
                        setShowTestModal(false);
                        alert('Test data saved successfully!');
                    }}
                />
            )}
        </div>
    );
};

const SampleDeclarationModal = ({ batch, isModifying, onClose, onSave }) => {
    const [form, setForm] = useState({
        sample1: isModifying ? batch.sample1Raw : [{ bench: '', seq: 'A' }, { bench: '', seq: 'A' }, { bench: '', seq: 'A' }],
        sample2: isModifying ? batch.sample2Raw : [{ bench: '', seq: 'A' }, { bench: '', seq: 'A' }, { bench: '', seq: 'A' }]
    });

    const sequences = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const handleUpdate = (sampleIdx, cubeIdx, field, val) => {
        const key = `sample${sampleIdx + 1}`;
        const updated = [...form[key]];
        updated[cubeIdx][field] = val;
        setForm({ ...form, [key]: updated });
    };

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify Sample Details' : 'Sample Declaration Form'}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div className="form-grid">
                            <div className="input-group"><label>Batch Number</label><input readOnly value={batch?.batchNo} className="readOnly" /></div>
                            <div className="input-group"><label>Date of Casting</label><input readOnly value={batch?.castingDate || batch?.date} className="readOnly" /></div>
                            <div className="input-group"><label>Concrete Grade</label><input readOnly value={batch?.grade} className="readOnly" /></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {[0, 1].map(sIdx => (
                            <div key={sIdx} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontSize: '13px', color: '#42818c', marginBottom: '16px', fontWeight: '700' }}>
                                    Sample {sIdx + 1} (3 Cubes)
                                </h4>
                                {form[`sample${sIdx + 1}`].map((c, cIdx) => (
                                    <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', marginBottom: '12px' }}>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                placeholder="Bench Number"
                                                value={c.bench}
                                                onChange={(e) => handleUpdate(sIdx, cIdx, 'bench', e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <select value={c.seq} onChange={(e) => handleUpdate(sIdx, cIdx, 'seq', e.target.value)}>
                                                <optgroup label="Single Bench">
                                                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </optgroup>
                                                <optgroup label="Twin Bench">
                                                    {['E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                        <button className="btn-verify" style={{ flex: 1, height: '44px' }} onClick={() => onSave({
                            batchNo: batch.batchNo,
                            grade: batch.grade,
                            castingDate: batch.castingDate || batch.date,
                            sample1Raw: form.sample1,
                            sample2Raw: form.sample2,
                            sample1: form.sample1.map(c => `${c.bench}${c.seq}`),
                            sample2: form.sample2.map(c => `${c.bench}${c.seq}`),
                            status: Math.floor((new Date() - new Date(batch.castingDate || batch.date)) / (1000 * 60 * 60 * 24)) >= 15 ? 'Testing Pending' : 'Not Eligible for Testing'
                        })}>
                            {isModifying ? 'Update Declaration' : 'Save Declaration'}
                        </button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', height: '44px' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

import WaterCuredCubeForm from './WaterCuredCubeForm';

const TestEntryModal = ({ batch, onClose, onSave }) => {
    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '95vw', width: '1200px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Water Cured Cube Testing - Batch {batch.batchNo}</span>
                    <button className="form-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                    <WaterCuredCubeForm
                        batch={batch}
                        onSave={(data) => {
                            console.log('Final Test Data:', data);
                            onSave(data);
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default WaterCubeTesting;

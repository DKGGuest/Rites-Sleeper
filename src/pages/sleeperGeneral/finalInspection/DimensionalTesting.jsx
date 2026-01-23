import React, { useState, useMemo } from 'react';
import EnhancedDataTable from '../../../components/EnhancedDataTable';

const MOCK_DIMENSIONAL_DATA = [
    { id: 1, batchNo: '601', batchTotal: 300, sleeperType: 'RT 8746', typeQty: 255, testedPct: 87, status: 'Pending', date: '-', spec: 'T-39' },
    { id: 2, batchNo: '601', batchTotal: 300, sleeperType: 'RT 4865', typeQty: 45, testedPct: 100, status: 'Completed as Required', date: '2026-01-23', spec: 'T-45' },
    { id: 3, batchNo: '605', batchTotal: 160, sleeperType: 'RT 8746', typeQty: 160, testedPct: 0, status: 'Pending', date: '-', spec: 'T-39' },
    { id: 4, batchNo: '606', batchTotal: 160, sleeperType: 'RT 4865', typeQty: 160, testedPct: 5, status: 'Under Inspection', date: '-', spec: 'T-45' },
    { id: 5, batchNo: '607', batchTotal: 240, sleeperType: 'RT 8527', typeQty: 240, testedPct: 0, status: 'Pending', date: '-', spec: 'T-39' },
];

import VisualInspectionForm from './VisualInspectionForm';
import CriticalDimensionForm from './CriticalDimensionForm';

const DimensionalTesting = ({ type }) => {
    const [showForm, setShowForm] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const config = {
        visual: { title: 'Visual Check & Measurement', criteria: '100% Mandatory' },
        critical: { title: 'Critical Dimensions', criteria: '10% (T-39) / 20% (T-45)' },
        noncritical: { title: 'Non-Critical Dimensions', criteria: '1% (T-39) / 5% (T-45)' }
    };

    const currentConfig = config[type] || config.visual;

    const columns = [
        { key: 'batchNo', label: 'Batch No.' },
        { key: 'batchTotal', label: 'Total Batch Qty' },
        { key: 'sleeperType', label: 'Type of Sleeper' },
        { key: 'typeQty', label: 'No. of Sleepers (Type)' },
        {
            key: 'testedPct',
            label: 'Tested (%)',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{ height: '100%', width: `${val}%`, background: val === 100 ? '#059669' : '#42818c' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700' }}>{val}%</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status of Testing',
            render: (val) => {
                const colors = {
                    'Pending': { bg: '#fff7ed', color: '#c2410c' },
                    'Under Inspection': { bg: '#eff6ff', color: '#1d4ed8' },
                    'Completed as Required': { bg: '#ecfdf5', color: '#059669' }
                };
                const style = colors[val] || colors.Pending;
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.color}22`
                    }}>
                        {val}
                    </span>
                );
            }
        },
        { key: 'date', label: 'Date of Testing' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    onClick={() => { setSelectedBatch(row); setShowForm(true); }}
                    style={{ padding: '6px 14px', fontSize: '11px' }}
                >
                    Open Test Form
                </button>
            )
        }
    ];

    // Simulate sleeper numbers for the form
    const sleeperNumbers = useMemo(() => {
        if (!selectedBatch) return [];
        return Array.from({ length: 15 }, (_, i) => ({
            batch: selectedBatch.batchNo,
            sleeperNo: `${selectedBatch.batchNo}/${String(i + 1).padStart(3, '0')}`,
            status: i < (selectedBatch.typeQty * selectedBatch.testedPct / 100) ? 'Tested' : 'Pending'
        }));
    }, [selectedBatch]);

    const targetPct = useMemo(() => {
        if (!selectedBatch) return '100%';
        if (type === 'visual') return '100%';
        if (type === 'critical') return selectedBatch.spec === 'T-39' ? '10%' : '20%';
        if (type === 'noncritical') return selectedBatch.spec === 'T-39' ? '1%' : '5%';
        return '100%';
    }, [selectedBatch, type]);

    return (
        <div className="dimensional-testing-root cement-forms-scope">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#42818c', margin: 0 }}>{currentConfig.title}</h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Completion Criteria: {currentConfig.criteria}</span>
                </div>
            </header>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px' }}>Batches Pending Dimensional Testing</h4>
                    <div style={{ fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: '4px' }}>
                        * Automated population via SCADA / Production Logs
                    </div>
                </div>
                <EnhancedDataTable columns={columns} data={MOCK_DIMENSIONAL_DATA} />
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: (type === 'visual' || type === 'critical') ? '1200px' : '900px' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">{currentConfig.title} - {(type === 'visual' || type === 'critical') ? 'Full Inspection Form' : 'Batch Detail'}</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                            {type === 'visual' ? (
                                <VisualInspectionForm
                                    batch={selectedBatch}
                                    onSave={() => { setShowForm(false); alert('Visual Inspection data saved.'); }}
                                    onCancel={() => setShowForm(false)}
                                />
                            ) : type === 'critical' ? (
                                <CriticalDimensionForm
                                    batch={selectedBatch}
                                    targetPercentage={targetPct}
                                    onSave={() => { setShowForm(false); alert('Critical Dimension data saved.'); }}
                                    onCancel={() => setShowForm(false)}
                                />
                            ) : (
                                <>
                                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                        <div><label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Batch Number</label><div style={{ fontWeight: '700', color: '#13343b' }}>{selectedBatch?.batchNo}</div></div>
                                        <div><label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Sleeper Type</label><div style={{ fontWeight: '700', color: '#13343b' }}>{selectedBatch?.sleeperType}</div></div>
                                        <div><label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Design Spec</label><div style={{ fontWeight: '700', color: '#42818c' }}>{selectedBatch?.spec}</div></div>
                                        <div><label style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Target (%)</label><div style={{ fontWeight: '700', color: '#c2410c' }}>{targetPct}</div></div>
                                    </div>

                                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h5 style={{ margin: 0, color: '#475569' }}>Individual Sleeper Records</h5>
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#42818c' }}>{selectedBatch?.testedPct}% Complete</span>
                                        </div>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table className="ui-table">
                                                <thead>
                                                    <tr>
                                                        <th>Batch No</th>
                                                        <th>Sleeper No</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sleeperNumbers.map((s, idx) => (
                                                        <tr key={idx}>
                                                            <td>{s.batch}</td>
                                                            <td style={{ fontWeight: '700' }}>{s.sleeperNo}</td>
                                                            <td>
                                                                <span style={{
                                                                    fontSize: '9px',
                                                                    fontWeight: '700',
                                                                    color: s.status === 'Tested' ? '#059669' : '#94a3b8',
                                                                    background: s.status === 'Tested' ? '#ecfdf5' : '#f1f5f9',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '10px'
                                                                }}>
                                                                    {s.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn-verify"
                                                                    style={{ padding: '2px 10px', fontSize: '9px' }}
                                                                    onClick={() => alert(`Opening measurements for ${s.sleeperNo}`)}
                                                                >
                                                                    {s.status === 'Tested' ? 'View Measurements' : 'Start Test'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                        <button className="btn-verify" style={{ flex: 1, height: '44px' }} onClick={() => setShowForm(false)}>Save Progress</button>
                                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', height: '44px' }} onClick={() => setShowForm(false)}>Close</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DimensionalTesting;

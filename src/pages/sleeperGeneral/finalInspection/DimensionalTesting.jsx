import React, { useState, useMemo } from 'react';
import EnhancedDataTable from '../../../components/EnhancedDataTable';

const MOCK_DIMENSIONAL_DATA = [
    { id: 1, batchNo: '601', batchTotal: 300, sleeperType: 'RT 8746', typeQty: 255, testedPct: 87, status: 'Under Inspection', date: '-', spec: 'T-39' },
    { id: 2, batchNo: '601', batchTotal: 300, sleeperType: 'RT 4865', typeQty: 45, testedPct: 100, status: 'Completed as Required', date: '2026-01-23', spec: 'T-45' },
    { id: 3, batchNo: '605', batchTotal: 160, sleeperType: 'RT 8746', typeQty: 160, testedPct: 0, status: 'Pending', date: '-', spec: 'T-39' },
    { id: 4, batchNo: '606', batchTotal: 160, sleeperType: 'RT 4865', typeQty: 160, testedPct: 5, status: 'Under Inspection', date: '-', spec: 'T-45' },
    { id: 5, batchNo: '607', batchTotal: 240, sleeperType: 'RT 8527', typeQty: 240, testedPct: 0, status: 'Pending', date: '-', spec: 'T-39' },
];

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
        { key: 'sleeperType', label: 'Sleeper Type' },
        { key: 'typeQty', label: 'Qty of Type' },
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
            label: 'Inspection Status',
            render: (val) => {
                const colors = {
                    'Pending': { bg: '#f1f5f9', color: '#64748b' },
                    'Under Inspection': { bg: '#eff6ff', color: '#1d4ed8' },
                    'Completed as Required': { bg: '#ecfdf5', color: '#059669' }
                };
                const style = colors[val] || colors.Pending;
                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: style.bg,
                        color: style.color
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
                    style={{ padding: '4px 12px', fontSize: '10px' }}
                >
                    Open Test Form
                </button>
            )
        }
    ];

    return (
        <div className="dimensional-testing-root cement-forms-scope">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#42818c', margin: 0 }}>{currentConfig.title}</h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Completion Target: {currentConfig.criteria}</span>
                </div>
            </header>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#475569' }}>Batches Pending Inspection</h4>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>* Lists entries based on SCADA & Vendor modules</div>
                </div>
                <EnhancedDataTable columns={columns} data={MOCK_DIMENSIONAL_DATA} />
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">{currentConfig.title} - Form Entry</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <div className="form-modal-body">
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                <div><label style={{ fontSize: '10px' }}>Batch No</label><div style={{ fontWeight: '700' }}>{selectedBatch?.batchNo}</div></div>
                                <div><label style={{ fontSize: '10px' }}>Sleeper Type</label><div style={{ fontWeight: '700' }}>{selectedBatch?.sleeperType}</div></div>
                                <div><label style={{ fontSize: '10px' }}>Spec/Rule</label><div style={{ fontWeight: '700', color: '#42818c' }}>{selectedBatch?.spec}</div></div>
                                <div><label style={{ fontSize: '10px' }}>Target</label><div style={{ fontWeight: '700' }}>{selectedBatch?.spec === 'T-39' ? (type === 'critical' ? '10%' : '1%') : (type === 'critical' ? '20%' : '5%')}</div></div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📝</div>
                                <h4>Detailed {currentConfig.title} Form</h4>
                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Load data points specific to {selectedBatch?.sleeperType} ({selectedBatch?.spec})</p>
                                <button className="btn-verify" style={{ marginTop: '20px' }} onClick={() => setShowForm(false)}>Save Progress</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DimensionalTesting;

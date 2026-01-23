import React, { useState, useMemo } from 'react';
import EnhancedDataTable from '../../../components/EnhancedDataTable';

const MOCK_MOR_SCADA_DATA = [
    {
        id: 1,
        shedNo: 'SH-01',
        castingInfo: '2026-01-20 (Shift A)',
        batchNo: 'B-650',
        noOfCubes: 3,
        avgStrength: 6.2,
        minMax: '5.8 - 6.5',
        status: 'Data Imported from Scada',
        result: 'PASS'
    },
    {
        id: 2,
        shedNo: 'SH-02',
        castingInfo: '2026-01-20 (Shift B)',
        batchNo: 'B-651',
        noOfCubes: 2,
        avgStrength: 5.4,
        minMax: '5.2 - 5.6',
        status: 'Data Import from Scada Under Process',
        result: 'PENDING'
    },
    {
        id: 3,
        shedNo: 'SH-01',
        castingInfo: '2026-01-19 (Shift A)',
        batchNo: 'B-644',
        noOfCubes: 3,
        avgStrength: 6.4,
        minMax: '6.1 - 6.7',
        status: 'Testing Completed',
        result: 'PASS'
    },
    {
        id: 4,
        shedNo: 'SH-03',
        castingInfo: '2026-01-21 (Shift A)',
        batchNo: 'B-660',
        noOfCubes: 0,
        avgStrength: 0,
        minMax: '-',
        status: 'Pending',
        result: '-'
    }
];

const ModulusOfRupture = ({ onBack }) => {
    const [data, setData] = useState(MOCK_MOR_SCADA_DATA);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Testing Completed':
                return { bg: '#ecfdf5', color: '#059669' };
            case 'Data Imported from Scada':
                return { bg: '#eff6ff', color: '#1d4ed8' };
            case 'Data Import from Scada Under Process':
                return { bg: '#fff7ed', color: '#c2410c' };
            default:
                return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const handleVerify = (entry) => {
        setSelectedEntry(entry);
        setShowVerifyModal(true);
    };

    const confirmVerification = () => {
        setData(prev => prev.map(item =>
            item.id === selectedEntry.id
                ? { ...item, status: 'Testing Completed' }
                : item
        ));
        setShowVerifyModal(false);
        setSelectedEntry(null);
    };

    const columns = [
        { key: 'shedNo', label: 'Shed No.' },
        { key: 'castingInfo', label: 'Date & Shift of Casting' },
        { key: 'batchNo', label: 'Batch No.' },
        { key: 'noOfCubes', label: 'No. of Cubes' },
        { key: 'avgStrength', label: 'Avg. Strength (N/mm²)' },
        { key: 'minMax', label: 'Min & Max Strength' },
        {
            key: 'status',
            label: 'Testing Status',
            render: (val) => {
                const style = getStatusStyle(val);
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
        {
            key: 'result',
            label: 'Testing Result',
            render: (val) => (
                <span style={{
                    fontWeight: '700',
                    color: val === 'PASS' ? '#059669' : val === 'FAIL' ? '#dc2626' : '#94a3b8'
                }}>
                    {val}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    disabled={row.status !== 'Data Imported from Scada'}
                    onClick={() => handleVerify(row)}
                    style={{
                        padding: '4px 12px',
                        fontSize: '10px',
                        opacity: row.status === 'Data Imported from Scada' ? 1 : 0.5,
                        cursor: row.status === 'Data Imported from Scada' ? 'pointer' : 'not-allowed'
                    }}
                >
                    {row.status === 'Testing Completed' ? 'Verified' : 'Verify Details'}
                </button>
            )
        }
    ];

    return (
        <div className="mor-module cement-forms-scope">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button className="back-button" onClick={onBack} style={{ padding: '8px' }}>← Back</button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Modulus of Rupture (Sub Card 5)</h2>
            </header>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0 }}>SCADA Sync History</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#42818c', background: '#f0f9fa', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                            SCADA Connection: Active
                        </span>
                    </div>
                </div>
                <EnhancedDataTable columns={columns} data={data} />
            </div>

            {showVerifyModal && (
                <div className="form-modal-overlay" onClick={() => setShowVerifyModal(false)}>
                    <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Verify MOR Test Details (SCADA Import)</span>
                            <button className="form-modal-close" onClick={() => setShowVerifyModal(false)}>×</button>
                        </div>
                        <div className="form-modal-body">
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Batch Number</div>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{selectedEntry?.batchNo}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Casting Info</div>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{selectedEntry?.castingInfo}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Avg. Strength</div>
                                        <div style={{ fontWeight: '700', color: '#42818c', fontSize: '18px' }}>{selectedEntry?.avgStrength} N/mm²</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Test Status</div>
                                        <div style={{ fontWeight: '700', color: '#1d4ed8' }}>READY FOR VERIFICATION</div>
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '24px' }}>
                                By clicking Confirm, you verify that the data automatically imported from the SCADA system is accurate and complete for this batch.
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-verify" style={{ flex: 1, padding: '10px' }} onClick={confirmVerification}>Confirm & Complete Testing</button>
                                <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none' }} onClick={() => setShowVerifyModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModulusOfRupture;

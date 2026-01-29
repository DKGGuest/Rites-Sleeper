import React, { useState } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import { MOCK_INVENTORY } from '../../../utils/rawMaterialMockData';

const IncomingVerificationDashboard = () => {
    const [selectedMaterial, setSelectedMaterial] = useState(null); // 'CEMENT', 'HTS', etc.
    const [viewModal, setViewModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [inventory, setInventory] = useState(MOCK_INVENTORY);

    const materials = [
        { id: 'CEMENT', title: 'Cement', unit: 'MT' },
        { id: 'HTS', title: 'HTS Wire', unit: 'Coils' },
        { id: 'AGGREGATES', title: 'Aggregates', unit: 'Cum' },
        { id: 'ADMIXTURE', title: 'Admixture', unit: 'Litres' },
        { id: 'SGCI', title: 'SGCI Insert', unit: 'Nos' },
        { id: 'DOWEL', title: 'Dowel', unit: 'Nos' },
    ];

    const getStats = (matId) => {
        const items = inventory[matId] || [];
        const pending = items.filter(i => i.status === 'Unverified').length;
        // Mock balance calculation (sum of qty string)
        const total = items.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
        return { pending, balance: `${total} ${materials.find(m => m.id === matId).unit}` };
    };

    const handleVerify = () => {
        if (!selectedEntry) return;

        const now = new Date();
        const verificationInfo = {
            status: 'Verified',
            verifiedBy: 'Inspecting Engineer (IE)',
            verifiedAt: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };

        const updatedInventory = {
            ...inventory,
            [selectedMaterial]: inventory[selectedMaterial].map(item =>
                item.id === selectedEntry.id ? { ...item, ...verificationInfo } : item
            )
        };

        setInventory(updatedInventory);
        setSelectedEntry({ ...selectedEntry, ...verificationInfo });
        setViewModal(false);
        alert('Inventory entry verified successfully and locked.');
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'consignmentNo', label: 'Consignment No' },
        { key: 'qty', label: 'Quantity' },
        { key: 'receivedDate', label: 'Received Date' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: val === 'Verified' ? '#ecfdf5' : '#fff7ed',
                    color: val === 'Verified' ? '#059669' : '#c2410c',
                    border: `1px solid ${val === 'Verified' ? '#10b98133' : '#f9731633'}`
                }}>
                    {val}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Action',
            render: (_, row) => (
                <button
                    className="btn-save"
                    onClick={() => { setSelectedEntry(row); setViewModal(true); }}
                    style={{ fontSize: '11px', padding: '6px 14px', width: 'auto' }}
                >
                    View Details
                </button>
            )
        }
    ];

    if (selectedMaterial) {
        return (
            <div className="verification-list-view cement-forms-scope">
                <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button className="back-button" onClick={() => setSelectedMaterial(null)} style={{ padding: '8px' }}>← Back</button>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                            {materials.find(m => m.id === selectedMaterial).title} Verification
                        </h2>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Verification of incoming material consignments</span>
                    </div>
                </header>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <EnhancedDataTable columns={columns} data={inventory[selectedMaterial] || []} />
                </div>

                {viewModal && selectedEntry && (
                    <div className="form-modal-overlay" onClick={() => setViewModal(false)}>
                        <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="form-modal-header">
                                <span className="form-modal-header-title">Incoming Verification: {selectedEntry.id}</span>
                                <button className="form-modal-close" onClick={() => setViewModal(false)}>×</button>
                            </div>
                            <div className="form-modal-body">
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#42818c' }}>Consignment Details</h4>
                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        <div><label style={{ fontSize: '11px', color: '#64748b' }}>Vendor</label><div style={{ fontWeight: '600' }}>{selectedEntry.vendor}</div></div>
                                        <div><label style={{ fontSize: '11px', color: '#64748b' }}>Consignment No</label><div style={{ fontWeight: '600' }}>{selectedEntry.consignmentNo}</div></div>
                                        <div><label style={{ fontSize: '11px', color: '#64748b' }}>Quantity</label><div style={{ fontWeight: '600' }}>{selectedEntry.qty}</div></div>
                                        <div><label style={{ fontSize: '11px', color: '#64748b' }}>Received Date</label><div style={{ fontWeight: '600' }}>{selectedEntry.receivedDate}</div></div>
                                        {selectedEntry.lotNo && <div><label style={{ fontSize: '11px', color: '#64748b' }}>Lot No</label><div style={{ fontWeight: '600' }}>{selectedEntry.lotNo}</div></div>}
                                        {selectedEntry.coilNo && <div><label style={{ fontSize: '11px', color: '#64748b' }}>Coil No</label><div style={{ fontWeight: '600' }}>{selectedEntry.coilNo}</div></div>}
                                    </div>
                                </div>

                                {selectedEntry.status === 'Verified' && (
                                    <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '12px', border: '1px solid #10b98133', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '20px' }}>🛡️</div>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>VERIFIED & LOCKED</div>
                                            <div style={{ fontSize: '10px', color: '#065f46' }}>By {selectedEntry.verifiedBy} on {selectedEntry.verifiedAt}</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {selectedEntry.status === 'Unverified' ? (
                                        <button className="btn-verify" style={{ flex: 1, height: '44px' }} onClick={handleVerify}>Verify & Lock Entry</button>
                                    ) : (
                                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#94a3b8', border: 'none', cursor: 'not-allowed', height: '44px' }} disabled>Already Verified</button>
                                    )}
                                    <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', height: '44px' }} onClick={() => setViewModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="verification-dashboard">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Incoming Raw Material Verification</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Verify vendor-entered inventory certificates to make materials eligible for production.</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {materials.map(mat => {
                    const stats = getStats(mat.id);
                    return (
                        <div
                            key={mat.id}
                            onClick={() => setSelectedMaterial(mat.id)}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="hover-card"
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: stats.pending > 0 ? '#f59e0b' : '#059669' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: 0 }}>{mat.title}</h3>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Consignments</span>
                                </div>
                                <div style={{
                                    background: stats.pending > 0 ? '#fff7ed' : '#ecfdf5',
                                    color: stats.pending > 0 ? '#c2410c' : '#059669',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                }}>
                                    {stats.pending > 0 ? `${stats.pending} Pending` : 'All Verified'}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>INV BALANCE</div>
                                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#13343b' }}>{stats.balance}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <button className="btn-verify" style={{ height: '36px', padding: '0 16px', fontSize: '11px' }}>
                                        Open List
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .hover-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    border-color: #42818c66;
                }
            `}</style>
        </div>
    );
};

export default IncomingVerificationDashboard;

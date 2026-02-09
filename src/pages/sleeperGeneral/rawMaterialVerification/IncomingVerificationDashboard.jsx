import React, { useState } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import { MOCK_INVENTORY } from '../../../utils/rawMaterialMockData';

const IncomingVerificationDashboard = () => {
    const [selectedMaterial, setSelectedMaterial] = useState(null); // 'CEMENT', 'HTS', etc.
    const [viewModal, setViewModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [inventory, setInventory] = useState(MOCK_INVENTORY);
    const [statusFilter, setStatusFilter] = useState('Unverified'); // 'Unverified', 'Verified', 'Rejected'

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

        updateInventoryStatus(verificationInfo);
        alert('Inventory entry verified successfully.');
    };

    const handleReject = () => {
        if (!selectedEntry) return;

        const now = new Date();
        const rejectionInfo = {
            status: 'Rejected',
            verifiedBy: 'Inspecting Engineer (IE)',
            verifiedAt: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };

        updateInventoryStatus(rejectionInfo);
        alert('Inventory entry rejected.');
    };

    const updateInventoryStatus = (info) => {
        const updatedInventory = {
            ...inventory,
            [selectedMaterial]: inventory[selectedMaterial].map(item =>
                item.id === selectedEntry.id ? { ...item, ...info } : item
            )
        };

        setInventory(updatedInventory);
        setSelectedEntry({ ...selectedEntry, ...info });
        setViewModal(false);
    };

    const getMainColumns = (matId) => {
        const baseColumns = [
            {
                key: 'receivedDate',
                label: 'Date of Receiving',
                render: (_, row) => row.receivedDate ? row.receivedDate.split('-').reverse().join('/') : 'N/A'
            },
            {
                key: 'invoiceNo',
                label: matId === 'AGGREGATES' ? 'Challan No' : 'Invoice / Bill No',
                render: (_, row) => row.invoiceNo || row.challanNo || 'N/A'
            },
            {
                key: 'batchLot',
                label: matId === 'HTS' ? 'Coil Details' : 'Batch / Lot No',
                render: (_, row) => {
                    if (matId === 'HTS' && row.coils) {
                        return <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{row.coils.length} Coils</span>;
                    }
                    if (matId === 'CEMENT' && row.batches) {
                        return <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{row.batches.length} Batches</span>;
                    }
                    return row.batchNo || row.lotNo || row.serialNoCoils || 'N/A';
                }
            },
        ];

        // Specific column for RITES materials
        if (['HTS', 'SGCI', 'DOWEL'].includes(matId)) {
            baseColumns.push({
                key: 'ritesInfo',
                label: 'RITES IC & Date',
                render: (_, row) => row.ritesIcNo ? `${row.ritesIcNo} (${row.ritesIcDate})` : 'N/A'
            });
        }

        baseColumns.push({ key: 'qty', label: 'Qty' });

        baseColumns.push({
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: val === 'Verified' ? '#ecfdf5' : val === 'Rejected' ? '#fef2f2' : '#fff7ed',
                    color: val === 'Verified' ? '#059669' : val === 'Rejected' ? '#ef4444' : '#c2410c',
                    border: `1px solid ${val === 'Verified' ? '#10b98133' : val === 'Rejected' ? '#f8717133' : '#f9731633'}`
                }}>
                    {val === 'Unverified' ? 'Pending' : val}
                </span>
            )
        });

        baseColumns.push({
            key: 'actions',
            label: 'Action',
            render: (_, row) => (
                <button
                    className="btn-save"
                    onClick={() => { setSelectedEntry(row); setViewModal(true); }}
                    style={{ fontSize: '11px', padding: '6px 14px', width: 'auto' }}
                >
                    Details
                </button>
            )
        });

        return baseColumns;
    };

    const currentData = selectedMaterial ? (inventory[selectedMaterial] || []).filter(item => item.status === statusFilter) : [];

    // Helper to format field labels
    const formatLabel = (key) => {
        const labels = {
            id: 'ID',
            vendor: 'Vendor',
            receivedDate: 'Date of Receipt',
            invoiceNo: 'Invoice / E-way Bill No',
            invoiceDate: 'Invoice / E-way Bill Date',
            challanNo: 'Challan No.',
            cementType: 'Cement Type',
            manufacturerName: 'Manufacturer Name',
            batchNo: 'Batch No',
            mfgWeek: 'Manufacturing Week',
            mfgYear: 'Manufacturing Year',
            mtcNo: 'MTC No',
            qty: 'Quantity',
            totalQtyKg: 'Total Qty (Kgs)',
            gradeSpec: 'Grade / Spec',
            ritesIcNo: 'RITES IC No',
            ritesIcDate: 'RITES IC Date',
            serialNoCoils: 'Serial Number of Coils',
            lotNo: 'Lot No',
            relaxationTestDate: 'Relaxation Test Pass Date',
            aggregateType: 'Type of Aggregate',
            source: 'Source',
            status: 'Status',
            verifiedBy: 'Verified By',
            verifiedAt: 'Verified At'
        };
        return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    return (
        <div className="verification-dashboard cement-forms-scope">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>Incoming Raw Material Verification</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Verify vendor-entered inventory certificates to make materials eligible for production.</p>
            </header>

            {/* Horizontal Cards Layout */}
            <div className="ie-tab-row" style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '16px',
                paddingBottom: '16px',
                marginBottom: '24px'
            }}>
                {materials.map(mat => {
                    const stats = getStats(mat.id);
                    const isActive = selectedMaterial === mat.id;
                    return (
                        <div
                            key={mat.id}
                            className={`ie-tab-card ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedMaterial(mat.id);
                                setStatusFilter('Unverified'); // Reset filter on switch
                            }}
                            style={{
                                minWidth: '220px',
                                flex: '0 0 auto',
                                background: isActive ? 'var(--primary-50)' : 'white',
                                border: `1px solid ${isActive ? 'var(--rites-green)' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="ie-tab-title" style={{ fontWeight: '700', fontSize: '14px', color: isActive ? 'var(--rites-dark)' : 'var(--neutral-700)' }}>{mat.title}</span>
                                {stats.pending > 0 && (
                                    <span style={{ fontSize: '10px', background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                                        {stats.pending} Pending
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Total Balance: <span style={{ fontWeight: '700', color: '#334155' }}>{stats.balance}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            {selectedMaterial ? (
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                {materials.find(m => m.id === selectedMaterial).title} Consignments
                            </h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Manage verification status for incoming stock</span>
                        </div>

                        {/* Status Tabs */}
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                            {['Unverified', 'Verified', 'Rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: statusFilter === status ? 'white' : 'transparent',
                                        color: statusFilter === status ? '#0f766e' : '#64748b',
                                        boxShadow: statusFilter === status ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {status === 'Unverified' ? 'Pending' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <EnhancedDataTable
                        columns={getMainColumns(selectedMaterial)}
                        data={currentData}
                        emptyMessage={`No ${statusFilter === 'Unverified' ? 'pending' : statusFilter.toLowerCase()} records found for ${materials.find(m => m.id === selectedMaterial).title}.`}
                    />
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Select a raw material card above to view inventory.</p>
                </div>
            )}

            {viewModal && selectedEntry && (
                <div className="form-modal-overlay" onClick={() => setViewModal(false)}>
                    <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Incoming Verification: {selectedEntry.id}</span>
                            <button className="form-modal-close" onClick={() => setViewModal(false)}>X</button>
                        </div>
                        <div className="form-modal-body">
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#42818c' }}>Full Inventory Details (Vendor Submitted)</h4>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    {Object.entries(selectedEntry).map(([key, value]) => {
                                        // Skip internal fields, coils/batches arrays (handled separately), and verification info
                                        if (['status', 'verifiedBy', 'verifiedAt', 'coils', 'batches'].includes(key)) return null;
                                        if (typeof value === 'object') return null;

                                        return (
                                            <div key={key}>
                                                <label style={{ fontSize: '11px', color: '#64748b' }}>{formatLabel(key)}</label>
                                                <div style={{ fontWeight: '600', fontSize: '13px' }}>{value || 'N/A'}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* HTS Coils Table */}
                                {selectedEntry.coils && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', display: 'block' }}>Coil & Lot Details</label>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead>
                                                <tr style={{ background: '#e2e8f0' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Coil No.</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Lot No.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEntry.coils.map((coil, idx) => (
                                                    <tr key={idx} style={{ background: '#fff' }}>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: '700' }}>{coil.coilNo}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{coil.lotNo}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Cement Batches Table */}
                                {selectedEntry.batches && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', display: 'block' }}>Batch Details</label>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                            <thead>
                                                <tr style={{ background: '#e2e8f0' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Batch No.</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Week</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Year</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>MTC</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEntry.batches.map((batch, idx) => (
                                                    <tr key={idx} style={{ background: '#fff' }}>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: '700' }}>{batch.batchNo}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{batch.weekNo}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{batch.yearNo}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{batch.mtcNo}</td>
                                                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{batch.qty}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {selectedEntry.status !== 'Unverified' && (
                                <div style={{
                                    background: selectedEntry.status === 'Verified' ? '#ecfdf5' : '#fef2f2',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: `1px solid ${selectedEntry.status === 'Verified' ? '#10b98133' : '#f8717133'}`,
                                    marginBottom: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: selectedEntry.status === 'Verified' ? '#059669' : '#ef4444' }}>
                                        {selectedEntry.status === 'Verified' ? '✓' : '✗'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: selectedEntry.status === 'Verified' ? '#059669' : '#ef4444', textTransform: 'uppercase' }}>
                                            {selectedEntry.status}
                                        </div>
                                        <div style={{ fontSize: '10px', color: selectedEntry.status === 'Verified' ? '#065f46' : '#991b1b' }}>
                                            By {selectedEntry.verifiedBy} on {selectedEntry.verifiedAt}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                {selectedEntry.status === 'Unverified' ? (
                                    <>
                                        <button className="btn-verify" style={{ flex: 1, height: '44px', background: '#059669' }} onClick={handleVerify}>Verify & Approve</button>
                                        <button className="btn-verify" style={{ flex: 1, height: '44px', background: '#dc2626' }} onClick={handleReject}>Reject</button>
                                    </>
                                ) : (
                                    <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#94a3b8', border: 'none', cursor: 'not-allowed', height: '44px' }} disabled>Verification Finalized</button>
                                )}
                                <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', height: '44px' }} onClick={() => setViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingVerificationDashboard;

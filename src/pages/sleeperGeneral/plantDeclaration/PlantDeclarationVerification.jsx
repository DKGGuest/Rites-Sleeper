import React, { useState } from 'react';
import { useShift } from '../../../context/ShiftContext';
import './PlantDeclarationVerification.css';

/**
 * PlantDeclarationVerification Component
 * This module enables the Inspecting Engineer (IE) in the General Shift to review, 
 * verify, reject, or unlock the master plant data declared by the Vendor.
 */

const STATUS_CONFIG = {
    'Pending': { label: 'Pending Verification', cls: 'status-pending' },
    'Verified': { label: 'Verified', cls: 'status-verified' },
    'Rejected': { label: 'Seek Clarification', cls: 'status-rejected' },
    'Unlocked': { label: 'Unlocked for Vendor', cls: 'status-unlocked' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, cls: '' };
    return <span className={`pdv-badge ${cfg.cls}`}>{cfg.label}</span>;
};

const PlantDeclarationVerification = () => {
    const { plantVerificationData, setPlantVerificationData } = useShift();
    const [activeTab, setActiveTab] = useState(1);
    const [rejectingItem, setRejectingItem] = useState(null);
    const [rejectionRemarks, setRejectionRemarks] = useState('');
    const [selectedBenches, setSelectedBenches] = useState(new Set());

    // --- Helper Functions ---

    const handleStatusChange = (category, id, newStatus, remarks = '') => {
        setPlantVerificationData(prev => ({
            ...prev,
            [category]: prev[category].map(item =>
                item.id === id ? { ...item, status: newStatus, rejectionRemarks: remarks } : item
            )
        }));
    };

    const handleBulkVerifyBenches = () => {
        if (selectedBenches.size === 0) return;
        setPlantVerificationData(prev => ({
            ...prev,
            benches: prev.benches.map(item =>
                selectedBenches.has(item.id) && (item.status === 'Pending' || item.status === 'Unlocked')
                    ? { ...item, status: 'Verified' }
                    : item
            )
        }));
        setSelectedBenches(new Set());
    };

    const handleVerifyAllBenches = () => {
        setPlantVerificationData(prev => ({
            ...prev,
            benches: prev.benches.map(item =>
                (item.status === 'Pending' || item.status === 'Unlocked')
                    ? { ...item, status: 'Verified' }
                    : item
            )
        }));
    };

    const openRejectModal = (category, item) => {
        setRejectingItem({ category, item });
        setRejectionRemarks('');
    };

    const submitRejection = () => {
        if (!rejectingItem || !rejectionRemarks.trim()) return;
        handleStatusChange(rejectingItem.category, rejectingItem.item.id, 'Rejected', rejectionRemarks);
        setRejectingItem(null);
    };

    const toggleBenchSelection = (id) => {
        const next = new Set(selectedBenches);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedBenches(next);
    };

    // --- Sub-components for Tabs ---

    // Tab 1: Plant Profile Verification
    const renderPlantProfile = () => (
        <div className="pdv-table-container">
            <table className="pdv-table">
                <thead>
                    <tr>
                        <th>Plant Name & Location</th>
                        <th>Vendor Code</th>
                        <th>Type of Plant</th>
                        <th>Sheds / Lines</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {plantVerificationData.profiles.map(row => (
                        <tr key={row.id}>
                            <td>
                                <div className="pdv-main-text">{row.plantName}</div>
                                <div className="pdv-sub-text">{row.location}</div>
                            </td>
                            <td>{row.vendorCode}</td>
                            <td>{row.plantType}</td>
                            <td>{row.plantType === 'Long Line' ? `${row.lines} Lines` : `${row.sheds} Sheds`}</td>
                            <td><StatusBadge status={row.status} /></td>
                            <td>
                                <div className="pdv-actions">
                                    {(row.status === 'Pending' || row.status === 'Unlocked') && (
                                        <>
                                            <button className="pdv-btn-verify" onClick={() => handleStatusChange('profiles', row.id, 'Verified')}>Verify</button>
                                            <button className="pdv-btn-reject" title="Seek Clarification" onClick={() => openRejectModal('profiles', row)}>Seek Clarification</button>
                                        </>
                                    )}
                                    {row.status === 'Verified' && (
                                        <button className="pdv-btn-unlock" onClick={() => handleStatusChange('profiles', row.id, 'Unlocked')}>Unlock</button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Tab 2: Bench / Mould Master Verification
    const renderBenchMaster = () => (
        <div className="pdv-table-container">
            <div className="pdv-bulk-actions">
                <button
                    className="pdv-btn-bulk-verify"
                    disabled={selectedBenches.size === 0}
                    onClick={handleBulkVerifyBenches}
                >
                    Verify Selected ({selectedBenches.size})
                </button>
                <button
                    className="pdv-btn-bulk-verify"
                    onClick={handleVerifyAllBenches}
                >
                    Verify All
                </button>
            </div>
            <table className="pdv-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" onChange={(e) => {
                            if (e.target.checked) {
                                const allPending = plantVerificationData.benches
                                    .filter(b => b.status === 'Pending' || b.status === 'Unlocked')
                                    .map(b => b.id);
                                setSelectedBenches(new Set(allPending));
                            } else {
                                setSelectedBenches(new Set());
                            }
                        }} /></th>
                        <th>Bench/Line No.</th>
                        <th>Total Moulds</th>
                        <th>Sleeper Type Assigned</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {plantVerificationData.benches.map(row => (
                        <tr key={row.id}>
                            <td>
                                {(row.status === 'Pending' || row.status === 'Unlocked') && (
                                    <input
                                        type="checkbox"
                                        checked={selectedBenches.has(row.id)}
                                        onChange={() => toggleBenchSelection(row.id)}
                                    />
                                )}
                            </td>
                            <td>{row.benchNo}</td>
                            <td>{row.moulds}</td>
                            <td>{row.sleeperType}</td>
                            <td><StatusBadge status={row.status} /></td>
                            <td>
                                <div className="pdv-actions">
                                    {(row.status === 'Pending' || row.status === 'Unlocked') && (
                                        <>
                                            <button className="pdv-btn-verify" onClick={() => handleStatusChange('benches', row.id, 'Verified')}>Verify</button>
                                            <button className="pdv-btn-reject" title="Seek Clarification" onClick={() => openRejectModal('benches', row)}>Seek Clarification</button>
                                        </>
                                    )}
                                    {row.status === 'Verified' && (
                                        <button className="pdv-btn-unlock" onClick={() => handleStatusChange('benches', row.id, 'Unlocked')}>Unlock</button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Tab 3: Raw Material Source Verification
    const renderRawMaterial = () => (
        <div className="pdv-table-container">
            <table className="pdv-table">
                <thead>
                    <tr>
                        <th>Material Type</th>
                        <th>Supplier Name & Source</th>
                        <th>Approval Reference</th>
                        <th>Validity Period</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {plantVerificationData.rawMaterials.map(row => {
                        const expiryDate = new Set(['expired', 'warning']);
                        const today = new Date();
                        const validUntil = new Date(row.validUpto);
                        const diffDays = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));
                        const isExpiringSoon = diffDays <= 30 && diffDays >= 0;
                        const isExpired = diffDays < 0;

                        return (
                            <tr key={row.id}>
                                <td><strong>{row.materialType}</strong></td>
                                <td>
                                    <div className="pdv-main-text">{row.supplierName}</div>
                                    <div className="pdv-sub-text">{row.sourceLocation}</div>
                                </td>
                                <td>{row.approvalRef}</td>
                                <td>
                                    <span className={isExpired ? "pdv-expired" : isExpiringSoon ? "pdv-warning" : ""}>
                                        {row.validUpto} {isExpiringSoon && `(${diffDays} days left)`} {isExpired && "(Expired)"}
                                    </span>
                                </td>
                                <td><StatusBadge status={row.status} /></td>
                                <td>
                                    <div className="pdv-actions">
                                        <button className="pdv-btn-view">View Doc</button>
                                        {(row.status === 'Pending' || row.status === 'Unlocked') && (
                                            <>
                                                <button className="pdv-btn-verify" onClick={() => handleStatusChange('rawMaterials', row.id, 'Verified')}>Verify</button>
                                                <button className="pdv-btn-reject" title="Seek Clarification" onClick={() => openRejectModal('rawMaterials', row)}>Seek Clarification</button>
                                            </>
                                        )}
                                        {row.status === 'Verified' && (
                                            <button className="pdv-btn-unlock" onClick={() => handleStatusChange('rawMaterials', row.id, 'Unlocked')}>Unlock</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    // Tab 4: Mix Design Verification
    const renderMixDesign = () => (
        <div className="pdv-table-container">
            <table className="pdv-table">
                <thead>
                    <tr>
                        <th>Mix ID & Grade</th>
                        <th>Authority</th>
                        <th>Proportions (Kg/m³)</th>
                        <th>A/C & W/C Ratio</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {plantVerificationData.mixDesigns.map(row => (
                        <tr key={row.id}>
                            <td>
                                <div className="pdv-main-text">{row.designId}</div>
                                <div className="pdv-sub-text">{row.grade}</div>
                            </td>
                            <td>{row.authority}</td>
                            <td>
                                <div className="pdv-proportions-grid">
                                    <span>C: {row.cement}</span>
                                    <span>CA1: {row.ca1}</span>
                                    <span>CA2: {row.ca2}</span>
                                    <span>FA: {row.fa}</span>
                                    <span>W: {row.water}L</span>
                                </div>
                            </td>
                            <td>
                                <div className="pdv-main-text">A/C: {row.ac}</div>
                                <div className="pdv-sub-text">W/C: {row.wc}</div>
                            </td>
                            <td><StatusBadge status={row.status} /></td>
                            <td>
                                <div className="pdv-actions">
                                    {(row.status === 'Pending' || row.status === 'Unlocked') && (
                                        <>
                                            <button className="pdv-btn-verify" onClick={() => handleStatusChange('mixDesigns', row.id, 'Verified')}>Verify</button>
                                            <button className="pdv-btn-reject" title="Seek Clarification" onClick={() => openRejectModal('mixDesigns', row)}>Seek Clarification</button>
                                        </>
                                    )}
                                    {row.status === 'Verified' && (
                                        <button className="pdv-btn-unlock" onClick={() => handleStatusChange('mixDesigns', row.id, 'Unlocked')}>Unlock</button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="pdv-container">
            <div className="pdv-header">
                <h2>Plant Declaration Verification</h2>
                <p className="pdv-header-desc">Review and authenticate vendor declarations for live production activation.</p>
            </div>

            <div className="pdv-tabs-nav">
                <button className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>Plant Profile</button>
                <button className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>Bench / Mould</button>
                <button className={activeTab === 3 ? 'active' : ''} onClick={() => setActiveTab(3)}>Raw Material</button>
                <button className={activeTab === 4 ? 'active' : ''} onClick={() => setActiveTab(4)}>Mix Design</button>
            </div>

            <div className="pdv-tabs-content">
                {activeTab === 1 && renderPlantProfile()}
                {activeTab === 2 && renderBenchMaster()}
                {activeTab === 3 && renderRawMaterial()}
                {activeTab === 4 && renderMixDesign()}
            </div>

            {rejectingItem && (
                <div className="pdv-modal-overlay">
                    <div className="pdv-modal">
                        <h3>Clarification Remarks</h3>
                        <p>Action: Seeking clarification for <strong>{rejectingItem.item.plantName || rejectingItem.item.benchNo || rejectingItem.item.materialType || rejectingItem.item.designId}</strong></p>
                        <textarea
                            placeholder="Enter clarification details..."
                            value={rejectionRemarks}
                            onChange={(e) => setRejectionRemarks(e.target.value)}
                        />
                        <div className="pdv-modal-buttons">
                            <button className="pdv-btn-cancel" onClick={() => setRejectingItem(null)}>Cancel</button>
                            <button className="pdv-btn-submit-reject" onClick={submitRejection} disabled={!rejectionRemarks.trim()}>Submit Clarification Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantDeclarationVerification;

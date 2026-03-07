import React, { useState } from 'react';
import './PlantDeclarationVerification.css';
import { useShift } from '../../context/ShiftContext';
import { getVerificationStats } from './PlantVerificationData';

const today = new Date();

const STATUS_CONFIG = {
    Pending: { label: 'Pending Verification', cls: 'status-pending' },
    Verified: { label: 'Verified', cls: 'status-verified' },
    Rejected: { label: 'Rejected', cls: 'status-rejected' },
    Unlocked: { label: 'Unlocked for Vendor', cls: 'status-unlocked' },
};

const getDaysUntilExpiry = (dateStr) => {
    const expiry = new Date(dateStr);
    return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
};

const getExpiryClass = (dateStr) => {
    const days = getDaysUntilExpiry(dateStr);
    if (days < 0) return 'expiry-expired';
    if (days <= 30) return 'expiry-warning';
    return '';
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

/* Reusable Status Badge */
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, cls: '' };
    return <span className={`pdv-status-badge ${cfg.cls}`}>{cfg.label}</span>;
};

/* Rejection Remarks Modal */
const RejectionModal = ({ onConfirm, onCancel }) => {
    const [remarks, setRemarks] = useState('');
    return (
        <div className="modal-overlay">
            <div className="modal-content pdv-rejection-modal">
                <div className="modal-header">
                    <h2>Rejection Remarks</h2>
                </div>
                <div className="modal-body">
                    <p className="pdv-modal-hint">
                        Please provide a clear reason for rejection. This will be visible to the Vendor on their dashboard.
                    </p>
                    <textarea
                        className="pdv-textarea"
                        rows={4}
                        placeholder="Enter reason for rejection..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </div>
                <div className="pdv-modal-footer">
                    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button
                        className="btn-reject-confirm"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to submit this rejection?')) {
                                onConfirm(remarks);
                            }
                        }}
                        disabled={!remarks.trim()}
                    >
                        Confirm Rejection
                    </button>

                </div>
            </div>
        </div>
    );
};

/* Rejection Remarks View Modal (read-only) */
const RemarksViewModal = ({ remarks, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content pdv-rejection-modal">
            <div className="modal-header">
                <h2>Rejection Remarks</h2>
            </div>
            <div className="modal-body">
                <p className="pdv-remarks-text">{remarks}</p>
            </div>
            <div className="pdv-modal-footer">
                <button className="btn-cancel" onClick={onClose}>Close</button>
            </div>
        </div>
    </div>
);

/* Action Button Group */
const ActionButtons = ({ entry, onVerify, onReject, onUnlock, onViewRemarks }) => (
    <div className="pdv-action-group">
        {(entry.status === 'Pending' || entry.status === 'Unlocked') && (
            <button
                className="pdv-btn pdv-btn-verify"
                onClick={() => {
                    if (window.confirm('Are you sure you want to verify this entry?')) {
                        onVerify(entry.id);
                    }
                }}
            >
                Verify
            </button>
        )}
        {(entry.status === 'Pending' || entry.status === 'Unlocked') && (
            <button
                className="pdv-btn pdv-btn-reject"
                onClick={() => {
                    if (window.confirm('Are you sure you want to reject this entry?')) {
                        onReject(entry.id);
                    }
                }}
            >
                Reject
            </button>
        )}
        {entry.status === 'Verified' && (
            <button
                className="pdv-btn pdv-btn-unlock"
                onClick={() => {
                    if (window.confirm('Are you sure you want to unlock this entry for vendor modification?')) {
                        onUnlock(entry.id);
                    }
                }}
            >
                Unlock
            </button>
        )}
        {entry.status === 'Rejected' && entry.rejectionRemarks && (
            <button className="pdv-btn pdv-btn-secondary" onClick={() => onViewRemarks(entry)}>
                View Remarks
            </button>
        )}
    </div>
);


/* ─────────────────────────────────────────────────────────────
   TAB 1: Plant Profile Verification
───────────────────────────────────────────────────────────── */
const PlantProfileTab = ({ data, updateData }) => {
    const entries = data.profiles;
    const [rejectingId, setRejectingId] = useState(null);
    const [viewingRemarks, setViewingRemarks] = useState(null);

    const stats = {
        verified: entries.filter(e => e.status === 'Verified').length,
        pending: entries.filter(e => e.status === 'Pending' || e.status === 'Unlocked').length,
        rejected: entries.filter(e => e.status === 'Rejected').length,
    };

    return (
        <div className="pdv-tab-content">
            <div className="pdv-stats-row">
                <div className="pdv-stat pdv-stat-pending"><span>{stats.pending}</span> Pending</div>
                <div className="pdv-stat pdv-stat-verified"><span>{stats.verified}</span> Verified</div>
                <div className="pdv-stat pdv-stat-rejected"><span>{stats.rejected}</span> Rejected</div>
            </div>

            <div className="table-outer-wrapper">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Plant Name &amp; Location</th>
                            <th>Vendor Code</th>
                            <th>Plant Type</th>
                            <th>Sheds / Lines</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(e => (
                            <tr key={e.id}>
                                <td data-label="Plant Name & Location">
                                    <strong>{e.plantName}</strong>
                                    <br />
                                    <span className="pdv-sub">{e.location}</span>
                                </td>
                                <td data-label="Vendor Code">{e.vendorCode}</td>
                                <td data-label="Plant Type">{e.plantType}</td>
                                <td data-label="Sheds / Lines">
                                    {e.plantType === 'Long Line'
                                        ? `${e.lines} Line(s)`
                                        : `${e.sheds} Shed(s)`}
                                </td>
                                <td data-label="Status"><StatusBadge status={e.status} /></td>
                                <td data-label="Actions">
                                    <ActionButtons
                                        entry={e}
                                        onVerify={(id) => updateData('profiles', id, 'Verified')}
                                        onReject={(id) => setRejectingId(id)}
                                        onUnlock={(id) => updateData('profiles', id, 'Unlocked')}
                                        onViewRemarks={(entry) => setViewingRemarks(entry)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rejectingId && (
                <RejectionModal
                    onConfirm={(r) => { updateData('profiles', rejectingId, 'Rejected', r); setRejectingId(null); }}
                    onCancel={() => setRejectingId(null)}
                />
            )}
            {viewingRemarks && (
                <RemarksViewModal
                    remarks={viewingRemarks.rejectionRemarks}
                    onClose={() => setViewingRemarks(null)}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   TAB 2: Bench / Mould Master Verification
───────────────────────────────────────────────────────────── */
const BenchMouldTab = ({ data, updateData, updateBulk }) => {
    const entries = data.benches;
    const [selected, setSelected] = useState(new Set());
    const [rejectingId, setRejectingId] = useState(null);
    const [viewingRemarks, setViewingRemarks] = useState(null);

    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const pendingCount = entries.filter(e => e.status === 'Pending' || e.status === 'Unlocked').length;
    const stats = {
        verified: entries.filter(e => e.status === 'Verified').length,
        pending: entries.filter(e => e.status === 'Pending' || e.status === 'Unlocked').length,
        rejected: entries.filter(e => e.status === 'Rejected').length,
    };

    return (
        <div className="pdv-tab-content">
            <div className="pdv-stats-row">
                <div className="pdv-stat pdv-stat-pending"><span>{stats.pending}</span> Pending</div>
                <div className="pdv-stat pdv-stat-verified"><span>{stats.verified}</span> Verified</div>
                <div className="pdv-stat pdv-stat-rejected"><span>{stats.rejected}</span> Rejected</div>
            </div>

            <div className="pdv-bulk-actions">
                <button
                    className="pdv-btn pdv-btn-verify"
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to verify all ${selected.size} selected entries?`)) {
                            updateBulk('benches', selected, 'Verified');
                            setSelected(new Set());
                        }
                    }}
                    disabled={selected.size === 0}
                >
                    Verify Selected ({selected.size})
                </button>
                <button
                    className="pdv-btn pdv-btn-verify"
                    onClick={() => {
                        const allPendingIds = new Set(entries.filter(e => e.status === 'Pending' || e.status === 'Unlocked').map(e => e.id));
                        if (window.confirm(`Are you sure you want to verify all ${pendingCount} pending entries at once?`)) {
                            updateBulk('benches', allPendingIds, 'Verified');
                            setSelected(new Set());
                        }
                    }}
                    disabled={pendingCount === 0}
                >
                    Verify All Pending
                </button>
            </div>


            <div className="table-outer-wrapper">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selected.size > 0 && selected.size === pendingCount}
                                    onChange={() => {
                                        if (selected.size === pendingCount) {
                                            setSelected(new Set());
                                        } else {
                                            setSelected(new Set(entries
                                                .filter(e => e.status === 'Pending' || e.status === 'Unlocked')
                                                .map(e => e.id)));
                                        }
                                    }}
                                />
                            </th>
                            <th>Bench / Line No.</th>
                            <th>Total Moulds</th>
                            <th>Sleeper Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(e => (
                            <tr key={e.id} className={selected.has(e.id) ? 'pdv-row-selected' : ''}>
                                <td className="checkbox-cell">
                                    {(e.status === 'Pending' || e.status === 'Unlocked') && (
                                        <input
                                            type="checkbox"
                                            checked={selected.has(e.id)}
                                            onChange={() => toggleSelect(e.id)}
                                        />
                                    )}
                                </td>
                                <td data-label="Bench / Line No.">{e.benchNo}</td>
                                <td data-label="Total Moulds">{e.moulds.toLocaleString()}</td>
                                <td data-label="Sleeper Type">
                                    <span className="pdv-type-chip">{e.sleeperType}</span>
                                </td>
                                <td data-label="Status"><StatusBadge status={e.status} /></td>
                                <td data-label="Actions">
                                    <ActionButtons
                                        entry={e}
                                        onVerify={(id) => updateData('benches', id, 'Verified')}
                                        onReject={(id) => setRejectingId(id)}
                                        onUnlock={(id) => updateData('benches', id, 'Unlocked')}
                                        onViewRemarks={(entry) => setViewingRemarks(entry)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rejectingId && (
                <RejectionModal
                    onConfirm={(r) => { updateData('benches', rejectingId, 'Rejected', r); setRejectingId(null); }}
                    onCancel={() => setRejectingId(null)}
                />
            )}
            {viewingRemarks && (
                <RemarksViewModal
                    remarks={viewingRemarks.rejectionRemarks}
                    onClose={() => setViewingRemarks(null)}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   TAB 3: Raw Material Source Verification
───────────────────────────────────────────────────────────── */
const RawMaterialTab = ({ data, updateData }) => {
    const entries = data.rawMaterials;
    const [rejectingId, setRejectingId] = useState(null);
    const [viewingRemarks, setViewingRemarks] = useState(null);

    const stats = {
        verified: entries.filter(e => e.status === 'Verified').length,
        pending: entries.filter(e => e.status === 'Pending' || e.status === 'Unlocked').length,
        rejected: entries.filter(e => e.status === 'Rejected').length,
    };

    return (
        <div className="pdv-tab-content">
            <div className="pdv-stats-row">
                <div className="pdv-stat pdv-stat-pending"><span>{stats.pending}</span> Pending</div>
                <div className="pdv-stat pdv-stat-verified"><span>{stats.verified}</span> Verified</div>
                <div className="pdv-stat pdv-stat-rejected"><span>{stats.rejected}</span> Rejected</div>
            </div>

            <div className="pdv-expiry-legend">
                <span className="pdv-legend-dot expiry-expired-dot"></span> Validity Expired
                <span className="pdv-legend-dot expiry-warning-dot" style={{ marginLeft: '1rem' }}></span> Expiring within 30 days
            </div>

            <div className="table-outer-wrapper">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Material Type</th>
                            <th>Supplier Name</th>
                            <th>Source Location</th>
                            <th>Approval Reference</th>
                            <th>Valid Upto</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(e => {
                            const expClass = getExpiryClass(e.validUpto);
                            const days = getDaysUntilExpiry(e.validUpto);
                            return (
                                <tr key={e.id}>
                                    <td data-label="Material Type">
                                        <strong>{e.materialType}</strong>
                                    </td>
                                    <td data-label="Supplier">{e.supplierName}</td>
                                    <td data-label="Source">{e.sourceLocation}</td>
                                    <td data-label="Approval Ref">
                                        <span className="pdv-approval-ref">{e.approvalRef}</span>
                                    </td>
                                    <td data-label="Valid Upto">
                                        <span className={`pdv-expiry-cell ${expClass}`}>
                                            {e.validUpto}
                                            {expClass === 'expiry-expired' && (
                                                <span className="pdv-expiry-tag"> (Expired)</span>
                                            )}
                                            {expClass === 'expiry-warning' && days >= 0 && (
                                                <span className="pdv-expiry-tag"> ({days}d left)</span>
                                            )}
                                        </span>
                                    </td>
                                    <td data-label="Status"><StatusBadge status={e.status} /></td>
                                    <td data-label="Actions">
                                        <div className="pdv-action-group">
                                            <button className="pdv-btn pdv-btn-secondary">
                                                View Doc
                                            </button>
                                            <ActionButtons
                                                entry={e}
                                                onVerify={(id) => updateData('rawMaterials', id, 'Verified')}
                                                onReject={(id) => setRejectingId(id)}
                                                onUnlock={(id) => updateData('rawMaterials', id, 'Unlocked')}
                                                onViewRemarks={(entry) => setViewingRemarks(entry)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {rejectingId && (
                <RejectionModal
                    onConfirm={(r) => { updateData('rawMaterials', rejectingId, 'Rejected', r); setRejectingId(null); }}
                    onCancel={() => setRejectingId(null)}
                />
            )}
            {viewingRemarks && (
                <RemarksViewModal
                    remarks={viewingRemarks.rejectionRemarks}
                    onClose={() => setViewingRemarks(null)}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   TAB 4: Mix Design Verification
───────────────────────────────────────────────────────────── */
const MixDesignTab = ({ data, updateData }) => {
    const entries = data.mixDesigns;
    const [rejectingId, setRejectingId] = useState(null);
    const [viewingRemarks, setViewingRemarks] = useState(null);

    const stats = {
        verified: entries.filter(e => e.status === 'Verified').length,
        pending: entries.filter(e => e.status === 'Pending' || e.status === 'Unlocked').length,
        rejected: entries.filter(e => e.status === 'Rejected').length,
    };

    return (
        <div className="pdv-tab-content">
            <div className="pdv-stats-row">
                <div className="pdv-stat pdv-stat-pending"><span>{stats.pending}</span> Pending</div>
                <div className="pdv-stat pdv-stat-verified"><span>{stats.verified}</span> Verified</div>
                <div className="pdv-stat pdv-stat-rejected"><span>{stats.rejected}</span> Rejected</div>
            </div>

            <div className="pdv-info-note">
                Once a Mix Design is Verified it becomes available in the Batch Weighment module dropdowns for Shift Engineers.
            </div>

            <div className="table-outer-wrapper">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Design ID &amp; Grade</th>
                            <th>Authority</th>
                            <th>Cement (Kg/m3)</th>
                            <th>CA1 (Kg/m3)</th>
                            <th>CA2 (Kg/m3)</th>
                            <th>FA (Kg/m3)</th>
                            <th>Water (L)</th>
                            <th>A/C</th>
                            <th>W/C</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(e => (
                            <tr key={e.id}>
                                <td data-label="Design ID & Grade">
                                    <strong>{e.designId}</strong>
                                    <br />
                                    <span className="pdv-type-chip">{e.grade}</span>
                                </td>
                                <td data-label="Authority">{e.authority}</td>
                                <td data-label="Cement">{e.cement}</td>
                                <td data-label="CA1">{e.ca1}</td>
                                <td data-label="CA2">{e.ca2}</td>
                                <td data-label="FA">{e.fa}</td>
                                <td data-label="Water">{e.water}</td>
                                <td data-label="A/C">{e.ac}</td>
                                <td data-label="W/C">{e.wc}</td>
                                <td data-label="Status"><StatusBadge status={e.status} /></td>
                                <td data-label="Actions">
                                    <ActionButtons
                                        entry={e}
                                        onVerify={(id) => updateData('mixDesigns', id, 'Verified')}
                                        onReject={(id) => setRejectingId(id)}
                                        onUnlock={(id) => updateData('mixDesigns', id, 'Unlocked')}
                                        onViewRemarks={(entry) => setViewingRemarks(entry)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rejectingId && (
                <RejectionModal
                    onConfirm={(r) => { updateData('mixDesigns', rejectingId, 'Rejected', r); setRejectingId(null); }}
                    onCancel={() => setRejectingId(null)}
                />
            )}
            {viewingRemarks && (
                <RemarksViewModal
                    remarks={viewingRemarks.rejectionRemarks}
                    onClose={() => setViewingRemarks(null)}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   TABS CONFIG
───────────────────────────────────────────────────────────── */
const TABS = [
    { id: 'plant-profile', label: 'Plant Profile', component: PlantProfileTab },
    { id: 'bench-mould', label: 'Bench / Mould Master', component: BenchMouldTab },
    { id: 'raw-material', label: 'Raw Material Source', component: RawMaterialTab },
    { id: 'mix-design', label: 'Mix Design', component: MixDesignTab },
];

/* ─────────────────────────────────────────────────────────────
   MAIN MODULE COMPONENT
───────────────────────────────────────────────────────────── */
const PlantDeclarationVerification = () => {
    const { plantVerificationData, setPlantVerificationData } = useShift();
    const [activeTab, setActiveTab] = useState('plant-profile');

    const stats = getVerificationStats(plantVerificationData);

    const updateData = (category, id, status, remarks = '') => {
        setPlantVerificationData(prev => ({
            ...prev,
            [category]: prev[category].map(e => e.id === id ? { ...e, status, rejectionRemarks: remarks } : e)
        }));
    };

    const updateBulk = (category, ids, status) => {
        setPlantVerificationData(prev => ({
            ...prev,
            [category]: prev[category].map(e => ids.has(e.id) && (e.status === 'Pending' || e.status === 'Unlocked')
                ? { ...e, status }
                : e)
        }));
    };

    const tabProps = {
        data: plantVerificationData,
        updateData,
        updateBulk,
        stats
    };

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || null;

    return (
        <div className="pdv-root fade-in">
            {/* PAGE HEADER */}
            <div className="pdv-page-header">
                <div className="pdv-header-text">
                    <h1>Plant Declaration Verification</h1>
                    <p>IE General – Review and authenticate all vendor-submitted plant declarations before activating them in the production system.</p>
                </div>
            </div>

            {/* ALERT BANNER */}
            {stats.pending > 0 && (
                <div className="pdv-alert-banner">
                    <strong>{stats.pending} {stats.pending === 1 ? 'Entry' : 'Entries'} Pending for Verification</strong>
                    — Review the tabs below and take action on each declaration.
                </div>
            )}

            {/* TAB BAR */}
            <div className="pdv-tab-bar">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`pdv-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="pdv-content-area">
                {ActiveComponent && <ActiveComponent {...tabProps} />}
            </div>
        </div>
    );
};

export default PlantDeclarationVerification;

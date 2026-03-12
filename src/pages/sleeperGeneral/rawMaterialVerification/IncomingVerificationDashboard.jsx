import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';

// ─────────────────────────────────────────────
//  Constants – must match sleeper_module table
// ─────────────────────────────────────────────
const LOGGED_IN_USER_ID = 119; // Hardcoded IE user

/**
 * sleeper_module table mapping:
 *  id | module_name
 *   1 | PLANT_PROFILE
 *   2 | BENCH_MOULD_MASTER
 *   3 | RAW_MATERIAL_SOURCE
 *   4 | MIX_DESIGN
 *   5 | HTS Wire
 *   6 | Cement
 *   7 | Admixture
 *   8 | Aggregates
 *   9 | SGCI Insert
 *  10 | Dowel
 */
const MODULE_CONFIG = [
    { moduleId: 1,  label: 'Plant Profile',     group: 'Plant Declaration',     color: '#7c3aed' },
    { moduleId: 2,  label: 'Bench / Mould',     group: 'Plant Declaration',     color: '#7c3aed' },
    { moduleId: 3,  label: 'Raw Material Src',  group: 'Plant Declaration',     color: '#7c3aed' },
    { moduleId: 4,  label: 'Mix Design',        group: 'Plant Declaration',     color: '#7c3aed' },
    { moduleId: 5,  label: 'HTS Wire',          group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 6,  label: 'Cement',            group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 7,  label: 'Admixture',         group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 8,  label: 'Aggregates',        group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 9,  label: 'SGCI Insert',       group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 10, label: 'Dowel',             group: 'Incoming Verification', color: '#0369a1' },
];

/** Fetch the actual record data for a given moduleId + requestId */
const fetchRecordDetail = async (moduleId, requestId) => {
    const fetchers = {
        1:  () => apiService.getPlantProfileById(requestId),
        2:  () => apiService.getBenchMouldMasterById(requestId),
        3:  () => apiService.getRawMaterialSourceById(requestId),
        4:  () => apiService.getMixDesignById(requestId),
        5:  () => apiService.getHtsWireRecordById(requestId),
        6:  () => apiService.getCementRecordById(requestId),
        7:  () => apiService.getAdmixtureRecordById(requestId),
        8:  () => apiService.getAggregateRecordById(requestId),
        9:  () => apiService.getSgciRecordById(requestId),
        10: () => apiService.getDowelRecordById(requestId),
    };
    const fn = fetchers[moduleId];
    if (!fn) return null;
    try {
        const res = await fn();
        return res?.responseData ?? res ?? null;
    } catch {
        return null;
    }
};

// ─────────────────────────────────────────────
//  Sub-component: Record Detail Modal
// ─────────────────────────────────────────────
const DetailModal = ({ record, onClose, onAction, acting }) => {
    const [remarks, setRemarks] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // 'VERIFY' | 'REQUEST_CHANGE'

    const handleConfirm = () => {
        if (pendingAction === 'REQUEST_CHANGE' && !remarks.trim()) {
            alert('Please enter remarks before requesting change.');
            return;
        }
        onAction(pendingAction, remarks.trim() || 'Verified by IE');
    };

    const detail = record.detail || {};

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: '16px', padding: '28px',
                maxWidth: '640px', width: '90%', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                            {record.moduleLabel} — Record #{record.requestId}
                        </h3>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Workflow Transition ID: {record.workflowTransitionId}
                        </span>
                    </div>
                    <button onClick={onClose} style={{
                        border: 'none', background: '#f1f5f9', borderRadius: '8px',
                        padding: '6px 12px', cursor: 'pointer', fontSize: '13px', color: '#475569'
                    }}>✕ Close</button>
                </div>

                {/* Record Data */}
                <div style={{
                    background: '#f8fafc', borderRadius: '12px', padding: '20px',
                    border: '1px solid #e2e8f0', marginBottom: '20px'
                }}>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                        Record Details (Vendor Submitted)
                    </p>
                    {Object.keys(detail).length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>No detail data available from backend.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {Object.entries(detail).map(([key, val]) => {
                                if (typeof val === 'object' || val === null) return null;
                                return (
                                    <div key={key}>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{String(val)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Action selection */}
                {!pendingAction ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setPendingAction('VERIFY')}
                            style={{
                                flex: 1, padding: '12px', border: 'none', borderRadius: '10px',
                                background: '#059669', color: '#fff', fontWeight: '700',
                                fontSize: '14px', cursor: 'pointer'
                            }}
                        >✓ Verify</button>
                        <button
                            onClick={() => setPendingAction('REQUEST_CHANGE')}
                            style={{
                                flex: 1, padding: '12px', border: 'none', borderRadius: '10px',
                                background: '#dc2626', color: '#fff', fontWeight: '700',
                                fontSize: '14px', cursor: 'pointer'
                            }}
                        >↩ Request Change</button>
                    </div>
                ) : (
                    <div style={{ border: `2px solid ${pendingAction === 'VERIFY' ? '#059669' : '#dc2626'}`, borderRadius: '12px', padding: '16px' }}>
                        <p style={{ margin: '0 0 10px', fontWeight: '700', color: pendingAction === 'VERIFY' ? '#059669' : '#dc2626' }}>
                            {pendingAction === 'VERIFY' ? '✓ Confirm Verification' : '↩ Confirm Request Change'}
                        </p>
                        <textarea
                            placeholder={pendingAction === 'VERIFY' ? 'Remarks (optional)…' : 'Enter clarification reason (required)…'}
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0',
                                borderRadius: '8px', padding: '10px', fontSize: '13px',
                                resize: 'vertical', marginBottom: '12px'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleConfirm}
                                disabled={acting}
                                style={{
                                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                                    background: pendingAction === 'VERIFY' ? '#059669' : '#dc2626',
                                    color: '#fff', fontWeight: '700', fontSize: '13px',
                                    cursor: acting ? 'not-allowed' : 'pointer',
                                    opacity: acting ? 0.6 : 1
                                }}
                            >{acting ? 'Submitting…' : 'Confirm'}</button>
                            <button
                                onClick={() => { setPendingAction(null); setRemarks(''); }}
                                style={{
                                    flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                    background: '#f8fafc', color: '#475569', fontWeight: '600',
                                    fontSize: '13px', cursor: 'pointer'
                                }}
                            >Back</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
//  Main Dashboard Component
// ─────────────────────────────────────────────
const IncomingVerificationDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // All pending transitions from the workflow API (filtered for this IE)
    const [allPending, setAllPending] = useState([]);         // raw from API, filtered by assignedTo
    // Records enriched with detail data per module
    const [enrichedByModule, setEnrichedByModule] = useState({}); // { moduleId: [{...transition, detail, moduleLabel}] }

    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [detailModal, setDetailModal] = useState(null);     // the selected record row
    const [acting, setActing] = useState(false);

    // ── Step 1 & 2: Fetch all pending transitions, filter by IE user ──
    const loadPendingTransitions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.getAllPendingWorkflowTransitions('IE');

            // Response can be array directly or wrapped in responseData
            const rawList = Array.isArray(res)
                ? res
                : (Array.isArray(res?.responseData) ? res.responseData : []);

            // Step 2: filter by logged-in IE user
            const myPending = rawList.filter(r =>
                r.assignedTo === LOGGED_IN_USER_ID ||
                String(r.assignedTo) === String(LOGGED_IN_USER_ID)
            );

            setAllPending(myPending);

            // Step 3 & 4: group by moduleId, fetch detail for each record
            const grouped = {};
            for (const mod of MODULE_CONFIG) {
                grouped[mod.moduleId] = [];
            }
            for (const item of myPending) {
                const mid = item.moduleId;
                if (!grouped[mid]) grouped[mid] = [];
                grouped[mid].push(item);
            }

            // Fetch detail for each record in parallel
            const enriched = {};
            await Promise.all(
                Object.entries(grouped).map(async ([modId, items]) => {
                    const numId = Number(modId);
                    const modConf = MODULE_CONFIG.find(m => m.moduleId === numId);
                    enriched[numId] = await Promise.all(
                        items.map(async item => {
                            const detail = await fetchRecordDetail(numId, item.requestId);
                            return {
                                ...item,
                                detail: detail || {},
                                moduleLabel: modConf?.label || `Module ${numId}`,
                            };
                        })
                    );
                })
            );
            setEnrichedByModule(enriched);

            // Auto-select first module that has pending records
            const firstWithPending = MODULE_CONFIG.find(m => (enriched[m.moduleId] || []).length > 0);
            if (firstWithPending && selectedModuleId === null) {
                setSelectedModuleId(firstWithPending.moduleId);
            }
        } catch (err) {
            setError(err.message || 'Failed to load pending transitions.');
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        loadPendingTransitions();
    }, [loadPendingTransitions]);

    // ── Step 7: IE clicks Verify / Request Change ──
    const handleAction = async (action, remarks) => {
        if (!detailModal) return;
        setActing(true);
        try {
            await apiService.performTransitionAction({
                workflowTransitionId: detailModal.workflowTransitionId,
                action:               action,          // "VERIFY" | "REQUEST_CHANGE"
                actionBy:             LOGGED_IN_USER_ID,
                remarks:              remarks || '',
            });
            alert(action === 'VERIFY' ? '✓ Record verified successfully.' : '↩ Change request submitted.');
            setDetailModal(null);
            // Reload so the actioned record disappears from pending list
            loadPendingTransitions();
        } catch (err) {
            alert(`Action failed: ${err.message}`);
        } finally {
            setActing(false);
        }
    };

    const totalPending = allPending.length;
    const currentRecords = enrichedByModule[selectedModuleId] || [];

    // ─────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────
    return (
        <div className="verification-dashboard cement-forms-scope" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#13343b', margin: 0 }}>
                        IE Verification Dashboard
                    </h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
                        All records pending your verification. Assigned to User ID: {LOGGED_IN_USER_ID}
                    </p>
                </div>
                <button
                    onClick={loadPendingTransitions}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: '#fff', color: '#334155', fontSize: '12px', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </header>

            {/* Summary banner */}
            <div style={{
                background: totalPending > 0 ? '#fff7ed' : '#f0fdf4',
                border: `1px solid ${totalPending > 0 ? '#fed7aa' : '#bbf7d0'}`,
                borderRadius: '12px', padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
            }}>
                <span style={{ fontSize: '22px' }}>{totalPending > 0 ? '🔔' : '✅'}</span>
                <div>
                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        {totalPending > 0 ? `${totalPending} record(s) pending your verification` : 'All records verified — no pending items'}
                    </strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Source: GET /sleeper-workflow/allPendingWorkflowTransition?roleName=IE → filtered by assignedTo={LOGGED_IN_USER_ID}
                    </div>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                    padding: '16px', marginBottom: '20px', color: '#dc2626', fontSize: '13px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    Loading pending workflow transitions…
                </div>
            )}

            {!loading && (
                <>
                    {/* Module Tab Cards */}
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px'
                    }}>
                        {MODULE_CONFIG.map(mod => {
                            const count = (enrichedByModule[mod.moduleId] || []).length;
                            const isActive = selectedModuleId === mod.moduleId;
                            return (
                                <div
                                    key={mod.moduleId}
                                    onClick={() => setSelectedModuleId(mod.moduleId)}
                                    style={{
                                        minWidth: '130px', padding: '12px 16px',
                                        borderRadius: '10px', cursor: 'pointer',
                                        border: `2px solid ${isActive ? mod.color : '#e2e8f0'}`,
                                        background: isActive ? `${mod.color}10` : '#fff',
                                        transition: 'all 0.18s', userSelect: 'none'
                                    }}
                                >
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                                        Module {mod.moduleId}
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '13px', color: isActive ? mod.color : '#334155' }}>
                                        {mod.label}
                                    </div>
                                    <div style={{ marginTop: '6px' }}>
                                        {count > 0 ? (
                                            <span style={{
                                                fontSize: '10px', fontWeight: '700',
                                                background: '#fff7ed', color: '#c2410c',
                                                padding: '2px 8px', borderRadius: '10px',
                                                border: '1px solid #fed7aa'
                                            }}>
                                                {count} Pending
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>No pending</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected Module Table */}
                    {selectedModuleId && (
                        <div style={{
                            background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden'
                        }}>
                            {/* Table Header */}
                            <div style={{
                                padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                                    {MODULE_CONFIG.find(m => m.moduleId === selectedModuleId)?.label} — Pending Records
                                </h3>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                    moduleId = {selectedModuleId}
                                </span>
                            </div>

                            {currentRecords.length === 0 ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                                    <strong>No pending records for this module.</strong>
                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>All records have been verified or none have been submitted yet.</div>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={thStyle}>#</th>
                                            <th style={thStyle}>Request ID</th>
                                            <th style={thStyle}>Workflow Transition ID</th>
                                            <th style={thStyle}>Assigned To</th>
                                            <th style={thStyle}>Record Summary</th>
                                            <th style={thStyle}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRecords.map((row, idx) => {
                                            // Pick a meaningful summary field from the detail
                                            const summary = row.detail?.plantName
                                                || row.detail?.vendorName
                                                || row.detail?.invoiceNo
                                                || row.detail?.materialType
                                                || row.detail?.designId
                                                || row.detail?.benchNo
                                                || row.detail?.supplierName
                                                || '—';

                                            return (
                                                <tr key={row.workflowTransitionId || idx}
                                                    style={{ borderBottom: '1px solid #f1f5f9' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                                >
                                                    <td style={tdStyle}>{idx + 1}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#0369a1' }}>
                                                        #{row.requestId}
                                                    </td>
                                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                                                        {row.workflowTransitionId}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <span style={{
                                                            background: '#eff6ff', color: '#1d4ed8',
                                                            padding: '2px 8px', borderRadius: '6px',
                                                            fontSize: '11px', fontWeight: '600'
                                                        }}>
                                                            User {row.assignedTo}
                                                        </span>
                                                    </td>
                                                    <td style={tdStyle}>{summary}</td>
                                                    <td style={tdStyle}>
                                                        <button
                                                            onClick={() => setDetailModal(row)}
                                                            style={{
                                                                background: '#0f766e', color: '#fff',
                                                                border: 'none', borderRadius: '7px',
                                                                padding: '6px 14px', fontSize: '12px',
                                                                fontWeight: '600', cursor: 'pointer'
                                                            }}
                                                        >
                                                            View & Act
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Detail + Action Modal */}
            {detailModal && (
                <DetailModal
                    record={detailModal}
                    onClose={() => setDetailModal(null)}
                    onAction={handleAction}
                    acting={acting}
                />
            )}
        </div>
    );
};

// Shared table cell styles
const thStyle = {
    padding: '10px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '700', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0'
};
const tdStyle = {
    padding: '12px 16px', color: '#334155', verticalAlign: 'middle'
};

export default IncomingVerificationDashboard;

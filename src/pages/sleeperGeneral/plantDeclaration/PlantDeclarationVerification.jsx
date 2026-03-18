import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';
import VerificationDetailModal from '../rawMaterialVerification/VerificationDetailModal';
import './PlantDeclarationVerification.css';

// ─────────────────────────────────────────────────────
//  Constants – must match sleeper_module table
// ─────────────────────────────────────────────────────
const LOGGED_IN_USER_ID = 119; // Hardcoded IE user

/**
 * sleeper_module table mapping (Plant Declaration group):
 *  id | module_name
 *   1 | PLANT_PROFILE
 *   2 | BENCH_MOULD_MASTER
 *   3 | RAW_MATERIAL_SOURCE
 *   4 | MIX_DESIGN
 */
const PLANT_DECLARATION_MODULES = [
    { moduleId: 1, label: 'Plant Profile',     color: '#7c3aed' },
    { moduleId: 2, label: 'Bench / Mould',     color: '#7c3aed' },
    { moduleId: 3, label: 'Raw Material Src',  color: '#7c3aed' },
    { moduleId: 4, label: 'Mix Design',        color: '#7c3aed' },
];

const MODULE_TABLE_FIELDS = {
    1: [
        { label: 'Plant Name',     key: 'plantNameLocation' },
        { label: 'Vendor Code',    key: 'vendorCode' },
        { label: 'Type Of Plant',  key: 'plantType' },
        { label: 'Sheds / Lines',  key: 'numberOfSheds' },
    ],
    2: [
        { label: 'Shed/Line No',   key: 'lineShedNo' },
        { label: 'Bench/Gang No',  key: 'benchGangNo' },
        { label: 'Sleeper Type',   key: 'sleeperType' },
    ],
    3: [
        { label: 'Material Type',  key: 'rawMaterialType' },
        { label: 'Supplier Name',  key: 'supplierName' },
        { label: 'Approval Ref',   key: 'approvalReference' },
    ],
    4: [
        { label: 'Mix ID',         key: 'identification' },
        { label: 'Grade',          key: 'concreteGrade' },
        { label: 'Authority',      key: 'authorityOfApproval' },
    ],
};

/** Fetch the actual record data for a given moduleId + requestId */
const fetchRecordDetail = async (moduleId, requestId) => {
    const fetchers = {
        1: apiService.getPlantProfileById,
        2: apiService.getBenchMouldMasterById,
        3: apiService.getRawMaterialSourceById,
        4: apiService.getMixDesignById,
    };
    const fn = fetchers[moduleId];
    if (!fn) return null;
    try {
        const res = await fn(requestId);
        return res?.responseData ?? res ?? null;
    } catch (err) {
        console.error('Error fetching record detail', err);
        return null;
    }
};

// Shared table cell styles
const thStyle = {
    padding: '10px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '700', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
};
const tdStyle = {
    padding: '12px 16px', color: '#334155', verticalAlign: 'middle',
};

// ─────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────
const PlantDeclarationVerification = () => {
    const [loading, setLoading]                   = useState(false);
    const [error, setError]                       = useState(null);
    const [allRecords, setAllRecords]             = useState([]);
    const [enrichedByModule, setEnrichedByModule] = useState({});
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [showHistory, setShowHistory]           = useState(false);
    const [detailModal, setDetailModal]           = useState(null); // row open in detail modal
    const [benchType, setBenchType]               = useState('STRESS_BENCH'); // 'STRESS_BENCH' | 'LONG_LINE'
    const [submitting, setSubmitting]             = useState(false);

    // ── Load Data ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = showHistory
                ? await apiService.getAllWorkflowTransitions('IE')
                : await apiService.getAllPendingWorkflowTransitions('IE');

            const rawList = Array.isArray(res)
                ? res
                : (Array.isArray(res?.responseData) ? res.responseData : []);

            // Keep only records accessible by this IE user
            const myRecords = rawList.filter(r =>
                Array.isArray(r.accessibleUserIds) &&
                r.accessibleUserIds.includes(LOGGED_IN_USER_ID)
            );

            // Filter to Plant Declaration modules (1-4)
            const plantModuleIds = PLANT_DECLARATION_MODULES.map(m => m.moduleId);
            const plantRecords   = myRecords.filter(r => plantModuleIds.includes(r.moduleId));

            setAllRecords(plantRecords);

            // Group by moduleId
            const grouped = {};
            for (const mod of PLANT_DECLARATION_MODULES) {
                grouped[mod.moduleId] = [];
            }
            for (const item of plantRecords) {
                const mid = item.moduleId;
                if (grouped[mid]) grouped[mid].push(item);
            }

            // Fetch detail for each record in parallel
            const enriched = {};
            await Promise.all(
                Object.entries(grouped).map(async ([modId, items]) => {
                    const numId   = Number(modId);
                    const modConf = PLANT_DECLARATION_MODULES.find(m => m.moduleId === numId);
                    enriched[numId] = await Promise.all(
                        items.map(async item => {
                            const detail = await fetchRecordDetail(numId, item.requestId);
                            return {
                                ...item,
                                detail:      detail || {},
                                moduleLabel: modConf?.label || `Module ${numId}`,
                            };
                        })
                    );
                })
            );
            setEnrichedByModule(enriched);

            // Auto-select first module that has records
            if (selectedModuleId === null) {
                const firstWithRecords = PLANT_DECLARATION_MODULES.find(
                    m => (enriched[m.moduleId] || []).length > 0
                );
                setSelectedModuleId(
                    firstWithRecords
                        ? firstWithRecords.moduleId
                        : PLANT_DECLARATION_MODULES[0].moduleId
                );
            }
        } catch (err) {
            setError(err.message || 'Failed to load records.');
        } finally {
            setLoading(false);
        }
    }, [showHistory]); // eslint-disable-line

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAction = async (row, action) => {
        const confirmMsg = action === 'UNLOCK' 
            ? 'Are you sure you want to Unlock this record?' 
            : `Are you sure you want to perform ${action}?`;
            
        if (!window.confirm(confirmMsg)) return;

        setSubmitting(true);
        try {
            await apiService.performTransitionAction({
                workflowTransitionId: row.workflowTransitionId,
                moduleId: row.moduleId,
                requestId: row.requestId,
                action: action,
                actionBy: LOGGED_IN_USER_ID,
                remarks: action === 'VERIFY' ? 'Verified by IE' : (action === 'UNLOCK' ? 'Unlocked by IE' : 'Returned for resubmission')
            });
            alert(`Succesfully performed: ${action}`);
            loadData();
        } catch (err) {
            alert(`Action failed: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const totalCount     = allRecords.length;
    let currentRecords = enrichedByModule[selectedModuleId] || [];

    // Filter Module 2 by Bench Type
    if (selectedModuleId === 2) {
        currentRecords = currentRecords.filter(r => {
            // Assuming the detail has a field that identifies the type. 
            // If not found, we show all or try to guess.
            // For now, let's look for 'benchType' or 'plantType' in the detail.
            const type = r.detail?.benchType || r.detail?.plantType || '';
            if (!type) return true; // Show if unknown
            return type.toUpperCase().includes(benchType === 'STRESS_BENCH' ? 'STRESS' : 'LONG');
        });
    }

    // ── Render ──
    return (
        <>
            <div className="pdv-api-container" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── Header ── */}
                <header className="pdv-api-header">
                    <div>
                        <h2 className="pdv-api-title">Plant Declaration Verification</h2>
                        <p className="pdv-api-subtitle">
                            Review and authenticate vendor declarations for live production activation.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`pdv-api-btn-secondary ${showHistory ? 'active' : ''}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {showHistory ? 'Show Pending' : 'Historical Logs'}
                        </button>
                        <button onClick={loadData} disabled={loading} className="pdv-api-btn-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            {loading ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>
                </header>

                {/* ── Summary Banner ── */}
                <div className={`pdv-api-banner ${(totalCount > 0 && !showHistory) ? 'warning' : 'success'}`}>
                    <span className="pdv-api-banner-icon">
                        {(totalCount > 0 && !showHistory) ? '🔔' : '✅'}
                    </span>
                    <div>
                        <strong className="pdv-api-banner-title">
                            {showHistory
                                ? `Showing ${totalCount} historical record(s) for Plant Declaration`
                                : (totalCount > 0
                                    ? `${totalCount} record(s) pending your verification`
                                    : 'All records verified — no pending items')}
                        </strong>
                        <div className="pdv-api-banner-sub">
                            Source: GET /sleeper-workflow/{showHistory ? 'allWorkflowTransition' : 'allPendingWorkflowTransition'}?roleName=IE
                        </div>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="pdv-api-error">⚠️ {error}</div>
                )}

                {/* ── Loading ── */}
                {loading && (
                    <div className="pdv-api-loading">
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                        Loading pending workflow transitions…
                    </div>
                )}

                {!loading && (
                    <>
                        {/* ── Module Cards ── */}
                        <div className="pdv-api-module-cards">
                            {PLANT_DECLARATION_MODULES.map(mod => {
                                const count    = (enrichedByModule[mod.moduleId] || []).length;
                                const isActive = selectedModuleId === mod.moduleId;
                                return (
                                    <div
                                        key={mod.moduleId}
                                        onClick={() => setSelectedModuleId(mod.moduleId)}
                                        className={`pdv-api-module-card ${isActive ? 'active' : ''}`}
                                        style={{
                                            borderColor: isActive ? mod.color : '#e2e8f0',
                                            background:  isActive ? `${mod.color}15` : '#fff',
                                        }}
                                    >
                                        <div className="pdv-api-mod-id">Module {mod.moduleId}</div>
                                        <div className="pdv-api-mod-label" style={{ color: isActive ? mod.color : '#334155' }}>
                                            {mod.label}
                                        </div>
                                        <div className="pdv-api-mod-badge-wrap">
                                            {count > 0 ? (
                                                <span className={`pdv-api-mod-badge ${showHistory ? 'history' : 'pending'}`}>
                                                    {count} {showHistory ? 'Total' : 'Pending'}
                                                </span>
                                            ) : (
                                                <span className="pdv-api-mod-badge none">None found</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Records Table ── */}
                        {selectedModuleId && (
                            <div className="pdv-api-table-card">
                                {/* Table Header */}
                                <div className="pdv-api-table-header">
                                    <h3 className="pdv-api-table-title">
                                        {PLANT_DECLARATION_MODULES.find(m => m.moduleId === selectedModuleId)?.label}
                                        {' '}—{' '}
                                        {showHistory ? 'Historical Logs' : 'Pending Records'}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {selectedModuleId === 2 && (
                                            <div className="pdv-bench-toggle" style={{
                                                display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0'
                                            }}>
                                                <button
                                                    onClick={() => setBenchType('STRESS_BENCH')}
                                                    style={{
                                                        padding: '5px 12px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                                        background: benchType === 'STRESS_BENCH' ? '#7c3aed' : 'transparent',
                                                        color: benchType === 'STRESS_BENCH' ? '#fff' : '#64748b',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >Stress Bench</button>
                                                <button
                                                    onClick={() => setBenchType('LONG_LINE')}
                                                    style={{
                                                        padding: '5px 12px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                                        background: benchType === 'LONG_LINE' ? '#7c3aed' : 'transparent',
                                                        color: benchType === 'LONG_LINE' ? '#fff' : '#64748b',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >Long Line</button>
                                            </div>
                                        )}
                                        <span className="pdv-api-table-meta">moduleId = {selectedModuleId}</span>
                                    </div>
                                </div>

                                {currentRecords.length === 0 ? (
                                    <div className="pdv-api-empty">
                                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                                        <strong>No pending records for this module.</strong>
                                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                            All records have been verified or none have been submitted yet.
                                        </div>
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <th style={thStyle}>#</th>
                                                <th style={thStyle}>Request ID</th>
                                                <th style={thStyle}>Workflow Transition ID</th>
                                                <th style={thStyle}>Assigned To</th>
                                                {MODULE_TABLE_FIELDS[selectedModuleId]?.map(col => (
                                                    <th key={col.key} style={thStyle}>{col.label}</th>
                                                ))}
                                                <th style={thStyle}>Status</th>
                                                <th style={thStyle}>{selectedModuleId === 2 ? 'Quick Actions' : 'Details'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((row, idx) => (
                                                <tr
                                                    key={row.workflowTransitionId || idx}
                                                    style={{ borderBottom: '1px solid #f1f5f9' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                                >
                                                    <td style={tdStyle}>{idx + 1}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#7c3aed' }}>
                                                        #{row.requestId}
                                                    </td>
                                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                                                        {row.workflowTransitionId}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <span style={{
                                                            background: '#ede9fe', color: '#5b21b6',
                                                            padding: '2px 8px', borderRadius: '6px',
                                                            fontSize: '11px', fontWeight: '600',
                                                        }}>
                                                            User {row.assignedTo}
                                                        </span>
                                                    </td>
                                                    {MODULE_TABLE_FIELDS[selectedModuleId]?.map(col => (
                                                        <td key={col.key} style={tdStyle}>
                                                            {row.detail?.[col.key] ?? '-'}
                                                        </td>
                                                    ))}
                                                    <td style={tdStyle}>
                                                        <span style={{
                                                            background: '#fef3c7', color: '#92400e',
                                                            padding: '3px 8px', borderRadius: '6px',
                                                            fontSize: '11px',
                                                        }}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {selectedModuleId === 2 ? (
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                {/* Pending or Unlocked -> Verify & Return */}
                                                                {(row.status === 'Pending' || row.status === 'UNLOCKED' || row.status === 'Unlocked') && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleAction(row, 'VERIFY')}
                                                                            disabled={submitting}
                                                                            style={{
                                                                                background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                                                                            }}
                                                                        >Verify</button>
                                                                        <button
                                                                            onClick={() => handleAction(row, 'REQUEST_BACK')}
                                                                            disabled={submitting}
                                                                            style={{
                                                                                background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                                                                            }}
                                                                        >Return</button>
                                                                    </>
                                                                )}
                                                                {/* Verified -> Unlock */}
                                                                {(row.status === 'VERIFIED' || row.status === 'Verified') && (
                                                                    <button
                                                                        onClick={() => handleAction(row, 'UNLOCK')}
                                                                        disabled={submitting}
                                                                        style={{
                                                                            background: '#0369a1', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                                                                        }}
                                                                    >Unlock</button>
                                                                )}
                                                                {/* Returned -> Label */}
                                                                {(row.status?.includes('REQUEST') || row.status === 'Returned') && (
                                                                    <span style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>Pending Resubmission</span>
                                                                )}
                                                                <button
                                                                    onClick={() => setDetailModal(row)}
                                                                    style={{
                                                                        background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer'
                                                                    }}
                                                                    title="Full View"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDetailModal(row)}
                                                                style={{
                                                                    background: '#7c3aed',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '7px 14px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    whiteSpace: 'nowrap',
                                                                    transition: 'background 0.15s',
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                                                                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                                                            >
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                                </svg>
                                                                View
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Detail + Action Modal ── */}
            {detailModal && (
                <VerificationDetailModal
                    row={detailModal}
                    moduleLabel={PLANT_DECLARATION_MODULES.find(m => m.moduleId === detailModal.moduleId)?.label || `Module ${detailModal.moduleId}`}
                    actionBy={LOGGED_IN_USER_ID}
                    onClose={() => setDetailModal(null)}
                    onDone={loadData}
                />
            )}
        </>
    );
};

export default PlantDeclarationVerification;

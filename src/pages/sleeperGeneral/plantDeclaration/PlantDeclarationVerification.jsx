import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api';
import { getAllCompletedCalls } from '../../../services/workflowService';
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
    { moduleId: 12, label: 'Long Line',        color: '#7c3aed', hidden: true },
];

const MODULE_TABLE_FIELDS = {
    1: [
        { label: 'Plant Name',     key: 'plantNameLocation' },
        { label: 'Vendor Code',    key: 'vendorCode' },
        { label: 'Type Of Plant',  key: 'plantType' },
        { label: 'Sheds / Lines',  key: 'numberOfSheds' },
    ],
    2: [
        { label: 'Entry Type',     key: 'entryType' },
        { label: 'Bench(es)',      key: 'benchIdentifier' }, // Custom key for display logic
        { label: 'Sleeper Cat',    key: 'sleeperCategory' },
        { label: 'Moulds/Bench',   key: 'mouldsPerBench' },
    ],
    12: [
        { label: 'Entry Type',     key: 'entryType' },
        { label: 'Bench(es)',      key: 'benchIdentifier' }, 
        { label: 'Sleeper Cat',    key: 'sleeperCategory' },
        { label: 'Moulds/Bench',   key: 'mouldsPerBench' },
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
        12: apiService.getBenchMouldMasterById,
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

const getStatusDisplay = (status) => {
    if (!status) return { label: '-', bg: '#f1f5f9', color: '#475569' };
    const s = status.toUpperCase();
    if (s === 'CREATED') return { label: 'Verification Pending', bg: '#fff7ed', color: '#c2410c' }; // Orange/Yellow
    if (s === 'COMPLETED') return { label: 'Verified and Locked', bg: '#ecfdf5', color: '#047857' }; // Green
    if (s === 'REJECTED_CLOSED') return { label: 'Rejected', bg: '#fef2f2', color: '#991b1b' }; // Red
    return { label: status, bg: '#f1f5f9', color: '#475569' };
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
    
    // Data states
    const [pendingByModule, setPendingByModule]     = useState({}); 
    const [completedByModule, setCompletedByModule] = useState({});

    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [detailModal, setDetailModal]           = useState(null); 
    const [benchType, setBenchType]               = useState('STRESS_BENCH'); 
    const [submitting, setSubmitting]             = useState(false);

    // ── Load Data ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch both in parallel
            const [pendingRes, completedRes] = await Promise.all([
                apiService.getAllPendingWorkflowTransitions('IE'),
                getAllCompletedCalls()
            ]);

            const rawPending = Array.isArray(pendingRes) ? pendingRes : (pendingRes?.responseData || []);
            const rawCompleted = Array.isArray(completedRes) ? completedRes : (completedRes?.responseData || []);

            // Helper to process a list into enriched-by-module map
            const processRecords = async (rawList) => {
                const myRecords = rawList.filter(r =>
                    Array.isArray(r.accessibleUserIds) &&
                    r.accessibleUserIds.includes(LOGGED_IN_USER_ID)
                );
                const plantModuleIds = PLANT_DECLARATION_MODULES.map(m => m.moduleId);
                const plantRecords = myRecords.filter(r => plantModuleIds.includes(r.moduleId));

                const grouped = {};
                for (const mod of PLANT_DECLARATION_MODULES) { grouped[mod.moduleId] = []; }
                for (const item of plantRecords) {
                    if (grouped[item.moduleId]) grouped[item.moduleId].push(item);
                }

                const enriched = {};
                await Promise.all(
                    Object.entries(grouped).map(async ([mid, items]) => {
                        const numId = Number(mid);
                        const modConf = PLANT_DECLARATION_MODULES.find(m => m.moduleId === numId);
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
                return enriched;
            };

            const [pEnriched, cEnriched] = await Promise.all([
                processRecords(rawPending),
                processRecords(rawCompleted)
            ]);

            setPendingByModule(pEnriched);
            setCompletedByModule(cEnriched);

            if (selectedModuleId === null) {
                setSelectedModuleId(PLANT_DECLARATION_MODULES[0].moduleId);
            }
        } catch (err) {
            setError(err.message || 'Failed to load records.');
        } finally {
            setLoading(false);
        }
    }, [selectedModuleId]);

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

    const renderTable = (records, isHistory = false) => {
        if (!records || records.length === 0) {
            return (
                <div className="pdv-api-empty" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌑</div>
                    <strong style={{ fontSize: '13px' }}>No records found.</strong>
                </div>
            );
        }

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Request ID</th>
                        <th style={thStyle}>Transition ID</th>
                        <th style={thStyle}>Assigned</th>
                        {MODULE_TABLE_FIELDS[records[0]?.moduleId || selectedModuleId]?.map(col => (
                            <th key={col.key} style={thStyle}>{col.label}</th>
                        ))}
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((row, idx) => (
                        <tr key={row.workflowTransitionId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={tdStyle}>{idx + 1}</td>
                            <td style={{ ...tdStyle, fontWeight: '700', color: '#7c3aed' }}>#{row.requestId}</td>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>{row.workflowTransitionId}</td>
                            <td style={tdStyle}>User {row.assignedTo}</td>
                            {MODULE_TABLE_FIELDS[row.moduleId || selectedModuleId]?.map(col => {
                                if (col.key === 'benchIdentifier') {
                                    const bNo = row.detail?.benchNo;
                                    const bFrom = row.detail?.benchFrom;
                                    const bTo = row.detail?.benchTo;
                                    const display = bNo ? bNo : (bFrom && bTo ? `${bFrom}-${bTo}` : '-');
                                    return <td key={col.key} style={tdStyle}>{display}</td>;
                                }
                                return <td key={col.key} style={tdStyle}>{row.detail?.[col.key] ?? '-'}</td>;
                            })}
                            <td style={tdStyle}>
                                {(() => {
                                    const { label, bg, color } = getStatusDisplay(row.status);
                                    return (
                                        <span style={{ 
                                            background: bg, color: color, padding: '3px 10px', 
                                            borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                            border: `1px solid ${color}20`
                                        }}>
                                            {label}
                                        </span>
                                    );
                                })()}
                            </td>
                            <td style={tdStyle}>
                                {(row.moduleId === 2 || row.moduleId === 12) ? (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {/* Pending Actions */}
                                        {!isHistory && (row.status === 'CREATED' || row.status?.toUpperCase() === 'UNLOCKED') && (
                                            <>
                                                <button onClick={() => handleAction(row, 'VERIFY')} disabled={submitting} className="pdv-verify-btn">Verify</button>
                                                <button onClick={() => handleAction(row, 'REQUEST_BACK')} disabled={submitting} className="pdv-return-btn">Return</button>
                                            </>
                                        )}
                                        <button onClick={() => setDetailModal(row)} className="pdv-view-mini">View</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setDetailModal(row)} className="pdv-view-full" style={{
                                        background: isHistory ? '#059669' : '#7c3aed',
                                        color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: '700', cursor: 'pointer'
                                    }}>View</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // ── Render ──
    return (
        <div className="pdv-api-container" style={{ fontFamily: "'Inter', sans-serif" }}>
            <header className="pdv-api-header">
                <div>
                    <h2 className="pdv-api-title">Plant Declaration Verification</h2>
                    <p className="pdv-api-subtitle">Reviewing vendor declarations with integrated historical logs.</p>
                </div>
                <button onClick={loadData} disabled={loading} className="pdv-api-btn-secondary">
                    {loading ? 'Refreshing…' : 'Refresh Data'}
                </button>
            </header>



            {error && <div className="pdv-api-error">⚠️ {error}</div>}

            {loading ? (
                <div className="pdv-api-loading">Loading transitions…</div>
            ) : (
                <>
                    {/* Module Tabs */}
                    <div className="pdv-api-module-cards">
                        {PLANT_DECLARATION_MODULES.filter(m => !m.hidden).map(mod => {
                            let pCount = (pendingByModule[mod.moduleId] || []).length;
                            let hCount = (completedByModule[mod.moduleId] || []).length;
                            
                            // If it's the Bench/Mould tab, include Long Line (12) counts
                            if (mod.moduleId === 2) {
                                pCount += (pendingByModule[12] || []).length;
                                hCount += (completedByModule[12] || []).length;
                            }

                            const isActive = selectedModuleId === mod.moduleId;
                            return (
                                <div
                                    key={mod.moduleId}
                                    onClick={() => setSelectedModuleId(mod.moduleId)}
                                    className={`pdv-api-module-card ${isActive ? 'active' : ''}`}
                                    style={{ borderColor: isActive ? mod.color : '#e2e8f0', background: isActive ? `${mod.color}10` : '#fff' }}
                                >
                                    <div className="pdv-api-mod-label" style={{ color: isActive ? mod.color : '#334155' }}>{mod.label}</div>
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                                        <span style={{ fontSize: '10px', background: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: '4px' }}>P: {pCount}</span>
                                        <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>V: {hCount}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tables */}
                    {selectedModuleId && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '10px' }}>
                            
                            {/* Pending Table */}
                            <div className="pdv-api-table-card" style={{ borderTop: '4px solid #f59e0b' }}>
                                <div className="pdv-api-table-header">
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#92400e' }}>Pending Verification</h3>
                                    {selectedModuleId === 2 && (
                                        <div className="pdv-bench-toggle">
                                            <button onClick={() => setBenchType('STRESS_BENCH')} className={benchType === 'STRESS_BENCH' ? 'active' : ''}>Stress</button>
                                            <button onClick={() => setBenchType('LONG_LINE')} className={benchType === 'LONG_LINE' ? 'active' : ''}>Long Line</button>
                                        </div>
                                    )}
                                </div>
                                {renderTable(
                                    benchType === 'STRESS_BENCH' 
                                        ? (pendingByModule[2] || []) 
                                        : (pendingByModule[12] || []),
                                    false
                                )}
                            </div>

                            {/* Completed Table */}
                            <div className="pdv-api-table-card" style={{ borderTop: '4px solid #10b981' }}>
                                <div className="pdv-api-table-header">
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#065f46' }}>Verified and Locked Log</h3>
                                    {selectedModuleId === 2 && (
                                        <div className="pdv-bench-toggle">
                                            <button onClick={() => setBenchType('STRESS_BENCH')} className={benchType === 'STRESS_BENCH' ? 'active' : ''}>Stress</button>
                                            <button onClick={() => setBenchType('LONG_LINE')} className={benchType === 'LONG_LINE' ? 'active' : ''}>Long Line</button>
                                        </div>
                                    )}
                                </div>
                                {renderTable(
                                    benchType === 'STRESS_BENCH' 
                                        ? (completedByModule[2] || []) 
                                        : (completedByModule[12] || []),
                                    true
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {detailModal && (
                <VerificationDetailModal
                    row={detailModal}
                    moduleLabel={PLANT_DECLARATION_MODULES.find(m => m.moduleId === detailModal.moduleId)?.label || `Module ${detailModal.moduleId}`}
                    actionBy={LOGGED_IN_USER_ID}
                    onClose={() => setDetailModal(null)}
                    onDone={loadData}
                />
            )}
        </div>
    );
};

export default PlantDeclarationVerification;

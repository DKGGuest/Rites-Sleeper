import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../../../services/api';
import VerificationDetailModal from './VerificationDetailModal';

// ─────────────────────────────────────────────
//  Constants – must match sleeper_module table
// ─────────────────────────────────────────────

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
    { moduleId: 1, label: 'Plant Profile', group: 'Plant Declaration', color: '#7c3aed' },
    { moduleId: 2, label: 'Bench / Mould', group: 'Plant Declaration', color: '#7c3aed' },
    { moduleId: 3, label: 'Raw Material Src', group: 'Plant Declaration', color: '#7c3aed' },
    { moduleId: 4, label: 'Mix Design', group: 'Plant Declaration', color: '#7c3aed' },
    { moduleId: 5, label: 'HTS Wire', group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 6, label: 'Cement', group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 7, label: 'Admixture', group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 8, label: 'Aggregates', group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 9, label: 'SGCI Insert', group: 'Incoming Verification', color: '#0369a1' },
    { moduleId: 10, label: 'Dowel', group: 'Incoming Verification', color: '#0369a1' },

    // Production Verification Group
    { moduleId: 11, label: 'Production Declaration', group: 'Production Verification', color: '#0891b2' },
];

/** Fetch the actual record data for a given moduleId + requestId */
const fetchRecordDetail = async (moduleId, requestId) => {

    const fetchers = {
        1: apiService.getPlantProfileById,
        2: apiService.getBenchMouldMasterById,
        3: apiService.getRawMaterialSourceById,
        4: apiService.getMixDesignById,
        5: apiService.getHtsWireRecordById,
        6: apiService.getCementRecordById,
        7: apiService.getAdmixtureRecordById,
        8: apiService.getAggregateRecordById,
        9: apiService.getSgciRecordById,
        10: apiService.getDowelRecordById,
        11: apiService.getProductionDeclarationRecordById,
    };

    const fn = fetchers[moduleId];

    if (!fn) return null;

    try {
        const res = await fn(requestId);
        return res?.responseData ?? null;
    } catch (error) {
        console.error("Error fetching record detail", error);
        return null;
    }
};

// ─────────────────────────────────────────────
//  Sub-component: Record Detail Modal
// ─────────────────────────────────────────────
const DetailModal = ({ record, onClose, onAction, acting }) => {
    const [remarks, setRemarks] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // 'VERIFY' | 'REQUEST_BACK'

    const handleConfirm = () => {
        if (pendingAction === 'REQUEST_BACK' && !remarks.trim()) {
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
                            onClick={() => setPendingAction('REQUEST_BACK')}
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

const MODULE_TABLE_FIELDS = {

    // 1️Plant Profile  ✅ already working
    1: [
        { label: "Plant Name", key: "plantNameLocation" },
        { label: "Vendor Code", key: "vendorCode" },
        { label: "Type Of Plant", key: "plantType" },
        { label: "Sheds / Lines", key: "numberOfSheds" }
    ],

    // 2️ Stress Bench / Mould Master
    2: [
        { label: "Entry Type", key: "entryType" },
        { label: "Bench(es)", key: "benchNo" },
        { label: "Category", key: "sleeperCategory" },
        { label: "Moulds/Bench", key: "mouldsPerBench" }
    ],

    // 3️ Raw Material Source
    3: [
        { label: "Material Type", key: "rawMaterialType" },
        { label: "Supplier Name", key: "supplierName" },
        { label: "Approval Ref", key: "approvalReference" }
    ],

    // 4️ Mix Design
    4: [
        { label: "Mix ID", key: "identification" },
        { label: "Authority", key: "concreteGrade" },
        { label: "A/C Ratio", key: "authorityOfApproval" }
    ],

    // 5️ HTS Wire
    5: [
        { label: "Manufacturer", key: "manufacturer" },
        { label: "Batch No", key: "invoiceNumber" },
        { label: "Diameter", key: "gradeSpec" }
    ],

    // 6️⃣ Cement
    6: [
        { label: "Brand", key: "manufacturer" },
        { label: "Grade", key: "gradeSpec" },
        { label: "Batch No", key: "invoiceNumber" }
    ],

    // 7️⃣ Admixture
    7: [
        { label: "Brand", key: "manufacturer" },
        { label: "Type", key: "gradeSpec" },
        { label: "Batch No", key: "invoiceNumber" }
    ],

    // 8️⃣ Aggregates
    8: [
        { label: "Source", key: "source" },
        { label: "Grade", key: "gradeSpec" },
        { label: "Challan No", key: "challanNumber" }
    ],

    // 9️⃣ SGCI Insert
    9: [
        { label: "Manufacturer", key: "manufacturer" },
        { label: "Batch No", key: "invoiceNumber" },
        { label: "Specification", key: "ritesIcNumber" }
    ],

    // 🔟 Dowel
    10: [
        { label: "Manufacturer", key: "manufacturer" },
        { label: "Invoice No", key: "invoiceNumber" },
        { label: "Rites IC", key: "ritesIcNumber" }
    ],

    // 11 Production Declaration
    11: [
        { label: "Location", key: "productionUnit" },
        { label: "Date", key: "castingDate" },
        { label: "Batch No.", key: "batchNumber" }
    ],
    // 12 Stress Bench / Mould Master
    12: [
        { label: "Entry Type", key: "entryType" },
        { label: "Bench(es)", key: "benchNo" },
        { label: "Category", key: "sleeperCategory" },
        { label: "Moulds/Bench", key: "mouldsPerBench" }
    ],
};

const getStatusDisplay = (status) => {
    if (!status) return { label: '-', bg: '#f1f5f9', color: '#475569' };
    const s = status.toUpperCase();
    if (s === 'CREATED') return { label: 'Verification Pending', bg: '#fff7ed', color: '#c2410c' }; // Orange/Yellow
    if (s === 'COMPLETED') return { label: 'Verified and Locked', bg: '#ecfdf5', color: '#047857' }; // Green
    if (s === 'REJECTED_CLOSED') return { label: 'Rejected', bg: '#fef2f2', color: '#991b1b' }; // Red
    return { label: status, bg: '#f1f5f9', color: '#475569' };
};

// ─────────────────────────────────────────────
//  Main Dashboard Component
// ─────────────────────────────────────────────

const IncomingVerificationDashboard = ({ initialGroup = null }) => {
    const { userId } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // All records (pending or verified)
    const [allRecords, setAllRecords] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Records enriched with detail data per module
    const [enrichedByModule, setEnrichedByModule] = useState({}); // { moduleId: [{...transition, detail, moduleLabel}] }

    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [detailModal, setDetailModal] = useState(null); // row to show in the detail modal

    // Filter MODULE_CONFIG by initialGroup if provided
    const filteredModules = initialGroup
        ? MODULE_CONFIG.filter(m => m.group === initialGroup)
        : MODULE_CONFIG;

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

            const myRecords = rawList.filter(r =>
                Array.isArray(r.accessibleUserIds) &&
                r.accessibleUserIds.includes(parseInt(userId))
            );

            // Filter by initialGroup's module IDs
            const filteredModuleIds = filteredModules.map(m => m.moduleId);
            const myFilteredRecords = myRecords.filter(r => filteredModuleIds.includes(r.moduleId));

            setAllRecords(myFilteredRecords);

            // Group by moduleId
            const grouped = {};
            for (const mod of filteredModules) {
                grouped[mod.moduleId] = [];
            }
            for (const item of myFilteredRecords) {
                const mid = item.moduleId;
                if (grouped[mid]) grouped[mid].push(item);
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

            // Auto-select first module that has records
            if (filteredModules.length > 0 && selectedModuleId === null) {
                const firstWithRecords = filteredModules.find(m => (enriched[m.moduleId] || []).length > 0);
                setSelectedModuleId(firstWithRecords ? firstWithRecords.moduleId : filteredModules[0].moduleId);
            }
        } catch (err) {
            setError(err.message || 'Failed to load records.');
        } finally {
            setLoading(false);
        }
    }, [showHistory, initialGroup]); // eslint-disable-line

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Action is now handled inside VerificationDetailModal — kept only for API compatibility
    // loadData is passed to modal's onDone prop

    const countLabel = showHistory ? 'total records' : 'pending records';
    const totalCount = allRecords.length;
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
                        IE {initialGroup || 'Verification'} Dashboard
                    </h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>
                        Records assigned to User ID: {userId}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: showHistory ? '#f1f5f9' : '#fff', color: '#334155', fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {showHistory ? 'Show Pending' : 'Historical Logs'}
                    </button>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: '#fff', color: '#334155', fontSize: '12px', fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </header>

            {/* Summary banner */}
            <div style={{
                background: (totalCount > 0 && !showHistory) ? '#fff7ed' : '#f0fdf4',
                border: `1px solid ${(totalCount > 0 && !showHistory) ? '#fed7aa' : '#bbf7d0'}`,
                borderRadius: '12px', padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'
            }}>
                <span style={{ fontSize: '22px' }}>{(totalCount > 0 && !showHistory) ? '🔔' : '✅'}</span>
                <div>
                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                        {showHistory
                            ? `Showing ${totalCount} historical record(s) for ${initialGroup || 'all modules'}`
                            : (totalCount > 0 ? `${totalCount} record(s) pending your verification` : 'All records verified — no pending items')}
                    </strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Source: GET /sleeper-workflow/{showHistory ? 'allWorkflowTransition' : 'allPendingWorkflowTransition'}?roleName=IE
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
                        {filteredModules.map(mod => {
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
                                                background: showHistory ? '#f1f5f9' : '#fff7ed',
                                                color: showHistory ? '#475569' : '#c2410c',
                                                padding: '2px 8px', borderRadius: '10px',
                                                border: `1px solid ${showHistory ? '#e2e8f0' : '#fed7aa'}`
                                            }}>
                                                {count} {showHistory ? 'Total' : 'Pending'}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>None found</span>
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
                                    {MODULE_CONFIG.find(m => m.moduleId === selectedModuleId)?.label} — {showHistory ? 'Historical Logs' : 'Pending Records'}
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
                                            {MODULE_TABLE_FIELDS[selectedModuleId]?.map(col => (
                                                <th key={col.key} style={thStyle}>{col.label}</th>
                                            ))}
                                            <th style={thStyle}>Status</th>
                                            <th style={thStyle}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRecords.map((row, idx) => {
                                            // Pick a meaningful summary field from the detail
                                            const summary =
                                                row.detail?.plantNameLocation ||
                                                row.detail?.plantName ||
                                                row.detail?.vendorName ||
                                                row.detail?.invoiceNo ||
                                                row.detail?.materialType ||
                                                row.detail?.designId ||
                                                row.detail?.benchNo ||
                                                row.detail?.supplierName ||
                                                '—';

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
                                                    {MODULE_TABLE_FIELDS[selectedModuleId]?.map(col => {
                                                        if (col.key === 'benchIdentifier') {
                                                            const bNo = row.detail?.benchNo;
                                                            const bFrom = row.detail?.benchFrom;
                                                            const bTo = row.detail?.benchTo;
                                                            const displayValue = bNo ? bNo : (bFrom && bTo ? `${bFrom}-${bTo}` : '-');
                                                            return <td key={col.key} style={tdStyle}>{displayValue}</td>;
                                                        }
                                                        return (
                                                            <td key={col.key} style={tdStyle}>
                                                                {row.detail?.[col.key] ?? '-'}
                                                            </td>
                                                        );
                                                    })}

                                                    <td style={tdStyle}>
                                                        {(() => {
                                                            const { label, bg, color } = getStatusDisplay(row.status);
                                                            return (
                                                                <span style={{
                                                                    background: bg,
                                                                    color: color,
                                                                    padding: '3px 10px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    border: `1px solid ${color}20`
                                                                }}>
                                                                    {label}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <button
                                                            onClick={() => setDetailModal(row)}
                                                            style={{
                                                                background: '#0369a1',
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
                                                            onMouseEnter={e => e.currentTarget.style.background = '#075985'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#0369a1'}
                                                        >
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                            </svg>
                                                            View
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

            {/* ── Detail + Action Modal ── */}
            {detailModal && (
                <VerificationDetailModal
                    row={detailModal}
                    moduleLabel={MODULE_CONFIG.find(m => m.moduleId === detailModal.moduleId)?.label || `Module ${detailModal.moduleId}`}
                    actionBy={userId}
                    onClose={() => setDetailModal(null)}
                    onDone={loadData}
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

import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
//  Module → fetch function map  (covers all 11 modules)
// ─────────────────────────────────────────────────────────────────────────────
const MODULE_FETCHERS = {
    1:  (id) => apiService.getPlantProfileById(id),
    2:  (id) => apiService.getBenchMouldMasterById(id),
    3:  (id) => apiService.getRawMaterialSourceById(id),
    4:  (id) => apiService.getMixDesignById(id),
    5:  (id) => apiService.getHtsWireRecordById(id),
    6:  (id) => apiService.getCementRecordById(id),
    7:  (id) => apiService.getAdmixtureRecordById(id),
    8:  (id) => apiService.getAggregateRecordById(id),
    9:  (id) => apiService.getSgciRecordById(id),
    10: (id) => apiService.getDowelRecordById(id),
    11: (id) => apiService.getProductionDeclarationRecordById(id),
    12: (id) => apiService.getBenchMouldMasterById(id),
};

// Human-readable labels for common backend keys
const KEY_LABELS = {
    // Module 1 — Plant Profile
    plantNameLocation:   'Plant Name & Location',
    vendorCode:          'Vendor Code',
    plantType:           'Type of Plant',
    numberOfSheds:       'Sheds / Lines',
    numberOfLines:       'Number of Lines',
    contactPerson:       'Contact Person',
    contactNumber:       'Contact Number',
    // Module 2 — Stress Bench / Mould Master
    entryType:           'Entry Type',
    benchNo:             'Bench No. (Single)',
    benchFrom:           'Bench From',
    benchTo:             'Bench To',
    noOfBenches:         'Total Benches',
    sleeperCategory:     'Sleeper Category',
    mouldsPerBench:      'Moulds Per Bench',
    mouldCondition:      'Mould Condition',
    // Module 3 — Raw Material Source
    rawMaterialType:     'Material Type',
    supplierName:        'Supplier Name',
    sourceLocation:      'Source Location',
    approvalReference:   'Approval Reference',
    validUpto:           'Valid Upto',
    // Module 4 — Mix Design
    identification:      'Mix ID',
    concreteGrade:       'Concrete Grade',
    authorityOfApproval: 'Authority',
    cementContent:       'Cement (kg/m³)',
    waterContent:        'Water (L)',
    fineAggregate:       'Fine Aggregate (kg)',
    coarseAggregate1:    'CA-1 (kg)',
    coarseAggregate2:    'CA-2 (kg)',
    admixtureDosage:     'Admixture Dosage',
    wcRatio:             'W/C Ratio',
    acRatio:             'A/C Ratio',
    // Module 5 — HTS Wire
    manufacturer:        'Manufacturer',
    lotNo:               'Lot No. / Batch',
    invoiceNumber:       'Invoice No.',
    gradeSpec:           'Grade / Spec.',
    quantity:            'Quantity',
    unitOfMeasure:       'Unit',
    receivedDate:        'Received Date',
    ritesIcNumber:       'RITES IC No.',
    // Module 6 — Cement
    brand:               'Brand',
    grade:               'Grade',
    // Module 7 — Admixture
    // (shares manufacturer, gradeSpec, invoiceNumber)
    // Module 8 — Aggregates
    source:              'Source',
    challanNumber:       'Challan No.',
    aggregateType:       'Aggregate Type',
    // Module 9 — SGCI Insert
    // (shares manufacturer, invoiceNumber, ritesIcNumber)
    // Module 10 — Dowel
    // (shares manufacturer, invoiceNumber, ritesIcNumber)
    // Module 11 — Production Declaration
    productionUnit:      'Production Unit',
    castingDate:         'Casting Date',
    batchNumber:         'Batch No.',
    totalCastedSleepers: 'No. of Sleepers',
    // benchNo:             'Bench No.',
    shiftType:           'Shift',
    // Generic / Audit
    id:                  'Record ID',
    status:              'Status',
    recordStatus:        'Status',
    createdAt:           'Created At',
    createdDate:         'Created Date',
    createdBy:           'Created By',
    updatedAt:           'Updated Date',
    updatedDate:         'Updated Date',
    modifiedAt:          'Updated Date',
    modifiedDate:        'Updated Date',
    lastModifiedDate:    'Updated Date',
    updatedBy:           'Updated By',
    modifiedBy:          'Updated By',
    lastModifiedBy:      'Updated By',
    remarks:             'Remarks',
};

const getStatusDisplay = (status) => {
    if (!status) return { label: '-', bg: '#f1f5f9', color: '#475569' };
    const s = status.toUpperCase();
    if (s === 'CREATED') return { label: 'Verification Pending', bg: '#fff7ed', color: '#c2410c' }; // Orange/Yellow
    if (s === 'COMPLETED') return { label: 'Verified and Locked', bg: '#ecfdf5', color: '#047857' }; // Green
    if (s === 'REJECTED_CLOSED') return { label: 'Rejected', bg: '#fef2f2', color: '#991b1b' }; // Red
    return { label: status, bg: '#f1f5f9', color: '#475569' };
};

const formatKey = (key) =>
    KEY_LABELS[key] ||
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();

const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    
    // Handle Dates
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {}
    }

    if (Array.isArray(val)) {
        if (val.length === 0) return '—';
        if (typeof val[0] !== 'object') return val.join(', ');
        return `${val.length} entries`;
    }

    if (typeof val === 'object') {
        const label = val.name || val.label || val.username || val.title || val.id;
        if (label !== undefined) return String(label);
        return '—';
    }

    return String(val);
};

// ─────────────────────────────────────────────────────────────────────────────
//  VerificationDetailModal
//  Props:
//    row        – the workflow transition row object
//    moduleLabel – display name for the module
//    actionBy   – user ID of the IE performing the action
//    onClose    – callback to close the modal
//    onDone     – callback fired after successful action (to refresh parent)
// ─────────────────────────────────────────────────────────────────────────────
const VerificationDetailModal = ({ row, moduleLabel, actionBy, onClose, onDone }) => {
    const [detail, setDetail]         = useState(null);
    const [detailLoading, setDetailLoading] = useState(true);
    const [detailError, setDetailError]    = useState(null);

    const [pendingAction, setPendingAction] = useState(null); // 'VERIFY' | 'REQUEST_BACK' | 'REJECT'
    const [remarks, setRemarks]       = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch detail on mount
    useEffect(() => {
        const fetcher = MODULE_FETCHERS[row.moduleId];
        if (!fetcher) {
            setDetailError('No fetcher configured for this module.');
            setDetailLoading(false);
            return;
        }
        fetcher(row.requestId)
            .then((res) => {
                // Some endpoints wrap in responseData, some return directly
                const data = res?.responseData ?? res ?? {};
                setDetail(data);
            })
            .catch((err) => setDetailError(err.message || 'Failed to load record details.'))
            .finally(() => setDetailLoading(false));
    }, [row.moduleId, row.requestId]);

    const handleConfirm = async () => {
        if ((pendingAction === 'REQUEST_BACK' || pendingAction === 'REJECT') && !remarks.trim()) {
            alert(`Please enter remarks before ${pendingAction === 'REJECT' ? 'rejecting' : 'returning'} the record.`);
            return;
        }
        setSubmitting(true);
        try {
            const actionLabel = pendingAction === 'VERIFY' ? 'verified' : (pendingAction === 'REJECT' ? 'rejected' : 'returned');
            
            await apiService.performTransitionAction({
                workflowTransitionId: row.workflowTransitionId,
                moduleId:             row.moduleId,
                requestId:            row.requestId,
                action:               pendingAction,
                actionBy,
                remarks: remarks.trim() || (pendingAction === 'VERIFY' ? 'Verified by IE' : (pendingAction === 'REJECT' ? 'Rejected by IE' : 'Returned for change')),
            });
            
            alert(pendingAction === 'VERIFY'
                ? '✓ Record verified successfully.'
                : (pendingAction === 'REJECT' ? '✖ Record rejected.' : '↩ Record returned to vendor.'));
            onDone();
            onClose();
        } catch (err) {
            alert(`Action failed: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ──
    // ── Render ──
    const isAlreadyVerified = row.status === 'VERIFIED' || row.status === 'Verified';
    const accentColors = {
        'VERIFY': '#059669',     // Green
        'REQUEST_BACK': '#d97706', // Orange/Amber
        'REJECT': '#dc2626',     // Red
    };
    const accentColor = accentColors[pendingAction] || '#0369a1';

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(15,23,42,0.55)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 1200,
                }}
            />

            {/* ── Modal Box ── */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1201,
                    background: '#fff',
                    borderRadius: '16px',
                    width: '95%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* ── Modal Header ── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 1,
                    borderRadius: '16px 16px 0 0',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{
                                background: '#f5f3ff', color: '#7c3aed',
                                fontSize: '10px', fontWeight: '800',
                                padding: '2px 8px', borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                {moduleLabel}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>#{row.requestId}</span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                            Verification Details
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none', background: '#f8fafc',
                            borderRadius: '8px', padding: '6px 10px',
                            cursor: 'pointer', fontSize: '12px', color: '#64748b',
                            fontWeight: '600',
                        }}
                    >✕ Close</button>
                </div>

                {/* ── Modal Body ── */}
                <div style={{ padding: '20px 28px 28px', flex: 1 }}>

                    {/* Loading */}
                    {detailLoading && (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
                            Loading record details…
                        </div>
                    )}

                    {/* Error */}
                    {detailError && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '12px', padding: '16px',
                            color: '#dc2626', fontSize: '13px', marginBottom: '16px'
                        }}>
                            ⚠️ {detailError}
                        </div>
                    )}

                    {!detailLoading && !detailError && detail && (
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '16px',
                        }}>

                            


                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1px',
                                background: '#e2e8f0',
                            }}>
                                {Object.entries(detail).map(([key, val]) => {
                                    const auditKeys = [
                                        'updatedBy', 'modifiedBy', 'lastModifiedBy', 'createdBy',
                                        'updatedDate', 'updatedAt', 'modifiedDate', 'modifiedAt', 'lastModifiedDate',
                                        'status', 'recordStatus', 'id', 'requestId', 'workflowTransitionId'
                                    ];
                                    if (auditKeys.includes(key)) return null;

                                    const forbiddenWords = ['id']; // Allow coil number words
                                    if (forbiddenWords.some(word => key.toLowerCase() === word)) return null;

                                    // --- 🗃️ Handle Arrays (Like Coil Details) ---
                                    if (Array.isArray(val)) {
                                        if (val.length === 0) return null;
                                        return (
                                            <div key={key} style={{ gridColumn: 'span 2', background: '#fff', borderTop: '1px solid #f1f5f9', padding: '10px 16px' }}>
                                                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                                                    {formatKey(key)} ({val.length})
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                    {val.map((item, idx) => {
                                                        const isModule11Chamber = row.moduleId === 11 && key === 'chambers';
                                                        
                                                        return (
                                                            <div key={idx} style={{ 
                                                                padding: '10px 16px', 
                                                                background: '#f8fafc', 
                                                                borderRadius: '8px', 
                                                                border: '1px solid #e2e8f0',
                                                                display: isModule11Chamber ? 'flex' : 'grid',
                                                                flexDirection: isModule11Chamber ? 'column' : 'initial',
                                                                gridTemplateColumns: isModule11Chamber ? 'none' : 'repeat(auto-fit, minmax(120px, 1fr))',
                                                                gap: '12px'
                                                            }}>
                                                                {isModule11Chamber ? (
                                                                    <>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                                                                                Chamber {item.chamberNo}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                            {(() => {
                                                                                const benches = [];
                                                                                if (Array.isArray(item.benchGroups)) {
                                                                                    item.benchGroups.forEach(g => {
                                                                                        if (g.benchNo) benches.push(String(g.benchNo));
                                                                                    });
                                                                                }
                                                                                if (benches.length === 0) return <span style={{ fontSize: '11px', color: '#94a3b8' }}>No benches</span>;
                                                                                return benches.map((b, i) => (
                                                                                    <span key={i} style={{
                                                                                        background: '#eff6ff', color: '#1d4ed8',
                                                                                        padding: '2px 8px', borderRadius: '6px',
                                                                                        fontSize: '11px', fontWeight: '700',
                                                                                        border: '1px solid #dbeafe'
                                                                                    }}>
                                                                                        Bench {b}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </div>
                                                                    </>
                                                                ) : typeof item === 'object' ? (
                                                                    Object.entries(item).map(([sk, sv]) => {
                                                                        if (['id', 'updatedby', 'updateddate'].some(w => sk.toLowerCase().includes(w))) return null;
                                                                        
                                                                        const formattedVal = formatValue(sv);
                                                                        if (formattedVal === '—') return null; // Hide empty/null fields like Coil No in Range mode

                                                                        return (
                                                                            <div key={sk}>
                                                                                <div style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>{formatKey(sk)}</div>
                                                                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{formattedVal}</div>
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{formatValue(item)}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (val !== null && typeof val === 'object') return null;
                                    if (val === null || val === undefined || val === '') return null;

                                    return (
                                        <div key={key} style={{
                                            background: '#fff',
                                            padding: '10px 16px',
                                        }}>
                                            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '1px' }}>
                                                {formatKey(key)}
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                                                {formatValue(val)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}



                    {/* ── Action Area ── */}
                    {isAlreadyVerified ? (
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '12px', padding: '16px',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            color: '#059669', fontWeight: '700', fontSize: '14px',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            This record has already been verified.
                        </div>
                    ) : !pendingAction ? (
                        /* Choose action */
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setPendingAction('VERIFY')}
                                style={{
                                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                                    background: accentColors.VERIFY, color: '#fff',
                                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Verify
                            </button>
                            <button
                                onClick={() => setPendingAction('REQUEST_BACK')}
                                style={{
                                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                                    background: accentColors.REQUEST_BACK, color: '#fff',
                                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.36" />
                                </svg>
                                Return
                            </button>
                            <button
                                onClick={() => setPendingAction('REJECT')}
                                style={{
                                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                                    background: accentColors.REJECT, color: '#fff',
                                    fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Reject
                            </button>
                        </div>
                    ) : (
                        /* Confirm pane */
                        <div style={{
                            border: `2px solid ${accentColor}`,
                            borderRadius: '14px', padding: '18px',
                        }}>
                            <p style={{
                                margin: '0 0 12px', fontWeight: '700',
                                fontSize: '14px', color: accentColor,
                            }}>
                                {pendingAction === 'VERIFY' ? '✓ Confirm Verification' : (pendingAction === 'REJECT' ? '✖ Confirm Rejection' : '↩ Confirm Return')}
                            </p>
                            <textarea
                                rows={3}
                                placeholder={pendingAction === 'VERIFY'
                                    ? 'Remarks (optional)…'
                                    : (pendingAction === 'REJECT' ? 'Enter reason for rejection (required)…' : 'Enter reason for returning (required)…')}
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    border: '1px solid #e2e8f0', borderRadius: '10px',
                                    padding: '10px 14px', fontSize: '13px',
                                    resize: 'vertical', marginBottom: '14px',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleConfirm}
                                    disabled={submitting}
                                    style={{
                                        flex: 1, padding: '12px', border: 'none',
                                        borderRadius: '10px', background: accentColor,
                                        color: '#fff', fontWeight: '700', fontSize: '14px',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.65 : 1,
                                        transition: 'opacity 0.15s',
                                    }}
                                >
                                    {submitting ? 'Submitting…' : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => { setPendingAction(null); setRemarks(''); }}
                                    style={{
                                        flex: 1, padding: '12px',
                                        border: '1px solid #e2e8f0', borderRadius: '10px',
                                        background: '#f8fafc', color: '#475569',
                                        fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                    }}
                                >
                                    ← Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default VerificationDetailModal;

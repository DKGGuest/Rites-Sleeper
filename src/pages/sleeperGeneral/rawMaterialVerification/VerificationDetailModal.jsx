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
    sleeperCount:        'Sleeper Count',
    benchNo:             'Bench No.',
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
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val);
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
                    borderRadius: '20px',
                    width: '90%',
                    maxWidth: '700px',
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* ── Modal Header ── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '22px 28px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 1,
                    borderRadius: '20px 20px 0 0',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <span style={{
                                background: '#ede9fe', color: '#6d28d9',
                                fontSize: '10px', fontWeight: '700',
                                padding: '3px 9px', borderRadius: '20px',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                {moduleLabel}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Module {row.moduleId}
                            </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                            Record Detail — Request #{row.requestId}
                        </h3>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                            Workflow Transition ID: <span style={{ fontFamily: 'monospace' }}>{row.workflowTransitionId}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none', background: '#f1f5f9',
                            borderRadius: '10px', padding: '8px 14px',
                            cursor: 'pointer', fontSize: '13px', color: '#475569',
                            fontWeight: '600', flexShrink: 0,
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

                    {/* Detail Grid */}
                    {!detailLoading && !detailError && detail && (
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            padding: '20px',
                            marginBottom: '20px',
                        }}>
                            <p style={{
                                margin: '0 0 14px', fontSize: '11px',
                                color: '#64748b', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '0.6px'
                            }}>
                                📋 Record Information
                            </p>

                            {/* Prominent Audit Info Bar */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '16px',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Updated By</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                                        {formatValue(detail.updatedBy || detail.modifiedBy || detail.lastModifiedBy || detail.createdBy)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Updated Date</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                                        {formatValue(detail.updatedDate || detail.updatedAt || detail.modifiedDate || detail.modifiedAt || detail.lastModifiedDate)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Status</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                                        {formatValue(detail.status || detail.recordStatus || '-')}
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                margin: '20px 0 12px', fontSize: '10px',
                                color: '#94a3b8', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '0.6px'
                            }}>
                                Details
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '14px',
                            }}>
                                {Object.entries(detail).map(([key, val]) => {
                                    // Skip audit fields already shown prominently
                                    const auditKeys = [
                                        'updatedBy', 'modifiedBy', 'lastModifiedBy', 'createdBy',
                                        'updatedDate', 'updatedAt', 'modifiedDate', 'modifiedAt', 'lastModifiedDate',
                                        'status', 'recordStatus', 'id'
                                    ];
                                    if (auditKeys.includes(key)) return null;

                                    // 🚫 EXCLUDE ANY COIL NO DETAILS (Per User Request)
                                    const forbiddenWords = ['coilno', 'coilnumber', 'id'];
                                    if (forbiddenWords.some(word => key.toLowerCase().includes(word))) return null;

                                    // --- 🗃️ Handle Arrays (Like Coil Details) ---
                                    if (Array.isArray(val)) {
                                        if (val.length === 0) return null;
                                        return (
                                            <div key={key} style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                                <p style={{
                                                    margin: '0 0 10px', fontSize: '10px',
                                                    color: '#94a3b8', fontWeight: '700',
                                                    textTransform: 'uppercase', letterSpacing: '0.6px'
                                                }}>
                                                    📋 {formatKey(key)}
                                                </p>
                                                <div style={{
                                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                    gap: '10px'
                                                }}>
                                                    {val.map((item, idx) => (
                                                        <div key={idx} style={{
                                                            background: '#fff', border: '1px solid #e2e8f0',
                                                            borderRadius: '10px', padding: '12px',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                                        }}>
                                                            {typeof item === 'object' ? (
                                                                Object.entries(item).map(([subK, subV]) => {
                                                                    if (forbiddenWords.some(word => subK.toLowerCase().includes(word))) return null;
                                                                    return (
                                                                        <div key={subK} style={{ marginBottom: '6px' }}>
                                                                            <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
                                                                                {formatKey(subK)}
                                                                            </div>
                                                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
                                                                                {formatValue(subV)}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
                                                                    {formatValue(item)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Skip nested objects (non-arrays)
                                    if (val !== null && typeof val === 'object') return null;

                                    return (
                                        <div key={key} style={{
                                            background: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            padding: '10px 14px',
                                        }}>
                                            <div style={{
                                                fontSize: '10px', color: '#94a3b8',
                                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                                marginBottom: '4px', fontWeight: '600',
                                            }}>
                                                {formatKey(key)}
                                            </div>
                                            <div style={{
                                                fontSize: '13px', fontWeight: '700',
                                                color: '#1e293b', wordBreak: 'break-word',
                                            }}>
                                                {formatValue(val)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Transition meta */}
                    <div style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '14px', padding: '14px 18px',
                        marginBottom: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap',
                    }}>
                        <div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned To</div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>User {row.assignedTo}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</div>
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
                        </div>
                    </div>

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
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setPendingAction('VERIFY')}
                                style={{
                                    flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                                    background: accentColors.VERIFY, color: '#fff',
                                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#047857'}
                                onMouseLeave={e => e.currentTarget.style.background = accentColors.VERIFY}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Verify
                            </button>
                            <button
                                onClick={() => setPendingAction('REQUEST_BACK')}
                                style={{
                                    flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                                    background: accentColors.REQUEST_BACK, color: '#fff',
                                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#b45309'}
                                onMouseLeave={e => e.currentTarget.style.background = accentColors.REQUEST_BACK}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.36" />
                                </svg>
                                Return
                            </button>
                            <button
                                onClick={() => setPendingAction('REJECT')}
                                style={{
                                    flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                                    background: accentColors.REJECT, color: '#fff',
                                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                                onMouseLeave={e => e.currentTarget.style.background = accentColors.REJECT}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

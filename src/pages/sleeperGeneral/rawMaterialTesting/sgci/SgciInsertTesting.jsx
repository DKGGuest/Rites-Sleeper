import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import { MOCK_SGCI_HISTORY, MOCK_INVENTORY, MOCK_VERIFIED_CONSIGNMENTS } from '../../../../utils/rawMaterialMockData';
import { useShift } from '../../../../context/ShiftContext';
import { useToast } from '../../../../context/ToastContext';
import { saveSgciInsertAudit, getSgciInsertAuditByRequestId } from '../../../../services/workflowService';
import TrendChart from '../../../../components/common/TrendChart';
import '../cement/CementForms.css';

const SubCard = ({ id, title, color, count, label, isActive, onClick }) => (
    <div
        className={`asset-card ${isActive ? 'active' : ''}`}
        onClick={onClick}
        style={{
            borderColor: isActive ? color : '#e2e8f0',
            borderTop: `4px solid ${color}`,
            '--active-color-alpha': `${color}15`,
            cursor: 'pointer',
            flex: '1',
            minWidth: '200px'
        }}
    >
        <div className="asset-card-header">
            <div>
                <h4 className="asset-card-title" style={{ color: '#64748b', fontSize: '10px' }}>{title}</h4>
                <div className="asset-card-count" style={{ fontSize: count === 'N/A' ? '1.1rem' : '1.5rem', margin: '4px 0', fontWeight: count === 'N/A' ? '400' : '700' }}>{count}</div>
            </div>
        </div>
        <div className="asset-card-label" style={{ color: color, fontSize: '9px', fontWeight: '700' }}>{label}</div>
    </div>
);

const SgciInsertTesting = ({ onBack, inventoryData = [] }) => {
    const [viewMode, setViewMode] = useState('new-stocks'); // Default to new stocks
    const [showForm, setShowForm] = useState(false);
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const toast = useToast();
    const [history, setHistory] = useState(MOCK_SGCI_HISTORY.map(h => ({
        ...h,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));
    const [availableLots] = useState(MOCK_INVENTORY.SGCI || []);
    const pendingStocks = inventoryData;
    const [statusMap, setStatusMap] = useState({});
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [isPeriodic, setIsPeriodic] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!pendingStocks?.length) return;
            const newStatusMap = { ...statusMap };
            const fetchedHistory = [];
            let updated = false;
            try {
                for (const stock of pendingStocks) {
                    if (stock.requestId) {
                        const record = await getSgciInsertAuditByRequestId(stock.requestId);
                        if (record && record.id) {
                            newStatusMap[stock.requestId] = "Completed";
                            fetchedHistory.push({
                                ...record,
                                id: record.id,
                                testDate: record.testDate ? record.testDate.substring(0, 10) : new Date().toISOString().split('T')[0],
                                consignmentNo: record.consignmentNo || stock.consignmentNo,
                                supplier: record.supplier || stock.vendor,
                                checked: record.checked,
                                accepted: record.accepted,
                                createdAt: record.createdAt || new Date().toISOString()
                            });
                        } else {
                            newStatusMap[stock.requestId] = "Pending";
                        }
                        updated = true;
                    }
                }
                if (updated) {
                    setStatusMap(newStatusMap);
                    if (fetchedHistory.length > 0) {
                        setHistory(prev => {
                            const existingIds = new Set(prev.map(p => p.id));
                            const newRecords = fetchedHistory.filter(f => !existingIds.has(f.id));
                            return [...newRecords, ...prev];
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching SGCI status", error);
            }
        };
        fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingStocks, refreshTrigger]);

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            consignmentNo: '',
            supplier: '',
            approvalValidity: '',
            ritesIc: '',
            ritesBook: '',
            type: '',
            inventoryId: '',
            readings: [{ heatNo: '', patternNo: '', weight: '', dimensionalNotOk: false, hammerNotOk: false, rejectionReason: '', result: 'PASS' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "readings"
    });

    useEffect(() => {
        if (activeRequestId) {
            getSgciInsertAuditByRequestId(activeRequestId).then(record => {
                if (record && record.id) {
                    setEditId(record.id);
                    reset({
                        ...record,
                        date: record.testDate ? record.testDate.substring(0, 10) : new Date().toISOString().split('T')[0]
                    });
                }
            });
        }
    }, [activeRequestId, reset]);

    const readings = watch('readings');
    const selectedType = watch('type');

    const handleAppend = () => {
        const lastRow = readings.length > 0 ? readings[readings.length - 1] : null;
        append({
            heatNo: lastRow ? lastRow.heatNo : '',
            patternNo: lastRow ? lastRow.patternNo : '',
            weight: '',
            dimensionalNotOk: false,
            hammerNotOk: false,
            rejectionReason: '',
            result: 'PASS'
        });
    };

    // Compute result inline (real-time) from current field values — no useEffect needed
    const computeResult = (reading, type) => {
        const w = parseFloat(reading.weight);
        if (isNaN(w) || reading.weight === '' || reading.weight === undefined) return null; // blank = no result yet
        
        // Negative weight should not be allowed
        if (w < 0) return 'FAIL';

        const typeKey = (type || '');
        if (!typeKey) return null; // Logic needs type select first

        let isWeightOk = false;
        
        if (typeKey === 'T-6901') {
            isWeightOk = w >= 1.484;
        } else if (typeKey === 'T-3815' || typeKey === 'T-381') {
            isWeightOk = w >= 1.55;
        } else if (typeKey === 'T-3705') {
            isWeightOk = w >= 1.95;
        } else {
            isWeightOk = w > 0; // fallback
        }
        
        return (isWeightOk && !reading.dimensionalNotOk && !reading.hammerNotOk && w >= 0) ? 'PASS' : 'FAIL';
    };

    const summary = useMemo(() => {
        const results = readings.map(r => computeResult(r, selectedType));
        const withResult = results.filter(r => r !== null);
        const total = withResult.length;
        const passed = withResult.filter(r => r === 'PASS').length;
        const rejected = total - passed;
        const rejectionPct = total > 0 ? ((rejected / total) * 100).toFixed(2) : 0;
        return { total, passed, rejected, rejectionPct };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readings, selectedType]);

    const canModify = (createdAt) => {
        if (!createdAt) return false;
        const entryTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        return (now - entryTime) < (60 * 60 * 1000); // 1 hour
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                testDate: data.date,
                consignmentNo: data.consignmentNo,
                supplier: data.supplier,
                type: data.type,
                ritesIc: data.ritesIc,
                checked: summary.total,
                accepted: summary.passed,
                rejected: summary.rejected,
                rejectionPct: summary.rejectionPct,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate || new Date().toISOString().split('T')[0],
                requestId: activeRequestId || null,
                createdBy: parseInt(localStorage.getItem('userId') || '1', 10), // Default 
                readings: data.readings
            };

            const hasNegativeWeight = data.readings?.some(r => parseFloat(r.weight) < 0);
            if (hasNegativeWeight) {
                toast.error("Negative weights are not allowed!");
                return;
            }

            await saveSgciInsertAudit(payload, editId);
            toast.success(`SGCI Insert Audit record ${editId ? 'updated' : 'saved'}!`);
            // Re-fetch historical logs in real app
        } catch (error) {
            console.error("Error saving SGCI audit:", error);
            toast.error("Failed to save SGCI Insert Audit report.");
        } finally {
            setShowForm(false);
            reset();
            setActiveRequestId(null);
            setEditId(null);
            setIsPeriodic(false);
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this record?')) {
            setHistory(prev => prev.filter(h => h.id !== id));
        }
    };

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Agency' },
        { 
            key: 'consignmentNo', 
            label: 'Consignment No.', 
            isHeaderHighlight: true,
            render: (_, row) => row.consignmentNo || row.details?.invoiceNumber || 'N/A'
        },
        { 
            key: 'type', 
            label: 'Insert Type',
            render: (_, row) => row.details?.gradeType || 'N/A'
        },
        { 
            key: 'qty', 
            label: 'Quantity',
            render: (_, row) => row.details?.totalQtyReceived || 'N/A'
        },
        { 
            key: 'ritesIc', 
            label: 'RITES IC',
            render: (_, row) => row.details?.ritesIcNumber || 'N/A'
        },
        {
            key: 'testingStatus',
            label: 'Status',
            render: (_, row) => {
                const status = statusMap[row.requestId] || 'Pending';
                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: status === 'Completed' ? '#dcfce7' : '#fef3c7',
                        color: status === 'Completed' ? '#166534' : '#92400e'
                    }}>
                        {status}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const isCompleted = statusMap[row.requestId] === 'Completed';
                return (
                    <button
                        className="btn-action mini"
                        onClick={() => {
                            reset({
                                date: new Date().toISOString().split('T')[0],
                                consignmentNo: row.consignmentNo,
                                supplier: row.vendor,
                                ritesIc: row.details?.ritesIcNumber || 'N/A',
                                type: row.details?.gradeType || 'N/A',
                                inventoryId: row.requestId,
                                readings: [{ heatNo: '', patternNo: '', weight: '', dimensionalNotOk: false, hammerNotOk: false, rejectionReason: '', result: 'PASS' }]
                            });
                            setActiveRequestId(row.requestId);
                            setEditId(null);
                            setIsPeriodic(false);
                            setShowForm(true);
                        }}
                    >
                        {isCompleted ? 'Modify test details' : 'Add Test Detail'}
                    </button>
                );
            }
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date', render: (val) => val ? val.split('-').reverse().join('/') : '' },
        { key: 'consignmentNo', label: 'Consignment' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'checked', label: 'Tested' },
        { key: 'accepted', label: 'Pass' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const editable = canModify(row.createdAt);
                return (
                    <div className="btn-group-center" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                            className={`btn-action mini ${!editable ? 'disabled-btn' : ''}`}
                            disabled={!editable}
                            onClick={() => {
                                reset({
                                    date: row.testDate,
                                    consignmentNo: row.consignmentNo,
                                    supplier: row.supplier,
                                    readings: []
                                });
                                setShowForm(true);
                            }}
                            title={!editable ? "Expired" : ""}
                        >
                            Modify
                        </button>
                        <button
                            className={`btn-action mini danger ${!editable ? 'disabled-btn' : ''}`}
                            disabled={!editable}
                            onClick={() => handleDelete(row.id)}
                        >
                            Delete
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="sgci-testing-root cement-forms-scope fade-in">
            <div className="content-title-row" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>SGCI Insert Audit Report</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="toggle-btn mini" onClick={() => { 
                        reset(); 
                        setActiveRequestId(null);
                        setEditId(null);
                        setIsPeriodic(true);
                        setShowForm(true); 
                    }}>+ Add New (Periodic)</button>
                    <button className="toggle-btn secondary mini" onClick={onBack}>Back to Dashboard</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <SubCard id="stats" title="Analytics" color="#42818c" count="N/A" label="Statistics" isActive={viewMode === 'stats'} onClick={() => setViewMode('stats')} />
                <SubCard
                    id="new-stocks"
                    title="Inventory"
                    color="#f59e0b"
                    count={pendingStocks.filter(s => statusMap[s.requestId] !== 'Completed').length}
                    label="Pending for Test"
                    isActive={viewMode === 'new-stocks'}
                    onClick={() => setViewMode('new-stocks')}
                />
                <SubCard id="history" title="Historical" color="#10b981" count={history.length} label="Test Logs" isActive={viewMode === 'history'} onClick={() => setViewMode('history')} />
            </div>

            <div className="view-layer">
                {viewMode === 'stats' && (
                    <div className="table-outer-wrapper fade-in" style={{ padding: '24px' }}>
                        <TrendChart
                            data={history}
                            xKey="testDate"
                            lines={[
                                { key: 'accepted', color: '#10b981', label: 'Accepted Qty' },
                                { key: 'checked', color: '#3b82f6', label: 'Tested Qty' }
                            ]}
                            title="SGCI Testing Performance"
                            description="Historical audit volumes and pass counts"
                            yAxisLabel=""
                        />
                    </div>
                )}

                {viewMode === 'new-stocks' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>SGCI Inventory Pending Testing</h4>
                        </div>
                        <EnhancedDataTable columns={inventoryColumns.filter(c => c.key !== 'testingStatus')} data={pendingStocks.filter(s => statusMap[s.requestId] !== 'Completed')} />
                    </div>
                )}

                {viewMode === 'history' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>Weekly Audit Logs</h4>
                            <button className="toggle-btn mini" onClick={() => { 
                                reset(); 
                                setActiveRequestId(null);
                                setEditId(null);
                                setIsPeriodic(true);
                                setShowForm(true); 
                            }}>+ Add New (Periodic)</button>
                        </div>
                        <EnhancedDataTable columns={historyColumns} data={history} />
                    </div>
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80%', width: '80%' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">SGCI Insert Audit Detail</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-grid">
                                    <div className="input-group"><label>Date</label><input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f1f5f9' }} /></div>
                                    <div className="input-group">
                                        <label>Consignment</label>
                                        {activeRequestId ? (
                                            <input
                                                type="text"
                                                readOnly
                                                className="readOnly"
                                                style={{ background: '#f8fafc' }}
                                                {...register("consignmentNo")}
                                            />
                                        ) : isPeriodic ? (
                                            <input
                                                type="text"
                                                placeholder="Enter Consignment No"
                                                {...register("consignmentNo", { required: "Required" })}
                                            />
                                        ) : (
                                            <select {...register('consignmentNo', { required: 'Required' })}>
                                                <option value="">-- Select --</option>
                                                {inventoryData.map((c, i) => (
                                                    <option key={i} value={c.consignmentNo}>{c.consignmentNo} ({c.vendor})</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div className="input-group">
                                        <label>Insert Type (Drawing No)</label>
                                         <select {...register('type', { required: "Select insert type first" })}>
                                            <option value="">-- Select --</option>
                                            <option value="T-6901">T-6901</option>
                                            <option value="T-3815">T-3815</option>
                                            <option value="T-3705">T-3705</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Supplier</label>
                                        <input type="text" placeholder="Enter Supplier" {...register('supplier')} />
                                    </div>
                                    <div className="input-group">
                                        <label>Validity</label>
                                        <input type="text" placeholder="Enter Validity" {...register('approvalValidity')} />
                                    </div>
                                </div>

                                {!selectedType && (
                                     <div style={{ 
                                         padding: '8px 12px', 
                                         background: '#fff7ed', 
                                         border: '1px solid #ffedd5', 
                                         borderRadius: '8px',
                                         color: '#9a3412',
                                         fontSize: '11px',
                                         fontWeight: '600',
                                         marginTop: '12px',
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '8px'
                                     }}>
                                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                         Please select **Insert Type (Drawing No)** to enable reading entries.
                                     </div>
                                 )}

                                <div className="section-divider"></div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '14px' }}>Readings</h3>
                                    <button 
                                        type="button" 
                                        className={`btn-save ${!selectedType ? 'disabled-btn' : ''}`} 
                                        style={{ width: 'auto', padding: '0 12px' }} 
                                        onClick={() => {
                                            if (!selectedType) {
                                                alert("Please select Insert Type first");
                                                return;
                                            }
                                            handleAppend();
                                        }}
                                    >+ Add Row</button>
                                </div>

                                <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Heat No.</th>
                                                <th>Pattern</th>
                                                <th>
                                                    Weight (kg)
                                                     {selectedType && (
                                                        <span style={{ display: 'block', fontSize: '9px', color: '#94a3b8', fontWeight: '400', marginTop: '2px' }}>
                                                            Min Weight: {selectedType === 'T-6901' ? '1.484' : (selectedType === 'T-3815' || selectedType === 'T-381') ? '1.55' : selectedType === 'T-3705' ? '1.95' : '—'} kg
                                                        </span>
                                                     )}
                                                </th>
                                                <th>Dim Not OK</th>
                                                <th>Reason of Rejection</th>
                                                <th>Hammer Not OK</th>
                                                <th>Result</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fields.map((field, index) => {
                                                const rowResult = computeResult(readings[index], selectedType);
                                                return (
                                                    <tr key={field.id}>
                                                        <td><input type="text" disabled={!selectedType} {...register(`readings.${index}.heatNo`)} /></td>
                                                        <td><input type="text" disabled={!selectedType} {...register(`readings.${index}.patternNo`)} /></td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step="0.0001"
                                                                disabled={!selectedType}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === '-' || e.key === 'e') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                style={{
                                                                    borderColor: readings[index]?.weight && rowResult === 'FAIL' ? '#ef4444' : readings[index]?.weight && rowResult === 'PASS' ? '#10b981' : undefined,
                                                                    borderWidth: readings[index]?.weight ? '2px' : undefined
                                                                }}
                                                                {...register(`readings.${index}.weight`, { 
                                                                    required: false,
                                                                    min: { value: 0, message: "Cannot be negative" }
                                                                })}
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}><input type="checkbox" disabled={!selectedType} {...register(`readings.${index}.dimensionalNotOk`)} /></td>
                                                        <td>
                                                            {readings[index]?.dimensionalNotOk && (
                                                                <select 
                                                                    disabled={!selectedType}
                                                                    style={{ fontSize: '11px', padding: '4px' }}
                                                                    {...register(`readings.${index}.rejectionReason`, { required: readings[index]?.dimensionalNotOk })}
                                                                >
                                                                    <option value="">-- Reason --</option>
                                                                    <option value="Jig">Jig</option>
                                                                    <option value="Length of Head">Length of Head</option>
                                                                    <option value="Thickness of stem">Thickness of stem</option>
                                                                    <option value="Hole Dia">Hole Dia</option>
                                                                    <option value="Width of Head">Width of Head</option>
                                                                    <option value="Top Radius">Top Radius</option>
                                                                    <option value="Gating Position">Gating Position</option>
                                                                    <option value="Square gauge">Square gauge</option>
                                                                </select>
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}><input type="checkbox" disabled={!selectedType} {...register(`readings.${index}.hammerNotOk`)} /></td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {rowResult === null ? (
                                                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>
                                                            ) : (
                                                                <span style={{
                                                                    padding: '3px 10px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    background: rowResult === 'PASS' ? '#dcfce7' : '#fee2e2',
                                                                    color: rowResult === 'PASS' ? '#166534' : '#991b1b'
                                                                }}>
                                                                    {rowResult}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td><button type="button" onClick={() => remove(index)} style={{ color: 'red', border: 'none', background: 'none' }}>✕</button></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="summary-box" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', gap: '20px', marginTop: '16px' }}>
                                    <div><label style={{ fontSize: '10px' }}>TOTAL</label><div style={{ fontSize: '18px', fontWeight: 600 }}>{summary.total}</div></div>
                                    <div><label style={{ fontSize: '10px' }}>PASS</label><div style={{ fontSize: '18px', fontWeight: 600, color: 'green' }}>{summary.passed}</div></div>
                                    <div><label style={{ fontSize: '10px' }}>FAIL</label><div style={{ fontSize: '18px', fontWeight: 600, color: 'red' }}>{summary.rejected}</div></div>
                                </div>

                                <div className="form-modal-footer" style={{ borderTop: 'none', padding: '24px 0 0' }}>
                                    <button type="submit" className="btn-save">{editId ? 'Update Audit' : 'Save Audit'}</button>
                                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default SgciInsertTesting;

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import { MOCK_SGCI_HISTORY, MOCK_INVENTORY, MOCK_VERIFIED_CONSIGNMENTS } from '../../../../utils/rawMaterialMockData';
import { useShift } from '../../../../context/ShiftContext';
import { useToast } from '../../../../context/ToastContext';
import { saveSgciInsertAudit } from '../../../../services/workflowService';
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
    const { showToast } = useToast();
    const [history, setHistory] = useState(MOCK_SGCI_HISTORY.map(h => ({
        ...h,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));
    const [availableLots] = useState(MOCK_INVENTORY.SGCI || []);
    const pendingStocks = inventoryData;

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            consignmentNo: '',
            lotNo: '',
            supplier: '',
            approvalValidity: '',
            ritesIc: '',
            ritesBook: '',
            type: '',
            inventoryId: '',
            readings: [{ heatNo: '', patternNo: '', weight: '', dimensionalNotOk: false, hammerNotOk: false, result: 'PASS' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "readings"
    });

    const selectedLotNo = watch('lotNo');
    const readings = watch('readings');

    useEffect(() => {
        const lot = availableLots.find(l => l.lotNo === selectedLotNo);
        if (lot) {
            setValue('supplier', lot.supplier);
            setValue('approvalValidity', lot.approvalValidity);
            setValue('ritesIc', lot.ritesIc);
            setValue('ritesBook', lot.ritesBook);
            setValue('type', lot.type);
            setValue('inventoryId', lot.id);
        }
    }, [selectedLotNo, availableLots, setValue]);

    useEffect(() => {
        readings.forEach((r, idx) => {
            const w = parseFloat(r.weight);
            const isWeightOk = w >= 1.4395 && w <= 1.5285;
            const res = (isWeightOk && !r.dimensionalNotOk && !r.hammerNotOk) ? 'PASS' : 'FAIL';
            if (r.result !== res) setValue(`readings.${idx}.result`, res);
        });
    }, [readings, setValue]);

    const summary = useMemo(() => {
        const total = readings.length;
        const passed = readings.filter(r => r.result === 'PASS').length;
        const rejected = total - passed;
        const rejectionPct = total > 0 ? ((rejected / total) * 100).toFixed(2) : 0;
        return { total, passed, rejected, rejectionPct };
    }, [readings]);

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
                lotNo: data.lotNo,
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
                createdBy: 1, // Default
                readings: data.readings
            };

            await saveSgciInsertAudit(payload);
            showToast("SGCI Insert Audit record saved!", "success");

            setShowForm(false);
            reset();
            // Re-fetch historical logs in real app
        } catch (error) {
            console.error("Error saving SGCI audit:", error);
            showToast("Failed to save SGCI Insert Audit report.", "error");
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
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-action mini"
                    onClick={() => {
                        reset({
                            date: new Date().toISOString().split('T')[0],
                            consignmentNo: row.consignmentNo,
                            lotNo: row.details?.invoiceNumber || row.consignmentNo,
                            supplier: row.vendor,
                            ritesIc: row.details?.ritesIcNumber || 'N/A',
                            type: row.details?.gradeType || 'N/A',
                            inventoryId: row.requestId,
                            readings: [{ heatNo: '', patternNo: '', weight: '', dimensionalNotOk: false, hammerNotOk: false, result: 'PASS' }]
                        });
                        setShowForm(true);
                    }}
                >
                    Add Test Detail
                </button>
            )
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date', render: (val) => val ? val.split('-').reverse().join('/') : '' },
        { key: 'lotNo', label: 'Lot No.' },
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
                                    lotNo: row.lotNo,
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
                    <button className="toggle-btn mini" onClick={() => { reset(); setShowForm(true); }}>+ Add New (Periodic)</button>
                    <button className="toggle-btn secondary mini" onClick={onBack}>Back to Dashboard</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <SubCard id="stats" title="Analytics" color="#42818c" count="N/A" label="Statistics" isActive={viewMode === 'stats'} onClick={() => setViewMode('stats')} />
                <SubCard
                    id="new-stocks"
                    title="Inventory"
                    color="#f59e0b"
                    count={pendingStocks.length}
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
                        <EnhancedDataTable columns={inventoryColumns} data={pendingStocks} />
                    </div>
                )}

                {viewMode === 'history' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>Weekly Audit Logs</h4>
                            <button className="toggle-btn mini" onClick={() => { reset(); setShowForm(true); }}>+ Add New (Periodic)</button>
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
                                        <select {...register('consignmentNo')}>
                                            <option value="">-- Select --</option>
                                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="PERIODIC">-- Periodic Testing --</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Lot No.</label>
                                        <select {...register('lotNo')}>
                                            <option value="">-- Select --</option>
                                            {availableLots.map(l => <option key={l.id} value={l.lotNo}>{l.lotNo}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group"><label>Supplier</label><input type="text" readOnly className="readOnly" {...register('supplier')} /></div>
                                    <div className="input-group"><label>Validity</label><input type="text" readOnly className="readOnly" {...register('approvalValidity')} /></div>
                                </div>

                                <div className="section-divider"></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '14px' }}>Readings</h3>
                                    <button type="button" className="btn-save" style={{ width: 'auto', padding: '0 12px' }} onClick={() => append({ heatNo: '', patternNo: '', weight: '', dimensionalNotOk: false, hammerNotOk: false, result: 'PASS' })}>+ Add Row</button>
                                </div>

                                <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table>
                                        <thead><tr><th>Heat No.</th><th>Pattern</th><th>Weight</th><th>Dim</th><th>Hammer</th><th>Result</th><th></th></tr></thead>
                                        <tbody>
                                            {fields.map((field, index) => (
                                                <tr key={field.id}>
                                                    <td><input type="text" {...register(`readings.${index}.heatNo`)} /></td>
                                                    <td><input type="text" {...register(`readings.${index}.patternNo`)} /></td>
                                                    <td><input type="number" step="0.0001" {...register(`readings.${index}.weight`)} /></td>
                                                    <td style={{ textAlign: 'center' }}><input type="checkbox" {...register(`readings.${index}.dimensionalNotOk`)} /></td>
                                                    <td style={{ textAlign: 'center' }}><input type="checkbox" {...register(`readings.${index}.hammerNotOk`)} /></td>
                                                    <td style={{ textAlign: 'center' }}>{readings[index]?.result}</td>
                                                    <td><button type="button" onClick={() => remove(index)} style={{ color: 'red', border: 'none', background: 'none' }}>✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="summary-box" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', gap: '20px', marginTop: '16px' }}>
                                    <div><label style={{ fontSize: '10px' }}>TOTAL</label><div style={{ fontSize: '18px', fontWeight: 600 }}>{summary.total}</div></div>
                                    <div><label style={{ fontSize: '10px' }}>PASS</label><div style={{ fontSize: '18px', fontWeight: 600, color: 'green' }}>{summary.passed}</div></div>
                                    <div><label style={{ fontSize: '10px' }}>FAIL</label><div style={{ fontSize: '18px', fontWeight: 600, color: 'red' }}>{summary.rejected}</div></div>
                                </div>

                                <div className="form-modal-footer" style={{ borderTop: 'none', padding: '24px 0 0' }}>
                                    <button type="submit" className="btn-save">Save Audit</button>
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

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/EnhancedDataTable';
import { MOCK_SGCI_HISTORY, MOCK_INVENTORY, MOCK_VERIFIED_CONSIGNMENTS } from '../../../../utils/rawMaterialMockData';

import '../cement/CementForms.css';

const SgciInsertTesting = () => {
    const [showForm, setShowForm] = useState(false);
    const [history, setHistory] = useState(MOCK_SGCI_HISTORY);
    const [availableLots] = useState(MOCK_INVENTORY.SGCI || []);

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

    // Auto-fill header fields based on Lot No.
    useEffect(() => {
        const lot = availableLots.find(l => l.lotNo === selectedLotNo);
        if (lot) {
            setValue('supplier', lot.supplier);
            setValue('approvalValidity', lot.approvalValidity);
            setValue('ritesIc', lot.ritesIc);
            setValue('ritesBook', lot.ritesBook);
            setValue('type', lot.type);
            setValue('inventoryId', lot.id);
        } else {
            setValue('supplier', '');
            setValue('approvalValidity', '');
            setValue('ritesIc', '');
            setValue('ritesBook', '');
            setValue('type', '');
            setValue('inventoryId', '');
        }
    }, [selectedLotNo, availableLots, setValue]);

    // Update row results automatically
    useEffect(() => {
        readings.forEach((r, idx) => {
            const w = parseFloat(r.weight);
            const isWeightOk = w >= 1.4395 && w <= 1.5285;
            const res = (isWeightOk && !r.dimensionalNotOk && !r.hammerNotOk) ? 'PASS' : 'FAIL';
            if (r.result !== res) {
                setValue(`readings.${idx}.result`, res);
            }
        });
    }, [readings, setValue]);

    const summary = useMemo(() => {
        const total = readings.length;
        const passed = readings.filter(r => r.result === 'PASS').length;
        const rejected = total - passed;
        const rejectionPct = total > 0 ? ((rejected / total) * 100).toFixed(2) : 0;
        return { total, passed, rejected, rejectionPct };
    }, [readings]);

    const onSubmit = (data) => {
        const newRecord = {
            id: history.length + 1,
            testDate: data.date,
            lotNo: data.lotNo,
            supplier: data.supplier,
            checked: summary.total,
            accepted: summary.passed,
            rejected: summary.rejected,
            rejectionPct: summary.rejectionPct
        };
        setHistory([newRecord, ...history]);
        setShowForm(false);
        reset();
    };

    const historyColumns = [
        { key: 'testDate', label: 'Date' },
        { key: 'consignmentNo', label: 'Consignment No.' },
        { key: 'lotNo', label: 'Lot No.' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'checked', label: 'Tested' },
        { key: 'accepted', label: 'Pass' },
        { key: 'rejected', label: 'Fail' },
        { key: 'rejectionPct', label: 'Rej. %', render: (val) => val ? `${val}%` : '0%' }
    ];

    return (
        <div className="sgci-testing-root cement-forms-scope">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#101828' }}>SGCI Insert Audit & Weekly Summary</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-save" style={{ width: 'auto', background: '#059669' }}>Export PDF</button>
                    <button className="btn-save" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>+ New Audit Record</button>
                </div>
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">SGCI Insert Audit Report</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Date of Testing <span className="required">*</span></label>
                                        <input type="date" {...register('date', { required: 'Required' })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Consignment No. <span className="required">*</span></label>
                                        <select {...register('consignmentNo', { required: 'Required' })}>
                                            <option value="">Select Consignment</option>
                                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Lot No. <span className="required">*</span></label>
                                        <select {...register('lotNo', { required: 'Required' })}>
                                            <option value="">Select Lot</option>
                                            {availableLots.map(l => <option key={l.id} value={l.lotNo}>{l.lotNo}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>SGCI Supplier</label>
                                        <input type="text" readOnly className="readOnly" {...register('supplier')} />
                                    </div>
                                    <div className="input-group">
                                        <label>RDSO Approval Validity</label>
                                        <input type="text" readOnly className="readOnly" {...register('approvalValidity')} />
                                    </div>
                                    <div className="input-group">
                                        <label>Inventory ID</label>
                                        <input type="text" readOnly className="readOnly" {...register('inventoryId')} />
                                    </div>
                                    <div className="input-group">
                                        <label>Type of Insert</label>
                                        <input type="text" readOnly className="readOnly" {...register('type')} />
                                    </div>
                                    <div className="input-group">
                                        <label>RITES IC Number & Date</label>
                                        <input type="text" readOnly className="readOnly" {...register('ritesIc')} />
                                    </div>
                                    <div className="input-group">
                                        <label>RITES IC Book No. & Set No.</label>
                                        <input type="text" readOnly className="readOnly" {...register('ritesBook')} />
                                    </div>
                                </div>

                                <div className="section-divider"></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '14px', color: '#101828' }}>Inspection Table</h3>
                                    <button type="button" className="btn-save" style={{ width: 'auto', height: '28px', padding: '0 12px' }} onClick={() => append({ heatNo: '', patternNo: '', weight: '', dimensionalNotOk: false, hammerNotOk: false, result: 'PASS' })}>+ Add Row</button>
                                </div>

                                <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '120px' }}>Heat No.</th>
                                                <th style={{ width: '120px' }}>Pattern No.</th>
                                                <th style={{ width: '100px' }}>Weight (Kg)</th>
                                                <th style={{ width: '100px' }}>Dim. !OK</th>
                                                <th style={{ width: '100px' }}>Hammer !OK</th>
                                                <th style={{ width: '80px' }}>Result</th>
                                                <th style={{ width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fields.map((field, index) => (
                                                <tr key={field.id}>
                                                    <td><input type="text" {...register(`readings.${index}.heatNo`, { required: true })} style={{ textAlign: 'left', border: 'none', background: 'transparent' }} /></td>
                                                    <td><input type="text" {...register(`readings.${index}.patternNo`, { required: true })} style={{ textAlign: 'left', border: 'none', background: 'transparent' }} /></td>
                                                    <td>
                                                        <input type="number" step="0.0001" {...register(`readings.${index}.weight`, { required: true })} style={{ border: 'none', background: 'transparent' }} />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input type="checkbox" {...register(`readings.${index}.dimensionalNotOk`)} />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input type="checkbox" {...register(`readings.${index}.hammerNotOk`)} />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            fontWeight: 600,
                                                            color: readings[index]?.result === 'PASS' ? '#059669' : '#dc2626',
                                                            fontSize: '11px'
                                                        }}>
                                                            {readings[index]?.result}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {fields.length > 1 && (
                                                            <button type="button" onClick={() => remove(index)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="summary-box" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', gap: '20px', marginTop: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Total Checked</div>
                                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#101828' }}>{summary.total}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Passed</div>
                                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#059669' }}>{summary.passed}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Rejected</div>
                                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626' }}>{summary.rejected}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Rejection %</div>
                                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#101828' }}>{summary.rejectionPct}%</div>
                                    </div>
                                </div>

                                <div className="form-modal-footer" style={{ borderTop: 'none', padding: '24px 0 0', background: 'transparent' }}>
                                    <button type="submit" className="btn-save">Save Audit Report</button>
                                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-view">
                {/* Weekly Summary KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Total Inspected (Weekly)</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#101828' }}>3,450</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Accepted</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>3,412</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Rejected</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>38</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Avg. Rejection</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#101828' }}>1.10%</div>
                    </div>
                </div>

                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#475467', fontSize: '16px' }}>Weekly Audit Logs</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Filter:</span>
                        <input type="date" className="search-input" style={{ width: '130px', height: '28px' }} />
                    </div>
                </div>
                <EnhancedDataTable columns={historyColumns} data={history} />
            </div>
        </div>
    );
};

export default SgciInsertTesting;

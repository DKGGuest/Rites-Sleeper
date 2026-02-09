import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import { MOCK_HTS_HISTORY, MOCK_INVENTORY, MOCK_VERIFIED_CONSIGNMENTS } from '../../../../utils/rawMaterialMockData';

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

const HtsWireTesting = ({ onBack }) => {
    const [viewMode, setViewMode] = useState('new-stocks'); // Default to new stocks
    const [showForm, setShowForm] = useState(false);
    const [availableCoils] = useState(MOCK_INVENTORY.HTS || []);
    const [history, setHistory] = useState(MOCK_HTS_HISTORY.map(h => ({
        ...h,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));

    const pendingStocks = MOCK_INVENTORY.HTS.filter(item => item.status === 'Verified');

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            testDate: new Date().toISOString().split('T')[0],
            consignmentNo: '',
            coilNo: '',
            inventoryId: '',
            nominalWeight: '',
            layLength: '',
            strandDiameter: ''
        }
    });

    const selectedCoilNo = watch('coilNo');

    useEffect(() => {
        const coil = availableCoils.find(c => c.coilNo === selectedCoilNo);
        if (coil) setValue('inventoryId', coil.id);
        else setValue('inventoryId', '');
    }, [selectedCoilNo, availableCoils, setValue]);

    const canModify = (createdAt) => {
        if (!createdAt) return false;
        const entryTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        return (now - entryTime) < (60 * 60 * 1000); // 1 hour
    };

    const onSubmit = (data) => {
        const readingsToday = history.filter(h => h.testDate === data.testDate && h.coilNo === data.coilNo);
        if (readingsToday.length >= 3) {
            alert(`Maximum of 3 readings allowed for Coil ${data.coilNo} on ${data.testDate}.`);
            return;
        }

        const newRecord = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };

        setHistory([newRecord, ...history]);
        setShowForm(false);
        reset();
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this record?')) {
            setHistory(prev => prev.filter(h => h.id !== id));
        }
    };

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Agency' },
        { key: 'coilNo', label: 'Coil No.', isHeaderHighlight: true },
        { key: 'qty', label: 'Quantity' },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-action mini"
                    onClick={() => {
                        reset({
                            testDate: new Date().toISOString().split('T')[0],
                            coilNo: row.coilNo,
                            inventoryId: row.id
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
        { key: 'consignmentNo', label: 'Consignment' },
        { key: 'coilNo', label: 'Coil No.' },
        { key: 'nominalWeight', label: 'Weight' },
        { key: 'layLength', label: 'Lay Length' },
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
                                reset(row);
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
        <div className="hts-testing-root cement-forms-scope fade-in">
            <div className="content-title-row" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>HTS Wire Testing (Daily)</h2>
                <button className="toggle-btn secondary mini" onClick={onBack}>Back to Dashboard</button>
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
                    <div className="table-outer-wrapper fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                        <h4 style={{ color: '#64748b' }}>HTS Testing Analytics</h4>
                        <div style={{ height: '300px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                            <span style={{ color: '#cbd5e1', fontWeight: '600' }}>Chart Placeholder</span>
                        </div>
                    </div>
                )}

                {viewMode === 'new-stocks' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>HTS Inventory Pending Testing</h4>
                        </div>
                        <EnhancedDataTable columns={inventoryColumns} data={pendingStocks} />
                    </div>
                )}

                {viewMode === 'history' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>HTS Quality Logs</h4>
                            <button className="toggle-btn mini" onClick={() => { reset(); setShowForm(true); }}>+ Add New Testing</button>
                        </div>
                        <EnhancedDataTable columns={historyColumns} data={history} emptyMessage="No HTS test records found." />
                    </div>
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">HTS Wire Test Record</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Date of Testing <span className="required">*</span></label>
                                        <input type="text" value={new Date().toLocaleDateString('en-GB')} readOnly style={{ background: '#f1f5f9' }} />
                                    </div>
                                    <div className="input-group">
                                        <label>Consignment No. <span className="required">*</span></label>
                                        <select {...register('consignmentNo', { required: 'Required' })}>
                                            <option value="">-- Select --</option>
                                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Coil No. <span className="required">*</span></label>
                                        <select {...register('coilNo', { required: 'Coil No. is required' })}>
                                            <option value="">-- Select --</option>
                                            {availableCoils.map(c => <option key={c.id} value={c.coilNo}>{c.coilNo}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Inventory ID</label>
                                        <input type="text" readOnly className="readOnly" {...register('inventoryId')} />
                                    </div>
                                    <div className="input-group">
                                        <label>Nominal Weight <span className="required">*</span></label>
                                        <input type="number" step="0.001" {...register('nominalWeight', { required: true })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Lay Length <span className="required">*</span></label>
                                        <input type="number" step="0.01" {...register('layLength', { required: true })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Strand Diameter <span className="required">*</span></label>
                                        <input type="number" step="0.01" {...register('strandDiameter', { required: true })} />
                                    </div>
                                </div>
                                <div className="form-modal-footer" style={{ borderTop: 'none', padding: '24px 0 0' }}>
                                    <button type="submit" className="btn-save">Save Test</button>
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


export default HtsWireTesting;

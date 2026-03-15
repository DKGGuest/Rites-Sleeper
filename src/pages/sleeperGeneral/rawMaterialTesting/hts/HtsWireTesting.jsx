import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import { MOCK_HTS_HISTORY, MOCK_INVENTORY, MOCK_VERIFIED_CONSIGNMENTS } from '../../../../utils/rawMaterialMockData';
import { useShift } from '../../../../context/ShiftContext';
import { useToast } from '../../../../context/ToastContext';
import { saveHtsWireDailyTest } from '../../../../services/workflowService';
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

const HtsWireTesting = ({ onBack, inventoryData = [] }) => {
    const [viewMode, setViewMode] = useState('new-stocks'); // Default to new stocks
    const [showForm, setShowForm] = useState(false);
    const { selectedShift, dutyDate, dutyLocation } = useShift();
    const { showToast } = useToast();
    const [availableCoils] = useState(MOCK_INVENTORY.HTS || []);
    const [history, setHistory] = useState(MOCK_HTS_HISTORY.map(h => ({
        ...h,
        nominalWeight: h.weight,
        strandDiameter: h.diameter,
        coilNo: h.lotNo,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));

    const pendingStocks = inventoryData;

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

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                dateOfInspection: dutyDate || new Date().toISOString().split('T')[0],
                createdBy: 1 // Default
            };

            await saveHtsWireDailyTest(payload);
            showToast("HTS Wire daily test result saved!", "success");

            setShowForm(false);
            reset();
            // In real app re-fetch history
        } catch (error) {
            console.error("Error saving HTS wire test:", error);
            showToast("Failed to save HTS wire test result.", "error");
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
            key: 'coilNo', 
            label: 'Coil No.', 
            isHeaderHighlight: true,
            render: (_, row) => {
                const coils = row.details?.coilDetails || [];
                if (coils.length > 0) return coils.map(c => c.coilNo).join(', ');
                return row.coilNo || 'N/A';
            }
        },
        { 
            key: 'qty', 
            label: 'Quantity',
            render: (_, row) => row.details?.totalQtyReceived || row.qty || 'N/A'
        },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-action mini"
                    onClick={() => {
                        const firstCoil = row.details?.coilDetails?.[0]?.coilNo || row.coilNo;
                        reset({
                            testDate: new Date().toISOString().split('T')[0],
                            consignmentNo: row.consignmentNo,
                            coilNo: firstCoil,
                            inventoryId: row.requestId
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
                                { key: 'nominalWeight', color: '#3b82f6', label: 'Nominal Weight' },
                                { key: 'layLength', color: '#8b5cf6', label: 'Lay Length' }
                            ]}
                            title="HTS Wire Quality Trends"
                            description="Daily weight and lay length monitoring"
                            yAxisLabel=""
                        />
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
                            <button className="toggle-btn mini" onClick={() => { reset(); setShowForm(true); }}>+ Add New (Periodic)</button>
                        </div>
                        <EnhancedDataTable columns={historyColumns} data={history} emptyMessage="No HTS test records found." />
                    </div>
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80%', width: '80%' }}>
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
                                            <option value="PERIODIC">-- Periodic Testing --</option>
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

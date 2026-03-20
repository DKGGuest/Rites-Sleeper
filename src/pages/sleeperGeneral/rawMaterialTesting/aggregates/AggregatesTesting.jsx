
import React, { useState } from 'react';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import CrushingImpactAbrasion10mm from './CrushingImpactAbrasion10mm';
import CrushingImpactAbrasion20mm from './CrushingImpactAbrasion20mm';
import CombinedFlakinessElongation from './CombinedFlakinessElongation';
import CombinedGranulometricCurve from './CombinedGranulometricCurve';
import SoundnessTestForm from './SoundnessTestForm';
import { MOCK_INVENTORY, MOCK_AGGREGATES_HISTORY } from '../../../../utils/rawMaterialMockData';
import { getAggregateBulkStatus } from '../../../../services/workflowService';
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

const AggregateTesting = ({ onBack, inventoryData = [] }) => {
    const [viewMode, setViewMode] = useState('new-stocks');
    const [showForm, setShowForm] = useState(false);
    const [activeFormSection, setActiveFormSection] = useState(1);
    const [initialType, setInitialType] = useState("New Inventory");
    const [history, setHistory] = useState(MOCK_AGGREGATES_HISTORY.map(item => ({
        ...item,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));

    const pendingStocks = inventoryData;

    const [statusMap, setStatusMap] = useState({});
    const [activeRequestId, setActiveRequestId] = useState(null);

    React.useEffect(() => {
        const fetchStatus = async () => {
            if (pendingStocks.length > 0) {
                const reqIds = pendingStocks.map(s => s.requestId);
                const statuses = await getAggregateBulkStatus(reqIds);
                setStatusMap(statuses);
            }
        };
        fetchStatus();
    }, [pendingStocks]);

    const canModify = (createdAt) => {
        if (!createdAt) return false;
        const entryTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        return (now - entryTime) < (60 * 60 * 1000);
    };

    const handleSaveTest = (completedSectionId) => {
        if (completedSectionId < 5) {
            setActiveFormSection(completedSectionId + 1);
        } else {
            setShowForm(false);
            setActiveRequestId(null);
        }
    };

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Vendor' },
        { key: 'consignmentNo', label: 'Challan No.', isHeaderHighlight: true },
        { 
            key: 'aggregateType', 
            label: 'Material Type',
            render: (_, row) => row.details?.gradeSpec || row.aggregateType || 'N/A'
        },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'testingStatus',
            label: 'Status',
            render: (_, row) => {
                const status = statusMap[row.requestId] || 'Pending';
                const color = status === 'Completed' ? '#10b981' : '#f59e0b';
                return <span style={{ color, fontWeight: 'bold' }}>{status}</span>;
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const status = statusMap[row.requestId] || 'Pending';
                return (
                    <button
                        className="btn-action mini"
                        onClick={() => {
                            setActiveRequestId(row.requestId);
                            setInitialType("New Inventory");
                            setActiveFormSection(1);
                            setShowForm(true);
                        }}
                    >
                        {status === 'Completed' ? 'Modify test details' : 'Add Test Detail'}
                    </button>
                );
            }
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date', render: (val) => val ? val.split('-').reverse().join('/') : '' },
        { key: 'consignmentNo', label: 'Consignment' },
        { key: 'lotNo', label: 'Lot' },
        { key: 'crushing', label: 'Crushing (%)' },
        { key: 'impact', label: 'Impact (%)' },
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
                                setActiveFormSection(1);
                                setShowForm(true);
                            }}
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

    const renderActiveForm = () => {
        const props = {
            inventoryData,
            onSave: () => handleSaveTest(activeFormSection),
            onCancel: () => setShowForm(false),
            initialType: initialType,
            activeRequestId: activeRequestId
        };

        switch (activeFormSection) {
            case 1: return <CrushingImpactAbrasion10mm {...props} />;
            case 2: return <CrushingImpactAbrasion20mm {...props} />;
            case 3: return <CombinedFlakinessElongation {...props} />;
            case 4: return <CombinedGranulometricCurve {...props} />;
            case 5: return <SoundnessTestForm {...props} />;
            default: return null;
        }
    };

    const formTabs = [
        { id: 1, label: '10mm Quality' },
        { id: 2, label: '20mm Quality' },
        { id: 3, label: 'Flakiness & Elongation' },
        { id: 4, label: 'Granulometric Curve' },
        { id: 5, label: 'Soundness Test' }
    ];

    return (
        <div className="aggregate-testing-root cement-forms-scope fade-in">
            <div className="content-title-row" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Aggregate Quality Control</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="toggle-btn mini" onClick={() => { 
                        setInitialType("Periodic");
                        setActiveFormSection(1); 
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
                    count={pendingStocks.length}
                    label="Pending for Test"
                    isActive={viewMode === 'new-stocks'}
                    onClick={() => setViewMode('new-stocks')}
                />
                <SubCard id="history" title="Historical" color="#10b981" count={history.length} label="Quality Logs" isActive={viewMode === 'history'} onClick={() => setViewMode('history')} />
            </div>

            <div className="view-layer">
                {viewMode === 'stats' && (
                    <div className="table-outer-wrapper fade-in" style={{ padding: '24px' }}>
                        <TrendChart
                            data={history}
                            xKey="testDate"
                            lines={[
                                { key: 'crushing', color: '#ef4444', label: 'Crushing Value' },
                                { key: 'impact', color: '#f59e0b', label: 'Impact Value' }
                            ]}
                            title="Aggregate Quality Trends"
                            description="Historical crushing and impact resistance (%)"
                            yAxisLabel="%"
                        />
                    </div>
                )}

                {viewMode === 'new-stocks' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>Verified Inventory Pending Testing</h4>
                        </div>
                        <EnhancedDataTable columns={inventoryColumns} data={pendingStocks} />
                    </div>
                )}

                {viewMode === 'history' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>Historical Aggregate Quality Logs</h4>
                        </div>
                        <EnhancedDataTable columns={historyColumns} data={history} />
                    </div>
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80%', width: '80%' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Aggregate Quality Test Record</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>

                        <div style={{ background: '#ffffff', padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div className="nav-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                                {formTabs.map(s => (
                                    <button
                                        key={s.id}
                                        className={`nav-tab ${activeFormSection === s.id ? 'active' : ''}`}
                                        onClick={() => setActiveFormSection(s.id)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                            {renderActiveForm()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AggregateTesting;

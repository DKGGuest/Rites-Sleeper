
import React, { useState, useEffect } from 'react';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import SpecificSurfaceForm from './SpecificSurfaceForm';
import SettingTimeForm from './SettingTimeForm';
import NormalConsistencyForm from './NormalConsistencyForm';
import SevenDayStrengthForm from './SevenDayStrengthForm';
import FinenessTestForm from './FinenessTestForm';
import { MOCK_INVENTORY, MOCK_CEMENT_HISTORY } from '../../../../utils/rawMaterialMockData';
import CollectionAwaitingInspection from '../../../../components/CollectionAwaitingInspection';
import TrendChart from '../../../../components/common/TrendChart';
import { getBulkCementTestStatus } from '../../../../services/workflowService';
import './CementForms.css';

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

const CementTesting = ({ onBack, inventoryData = [] }) => {
    const [viewMode, setViewMode] = useState('new-stocks'); // Default to new stocks
    const [showForm, setShowForm] = useState(false);
    const [activeFormSection, setActiveFormSection] = useState(1);
    const [initialType, setInitialType] = useState("New Inventory");
    const [selectedRow, setSelectedRow] = useState(null);
    const [cementHistory, setCementHistory] = useState(MOCK_CEMENT_HISTORY.map(item => ({
        ...item,
        // Adding mock timestamp for testing the 1-hour rule (yesterday so they are not editable)
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));
    const [statusMap, setStatusMap] = useState({});

    // inventoryData is now passed from parent, already filtered by moduleId and accessibility
    const pendingStocks = inventoryData;

    // Fetch realtime statuses dynamically
    useEffect(() => {
        if (pendingStocks && pendingStocks.length > 0) {
            const requestIds = pendingStocks.map(row => row.requestId).filter(Boolean);
            if (requestIds.length > 0) {
                getBulkCementTestStatus(requestIds).then(res => {
                    setStatusMap(res);
                });
            }
        }
    }, [pendingStocks, showForm]);

    // Rule: Modify/Delete allowed only for 1 hour from entering
    const canModify = (createdAt) => {
        if (!createdAt) return false;
        const entryTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        return (now - entryTime) < (60 * 60 * 1000); // 1 hour
    };

    const handleSaveTest = (sectionId) => {
        // We do not manage fake mock history here anymore because the forms talk to backend themselves, 
        // but we still want to give a success toast and advance.
        if (sectionId < 5) {
            setActiveFormSection(sectionId + 1);
        } else {
            setShowForm(false);
            alert('All test records saved successfully!');
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this test record?')) {
            setCementHistory(prev => prev.filter(item => item.id !== id));
        }
    };

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Vendor' },
        { key: 'consignmentNo', label: 'Consignment No.', isHeaderHighlight: true },
        {
            key: 'lotNo',
            label: 'Lot / Batch No.',
            render: (_, row) => {
                const batches = row.details?.batchDetails || [];
                if (batches.length > 0) {
                    return batches.map(b => b.mtcNo).join(', ');
                }
                return row.lotNo || row.batchNo || 'N/A';
            }
        },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'status',
            label: 'Status',
            render: (_, row) => {
                const st = statusMap[row.requestId];
                if (st === 'Completed') {
                    return <span style={{ color: '#059669', fontWeight: 'bold' }}>Completed</span>;
                }
                return <span style={{ color: '#eab308', fontWeight: 'bold' }}>Pending</span>;
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
                            setSelectedRow(row);
                            setInitialType("New Inventory");
                            setActiveFormSection(1);
                            setShowForm(true);
                        }}
                    >
                        {isCompleted ? "Edit Test Details" : "Add Test Detail"}
                    </button>
                );
            }
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date', render: (val) => val ? val.split('-').reverse().join('/') : '' },
        { key: 'consignmentNo', label: 'Consignment' },
        { key: 'lotNo', label: 'Lot' },
        { key: 'surface', label: 'Surface' },
        { key: 'consistency', label: 'Consistency' },
        { key: 'soundness', label: 'Soundness' },
        { key: 'fineness', label: 'Fineness (%)' },
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
                                setSelectedRow(row);
                                setActiveFormSection(1);
                                setShowForm(true);
                            }}
                            title={!editable ? "Action expired (1-hour limit)" : ""}
                        >
                            Modify
                        </button>
                        <button
                            className={`btn-action mini danger ${!editable ? 'disabled-btn' : ''}`}
                            disabled={!editable}
                            onClick={() => handleDelete(row.id)}
                            title={!editable ? "Action expired (1-hour limit)" : ""}
                        >
                            Delete
                        </button>
                    </div>
                );
            }
        }
    ];

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedRow(null);
    };

    const sections = [
        { id: 1, label: '7 Day Strength', component: <SevenDayStrengthForm onSave={() => handleSaveTest(1)} onCancel={handleCloseForm} inventoryData={pendingStocks} initialType={initialType} selectedRow={selectedRow} /> },
        { id: 2, label: 'Normal Consistency', component: <NormalConsistencyForm onSave={() => handleSaveTest(2)} onCancel={handleCloseForm} inventoryData={pendingStocks} initialType={initialType} selectedRow={selectedRow} /> },
        { id: 3, label: 'Specific Surface', component: <SpecificSurfaceForm onSave={() => handleSaveTest(3)} onCancel={handleCloseForm} inventoryData={pendingStocks} initialType={initialType} selectedRow={selectedRow} /> },
        { id: 4, label: 'Setting Time', component: <SettingTimeForm onSave={() => handleSaveTest(4)} onCancel={handleCloseForm} inventoryData={pendingStocks} initialType={initialType} selectedRow={selectedRow} /> },
        { id: 5, label: 'Fineness Test', component: <FinenessTestForm onSave={() => handleSaveTest(5)} onCancel={handleCloseForm} inventoryData={pendingStocks} initialType={initialType} selectedRow={selectedRow} /> }
    ];

    return (
        <div className="cement-testing-root cement-forms-scope fade-in">
            <div className="content-title-row" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Cement Quality Control</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="toggle-btn mini" onClick={() => { 
                        setSelectedRow(null);
                        setInitialType("Periodic");
                        setActiveFormSection(1); 
                        setShowForm(true); 
                    }}>+ Add New (Periodic)</button>
                    <button className="toggle-btn secondary mini" onClick={onBack}>Back to Dashboard</button>
                </div>
            </div>

            {/* Sub-Card Navigation */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <SubCard
                    id="stats"
                    title="Analytics"
                    color="#42818c"
                    count="N/A"
                    label="Statistics"
                    isActive={viewMode === 'stats'}
                    onClick={() => setViewMode('stats')}
                />
                <SubCard
                    id="new-stocks"
                    title="Inventory"
                    color="#f59e0b"
                    count={pendingStocks.length}
                    label="Pending for Test"
                    isActive={viewMode === 'new-stocks'}
                    onClick={() => setViewMode('new-stocks')}
                />
                <SubCard
                    id="history"
                    title="Historical"
                    color="#10b981"
                    count={cementHistory.length}
                    label="Quality Logs"
                    isActive={viewMode === 'history'}
                    onClick={() => setViewMode('history')}
                />
            </div>

            {/* Dynamic Content */}
            <div className="view-layer">
                {viewMode === 'stats' && (
                    <div className="table-outer-wrapper fade-in" style={{ padding: '24px' }}>
                        <TrendChart
                            data={cementHistory}
                            xKey="testDate"
                            lines={[
                                { key: 'surface', color: '#3b82f6', label: 'Specific Surface' },
                                { key: 'initialSetting', color: '#8b5cf6', label: 'Initial Setting Time' }
                            ]}
                            title="Cement Quality Performance"
                            description="Historical specific surface and setting time analysis"
                            yAxisLabel=""
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
                            <h4 style={{ margin: 0 }}>Historical Cement Quality Logs</h4>
                        </div>
                        <EnhancedDataTable columns={historyColumns} data={cementHistory} />
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="form-modal-overlay" onClick={handleCloseForm}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80%', width: '80%' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Cement Quality Test Record</span>
                            <button className="form-modal-close" onClick={handleCloseForm}>✕</button>
                        </div>

                        <div style={{ background: '#ffffff', padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div className="nav-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                                {sections.map(s => (
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
                            {sections.find(s => s.id === activeFormSection)?.component}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default CementTesting;

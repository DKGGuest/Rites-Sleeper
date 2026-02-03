import React, { useState } from 'react';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import CrushingImpactAbrasion10mm from './CrushingImpactAbrasion10mm';
import CrushingImpactAbrasion20mm from './CrushingImpactAbrasion20mm';
import CombinedFlakinessElongation from './CombinedFlakinessElongation';
import CombinedGranulometricCurve from './CombinedGranulometricCurve';
import { MOCK_INVENTORY, MOCK_AGGREGATES_HISTORY } from '../../../../utils/rawMaterialMockData';
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

const AggregateTesting = ({ onBack }) => {
    const [viewMode, setViewMode] = useState('new-stocks'); // Default to new stocks
    const [showForm, setShowForm] = useState(false);
    const [activeFormSection, setActiveFormSection] = useState(1);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [aggHistory, setAggHistory] = useState(MOCK_AGGREGATES_HISTORY.map(item => ({
        ...item,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));

    const pendingAggregates = MOCK_INVENTORY.AGGREGATES.filter(item => item.status === 'Verified');

    const canModify = (createdAt) => {
        if (!createdAt) return false;
        const entryTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        return (now - entryTime) < (60 * 60 * 1000); // 1 hour
    };

    const handleRecordTest = (row) => {
        setSelectedEntry(row);
        setShowForm(true);
    };

    const handleSaveTest = () => {
        const newEntry = {
            id: Date.now(),
            testDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            testType: 'Manual',
            consignmentNo: selectedEntry?.consignmentNo || 'NEW-AGG-001',
            lotNo: selectedEntry?.lotNo || 'NEW-LOT-01',
            crushing: '22%',
            impact: '18%',
            abrasion: '25%'
        };
        setAggHistory(prev => [newEntry, ...prev]);
        setShowForm(false);
        alert('Aggregate test record saved successfully!');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this test record?')) {
            setAggHistory(prev => prev.filter(item => item.id !== id));
        }
    };

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Agency' },
        { key: 'consignmentNo', label: 'Consignment No.', isHeaderHighlight: true },
        { key: 'lotNo', label: 'Lot No.' },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button className="btn-action mini" onClick={() => handleRecordTest(row)}>
                    Add Test Detail
                </button>
            )
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date' },
        { key: 'consignmentNo', label: 'Consignment' },
        { key: 'lotNo', label: 'Lot' },
        { key: 'crushing', label: 'Crushing' },
        { key: 'impact', label: 'Impact' },
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
                                setSelectedEntry(row);
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

    const sections = [
        { id: 1, label: '10mm Quality', component: <CrushingImpactAbrasion10mm consignment={selectedEntry?.consignmentNo} lot={selectedEntry?.lotNo} onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 2, label: '20mm Quality', component: <CrushingImpactAbrasion20mm consignment={selectedEntry?.consignmentNo} lot={selectedEntry?.lotNo} onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 3, label: 'Flakiness & Elongation', component: <CombinedFlakinessElongation consignment={selectedEntry?.consignmentNo} lot={selectedEntry?.lotNo} onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 4, label: 'Granulometric Curve', component: <CombinedGranulometricCurve consignment={selectedEntry?.consignmentNo} lot={selectedEntry?.lotNo} onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> }
    ];

    return (
        <div className="aggregate-testing-root cement-forms-scope fade-in">
            <div className="content-title-row" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Aggregate Quality Control</h2>
                <button className="toggle-btn secondary mini" onClick={onBack}>Back to Dashboard</button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <SubCard id="stats" title="Analytics" color="#42818c" count="N/A" label="Statistics" isActive={viewMode === 'stats'} onClick={() => setViewMode('stats')} />
                <SubCard id="new-stocks" title="Inventory" color="#f59e0b" count={pendingAggregates.length} label="Pending for Test" isActive={viewMode === 'new-stocks'} onClick={() => setViewMode('new-stocks')} />
                <SubCard id="history" title="Historical" color="#10b981" count={aggHistory.length} label="Quality Logs" isActive={viewMode === 'history'} onClick={() => setViewMode('history')} />
            </div>

            <div className="view-layer">
                {viewMode === 'stats' && (
                    <div className="table-outer-wrapper fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                        <h4 style={{ color: '#64748b' }}>Statistics (Charts & Figures)</h4>
                        <div style={{ height: '300px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                            <span style={{ color: '#cbd5e1', fontWeight: '600' }}>Chart Placeholder</span>
                        </div>
                    </div>
                )}

                {viewMode === 'new-stocks' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>Verified Inventory Pending Testing</h4>
                        </div>
                        <EnhancedDataTable columns={inventoryColumns} data={pendingAggregates} />
                    </div>
                )}

                {viewMode === 'history' && (
                    <div className="table-outer-wrapper fade-in">
                        <div className="content-title-row" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: 0 }}>
                            <h4 style={{ margin: 0 }}>Historical Aggregate Quality Logs</h4>
                        </div>
                        <EnhancedDataTable columns={historyColumns} data={aggHistory} />
                    </div>
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Aggregate Quality Test Record</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>✕</button>
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


export default AggregateTesting;


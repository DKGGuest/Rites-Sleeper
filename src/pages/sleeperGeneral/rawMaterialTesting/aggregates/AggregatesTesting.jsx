
import React, { useState } from 'react';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import CrushingImpactAbrasion10mm from './CrushingImpactAbrasion10mm';
import CrushingImpactAbrasion20mm from './CrushingImpactAbrasion20mm';
import CombinedFlakinessElongation from './CombinedFlakinessElongation';
import CombinedGranulometricCurve from './CombinedGranulometricCurve';
import SoundnessTestForm from './SoundnessTestForm';
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
    const [viewMode, setViewMode] = useState('new-stocks');
    const [showForm, setShowForm] = useState(false);
    const [activeFormSection, setActiveFormSection] = useState(1);
    const [history, setHistory] = useState(MOCK_AGGREGATES_HISTORY.map(item => ({
        ...item,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    })));

    const pendingStocks = MOCK_INVENTORY.AGGREGATES.filter(item => item.status === 'Verified');

    const canModify = (createdAt) => {
        if (!createdAt) return false;
        const entryTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        return (now - entryTime) < (60 * 60 * 1000);
    };

    const handleSaveTest = (data) => {
        const newEntry = {
            id: Date.now(),
            testDate: data.date || data.testDate || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            testType: 'Manual',
            consignmentNo: data.consignmentNo || 'CON-NEW',
            lotNo: data.lotNo || 'LOT-NEW',
            crushing: data.crushing?.value || 'N/A',
            impact: data.impact?.value || 'N/A'
        };
        setHistory(prev => [newEntry, ...prev]);
        setShowForm(false);
        alert('Test record saved successfully!');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this test record?')) {
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    };

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Vendor' },
        { key: 'challanNo', label: 'Challan No.', isHeaderHighlight: true },
        { key: 'aggregateType', label: 'Material Type' },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-action mini"
                    onClick={() => {
                        setActiveFormSection(1);
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

    const sections = [
        { id: 1, label: '10mm Quality', component: <CrushingImpactAbrasion10mm onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 2, label: '20mm Quality', component: <CrushingImpactAbrasion20mm onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 3, label: 'Flakiness & Elongation', component: <CombinedFlakinessElongation onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 4, label: 'Granulometric Curve', component: <CombinedGranulometricCurve onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> },
        { id: 5, label: 'Soundness Test', component: <SoundnessTestForm onSave={handleSaveTest} onCancel={() => setShowForm(false)} /> }
    ];

    return (
        <div className="aggregate-testing-root cement-forms-scope fade-in">
            <div className="content-title-row" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Aggregate Quality Control</h2>
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
                <SubCard id="history" title="Historical" color="#10b981" count={history.length} label="Quality Logs" isActive={viewMode === 'history'} onClick={() => setViewMode('history')} />
            </div>

            <div className="view-layer">
                {viewMode === 'stats' && (
                    <div className="table-outer-wrapper fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                        <h4 style={{ color: '#64748b' }}>Aggregate Testing Statistics</h4>
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
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
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

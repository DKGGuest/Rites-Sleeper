import React, { useState } from 'react';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import CrushingImpactAbrasion10mm from './CrushingImpactAbrasion10mm';
import CrushingImpactAbrasion20mm from './CrushingImpactAbrasion20mm';
import CombinedFlakinessElongation from './CombinedFlakinessElongation';
import CombinedGranulometricCurve from './CombinedGranulometricCurve';
import { MOCK_INVENTORY, MOCK_AGGREGATES_HISTORY } from '../../../../utils/rawMaterialMockData';
import CollectionAwaitingInspection from '../../../../components/CollectionAwaitingInspection';
import '../cement/CementForms.css';

const AggregateTesting = ({ onBack }) => {
    const [showForm, setShowForm] = useState(false);
    const [activeFormSection, setActiveFormSection] = useState(1);
    const [selectedEntry, setSelectedEntry] = useState(null);

    const handleRecordTest = (row) => {
        setSelectedEntry(row);
        setShowForm(true);
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
                <button className="btn-action btn-verify" onClick={() => handleRecordTest(row)}>
                    Record Test
                </button>
            )
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date of Testing' },
        { key: 'consignmentNo', label: 'Consignment No.' },
        { key: 'lotNo', label: 'Lot No.' },
        { key: 'crushing', label: 'Crushing Value' },
        { key: 'impact', label: 'Impact Value' },
        { key: 'abrasion', label: 'Abrasion Value' }
    ];

    const sections = [
        {
            id: 1,
            label: '10mm Quality',
            component: <CrushingImpactAbrasion10mm
                consignment={selectedEntry?.consignmentNo}
                lot={selectedEntry?.lotNo}
                onSave={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
            />
        },
        {
            id: 2,
            label: '20mm Quality',
            component: <CrushingImpactAbrasion20mm
                consignment={selectedEntry?.consignmentNo}
                lot={selectedEntry?.lotNo}
                onSave={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
            />
        },
        {
            id: 3,
            label: 'Flakiness & Elongation',
            component: <CombinedFlakinessElongation
                consignment={selectedEntry?.consignmentNo}
                lot={selectedEntry?.lotNo}
                onSave={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
            />
        },
        {
            id: 4,
            label: 'Granulometric Curve',
            component: <CombinedGranulometricCurve
                consignment={selectedEntry?.consignmentNo}
                lot={selectedEntry?.lotNo}
                onSave={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
            />
        }
    ];

    return (
        <div className="aggregate-testing-root cement-forms-scope" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#101828' }}>Aggregate Quality Record</h2>
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Aggregate Quality Test Record</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
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

            <div style={{ padding: '0 16px' }}>
                <CollectionAwaitingInspection />

                <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ marginBottom: '12px', color: '#475467', fontSize: '15px' }}>Collection Record: Awaiting Testing</h4>
                    <EnhancedDataTable columns={inventoryColumns} data={MOCK_INVENTORY.AGGREGATES} />
                </div>

                <div>
                    <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '16px' }}>
                        <h4 style={{ margin: 0, color: '#475467', fontSize: '15px', fontWeight: 600 }}>Historical Quality Logs</h4>
                        <div className="kpi-group-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="btn-action btn-verify" onClick={() => { setSelectedEntry(null); setShowForm(true); }}>
                                + Add New Test
                            </button>
                        </div>
                    </div>
                    <EnhancedDataTable columns={historyColumns} data={MOCK_AGGREGATES_HISTORY} />
                </div>
            </div>
        </div>
    );
};

export default AggregateTesting;


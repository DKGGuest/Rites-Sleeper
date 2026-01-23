
import React, { useState } from 'react';
import EnhancedDataTable from '../../../../components/EnhancedDataTable';
import SpecificSurfaceForm from './SpecificSurfaceForm';
import SettingTimeForm from './SettingTimeForm';
import NormalConsistencyForm from './NormalConsistencyForm';
import SevenDayStrengthForm from './SevenDayStrengthForm';
import { MOCK_INVENTORY, MOCK_CEMENT_HISTORY } from '../../../../utils/rawMaterialMockData';
import CollectionAwaitingInspection from '../../../../components/CollectionAwaitingInspection';
import './CementForms.css';

const CementTesting = ({ onBack }) => {
    const [showForm, setShowForm] = useState(false);
    const [show, setShow] = useState(false);
    const [activeFormSection, setActiveFormSection] = useState(1);

    // Business Logic: 15-day periodic mandate
    const lastTestDateStr = MOCK_CEMENT_HISTORY[MOCK_CEMENT_HISTORY.length - 1].testDate;
    const lastTestDate = new Date(lastTestDateStr);
    const today = new Date('2026-01-09');

    const daysDiff = Math.floor((today.getTime() - lastTestDate.getTime()) / (1000 * 3600 * 24));
    const nextDueDate = new Date(lastTestDate);
    nextDueDate.setDate(nextDueDate.getDate() + 15);
    const isOverdue = today > nextDueDate; // Strict greater than for overdue
    const isDueToday = today.toDateString() === nextDueDate.toDateString(); // Exact match for today

    const inventoryColumns = [
        { key: 'vendor', label: 'Registered Vendor' },
        { key: 'consignmentNo', label: 'Consignment No.', isHeaderHighlight: true },
        { key: 'lotNo', label: 'Lot No.' },
        { key: 'receivedDate', label: 'Arrival Date' },
        {
            key: 'actions',
            label: 'Actions',
            render: () => <button className="btn-action btn-verify" onClick={() => setShowForm(true)}>Record Test</button>
        }
    ];

    const historyColumns = [
        { key: 'testDate', label: 'Date of Testing' },
        { key: 'consignmentNo', label: 'Consignment No.' },
        { key: 'lotNo', label: 'Lot No.' },
        { key: 'surface', label: 'Specific Surface' },
        { key: 'initialSetting', label: 'Initial Setting Time' },
        { key: 'finalSetting', label: 'Final Setting Time' },
        { key: 'consistency', label: 'Normal Consistency' },
        { key: 'soundness', label: 'Soundness' }
    ];

    const sections = [
        { id: 1, label: '7 Day Strength', component: <SevenDayStrengthForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} /> },
        { id: 2, label: 'Normal Consistency', component: <NormalConsistencyForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} /> },
        { id: 3, label: 'Specific Surface', component: <SpecificSurfaceForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} /> },
        { id: 4, label: 'Setting Time', component: <SettingTimeForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} /> }
    ];

    return (
        <div className="cement-testing-root cement-forms-scope" style={{ animation: 'fadeIn 0.3s' }}>
            {/* Header without Back button */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#101828' }}>Cement Quality Record</h2>
            </div>



            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">New Cement Quality Test Record</span>
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
                    <h4 style={{ marginBottom: '12px', color: '#475467', fontSize: 'var(--fs-md)', fontWeight: 600 }}>New Cement Received & Pending for Test</h4>
                    <EnhancedDataTable columns={inventoryColumns} data={MOCK_INVENTORY.CEMENT} />
                </div>
                <div>
                    <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '16px' }}>
                        <h4 style={{ margin: 0, color: '#475467', fontSize: 'var(--fs-md)', fontWeight: 600 }}>Historical Quality Logs</h4>

                        <div className="kpi-group-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {/* Days Since Last Test Compact Box */}
                            <div style={{
                                padding: '8px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                background: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: '100px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}>
                                <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', fontWeight: 600 }}>Since Last Test</span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#101828' }}>7 days</span>
                            </div>

                            {/* Next Due Date Compact Box */}
                            <div style={{
                                padding: '8px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                background: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: '120px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}>
                                <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', fontWeight: 600 }}>Next Due Date</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#101828' }}>17/01/2026</span>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: '700',
                                        color: '#059669'
                                    }}>
                                        On Track
                                    </span>
                                </div>
                            </div>

                            <button className="btn-action btn-verify" onClick={() => setShowForm(true)}>
                                + Add New Test
                            </button>
                        </div>
                    </div>
                    <EnhancedDataTable columns={historyColumns} data={MOCK_CEMENT_HISTORY} />
                </div>
            </div>
        </div>
    );
};

export default CementTesting;

import React, { useState } from 'react';
import { useShift } from '../../context/ShiftContext';
import { getVerificationStats } from '../ProcessIE/PlantVerificationData';

// Dashboards
import RawMaterialDashboard from './rawMaterialTesting/RawMaterialDashboard';
import FinalInspectionDashboard from './finalInspection/FinalInspectionDashboard';
import RawMaterialInventory from '../../features/inventory/RawMaterialInventory';
import IncomingVerificationDashboard from './rawMaterialVerification/IncomingVerificationDashboard';
import PlantDeclarationVerification from '../ProcessIE/PlantDeclarationVerification';

// Styles
import '../ProcessIE/PlantDeclarationVerification.css';
import './SleeperProcessIEGeneral.css';

const SUB_COLUMNS = [
    { id: 'plant-declaration-verification', label: 'Plant Declaration Verification', description: '' },
    { id: 'incoming-verification', label: 'Incoming Verification', description: 'Verify raw material inventory' },
    { id: 'inventory', label: 'Raw Material Inventory', description: 'Stock Levels & Consumption' },
    { id: 'raw-material', label: 'Raw Material Testing', description: 'Monitor incoming material quality' },
    { id: 'final-inspection', label: 'Final Inspection', description: 'Finished sleeper quality checks' },
    { id: 'calibration', label: 'Calibration', description: 'Plant equipment calibration logs' },
];


const SleeperProcessIEGeneral = () => {
    const { dutyDate, selectedShift, dutyLocation, plantVerificationData } = useShift();
    const [activeSubView, setActiveSubView] = useState('plant-declaration-verification');
    const stats = getVerificationStats(plantVerificationData);

    return (
        <div className="ie-general-container">
            {/* ── Page Header ── */}
            <header className="ie-general-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { target: 'Main Dashboard' } }))}
                    style={{
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    title="Back to Dashboard"
                >🏠</button>
                <div>
                    <h1 className="ie-general-title" style={{ margin: 0 }}>Sleeper Process IE-General</h1>
                    <p className="ie-general-subtitle" style={{ margin: '4px 0 0 0', display: 'flex', gap: '15px' }}>
                        <span>📅 {dutyDate ? dutyDate.split('-').reverse().join('/') : ''}</span>
                        <span>⏱️ {selectedShift === 'General' ? 'General Shift' : `Shift ${selectedShift}`}</span>
                        <span>📍 {dutyLocation}</span>
                    </p>
                </div>
            </header>


            {/* ── Sub-navigation Cards ── */}
            <div className="ie-sub-nav-grid">
                {SUB_COLUMNS.map(col => {
                    const isPlantVerification = col.id === 'plant-declaration-verification';
                    return (
                        <div
                            key={col.id}
                            onClick={() => setActiveSubView(col.id)}
                            className={`ie-sub-nav-card${activeSubView === col.id ? ' active' : ''} ${isPlantVerification ? 'pv-card' : ''}`}
                        >
                            <h3 className="ie-sub-nav-card-title">{col.label}</h3>

                            {isPlantVerification ? (
                                <div className="pv-card-stats">
                                    {stats.pending > 0 && (
                                        <div className="pv-stat-alert">
                                            <span className="alert-icon">⚠️</span>
                                            {stats.pending} Pending
                                        </div>
                                    )}
                                    <div className="pv-stat-row-summary">
                                        <span className="stat-v" title="Verified">V: {stats.verified}</span>
                                        <span className="stat-p" title="Pending">P: {stats.pending}</span>
                                        <span className="stat-r" title="Rejected">R: {stats.rejected}</span>
                                    </div>
                                </div>
                            ) : (
                                col.description && (
                                    <p className="ie-sub-nav-card-desc">{col.description}</p>
                                )
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Dynamic Content Area ── */}
            <div className="ie-sub-view-content fade-in">

                {activeSubView === 'plant-declaration-verification' && (
                    <div className="fade-in" style={{ marginTop: '-24px' }}>
                        <PlantDeclarationVerification />
                    </div>
                )}

                {activeSubView === 'incoming-verification' && (
                    <IncomingVerificationDashboard />
                )}

                {activeSubView === 'inventory' && (
                    <div className="fade-in">
                        <RawMaterialInventory displayMode="inline" />
                    </div>
                )}


                {activeSubView === 'raw-material' && <RawMaterialDashboard />}
                {activeSubView === 'final-inspection' && <FinalInspectionDashboard />}

                {activeSubView === 'calibration' && (
                    <div className="ie-calibration-placeholder">
                        <h3>Calibration Module</h3>
                        <p>Equipment calibration tracking will be available here soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SleeperProcessIEGeneral;

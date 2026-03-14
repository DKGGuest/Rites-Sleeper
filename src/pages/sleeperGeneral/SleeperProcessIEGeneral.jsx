import React, { useState } from 'react';
import { useShift } from '../../context/ShiftContext';
// Dashboards
import RawMaterialDashboard from './rawMaterialTesting/RawMaterialDashboard';
import FinalInspectionDashboard from './finalInspection/FinalInspectionDashboard';
import RawMaterialInventory from '../../features/inventory/RawMaterialInventory';
import IncomingVerificationDashboard from './rawMaterialVerification/IncomingVerificationDashboard';
import PlantDeclarationVerification from './plantDeclaration/PlantDeclarationVerification';
import MoistureAnalysis from '../../features/moisture-analysis/MoistureAnalysis';

import { getVerificationStats } from '../ProcessIE/PlantVerificationData';

// Styles
import './plantDeclaration/PlantDeclarationVerification.css';
import './SleeperProcessIEGeneral.css';

const SUB_COLUMNS = [
    {
        id: 'plant-declaration-verification',
        label: 'Plant Declaration',
        description: 'Review & Verify Master Data',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8" /><path d="M20 22h-16" /><path d="M20 15v7" /><path d="M4 15v7" /><path d="M8 22v-4" /><path d="M16 22v-4" /><path d="m17 7-5-5-5 5" /><path d="M12 2v20" /></svg>
    },
    {
        id: 'incoming-verification',
        label: 'Incoming Verification',
        description: 'Verify Raw Material Entry',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
    },
    {
        id: 'inventory',
        label: 'RM Inventory',
        description: 'Stock Levels & Consumption',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
    },
    {
        id: 'raw-material',
        label: 'RM Testing',
        description: 'Incoming Material Quality',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15" /><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" /><path d="M6 14h12" /></svg>
    },
    {
        id: 'final-inspection',
        label: 'Final Inspection',
        description: 'Sleeper Quality Audit',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 5-10 13L2 8Z" /><path d="M12 21 8.5 8" /><path d="M3.8 8.9h16.4" /><path d="m15.5 8-3.5 13" /></svg>
    },
    {
        id: 'calibration',
        label: 'Calibration',
        description: 'Equipment Accuracy Logs',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h18" /></svg>
    },
    {
        id: 'moisture',
        label: 'Moisture Analysis',
        description: 'Aggregate moisture tracking',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M12 12V6" /></svg>
    },
    {
        id: 'production-verification',
        label: 'Production Verification',
        description: 'Verify Daily Production Logs',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /><polyline points="21 8 21 3 16 3" /></svg>
    },
];


const SleeperProcessIEGeneral = () => {
    const { dutyDate, selectedShift, dutyLocation, plantVerificationData } = useShift();
    const [activeSubView, setActiveSubView] = useState('plant-declaration-verification');
    const stats = getVerificationStats(plantVerificationData);

    return (
        <div className="ie-general-container">
            {/* ── Page Header ── */}
            <header className="ie-modern-header">
                <div className="header-top-line">
                    <button
                        className="home-btn-glass"
                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { target: 'Main Dashboard' } }))}
                        title="Back to Dashboard"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </button>
                    <div className="header-titles">
                        <h1>Sleeper Process IE-General</h1>
                        <div className="header-meta-pills">
                            <span className="meta-pill date"> {dutyDate ? dutyDate.split('-').reverse().join('/') : '10/03/2026'}</span>
                            <span className="meta-pill shift"> {selectedShift === 'General' ? 'General' : `Shift ${selectedShift}`}</span>
                            <span className="meta-pill loc"> {dutyLocation || 'Plant Area'}</span>
                        </div>
                    </div>
                </div>
            </header>


            {/* ── Sub-navigation Cards ── */}
            <div className="ie-sub-nav-grid">
                {SUB_COLUMNS.map(col => {
                    const isPlantVerification = col.id === 'plant-declaration-verification';
                    const isActive = activeSubView === col.id;
                    return (
                        <div
                            key={col.id}
                            onClick={() => setActiveSubView(col.id)}
                            className={`ie-sub-nav-card ${isActive ? 'active' : ''} ${isPlantVerification ? 'pv-card' : ''}`}
                        >
                            <div className="card-icon-wrapper">{col.icon}</div>
                            <div className="card-info">
                                <h3 className="ie-sub-nav-card-title">{col.label}</h3>
                                {isPlantVerification ? (
                                    <div className="pv-card-stats">
                                        {stats.pending > 0 && (
                                            <div className="pv-stat-alert">
                                                <span className="alert-dot"></span>
                                                {stats.pending} Pending
                                            </div>
                                        )}
                                        <div className="pv-stat-row-summary">
                                            <span className="stat-v">V: {stats.verified}</span>
                                            <span className="stat-p">P: {stats.pending}</span>
                                            <span className="stat-r">C: {stats.rejected}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="ie-sub-nav-card-desc">{col.description}</p>
                                )}
                            </div>
                            {isActive && <div className="active-indicator"></div>}
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

                {activeSubView === 'moisture' && (
                    <div className="fade-in">
                        <MoistureAnalysis
                            displayMode="inline"
                            onBack={() => setActiveSubView('raw-material')}
                            onSave={() => { }}
                        />
                    </div>
                )}

                {activeSubView === 'production-verification' && (
                    <IncomingVerificationDashboard initialGroup="Production Verification" />
                )}
            </div>
        </div>
    );
};

export default SleeperProcessIEGeneral;

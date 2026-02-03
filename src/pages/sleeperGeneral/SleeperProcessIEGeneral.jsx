import React, { useState } from 'react';
import RawMaterialDashboard from './rawMaterialTesting/RawMaterialDashboard';
import FinalInspectionDashboard from './finalInspection/FinalInspectionDashboard';
import IncomingVerificationDashboard from './rawMaterialVerification/IncomingVerificationDashboard';

const SleeperProcessIEGeneral = () => {
    const [activeSubView, setActiveSubView] = useState('incoming-verification');

    const subColumns = [
        { id: 'incoming-verification', label: 'Incoming Verification', description: 'Verify raw material inventory' },
        { id: 'inventory', label: 'Raw Material Inventory', description: 'Stock Levels & Consumption' },
        { id: 'raw-material', label: 'Raw Material Testing', description: 'Monitor incoming material quality' },
        { id: 'final-inspection', label: 'Final Inspection', description: 'Finished sleeper quality checks' },
        { id: 'calibration', label: 'Calibration', description: 'Plant equipment calibration logs' }
    ];

    return (
        <div className="dashboard-container" style={{ padding: '24px' }}>
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#42818c', margin: '0 0 8px 0' }}>Sleeper Process IE-General</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 'var(--fs-sm)' }}>Quality monitoring and calibration control</p>
            </header>

            {/* Sub-navigation Row (4 Columns) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {subColumns.map(col => (
                    <div
                        key={col.id}
                        onClick={() => setActiveSubView(col.id)}
                        style={{
                            background: activeSubView === col.id ? '#f0f9fa' : 'white',
                            border: `2px solid ${activeSubView === col.id ? '#42818c' : '#e2e8f0'}`,
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            textAlign: 'center',
                            boxShadow: activeSubView === col.id ? '0 10px 15px -3px rgba(66, 129, 140, 0.1)' : 'none',
                            transform: activeSubView === col.id ? 'translateY(-2px)' : 'none'
                        }}
                    >
                        <h3 style={{
                            fontSize: 'var(--fs-md)',
                            fontWeight: '700',
                            color: activeSubView === col.id ? '#42818c' : '#475569',
                            marginBottom: '4px'
                        }}>
                            {col.label}
                        </h3>
                        <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{col.description}</p>
                    </div>
                ))}
            </div>

            {/* Dynamic Content Area */}
            <div className="sub-view-content fade-in" style={{ animation: 'fadeIn 0.4s ease' }}>
                {activeSubView === 'incoming-verification' && <IncomingVerificationDashboard />}

                {activeSubView === 'inventory' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>Raw Material Inventory Status</h2>
                            <button
                                style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.2)' }}
                            >
                                Update Stock
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                            <div style={{ borderLeft: '4px solid #8b5cf6', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cement (OPC-53)</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>120.5 MT</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '500' }}>Enough for 3 days</span>
                                </div>
                            </div>
                            <div style={{ borderLeft: '4px solid #3b82f6', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>20mm Aggregate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>450.0 MT</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '500' }}>Full Capacity</span>
                                </div>
                            </div>
                            <div style={{ borderLeft: '4px solid #f59e0b', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>10mm Aggregate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>320.3 MT</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
                                    <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: '500' }}>Low Stock Concern</span>
                                </div>
                            </div>
                            <div style={{ borderLeft: '4px solid #10b981', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admixture</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>2,400 L</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '500' }}>Stock Healthy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSubView === 'raw-material' && <RawMaterialDashboard />}

                {activeSubView === 'final-inspection' && <FinalInspectionDashboard />}

                {activeSubView === 'calibration' && (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#94a3b8', marginBottom: '16px' }}>SCALES</div>
                        <h3>Calibration Module</h3>
                        <p>Equipment calibration tracking will be available here soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SleeperProcessIEGeneral;

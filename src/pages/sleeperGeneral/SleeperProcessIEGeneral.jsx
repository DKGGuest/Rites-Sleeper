import React, { useState } from 'react';
import RawMaterialDashboard from './rawMaterialTesting/RawMaterialDashboard';
import FinalInspectionDashboard from './finalInspection/FinalInspectionDashboard';
import IncomingVerificationDashboard from './rawMaterialVerification/IncomingVerificationDashboard';
import PlantDeclarationVerification from '../ProcessIE/PlantDeclarationVerification';
import '../ProcessIE/PlantDeclarationVerification.css';

const SleeperProcessIEGeneral = () => {
    const [activeSubView, setActiveSubView] = useState('plant-declaration-verification');

    const subColumns = [
        { id: 'plant-declaration-verification', label: 'Plant Declaration Verification', description: '' },
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

            {/* Sub-navigation Row (Horizontal Grid Columns) */}
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
            <div className="sub-view-content fade-in">
                {activeSubView === 'plant-declaration-verification' && (
                    <div className="fade-in" style={{ marginTop: '-24px' }}>
                        <PlantDeclarationVerification />
                    </div>
                )}

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
                            {[
                                { label: 'Cement (OPC-53)', value: '120.5 MT', status: 'Enough for 3 days', color: '#8b5cf6', health: '#10b981' },
                                { label: '20mm Aggregate', value: '450.0 MT', status: 'Full Capacity', color: '#3b82f6', health: '#10b981' },
                                { label: '10mm Aggregate', value: '320.3 MT', status: 'Low Stock Concern', color: '#f59e0b', health: '#f59e0b' },
                                { label: 'Admixture', value: '2,400 L', status: 'Stock Healthy', color: '#10b981', health: '#10b981' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ borderLeft: `4px solid ${item.color}`, padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{item.value}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.health }}></span>
                                        <span style={{ fontSize: '0.65rem', color: item.health, fontWeight: '500' }}>{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSubView === 'raw-material' && <RawMaterialDashboard />}
                {activeSubView === 'final-inspection' && <FinalInspectionDashboard />}

                {activeSubView === 'calibration' && (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#94a3b8', marginBottom: '16px' }}>Calibration Module</h3>
                        <p style={{ fontSize: '1rem', color: '#94a3b8' }}>Equipment calibration tracking will be available here soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SleeperProcessIEGeneral;

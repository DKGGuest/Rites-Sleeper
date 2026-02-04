import React, { useState } from 'react';
import CementTesting from './cement/CementTesting';
import AggregateTesting from './aggregates/AggregatesTesting';
import HtsWireTesting from './hts/HtsWireTesting';
import SgciInsertTesting from './sgci/SgciInsertTesting';
import WaterTesting from './water/WaterTesting';
import AdmixtureTesting from './admixture/AdmixtureTesting';

const RawMaterialDashboard = () => {
    const [selectedMaterial, setSelectedMaterial] = useState('cement');

    const materials = [
        { id: 'cement', title: 'Cement Testing', subtitle: 'Periodic & New Batch' },
        { id: 'aggregates', title: 'Aggregate Testing', subtitle: 'Crushing & Impact' },
        { id: 'hts-wire', title: 'HTS Wire Testing', subtitle: 'Daily mandatory' },
        { id: 'sgci', title: 'SGCI Insert Testing', subtitle: 'Weekly summary' },
        { id: 'water', title: 'Water Testing', subtitle: 'PH & TDS monthly' },
        { id: 'admixture', title: 'Admixture Testing', subtitle: 'Specific Gravity & PH' }
    ];

    const renderContent = () => {
        switch (selectedMaterial) {
            case 'cement': return <CementTesting onBack={() => setSelectedMaterial(null)} />;
            case 'aggregates': return <AggregateTesting onBack={() => setSelectedMaterial(null)} />;
            case 'hts-wire': return <HtsWireTesting onBack={() => setSelectedMaterial(null)} />;
            case 'sgci': return <SgciInsertTesting onBack={() => setSelectedMaterial(null)} />;
            case 'water': return <WaterTesting onBack={() => setSelectedMaterial(null)} />;
            case 'admixture': return <AdmixtureTesting onBack={() => setSelectedMaterial(null)} />;
            default: return null;
        }
    };

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#0d3b3f', margin: '0 0 8px 0' }}>Raw Material Dashboard</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 'var(--fs-sm)' }}>Manage and monitor material quality tests</p>
            </header>

            <div className="ie-tab-row" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {materials.map(mat => (
                    <div
                        key={mat.id}
                        className={`ie-tab-card ${selectedMaterial === mat.id ? 'active' : ''}`}
                        onClick={() => setSelectedMaterial(mat.id)}
                        style={{
                            background: selectedMaterial === mat.id ? 'var(--primary-50)' : 'white',
                            border: `1px solid ${selectedMaterial === mat.id ? 'var(--rites-green)' : 'var(--neutral-200)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}
                    >
                        <span className="ie-tab-title" style={{ fontWeight: '700', fontSize: 'var(--fs-md)', color: selectedMaterial === mat.id ? 'var(--rites-dark)' : 'var(--neutral-700)' }}>{mat.title}</span>
                        <span className="ie-tab-subtitle" style={{ fontSize: 'var(--fs-xxs)', color: '#64748b' }}>{mat.subtitle}</span>
                    </div>
                ))}
            </div>

            <div className="ie-content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default RawMaterialDashboard;

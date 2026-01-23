import React, { useState } from 'react';
import WaterCubeTesting, { WaterCubeStats } from './WaterCubeTesting';
import ModulusOfRupture from './ModulusOfRupture';
import DimensionalTesting from './DimensionalTesting';

const FinalInspectionDashboard = () => {
    const [selectedCard, setSelectedCard] = useState('water-cube');

    const cards = [
        { id: 'visual', title: 'Visual Check & Measurement', subtitle: 'Sub Card- 1 (100%)' },
        { id: 'critical', title: 'Critical Dimension', subtitle: 'Sub Card- 2 (Target 10-20%)' },
        { id: 'non-critical', title: 'Non-Critical Dimension', subtitle: 'Sub Card- 3 (Target 1-5%)' },
        { id: 'water-cube', title: 'Water Cube Strength', subtitle: 'Sub Card- 4' },
        { id: 'mor', title: 'Modulus of Rupture', subtitle: 'Sub Card- 5' },
        { id: 'mof', title: 'Moment of Failure', subtitle: 'Structural integrity' },
        { id: 'mor_res', title: 'Moment of Resistance', subtitle: 'Standard compliance' },
    ];

    const renderContent = () => {
        switch (selectedCard) {
            case 'water-cube':
                return <WaterCubeTesting />;
            case 'mor':
                return <ModulusOfRupture />;
            case 'visual':
                return <DimensionalTesting type="visual" />;
            case 'critical':
                return <DimensionalTesting type="critical" />;
            case 'non-critical':
                return <DimensionalTesting type="noncritical" />;
            default:
                return (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🛠️</div>
                        <h3>{cards.find(c => c.id === selectedCard)?.title}</h3>
                        <p>This inspection module is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#42818c', margin: '0 0 8px 0' }}>Final Inspection Dashboard</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 'var(--fs-sm)' }}>Quality assurance for finished concrete sleepers</p>
            </header>

            <div className="ie-tab-row" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={`ie-tab-card ${selectedCard === card.id ? 'active' : ''}`}
                        onClick={() => setSelectedCard(card.id)}
                        style={{
                            background: selectedCard === card.id ? '#f0f9fa' : 'white',
                            border: `1px solid ${selectedCard === card.id ? '#42818c' : '#e2e8f0'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            boxShadow: selectedCard === card.id ? '0 4px 6px -1px rgba(66, 129, 140, 0.1)' : 'none'
                        }}
                    >
                        <span style={{
                            fontWeight: '700',
                            fontSize: '13px',
                            color: selectedCard === card.id ? '#13343b' : '#475569'
                        }}>
                            {card.title}
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{card.subtitle}</span>
                    </div>
                ))}
            </div>

            <div className="ie-content-area">
                {renderContent()}
            </div>
        </div>
    );
};

export default FinalInspectionDashboard;

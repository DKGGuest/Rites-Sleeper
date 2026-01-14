/**
 * Raw Material Testing Dashboard
 * Updated to follow the requested folder structure: pages/sleeperGeneral/rawMaterialTesting/
 */

import React, { useState } from 'react';
import CementTesting from './cement/CementTesting';
import AggregateTesting from './aggregates/AggregatesTesting';
import HtsWireTesting from './hts/HtsWireTesting';
import SgciInsertTesting from './sgci/SgciInsertTesting';
import WaterTesting from './water/WaterTesting';

const RawMaterialDashboard = () => {
    const [selectedMaterial, setSelectedMaterial] = useState('cement');

    const materials = [
        { id: 'cement', title: 'Cement Testing', subtitle: 'Periodic & New Batch' },
        { id: 'aggregates', title: 'Aggregate Testing', subtitle: 'Crushing & Impact' },
        { id: 'hts-wire', title: 'HTS Wire Testing', subtitle: 'Daily mandatory' },
        { id: 'sgci', title: 'SGCI Insert Testing', subtitle: 'Weekly summary' },
        { id: 'water', title: 'Water Testing', subtitle: 'PH & TDS monthly' }
    ];

    const renderContent = () => {
        switch (selectedMaterial) {
            case 'cement': return <CementTesting onBack={() => setSelectedMaterial(null)} />;
            case 'aggregates': return <AggregateTesting onBack={() => setSelectedMaterial(null)} />;
            case 'hts-wire': return <HtsWireTesting onBack={() => setSelectedMaterial(null)} />;
            case 'sgci': return <SgciInsertTesting onBack={() => setSelectedMaterial(null)} />;
            case 'water': return <WaterTesting onBack={() => setSelectedMaterial(null)} />;
            default: return null;
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '0 20px' }}>
            <style>{`
                .ie-dashboard-title {
                    font-size: var(--fs-xl);
                    font-weight: 600;
                    color: #0d3b3f;
                    margin-bottom: 24px;
                }
                .ie-tab-row {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                    width: 100%;
                }
                .ie-tab-card {
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    height: 100%;
                    box-sizing: border-box;
                    min-height: 80px;
                }
                .ie-tab-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transform: translateY(-2px);
                }
                .ie-tab-card.active {
                    background: #e0f2f1;
                    border: 1px solid #00838f;
                    box-shadow: 0 0 0 1px #00838f; /* Focus ring effect */
                }
                .ie-tab-title {
                    font-size: var(--fs-md);
                    font-weight: 600;
                    color: #101828;
                    margin-bottom: 4px;
                }
                .ie-tab-card.active .ie-tab-title {
                    color: #0d3b3f;
                }
                .ie-tab-subtitle {
                    font-size: var(--fs-xs);
                    color: #64748b;
                }
                
                /* Responsive Behavior */
                @media (max-width: 1024px) {
                    .ie-tab-row {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .ie-tab-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 480px) {
                    .ie-tab-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <h1 className="ie-dashboard-title">Raw Material Dashboard</h1>

            <div className="ie-tab-row">
                {materials.map(mat => (
                    <div
                        key={mat.id}
                        className={`ie-tab-card ${selectedMaterial === mat.id ? 'active' : ''}`}
                        onClick={() => setSelectedMaterial(mat.id)}
                    >
                        <span className="ie-tab-title">{mat.title}</span>
                        <span className="ie-tab-subtitle">{mat.subtitle}</span>
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

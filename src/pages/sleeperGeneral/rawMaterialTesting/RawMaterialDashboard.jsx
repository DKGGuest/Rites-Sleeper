import React, { useState, useEffect } from 'react';
import CementTesting from './cement/CementTesting';
import AggregateTesting from './aggregates/AggregatesTesting';
import HtsWireTesting from './hts/HtsWireTesting';
import SgciInsertTesting from './sgci/SgciInsertTesting';
import WaterTesting from './water/WaterTesting';
import AdmixtureTesting from './admixture/AdmixtureTesting';
import { getAllCompletedCalls } from '../../../services/workflowService';
import { getStoredUser } from '../../../services/authService';

const RawMaterialDashboard = () => {
    const [selectedMaterial, setSelectedMaterial] = useState('cement');
    const [completedCalls, setCompletedCalls] = useState([]);
    const [enrichedData, setEnrichedData] = useState({}); // { requestId: details }
    const [loading, setLoading] = useState(true);
    const user = getStoredUser();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const calls = await getAllCompletedCalls();
                const callsList = Array.isArray(calls) ? calls : [];
                setCompletedCalls(callsList);
            } catch (err) {
                console.error("Failed to fetch calls:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedMaterial || completedCalls.length === 0) return;
            if (!user || !user.userId) return;

            const matInfo = materials.find(m => m.id === selectedMaterial);
            if (!matInfo) return;

            const relevantCalls = completedCalls.filter(call => 
                call.moduleId === matInfo.moduleId && 
                call.accessibleUserIds?.includes(parseInt(user.userId)) &&
                call.requestId
            );

            const missingCalls = relevantCalls.filter(call => !enrichedData[call.requestId]);
            if (missingCalls.length === 0) return;

            setLoading(true);
            const mapping = {
                'cement': 'cement',
                'aggregates': 'aggregates',
                'admixture': 'admixture',
                'hts-wire': 'hts-wire',
                'sgci': 'sgci-insert'
            };
            const typeVar = mapping[selectedMaterial];

            const detailsMap = { ...enrichedData };
            const fetchPromises = missingCalls.map(async (call) => {
                if (typeVar) {
                    const details = await import('../../../services/workflowService').then(m => m.getMaterialDetail(typeVar, call.requestId));
                    if (details) {
                        detailsMap[call.requestId] = details;
                    }
                }
            });

            await Promise.all(fetchPromises);
            setEnrichedData(detailsMap);
            setLoading(false);
        };
        fetchDetails();
    }, [selectedMaterial, completedCalls, user?.userId]);

    // Filter logic based on user requirements:
    // 1. Module ID must match (Cement: 6, Aggregates: 8, HTS: 5, SGCI: 9, Water: 10)
    // 2. Current user ID must be in accessibleUserIds
    const filterCalls = (moduleId) => {
        if (!user || !user.userId) return [];
        const currentId = parseInt(user.userId);
        return completedCalls.filter(call => 
            call.moduleId === moduleId && 
            call.accessibleUserIds?.includes(currentId)
        ).map(call => {
            const details = enrichedData[call.requestId] || {};
            return {
                ...call,
                // Common fields flattened
                vendor: details.manufacturer || details.source || 'N/A',
                consignmentNo: details.invoiceNumber || details.challanNumber || 'N/A',
                receivedDate: details.dateOfReceipt || 'N/A',
                // Material specific details kept for complex rendering
                details: details
            };
        });
    };

    const materials = [
        { id: 'cement', title: 'Cement Testing', subtitle: 'Periodic & New Batch', moduleId: 6 },
        { id: 'aggregates', title: 'Aggregate Testing', subtitle: 'Periodic & New Batch', moduleId: 8 },
        { id: 'admixture', title: 'Admixture Testing', subtitle: 'Periodic & New Batch', moduleId: 7 },
        { id: 'hts-wire', title: 'HTS Wire Testing', subtitle: 'Daily mandatory', moduleId: 5 },
        { id: 'sgci', title: 'SGCI Insert Testing', subtitle: 'Weekly summary', moduleId: 9 },
        { id: 'water', title: 'Water Testing', subtitle: 'PH & TDS monthly', moduleId: 10 }
    ];

    const renderContent = () => {
        if (loading) return <div className="loading-state">Loading testing data...</div>;

        switch (selectedMaterial) {
            case 'cement': 
                return <CementTesting 
                    onBack={() => setSelectedMaterial(null)} 
                    inventoryData={filterCalls(6)} 
                />;
            case 'aggregates': 
                return <AggregateTesting 
                    onBack={() => setSelectedMaterial(null)} 
                    inventoryData={filterCalls(8)} 
                />;
            case 'hts-wire': 
                return <HtsWireTesting 
                    onBack={() => setSelectedMaterial(null)} 
                    inventoryData={filterCalls(5)} 
                />;
            case 'sgci': 
                return <SgciInsertTesting 
                    onBack={() => setSelectedMaterial(null)} 
                    inventoryData={filterCalls(9)} 
                />;
            case 'admixture':
                return <AdmixtureTesting
                    onBack={() => setSelectedMaterial(null)}
                    inventoryData={filterCalls(7)}
                />;
            case 'water': 
                return <WaterTesting 
                    onBack={() => setSelectedMaterial(null)} 
                />;
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

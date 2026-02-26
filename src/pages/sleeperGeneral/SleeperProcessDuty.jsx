import React, { useState, useEffect } from 'react';
import { useShift } from '../../context/ShiftContext';
import { useBatchStats, useCompactionStats, useSteamStats, useWireTensionStats } from '../../hooks/useStats';

// Components
import DutySetup from '../../features/duty/components/DutySetup';
import DutyHeader from '../../features/duty/components/DutyHeader';
import ContainerForm from '../../features/duty/components/ContainerForm';
import DutyTabs from '../../features/duty/components/DutyTabs';
import FeatureToolbar from '../../features/duty/components/FeatureToolbar';

// Features
import BatchWeighment from '../../features/batch-weighment/BatchWeighment';
import ManualChecks from '../../features/manual-checks/ManualChecks';
import MoistureAnalysis from '../../features/moisture-analysis/MoistureAnalysis';
import WireTensioning from '../../features/wire-tensioning/WireTensioning';
import CompactionConcrete from '../../features/compaction-concrete/CompactionConcrete';
import MouldBenchCheck from '../../features/mould-bench-check/MouldBenchCheck';
import SteamCuring from '../../features/steam-curing/SteamCuring';
import SteamCubeTesting from '../../features/steam-cube-testing/SteamCubeTesting';
import RawMaterialInventory from '../../features/inventory/RawMaterialInventory';

import { apiService } from '../../services/api';
import './SleeperProcessDuty.css';

const SleeperProcessDuty = () => {
    const {
        dutyStarted,
        activeContainer,
        activeContainerId,
        setActiveContainerId,
        loadShiftData,
        moistureRecords,
        setMoistureRecords,
        testedRecords,
        setTestedRecords,
        steamRecords,
        setSteamRecords,
        manualCheckEntries,
        setManualCheckEntries,
        allBatchDeclarations,
        setAllBatchDeclarations,
        allSessionConfigs,
        setAllSessionConfigs,
        allWitnessedRecords,
        setAllWitnessedRecords,
        allTensionRecords,
        setAllTensionRecords,
        allCompactionRecords,
        setAllCompactionRecords,
        benchMouldCheckRecords,
        setBenchMouldCheckRecords,
        allBenchesMoulds,
        containers,
        newContainer,
        setNewContainer,
        containerValues,
        handleAddContainer,
        handleDeleteContainer
    } = useShift();

    const [activeTab, setActiveTab] = useState('Manual Checks');
    const [manualChecksAlert, setManualChecksAlert] = useState(true);
    const [moistureAlert, setMoistureAlert] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [detailView, setDetailView] = useState('dashboard');
    const [subModuleToOpen, setSubModuleToOpen] = useState(null);

    const [showContainerForm, setShowContainerForm] = useState(false);
    const [containerToDelete, setContainerToDelete] = useState(null);

    // Derived State for active container
    const witnessedRecords = allWitnessedRecords[activeContainerId] || [];
    const tensionRecords = allTensionRecords[activeContainerId] || [];
    const compactionRecords = allCompactionRecords[activeContainerId] || [];
    const batchDeclarations = allBatchDeclarations[activeContainerId] || [];
    const sessionConfig = allSessionConfigs[activeContainerId] || { sandType: 'River Sand', sensorStatus: 'working' };

    // Local Toggle states for forms
    const [showBatchEntryForm, setShowBatchEntryForm] = useState(false);
    const [showWireTensionForm, setShowWireTensionForm] = useState(false);
    const [showCompactionForm, setShowCompactionForm] = useState(false);
    const [showMouldBenchForm, setShowMouldBenchForm] = useState(false);

    useEffect(() => {
        loadShiftData();
    }, []);

    const tabs = [
        { id: 'Manual Checks', title: 'Manual Checks', description: 'Hourly plant & quality inspection', alert: manualChecksAlert },
        { id: 'Moisture Analysis', title: 'Moisture Analysis', description: 'Aggregate free moisture testing', alert: moistureAlert },
        { id: 'Batch Weighment', title: 'Batch Weighment', description: 'SCADA weight & manual verification' },
        { id: 'Wire Tensioning', title: 'Wire Tensioning', description: 'Long line wire pressure monitoring' },
        { id: 'Compaction of Concrete (Vibrator Report)', title: 'Compaction Performance', description: 'Scada vibrator frequency logs' },
        { id: 'Steam Curing', title: 'Steam Curing', description: 'Chamber temperature profile logs' },
        { id: 'Mould & Bench Checking', title: 'Mould & Bench Checking', description: 'Asset integrity & dimensional check' },
        { id: 'Steam Cube Testing', title: 'Steam Cube Testing', description: '7-hour & 28-day strength analysis' },
        { id: 'Raw Material Inventory', title: 'Inventory Levels', description: 'Daily stock & consumption tracking' }
    ];

    if (!dutyStarted) {
        return <DutySetup />;
    }

    const confirmDeleteContainer = () => {
        if (containerToDelete) {
            handleDeleteContainer(containerToDelete.id);
            setContainerToDelete(null);
        }
    };

    return (
        <div className="app-container">
            <div className="dashboard-container" style={{ padding: '24px' }}>
                <DutyHeader
                    setShowContainerForm={setShowContainerForm}
                    containers={containers}
                    activeContainerId={activeContainerId}
                    setActiveContainerId={setActiveContainerId}
                    handleDeleteContainer={(c) => setContainerToDelete(c)}
                />

                {showContainerForm && (
                    <ContainerForm
                        onClose={() => setShowContainerForm(false)}
                        newContainer={newContainer}
                        setNewContainer={setNewContainer}
                        containerValues={containerValues}
                        handleAddContainer={handleAddContainer}
                    />
                )}

                <div className="dashboard-content">
                    <DutyTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        witnessedRecordsCount={witnessedRecords.length}
                        moistureRecordsCount={moistureRecords.length}
                    />

                    <FeatureToolbar
                        activeTab={activeTab}
                        witnessedRecordsCount={witnessedRecords.length}
                        setShowBatchEntryForm={setShowBatchEntryForm}
                        setShowWireTensionForm={setShowWireTensionForm}
                        setShowCompactionForm={setShowCompactionForm}
                        setViewMode={setViewMode}
                        setDetailView={setDetailView}
                    />

                    {activeTab === 'Batch Weighment' && (
                        <div style={{ width: '100%' }}>
                            <BatchWeighment
                                displayMode="inline"
                                onBack={() => { }}
                                sharedState={{
                                    batchDeclarations,
                                    setAllBatchDeclarations: (data) => setAllBatchDeclarations(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data })),
                                    sessionConfig,
                                    setSessionConfig: (data) => setAllSessionConfigs(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || {}) : data })),
                                    witnessedRecords,
                                    setAllWitnessedRecords: (data) => setAllWitnessedRecords(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data }))
                                }}
                                activeContainer={activeContainer}
                                showEntryForm={showBatchEntryForm}
                                setShowEntryForm={setShowBatchEntryForm}
                                loadShiftData={loadShiftData}
                            />
                        </div>
                    )}

                    {activeTab === 'Wire Tensioning' && (
                        <div style={{ width: '100%' }}>
                            <WireTensioning
                                displayMode="inline"
                                onBack={() => { }}
                                batches={batchDeclarations}
                                sharedState={{
                                    tensionRecords,
                                    setTensionRecords: (data) => setAllTensionRecords(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data }))
                                }}
                                showForm={showWireTensionForm}
                                setShowForm={setShowWireTensionForm}
                                loadShiftData={loadShiftData}
                            />
                        </div>
                    )}

                    {activeTab === 'Moisture Analysis' && (
                        <div style={{ width: '100%', marginTop: '-1rem' }}>
                            <MoistureAnalysis
                                displayMode="inline"
                                onBack={() => { }}
                                onSave={() => {
                                    setMoistureAlert(false);
                                    loadShiftData();
                                }}
                                records={moistureRecords}
                                setRecords={setMoistureRecords}
                            />
                        </div>
                    )}

                    {activeTab === 'Compaction of Concrete (Vibrator Report)' && (
                        <div style={{ width: '100%', marginTop: '-1rem' }}>
                            <CompactionConcrete
                                displayMode="inline"
                                onBack={() => { }}
                                batches={batchDeclarations}
                                sharedState={{
                                    compactionRecords,
                                    setAllCompactionRecords: (data) => setAllCompactionRecords(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data }))
                                }}
                                showForm={showCompactionForm}
                                setShowForm={setShowCompactionForm}
                            />
                        </div>
                    )}

                    {activeTab === 'Mould & Bench Checking' && (
                        <div style={{ width: '100%' }}>
                            <MouldBenchCheck
                                isInline={true}
                                onBack={() => { }}
                                sharedState={{
                                    records: benchMouldCheckRecords,
                                    setRecords: setBenchMouldCheckRecords,
                                    allAssets: allBenchesMoulds
                                }}
                                activeContainer={activeContainer}
                                showForm={showMouldBenchForm}
                                setShowForm={setShowMouldBenchForm}
                            />
                        </div>
                    )}

                    {activeTab === 'Steam Curing' && (
                        <div style={{ width: '100%', marginTop: '-1rem' }}>
                            <SteamCuring
                                displayMode="inline"
                                onBack={() => { }}
                                steamRecords={steamRecords}
                                setSteamRecords={setSteamRecords}
                                batches={batchDeclarations}
                            />
                        </div>
                    )}

                    {activeTab === 'Steam Cube Testing' && (
                        <SteamCubeTesting
                            testedRecords={testedRecords}
                            setTestedRecords={setTestedRecords}
                            activeContainer={activeContainer}
                        />
                    )}

                    {activeTab === 'Raw Material Inventory' && (
                        <div style={{ width: '100%' }}>
                            <RawMaterialInventory displayMode="inline" />
                        </div>
                    )}

                    {activeTab === 'Manual Checks' && (
                        <div style={{ width: '100%', marginTop: '-1rem' }}>
                            <ManualChecks
                                isInline={true}
                                onBack={() => { }}
                                activeContainer={activeContainer}
                                sharedState={{ entries: manualCheckEntries, setEntries: setManualCheckEntries }}
                                onAlertChange={setManualChecksAlert}
                            />
                        </div>
                    )}
                </div>

                {detailView === 'detail_modal' && (
                    <div className="modal-container-wrapper">
                        {activeTab === 'Batch Weighment' ? (
                            <BatchWeighment
                                onBack={() => setDetailView('dashboard')}
                                sharedState={{
                                    batchDeclarations,
                                    setAllBatchDeclarations: (data) => setAllBatchDeclarations(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data })),
                                    sessionConfig,
                                    setSessionConfig: (data) => setAllSessionConfigs(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || {}) : data })),
                                    witnessedRecords,
                                    setAllWitnessedRecords: (data) => setAllWitnessedRecords(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data }))
                                }}
                                activeContainer={activeContainer}
                                loadShiftData={loadShiftData}
                            />
                        ) : activeTab === 'Manual Checks' ? (
                            <ManualChecks
                                onBack={() => { setDetailView('dashboard'); setSubModuleToOpen(null); }}
                                onAlertChange={setManualChecksAlert}
                                activeContainer={activeContainer}
                                initialSubModule={subModuleToOpen}
                                initialViewMode={viewMode}
                                sharedState={{ entries: manualCheckEntries, setEntries: setManualCheckEntries }}
                            />
                        ) : activeTab === 'Moisture Analysis' ? (
                            <MoistureAnalysis
                                onBack={() => setDetailView('dashboard')}
                                onSave={() => {
                                    setMoistureAlert(false);
                                    loadShiftData();
                                }}
                                initialView={viewMode}
                                records={moistureRecords}
                                setRecords={setMoistureRecords}
                            />
                        ) : activeTab === 'Wire Tensioning' ? (
                            <WireTensioning
                                onBack={() => setDetailView('dashboard')}
                                batches={batchDeclarations}
                                sharedState={{
                                    tensionRecords,
                                    setTensionRecords: (data) => setAllTensionRecords(prev => ({ ...prev, [activeContainerId]: typeof data === 'function' ? data(prev[activeContainerId] || []) : data }))
                                }}
                                loadShiftData={loadShiftData}
                            />
                        ) : activeTab === 'Compaction of Concrete (Vibrator Report)' ? (
                            <CompactionConcrete onBack={() => setDetailView('dashboard')} onSave={() => { }} />
                        ) : activeTab === 'Mould & Bench Checking' ? (
                            <MouldBenchCheck
                                onBack={() => setDetailView('dashboard')}
                                sharedState={{
                                    records: benchMouldCheckRecords,
                                    setRecords: setBenchMouldCheckRecords,
                                    allAssets: allBenchesMoulds
                                }}
                                initialModule={subModuleToOpen}
                                initialViewMode={viewMode}
                            />
                        ) : activeTab === 'Steam Curing' ? (
                            <SteamCuring
                                onBack={() => setDetailView('dashboard')}
                                steamRecords={steamRecords}
                                setSteamRecords={setSteamRecords}
                                batches={batchDeclarations}
                            />
                        ) : activeTab === 'Steam Cube Testing' ? (
                            <SteamCubeTesting
                                onBack={() => setDetailView('dashboard')}
                                testedRecords={testedRecords}
                                setTestedRecords={setTestedRecords}
                            />
                        ) : activeTab === 'Raw Material Inventory' && (
                            <RawMaterialInventory onBack={() => setDetailView('dashboard')} />
                        )}
                    </div>
                )}
            </div>

            {/* Global Custom Alert Dialog for Container Deletion */}
            {containerToDelete && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="fade-in" style={{
                        width: '320px',
                        background: '#fff',
                        borderRadius: '24px',
                        padding: '2rem',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto',
                            color: '#ef4444',
                            fontSize: '24px'
                        }}>!</div>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Confirm Removal</h3>
                        <p style={{ margin: '0 0 2rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
                            Are you sure you want to remove <strong>{containerToDelete.name}</strong>? All temporary shift records for this section will be cleared.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setContainerToDelete(null)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    color: '#64748b',
                                    fontWeight: '800',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >Cancel</button>
                            <button
                                onClick={confirmDeleteContainer}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontWeight: '800',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                                }}
                            >Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SleeperProcessDuty;

import React, { useState, useMemo } from 'react';
import { useBatchStats, useCompactionStats, useSteamStats, useWireTensionStats } from '../../hooks/useStats';
import BatchWeighment from '../../features/batch-weighment/BatchWeighment';
import ManualChecks from '../../features/manual-checks/ManualChecks';
import MoistureAnalysis from '../../features/moisture-analysis/MoistureAnalysis';
import WireTensioning from '../../features/wire-tensioning/WireTensioning';
import CompactionConcrete from '../../features/compaction-concrete/CompactionConcrete';
import MouldBenchCheck from '../../features/mould-bench-check/MouldBenchCheck';
import SteamCuring from '../../features/steam-curing/SteamCuring';
import SteamCubeTesting from '../../features/steam-cube-testing/SteamCubeTesting';
import WireTensionStats from '../../features/wire-tensioning/components/WireTensionStats';
import './SleeperProcessDuty.css';

const SleeperProcessDuty = () => {
    const [dutyStarted, setDutyStarted] = useState(false);
    const [activeTab, setActiveTab] = useState('Manual Checks');
    const [manualChecksAlert, setManualChecksAlert] = useState(true);
    const [moistureAlert, setMoistureAlert] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [detailView, setDetailView] = useState('dashboard');
    const [subModuleToOpen, setSubModuleToOpen] = useState(null);

    // Container (Shed/Line) Management
    const [containers, setContainers] = useState([{ id: 1, type: 'Line', name: 'Line I' }]);
    const [activeContainerId, setActiveContainerId] = useState(1);
    const [showContainerForm, setShowContainerForm] = useState(false);
    const [newContainer, setNewContainer] = useState({ type: 'Line', value: 'Line I' });

    const containerValues = {
        'Line': ['Line I', 'Line II', 'Line III', 'Line IV'],
        'Shed': ['Shed I', 'Shed II', 'Shed III', 'Shed IV']
    };

    // Shared State per Container (Mapped by container Id)
    // Initial data for the first container
    const initialBatchDeclarations = [
        {
            id: 1,
            batchNo: '601',
            setValues: { ca1: 431, ca2: 176, fa: 207, cement: 175, water: 36.2, admixture: 1.400 },
            adjustedWeights: { ca1: 436.2, ca2: 178.6, fa: 207.1, cement: 175.5, water: 37.0, admixture: 1.440 },
            proportionMatch: 'OK'
        }
    ];

    const [allWitnessedRecords, setAllWitnessedRecords] = useState({
        1: [
            { id: 1, time: '08:15', batchNo: '601', ca1: 434, ca2: 177, fa: 208, cement: 175.2, water: 36.8, admixture: 1.42, source: 'Scada Witnessed', location: 'Line I', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: 2, time: '09:30', batchNo: '601', ca1: 437, ca2: 179, fa: 206, cement: 175.8, water: 37.2, admixture: 1.45, source: 'Manual', location: 'Line I', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            { id: 3, time: '10:45', batchNo: '601', ca1: 435, ca2: 178, fa: 207.5, cement: 175.3, water: 36.9, admixture: 1.43, source: 'Scada Witnessed', location: 'Line I', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
        ]
    });
    const [allTensionRecords, setAllTensionRecords] = useState({
        1: [
            { id: 1, time: '10:05', batchNo: '601', benchNo: '401', finalLoad: 732, wires: 18, source: 'Scada' },
            { id: 2, time: '10:12', batchNo: '601', benchNo: '402', finalLoad: 728, wires: 18, source: 'Scada' },
        ]
    });
    const [allBatchDeclarations, setAllBatchDeclarations] = useState({ 1: initialBatchDeclarations });

    // For simplicity in this demo, we'll derive the active states
    const witnessedRecords = allWitnessedRecords[activeContainerId] || [];
    const tensionRecords = allTensionRecords[activeContainerId] || [];
    const batchDeclarations = allBatchDeclarations[activeContainerId] || initialBatchDeclarations;

    // Setters that update the specific container state
    const setWitnessedRecords = (newRecords) => {
        setAllWitnessedRecords(prev => ({
            ...prev,
            [activeContainerId]: typeof newRecords === 'function' ? newRecords(prev[activeContainerId] || []) : newRecords
        }));
    };

    const setTensionRecords = (newRecords) => {
        setAllTensionRecords(prev => ({
            ...prev,
            [activeContainerId]: typeof newRecords === 'function' ? newRecords(prev[activeContainerId] || []) : newRecords
        }));
    };

    const setBatchDeclarations = (newDecls) => {
        setAllBatchDeclarations(prev => ({
            ...prev,
            [activeContainerId]: typeof newDecls === 'function' ? newDecls(prev[activeContainerId] || []) : newDecls
        }));
    };


    const [selectedBatchNo, setSelectedBatchNo] = useState('601');

    const [selectedManualTabModule, setSelectedManualTabModule] = useState('mouldPrep');
    const [selectedMouldBenchModule, setSelectedMouldBenchModule] = useState('summary');

    const [compactionRecords, setCompactionRecords] = useState([
        { id: 101, time: '09:15:22', batchNo: '605', benchNo: '1', rpm: 9005, duration: 45, vibratorId: 'VIB-01', tachoCount: 4, workingTachos: 4 },
        { id: 102, time: '09:16:45', batchNo: '605', benchNo: '1', rpm: 8900, duration: 48, vibratorId: 'VIB-02', tachoCount: 4, workingTachos: 4 },
        { id: 103, time: '09:18:10', batchNo: '605', benchNo: '2', rpm: 9150, duration: 42, vibratorId: 'VIB-03', tachoCount: 4, workingTachos: 3 },
    ]);
    const [selectedCompactionBatch, setSelectedCompactionBatch] = useState('605');
    const [selectedTensionBatch, setSelectedTensionBatch] = useState('601');

    const [testedRecords, setTestedRecords] = useState([
        { id: 101, cubeNo: '301B', batchNo: 608, grade: 'M55', strength: '42.5', testDate: '2026-01-30', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 102, cubeNo: '405H', batchNo: 611, grade: 'M60', strength: '51.2', testDate: '2026-01-30', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    ]);

    const [moistureRecords, setMoistureRecords] = useState([
        { id: 1, date: '2026-01-30', shift: 'A', timing: '08:30', ca1Free: '1.20', ca2Free: '0.80', faFree: '3.20', totalFree: '5.20', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 2, date: '2026-01-30', shift: 'A', timing: '07:15', ca1Free: '1.10', ca2Free: '0.95', faFree: '2.90', totalFree: '4.95', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
        { id: 3, date: '2026-01-29', shift: 'C', timing: '20:15', ca1Free: '1.35', ca2Free: '0.75', faFree: '3.40', totalFree: '5.50', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
        { id: 4, date: '2026-01-29', shift: 'B', timing: '14:00', ca1Free: '1.25', ca2Free: '0.85', faFree: '3.10', totalFree: '5.20', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
    ]);
    const [steamRecords, setSteamRecords] = useState([
        { id: 1, batchNo: '601', chamberNo: '1', date: '2026-01-20', preDur: 2.25, risePeriod: 2.25, riseRate: 13.3, constTemp: 58, constDur: 4.0, coolDur: 2.5, coolRate: 11.2 },
    ]);
    const [selectedSteamBatch, setSelectedSteamBatch] = useState('601');

    // Mould & Bench Checking Data
    const [benchMouldCheckRecords, setBenchMouldCheckRecords] = useState([
        { id: 1, type: 'Bench', assetNo: '210-A', dateOfChecking: '2026-01-30', checkTime: '10:30', visualResult: 'ok', dimensionResult: 'ok', overallResult: 'OK', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), lastCasting: '2026-01-25', sleeperType: 'RT-1234' },
        { id: 2, type: 'Bench', assetNo: '210', dateOfChecking: '2026-01-30', checkTime: '11:15', visualResult: 'ok', dimensionResult: 'ok', overallResult: 'OK', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), lastCasting: '2026-01-29', sleeperType: 'RT-1234' },
        { id: 3, type: 'Mould', assetNo: 'M-205', dateOfChecking: '2026-01-29', checkTime: '14:20', visualResult: 'ok', dimensionResult: 'not-ok', overallResult: 'FAIL', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), lastCasting: '2026-01-29', sleeperType: 'RT-1234' }
    ]);

    const [allBenchesMoulds, setAllBenchesMoulds] = useState([
        { id: 1, type: 'Bench', name: 'Bench 210-A', lastCasting: '2026-01-25', lastChecking: '2026-01-30' },
        { id: 2, type: 'Bench', name: 'Twin Bench-210', lastCasting: '2026-01-29', lastChecking: '2026-01-30' },
        { id: 3, type: 'Bench', name: 'Bench 211-B', lastCasting: '2026-01-28', lastChecking: '2026-01-15' },
        { id: 4, type: 'Mould', name: 'Mould M-101', lastCasting: '2025-12-15', lastChecking: '2025-11-20' },
        { id: 5, type: 'Mould', name: 'Mould M-205', lastCasting: '2026-01-29', lastChecking: '2026-01-29' },
        { id: 6, type: 'Mould', name: 'Mould M-310', lastCasting: '2026-01-30', lastChecking: '2026-01-28' }
    ]);

    const [manualCheckEntries, setManualCheckEntries] = useState({
        mouldPrep: [
            { id: 1, time: '08:30', benchNo: '12', lumpsFree: true, oilApplied: true, timestamp: new Date().toISOString() },
            { id: 2, time: '09:45', benchNo: '14', lumpsFree: true, oilApplied: true, timestamp: new Date().toISOString() }
        ],
        htsWire: [
            { id: 1, time: '09:00', benchNo: '12', wiresUsed: 32, satisfactory: true, timestamp: new Date().toISOString() }
        ],
        demoulding: []
    });

    const [manualEditEntry, setManualEditEntry] = useState(null);
    const [showMoistureConsole, setShowMoistureConsole] = useState(false);
    const [showSteamConsole, setShowSteamConsole] = useState(false);
    const [showCompactionConsole, setShowCompactionConsole] = useState(false);
    const [showBatchConsole, setShowBatchConsole] = useState(false);
    const [showWireConsole, setShowWireConsole] = useState(false);
    const [showBatchEntryForm, setShowBatchEntryForm] = useState(false);
    const [showWireTensionForm, setShowWireTensionForm] = useState(false);
    const [showMouldBenchForm, setShowMouldBenchForm] = useState(false);

    const handleManualDelete = (subModule, id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setManualCheckEntries(prev => ({
                ...prev,
                [subModule]: prev[subModule].filter(e => e.id !== id)
            }));
        }
    };


    // Use Custom Hooks for Stats
    const batchStats = useBatchStats(witnessedRecords, batchDeclarations, selectedBatchNo);
    const compactionStats = useCompactionStats(compactionRecords, selectedCompactionBatch);
    const steamStats = useSteamStats(steamRecords, selectedSteamBatch);
    const wireTensionStats = useWireTensionStats(tensionRecords, selectedTensionBatch);

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

    const handleAddContainer = () => {
        const id = Date.now();
        setContainers(prev => [...prev, { id, type: newContainer.type, name: newContainer.value }]);
        setActiveContainerId(id);
        setShowContainerForm(false);
    };

    const handleDeleteContainer = (id, name, e) => {
        if (e) e.stopPropagation();
        if (containers.length <= 1) {
            alert("At least one Line or Shed must be active for duty.");
            return;
        }
        if (window.confirm(`Are you sure you want to remove ${name}? All temporary shift data for this section will be cleared.`)) {
            setContainers(prev => {
                const filtered = prev.filter(c => c.id !== id);
                if (activeContainerId === id) {
                    setActiveContainerId(filtered[0]?.id || null);
                }
                return filtered;
            });
        }
    };

    if (!dutyStarted) {
        const activeContainer = containers.find(c => c.id === activeContainerId);
        return (
            <div className="duty-welcome-screen app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', background: '#f8fafc' }}>
                <div className="duty-welcome-card" style={{ maxWidth: '440px', width: '92%', padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 'var(--fs-lg)', marginBottom: '0.75rem', fontWeight: '900', color: '#42818c', textTransform: 'uppercase', letterSpacing: '3px' }}>Shift Log</div>
                    <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#42818c', margin: '0 0 8px 0' }}>Sleeper Process Duty</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 'var(--fs-sm)' }}>Real-time production monitoring and quality control</p>
                    <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: 'var(--fs-xs)', fontWeight: '500' }}>Confirm your working line or shed to initialize today's duty</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '2rem' }}>
                        {containers.map(c => (
                            <div key={c.id} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setActiveContainerId(c.id)}
                                    className="hover-lift"
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        border: activeContainerId === c.id ? '2px solid #42818c' : '1px solid #e2e8f0',
                                        background: activeContainerId === c.id ? '#f0f9fa' : '#fff',
                                        color: activeContainerId === c.id ? '#42818c' : '#64748b',
                                        fontSize: 'var(--fs-xs)',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        minWidth: '100px',
                                        boxShadow: activeContainerId === c.id ? '0 4px 6px -1px rgba(66, 129, 140, 0.1)' : 'none'
                                    }}
                                >
                                    {c.name}
                                </button>
                                <button
                                    onClick={(e) => handleDeleteContainer(c.id, c.name, e)}
                                    style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: '#fff',
                                        color: '#ef4444',
                                        border: '1px solid #fee2e2',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                >×</button>
                            </div>
                        ))}
                        {!showContainerForm && (
                            <button
                                onClick={() => setShowContainerForm(true)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: '1px dashed #cbd5e1',
                                    background: '#f8fafc',
                                    color: '#64748b',
                                    fontSize: 'var(--fs-xs)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >+ New</button>
                        )}
                    </div>

                    {showContainerForm && (
                        <div className="fade-in" style={{
                            background: '#f8fafc',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            marginBottom: '2rem',
                            border: '1px solid #e2e8f0',
                            textAlign: 'left',
                            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Type</label>
                                    <select
                                        value={newContainer.type}
                                        onChange={e => setNewContainer({ ...newContainer, type: e.target.value, value: containerValues[e.target.value][0] })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                                    >
                                        <option value="Line">Line</option>
                                        <option value="Shed">Shed</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Identity</label>
                                    <select
                                        value={newContainer.value}
                                        onChange={e => setNewContainer({ ...newContainer, value: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                                    >
                                        {containerValues[newContainer.type].map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="toggle-btn" style={{ flex: 2, padding: '12px', fontSize: 'var(--fs-xs)', fontWeight: '800' }} onClick={handleAddContainer}>Add Now</button>
                                <button className="toggle-btn secondary" style={{ flex: 1, padding: '12px', fontSize: 'var(--fs-xs)', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: '800' }} onClick={() => setShowContainerForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <button
                        className="toggle-btn hover-lift"
                        style={{ width: '100%', padding: '1rem', fontSize: 'var(--fs-sm)', fontWeight: '900', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        onClick={() => {
                            if (!activeContainerId) alert("Please select a line or shed to continue.");
                            else setDutyStarted(true);
                        }}
                    >
                        Start Duty {activeContainer ? `for ${activeContainer.name}` : ''}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="dashboard-container" style={{ padding: '24px' }}>
                <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#42818c', margin: '0 0 8px 0' }}>Sleeper Process Duty</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 'var(--fs-sm)' }}>Real-time production monitoring & quality control</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', gap: '2px', border: '1px solid #e2e8f0' }}>
                            {containers.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveContainerId(c.id)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: activeContainerId === c.id ? '#fff' : 'transparent',
                                        color: activeContainerId === c.id ? '#42818c' : '#64748b',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: activeContainerId === c.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                        <button className="btn-secondary" onClick={() => setShowContainerForm(true)} style={{ padding: '8px 12px', fontSize: '0.75rem' }}>+ Add</button>
                    </div>
                </header>

                {showContainerForm && (
                    <div className="container-form-overlay" style={{
                        marginBottom: '2rem',
                        padding: '1.25rem',
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                        animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add New Shed or Line</h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div className="form-field" style={{ margin: 0, flex: '1 1 140px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Select Type</label>
                                <select
                                    value={newContainer.type}
                                    onChange={e => setNewContainer({ ...newContainer, type: e.target.value, value: containerValues[e.target.value][0] })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                                >
                                    <option value="Line">Line</option>
                                    <option value="Shed">Shed</option>
                                </select>
                            </div>
                            <div className="form-field" style={{ margin: 0, flex: '1 1 140px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Select Specific</label>
                                <select
                                    value={newContainer.value}
                                    onChange={e => setNewContainer({ ...newContainer, value: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                                >
                                    {containerValues[newContainer.type].map(val => <option key={val} value={val}>{val}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flex: '2 1 200px' }}>
                                <button className="toggle-btn" style={{ flex: 1, padding: '10px', fontSize: 'var(--fs-xs)' }} onClick={handleAddContainer}>Add Now</button>
                                <button className="toggle-btn secondary" style={{ flex: 1, padding: '10px', fontSize: 'var(--fs-xs)', background: '#94a3b8' }} onClick={() => setShowContainerForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub-navigation Card Grid - IE-General Style */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: activeTab === tab.id ? '#f0f9fa' : 'white',
                                border: `2px solid ${activeTab === tab.id ? '#42818c' : '#e2e8f0'}`,
                                borderRadius: '16px',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(66, 129, 140, 0.1)' : 'none',
                                transform: activeTab === tab.id ? 'translateY(-2px)' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '100px'
                            }}
                        >
                            <div>
                                <h3 style={{
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    color: activeTab === tab.id ? '#42818c' : '#334155',
                                    marginBottom: '4px',
                                    margin: 0
                                }}>
                                    {tab.title}
                                </h3>
                                <p style={{ fontSize: '10px', color: '#64748b', margin: 0, fontWeight: '500' }}>{tab.description}</p>
                            </div>

                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: activeTab === tab.id ? '#42818c' : '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {tab.id === 'Batch Weighment' ? `${witnessedRecords.length} Witnessed` :
                                        tab.id === 'Moisture Analysis' ? '4 Logs Today' :
                                            tab.id === 'Compaction of Concrete (Vibrator Report)' ? 'Scada Live' : 'Active'}
                                </span>
                                {activeTab === tab.id && (
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#42818c' }}></span>
                                )}
                            </div>

                            {tab.alert && (
                                <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                                }}>!</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="dashboard-detail-view" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '24px', borderRadius: '20px' }}>
                    <div className="duty-section-toolbar" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {activeTab !== 'Steam Cube Testing' && (
                                <h2 className="duty-section-title" style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>{activeTab}</h2>
                            )}
                            {activeTab === 'Batch Weighment' && <span className="badge-count" style={{ marginLeft: 0, fontSize: '10px' }}>{witnessedRecords.length}</span>}
                        </div>
                        {activeTab === 'Batch Weighment' && (
                            <button className="toggle-btn" onClick={() => setShowBatchEntryForm(true)}>
                                + Add New Entry
                            </button>
                        )}
                        {activeTab === 'Wire Tensioning' && (
                            <button className="toggle-btn" onClick={() => setShowWireTensionForm(true)}>
                                + Add New Entry
                            </button>
                        )}
                        {!(activeTab === 'Mould & Bench Checking' || activeTab === 'Manual Checks' || activeTab === 'Steam Cube Testing' || activeTab === 'Batch Weighment' || activeTab === 'Wire Tensioning' || activeTab === 'Compaction of Concrete (Vibrator Report)' || activeTab === 'Steam Curing') && (
                            <button className="toggle-btn" style={{ fontSize: '0.7rem' }} onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>
                                {activeTab === 'Raw Material Inventory' ? 'Open Inventory Console' :
                                    activeTab === 'Moisture Analysis' ? 'New Analysis Entry' : 'New Entry'}
                            </button>
                        )}
                        {activeTab === 'Mould & Bench Checking' && (
                            <div style={{ background: '#f0fdf4', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }}></div>
                                ASSET CONSOLE ACTIVE
                            </div>
                        )}
                    </div>


                    <div style={{ marginTop: '3rem' }}>
                        {activeTab === 'Batch Weighment' && (
                            <div style={{ width: '100%', marginTop: '-1rem' }}>
                                <BatchWeighment
                                    onBack={() => { }}
                                    activeContainer={containers.find(c => c.id === activeContainerId)}
                                    sharedState={{ batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords }}
                                    displayMode="inline"
                                    showForm={showBatchEntryForm}
                                    setShowForm={setShowBatchEntryForm}
                                />
                            </div>
                        )}

                        {activeTab === 'Moisture Analysis' && (
                            <div style={{ width: '100%' }}>
                                <MoistureAnalysis
                                    displayMode="inline"
                                    onBack={() => { }}
                                    onSave={() => setMoistureAlert(false)}
                                    initialView="list"
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
                                    onSave={() => { }}
                                />
                            </div>
                        )}

                        {activeTab === 'Wire Tensioning' && (
                            <div style={{ width: '100%', marginTop: '-1rem' }}>
                                <WireTensioning
                                    onBack={() => { }}
                                    batches={batchDeclarations}
                                    sharedState={{ tensionRecords, setTensionRecords }}
                                    displayMode="inline"
                                    showForm={showWireTensionForm}
                                    setShowForm={setShowWireTensionForm}
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
                                />
                            </div>
                        )}

                        {activeTab === 'Steam Cube Testing' && (
                            <SteamCubeTesting
                                testedRecords={testedRecords}
                                setTestedRecords={setTestedRecords}
                            />
                        )}

                        {activeTab === 'Raw Material Inventory' && (
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #8b5cf6', padding: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>Cement (OPC-53)</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>120.5 MT</div>
                                        <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '0.4rem', fontWeight: '700' }}>3 Days Stock</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #3b82f6', padding: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>20mm Aggregate</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>450.0 MT</div>
                                        <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '0.4rem', fontWeight: '700' }}>Full Capacity</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #3b82f6', padding: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>10mm Aggregate</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>320.3 MT</div>
                                        <div style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: '0.4rem', fontWeight: '700' }}>Low Stock</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #f59e0b', padding: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: '600' }}>Admixture</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>2,400 L</div>
                                        <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '0.4rem', fontWeight: '700' }}>OK</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Manual Checks' && (
                            <div style={{ width: '100%', marginTop: '-1rem' }}>
                                <ManualChecks
                                    isInline={true}
                                    onBack={() => { }}
                                    activeContainer={containers.find(c => c.id === activeContainerId)}
                                    sharedState={{ entries: manualCheckEntries, setEntries: setManualCheckEntries }}
                                    onAlertChange={setManualChecksAlert}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {detailView === 'detail_modal' && (
                    <div className="modal-container-wrapper">
                        {activeTab === 'Batch Weighment' ? (
                            <BatchWeighment
                                onBack={() => setDetailView('dashboard')}
                                sharedState={{ batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords }}
                                activeContainer={containers.find(c => c.id === activeContainerId)}
                            />
                        ) : activeTab === 'Manual Checks' ? (
                            <ManualChecks
                                onBack={() => { setDetailView('dashboard'); setSubModuleToOpen(null); }}
                                onAlertChange={setManualChecksAlert}
                                activeContainer={containers.find(c => c.id === activeContainerId)}
                                initialSubModule={subModuleToOpen}
                                initialViewMode={viewMode}
                                sharedState={{ entries: manualCheckEntries, setEntries: setManualCheckEntries }}
                                initialEditData={manualEditEntry}
                            />
                        ) : activeTab === 'Moisture Analysis' ? (
                            <MoistureAnalysis
                                onBack={() => setDetailView('dashboard')}
                                onSave={() => setMoistureAlert(false)}
                                initialView={viewMode}
                                records={moistureRecords}
                                setRecords={setMoistureRecords}
                            />
                        ) : activeTab === 'Wire Tensioning' ? (
                            <WireTensioning
                                onBack={() => setDetailView('dashboard')}
                                batches={batchDeclarations}
                                sharedState={{ tensionRecords, setTensionRecords }}
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
                            />
                        ) : activeTab === 'Steam Cube Testing' ? (
                            <SteamCubeTesting
                                onBack={() => setDetailView('dashboard')}
                                testedRecords={testedRecords}
                                setTestedRecords={setTestedRecords}
                            />
                        ) : activeTab === 'Raw Material Inventory' ? (
                            <div className="section-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2>Raw Material Inventory</h2>
                                    <button className="toggle-btn secondary" onClick={() => setDetailView('dashboard')}>Close</button>
                                </div>
                                <p style={{ color: '#64748b' }}>Detailed inventory management module coming soon.</p>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {showMoistureConsole && (
                <MoistureAnalysis
                    displayMode="modal"
                    onBack={() => setShowMoistureConsole(false)}
                    onSave={() => {
                        setShowMoistureConsole(false);
                        setMoistureAlert(false);
                    }}
                    records={moistureRecords}
                    setRecords={setMoistureRecords}
                />
            )}

            {showSteamConsole && (
                <SteamCuring
                    displayMode="modal"
                    onBack={() => setShowSteamConsole(false)}
                    steamRecords={steamRecords}
                    setSteamRecords={setSteamRecords}
                />
            )}

            {showCompactionConsole && (
                <CompactionConcrete
                    displayMode="modal"
                    onBack={() => setShowCompactionConsole(false)}
                    onSave={() => { }}
                />
            )}
        </div>
    );
};

export default SleeperProcessDuty;

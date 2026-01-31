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

    const [allWitnessedRecords, setAllWitnessedRecords] = useState({ 1: [] });
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
        { id: 1, type: 'Bench', name: 'Bench 210-A', checkDate: '2026-01-30', checkTime: '10:30', visualCheck: 'OK', dimensionalCheck: 'OK', result: 'OK', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 2, type: 'Bench', name: 'Twin Bench-210', checkDate: '2026-01-30', checkTime: '11:15', visualCheck: 'OK', dimensionalCheck: 'OK', result: 'OK', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        { id: 3, type: 'Mould', name: 'Mould M-205', checkDate: '2026-01-29', checkTime: '14:20', visualCheck: 'OK', dimensionalCheck: 'Minor Issue', result: 'OK', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() }
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
        demoulding: [
            { id: 1, time: '11:15', benchNo: '10', processSatisfactory: true, timestamp: new Date().toISOString() }
        ]
    });


    // Use Custom Hooks for Stats
    const batchStats = useBatchStats(witnessedRecords, batchDeclarations, selectedBatchNo);
    const compactionStats = useCompactionStats(compactionRecords, selectedCompactionBatch);
    const steamStats = useSteamStats(steamRecords, selectedSteamBatch);
    const wireTensionStats = useWireTensionStats(tensionRecords, selectedTensionBatch);

    const tabs = [
        { title: 'Manual Checks', subtitle: 'Hourly inspection', alert: manualChecksAlert },
        { title: 'Moisture Analysis', subtitle: 'Shift-wise samples', alert: moistureAlert },
        { title: 'Batch Weighment', subtitle: 'SCADA & Manual Sync' },
        { title: 'Wire Tensioning', subtitle: 'Pressure logs' },
        { title: 'Compaction of Concrete (Vibrator Report)', subtitle: 'Vibrator Report' },
        { title: 'Steam Curing', subtitle: 'Temp profiles' },
        { title: 'Mould & Bench Checking', subtitle: 'Plant Assets' },
        { title: 'Steam Cube Testing', subtitle: 'Strength Analysis' }
    ];

    const handleAddContainer = () => {
        const id = Date.now();
        setContainers(prev => [...prev, { id, type: newContainer.type, name: newContainer.value }]);
        setActiveContainerId(id);
        setShowContainerForm(false);
    };

    if (!dutyStarted) {
        return (
            <div className="duty-welcome-screen app-container">
                <div className="duty-welcome-card section-card">
                    <h1 style={{ marginBottom: '1rem', color: '#1e293b' }}>Sleeper Process Engineer – Shift</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Ready to start your shift duty?</p>
                    <button className="toggle-btn" style={{ width: '100%', padding: '1rem' }} onClick={() => setDutyStarted(true)}>
                        Start Duty
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="dashboard-title">Sleeper Process Duty – Shift</h1>
                    <p className="dashboard-subtitle">Real-time process monitoring and shift logs</p>
                </div>

                <div className="container-selector-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="container-toggles" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                        {containers.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveContainerId(c.id)}
                                className={activeContainerId === c.id ? 'active' : ''}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeContainerId === c.id ? '#42818c' : 'transparent',
                                    color: activeContainerId === c.id ? '#fff' : '#64748b',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <button
                        className="add-container-btn"
                        onClick={() => setShowContainerForm(true)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px dashed #42818c',
                            background: '#fff',
                            color: '#42818c',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        +
                    </button>
                </div>
            </header>

            {showContainerForm && (
                <div className="container-form-overlay" style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Add New Shed or Line</h4>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div className="form-field" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.7rem' }}>Select Type</label>
                            <select
                                value={newContainer.type}
                                onChange={e => setNewContainer({ ...newContainer, type: e.target.value, value: containerValues[e.target.value][0] })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="Line">Line</option>
                                <option value="Shed">Shed</option>
                            </select>
                        </div>
                        <div className="form-field" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.7rem' }}>Select Specific</label>
                            <select
                                value={newContainer.value}
                                onChange={e => setNewContainer({ ...newContainer, value: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                {containerValues[newContainer.type].map(val => <option key={val} value={val}>{val}</option>)}
                            </select>
                        </div>
                        <button className="toggle-btn" onClick={handleAddContainer}>Add Now</button>
                        <button className="toggle-btn secondary" onClick={() => setShowContainerForm(false)} style={{ background: '#94a3b8' }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="ie-tab-row">
                {tabs.map((tab) => (
                    <div
                        key={tab.title}
                        className={`ie-tab-card ${activeTab === tab.title ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.title)}
                    >
                        <span className="ie-tab-title">
                            {tab.title}
                        </span>
                        <span className="ie-tab-subtitle">{tab.subtitle}</span>
                        <div className="ie-tab-status">
                            <span style={{ fontSize: '12px' }}>●</span>
                            {tab.title === 'Batch Weighment' ? `${witnessedRecords.length} Witnessed` :
                                tab.title === 'Moisture Analysis' ? '4 Logs (Shift A)' :
                                    tab.title === 'Compaction of Concrete (Vibrator Report)' ? 'Live Monitoring' :
                                        tab.title === 'Wire Tensioning' ? 'Sync Active' : 'Online'}
                        </div>
                        {tab.alert && (
                            <span className="badge-count" style={{ position: 'absolute', top: '8px', right: '8px', margin: 0, padding: '2px 6px' }}>!</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="dashboard-detail-view" style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
                <div className="duty-section-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h2 className="duty-section-title">{activeTab} Record</h2>
                        {activeTab === 'Batch Weighment' && <span className="badge-count" style={{ marginLeft: 0 }}>{witnessedRecords.length}</span>}
                    </div>
                    {!(activeTab === 'Mould & Bench Checking' || activeTab === 'Manual Checks') && (
                        <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>
                            {activeTab === 'Wire Tensioning' ? 'Open Tensioning Console' :
                                activeTab === 'Steam Curing' ? 'Curing Console' :
                                    activeTab === 'Steam Cube Testing' ? 'Strength Test Console' : 'New Entry'}
                        </button>
                    )}
                    {activeTab === 'Mould & Bench Checking' && (
                        <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>
                            Open Asset Console
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '3rem' }}>
                    {/* Render Tab Specific Content Summary (Dashboard View) */}
                    {activeTab === 'Batch Weighment' && (
                        <>
                            <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#475569', marginBottom: '1.5rem' }}>Historical Statistics (Batch {selectedBatchNo})</h3>
                            <div className="rm-grid-cards" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                                {batchStats?.ingredientStats.map(stat => (
                                    <div key={stat.name} className="calc-card" style={{ flex: '0 0 160px', padding: '1rem' }}>
                                        <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>{stat.name} DEV</span>
                                        <div className="calc-value" style={{ fontSize: 'var(--fs-lg)', color: Math.abs(stat.meanDev) > 1 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {stat.meanDev > 0 ? '+' : ''}{stat.meanDev.toFixed(2)}%
                                        </div>
                                        <div style={{ fontSize: 'var(--fs-xxs)', color: '#94a3b8', marginTop: '0.2rem' }}>
                                            Std Dev: {stat.stdDev.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="data-table-section" style={{ marginTop: '1rem' }}>
                                <div className="table-title-bar">Recent Witnessed Logs</div>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Shed / Line No.</th>
                                            <th>Source of Data</th>
                                            <th>Time stamp</th>
                                            <th>Batch No.</th>
                                            <th>CA1 - Actual Wt.</th>
                                            <th>CA2 - Actual Wt.</th>
                                            <th>FA - Actual Wt.</th>
                                            <th>Cement - Actual Wt.</th>
                                            <th>Water (L) - Actual</th>
                                            <th>Admix - Actual Wt.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {witnessedRecords.filter(r => r.batchNo === selectedBatchNo).length === 0 ? (
                                            <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No records for this batch yet.</td></tr>
                                        ) : (
                                            witnessedRecords.filter(r => r.batchNo === selectedBatchNo).slice(0, 5).map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.location || 'N/A'}</td>
                                                    <td><span className={`status-pill ${r.source === 'Manual' ? 'manual' : 'witnessed'}`}>{r.source}</span></td>
                                                    <td>{r.time}</td>
                                                    <td><strong>{r.batchNo}</strong></td>
                                                    <td>{r.ca1 || '0'}</td>
                                                    <td>{r.ca2 || '0'}</td>
                                                    <td>{r.fa || '0'}</td>
                                                    <td>{r.cement}</td>
                                                    <td>{r.water}</td>
                                                    <td>{r.admixture || '0'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'Moisture Analysis' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: '#3b82f6' }}>●</span> Moisture Analysis Summary (Recent 10 Samples)</h3>
                                <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>Open Moisture Console</button>
                            </div>

                            <div className="data-table-section">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Shift</th><th>Timing</th><th>CA1 %</th><th>CA2 %</th><th>FA %</th><th>Total (Kg)</th><th>Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {moistureRecords.slice(0, 10).map(r => (
                                            <tr key={r.id}>
                                                <td>{r.date} ({r.shift})</td>
                                                <td>{r.timing}</td>
                                                <td>{r.ca1Free}%</td>
                                                <td>{r.ca2Free}%</td>
                                                <td>{r.faFree}%</td>
                                                <td style={{ fontWeight: 'bold' }}>{r.totalFree} Kg</td>
                                                <td><span className="status-pill witnessed">Lab</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Compaction of Concrete (Vibrator Report)' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: '#42818c' }}>●</span> SCADA Vibrator Performance Analysis (Batch {selectedCompactionBatch})</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>Open Vibrator Console</button>
                                    <select className="dash-select" value={selectedCompactionBatch} onChange={(e) => setSelectedCompactionBatch(e.target.value)}>
                                        {[...new Set(compactionRecords.map(r => r.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            {compactionStats && (
                                <>
                                    <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                        <div className="calc-card"><span className="mini-label">Records Received</span><div className="calc-value">{compactionStats.count}</div></div>
                                        <div className="calc-card"><span className="mini-label">Tacho Working</span><div className="calc-value" style={{ color: '#10b981' }}>{compactionStats.tachoWorkingPct.toFixed(0)}%</div></div>
                                        <div className="calc-card"><span className="mini-label">Mean RPM</span><div className="calc-value">{compactionStats.meanRpm.toFixed(0)}</div></div>
                                        <div className="calc-card"><span className="mini-label">Median RPM</span><div className="calc-value">{compactionStats.medianRpm.toFixed(0)}</div></div>
                                        <div className="calc-card"><span className="mini-label">Avg. Duration</span><div className="calc-value">{compactionStats.avgDuration.toFixed(1)}s</div></div>
                                        <div className="calc-card"><span className="mini-label">Std Dev (σ)</span><div className="calc-value">{compactionStats.stdDev.toFixed(2)}</div></div>
                                        <div className="calc-card"><span className="mini-label">% Within Spec</span><div className="calc-value" style={{ color: '#10b981' }}>{compactionStats.pctWithinSpec.toFixed(1)}%</div></div>
                                        <div className="calc-card"><span className="mini-label">% Above USL</span><div className="calc-value" style={{ color: '#ef4444' }}>{compactionStats.pctAboveUSL.toFixed(1)}%</div></div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Vibration Frequency Distribution</h4>
                                            <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                                                {[30, 45, 60, 85, 95, 80, 55, 40, 25, 10].map((h, i) => (
                                                    <div key={i} style={{ flex: 1, background: h > 80 ? '#10b981' : '#42818c', height: `${h}%`, borderRadius: '2px 2px 0 0' }}></div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '10px', color: '#64748b' }}>
                                                <span>8640 RPM</span>
                                                <span>9000 RPM</span>
                                                <span>9360 RPM</span>
                                            </div>
                                        </div>
                                        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Compaction Duration Variability</h4>
                                            <div style={{ height: '120px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: '#e2e8f0' }}></div>
                                                <div style={{ position: 'absolute', left: '10%', right: '10%', height: '40px', background: 'rgba(66, 129, 140, 0.1)', border: '1px dashed #42818c' }}></div>
                                                {[42, 45, 48, 44, 46, 43, 47, 45, 44, 46].map((d, i) => (
                                                    <div key={i} style={{
                                                        position: 'absolute',
                                                        left: `${i * 10}%`,
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: '#42818c',
                                                        transform: `translateY(${(d - 45) * 5}px)`
                                                    }}></div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '10px', color: '#64748b' }}>
                                                <span>Obs 1</span>
                                                <span>Timeline</span>
                                                <span>Obs {compactionStats.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'Wire Tensioning' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: 'var(--primary-color)' }}>●</span> SCADA Tensioning Performance (Batch {selectedTensionBatch})</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select className="dash-select" value={selectedTensionBatch} onChange={(e) => setSelectedTensionBatch(e.target.value)}>
                                        {[...new Set(tensionRecords.map(r => r.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            {wireTensionStats ? (
                                <WireTensionStats stats={wireTensionStats} />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b' }}>No tensioning data available for the selected batch.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Mould & Bench Checking' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: '#42818c' }}>●</span> Mould & Bench Checking</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                                {/* Summary Card */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #42818c', padding: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Summary</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                        <div className="calc-card" style={{ background: '#f0f9ff', border: '1px solid #42818c' }}>
                                            <span className="mini-label">Total Benches</span>
                                            <div className="calc-value" style={{ fontSize: '1.5rem' }}>60</div>
                                        </div>
                                        <div className="calc-card" style={{ background: '#f0f9ff', border: '1px solid #42818c' }}>
                                            <span className="mini-label">Total Moulds</span>
                                            <div className="calc-value" style={{ fontSize: '1.5rem' }}>240</div>
                                        </div>
                                        <div className="calc-card" style={{ background: '#f0fdf4', border: '1px solid #10b981' }}>
                                            <span className="mini-label">Benches Used (30d)</span>
                                            <div className="calc-value" style={{ fontSize: '1.5rem', color: '#10b981' }}>55</div>
                                        </div>
                                        <div className="calc-card" style={{ background: '#f0fdf4', border: '1px solid #10b981' }}>
                                            <span className="mini-label">Moulds Used (30d)</span>
                                            <div className="calc-value" style={{ fontSize: '1.5rem', color: '#10b981' }}>215</div>
                                        </div>
                                        <div className="calc-card" style={{ background: '#fffbeb', border: '1px solid #f59e0b' }}>
                                            <span className="mini-label">% Bench Checked</span>
                                            <div className="calc-value" style={{ fontSize: '1.5rem', color: '#f59e0b' }}>76.4%</div>
                                        </div>
                                        <div className="calc-card" style={{ background: '#fffbeb', border: '1px solid #f59e0b' }}>
                                            <span className="mini-label">% Mould Checked</span>
                                            <div className="calc-value" style={{ fontSize: '1.5rem', color: '#f59e0b' }}>78.1%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bench & Mould Checked Card */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Bench & Mould Checked</h4>
                                        <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>+ Add New</button>
                                    </div>
                                    <div className="log-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {benchMouldCheckRecords.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>No checks recorded yet.</div>
                                        ) : (
                                            benchMouldCheckRecords.map(record => {
                                                const isEditable = (() => {
                                                    const diffMs = Date.now() - new Date(record.timestamp).getTime();
                                                    return diffMs < (1 * 60 * 60 * 1000); // 1 hour
                                                })();
                                                return (
                                                    <div key={record.id} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        padding: '0.75rem',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: isEditable ? '#fefce8' : 'transparent',
                                                        borderRadius: '6px',
                                                        marginBottom: '0.5rem',
                                                        flexWrap: 'wrap',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 auto', minWidth: '150px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>{record.name}</span>
                                                                <span className={`status-pill ${record.type === 'Bench' ? 'witnessed' : 'manual'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                                                                    {record.type}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{record.checkDate} {record.checkTime}</span>
                                                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: record.result === 'OK' ? '#10b981' : '#ef4444' }}>
                                                                    {record.result}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                            {isEditable && (
                                                                <>
                                                                    <button
                                                                        className="btn-action"
                                                                        style={{ fontSize: '10px', padding: '3px 8px', whiteSpace: 'nowrap' }}
                                                                        onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}
                                                                    >
                                                                        Modify
                                                                    </button>
                                                                    <button
                                                                        className="btn-action"
                                                                        style={{ fontSize: '10px', padding: '3px 8px', background: '#ef4444', borderColor: '#ef4444', whiteSpace: 'nowrap' }}
                                                                        onClick={() => setBenchMouldCheckRecords(prev => prev.filter(r => r.id !== record.id))}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* All Bench & Mould Card */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>All Bench & Mould</h4>
                                    <div className="log-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {allBenchesMoulds.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>No assets declared yet.</div>
                                        ) : (
                                            allBenchesMoulds.map(asset => (
                                                <div key={asset.id} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.75rem',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    borderRadius: '6px',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>{asset.name}</span>
                                                            <span className={`status-pill ${asset.type === 'Bench' ? 'witnessed' : 'manual'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                                                                {asset.type}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                Last Casting: <strong style={{ color: '#475569' }}>{asset.lastCasting}</strong>
                                                            </span>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                Last Checking: <strong style={{ color: '#475569' }}>{asset.lastChecking}</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Steam Curing' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: '#f59e0b' }}>●</span> SCADA Heat Treatment Analysis (Batch {selectedSteamBatch})</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>Open Curing Console</button>
                                    <select className="dash-select" value={selectedSteamBatch} onChange={(e) => setSelectedSteamBatch(e.target.value)}>
                                        {[...new Set(steamRecords.map(r => r.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="calc-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                    <span className="mini-label">Avg. IST (Initial Setting Time)</span>
                                    <div className="calc-value">145 min</div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.5rem 0 0' }}>Latest Cement Consignment (S-24-001)</p>
                                </div>
                                <div className="calc-card" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                    <div><span className="mini-label">Chambers Loaded</span><div className="calc-value">{steamStats?.count || 0}</div></div>
                                    <div><span className="mini-label">Deviated Cycles</span><div className="calc-value" style={{ color: (steamStats?.totalOutliers || 0) > 0 ? '#ef4444' : '#10b981' }}>{steamStats?.totalOutliers || 0}</div></div>
                                    <div><span className="mini-label">Compliance</span><div className="calc-value">{steamStats ? ((steamStats.count - steamStats.totalOutliers) / steamStats.count * 100).toFixed(0) : 0}%</div></div>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#1e293b' }}>Individual Chamber Summary & Validations</h4>
                            <div className="table-outer-wrapper" style={{ marginBottom: '2rem' }}>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>CH #</th><th>Pre-Steam</th><th>Rising Rate</th><th>Const Temp</th><th>Const Dur</th><th>Cool Rate</th><th>Check</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {steamStats?.records.map(r => (
                                            <tr key={r.chamberNo}>
                                                <td><strong>Chamber {r.chamberNo}</strong></td>
                                                <td>{r.preDur}h</td>
                                                <td>{r.riseRate}°/h</td>
                                                <td>{r.constTemp}°C</td>
                                                <td>{r.constDur}h</td>
                                                <td>{r.coolRate}°/h</td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        color: r.isOk ? '#10b981' : '#ef4444', fontWeight: 'bold'
                                                    }}>
                                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.isOk ? '#10b981' : '#ef4444' }}></span>
                                                        {r.isOk ? 'OK' : 'NOT OK'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#1e293b' }}>Statistical Performance Analysis</h4>
                            <div className="table-outer-wrapper" style={{ marginBottom: '2rem' }}>
                                <table className="ui-table" style={{ textAlign: 'center' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Phase / Metric</th>
                                            <th>Min</th><th>Max</th><th>Mean</th><th>Deviation (σ)</th><th>Outliers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {steamStats?.stats.map(s => (
                                            <tr key={s.key}>
                                                <td style={{ textAlign: 'left', fontWeight: '500' }}>{s.name}</td>
                                                <td>{s.min.toFixed(1)}</td>
                                                <td>{s.max.toFixed(1)}</td>
                                                <td style={{ fontWeight: 'bold' }}>{s.mean.toFixed(1)}</td>
                                                <td>{s.stdDev.toFixed(2)}</td>
                                                <td style={{ color: s.outliers > 0 ? '#ef4444' : '#10b981' }}>{s.outliers}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem' }}>Temperature Trajectory (Target vs Actual)</h4>
                                    <div style={{ height: '100px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
                                        {[28, 32, 45, 58, 60, 60, 60, 60, 50, 40, 32].map((v, i) => (
                                            <div key={i} style={{ flex: 1, height: `${(v / 70) * 100}%`, background: '#f59e0b', borderRadius: '2px 2px 0 0', opacity: 0.8 }}></div>
                                        ))}
                                        {/* Target Line */}
                                        <div style={{ position: 'absolute', bottom: '82%', left: 0, right: 0, height: '1px', borderTop: '1px dashed #ef4444', zIndex: 1 }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '9px', color: '#64748b' }}>
                                        <span>Pre-Steam</span>
                                        <span>Rising</span>
                                        <span>Constant (60°C)</span>
                                        <span>Cooling</span>
                                    </div>
                                </div>
                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem' }}>Phase Duration Stability</h4>
                                    <div style={{ height: '100px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>92%</div><span style={{ fontSize: '10px' }}>Rate</span></div>
                                        <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>100%</div><span style={{ fontSize: '10px' }}>Temp</span></div>
                                        <div style={{ textAlign: 'center' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>88%</div><span style={{ fontSize: '10px' }}>Time</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Steam Cube Testing' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: '#10b981' }}>●</span> Steam Cube Testing (Transfer Strength)</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                                {/* Statistics Card */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Statistics</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {/* M55 Stats */}
                                        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #10b981' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#10b981', fontSize: '0.9rem' }}>GRADE M-55</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                                <div><span className="mini-label">Min</span><div className="calc-value" style={{ fontSize: '1rem' }}>42.5</div></div>
                                                <div><span className="mini-label">Max</span><div className="calc-value" style={{ fontSize: '1rem' }}>48.2</div></div>
                                                <div><span className="mini-label">Avg</span><div className="calc-value" style={{ fontSize: '1rem' }}>45.1</div></div>
                                            </div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#64748b' }}>
                                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Unsatisfactory: 0</span> • Below Avg: 42%
                                            </div>
                                        </div>
                                        {/* M60 Stats */}
                                        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#3b82f6', fontSize: '0.9rem' }}>GRADE M-60</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                                <div><span className="mini-label">Min</span><div className="calc-value" style={{ fontSize: '1rem' }}>51.2</div></div>
                                                <div><span className="mini-label">Max</span><div className="calc-value" style={{ fontSize: '1rem' }}>58.9</div></div>
                                                <div><span className="mini-label">Avg</span><div className="calc-value" style={{ fontSize: '1rem' }}>55.4</div></div>
                                            </div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#64748b' }}>
                                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Unsatisfactory: 0</span> • Below Avg: 38%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Sample Declared Card */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Test Sample Declared</h4>
                                        <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>+ Add New Sample</button>
                                    </div>
                                    <div className="log-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {[
                                            { cubeNo: '401A', batch: '610', grade: 'M55', castDate: '2026-01-29' },
                                            { cubeNo: '405H', batch: '611', grade: 'M60', castDate: '2026-01-30' }
                                        ].map((sample, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>{sample.cubeNo}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Batch {sample.batch}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className={`status-pill ${sample.grade === 'M55' ? 'witnessed' : 'manual'}`} style={{ fontSize: '10px' }}>
                                                        {sample.grade}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{sample.castDate}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Testing Done Card */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Recent Testing Done</h4>
                                    <div className="log-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {testedRecords.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>No tests conducted yet.</div>
                                        ) : (
                                            testedRecords.slice(0, 5).map(test => {
                                                const isEditable = (() => {
                                                    const diffMs = Date.now() - new Date(test.timestamp).getTime();
                                                    return diffMs < (1 * 60 * 60 * 1000); // 1 hour
                                                })();
                                                const isPassing = parseFloat(test.strength) >= (test.grade === 'M55' ? 40 : 50);
                                                return (
                                                    <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>{test.cubeNo}</span>
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Batch {test.batchNo}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isPassing ? '#10b981' : '#ef4444' }}>
                                                                {test.strength} N/mm²
                                                            </span>
                                                            {isEditable && (
                                                                <button
                                                                    className="btn-action"
                                                                    style={{ fontSize: '10px', padding: '2px 6px' }}
                                                                    onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Manual Checks' && (
                        <div style={{ width: '100%' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title"><span style={{ color: '#3b82f6' }}>●</span> Manual Process Inspections</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                                {/* Mould Prep Section */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Mould Preparation</h4>
                                        <button className="toggle-btn" onClick={() => { setSubModuleToOpen('mouldPrep'); setViewMode('detail'); setDetailView('detail_modal'); }}>+ Add New</button>
                                    </div>
                                    <div className="log-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {manualCheckEntries.mouldPrep.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>No logs yet for this shift.</div>
                                        ) : (
                                            manualCheckEntries.mouldPrep.map(log => (
                                                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>{log.time}</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{containers.find(c => c.id === activeContainerId)?.type === 'Line' ? 'Gang' : 'Bench'} {log.benchNo}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: log.lumpsFree && log.oilApplied ? '#10b981' : '#ef4444' }}>
                                                            {log.lumpsFree && log.oilApplied ? 'READY' : 'ISSUE'}
                                                        </span>
                                                        {log.lumpsFree && log.oilApplied ? '✅' : '⚠️'}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* HTS Wire Section */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #8b5cf6', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>HTS Wire Placement</h4>
                                        <button className="toggle-btn" onClick={() => { setSubModuleToOpen('htsWire'); setViewMode('detail'); setDetailView('detail_modal'); }}>+ Add New</button>
                                    </div>
                                    <div className="log-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {manualCheckEntries.htsWire.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>No logs yet for this shift.</div>
                                        ) : (
                                            manualCheckEntries.htsWire.map(log => (
                                                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>{log.time}</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{containers.find(c => c.id === activeContainerId)?.type === 'Line' ? 'Gang' : 'Bench'} {log.benchNo}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <span style={{ fontSize: '10px', background: '#eff6ff', color: '#3b82f6', padding: '1px 6px', borderRadius: '50px', fontWeight: '700' }}>{log.wiresUsed} Wires</span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: log.satisfactory ? '#10b981' : '#ef4444' }}>
                                                            {log.satisfactory ? 'PASS' : 'FAIL'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Demoulding Section */}
                                <div className="calc-card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Demoulding Inspection</h4>
                                        <button className="toggle-btn" onClick={() => { setSubModuleToOpen('demoulding'); setViewMode('detail'); setDetailView('detail_modal'); }}>+ Add New</button>
                                    </div>
                                    <div className="log-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {manualCheckEntries.demoulding.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>No logs yet for this shift.</div>
                                        ) : (
                                            manualCheckEntries.demoulding.map(log => (
                                                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>{log.time}</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{containers.find(c => c.id === activeContainerId)?.type === 'Line' ? 'Gang' : 'Bench'} {log.benchNo}</span>
                                                    </div>
                                                    <span className={`status-pill ${log.processSatisfactory ? 'witnessed' : 'manual'}`} style={{ fontSize: '10px' }}>
                                                        {log.processSatisfactory ? 'RESULT: PASS' : 'RESULT: FAIL'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {
                detailView === 'detail_modal' && (
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
                            <MouldBenchCheck onBack={() => setDetailView('dashboard')} />
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
                        ) : null}
                    </div>
                )
            }
        </div >
    );
};

export default SleeperProcessDuty;

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
        { id: 101, time: '09:15:22', batchNo: '605', benchNo: '1', rpm: 9005, duration: 45, vibratorId: 'VIB-01' },
        { id: 102, time: '09:16:45', batchNo: '605', benchNo: '1', rpm: 8900, duration: 48, vibratorId: 'VIB-02' },
        { id: 103, time: '09:18:10', batchNo: '605', benchNo: '2', rpm: 9150, duration: 42, vibratorId: 'VIB-03' },
    ]);
    const [selectedCompactionBatch, setSelectedCompactionBatch] = useState('605');
    const [selectedTensionBatch, setSelectedTensionBatch] = useState('601');

    const [cubeTestRecords, setCubeTestRecords] = useState([
        { id: 101, grade: 'M55', strength: 42.5 },
        { id: 102, grade: 'M60', strength: 48.2 },
    ]);

    const [steamRecords, setSteamRecords] = useState([
        { id: 1, batchNo: '601', chamberNo: '1', date: '2026-01-20', preDur: 2.25, risePeriod: 2.25, riseRate: 13.3, constTemp: 58, constDur: 4.0, coolDur: 2.5, coolRate: 11.2 },
    ]);
    const [selectedSteamBatch, setSelectedSteamBatch] = useState('601');

    // Use Custom Hooks for Stats
    const batchStats = useBatchStats(witnessedRecords, batchDeclarations, selectedBatchNo);
    const compactionStats = useCompactionStats(compactionRecords, selectedCompactionBatch);
    const steamStats = useSteamStats(steamRecords, selectedSteamBatch);
    const wireTensionStats = useWireTensionStats(tensionRecords, selectedTensionBatch);

    const tabs = [
        { title: 'Manual Checks', subtitle: 'Hourly inspection', alert: manualChecksAlert },
        { title: 'Moisture Analysis', subtitle: 'Shift-wise samples', alert: moistureAlert },
        { title: 'Weight Batching', subtitle: 'SCADA & Manual Sync' },
        { title: 'Wire Tensioning', subtitle: 'Pressure logs' },
        { title: 'Compaction of Concrete', subtitle: 'Vibrator Report' },
        { title: 'Mould & Bench Checking', subtitle: 'Plant Assets' },
        { title: 'Steam Curing', subtitle: 'Temp profiles' },
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
                            {tab.title === 'Weight Batching' ? `${witnessedRecords.length} Witnessed` :
                                tab.title === 'Moisture Analysis' ? '4 Logs (Shift A)' :
                                    tab.title === 'Compaction of Concrete' ? 'Live Monitoring' :
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
                        {activeTab === 'Weight Batching' && <span className="badge-count" style={{ marginLeft: 0 }}>{witnessedRecords.length}</span>}
                    </div>
                    {!(activeTab === 'Mould & Bench Checking') && (
                        <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>
                            {activeTab === 'Manual Checks' ? 'Manual Record' :
                                activeTab === 'Wire Tensioning' ? 'Open Tensioning Console' :
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
                    {activeTab === 'Weight Batching' && (
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
                                            <th>Time</th><th>Batch</th><th>Cement (Actual)</th><th>Water (Actual)</th><th>Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {witnessedRecords.filter(r => r.batchNo === selectedBatchNo).length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No records for this batch yet.</td></tr>
                                        ) : (
                                            witnessedRecords.filter(r => r.batchNo === selectedBatchNo).slice(0, 5).map(r => (
                                                <tr key={r.id}>
                                                    <td data-label="Time"><span>{r.time}</span></td>
                                                    <td data-label="Batch"><span>{r.batchNo}</span></td>
                                                    <td data-label="Cement"><span>{r.cement} Kg</span></td>
                                                    <td data-label="Water"><span>{r.water} Ltr</span></td>
                                                    <td data-label="Source"><span>{r.source}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'Compaction of Concrete' && (
                        <>
                            <div className="dash-section-header">
                                <h3 className="dash-section-title"><span style={{ color: 'var(--primary-color)' }}>●</span> Vibrator Statistics (Batch {selectedCompactionBatch})</h3>
                                <select className="dash-select" value={selectedCompactionBatch} onChange={(e) => setSelectedCompactionBatch(e.target.value)}>
                                    {[...new Set(compactionRecords.map(r => r.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            {compactionStats ? (
                                <div className="rm-grid-cards" style={{ flexWrap: 'wrap' }}>
                                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}><span className="calc-label" style={{ fontSize: '0.65rem' }}>Avg Duration</span><div className="calc-value">{compactionStats.avgDuration.toFixed(1)}s</div></div>
                                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}><span className="calc-label" style={{ fontSize: '0.65rem' }}>Mean RPM</span><div className="calc-value">{compactionStats.meanRpm.toFixed(0)}</div></div>
                                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}><span className="calc-label" style={{ fontSize: '0.65rem' }}>Std Dev (σ)</span><div className="calc-value">{compactionStats.stdDev.toFixed(2)}</div></div>
                                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}><span className="calc-label" style={{ fontSize: '0.65rem' }}>% Within Spec</span><div className="calc-value" style={{ color: compactionStats.pctWithinSpec > 90 ? 'var(--color-success)' : 'var(--color-danger)' }}>{compactionStats.pctWithinSpec.toFixed(1)}%</div></div>
                                </div>
                            ) : null}
                        </>
                    )}

                    {activeTab === 'Wire Tensioning' && (
                        <>
                            <div className="dash-section-header">
                                <h3 className="dash-section-title"><span style={{ color: 'var(--primary-color)' }}>●</span> SCADA Tensioning Analysis (Batch {selectedTensionBatch})</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select Batch:</span>
                                    <select className="dash-select" value={selectedTensionBatch} onChange={(e) => setSelectedTensionBatch(e.target.value)}>
                                        {[...new Set(tensionRecords.map(r => r.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <WireTensionStats stats={wireTensionStats} />
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>
                                Click on <strong>Open Tensioning Console</strong> to witness SCADA records or log manual tensioning data.
                            </div>
                        </>
                    )}

                    {activeTab === 'Mould & Bench Checking' && (
                        <div style={{ maxWidth: '900px' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title">Plant Assets Integrity Overview</h3>
                            </div>
                            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="calc-card"><span className="mini-label">Total Benches</span><div className="calc-value">60</div></div>
                                <div className="calc-card"><span className="mini-label">Total Moulds</span><div className="calc-value">240</div></div>
                                <div className="calc-card"><span className="mini-label">Monthly Audit</span><div className="calc-value">72%</div></div>
                                <div className="calc-card"><span className="mini-label">Non-Fit Assets</span><div className="calc-value" style={{ color: '#ef4444' }}>4</div></div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>
                                Detailed asset inspection logs, dimensional reports, and fitness history can be managed via the <strong>Open Asset Console</strong>.
                            </div>
                        </div>
                    )}

                    {activeTab === 'Steam Curing' && (
                        <div style={{ maxWidth: '1000px' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dashboard-title" style={{ fontSize: '1.1rem' }}>Active Curing Profiles (Batch {selectedSteamBatch})</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Batch:</span>
                                    <select className="dash-select" value={selectedSteamBatch} onChange={(e) => setSelectedSteamBatch(e.target.value)}>
                                        {[...new Set(steamRecords.map(r => r.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            {steamStats && (
                                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div className="calc-card">
                                        <span className="calc-label">Avg. Constant Temp</span>
                                        <div className="calc-value">{steamStats.meanConstTemp.toFixed(1)} °C</div>
                                    </div>
                                    <div className="calc-card">
                                        <span className="calc-label">Chambers Monitored</span>
                                        <div className="calc-value">{steamStats.count}</div>
                                    </div>
                                    <div className="calc-card">
                                        <span className="calc-label">Critical Deviations</span>
                                        <div className="calc-value" style={{ color: steamStats.outlierProcesses > 0 ? '#ef4444' : '#22c55e' }}>{steamStats.outlierProcesses}</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>
                                Detailed time-temperature histograms and multi-stage process verification (Pre-Steam, Rising, Constant, Cooling) are available in <strong>Curing Console</strong>.
                            </div>
                        </div>
                    )}

                    {activeTab === 'Steam Cube Testing' && (
                        <div style={{ maxWidth: '900px' }}>
                            <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="dash-section-title">Transfer Strength (Steam Curing) Analysis</h3>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #10b981' }}>
                                        <span className="mini-label">GRADE M55 (TRANSFER)</span>
                                        <div className="calc-value">42.50 N/mm²</div>
                                        <span style={{ fontSize: '10px', color: '#64748b' }}>Pass Rate: 100% | Target: 40 N/mm²</span>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                        <span className="mini-label">SAMPLES AWAITING TEST</span>
                                        <div className="calc-value">12 Cubes</div>
                                        <span style={{ fontSize: '10px', color: '#64748b' }}>From Batch 610, 611</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>
                                Log individual cube test results, track sequences (A/B/C), and verify transfer strength compliance in <strong>Strength Test Console</strong>.
                            </div>
                        </div>
                    )}

                    {activeTab === 'Manual Checks' && (
                        <div style={{ maxWidth: '800px' }}>
                            <div className="manual-stats-card">
                                <div className="manual-stats-header">
                                    <div>
                                        <h3 style={{ margin: 0, color: '#42818c', fontSize: '1.25rem', fontWeight: '700' }}>SARTHI Feedbacks Form (Responses)</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>SARTHI Feedbacks Form (Responses)</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#166534', lineHeight: 1 }}>100%</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '600' }}>COMPLETION RATE</div>
                                    </div>
                                </div>

                                <div className="manual-stats-grid">
                                    <div className="manual-stat-item">
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Responses</span>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>10</div>
                                    </div>
                                    <div className="manual-stat-item">
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Section</span>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>D3</div>
                                    </div>
                                    <div className="manual-stat-item">
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Form Status</span>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#166534' }}>Active</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>
                                    Click on <strong>Manual Record</strong> above to log or view detailed hourly inspection cards.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {detailView === 'detail_modal' && (
                <div className="modal-container-wrapper">
                    {activeTab === 'Weight Batching' ? (
                        <BatchWeighment
                            onBack={() => setDetailView('dashboard')}
                            sharedState={{ batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords }}
                        />
                    ) : activeTab === 'Manual Checks' ? (
                        <ManualChecks
                            onBack={() => setDetailView('dashboard')}
                            onAlertChange={setManualChecksAlert}
                            activeContainer={containers.find(c => c.id === activeContainerId)}
                        />
                    ) : activeTab === 'Moisture Analysis' ? (
                        <MoistureAnalysis onBack={() => setDetailView('dashboard')} onSave={() => setMoistureAlert(false)} initialView={viewMode} />
                    ) : activeTab === 'Wire Tensioning' ? (
                        <WireTensioning
                            onBack={() => setDetailView('dashboard')}
                            batches={batchDeclarations}
                            sharedState={{ tensionRecords, setTensionRecords }}
                        />
                    ) : activeTab === 'Compaction of Concrete' ? (
                        <CompactionConcrete onBack={() => setDetailView('dashboard')} onSave={() => { }} />
                    ) : activeTab === 'Mould & Bench Checking' ? (
                        <MouldBenchCheck onBack={() => setDetailView('dashboard')} />
                    ) : activeTab === 'Steam Curing' ? (
                        <SteamCuring onBack={() => setDetailView('dashboard')} onSave={() => { }} />
                    ) : activeTab === 'Steam Cube Testing' ? (
                        <SteamCubeTesting onBack={() => setDetailView('dashboard')} />
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SleeperProcessDuty;

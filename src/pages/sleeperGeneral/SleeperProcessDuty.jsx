import React, { useState, useMemo } from 'react';
import { useBatchStats, useCompactionStats, useSteamStats } from '../../hooks/useStats';
import BatchWeighment from '../../features/batch-weighment/BatchWeighment';
import ManualChecks from '../../features/manual-checks/ManualChecks';
import MoistureAnalysis from '../../features/moisture-analysis/MoistureAnalysis';
import WireTensioning from '../../features/wire-tensioning/WireTensioning';
import CompactionConcrete from '../../features/compaction-concrete/CompactionConcrete';
import MouldBenchCheck from '../../features/mould-bench-check/MouldBenchCheck';
import SteamCuring from '../../features/steam-curing/SteamCuring';
import SteamCubeTesting from '../../features/steam-cube-testing/SteamCubeTesting';
import './SleeperProcessDuty.css';

const SleeperProcessDuty = () => {
    const [dutyStarted, setDutyStarted] = useState(false);
    const [activeTab, setActiveTab] = useState('Manual Checks');
    const [manualChecksAlert, setManualChecksAlert] = useState(true);
    const [moistureAlert, setMoistureAlert] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [detailView, setDetailView] = useState('dashboard');

    // Shared State (Refactored from App.js)
    const [batchDeclarations, setBatchDeclarations] = useState([
        {
            id: 1,
            batchNo: '601',
            setValues: { ca1: 431, ca2: 176, fa: 207, cement: 175, water: 36.2, admixture: 1.400 },
            adjustedWeights: { ca1: 436.2, ca2: 178.6, fa: 207.1, cement: 175.5, water: 37.0, admixture: 1.440 },
            proportionMatch: 'OK'
        }
    ]);
    const [witnessedRecords, setWitnessedRecords] = useState([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState('601');

    const [compactionRecords, setCompactionRecords] = useState([
        { id: 101, time: '09:15:22', batchNo: '605', benchNo: '1', rpm: 9005, duration: 45, vibratorId: 'VIB-01' },
        { id: 102, time: '09:16:45', batchNo: '605', benchNo: '1', rpm: 8900, duration: 48, vibratorId: 'VIB-02' },
        { id: 103, time: '09:18:10', batchNo: '605', benchNo: '2', rpm: 9150, duration: 42, vibratorId: 'VIB-03' },
        { id: 104, time: '09:20:00', batchNo: '604', benchNo: '5', rpm: 8840, duration: 50, vibratorId: 'VIB-01' },
        { id: 105, time: '09:12:00', batchNo: '605', benchNo: '2', rpm: 9020, duration: 44, vibratorId: 'VIB-04' },
    ]);
    const [selectedCompactionBatch, setSelectedCompactionBatch] = useState('605');

    const [cubeTestRecords, setCubeTestRecords] = useState([
        { id: 101, grade: 'M55', strength: 42.5 },
        { id: 102, grade: 'M60', strength: 48.2 },
        { id: 103, grade: 'M55', strength: 45.1 },
        { id: 104, grade: 'M60', strength: 52.4 },
        { id: 105, grade: 'M55', strength: 38.5 },
    ]);

    const [steamRecords, setSteamRecords] = useState([
        { id: 1, batchNo: '601', chamberNo: '1', date: '2026-01-20', preDur: 2.25, risePeriod: 2.25, riseRate: 13.3, constTemp: 58, constDur: 4.0, coolDur: 2.5, coolRate: 11.2 },
        { id: 2, batchNo: '601', chamberNo: '2', date: '2026-01-20', preDur: 1.0, risePeriod: 3.0, riseRate: 11, constTemp: 59, constDur: 3.0, coolDur: 1.5, coolRate: 16.6 },
        { id: 3, batchNo: '605', chamberNo: '5', date: '2026-01-19', preDur: 2.5, risePeriod: 2.0, riseRate: 14, constTemp: 62, constDur: 4.5, coolDur: 2.5, coolRate: 12 },
    ]);
    const [selectedSteamBatch, setSelectedSteamBatch] = useState('601');

    // Use Custom Hooks for Stats
    const batchStats = useBatchStats(witnessedRecords, batchDeclarations, selectedBatchNo);
    const compactionStats = useCompactionStats(compactionRecords, selectedCompactionBatch);
    const steamStats = useSteamStats(steamRecords, selectedSteamBatch);

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
            <header className="dashboard-header">
                <h1 className="dashboard-title">Sleeper Process Duty – Shift</h1>
                <p className="dashboard-subtitle">Real-time process monitoring and shift logs</p>
            </header>

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
                    {!(activeTab === 'Wire Tensioning' || activeTab === 'Mould & Bench Checking') && (
                        <button className="toggle-btn" onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>
                            {activeTab === 'Manual Checks' ? 'Manual Record' : 'New Entry'}
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
                        <ManualChecks onBack={() => setDetailView('dashboard')} onAlertChange={setManualChecksAlert} />
                    ) : activeTab === 'Moisture Analysis' ? (
                        <MoistureAnalysis onBack={() => setDetailView('dashboard')} onSave={() => setMoistureAlert(false)} initialView={viewMode} />
                    ) : activeTab === 'Wire Tensioning' ? (
                        <WireTensioning onBack={() => setDetailView('dashboard')} batches={batchDeclarations} />
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

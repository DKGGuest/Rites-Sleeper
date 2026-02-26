import React, { useState, useMemo, useEffect } from 'react';
import { apiService } from '../../services/api';
import './CompactionConcrete.css';

const CompactionSubCard = ({ id, title, color, statusDetail, isActive, onClick }) => {
    const label = id === 'stats' ? 'ANALYSIS' : id === 'witnessed' ? 'HISTORY' : 'SCADA';
    return (
        <div
            className={`compaction-sub-card ${isActive ? 'active' : ''}`}
            onClick={onClick}
            style={{
                borderTop: `4px solid ${color}`,
                borderColor: isActive ? color : '#e2e8f0',
                '--active-color': color
            }}
        >
            <div className="card-top">
                <span className="card-label" style={{ color: isActive ? color : '#64748b' }}>{label}</span>
                <span className="status-dot" style={{ background: color, opacity: isActive ? 1 : 0.4 }}></span>
            </div>
            <span className="card-title">{title}</span>
            <div className="card-footer">
                {statusDetail}
            </div>
        </div>
    );
};

const CompactionConcrete = ({ onBack, batches = [], sharedState, displayMode = 'modal', showForm: propsShowForm, setShowForm: propsSetShowForm }) => {
    const { compactionRecords: entries, setAllCompactionRecords: setEntries } = sharedState;
    const [viewMode, setViewMode] = useState('witnessed'); // Default to 'witnessed'
    const [localShowForm, setLocalShowForm] = useState(false);
    const showForm = propsShowForm !== undefined ? propsShowForm : localShowForm;
    const setShowForm = propsSetShowForm !== undefined ? propsSetShowForm : setLocalShowForm;

    const [selectedBatch, setSelectedBatch] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Mock SCADA Data - In production this would come from an API or live feed
    const [scadaRecords, setScadaRecords] = useState([
        { id: 101, time: '10:15', batchNo: '615', benchNo: '12', v1_rpm: 9000, v2_rpm: 8950, v3_rpm: 9100, v4_rpm: 8800, duration: 42 },
        { id: 102, time: '10:18', batchNo: '615', benchNo: '13', v1_rpm: 8850, v2_rpm: 9200, v3_rpm: 9050, v4_rpm: 8900, duration: 45 },
        { id: 103, time: '10:22', batchNo: '615', benchNo: '14', v1_rpm: 9150, v2_rpm: 8700, v3_rpm: 9250, v4_rpm: 9100, duration: 40 },
        { id: 104, time: '10:25', batchNo: '615', benchNo: '15', v1_rpm: 9020, v2_rpm: 9080, v3_rpm: 8960, v4_rpm: 8880, duration: 48 },
        { id: 105, time: '10:30', batchNo: '616', benchNo: '21', v1_rpm: 8900, v2_rpm: 9120, v3_rpm: 9020, v4_rpm: 8850, duration: 44 },
    ]);

    // Dynamic Batch List
    const availableBatches = useMemo(() => {
        const bSet = new Set();
        if (Array.isArray(batches)) {
            batches.forEach(b => { if (b.batchNo) bSet.add(String(b.batchNo)); });
        }
        if (scadaRecords) {
            scadaRecords.forEach(r => { if (r.batchNo) bSet.add(String(r.batchNo)); });
        }
        if (entries) {
            entries.forEach(r => { if (r.batchNo) bSet.add(String(r.batchNo)); });
        }
        return Array.from(bSet).sort();
    }, [batches, scadaRecords, entries]);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        tachoCount: 4,
        workingTachos: 4,
        minRpm: '',
        maxRpm: '',
        duration: ''
    });

    const [editingId, setEditingId] = useState(null);

    // Keep form batch in sync
    useEffect(() => {
        setManualForm(prev => ({ ...prev, batchNo: selectedBatch }));
    }, [selectedBatch]);

    const handleWitness = (record) => {
        const rpms = [record.v1_rpm, record.v2_rpm, record.v3_rpm, record.v4_rpm];
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: record.time,
            batchNo: record.batchNo,
            benchNo: record.benchNo,
            tachoCount: 4,
            workingTachos: 4,
            minRpm: Math.min(...rpms),
            maxRpm: Math.max(...rpms),
            duration: record.duration,
            v1V4Rpm: record.v1_rpm, // Consistent with API field
            source: 'Scada',
            originalScadaId: record.id
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
        alert('Record witnessed and added to local session.');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setManualForm({
            date: entry.date,
            time: entry.time,
            batchNo: entry.batchNo,
            benchNo: entry.benchNo,
            tachoCount: entry.tachoCount,
            workingTachos: entry.workingTachos,
            minRpm: entry.minRpm,
            maxRpm: entry.maxRpm,
            duration: entry.duration
        });
        setShowForm(true);
    };

    const handleFinalSave = async () => {
        if (!selectedBatch) {
            alert("Please select a batch first.");
            return;
        }

        setIsSaving(true);
        try {
            const batchRecords = entries.filter(r => String(r.batchNo) === String(selectedBatch));

            const manualRecords = batchRecords
                .filter(r => r.source === 'Manual')
                .map(r => ({
                    id: typeof r.id === 'number' && r.id < 1000000000 ? r.id : 0,
                    benchNo: String(r.benchNo),
                    minRpm: parseInt(r.minRpm) || 0,
                    maxRpm: parseInt(r.maxRpm) || 0,
                    duration: parseInt(r.duration) || 0
                }));

            const scadaRecordsPayload = batchRecords
                .filter(r => r.source === 'Scada')
                .map(r => ({
                    id: typeof r.id === 'number' && r.id < 1000000000 ? r.id : 0,
                    time: (r.time || "").substring(0, 5), // Truncate HH:mm:ss to HH:mm to satisfy backend parsing
                    benchNo: String(r.benchNo),
                    v1V4Rpm: parseInt(r.v1V4Rpm || r.minRpm) || 0,
                    duration: parseInt(r.duration) || 0
                }));

            const batchMeta = batches.find(b => String(b.batchNo) === String(selectedBatch));
            const payload = {
                batchNo: String(selectedBatch),
                sleeperType: batchMeta?.sleeperType || "RT-1234",
                entryDate: manualForm.date ? manualForm.date.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB'),
                scadaRecords: scadaRecordsPayload,
                manualRecords: manualRecords
            };

            const allResponse = await apiService.getAllCompaction();
            const existing = (allResponse?.responseData || []).find(b => String(b.batchNo) === String(selectedBatch));

            if (existing) {
                await apiService.updateCompaction(existing.id, payload);
                alert("Compaction data updated successfully.");
            } else {
                await apiService.createCompaction(payload);
                alert("Compaction data created successfully.");
            }
            setShowForm(false);
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to sync with backend. Data remains in local session.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveManual = () => {
        if (!manualForm.batchNo || !manualForm.benchNo) {
            alert('Batch and Bench required');
            return;
        }
        const newEntry = {
            ...manualForm,
            id: editingId || Date.now(),
            timestamp: new Date().toISOString(),
            source: 'Manual'
        };
        if (editingId) {
            setEntries(prev => prev.map(e => e.id === editingId ? newEntry : e));
            setEditingId(null);
        } else {
            setEntries(prev => [newEntry, ...prev]);
        }
        setManualForm({
            ...manualForm,
            batchNo: selectedBatch, benchNo: '', minRpm: '', maxRpm: '', duration: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        });
        alert('Manual entry saved to local session.');
        setShowForm(false);
    };

    const tabs = [
        { id: 'stats', label: 'Statistics', short: 'ANALYSIS', color: '#42818c', desc: 'Live vibration performance' },
        { id: 'witnessed', label: 'Witnessed Logs', short: 'HISTORY', color: '#10b981', desc: `${entries.length} Verified Records` },
        { id: 'scada', label: 'Scada Data', short: 'SCADA', color: '#f59e0b', desc: 'PLCs Connected' }
    ];

    const renderSubCards = () => (
        <div className="compaction-sub-grid">
            {tabs.map(tab => (
                <CompactionSubCard
                    key={tab.id}
                    id={tab.id}
                    title={tab.label}
                    color={tab.color}
                    statusDetail={tab.desc}
                    isActive={viewMode === tab.id}
                    onClick={() => setViewMode(tab.id)}
                />
            ))}
        </div>
    );

    const renderForm = () => (
        <div className="compaction-form-overlay" onClick={() => setShowForm(false)}>
            <div className="compaction-form-card" onClick={e => e.stopPropagation()}>
                <div className="compaction-card-header">
                    <div>
                        <h2>{editingId ? 'Modify' : 'New'} Compaction Entry</h2>
                        <p className="card-subtitle">Monitoring & Assurance</p>
                    </div>
                    <button onClick={() => setShowForm(false)} className="close-mini-btn">✕</button>
                </div>

                <div className="compaction-card-body">
                    <div className="compaction-form-stack">
                        <section className="compaction-section section-blue">
                            <div className="section-header">
                                <span className="step-number blue-bg">1</span>
                                <h4>Initial Declaration</h4>
                            </div>
                            <div className="form-grid compact">
                                <div className="form-field">
                                    <label>Batch No.</label>
                                    <select
                                        value={selectedBatch}
                                        onChange={e => setSelectedBatch(e.target.value)}
                                        style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                    >
                                        <option value="">-- Select --</option>
                                        {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="form-field"><label>Sleeper Type</label><input value="RT-8746" readOnly /></div>
                                <div className="form-field"><label>Date</label><input type="text" value={manualForm.date ? manualForm.date.split('-').reverse().join('/') : ''} readOnly /></div>
                            </div>
                        </section>

                        <section className="compaction-section section-amber">
                            <div className="section-header">
                                <span className="step-number amber-bg">2</span>
                                <h4>Scada Data Fetched</h4>
                            </div>
                            <div className="table-responsive">
                                <table className="ui-table compact">
                                    <thead><tr><th>Time</th><th>Bench</th><th>V1-V4 RPM</th><th>Dur.</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {scadaRecords.filter(r => !selectedBatch || String(r.batchNo) === String(selectedBatch)).length === 0 ? (
                                            <tr><td colSpan="5" className="empty-msg">No pending SCADA data.</td></tr>
                                        ) : (
                                            scadaRecords.filter(r => !selectedBatch || String(r.batchNo) === String(selectedBatch)).map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.time}</td><td><strong>{r.benchNo}</strong></td><td>{r.v1_rpm}-{r.v4_rpm}</td><td>{r.duration}s</td>
                                                    <td><button className="btn-action" onClick={() => handleWitness(r)}>Witness</button></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="compaction-section section-green">
                            <div className="section-header">
                                <span className="step-number green-bg">3</span>
                                <h4>Manual Entry Form</h4>
                            </div>
                            <div className="form-grid">
                                <div className="form-field"><label>Bench No.</label><input type="number" min="0" value={manualForm.benchNo} onChange={e => setManualForm({ ...manualForm, benchNo: e.target.value })} /></div>
                                <div className="form-field"><label>Min RPM</label><input type="number" min="0" value={manualForm.minRpm} onChange={e => setManualForm({ ...manualForm, minRpm: e.target.value })} /></div>
                                <div className="form-field"><label>Max RPM</label><input type="number" min="0" value={manualForm.maxRpm} onChange={e => setManualForm({ ...manualForm, maxRpm: e.target.value })} /></div>
                            </div>
                            <div className="action-row-center" style={{ marginTop: '1rem' }}><button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button></div>
                        </section>

                        <section className="compaction-section section-slate" style={{ borderBottom: 'none' }}>
                            <div className="section-header">
                                <span className="step-number slate-bg">4</span>
                                <h4>Recent Witness Logs</h4>
                            </div>
                            <div className="table-responsive">
                                <table className="ui-table compact">
                                    <thead><tr><th>Source</th><th>Date</th><th>Batch</th><th>Bench</th><th>RPM</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {entries.filter(e => !selectedBatch || String(e.batchNo) === String(selectedBatch)).slice(0, 5).map(e => (
                                            <tr key={e.id}>
                                                <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                                <td>{e.date ? e.date.split('-').reverse().join('/') : ''}</td>
                                                <td>{e.batchNo}</td><td>{e.benchNo}</td><td>{e.minRpm}-{e.maxRpm}</td>
                                                <td>
                                                    <div className="btn-group">
                                                        {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                        <button className="btn-action danger" onClick={() => handleDelete(e.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="compaction-card-footer" style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8fafc' }}>
                    <button className="btn-action" onClick={() => setShowForm(false)} style={{ padding: '10px 20px' }}>Cancel</button>
                    <button
                        className="toggle-btn"
                        onClick={handleFinalSave}
                        disabled={isSaving || !selectedBatch}
                        style={{
                            padding: '10px 30px',
                            background: isSaving || !selectedBatch ? '#94a3b8' : '#0f172a',
                            cursor: isSaving || !selectedBatch ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSaving ? 'Processing...' : 'Save / Finish Batch'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="compaction-content">
            {showForm && renderForm()}
            <div className="view-layer">
                {displayMode === 'inline' && renderSubCards()}

                {viewMode === 'stats' && (
                    <div className="view-stats fade-in">
                        <div className="content-title-row">
                            <h3>Compaction Performance Analysis</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Batch:</label>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    <option value="">-- All --</option>
                                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        {(() => {
                            const filtered = entries.filter(e => !selectedBatch || String(e.batchNo) === String(selectedBatch));
                            const avgRpm = filtered.length ? Math.round(filtered.reduce((acc, curr) => acc + (parseInt(curr.minRpm) + parseInt(curr.maxRpm)) / 2, 0) / filtered.length) : 0;
                            const avgDur = filtered.length ? Math.round(filtered.reduce((acc, curr) => acc + parseInt(curr.duration), 0) / filtered.length) : 0;
                            const withinRange = filtered.filter(e => e.minRpm >= 8000 && e.maxRpm <= 10000).length;
                            const consistency = filtered.length ? Math.round((withinRange / filtered.length) * 100) : 100;

                            return (
                                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                                    <div className="stats-metric-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>AVG VIBRATION SPEED</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{avgRpm} <small style={{ fontSize: '0.8rem', opacity: 0.6 }}>RPM</small></div>
                                    </div>
                                    <div className="stats-metric-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>AVG CYCLE DURATION</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{avgDur}s <small style={{ fontSize: '0.8rem', opacity: 0.6 }}>TARGET: 45s</small></div>
                                    </div>
                                    <div className="stats-metric-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>CONSISTENCY RATING</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: consistency > 90 ? '#10b981' : consistency > 70 ? '#f59e0b' : '#ef4444' }}>{consistency}%</div>
                                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                                            <div style={{ width: `${consistency}%`, height: '100%', background: consistency > 90 ? '#10b981' : consistency > 70 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s ease' }}></div>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>Within 8k-10k RPM Bounds</div>
                                    </div>
                                    <div className="stats-metric-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem' }}>TOTAL LOGS</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>{filtered.length}</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {viewMode === 'witnessed' && (
                    <div className="view-witnessed fade-in">
                        <div className="content-title-row">
                            <h3>Witnessed Compaction Logs</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    <option value="">-- All Batches --</option>
                                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <button className="toggle-btn" onClick={() => setShowForm(true)}>+ Add New Entry</button>
                            </div>
                        </div>
                        <div className="table-outer-wrapper">
                            <div className="table-responsive">
                                <table className="ui-table">
                                    <thead><tr><th>Source</th><th>Date</th><th>Time</th><th>Batch</th><th>Bench</th><th>RPM Range</th><th>Duration</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {entries
                                            .filter(e => !selectedBatch || String(e.batchNo) === String(selectedBatch))
                                            .map(e => (
                                                <tr key={e.id}>
                                                    <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                                    <td>{e.date ? e.date.split('-').reverse().join('/') : ''}</td>
                                                    <td>{e.time}</td><td>{e.batchNo}</td><td>{e.benchNo}</td><td>{e.minRpm}-{e.maxRpm}</td><td>{e.duration}s</td>
                                                    <td>
                                                        <div className="btn-group">
                                                            {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                            <button className="btn-action danger" onClick={() => handleDelete(e.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {entries.length === 0 && (
                                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No records found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'scada' && (
                    <div className="view-scada fade-in">
                        <div className="content-title-row">
                            <h3>Raw SCADA Vibrator Feed</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Batch:</label>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    <option value="">-- All --</option>
                                    {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="table-outer-wrapper">
                            <div className="table-responsive">
                                <table className="ui-table">
                                    <thead><tr><th>Time</th><th>Batch</th><th>Bench</th><th>V1 RPM</th><th>V2 RPM</th><th>V3 RPM</th><th>V4 RPM</th><th>Dur</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {scadaRecords
                                            .filter(r => !selectedBatch || String(r.batchNo) === String(selectedBatch))
                                            .map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.time}</td><td>{r.batchNo}</td><td><strong>{r.benchNo}</strong></td><td>{r.v1_rpm}</td><td>{r.v2_rpm}</td><td>{r.v3_rpm}</td><td>{r.v4_rpm}</td><td>{r.duration}s</td>
                                                    <td><button className="btn-action" onClick={() => handleWitness(r)}>Witness</button></td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (displayMode === 'inline') return renderContent();

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="header-titles">
                        <h2>Compaction & Vibration Console</h2>
                        <p className="header-subtitle">Concrete Compaction Monitoring & Assurance</p>
                    </div>
                    <div className="header-actions">
                        <button className="toggle-btn mini" onClick={() => setShowForm(true)}>+ Add New Entry</button>
                        <button className="close-btn" onClick={onBack}>✕</button>
                    </div>
                </header>

                <nav className="modal-sub-nav">
                    <div className="nav-links">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`nav-link ${viewMode === tab.id ? 'active' : ''}`}
                                onClick={() => setViewMode(tab.id)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="modal-body-wrapper">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default CompactionConcrete;

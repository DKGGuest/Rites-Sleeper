import React, { useState, useMemo } from 'react';
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

const CompactionConcrete = ({ onBack, onSave, displayMode = 'modal' }) => {
    const [viewMode, setViewMode] = useState('witnessed'); // Default to 'witnessed'
    const [selectedBatch, setSelectedBatch] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Mock SCADA Data
    const [scadaRecords, setScadaRecords] = useState([
        { id: 101, time: '10:15:00', batchNo: '615', benchNo: '12', v1_rpm: 9000, v2_rpm: 8950, v3_rpm: 9100, v4_rpm: 8800, duration: 42 },
        { id: 102, time: '10:18:30', batchNo: '615', benchNo: '13', v1_rpm: 8850, v2_rpm: 9200, v3_rpm: 9050, v4_rpm: 8900, duration: 45 },
        { id: 103, time: '10:22:15', batchNo: '615', benchNo: '14', v1_rpm: 9150, v2_rpm: 8700, v3_rpm: 9250, v4_rpm: 9100, duration: 40 },
        { id: 104, time: '10:25:45', batchNo: '615', benchNo: '15', v1_rpm: 9020, v2_rpm: 9080, v3_rpm: 8960, v4_rpm: 8880, duration: 48 },
        { id: 105, time: '10:30:10', batchNo: '616', benchNo: '21', v1_rpm: 8900, v2_rpm: 9120, v3_rpm: 9020, v4_rpm: 8850, duration: 44 },
    ]);

    // Data List (Witnessed + Manual)
    const [entries, setEntries] = useState([
        { id: 1, date: '2026-02-02', time: '09:45', batchNo: '614', benchNo: '10', tachoCount: 4, workingTachos: 4, minRpm: 8800, maxRpm: 9200, duration: 45, source: 'Manual' }
    ]);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '', benchNo: '', tachoCount: 4, workingTachos: 4, minRpm: '', maxRpm: '', duration: ''
    });

    const [editingId, setEditingId] = useState(null);

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
            source: 'Scada',
            originalScadaId: record.id
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
        alert('Record witnessed.');
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
            batchNo: '', benchNo: '', minRpm: '', maxRpm: '', duration: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        });
        alert('Manual entry saved.');
        setShowForm(false);
        if (onSave) onSave();
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
                                <div className="form-field"><label>Batch No.</label><input value={selectedBatch} readOnly /></div>
                                <div className="form-field"><label>Sleeper Type</label><input value="RT-8746" readOnly /></div>
                                <div className="form-field"><label>Date</label><input type="date" value={manualForm.date} readOnly /></div>
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
                                        {scadaRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                            <tr><td colSpan="5" className="empty-msg">No pending SCADA data.</td></tr>
                                        ) : (
                                            scadaRecords.filter(r => r.batchNo === selectedBatch).map(r => (
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
                            <div className="action-row-center"><button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button></div>
                        </section>

                        <section className="compaction-section section-slate">
                            <div className="section-header">
                                <span className="step-number slate-bg">4</span>
                                <h4>Recent Witness Logs</h4>
                            </div>
                            <div className="table-responsive">
                                <table className="ui-table compact">
                                    <thead><tr><th>Source</th><th>Time</th><th>Bench</th><th>RPM Range</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {entries.slice(0, 5).map(e => (
                                            <tr key={e.id}>
                                                <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                                <td>{e.time}</td><td>{e.benchNo}</td><td>{e.minRpm}-{e.maxRpm}</td>
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
                        <h3>Compaction Performance Statistics</h3>
                        <div className="vibration-stats-placeholder">Vibration consistency metrics and RPM distribution...</div>
                    </div>
                )}

                {viewMode === 'witnessed' && (
                    <div className="view-witnessed fade-in">
                        <div className="content-title-row">
                            <h3>Witnessed Compaction Logs</h3>
                            <button className="toggle-btn" onClick={() => setShowForm(true)}>+ Add New Entry</button>
                        </div>
                        <div className="table-outer-wrapper">
                            <div className="table-responsive">
                                <table className="ui-table">
                                    <thead><tr><th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>RPM Range</th><th>Duration</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {entries.map(e => (
                                            <tr key={e.id}>
                                                <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                                <td>{e.time}</td><td>{e.batchNo}</td><td>{e.benchNo}</td><td>{e.minRpm}-{e.maxRpm}</td><td>{e.duration}s</td>
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
                        </div>
                    </div>
                )}

                {viewMode === 'scada' && (
                    <div className="view-scada fade-in">
                        <h3>Raw SCADA Vibrator Feed</h3>
                        <div className="table-outer-wrapper">
                            <div className="table-responsive">
                                <table className="ui-table">
                                    <thead><tr><th>Time</th><th>Batch</th><th>Bench</th><th>V1 RPM</th><th>V2 RPM</th><th>V3 RPM</th><th>V4 RPM</th><th>Dur</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {scadaRecords.map(r => (
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

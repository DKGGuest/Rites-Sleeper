import React, { useState, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const CompactionConcrete = ({ onBack, onSave }) => {
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'stats', 'witnessed', 'scada', 'form'
    const [selectedBatch, setSelectedBatch] = useState('615');

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

    const batches = [...new Set(scadaRecords.map(r => r.batchNo))];

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
        setViewMode('form');
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
        if (onSave) onSave();
    };

    const renderDashboard = () => (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('stats')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
                    <h3 style={{ color: '#1e293b' }}>Statistics</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>View vibration RPM consistency and cycle times.</p>
                </div>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('witnessed')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ color: '#1e293b' }}>Witnessed Logs</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage all compaction and vibration records.</p>
                </div>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('scada')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                    <h3 style={{ color: '#1e293b' }}>Scada Data</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Raw vibrator RPM data from the PLC system.</p>
                </div>
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="fade-in">
            <div style={{ marginBottom: '1.5rem' }}><button className="back-btn" onClick={() => setViewMode('witnessed')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>← Back to Logs</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>1. Initial Declaration</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="form-field"><label>Batch No.</label><input value={selectedBatch} readOnly style={{ background: '#f8fafc' }} /></div>
                        <div className="form-field"><label>Sleeper Type</label><input value="RT-8746" readOnly style={{ background: '#f8fafc' }} /></div>
                        <div className="form-field"><label>Total in Batch</label><input value="120" readOnly style={{ background: '#f8fafc' }} /></div>
                        <div className="form-field"><label>Date</label><input type="date" value={manualForm.date} readOnly style={{ background: '#f8fafc' }} /></div>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>2. Scada Fetched Values</h4>
                    <table className="ui-table">
                        <thead><tr><th>Time</th><th>Bench</th><th>V1-V4 RPM</th><th>Dur.</th><th>Action</th></tr></thead>
                        <tbody>
                            {scadaRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No pending SCADA data.</td></tr>
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
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>3. Manual Entry Form</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div className="form-field"><label>Bench No.</label><input value={manualForm.benchNo} onChange={e => setManualForm({ ...manualForm, benchNo: e.target.value })} /></div>
                        <div className="form-field"><label>Min RPM</label><input value={manualForm.minRpm} onChange={e => setManualForm({ ...manualForm, minRpm: e.target.value })} /></div>
                        <div className="form-field"><label>Max RPM</label><input value={manualForm.maxRpm} onChange={e => setManualForm({ ...manualForm, maxRpm: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}><button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button></div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>4. Current Witness Logs</h4>
                    <table className="ui-table">
                        <thead><tr><th>Source</th><th>Time</th><th>Bench</th><th>RPM Range</th><th>Actions</th></tr></thead>
                        <tbody>
                            {entries.slice(0, 5).map(e => (
                                <tr key={e.id}>
                                    <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                    <td>{e.time}</td><td>{e.benchNo}</td><td>{e.minRpm}-{e.maxRpm}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                            <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(e.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div><h2 style={{ margin: 0 }}>Compaction & Vibration Console</h2><p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Concrete Compaction Monitoring & Assurance</p></div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>
                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {viewMode !== 'dashboard' && <button className="back-btn" onClick={() => setViewMode('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold', marginBottom: '1.5rem' }}>← Main Menu</button>}
                    {viewMode === 'dashboard' && renderDashboard()}
                    {viewMode === 'form' && renderForm()}
                    {viewMode === 'stats' && <div className="fade-in"><h3>Compaction Performance Statistics</h3><div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>📊 Vibration consistency metrics and RPM distribution...</div></div>}
                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Witnessed Compaction Logs</h3>
                                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
                            </div>
                            <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table className="ui-table">
                                    <thead><tr><th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>RPM Range</th><th>Duration</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {entries.map(e => (
                                            <tr key={e.id}>
                                                <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                                <td>{e.time}</td><td>{e.batchNo}</td><td>{e.benchNo}</td><td>{e.minRpm}-{e.maxRpm}</td><td>{e.duration}s</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                        <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(e.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <h3>Raw SCADA Vibrator Feed</h3>
                            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompactionConcrete;


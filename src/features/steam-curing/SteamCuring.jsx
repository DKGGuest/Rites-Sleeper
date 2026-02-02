import React, { useState, useMemo, useEffect } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const SteamCuring = ({ onBack, steamRecords: propSteamRecords, setSteamRecords: propSetSteamRecords }) => {
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'stats', 'witnessed', 'scada', 'form'
    const [localSteamRecords, setLocalSteamRecords] = useState([
        { id: 101, source: 'Manual', date: '2026-02-02', batchNo: '609', chamberNo: '5', benches: '301, 302', minConstTemp: 57, maxConstTemp: 59, timestamp: new Date().toISOString() }
    ]);
    const entries = propSteamRecords || localSteamRecords;
    const setEntries = propSetSteamRecords || setLocalSteamRecords;

    const [scadaCycles, setScadaCycles] = useState([
        {
            id: 1, batchNo: '610', chamberNo: '1', date: '2026-02-02', benches: '401, 402', grade: 'M55',
            pre: { start: '08:00', end: '10:15', dur: 2.25 },
            rise: { start: '10:15', end: '12:30', startTemp: 28, endTemp: 58, dur: 2.25, rate: 13.3 },
            const: { start: '12:30', end: '16:30', tempRange: '58-60', dur: 4.0 },
            cool: { start: '16:30', end: '19:00', startTemp: 58, endTemp: 30, dur: 2.5, rate: 11.2 },
            final: { start: '19:00', end: '20:30', dur: 1.5 }
        }
    ]);

    const [selectedBatch, setSelectedBatch] = useState('610');
    const [selectedChamber, setSelectedChamber] = useState('1');
    const [editingId, setEditingId] = useState(null);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
    });

    const activeRecord = useMemo(() => {
        return scadaCycles.find(c => c.batchNo === selectedBatch && c.chamberNo === selectedChamber);
    }, [selectedBatch, selectedChamber, scadaCycles]);

    const handleWitness = (record) => {
        const cycle = record || activeRecord;
        if (!cycle) return;
        const tempRangeSplit = cycle.const.tempRange.split('-').map(Number);
        const newEntry = {
            id: Date.now(),
            source: 'Scada',
            date: cycle.date,
            batchNo: cycle.batchNo,
            chamberNo: cycle.chamberNo,
            benches: cycle.benches,
            minConstTemp: tempRangeSplit[0],
            maxConstTemp: tempRangeSplit[1] || tempRangeSplit[0],
            timestamp: new Date().toISOString()
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaCycles(prev => prev.filter(c => c.id !== cycle.id));
        alert(`Cycle witnessed.`);
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
            batchNo: entry.batchNo,
            chamberNo: entry.chamberNo,
            benches: entry.benches,
            minConstTemp: entry.minConstTemp,
            maxConstTemp: entry.maxConstTemp
        });
        setViewMode('form');
    };

    const handleSaveManual = () => {
        if (!manualForm.batchNo || !manualForm.chamberNo) {
            alert('Batch and Chamber numbers required');
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
            date: new Date().toISOString().split('T')[0],
            batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
        });
        alert('Manual entry saved.');
    };

    const renderDashboard = () => (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('stats')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌡️</div>
                    <h3 style={{ color: '#1e293b' }}>Statistics</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cycle duration and temperature variations.</p>
                </div>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('witnessed')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3 style={{ color: '#1e293b' }}>Witnessed Logs</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage all heat treatment records.</p>
                </div>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('scada')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛓️</div>
                    <h3 style={{ color: '#1e293b' }}>Scada Data</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Raw SCADA cycles for all chambers.</p>
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
                        <div className="form-field"><label>Batch</label><input value={selectedBatch} readOnly style={{ background: '#f8fafc' }} /></div>
                        <div className="form-field"><label>Chamber</label><input value={selectedChamber} readOnly style={{ background: '#f8fafc' }} /></div>
                        <div className="form-field"><label>Grade</label><input value="M60" readOnly style={{ background: '#f8fafc' }} /></div>
                        <div className="form-field"><label>Date</label><input type="date" value={manualForm.date} readOnly style={{ background: '#f8fafc' }} /></div>
                    </div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>2. Scada Fetched Values</h4>
                    {activeRecord ? (
                        <table className="ui-table">
                            <thead><tr><th>Phase</th><th>Start</th><th>End</th><th>Parameters</th><th>Action</th></tr></thead>
                            <tbody>
                                <tr><td>Rising</td><td>{activeRecord.rise.start}</td><td>{activeRecord.rise.end}</td><td>{activeRecord.rise.rate}°C/h</td><td rowSpan="3"><button className="btn-action" onClick={() => handleWitness(activeRecord)}>Witness Cycle</button></td></tr>
                                <tr><td>Constant</td><td>{activeRecord.const.start}</td><td>{activeRecord.const.end}</td><td>{activeRecord.const.tempRange}°C</td></tr>
                                <tr><td>Cooling</td><td>{activeRecord.cool.start}</td><td>{activeRecord.cool.end}</td><td>{activeRecord.cool.rate}°C/h</td></tr>
                            </tbody>
                        </table>
                    ) : <p style={{ textAlign: 'center', color: '#94a3b8' }}>No pending SCADA data.</p>}
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>3. Manual Entry Form</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div className="form-field"><label>Batch No.</label><input type="number" value={manualForm.batchNo} onChange={e => setManualForm({ ...manualForm, batchNo: e.target.value })} /></div>
                        <div className="form-field"><label>Chamber</label><input type="number" value={manualForm.chamberNo} onChange={e => setManualForm({ ...manualForm, chamberNo: e.target.value })} /></div>
                        <div className="form-field"><label>Max Temp</label><input type="number" value={manualForm.maxConstTemp} onChange={e => setManualForm({ ...manualForm, maxConstTemp: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}><button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button></div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>4. Current Witness Logs</h4>
                    <table className="ui-table">
                        <thead><tr><th>Source</th><th>Batch</th><th>Chamber</th><th>Temp Range</th><th>Actions</th></tr></thead>
                        <tbody>
                            {entries.slice(0, 5).map(e => (
                                <tr key={e.id}>
                                    <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                    <td>{e.batchNo}</td><td>{e.chamberNo}</td><td>{e.minConstTemp}-{e.maxConstTemp}°C</td>
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
                    <div><h2 style={{ margin: 0 }}>Steam Curing Console</h2><p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Heat Treatment Cycle Assurance</p></div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>
                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {viewMode !== 'dashboard' && <button className="back-btn" onClick={() => setViewMode('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold', marginBottom: '1.5rem' }}>← Main Menu</button>}
                    {viewMode === 'dashboard' && renderDashboard()}
                    {viewMode === 'form' && renderForm()}
                    {viewMode === 'stats' && <div className="fade-in"><h3>Steam Curing Performance Statistics</h3><div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>📉 Curing temperature profiles and efficiency metrics...</div></div>}
                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Witnessed Curing Logs</h3>
                                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
                            </div>
                            <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table className="ui-table">
                                    <thead><tr><th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Benches</th><th>Temp Range</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {entries.map(e => (
                                            <tr key={e.id}>
                                                <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                                <td>{e.date}</td><td>{e.batchNo}</td><td>{e.chamberNo}</td><td>{e.benches}</td><td>{e.minConstTemp}-{e.maxConstTemp}°C</td>
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
                            <h3>Raw SCADA Cycles (Full)</h3>
                            {scadaCycles.map(c => (
                                <div key={c.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong>Batch {c.batchNo} | Chamber {c.chamberNo}</strong>
                                        <button className="btn-action" onClick={() => handleWitness(c)}>Witness Cycle</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                        <div><label style={{ fontSize: '0.7rem', color: '#64748b' }}>Pre-Steam</label><div>{c.pre.dur}h</div></div>
                                        <div><label style={{ fontSize: '0.7rem', color: '#64748b' }}>Rising</label><div>{c.rise.rate}°C/h</div></div>
                                        <div><label style={{ fontSize: '0.7rem', color: '#64748b' }}>Constant</label><div>{c.const.tempRange}°C</div></div>
                                        <div><label style={{ fontSize: '0.7rem', color: '#64748b' }}>Cooling</label><div>{c.cool.rate}°C/h</div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SteamCuring;

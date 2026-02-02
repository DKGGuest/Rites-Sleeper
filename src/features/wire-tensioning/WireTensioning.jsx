import React, { useState, useEffect, useMemo } from 'react';
import WireTensionStats from './components/WireTensionStats';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import { useWireTensionStats } from '../../hooks/useStats';

/**
 * WireTensioning Feature
 * Handles integration of SCADA tensioning data and manual pressure logs.
 */
const WireTensioning = ({ onBack, batches = [], sharedState }) => {
    const { tensionRecords, setTensionRecords } = sharedState;
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'stats', 'witnessed', 'scada', 'form'
    const [selectedBatch, setSelectedBatch] = useState(batches[0]?.batchNo || '601');
    const [wiresPerSleeper] = useState(18);
    const [editId, setEditId] = useState(null);

    // Mock SCADA records
    const [scadaRecords, setScadaRecords] = useState([
        { id: 201, time: '11:05', batchNo: '601', benchNo: '411', finalLoad: 733 },
        { id: 202, time: '11:12', batchNo: '601', benchNo: '412', finalLoad: 729 },
        { id: 203, time: '11:20', batchNo: '601', benchNo: '413', finalLoad: 736 },
        { id: 204, time: '11:28', batchNo: '601', benchNo: '414', finalLoad: 742 },
        { id: 205, time: '11:35', batchNo: '601', benchNo: '415', finalLoad: 726 },
        { id: 206, time: '11:42', batchNo: '601', benchNo: '416', finalLoad: 731 },
        { id: 207, time: '11:50', batchNo: '601', benchNo: '417', finalLoad: 738 },
        { id: 208, time: '11:58', batchNo: '601', benchNo: '418', finalLoad: 734 },
        { id: 209, time: '12:05', batchNo: '601', benchNo: '419', finalLoad: 727 },
        { id: 210, time: '12:12', batchNo: '601', benchNo: '420', finalLoad: 733 },
    ]);

    const wireTensionStats = useWireTensionStats(tensionRecords, selectedBatch);

    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        finalLoad: '',
        type: 'RT-1234'
    });

    useEffect(() => {
        if (formData.benchNo) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            setFormData(prev => ({ ...prev, type: types[parseInt(formData.benchNo) % 3] || 'RT-1234' }));
        }
    }, [formData.benchNo]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWitness = (record) => {
        const newEntry = {
            ...record,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            source: 'Scada',
            wires: wiresPerSleeper,
            loadPerWire: (parseFloat(record.finalLoad) / wiresPerSleeper).toFixed(2),
            type: 'RT-1234'
        };
        setTensionRecords(prev => [newEntry, ...prev]);
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
        alert(`Record for Bench ${record.benchNo} witnessed.`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setTensionRecords(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleSaveManual = () => {
        if (!formData.benchNo || !formData.finalLoad) {
            alert('Required fields missing');
            return;
        }

        const newEntry = {
            ...formData,
            id: editId || Date.now(),
            timestamp: new Date().toISOString(),
            source: 'Manual',
            wires: wiresPerSleeper,
            loadPerWire: (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2)
        };

        if (editId) {
            setTensionRecords(prev => prev.map(r => r.id === editId ? newEntry : r));
            setEditId(null);
            alert('Record updated successfully');
        } else {
            setTensionRecords(prev => [newEntry, ...prev]);
        }

        setFormData(prev => ({
            ...prev,
            benchNo: '',
            finalLoad: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
    };

    const handleEdit = (record) => {
        setFormData({
            time: record.time,
            batchNo: record.batchNo,
            benchNo: record.benchNo,
            finalLoad: record.finalLoad,
            type: record.type
        });
        setEditId(record.id);
        setViewMode('form');
    };

    const renderDashboard = () => (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button
                    className="toggle-btn"
                    onClick={() => {
                        setEditId(null);
                        setFormData(prev => ({ ...prev, benchNo: '', finalLoad: '' }));
                        setViewMode('form');
                    }}
                >
                    + Add New Entry
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div
                    className="dashboard-card hover-lift"
                    onClick={() => setViewMode('stats')}
                    style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                    <h3 style={{ color: '#1e293b' }}>Statistics</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>View tensioning distribution and variations.</p>
                </div>
                <div
                    className="dashboard-card hover-lift"
                    onClick={() => setViewMode('witnessed')}
                    style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ color: '#1e293b' }}>Witnessed Logs</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage witnessed and manual records.</p>
                </div>
                <div
                    className="dashboard-card hover-lift"
                    onClick={() => setViewMode('scada')}
                    style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📟</div>
                    <h3 style={{ color: '#1e293b' }}>Scada Data</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Raw data from PLC tensioning system.</p>
                </div>
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button className="back-btn" onClick={() => setViewMode('witnessed')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                    ← Back to Logs
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* 1. Initial Declaration */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>1. Initial Declaration</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        <div className="form-field">
                            <label>Batch No.</label>
                            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                                {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Sleeper Type</label>
                            <input value="RT-1234" readOnly className="readOnly" style={{ background: '#f8fafc' }} />
                        </div>
                        <div className="form-field">
                            <label>Wires / Sleeper</label>
                            <input value={wiresPerSleeper} readOnly className="readOnly" style={{ background: '#f8fafc' }} />
                        </div>
                        <div className="form-field">
                            <label>Target Load (KN)</label>
                            <input value="730" readOnly className="readOnly" style={{ background: '#f8fafc' }} />
                        </div>
                    </div>
                </div>

                {/* 2. Scada Fetched Values */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>2. Scada Fetched Values (Pending)</h4>
                    <table className="ui-table">
                        <thead><tr><th>PLC Time</th><th>Bench</th><th>PLC Load (KN)</th><th>Action</th></tr></thead>
                        <tbody>
                            {scadaRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No pending SCADA data for this batch.</td></tr>
                            ) : (
                                scadaRecords.filter(r => r.batchNo === selectedBatch).map(record => (
                                    <tr key={record.id}>
                                        <td>{record.time}</td>
                                        <td><strong>{record.benchNo}</strong></td>
                                        <td style={{ fontWeight: '700', color: '#42818c' }}>{record.finalLoad} KN</td>
                                        <td><button className="btn-action" onClick={() => handleWitness(record)}>Witness</button></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. Manual Entry Form */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>3. Manual Entry Form</h4>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="form-field">
                            <label>Bench No.</label>
                            <input type="text" name="benchNo" value={formData.benchNo} onChange={handleFormChange} placeholder="e.g. 405" />
                        </div>
                        <div className="form-field">
                            <label>Final Load (KN)</label>
                            <input type="number" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="e.g. 730" />
                        </div>
                        <div className="form-field">
                            <label>Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button className="toggle-btn" onClick={handleSaveManual}>{editId ? 'Update Manual Record' : 'Save Manual Record'}</button>
                    </div>
                </div>

                {/* 4. Current Witness Logs */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>4. Current Witness Logs</h4>
                    <table className="ui-table">
                        <thead><tr><th>Source</th><th>Time</th><th>Bench</th><th>Load (KN)</th><th>Action</th></tr></thead>
                        <tbody>
                            {tensionRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No logs for this shift.</td></tr>
                            ) : (
                                tensionRecords.filter(r => r.batchNo === selectedBatch).slice(0, 5).map(r => (
                                    <tr key={r.id}>
                                        <td><span className={`status-pill ${r.source === 'Manual' ? 'manual' : 'witnessed'}`}>{r.source}</span></td>
                                        <td>{r.time}</td>
                                        <td>{r.benchNo}</td>
                                        <td>{r.finalLoad} KN</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {r.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(r)}>Edit</button>}
                                                <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(r.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Wire Tensioning Control Console</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Precision Load Integration & Assurance</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {viewMode !== 'dashboard' && (
                        <button className="back-btn" onClick={() => setViewMode('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ← Main Console Menu
                        </button>
                    )}

                    {viewMode === 'dashboard' && renderDashboard()}

                    {viewMode === 'stats' && (
                        <div className="fade-in">
                            <h3 style={{ marginBottom: '1.5rem' }}>Tensioning Statistical Analysis</h3>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ marginRight: '10px' }}>Select Batch:</label>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                </select>
                            </div>
                            <WireTensionStats stats={wireTensionStats} />
                        </div>
                    )}

                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Witnessed Logs (Full)</h3>
                                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
                            </div>
                            <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table className="ui-table">
                                    <thead><tr><th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>Load (KN)</th><th>Load/Wire</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {tensionRecords.length === 0 ? (
                                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No records logged yet.</td></tr>
                                        ) : (
                                            tensionRecords.map(entry => (
                                                <tr key={entry.id}>
                                                    <td><span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>{entry.source}</span></td>
                                                    <td>{entry.time}</td>
                                                    <td>{entry.batchNo}</td>
                                                    <td>{entry.benchNo}</td>
                                                    <td><strong>{entry.finalLoad} KN</strong></td>
                                                    <td>{entry.loadPerWire}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {entry.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>}
                                                            <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(entry.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <h3 style={{ marginBottom: '1.5rem' }}>Scada Data (Raw Feed)</h3>
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ marginRight: '10px' }}>Filter Batch:</label>
                                    <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                        {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                    </select>
                                </div>
                                <table className="ui-table">
                                    <thead><tr><th>PLC Time</th><th>Bench</th><th>PLC Load (KN)</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {scadaRecords.filter(r => r.batchNo === selectedBatch).map(r => (
                                            <tr key={r.id}>
                                                <td>{r.time}</td>
                                                <td><strong>{r.benchNo}</strong></td>
                                                <td style={{ fontWeight: '700' }}>{r.finalLoad} KN</td>
                                                <td><span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>PENDING WITNESS</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {viewMode === 'form' && renderForm()}
                </div>
            </div>
        </div>
    );
};

export default WireTensioning;

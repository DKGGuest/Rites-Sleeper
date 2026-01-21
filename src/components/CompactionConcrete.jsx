import React, { useState, useEffect, useMemo } from 'react';

const CompactionConcrete = ({ onBack, onSave }) => {
    // Component State
    const [scadaOpen, setScadaOpen] = useState(true);
    const [manualOpen, setManualOpen] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState('605');

    // Mock Data for SCADA
    const [scadaRecords, setScadaRecords] = useState([
        { id: 101, time: '09:15:22', batchNo: '605', benchNo: '1', rpm: 2850, duration: 45, vibratorId: 'VIB-01' },
        { id: 102, time: '09:16:45', batchNo: '605', benchNo: '1', rpm: 2900, duration: 48, vibratorId: 'VIB-02' },
        { id: 103, time: '09:18:10', batchNo: '605', benchNo: '2', rpm: 2880, duration: 42, vibratorId: 'VIB-03' },
        { id: 104, time: '09:20:00', batchNo: '604', benchNo: '5', rpm: 2840, duration: 50, vibratorId: 'VIB-01' },
        { id: 105, time: '09:12:00', batchNo: '605', benchNo: '2', rpm: 2860, duration: 44, vibratorId: 'VIB-04' },
    ]);

    // Manual / Witnessed Records
    const [entries, setEntries] = useState([
        {
            id: 1,
            date: '2026-01-20',
            time: '08:30',
            batchNo: '604',
            benchNo: '3',
            tachometers: 4,
            workingTachos: 4,
            minRpm: 2800,
            maxRpm: 2950,
            avgDuration: 45,
            source: 'Manual'
        }
    ]);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '',
        benchNo: '',
        tachometers: 4,
        workingTachos: 4,
        minRpm: 0,
        maxRpm: 0,
        avgDuration: 0,
        id: null,
        source: 'Manual'
    });

    // Helper functions
    const toggleScada = () => setScadaOpen(!scadaOpen);
    const toggleManual = () => setManualOpen(!manualOpen);

    const handleWitness = (record) => {
        // Move record to entries as "Scada Witnessed"
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: record.time,
            batchNo: record.batchNo,
            benchNo: record.benchNo,
            tachometers: 1,
            workingTachos: 1, // Assuming 1 for single scada record
            minRpm: record.rpm,
            maxRpm: record.rpm,
            avgDuration: record.duration,
            source: 'Scada Witnessed'
        };
        setEntries([newEntry, ...entries]);
        // Remove from SCADA list (optional per requirement, but usually "moved")
        // "Record witnessed will go to Manual checked data list" - implies it moves.
        setScadaRecords(scadaRecords.filter(r => r.id !== record.id));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveManual = () => {
        const newEntry = {
            ...formData,
            id: formData.id || Date.now(),
            batchNo: formData.batchNo || selectedBatch,
            source: 'Manual'
        };
        setEntries([newEntry, ...entries]);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            batchNo: '',
            benchNo: '',
            tachometers: 4,
            workingTachos: 4,
            minRpm: 0,
            maxRpm: 0,
            avgDuration: 0,
            id: null,
            source: 'Manual'
        });
        if (onSave) onSave();
    };

    // Filtered SCADA data
    const filteredScada = useMemo(() => {
        return scadaRecords.filter(r => r.batchNo === selectedBatch).slice(0, 10);
    }, [scadaRecords, selectedBatch]);

    const uniqueBatches = useMemo(() => {
        const batches = new Set(scadaRecords.map(r => r.batchNo));
        return Array.from(batches).sort().reverse();
    }, [scadaRecords]);

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                <header className="modal-header">
                    <h2>Compaction of Concrete</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ padding: '1.5rem' }}>

                    {/* Section 1: SCADA Data Fetched */}
                    <div className="collapsible-section">
                        <div
                            className="section-header"
                            onClick={toggleScada}
                        >
                            <span>SCADA Data Fetched</span>
                            <span>{scadaOpen ? '▲' : '▼'}</span>
                        </div>
                        {scadaOpen && (
                            <div className="section-content">
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Select Batch:</label>
                                    <select
                                        className="form-select"
                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        value={selectedBatch}
                                        onChange={e => setSelectedBatch(e.target.value)}
                                    >
                                        {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>

                                <table className="ui-table" style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Batch</th>
                                            <th>Bench</th>
                                            <th>Vibrator ID</th>
                                            <th>RPM</th>
                                            <th>Duration (s)</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredScada.length === 0 ? (
                                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>No records found for this batch</td></tr>
                                        ) : (
                                            filteredScada.map(record => (
                                                <tr key={record.id}>
                                                    <td>{record.time}</td>
                                                    <td>{record.batchNo}</td>
                                                    <td>{record.benchNo}</td>
                                                    <td>{record.vibratorId}</td>
                                                    <td>{record.rpm}</td>
                                                    <td>{record.duration}</td>
                                                    <td>
                                                        <button
                                                            className="toggle-btn"
                                                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                                                            onClick={() => handleWitness(record)}
                                                        >
                                                            Witness
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Scada Witness / Manual Data Entry */}
                    <div className="collapsible-section">
                        <div
                            className="section-header"
                            onClick={toggleManual}
                        >
                            <span>Scada Witness / Manual Data Entry</span>
                            <span>{manualOpen ? '▲' : '▼'}</span>
                        </div>
                        {manualOpen && (
                            <div className="section-content">
                                {/* List of Entries */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Recorded Entries</h4>
                                    <table className="ui-table" style={{ fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Source</th>
                                                <th>Time</th>
                                                <th>Batch</th>
                                                <th>Bench</th>
                                                <th>Tachos (Work/Total)</th>
                                                <th>RPM (Min/Max)</th>
                                                <th>Avg. Dur</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.map(entry => (
                                                <tr key={entry.id}>
                                                    <td>
                                                        <span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>
                                                            {entry.source}
                                                        </span>
                                                    </td>
                                                    <td>{entry.time}</td>
                                                    <td>{entry.batchNo}</td>
                                                    <td>{entry.benchNo}</td>
                                                    <td>{entry.workingTachos}/{entry.tachometers}</td>
                                                    <td>{entry.minRpm}/{entry.maxRpm}</td>
                                                    <td>{entry.avgDuration}s</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Manual Entry Form */}
                                <div className="form-container" style={{ padding: '0' }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Add Manual Entry</h4>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                        <div className="form-field">
                                            <label>Date</label>
                                            <input type="date" name="date" value={formData.date} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Time</label>
                                            <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Batch No.</label>
                                            <input type="number" name="batchNo" value={formData.batchNo} placeholder="e.g. 605" onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Bench No.</label>
                                            <input type="number" name="benchNo" value={formData.benchNo} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Total Tachometers</label>
                                            <input type="number" name="tachometers" value={formData.tachometers} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Working Tachos</label>
                                            <input type="number" name="workingTachos" value={formData.workingTachos} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Min RPM</label>
                                            <input type="number" name="minRpm" value={formData.minRpm} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Max RPM</label>
                                            <input type="number" name="maxRpm" value={formData.maxRpm} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Avg Duration (s)</label>
                                            <input type="number" name="avgDuration" value={formData.avgDuration} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="toggle-btn" onClick={handleSaveManual}>Save Manual Entry</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CompactionConcrete;

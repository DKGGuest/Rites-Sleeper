import React, { useState, useMemo } from 'react';

const SteamCuring = ({ onBack, onSave }) => {
    // Component State
    const [scadaOpen, setScadaOpen] = useState(true);
    const [manualOpen, setManualOpen] = useState(true);

    // Mock SCADA Data (Deeply detailed for the modal view)
    const [scadaData] = useState([
        {
            id: 1,
            batchNo: '605',
            chamberNo: '1',
            date: '2026-01-20',
            benches: ['1', '2'],
            grade: 'M55',
            // Pre-Steaming
            preStart: '09:00', preEnd: '11:15', preDur: 2.25, // hrs
            // Temp Rising
            riseStart: '11:15', riseEnd: '13:30', riseStartTemp: 25, riseEndTemp: 55, risePeriod: 2.25, riseRate: 13.3,
            // Constant
            constStart: '13:30', constEnd: '17:30', constDur: 4.0, constTempRange: '55-58',
            // Cooling
            coolStart: '17:30', coolEnd: '20:00', coolStartTemp: 58, coolEndTemp: 30, coolDur: 2.5, coolRate: 11.2,
            // Final
            finalStart: '20:00', finalEnd: '20:30', finalDur: 0.5
        },
        {
            id: 2,
            batchNo: '605',
            chamberNo: '2',
            date: '2026-01-20',
            benches: ['3', '4'],
            grade: 'M55',
            // Pre-Steaming (Issue: Short duration)
            preStart: '09:30', preEnd: '10:30', preDur: 1.0,
            // Temp Rising
            riseStart: '10:30', riseEnd: '13:30', riseStartTemp: 25, riseEndTemp: 58, risePeriod: 3.0, riseRate: 11,
            // Constant
            constStart: '13:30', constEnd: '16:30', constDur: 3.0, constTempRange: '58-60',
            // Cooling
            coolStart: '16:30', coolEnd: '18:00', coolStartTemp: 60, coolEndTemp: 35, coolDur: 1.5, coolRate: 16.6,
            // Final
            finalStart: '18:00', finalEnd: '18:30', finalDur: 0.5
        }
    ]);

    const [selectedBatch, setSelectedBatch] = useState('605');
    const [selectedChamber, setSelectedChamber] = useState('1');

    // Manual / Witnessed Records
    const [entries, setEntries] = useState([
        {
            id: 101,
            source: 'Manual',
            date: '2026-01-19',
            batchNo: '604',
            chamberNo: '5',
            benches: '12, 13',
            minConstTemp: 56,
            maxConstTemp: 59
        }
    ]);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '',
        chamberNo: '',
        benches: '',
        minConstTemp: '',
        maxConstTemp: ''
    });

    // Helper functions
    const toggleScada = () => setScadaOpen(!scadaOpen);
    const toggleManual = () => setManualOpen(!manualOpen);

    const currentScadaRecord = useMemo(() => {
        return scadaData.find(r => r.batchNo === selectedBatch && r.chamberNo === selectedChamber) || null;
    }, [scadaData, selectedBatch, selectedChamber]);

    const handleWitness = (record) => {
        const newEntry = {
            id: Date.now(),
            source: 'Scada Witnessed',
            date: record.date,
            batchNo: record.batchNo,
            chamberNo: record.chamberNo,
            benches: record.benches.join(', '),
            minConstTemp: parseInt(record.constTempRange.split('-')[0]),
            maxConstTemp: parseInt(record.constTempRange.split('-')[1])
        };
        setEntries([newEntry, ...entries]);
    };

    const handleSaveManual = () => {
        const newEntry = {
            id: Date.now(),
            source: 'Manual',
            ...formData,
        };
        setEntries([newEntry, ...entries]);
        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            batchNo: '',
            chamberNo: '',
            benches: '',
            minConstTemp: '',
            maxConstTemp: ''
        });
        if (onSave) onSave();
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                <header className="modal-header">
                    <h2>Steam Curing Record</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {/* Section 1: SCADA Data Fetched */}
                    <div className="collapsible-section">
                        <div className="section-header" onClick={toggleScada}>
                            <span>SCADA Data Fetched</span>
                            <span>{scadaOpen ? '▲' : '▼'}</span>
                        </div>
                        {scadaOpen && (
                            <div className="section-content">
                                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div className="input-group" style={{ width: 'auto' }}>
                                        <label>Batch No.</label>
                                        <select
                                            value={selectedBatch}
                                            onChange={e => setSelectedBatch(e.target.value)}
                                            style={{ minWidth: '120px' }}
                                        >
                                            {[...new Set(scadaData.map(r => r.batchNo))].map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ width: 'auto' }}>
                                        <label>Chamber No.</label>
                                        <select
                                            value={selectedChamber}
                                            onChange={e => setSelectedChamber(e.target.value)}
                                            style={{ minWidth: '120px' }}
                                        >
                                            {scadaData.filter(r => r.batchNo === selectedBatch).map(r => (
                                                <option key={r.chamberNo} value={r.chamberNo}>{r.chamberNo}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {currentScadaRecord ? (
                                    <>
                                        {/* Basic Info */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                            <div>
                                                <span className="mini-label">Date of Casting</span>
                                                <div style={{ fontWeight: 500 }}>{currentScadaRecord.date}</div>
                                            </div>
                                            <div>
                                                <span className="mini-label">Bench Numbers</span>
                                                <div style={{ fontWeight: 500 }}>{currentScadaRecord.benches.join(', ')}</div>
                                            </div>
                                            <div>
                                                <span className="mini-label">Grade</span>
                                                <div style={{ fontWeight: 500 }}>{currentScadaRecord.grade}</div>
                                            </div>
                                            <div>
                                                <span className="mini-label">Chamber</span>
                                                <div style={{ fontWeight: 500 }}>{currentScadaRecord.chamberNo}</div>
                                            </div>
                                        </div>

                                        {/* Detailed Zones */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#64748b' }}>Pre-Steaming Process</h5>
                                            <div className="ui-table-wrapper">
                                                <table className="ui-table" style={{ fontSize: '0.8rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Start Time</th>
                                                            <th>End Time</th>
                                                            <th>Duration (Hrs)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{currentScadaRecord.preStart}</td>
                                                            <td>{currentScadaRecord.preEnd}</td>
                                                            <td>{currentScadaRecord.preDur} hrs</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#64748b' }}>Temp Rising Process</h5>
                                            <div className="ui-table-wrapper">
                                                <table className="ui-table" style={{ fontSize: '0.8rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Start Time</th>
                                                            <th>End Time</th>
                                                            <th>Start Temp</th>
                                                            <th>End Temp</th>
                                                            <th>Period (Hrs)</th>
                                                            <th>Rate (°C/hr)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{currentScadaRecord.riseStart}</td>
                                                            <td>{currentScadaRecord.riseEnd}</td>
                                                            <td>{currentScadaRecord.riseStartTemp}°C</td>
                                                            <td>{currentScadaRecord.riseEndTemp}°C</td>
                                                            <td>{currentScadaRecord.risePeriod} hrs</td>
                                                            <td>{currentScadaRecord.riseRate}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#64748b' }}>Constant Temperature</h5>
                                            <div className="ui-table-wrapper">
                                                <table className="ui-table" style={{ fontSize: '0.8rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Start Time</th>
                                                            <th>End Time</th>
                                                            <th>Duration (Hrs)</th>
                                                            <th>Range (°C)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{currentScadaRecord.constStart}</td>
                                                            <td>{currentScadaRecord.constEnd}</td>
                                                            <td>{currentScadaRecord.constDur} hrs</td>
                                                            <td>{currentScadaRecord.constTempRange}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h5 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#64748b' }}>Cooling Period</h5>
                                            <div className="ui-table-wrapper">
                                                <table className="ui-table" style={{ fontSize: '0.8rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Start Time</th>
                                                            <th>End Time</th>
                                                            <th>Start Temp</th>
                                                            <th>End Temp</th>
                                                            <th>Duration (Hrs)</th>
                                                            <th>Rate (°C/hr)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{currentScadaRecord.coolStart}</td>
                                                            <td>{currentScadaRecord.coolEnd}</td>
                                                            <td>{currentScadaRecord.coolStartTemp}°C</td>
                                                            <td>{currentScadaRecord.coolEndTemp}°C</td>
                                                            <td>{currentScadaRecord.coolDur} hrs</td>
                                                            <td>{currentScadaRecord.coolRate}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <button className="toggle-btn" onClick={() => handleWitness(currentScadaRecord)}>
                                            Witness Data
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No SCADA data available for selected criteria</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 2: Manual / Witnessed Entry */}
                    <div className="collapsible-section">
                        <div className="section-header" onClick={toggleManual}>
                            <span>Scada Witness / Manual Data Entry</span>
                            <span>{manualOpen ? '▲' : '▼'}</span>
                        </div>
                        {manualOpen && (
                            <div className="section-content">
                                {/* List */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Recorded Entries</h4>
                                    <div className="table-scroll-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table className="ui-table" style={{ fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr>
                                                    <th>Source</th>
                                                    <th>Date</th>
                                                    <th>Batch</th>
                                                    <th>Chamber</th>
                                                    <th>Benches</th>
                                                    <th>Const Temp (Min/Max)</th>
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
                                                        <td>{entry.date}</td>
                                                        <td>{entry.batchNo}</td>
                                                        <td>{entry.chamberNo}</td>
                                                        <td>{entry.benches}</td>
                                                        <td>{entry.minConstTemp}°C - {entry.maxConstTemp}°C</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="form-container" style={{ padding: 0 }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Add Manual Entry</h4>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                        <div className="form-field">
                                            <label>Date of Casting</label>
                                            <input type="date" name="date" value={formData.date} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Batch No.</label>
                                            <input type="text" name="batchNo" value={formData.batchNo} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Chamber No.</label>
                                            <input type="text" name="chamberNo" value={formData.chamberNo} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Benches (comma sep)</label>
                                            <input type="text" name="benches" value={formData.benches} onChange={handleFormChange} placeholder="e.g. 1, 2" />
                                        </div>
                                        <div className="form-field">
                                            <label>Min Const Temp (°C)</label>
                                            <input type="number" name="minConstTemp" value={formData.minConstTemp} onChange={handleFormChange} />
                                        </div>
                                        <div className="form-field">
                                            <label>Max Const Temp (°C)</label>
                                            <input type="number" name="maxConstTemp" value={formData.maxConstTemp} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="toggle-btn" onClick={handleSaveManual}>Save Record</button>
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

export default SteamCuring;

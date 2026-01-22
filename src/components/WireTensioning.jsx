import React, { useState, useMemo, useEffect } from 'react';

// Statistical Histogram Component
const TensionHistogram = ({ data, mean, stdDev }) => {
    const bins = 10;
    const minVal = mean - 4 * stdDev;
    const maxVal = mean + 4 * stdDev;
    const binSize = (maxVal - minVal) / bins;

    const binCounts = new Array(bins).fill(0);
    data.forEach(val => {
        const binIndex = Math.min(bins - 1, Math.floor((val - minVal) / binSize));
        if (binIndex >= 0) binCounts[binIndex]++;
    });

    const maxCount = Math.max(...binCounts, 1);
    const height = 120;
    const width = 300;

    // Helper to get X position for a value
    const getX = (val) => ((val - minVal) / (maxVal - minVal)) * width;

    return (
        <div style={{ padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px', textAlign: 'center' }}>Final Load Distribution (Histogram)</h5>
            <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`}>
                {/* Sigma Bands */}
                <rect x={getX(mean - 3 * stdDev)} y="0" width={getX(mean + 3 * stdDev) - getX(mean - 3 * stdDev)} height={height} fill="#fee2e2" fillOpacity="0.3" /> {/* Action Zone (±3σ) */}
                <rect x={getX(mean - 2 * stdDev)} y="0" width={getX(mean + 2 * stdDev) - getX(mean - 2 * stdDev)} height={height} fill="#fef3c7" fillOpacity="0.3" /> {/* Warning Zone (±2σ) */}
                <rect x={getX(mean - 1 * stdDev)} y="0" width={getX(mean + 1 * stdDev) - getX(mean - 1 * stdDev)} height={height} fill="#dcfce7" fillOpacity="0.3" /> {/* Normal Zone (±1σ) */}

                {/* Mean Line */}
                <line x1={getX(mean)} y1="0" x2={getX(mean)} y2={height} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4" />

                {/* Histogram Bars */}
                {binCounts.map((count, i) => {
                    const barHeight = (count / maxCount) * (height - 20);
                    const x = (i * width) / bins;
                    return (
                        <rect
                            key={i}
                            x={x + 2}
                            y={height - barHeight}
                            width={width / bins - 4}
                            height={barHeight}
                            fill="var(--primary-color)"
                            fillOpacity="0.8"
                            rx="1"
                        />
                    );
                })}

                {/* Labels */}
                <text x={getX(mean)} y={height + 15} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="600">μ ({mean.toFixed(1)})</text>
                <text x={getX(mean - 3 * stdDev)} y={height + 15} textAnchor="middle" fontSize="8" fill="#ef4444">-3σ</text>
                <text x={getX(mean + 3 * stdDev)} y={height + 15} textAnchor="middle" fontSize="8" fill="#ef4444">+3σ</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '5px' }}>
                <span style={{ fontSize: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'rgba(220, 252, 231, 0.5)' }}></div> Normal
                </span>
                <span style={{ fontSize: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'rgba(254, 243, 199, 0.5)' }}></div> Warning
                </span>
                <span style={{ fontSize: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'rgba(254, 226, 226, 0.5)' }}></div> Action
                </span>
            </div>
        </div>
    );
};

export const WireTensionStats = ({ data, theoreticalMean = 730 }) => {
    const stats = useMemo(() => {
        if (!data.length) return null;
        const values = data.map(r => r.finalLoad);
        const n = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        const deviationFromTheoretical = ((mean - theoreticalMean) / theoreticalMean) * 100;

        // Sigma bands
        const band1 = values.filter(v => Math.abs(v - mean) <= stdDev).length;
        const band2 = values.filter(v => Math.abs(v - mean) > stdDev && Math.abs(v - mean) <= 2 * stdDev).length;
        const band3 = values.filter(v => Math.abs(v - mean) > 2 * stdDev && Math.abs(v - mean) <= 3 * stdDev).length;
        const bandOoc = values.filter(v => Math.abs(v - mean) > 3 * stdDev).length;

        return {
            min, max, mean, stdDev, cv,
            deviationFromTheoretical,
            normal: (band1 / n) * 100,
            warning: (band2 / n) * 100,
            action: (band3 / n) * 100,
            ooc: (bandOoc / n) * 100,
            values // for histogram
        };
    }, [data, theoreticalMean]);

    if (!stats) return <div>No data available</div>;

    return (
        <div className="tension-stats-container">
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
                <div className="calc-card">
                    <span className="mini-label">Min Pre-Stress (Theo)</span>
                    <div className="calc-value">{stats.min.toFixed(0)} KN</div>
                </div>
                <div className="calc-card">
                    <span className="mini-label">Max Pre-Stress (Theo)</span>
                    <div className="calc-value">{stats.max.toFixed(0)} KN</div>
                </div>
                <div className="calc-card">
                    <span className="mini-label">Mean Pre-Stress (Theo)</span>
                    <div className="calc-value">{stats.mean.toFixed(1)} KN</div>
                </div>
                <div className="calc-card">
                    <span className="mini-label">Standard Deviation (σ)</span>
                    <div className="calc-value">{stats.stdDev.toFixed(2)}</div>
                </div>
                <div className="calc-card">
                    <span className="mini-label">Coeff. of Variation (CV%)</span>
                    <div className="calc-value">{stats.cv.toFixed(2)}%</div>
                </div>
                <div className="calc-card">
                    <span className="mini-label">Dev. (Theo vs Final)</span>
                    <div className="calc-value" style={{ color: Math.abs(stats.deviationFromTheoretical) > 2 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {stats.deviationFromTheoretical > 0 ? '+' : ''}{stats.deviationFromTheoretical.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <TensionHistogram data={stats.values} mean={stats.mean} stdDev={stats.stdDev} />
                </div>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>Control Zone Distribution</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Normal (±1σ)', value: stats.normal, color: 'var(--color-success)' },
                            { label: 'Warning (±2σ)', value: stats.warning, color: 'var(--color-warning)' },
                            { label: 'Action (±3σ)', value: stats.action, color: 'var(--color-danger)' },
                            { label: 'Out of Control (>3σ)', value: stats.ooc, color: '#000' }
                        ].map(zone => (
                            <div key={zone.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                                    <span>{zone.label}</span>
                                    <span style={{ fontWeight: 'bold' }}>{zone.value.toFixed(1)}%</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${zone.value}%`, background: zone.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const WireTensioning = ({ onBack, batches = [] }) => {
    const [scadaOpen, setScadaOpen] = useState(true);
    const [manualOpen, setManualOpen] = useState(true);
    const [listOpen, setListOpen] = useState(true);

    const [selectedBatch, setSelectedBatch] = useState(batches[0]?.batchNo || '601');
    const [activeSleeperType] = useState('Pre-stressed Concrete Sleeper');
    const [wiresPerSleeper] = useState(18);

    // Mock SCADA Data
    const [scadaRecords, setScadaRecords] = useState([
        { id: 1, time: '10:05', batchNo: '601', benchNo: '401', finalLoad: 732, wires: 18 },
        { id: 2, time: '10:12', batchNo: '601', benchNo: '402', finalLoad: 728, wires: 18 },
        { id: 3, time: '10:20', batchNo: '601', benchNo: '403', finalLoad: 735, wires: 18 },
        { id: 4, time: '10:28', batchNo: '601', benchNo: '404', finalLoad: 740, wires: 18 },
        { id: 5, time: '10:35', batchNo: '601', benchNo: '405', finalLoad: 725, wires: 18 },
        { id: 6, time: '10:42', batchNo: '601', benchNo: '406', finalLoad: 731, wires: 18 },
        { id: 7, time: '10:50', batchNo: '601', benchNo: '407', finalLoad: 733, wires: 18 },
        { id: 8, time: '10:58', batchNo: '601', benchNo: '408', finalLoad: 729, wires: 18 },
        { id: 9, time: '11:05', batchNo: '601', benchNo: '409', finalLoad: 734, wires: 18 },
        { id: 10, time: '11:12', batchNo: '601', benchNo: '410', finalLoad: 730, wires: 18 },
    ]);

    // Entries (Manual + Witnessed)
    const [entries, setEntries] = useState([
        { id: 101, source: 'Manual', time: '09:45', batchNo: '601', benchNo: '399', type: 'Pre-stressed', wires: 18, finalLoad: 730, loadPerWire: 40.56, editable: true }
    ]);

    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        finalLoad: ''
    });

    // Auto calculate load per wire
    const calculatedLoadPerWire = useMemo(() => {
        if (!formData.finalLoad) return '0.00';
        return (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2);
    }, [formData.finalLoad, wiresPerSleeper]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveManual = () => {
        if (!formData.benchNo || !formData.finalLoad) return;

        const newEntry = {
            id: Date.now(),
            source: 'Manual',
            ...formData,
            type: activeSleeperType,
            wires: wiresPerSleeper,
            loadPerWire: parseFloat(calculatedLoadPerWire),
            editable: true
        };
        setEntries([newEntry, ...entries]);
        setFormData({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            batchNo: selectedBatch,
            benchNo: '',
            finalLoad: ''
        });
    };

    const handleWitness = (record) => {
        const newEntry = {
            id: Date.now(),
            source: 'Scada Witnessed',
            time: record.time,
            batchNo: record.batchNo,
            benchNo: record.benchNo,
            type: activeSleeperType,
            wires: record.wires,
            finalLoad: record.finalLoad,
            loadPerWire: (record.finalLoad / record.wires).toFixed(2),
            editable: false
        };
        setEntries([newEntry, ...entries]);
        // Remove from scada list to avoid double witness
        // setScadaRecords(scadaRecords.filter(r => r.id !== record.id));
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                <header className="modal-header">
                    <h2>Wire Tensioning Sub-Module</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {/* SCADA Section */}
                    <div className="collapsible-section">
                        <div className="section-header" onClick={() => setScadaOpen(!scadaOpen)}>
                            <span>SCADA Data Fetched (Batch {selectedBatch})</span>
                            <span style={{ fontSize: '0.8rem' }}>{scadaOpen ? '▲' : '▼'}</span>
                        </div>
                        {scadaOpen && (
                            <div className="section-content">
                                <div className="table-scroll-container">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Batch</th>
                                                <th>Bench</th>
                                                <th>Final Load (KN)</th>
                                                <th>Wires</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scadaRecords.map(record => (
                                                <tr key={record.id}>
                                                    <td>{record.time}</td>
                                                    <td>{record.batchNo}</td>
                                                    <td>{record.benchNo}</td>
                                                    <td>{record.finalLoad}</td>
                                                    <td>{record.wires}</td>
                                                    <td>
                                                        <button
                                                            className="btn-action"
                                                            style={{ fontSize: 'var(--fs-xxs)', padding: '4px 10px' }}
                                                            onClick={() => handleWitness(record)}
                                                        >
                                                            Witness
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Entry Section */}
                    <div className="collapsible-section">
                        <div className="section-header" onClick={() => setManualOpen(!manualOpen)}>
                            <span>Manual Data Entry Form</span>
                            <span style={{ fontSize: '0.8rem' }}>{manualOpen ? '▲' : '▼'}</span>
                        </div>
                        {manualOpen && (
                            <div className="section-content">
                                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                    <div className="form-field">
                                        <label>Time</label>
                                        <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-field">
                                        <label>Batch No.</label>
                                        <input type="text" name="batchNo" value={formData.batchNo} readOnly style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-field">
                                        <label>Bench No. <span className="required">*</span></label>
                                        <input type="text" name="benchNo" value={formData.benchNo} onChange={handleFormChange} placeholder="e.g. 405" />
                                    </div>
                                    <div className="form-field">
                                        <label>Sleeper Type</label>
                                        <input type="text" value={activeSleeperType} readOnly style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-field">
                                        <label>No. of Wires</label>
                                        <input type="number" value={wiresPerSleeper} readOnly style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-field">
                                        <label>Final Load (KN) <span className="required">*</span></label>
                                        <input type="number" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="e.g. 730" />
                                    </div>
                                    <div className="form-field">
                                        <label>Load Per Wire (KN)</label>
                                        <input type="text" value={calculatedLoadPerWire} readOnly style={{ background: '#f1f5f9', fontWeight: 'bold', color: 'var(--primary-color)' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button className="toggle-btn" onClick={handleSaveManual}>Save Manual Record</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Entry List Section */}
                    <div className="collapsible-section">
                        <div className="section-header" onClick={() => setListOpen(!listOpen)}>
                            <span>List of Data Entries (Manual & Witnessed)</span>
                            <span style={{ fontSize: '0.8rem' }}>{listOpen ? '▲' : '▼'}</span>
                        </div>
                        {listOpen && (
                            <div className="section-content">
                                <div className="table-scroll-container">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Source</th>
                                                <th>Time</th>
                                                <th>Batch</th>
                                                <th>Bench</th>
                                                <th>Final Load</th>
                                                <th>Wires</th>
                                                <th>Load/Wire</th>
                                                <th>Action</th>
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
                                                    <td>{entry.finalLoad} KN</td>
                                                    <td>{entry.wires}</td>
                                                    <td>{entry.loadPerWire}</td>
                                                    <td>
                                                        {entry.editable ? (
                                                            <button className="btn-action secondary" style={{ fontSize: '10px' }}>Edit</button>
                                                        ) : (
                                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                                                        )}
                                                    </td>
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
        </div>
    );
};

export default WireTensioning;

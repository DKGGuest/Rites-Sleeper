import React, { useState, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * SteamCuring Feature
 * Monitors the multi-stage steam curing process: Pre-Steaming, Rising, Constant, and Cooling.
 */
const SteamCuring = ({ onBack, onSave }) => {
    const [selectedBatch, setSelectedBatch] = useState('605');
    const [selectedChamber, setSelectedChamber] = useState('1');

    const scadaData = [
        {
            id: 1, batchNo: '605', chamberNo: '1', date: '2026-01-20', benches: ['1', '2'], grade: 'M55',
            preDur: 2.25, riseRate: 13.3, constTempRange: '55-58', coolRate: 11.2
        },
    ];

    const [entries, setEntries] = useState([
        { id: 101, source: 'Manual', date: '2026-01-19', batchNo: '604', chamberNo: '5', benches: '12, 13', minConstTemp: 56, maxConstTemp: 59 }
    ]);

    const currentScadaRecord = useMemo(() => {
        return scadaData.find(r => r.batchNo === selectedBatch && r.chamberNo === selectedChamber) || null;
    }, [selectedBatch, selectedChamber]);

    const handleWitness = () => {
        if (!currentScadaRecord) return;
        const newEntry = {
            id: Date.now(),
            source: 'Scada Witnessed',
            ...currentScadaRecord,
            benches: currentScadaRecord.benches.join(', '),
            minConstTemp: parseInt(currentScadaRecord.constTempRange.split('-')[0]),
            maxConstTemp: parseInt(currentScadaRecord.constTempRange.split('-')[1])
        };
        setEntries(prev => [newEntry, ...prev]);
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px' }}>
                <header className="modal-header">
                    <h2>Steam Curing Process Monitor</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    <CollapsibleSection title="Plant SCADA Integration">
                        <div style={{ display: 'flex', gap: '1rem', mb: '1rem' }}>
                            <div className="form-field">
                                <label>Batch</label>
                                <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    <option value="605">605</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Chamber</label>
                                <select value={selectedChamber} onChange={e => setSelectedChamber(e.target.value)}>
                                    <option value="1">1</option>
                                </select>
                            </div>
                        </div>

                        {currentScadaRecord && (
                            <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                                <div className="calc-card"><span className="mini-label">Pre-Steam Dur</span><div className="calc-value">{currentScadaRecord.preDur} hrs</div></div>
                                <div className="calc-card"><span className="mini-label">Rising Rate</span><div className="calc-value">{currentScadaRecord.riseRate} °C/hr</div></div>
                                <div className="calc-card"><span className="mini-label">Constant Temp</span><div className="calc-value">{currentScadaRecord.constTempRange} °C</div></div>
                                <div className="calc-card"><span className="mini-label">Cooling Rate</span><div className="calc-value">{currentScadaRecord.coolRate} °C/hr</div></div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button className="toggle-btn" onClick={handleWitness}>Witness Cycle</button>
                                </div>
                            </div>
                        )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Historical Shift Records" defaultOpen={false}>
                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Benches</th><th>Temp Range</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(entry => (
                                        <tr key={entry.id}>
                                            <td data-label="Source"><span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>{entry.source}</span></td>
                                            <td data-label="Date"><span>{entry.date}</span></td>
                                            <td data-label="Batch"><span>{entry.batchNo}</span></td>
                                            <td data-label="Chamber"><span>{entry.chamberNo}</span></td>
                                            <td data-label="Benches"><span>{entry.benches}</span></td>
                                            <td data-label="Temp"><span>{entry.minConstTemp}° - {entry.maxConstTemp}°</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
};

export default SteamCuring;

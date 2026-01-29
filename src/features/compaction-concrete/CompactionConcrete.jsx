import React, { useState, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * CompactionConcrete Feature
 * Tracks vibration RPM and duration for concrete compaction via SCADA or manual entry.
 */
const CompactionConcrete = ({ onBack, onSave }) => {
    const [selectedBatch, setSelectedBatch] = useState('605');

    const [scadaRecords, setScadaRecords] = useState([
        { id: 101, time: '09:15:22', batchNo: '605', benchNo: '1', rpm: 2850, duration: 45, vibratorId: 'VIB-01' },
        { id: 102, time: '09:16:45', batchNo: '605', benchNo: '1', rpm: 2900, duration: 48, vibratorId: 'VIB-02' },
        { id: 103, time: '09:18:10', batchNo: '605', benchNo: '2', rpm: 2880, duration: 42, vibratorId: 'VIB-03' },
    ]);

    const [entries, setEntries] = useState([
        { id: 1, date: '2026-01-20', time: '08:30', batchNo: '604', benchNo: '3', tachometers: 4, workingTachos: 4, minRpm: 2800, maxRpm: 2950, avgDuration: 45, source: 'Manual' }
    ]);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '', benchNo: '', tachometers: 4, workingTachos: 4, minRpm: 0, maxRpm: 0, avgDuration: 0
    });

    const handleWitness = (record) => {
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: record.time,
            batchNo: record.batchNo,
            benchNo: record.benchNo,
            tachometers: 1,
            workingTachos: 1,
            minRpm: record.rpm,
            maxRpm: record.rpm,
            avgDuration: record.duration,
            source: 'Scada Witnessed'
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
    };

    const handleSaveManual = () => {
        const newEntry = { ...formData, id: Date.now(), source: 'Manual' };
        setEntries(prev => [newEntry, ...prev]);
        setFormData({ ...formData, batchNo: '', benchNo: '', minRpm: 0, maxRpm: 0, avgDuration: 0 });
        if (onSave) onSave();
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                <header className="modal-header">
                    <h2>Compaction Quality Control</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    <CollapsibleSection title={`SCADA Live Vibration Data (Batch ${selectedBatch})`}>
                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Time</th><th>Bench</th><th>Vibrator</th><th>RPM</th><th>Duration</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scadaRecords.filter(r => r.batchNo === selectedBatch).map(record => (
                                        <tr key={record.id}>
                                            <td data-label="Time"><span>{record.time}</span></td>
                                            <td data-label="Bench"><span>{record.benchNo}</span></td>
                                            <td data-label="Vibrator"><span>{record.vibratorId}</span></td>
                                            <td data-label="RPM"><span>{record.rpm}</span></td>
                                            <td data-label="Sec"><span>{record.duration}</span></td>
                                            <td data-label="Action"><button className="btn-action" onClick={() => handleWitness(record)}>Witness</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Inspection Log & Manual Entry">
                        <div className="form-grid" style={{ marginBottom: '2rem' }}>
                            <div className="form-field"><label>Bench No.</label><input type="number" value={formData.benchNo} onChange={e => setFormData({ ...formData, benchNo: e.target.value })} /></div>
                            <div className="form-field"><label>Min RPM</label><input type="number" value={formData.minRpm} onChange={e => setFormData({ ...formData, minRpm: e.target.value })} /></div>
                            <div className="form-field"><label>Max RPM</label><input type="number" value={formData.maxRpm} onChange={e => setFormData({ ...formData, maxRpm: e.target.value })} /></div>
                            <div className="form-actions-center" style={{ gridColumn: 'span 2' }}>
                                <button className="toggle-btn" onClick={handleSaveManual}>Confirm Manual Entry</button>
                            </div>
                        </div>

                        <div className="data-table-section">
                            <div className="table-title-bar">Shift Compaction Records</div>
                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Source</th><th>Time</th><th>Bench</th><th>RPM (Min/Max)</th><th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(entry => (
                                            <tr key={entry.id}>
                                                <td data-label="Source"><span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>{entry.source}</span></td>
                                                <td data-label="Time"><span>{entry.time}</span></td>
                                                <td data-label="Bench"><span>{entry.benchNo}</span></td>
                                                <td data-label="RPM"><span>{entry.minRpm} - {entry.maxRpm}</span></td>
                                                <td data-label="Sec"><span>{entry.avgDuration}s</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
};

export default CompactionConcrete;

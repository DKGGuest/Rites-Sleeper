import React, { useState, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const CompactionConcrete = ({ onBack, onSave }) => {
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
        { id: 1, date: '2026-01-30', time: '09:45', batchNo: '614', benchNo: '10', tachoCount: 4, workingTachos: 4, minRpm: 8800, maxRpm: 9200, duration: 45, source: 'Manual' }
    ]);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: '', benchNo: '', tachoCount: 4, workingTachos: 4, minRpm: '', maxRpm: '', duration: ''
    });

    const batches = [...new Set(scadaRecords.map(r => r.batchNo))];

    const handleWitness = (record) => {
        // Find min/max from vibrators
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
            source: 'Scada Witnessed',
            originalScadaId: record.id
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
    };

    const [editingId, setEditingId] = useState(null);

    const isRecordEditable = (timestamp) => {
        if (!timestamp) return true;
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (8 * 60 * 60 * 1000); // 8 hour shift window
    };

    const handleEdit = (entry) => {
        if (entry.source !== 'Manual') {
            alert('Only manual entries can be modified.');
            return;
        }
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveManual = () => {
        if (!manualForm.batchNo || !manualForm.benchNo) {
            alert('Please fill at least Batch and Bench numbers');
            return;
        }

        if (editingId) {
            setEntries(prev => prev.map(e => e.id === editingId ? { ...manualForm, id: editingId, source: 'Manual', timestamp: new Date().toISOString() } : e));
            setEditingId(null);
            alert('Manual entry updated.');
        } else {
            const newEntry = {
                ...manualForm,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                source: 'Manual'
            };
            setEntries(prev => [newEntry, ...prev]);
        }

        setManualForm({
            ...manualForm,
            batchNo: '', benchNo: '', minRpm: '', maxRpm: '', duration: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        });
        if (onSave) onSave();
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Compaction of Concrete (Vibrator Report)</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Concrete Compaction Monitoring & Assurance</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select Batch:</span>
                            <select
                                className="dash-select"
                                style={{ margin: 0, width: '100px' }}
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                            >
                                {batches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    {/* Initial Information Section - Sleek Dashboard Card Style */}
                    <div style={{ marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Batch Number</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{selectedBatch}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Sleeper Type</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>RT-8746</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Total In Batch</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>120</div>
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>Nos</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Status</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>Active</div>
                            </div>
                        </div>
                    </div>

                    <CollapsibleSection title="SCADA Data Fetched" defaultOpen={true}>
                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Bench No</th>
                                        <th>V1 RPM</th>
                                        <th>V2 RPM</th>
                                        <th>V3 RPM</th>
                                        <th>V4 RPM</th>
                                        <th>Duration (s)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scadaRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No pending SCADA records for this batch.</td></tr>
                                    ) : (
                                        scadaRecords.filter(r => r.batchNo === selectedBatch).slice(0, 10).map(record => (
                                            <tr key={record.id}>
                                                <td data-label="Time"><strong>{record.time}</strong></td>
                                                <td data-label="Bench">{record.benchNo}</td>
                                                <td data-label="V1">{record.v1_rpm}</td>
                                                <td data-label="V2">{record.v2_rpm}</td>
                                                <td data-label="V3">{record.v3_rpm}</td>
                                                <td data-label="V4">{record.v4_rpm}</td>
                                                <td data-label="Sec">{record.duration}s</td>
                                                <td data-label="Action">
                                                    <button className="btn-action" onClick={() => handleWitness(record)}>Witness</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Scada Witness / Manual Data Entry" defaultOpen={true}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Add Manual Observation</h4>
                            <div className="form-grid">
                                <div className="form-field"><label>Date of Casting</label><input type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} /></div>
                                <div className="form-field"><label>Time</label><input type="time" value={manualForm.time} onChange={e => setManualForm({ ...manualForm, time: e.target.value })} /></div>
                                <div className="form-field"><label>Batch No.</label><input type="number" value={manualForm.batchNo} onChange={e => setManualForm({ ...manualForm, batchNo: e.target.value })} /></div>
                                <div className="form-field"><label>Bench No.</label><input type="text" value={manualForm.benchNo} onChange={e => setManualForm({ ...manualForm, benchNo: e.target.value })} /></div>
                                <div className="form-field"><label>No. of Tachometer</label><input type="number" value={manualForm.tachoCount} onChange={e => setManualForm({ ...manualForm, tachoCount: e.target.value })} /></div>
                                <div className="form-field"><label>No. of Tachometer working</label><input type="number" value={manualForm.workingTachos} onChange={e => setManualForm({ ...manualForm, workingTachos: e.target.value })} /></div>
                                <div className="form-field"><label>Min RPM</label><input type="number" value={manualForm.minRpm} onChange={e => setManualForm({ ...manualForm, minRpm: e.target.value })} /></div>
                                <div className="form-field"><label>Max RPM</label><input type="number" value={manualForm.maxRpm} onChange={e => setManualForm({ ...manualForm, maxRpm: e.target.value })} /></div>
                                <div className="form-field"><label>Avg. Duration (s)</label><input type="number" value={manualForm.duration} onChange={e => setManualForm({ ...manualForm, duration: e.target.value })} /></div>
                                <div className="form-actions-center" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                    <button className="toggle-btn" onClick={handleSaveManual}>Save Record</button>
                                </div>
                            </div>
                        </div>

                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>Tacho (W/T)</th><th>RPM (Min/Max)</th><th>Dur.</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(entry => (
                                        <tr key={entry.id}>
                                            <td data-label="Source">
                                                <span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>
                                                    {entry.source}
                                                </span>
                                            </td>
                                            <td data-label="Time">{entry.time}</td>
                                            <td data-label="Batch">{entry.batchNo}</td>
                                            <td data-label="Bench">{entry.benchNo}</td>
                                            <td data-label="Tacho">{entry.workingTachos}/{entry.tachoCount}</td>
                                            <td data-label="RPM">{entry.minRpm} - {entry.maxRpm}</td>
                                            <td data-label="Duration">{entry.duration}s</td>
                                            <td data-label="Action">
                                                {entry.source === 'Manual' && isRecordEditable(entry.timestamp) ? (
                                                    <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>
                                                ) : (
                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                                                )}
                                            </td>
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

export default CompactionConcrete;


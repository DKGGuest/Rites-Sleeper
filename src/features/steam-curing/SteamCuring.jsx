import React, { useState, useMemo, useEffect } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const SteamCuring = ({ onBack, steamRecords: propSteamRecords, setSteamRecords: propSetSteamRecords }) => {
    // Detailed local fallback if not passed from parent
    const [localSteamRecords, setLocalSteamRecords] = useState([
        { id: 101, source: 'Manual', date: '2026-01-29', batchNo: '609', chamberNo: '5', benches: '301, 302', minConstTemp: 57, maxConstTemp: 59, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
    ]);
    const entries = propSteamRecords || localSteamRecords;
    const setEntries = propSetSteamRecords || setLocalSteamRecords;

    // Detailed mock SCADA cycles
    const [scadaCycles, setScadaCycles] = useState([
        {
            id: 1, batchNo: '610', chamberNo: '1', date: '2026-01-30', benches: '401, 402', grade: 'M55',
            pre: { start: '08:00', end: '10:15', dur: 2.25 },
            rise: { start: '10:15', end: '12:30', startTemp: 28, endTemp: 58, dur: 2.25, rate: 13.3 },
            const: { start: '12:30', end: '16:30', tempRange: '58-60', dur: 4.0 },
            cool: { start: '16:30', end: '19:00', startTemp: 58, endTemp: 30, dur: 2.5, rate: 11.2 },
            final: { start: '19:00', end: '20:30', dur: 1.5 }
        },
        {
            id: 2, batchNo: '611', chamberNo: '2', date: '2026-01-30', benches: '405, 406', grade: 'M60',
            pre: { start: '09:00', end: '11:30', dur: 2.5 },
            rise: { start: '11:30', end: '13:45', startTemp: 30, endTemp: 60, dur: 2.25, rate: 13.3 },
            const: { start: '13:45', end: '18:15', tempRange: '60-61', dur: 4.5 },
            cool: { start: '18:15', end: '20:45', startTemp: 60, endTemp: 32, dur: 2.5, rate: 11.2 },
            final: { start: '20:45', end: '22:00', dur: 1.25 }
        }
    ]);

    const [selectedBatch, setSelectedBatch] = useState('610');
    const [selectedChamber, setSelectedChamber] = useState('1');

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
    });

    const activeRecord = useMemo(() => {
        return scadaCycles.find(c => c.batchNo === selectedBatch && c.chamberNo === selectedChamber);
    }, [selectedBatch, selectedChamber, scadaCycles]);

    const handleWitness = () => {
        if (!activeRecord) return;

        const tempRangeSplit = activeRecord.const.tempRange.split('-').map(Number);
        const newEntry = {
            id: Date.now(),
            source: 'Scada Witnessed',
            date: activeRecord.date,
            batchNo: activeRecord.batchNo,
            chamberNo: activeRecord.chamberNo,
            benches: activeRecord.benches,
            minConstTemp: tempRangeSplit[0],
            maxConstTemp: tempRangeSplit[1] || tempRangeSplit[0],
            timestamp: new Date().toISOString()
        };

        setEntries(prev => [newEntry, ...prev]);
        setScadaCycles(prev => prev.filter(c => c.id !== activeRecord.id));
        alert(`Record witnessed.`);
    };

    const [editingId, setEditingId] = useState(null);

    const isRecordEditable = (timestamp) => {
        if (!timestamp) return true;
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (8 * 60 * 60 * 1000);
    };

    const handleEdit = (entry) => {
        if (entry.source !== 'Manual') {
            alert('Only manual entries can be modified.');
            return;
        }
        setEditingId(entry.id);
        setManualForm({
            date: entry.date,
            batchNo: entry.batchNo,
            chamberNo: entry.chamberNo,
            benches: entry.benches,
            minConstTemp: entry.minConstTemp,
            maxConstTemp: entry.maxConstTemp
        });
        const manualSection = document.getElementById('manual-entry-section');
        if (manualSection) manualSection.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSaveManual = () => {
        if (!manualForm.batchNo || !manualForm.chamberNo) {
            alert('Please fill at least Batch and Chamber numbers');
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
            date: new Date().toISOString().split('T')[0],
            batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
        });
    };

    const batches = [...new Set(scadaCycles.map(c => c.batchNo))];
    const chambers = [...new Set(scadaCycles.filter(c => c.batchNo === selectedBatch).map(c => c.chamberNo))];

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Steam Curing Console</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Heat Treatment Cycle Assurance</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Batch:</span>
                                <select className="dash-select" style={{ margin: 0, width: '90px' }} value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Chamber:</span>
                                <select className="dash-select" style={{ margin: 0, width: '80px' }} value={selectedChamber} onChange={e => setSelectedChamber(e.target.value)}>
                                    {chambers.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                                </select>
                            </div>
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
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Chamber No</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{selectedChamber}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Total Benches</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>2</div>
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>Nos</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Cycle Status</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>In Progress</div>
                            </div>
                        </div>
                    </div>

                    <CollapsibleSection title="SCADA Data Fetched" defaultOpen={true}>
                        {!activeRecord ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                                No pending SCADA records for the selected selection.
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div className="table-outer-wrapper">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Phase</th><th>Start</th><th>End</th><th>Parameters</th><th>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ background: '#f0f9ff' }}><td><strong>Pre-Steaming</strong></td><td>{activeRecord.pre.start}</td><td>{activeRecord.pre.end}</td><td>-</td><td>{activeRecord.pre.dur}h</td></tr>
                                            <tr><td><strong>Temp Rising</strong></td><td>{activeRecord.rise.start} ({activeRecord.rise.startTemp}°C)</td><td>{activeRecord.rise.end} ({activeRecord.rise.endTemp}°C)</td><td>{activeRecord.rise.rate}°C/h</td><td>{activeRecord.rise.dur}h</td></tr>
                                            <tr style={{ background: '#fffbeb' }}><td><strong>Constant Temp</strong></td><td>{activeRecord.const.start}</td><td>{activeRecord.const.end}</td><td>{activeRecord.const.tempRange}°C</td><td>{activeRecord.const.dur}h</td></tr>
                                            <tr><td><strong>Cooling Period</strong></td><td>{activeRecord.cool.start} ({activeRecord.cool.startTemp}°C)</td><td>{activeRecord.cool.end} ({activeRecord.cool.endTemp}°C)</td><td>{activeRecord.cool.rate}°C/h</td><td>{activeRecord.cool.dur}h</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <button className="toggle-btn" onClick={handleWitness}>Witness SCADA Cycle</button>
                                </div>
                            </div>
                        )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Scada Witness / Manual Data Entry" defaultOpen={true} id="manual-entry-section">
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Add Manual Steam Log</h4>
                            <div className="form-grid">
                                <div className="form-field"><label>Batch No.</label><input type="number" value={manualForm.batchNo} onChange={e => setManualForm({ ...manualForm, batchNo: e.target.value })} /></div>
                                <div className="form-field"><label>Chamber No.</label><input type="number" value={manualForm.chamberNo} onChange={e => setManualForm({ ...manualForm, chamberNo: e.target.value })} /></div>
                                <div className="form-field"><label>Bench No.</label><input type="text" value={manualForm.benches} onChange={e => setManualForm({ ...manualForm, benches: e.target.value })} /></div>
                                <div className="form-field"><label>Min Temp (°C)</label><input type="number" value={manualForm.minConstTemp} onChange={e => setManualForm({ ...manualForm, minConstTemp: e.target.value })} /></div>
                                <div className="form-field"><label>Max Temp (°C)</label><input type="number" value={manualForm.maxConstTemp} onChange={e => setManualForm({ ...manualForm, maxConstTemp: e.target.value })} /></div>
                                <div className="form-actions-center" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                    <button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button>
                                    {editingId && <button className="toggle-btn secondary" onClick={() => setEditingId(null)} style={{ marginLeft: '1rem' }}>Cancel</button>}
                                </div>
                            </div>
                        </div>

                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Source</th><th>Batch</th><th>Chamber</th><th>Benches</th><th>Temp Range</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(e => (
                                        <tr key={e.id}>
                                            <td data-label="Source"><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                            <td data-label="Batch">{e.batchNo}</td>
                                            <td data-label="Chamber">{e.chamberNo}</td>
                                            <td data-label="Benches">{e.benches}</td>
                                            <td data-label="Temp">{e.minConstTemp}°C - {e.maxConstTemp}°C</td>
                                            <td data-label="Action">
                                                {e.source === 'Manual' && isRecordEditable(e.timestamp) ? (
                                                    <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>
                                                ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>}
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

export default SteamCuring;

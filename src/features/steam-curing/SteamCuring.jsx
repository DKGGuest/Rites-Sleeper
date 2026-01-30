import React, { useState, useMemo, useEffect } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const SteamCuring = ({ onBack, onSave }) => {
    const [selectedBatch, setSelectedBatch] = useState('610');
    const [selectedChamber, setSelectedChamber] = useState('1');

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

    const [entries, setEntries] = useState([
        { id: 101, source: 'Manual', date: '2026-01-29', batchNo: '609', chamberNo: '5', benches: '301, 302', minConstTemp: 57, maxConstTemp: 59 }
    ]);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
    });

    const activeRecord = useMemo(() => {
        return scadaCycles.find(c => c.batchNo === selectedBatch && c.chamberNo === selectedChamber);
    }, [selectedBatch, selectedChamber]);

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
            maxConstTemp: tempRangeSplit[1] || tempRangeSplit[0]
        };

        setEntries(prev => [newEntry, ...prev]);
        setScadaCycles(prev => prev.filter(c => c.id !== activeRecord.id));
        alert(`Record for Batch ${activeRecord.batchNo} Chamber ${activeRecord.chamberNo} witnessed.`);
    };

    const [editingId, setEditingId] = useState(null);

    const isRecordEditable = (timestamp) => {
        if (!timestamp) return true; // New entries
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
            batchNo: entry.batchNo,
            chamberNo: entry.chamberNo,
            benches: entry.benches,
            minConstTemp: entry.minConstTemp,
            maxConstTemp: entry.maxConstTemp
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Steam Curing Console</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Heat Treatment Cycle Management</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label style={{ fontSize: '10px' }}>Batch No</label>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    {[...new Set(scadaCycles.map(c => c.batchNo))].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label style={{ fontSize: '10px' }}>Chamber</label>
                                <select className="dash-select" value={selectedChamber} onChange={e => setSelectedChamber(e.target.value)}>
                                    {[...new Set(scadaCycles.filter(c => c.batchNo === selectedBatch).map(c => c.chamberNo))].map(ch => <option key={ch} value={ch}>{ch}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    <CollapsibleSection title="SCADA Data Fetched" defaultOpen={true}>
                        {!activeRecord ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                                No SCADA records found for the selected Batch & Chamber.
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                                    <div><span className="mini-label">Batch No</span><div style={{ fontWeight: '700' }}>{activeRecord.batchNo}</div></div>
                                    <div><span className="mini-label">Chamber No</span><div style={{ fontWeight: '700' }}>{activeRecord.chamberNo}</div></div>
                                    <div><span className="mini-label">Date of Casting</span><div>{activeRecord.date}</div></div>
                                    <div><span className="mini-label">Bench Numbers</span><div style={{ fontSize: '0.85rem' }}>{activeRecord.benches}</div></div>
                                    <div><span className="mini-label">Grade</span><div className="status-pill manual">{activeRecord.grade}</div></div>
                                </div>

                                <div className="table-outer-wrapper">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '25%' }}>Process Phase</th>
                                                <th>Start Time</th>
                                                <th>End Time</th>
                                                <th>Parameters</th>
                                                <th>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ background: '#f0f9ff' }}>
                                                <td><strong>Pre-Steaming</strong></td>
                                                <td>{activeRecord.pre.start}</td>
                                                <td>{activeRecord.pre.end}</td>
                                                <td>-</td>
                                                <td><strong>{activeRecord.pre.dur} hrs</strong></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Temp Rising</strong></td>
                                                <td>{activeRecord.rise.start} ({activeRecord.rise.startTemp}°C)</td>
                                                <td>{activeRecord.rise.end} ({activeRecord.rise.endTemp}°C)</td>
                                                <td>Rate: {activeRecord.rise.rate} °C/hr</td>
                                                <td><strong>{activeRecord.rise.dur} hrs</strong></td>
                                            </tr>
                                            <tr style={{ background: '#fffbeb' }}>
                                                <td><strong>Constant Temp</strong></td>
                                                <td>{activeRecord.const.start}</td>
                                                <td>{activeRecord.const.end}</td>
                                                <td>Range: {activeRecord.const.tempRange} °C</td>
                                                <td><strong>{activeRecord.const.dur} hrs</strong></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Cooling Period</strong></td>
                                                <td>{activeRecord.cool.start} ({activeRecord.cool.startTemp}°C)</td>
                                                <td>{activeRecord.cool.end} ({activeRecord.cool.endTemp}°C)</td>
                                                <td>Rate: {activeRecord.cool.rate} °C/hr</td>
                                                <td><strong>{activeRecord.cool.dur} hrs</strong></td>
                                            </tr>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <td><strong>Final Stage</strong></td>
                                                <td>{activeRecord.final.start}</td>
                                                <td>{activeRecord.final.end}</td>
                                                <td>-</td>
                                                <td><strong>{activeRecord.final.dur} hrs</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <button className="toggle-btn" style={{ minWidth: '300px' }} onClick={handleWitness}>
                                        Witness SCADA Record
                                    </button>
                                </div>
                            </div>
                        )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Scada Witness / Manual Data Entry" defaultOpen={true}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1.25rem 0', color: '#1e293b' }}>Manual Cycle Entry</h4>
                            <div className="form-grid">
                                <div className="form-field"><label>Date of Casting</label><input type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} /></div>
                                <div className="form-field"><label>Batch No.</label><input type="number" value={manualForm.batchNo} onChange={e => setManualForm({ ...manualForm, batchNo: e.target.value })} /></div>
                                <div className="form-field"><label>Chamber No.</label><input type="number" value={manualForm.chamberNo} onChange={e => setManualForm({ ...manualForm, chamberNo: e.target.value })} /></div>
                                <div className="form-field"><label>Bench No. (Multiple)</label><input type="text" placeholder="e.g. 401, 402" value={manualForm.benches} onChange={e => setManualForm({ ...manualForm, benches: e.target.value })} /></div>
                                <div className="form-field">
                                    <label>Min Const. Temp</label>
                                    <input
                                        type="number"
                                        value={manualForm.minConstTemp}
                                        onChange={e => setManualForm({ ...manualForm, minConstTemp: e.target.value })}
                                        style={{
                                            backgroundColor: (manualForm.minConstTemp && (manualForm.minConstTemp < 55 || manualForm.minConstTemp > 60)) ? '#fee2e2' : '',
                                            borderColor: (manualForm.minConstTemp && (manualForm.minConstTemp < 55 || manualForm.minConstTemp > 60)) ? '#ef4444' : '',
                                            color: (manualForm.minConstTemp && (manualForm.minConstTemp < 55 || manualForm.minConstTemp > 60)) ? '#991b1b' : ''
                                        }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>Range: 55-60°C</span>
                                </div>
                                <div className="form-field">
                                    <label>Max Const. Temp</label>
                                    <input
                                        type="number"
                                        value={manualForm.maxConstTemp}
                                        onChange={e => setManualForm({ ...manualForm, maxConstTemp: e.target.value })}
                                        style={{
                                            backgroundColor: (manualForm.maxConstTemp && (manualForm.maxConstTemp < 55 || manualForm.maxConstTemp > 60)) ? '#fee2e2' : '',
                                            borderColor: (manualForm.maxConstTemp && (manualForm.maxConstTemp < 55 || manualForm.maxConstTemp > 60)) ? '#ef4444' : '',
                                            color: (manualForm.maxConstTemp && (manualForm.maxConstTemp < 55 || manualForm.maxConstTemp > 60)) ? '#991b1b' : ''
                                        }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>Range: 55-60°C</span>
                                </div>
                                <div className="form-actions-center" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                                    <button className="toggle-btn" onClick={handleSaveManual}>Save Manual Record</button>
                                </div>
                            </div>
                        </div>

                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Benches</th><th>Temp Range</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(e => (
                                        <tr key={e.id}>
                                            <td data-label="Source"><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                            <td data-label="Date">{e.date}</td>
                                            <td data-label="Batch">{e.batchNo}</td>
                                            <td data-label="Chamber">{e.chamberNo}</td>
                                            <td data-label="Benches">{e.benches}</td>
                                            <td data-label="Temp">{e.minConstTemp}°C - {e.maxConstTemp}°C</td>
                                            <td data-label="Action">
                                                {e.source === 'Manual' && isRecordEditable(e.timestamp) ? (
                                                    <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>
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

export default SteamCuring;

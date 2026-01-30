import React, { useState, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * SteamCuring Feature
 * Monitors the multi-stage steam curing process: Pre-Steaming, Rising, Constant, and Cooling.
 */
const SteamCuring = ({ onBack, onSave }) => {
    const [selectedBatch, setSelectedBatch] = useState('605');
    const [selectedChamber, setSelectedChamber] = useState('1');
    const [isEditing, setIsEditing] = useState(null);

    const scadaData = [
        {
            id: 1, batchNo: '605', chamberNo: '1', date: '2026-01-20', benches: ['1', '2'], grade: 'M55',
            preDur: 2.25, riseRate: 13.3, constTempRange: '55-58', coolRate: 11.2
        },
    ];

    const [entries, setEntries] = useState([
        { id: 101, source: 'Manual', date: '2026-01-19', batchNo: '604', chamberNo: '5', benches: '12, 13', minConstTemp: 56, maxConstTemp: 59 }
    ]);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '605',
        chamberNo: '1',
        benches: '',
        minConstTemp: '',
        maxConstTemp: ''
    });

    const currentScadaRecord = useMemo(() => {
        return scadaData.find(r => r.batchNo === selectedBatch && r.chamberNo === selectedChamber) || null;
    }, [selectedBatch, selectedChamber]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setManualForm(prev => ({ ...prev, [name]: value }));
    };

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

    const handleManualSave = () => {
        if (!manualForm.benches || !manualForm.minConstTemp || !manualForm.maxConstTemp) {
            alert('Please fill all required fields');
            return;
        }

        if (isEditing) {
            setEntries(prev => prev.map(entry => entry.id === isEditing ? { ...manualForm, id: isEditing, source: 'Manual', timestamp: entry.timestamp } : entry));
            setIsEditing(null);
            alert('Record updated successfully');
        } else {
            const newEntry = {
                ...manualForm,
                id: Date.now(),
                source: 'Manual',
                timestamp: new Date().toISOString()
            };
            setEntries(prev => [newEntry, ...prev]);
            alert('Record saved successfully');
        }

        setManualForm({
            date: new Date().toISOString().split('T')[0],
            batchNo: '605',
            chamberNo: '1',
            benches: '',
            minConstTemp: '',
            maxConstTemp: ''
        });
    };

    const isRecordEditable = (timestamp) => {
        if (!timestamp) return false;
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (60 * 60 * 1000); // 1 hour window
    };

    const handleEdit = (entry) => {
        setManualForm({
            date: entry.date,
            batchNo: entry.batchNo,
            chamberNo: entry.chamberNo,
            benches: entry.benches,
            minConstTemp: entry.minConstTemp,
            maxConstTemp: entry.maxConstTemp
        });
        setIsEditing(entry.id);
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px' }}>
                <header className="modal-header">
                    <div>
                        <h2>Steam Curing Process Monitor</h2>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Shift Duty Management</p>
                    </div>
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

                    <CollapsibleSection title={isEditing ? "Edit Manual Entry" : "Add Manual Entry"}>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Date</label>
                                <input type="date" name="date" value={manualForm.date} onChange={handleFormChange} />
                            </div>
                            <div className="form-field">
                                <label>Batch No.</label>
                                <input type="text" name="batchNo" value={manualForm.batchNo} onChange={handleFormChange} placeholder="e.g. 605" />
                            </div>
                            <div className="form-field">
                                <label>Chamber</label>
                                <input type="text" name="chamberNo" value={manualForm.chamberNo} onChange={handleFormChange} placeholder="e.g. 3" />
                            </div>
                            <div className="form-field">
                                <label>Benches</label>
                                <input type="text" name="benches" value={manualForm.benches} onChange={handleFormChange} placeholder="e.g. 15, 16" />
                            </div>
                            <div className="form-field">
                                <label>Min Const Temp</label>
                                <input type="number" name="minConstTemp" value={manualForm.minConstTemp} onChange={handleFormChange} placeholder="e.g. 56" />
                            </div>
                            <div className="form-field">
                                <label>Max Const Temp</label>
                                <input type="number" name="maxConstTemp" value={manualForm.maxConstTemp} onChange={handleFormChange} placeholder="e.g. 60" />
                            </div>
                        </div>
                        <div className="form-actions-center">
                            <button className="toggle-btn" onClick={handleManualSave}>
                                {isEditing ? "Update Record" : "Save Manual Record"}
                            </button>
                            {isEditing && (
                                <button className="toggle-btn" style={{ background: '#94a3b8', marginLeft: '10px' }} onClick={() => {
                                    setIsEditing(null);
                                    setManualForm({
                                        date: new Date().toISOString().split('T')[0],
                                        batchNo: '605',
                                        chamberNo: '1',
                                        benches: '',
                                        minConstTemp: '',
                                        maxConstTemp: ''
                                    });
                                }}>Cancel</button>
                            )}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Historical Shift Records">
                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Benches</th><th>Temp Range</th><th>Action</th>
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
                                            <td data-label="Action">
                                                {entry.source === 'Manual' && isRecordEditable(entry.timestamp) ? (
                                                    <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>
                                                ) : (
                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{entry.source === 'Manual' ? 'Locked' : 'Verified'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {entries.length === 0 && (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No entries found for this shift.</td></tr>
                                    )}
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

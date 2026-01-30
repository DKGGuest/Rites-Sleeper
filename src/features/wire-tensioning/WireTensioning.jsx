import React, { useState, useEffect, useMemo } from 'react';
import WireTensionStats from './components/WireTensionStats';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * WireTensioning Feature
 * Handles integration of SCADA tensioning data and manual pressure logs.
 */
const WireTensioning = ({ onBack, batches = [], sharedState }) => {
    const { tensionRecords, setTensionRecords } = sharedState;
    const [selectedBatch, setSelectedBatch] = useState(batches[0]?.batchNo || '601');
    const [wiresPerSleeper] = useState(18);
    const [editId, setEditId] = useState(null);

    // Mock SCADA records (fetch source)
    const [scadaRecords] = useState([
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

    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        finalLoad: '',
        type: 'RT-1234'
    });

    // Auto-fetch Sleeper Type based on Bench No (Simulated)
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
            source: 'Scada',
            wires: wiresPerSleeper,
            loadPerWire: (parseFloat(record.finalLoad) / wiresPerSleeper).toFixed(2),
            type: 'RT-1234', // Simulated
            editable: false
        };
        setTensionRecords(prev => [newEntry, ...prev]);
        alert(`Record for Bench ${record.benchNo} witnessed and added to logs.`);
    };

    const handleSaveManual = () => {
        if (!formData.benchNo || !formData.finalLoad) {
            alert('Required fields missing');
            return;
        }

        const newEntry = {
            ...formData,
            id: editId || Date.now(),
            source: 'Manual',
            wires: wiresPerSleeper,
            loadPerWire: (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2),
            editable: true
        };

        if (editId) {
            setTensionRecords(prev => prev.map(r => r.id === editId ? newEntry : r));
            setEditId(null);
            alert('Record updated successfully');
        } else {
            setTensionRecords(prev => [newEntry, ...prev]);
        }

        setFormData(prev => ({ ...prev, benchNo: '', finalLoad: '' }));
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
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px' }}>
                <header className="modal-header">
                    <div>
                        <h2>Wire Tensioning Control Console</h2>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Logged in as Sleeper Process IE</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    <div style={{ marginBottom: '2rem' }}>
                        <CollapsibleSection title="SCADA Data Fetched (Live Monitoring)">
                            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Select active batch for monitoring:</span>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                </select>
                            </div>
                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th><th>Bench</th><th>Final Load (KN)</th><th>Wires</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scadaRecords.map(record => (
                                            <tr key={record.id}>
                                                <td data-label="Time"><span>{record.time}</span></td>
                                                <td data-label="Bench"><span>{record.benchNo}</span></td>
                                                <td data-label="Load"><span>{record.finalLoad}</span></td>
                                                <td data-label="Wires"><span>{wiresPerSleeper}</span></td>
                                                <td data-label="Action">
                                                    <button className="btn-action" onClick={() => handleWitness(record)} style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', border: '1px solid #05966950' }}>
                                                        Witness
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title={editId ? "Edit Manual Entry" : "Manual Data Entry Form"}>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                                </div>
                                <div className="form-field">
                                    <label>Batch No.</label>
                                    <select name="batchNo" value={formData.batchNo} onChange={handleFormChange}>
                                        {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Bench No. <span className="required">*</span></label>
                                    <input type="text" name="benchNo" value={formData.benchNo} onChange={handleFormChange} placeholder="e.g. 405" />
                                </div>
                                <div className="form-field">
                                    <label>Type of Sleeper (Auto)</label>
                                    <input type="text" value={formData.type} readOnly className="readOnly" style={{ background: '#f8fafc' }} />
                                </div>
                                <div className="form-field">
                                    <label>No. of Wires (Auto Fill)</label>
                                    <input type="text" value={wiresPerSleeper} readOnly className="readOnly" style={{ background: '#f8fafc' }} />
                                </div>
                                <div className="form-field">
                                    <label>Final Load (KN) <span className="required">*</span></label>
                                    <input type="number" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="e.g. 730.0" />
                                </div>
                                <div className="form-field">
                                    <label>Load Per Wire (Auto Calculate)</label>
                                    <div className="calc-value" style={{ fontSize: '1rem', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 'bold' }}>
                                        {formData.finalLoad ? (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2) : '0.00'} KN
                                    </div>
                                </div>
                                <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                    <button className="toggle-btn" onClick={handleSaveManual} style={{ flex: 1, height: '42px' }}>
                                        {editId ? 'Update Record' : 'Save Record'}
                                    </button>
                                    {editId && (
                                        <button className="toggle-btn" onClick={() => {
                                            setEditId(null);
                                            setFormData(prev => ({ ...prev, benchNo: '', finalLoad: '' }));
                                        }} style={{ flex: 0.5, height: '42px', background: '#94a3b8' }}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Shift Logs (Manual & SCADA Witnessed)">
                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>Type</th><th>Wires</th><th>Final Load</th><th>Load/Wire</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tensionRecords.map(entry => (
                                            <tr key={entry.id}>
                                                <td data-label="Source">
                                                    <span style={{
                                                        fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px',
                                                        background: entry.source === 'Manual' ? '#eff6ff' : '#ecfdf5',
                                                        color: entry.source === 'Manual' ? '#1d4ed8' : '#059669'
                                                    }}>{entry.source}</span>
                                                </td>
                                                <td data-label="Time"><span>{entry.time}</span></td>
                                                <td data-label="Batch"><span>{entry.batchNo}</span></td>
                                                <td data-label="Bench"><span>{entry.benchNo}</span></td>
                                                <td data-label="Type"><span>{entry.type}</span></td>
                                                <td data-label="Wires"><span>{entry.wires}</span></td>
                                                <td data-label="Load"><span>{entry.finalLoad} KN</span></td>
                                                <td data-label="L/W"><span>{entry.loadPerWire}</span></td>
                                                <td data-label="Action">
                                                    {entry.source === 'Manual' ? (
                                                        <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>
                                                    ) : (
                                                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Scada Link</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {tensionRecords.length === 0 && (
                                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No entries found for this shift.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WireTensioning;

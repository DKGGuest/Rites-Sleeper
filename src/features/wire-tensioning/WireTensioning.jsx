import React, { useState, useEffect, useMemo } from 'react';
import WireTensionStats from './components/WireTensionStats';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * WireTensioning Feature
 * Handles integration of SCADA tensioning data and manual pressure logs.
 */
const WireTensioning = ({ onBack, batches = [], sharedState }) => {
    const { tensionRecords, setTensionRecords } = sharedState;
    const [view, setView] = useState('list'); // 'list' or 'add'
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

    const stats = useMemo(() => {
        if (tensionRecords.length === 0) return null;
        const values = tensionRecords.map(r => parseFloat(r.finalLoad));
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / count;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        const deviationFromTheo = ((mean - 730) / 730) * 100;

        const normalZone = (values.filter(v => Math.abs(v - mean) <= stdDev).length / count) * 100;
        const warningZone = (values.filter(v => Math.abs(v - mean) > stdDev && Math.abs(v - mean) <= 2 * stdDev).length / count) * 100;
        const actionZone = (values.filter(v => Math.abs(v - mean) > 2 * stdDev && Math.abs(v - mean) <= 3 * stdDev).length / count) * 100;
        const outOfControl = (values.filter(v => Math.abs(v - mean) > 3 * stdDev).length / count) * 100;

        return { count, mean, stdDev, cv, deviationFromTheo, values, normalZone, warningZone, actionZone, outOfControl };
    }, [tensionRecords]);

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
            timestamp: new Date().toISOString(),
            source: 'Scada',
            wires: wiresPerSleeper,
            loadPerWire: (parseFloat(record.finalLoad) / wiresPerSleeper).toFixed(2),
            type: 'RT-1234',
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
            timestamp: new Date().toISOString(),
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
        setView('list');
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
        setView('add');
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {view === 'add' && (
                            <button className="back-btn" onClick={() => { setView('list'); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-color)' }}>←</button>
                        )}
                        <div>
                            <h2 style={{ margin: 0 }}>Wire Tensioning Control Console</h2>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Integration of Live SCADA loads and Manual pressure logs</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {view === 'list' ? (
                        <div className="list-view-container fade-in">
                            {/* Section 1: Stats Dashboard */}
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                                <WireTensionStats stats={stats} />
                            </div>

                            {/* Section 2: History Log with Add Button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Recent Pre-Stress Records (Shift Log)</h3>
                                <button className="toggle-btn" onClick={() => setView('add')}>+ Add New Record</button>
                            </div>

                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>Type</th><th>Wires</th><th>Final Load</th><th>Load/Wire</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tensionRecords.length === 0 ? (
                                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No tensioning records found for the current shift.</td></tr>
                                        ) : (
                                            tensionRecords.map(entry => (
                                                <tr key={entry.id}>
                                                    <td data-label="Source">
                                                        <span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`} style={{ fontSize: '9px' }}>{entry.source}</span>
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
                                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Scada Logged</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="add-view-container fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                {/* Form Left Side: Manual Entry & Metadata */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <CollapsibleSection title="01. Initial Identification" isOpen={true}>
                                        <div className="form-grid">
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
                                                <label>Sleeper Type (Auto)</label>
                                                <input type="text" value={formData.type} readOnly className="readOnly" />
                                            </div>
                                            <div className="form-field">
                                                <label>Time of Record</label>
                                                <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                                            </div>
                                        </div>
                                    </CollapsibleSection>

                                    <CollapsibleSection title="02. Manual Pre-Stress Log" isOpen={true}>
                                        <div className="form-grid">
                                            <div className="form-field">
                                                <label>Final Load (KN) <span className="required">*</span></label>
                                                <input type="number" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="e.g. 730" />
                                            </div>
                                            <div className="form-field">
                                                <label>Load Per Wire (Calculated)</label>
                                                <div className="calc-value" style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                                    {formData.finalLoad ? (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2) : '0.00'} <span style={{ fontSize: '0.8rem' }}>KN</span>
                                                </div>
                                            </div>
                                            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                                <button className="toggle-btn" onClick={handleSaveManual} style={{ width: '100%', padding: '12px' }}>
                                                    {editId ? 'Apply Update' : 'Commit Manual Record'}
                                                </button>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>

                                {/* Form Right Side: SCADA Witnessing */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <CollapsibleSection title="03. Live SCADA Integration" isOpen={true}>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Witness real-time data from Tensioning Jack PLC:</p>
                                        <div className="table-outer-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                            <table className="ui-table">
                                                <thead>
                                                    <tr>
                                                        <th>PLC Time</th><th>Bench</th><th>PLC Load</th><th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {scadaRecords.filter(r => r.batchNo === selectedBatch).map(record => (
                                                        <tr key={record.id}>
                                                            <td><span>{record.time}</span></td>
                                                            <td><strong>{record.benchNo}</strong></td>
                                                            <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{record.finalLoad} KN</td>
                                                            <td>
                                                                <button className="btn-action" onClick={() => handleWitness(record)} style={{ fontSize: '10px' }}>Witness</button>
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default WireTensioning;

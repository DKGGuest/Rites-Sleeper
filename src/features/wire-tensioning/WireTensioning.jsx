import React, { useState, useEffect, useMemo } from 'react';
import WireTensionStats from './components/WireTensionStats';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import { useWireTensionStats } from '../../hooks/useStats';

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
    const [scadaRecords, setScadaRecords] = useState([
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

    // Calculate statistics for the selected batch
    const wireTensionStats = useWireTensionStats(tensionRecords, selectedBatch);

    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        finalLoad: '',
        type: 'RT-1234'
    });

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
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
        alert(`Record for Bench ${record.benchNo} witnessed.`);
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

        setFormData(prev => ({
            ...prev,
            benchNo: '',
            finalLoad: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
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
        const manualSection = document.getElementById('manual-entry-section');
        if (manualSection) manualSection.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Wire Tensioning Control Console</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Precision Load Integration & Assurance</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select Batch:</span>
                            <select
                                className="dash-select"
                                style={{ margin: 0, width: '100px' }}
                                value={selectedBatch}
                                onChange={(e) => {
                                    setSelectedBatch(e.target.value);
                                    setFormData(prev => ({ ...prev, batchNo: e.target.value }));
                                }}
                            >
                                {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
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
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>RT-1234</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Total Benches</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>12</div>
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>Nos</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Target Load</span>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>730 KN</div>
                            </div>
                        </div>
                    </div>

                    <CollapsibleSection title="Statistical Analysis" defaultOpen={true}>
                        <WireTensionStats stats={wireTensionStats} />
                    </CollapsibleSection>

                    <CollapsibleSection title="SCADA Data Fetched & Manual Entry" defaultOpen={true} id="manual-entry-section">
                        <div className="table-outer-wrapper" style={{ marginBottom: '2rem' }}>
                            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px 8px 0 0', borderBottom: '2px solid #e2e8f0' }}>
                                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>SCADA Records (Pending Witness)</h4>
                            </div>
                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>PLC Time</th><th>Bench</th><th>PLC Load (KN)</th><th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scadaRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No pending SCADA records for this batch.</td></tr>
                                        ) : (
                                            scadaRecords.filter(r => r.batchNo === selectedBatch).slice(0, 10).map(record => (
                                                <tr key={record.id}>
                                                    <td data-label="Time"><span>{record.time}</span></td>
                                                    <td data-label="Bench"><strong>{record.benchNo}</strong></td>
                                                    <td data-label="Load" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{record.finalLoad} KN</td>
                                                    <td data-label="Action">
                                                        <button className="btn-action" onClick={() => handleWitness(record)}>Witness</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Add Manual Pressure Log</h4>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Bench No. <span className="required">*</span></label>
                                    <input type="text" name="benchNo" value={formData.benchNo} onChange={handleFormChange} placeholder="e.g. 405" />
                                </div>
                                <div className="form-field">
                                    <label>Final Load (KN) <span className="required">*</span></label>
                                    <input type="number" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="e.g. 730" />
                                </div>
                                <div className="form-field">
                                    <label>Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                                </div>
                                <div className="form-field">
                                    <label>Sleeper Type</label>
                                    <input type="text" value={formData.type} readOnly className="readOnly" style={{ background: '#f1f5f9' }} />
                                </div>
                                <div className="form-actions-center" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                    <button className="toggle-btn" onClick={handleSaveManual}>
                                        {editId ? 'Update Record' : 'Save Manual Record'}
                                    </button>
                                    {editId && (
                                        <button className="toggle-btn secondary" onClick={() => { setEditId(null); setFormData(prev => ({ ...prev, benchNo: '', finalLoad: '' })); }} style={{ marginLeft: '1rem' }}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="table-outer-wrapper">
                            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px 8px 0 0', borderBottom: '2px solid #e2e8f0' }}>
                                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>Witnessed & Manual Records</h4>
                            </div>
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Source</th><th>Time</th><th>Batch</th><th>Bench</th><th>Load (KN)</th><th>Load/Wire</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tensionRecords.length === 0 ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No records logged yet.</td></tr>
                                    ) : (
                                        tensionRecords.map(entry => (
                                            <tr key={entry.id}>
                                                <td data-label="Source">
                                                    <span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>{entry.source}</span>
                                                </td>
                                                <td data-label="Time">{entry.time}</td>
                                                <td data-label="Batch">{entry.batchNo}</td>
                                                <td data-label="Bench">{entry.benchNo}</td>
                                                <td data-label="Load">{entry.finalLoad} KN</td>
                                                <td data-label="L/W">{entry.loadPerWire}</td>
                                                <td data-label="Action">
                                                    {entry.source === 'Manual' ? (
                                                        <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>
                                                    ) : (
                                                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
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

export default WireTensioning;

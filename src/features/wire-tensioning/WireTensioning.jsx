import React, { useState, useMemo } from 'react';
import WireTensionStats from './components/WireTensionStats';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * WireTensioning Feature
 * Handles integration of SCADA tensioning data and manual pressure logs.
 */
const WireTensioning = ({ onBack, batches = [] }) => {
    const [selectedBatch] = useState(batches[0]?.batchNo || '601');
    const [wiresPerSleeper] = useState(18);

    const [scadaRecords] = useState([
        { id: 1, time: '10:05', batchNo: '601', benchNo: '401', finalLoad: 732, wires: 18 },
        { id: 2, time: '10:12', batchNo: '601', benchNo: '402', finalLoad: 728, wires: 18 },
        { id: 3, time: '10:20', batchNo: '601', benchNo: '403', finalLoad: 735, wires: 18 },
        { id: 4, time: '10:28', batchNo: '601', benchNo: '404', finalLoad: 740, wires: 18 },
        { id: 5, time: '10:35', batchNo: '601', benchNo: '405', finalLoad: 725, wires: 18 },
    ]);

    const [entries, setEntries] = useState([
        { id: 101, source: 'Manual', time: '09:45', batchNo: '601', benchNo: '399', type: 'Pre-stressed', wires: 18, finalLoad: 730, loadPerWire: 40.56, editable: true }
    ]);

    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        finalLoad: ''
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveManual = () => {
        if (!formData.benchNo || !formData.finalLoad) {
            alert('Required fields missing');
            return;
        }

        const newEntry = {
            id: Date.now(),
            source: 'Manual',
            ...formData,
            wires: wiresPerSleeper,
            loadPerWire: (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2),
            editable: true
        };
        setEntries(prev => [newEntry, ...prev]);
        setFormData(prev => ({ ...prev, benchNo: '', finalLoad: '' }));
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px' }}>
                <header className="modal-header">
                    <h2>Wire Tensioning Control Console</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    <WireTensionStats data={entries} />

                    <div style={{ marginTop: '2rem' }}>
                        <CollapsibleSection title={`SCADA Live Feed (Batch ${selectedBatch})`}>
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
                                                <td data-label="Wires"><span>{record.wires}</span></td>
                                                <td data-label="Action">
                                                    <button className="btn-action" style={{ fontSize: '10px' }}>Witness</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Manual Data Entry Form">
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Bench No.</label>
                                    <input type="text" name="benchNo" value={formData.benchNo} onChange={handleFormChange} placeholder="e.g. 405" />
                                </div>
                                <div className="form-field">
                                    <label>Final Load (KN)</label>
                                    <input type="number" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="730.0" />
                                </div>
                                <div className="form-actions-center">
                                    <button className="toggle-btn" onClick={handleSaveManual}>Save Record</button>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Verification History">
                            <div className="table-outer-wrapper">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Source</th><th>Time</th><th>Bench</th><th>Final Load</th><th>Wires</th><th>Load/Wire</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(entry => (
                                            <tr key={entry.id}>
                                                <td data-label="Source">
                                                    <span style={{
                                                        fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px',
                                                        background: entry.source === 'Manual' ? '#eff6ff' : '#ecfdf5',
                                                        color: entry.source === 'Manual' ? '#1d4ed8' : '#059669'
                                                    }}>{entry.source}</span>
                                                </td>
                                                <td data-label="Time"><span>{entry.time}</span></td>
                                                <td data-label="Bench"><span>{entry.benchNo}</span></td>
                                                <td data-label="Load"><span>{entry.finalLoad} KN</span></td>
                                                <td data-label="Wires"><span>{entry.wires}</span></td>
                                                <td data-label="L/W"><span>{entry.loadPerWire}</span></td>
                                            </tr>
                                        ))}
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

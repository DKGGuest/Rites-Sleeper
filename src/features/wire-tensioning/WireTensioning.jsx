import React, { useState, useEffect, useMemo } from 'react';
import WireTensionStats from './components/WireTensionStats';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import { useWireTensionStats } from '../../hooks/useStats';

/**
 * WireTensioning Feature
 * Handles integration of SCADA tensioning data and manual pressure logs.
 */
const TensionSubCard = ({ id, title, color, statusDetail, isActive, onClick }) => {
    const label = id === 'stats' ? 'ANALYSIS' : id === 'witnessed' ? 'HISTORY' : 'SCADA';
    return (
        <div
            onClick={onClick}
            style={{
                flex: '1 1 200px',
                padding: '16px 20px',
                background: isActive ? '#fff' : '#f8fafc',
                border: `1px solid ${isActive ? color : '#e2e8f0'}`,
                borderTop: `4px solid ${color}`,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 4px 12px ${color}20` : 'none',
                transform: isActive ? 'translateY(-2px)' : 'none',
                position: 'relative',
                minHeight: '100px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: isActive ? color : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, opacity: isActive ? 1 : 0.4 }}></span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{title}</span>
            <div style={{ marginTop: 'auto', fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                {statusDetail}
            </div>
        </div>
    );
};

const WireTensioning = ({ onBack, batches = [], sharedState, displayMode = 'modal', showForm: propsShowForm, setShowForm: propsSetShowForm }) => {
    const { tensionRecords, setTensionRecords } = sharedState;
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'stats', 'witnessed', 'scada'
    const [localShowForm, setLocalShowForm] = useState(false);

    const showForm = propsShowForm !== undefined ? propsShowForm : localShowForm;
    const setShowForm = propsSetShowForm !== undefined ? propsSetShowForm : setLocalShowForm;
    const [selectedBatch, setSelectedBatch] = useState('');
    const [wiresPerSleeper] = useState(18);
    const [editId, setEditId] = useState(null);

    // Mock SCADA records
    const [scadaRecords, setScadaRecords] = useState([
        { id: 201, time: '11:05', batchNo: '601', benchNo: '411', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 195, forceElongation: 725, totalLoad: 730, finalLoad: 733 },
        { id: 202, time: '11:12', batchNo: '601', benchNo: '412', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 192, forceElongation: 720, totalLoad: 725, finalLoad: 729 },
        { id: 203, time: '11:20', batchNo: '601', benchNo: '413', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 198, forceElongation: 732, totalLoad: 735, finalLoad: 736 },
        { id: 204, time: '11:28', batchNo: '601', benchNo: '414', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 202, forceElongation: 740, totalLoad: 740, finalLoad: 742 },
        { id: 205, time: '11:35', batchNo: '601', benchNo: '415', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 190, forceElongation: 718, totalLoad: 720, finalLoad: 726 },
        { id: 206, time: '11:42', batchNo: '601', benchNo: '416', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 194, forceElongation: 728, totalLoad: 730, finalLoad: 731 },
        { id: 207, time: '11:50', batchNo: '601', benchNo: '417', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 196, forceElongation: 735, totalLoad: 735, finalLoad: 738 },
        { id: 208, time: '11:58', batchNo: '601', benchNo: '418', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 195, forceElongation: 730, totalLoad: 730, finalLoad: 734 },
        { id: 209, time: '12:05', batchNo: '601', benchNo: '419', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 191, forceElongation: 722, totalLoad: 725, finalLoad: 727 },
        { id: 210, time: '12:12', batchNo: '601', benchNo: '420', wireLength: 32000, crossSection: 154, modulus: 195, measuredElongation: 195, forceElongation: 729, totalLoad: 730, finalLoad: 733 },
    ]);

    const wireTensionStats = useWireTensionStats(tensionRecords, selectedBatch);

    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        batchNo: selectedBatch,
        benchNo: '',
        wireLength: '',
        crossSection: '',
        modulus: '',
        measuredElongation: '',
        forceElongation: '',
        totalLoad: '',
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
            type: 'RT-1234'
        };
        setTensionRecords(prev => [newEntry, ...prev]);
        setScadaRecords(prev => prev.filter(r => r.id !== record.id));
        alert(`Record for Bench ${record.benchNo} witnessed.`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setTensionRecords(prev => prev.filter(r => r.id !== id));
        }
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
            loadPerWire: (parseFloat(formData.finalLoad) / wiresPerSleeper).toFixed(2)
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
            wireLength: '',
            crossSection: '',
            modulus: '',
            measuredElongation: '',
            forceElongation: '',
            totalLoad: '',
            finalLoad: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }));
    };

    const handleEdit = (record) => {
        setFormData({
            time: record.time,
            batchNo: record.batchNo,
            benchNo: record.benchNo,
            wireLength: record.wireLength || '',
            crossSection: record.crossSection || '',
            modulus: record.modulus || '',
            measuredElongation: record.measuredElongation || '',
            forceElongation: record.forceElongation || '',
            totalLoad: record.totalLoad || '',
            finalLoad: record.finalLoad,
            type: record.type || 'RT-1234'
        });
        setEditId(record.id);
        if (setShowForm) setShowForm(true); else setViewMode('form');
    };

    const renderDashboard = () => (
        <div style={{ padding: '1rem' }}>
            {/* Entry button moved to main toolbar in inline mode */}
            {displayMode !== 'inline' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                    <button
                        className="toggle-btn"
                        onClick={() => {
                            setEditId(null);
                            setFormData(prev => ({ ...prev, benchNo: '', finalLoad: '' }));
                            setViewMode('form');
                        }}
                    >
                        + Add New Entry
                    </button>
                </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {[
                    { id: 'stats', label: 'Statistics', color: '#3b82f6', desc: 'View tensioning distribution and variations.' },
                    { id: 'witnessed', label: 'Current Witness Logs', color: '#10b981', desc: 'Manage witnessed and manual records.' },
                    { id: 'scada', label: 'Scada Data', color: '#f59e0b', desc: 'Raw data from PLC tensioning system.' }
                ].map(tab => (
                    <TensionSubCard
                        key={tab.id}
                        id={tab.id}
                        title={tab.label}
                        color={tab.color}
                        statusDetail={tab.desc}
                        isActive={viewMode === tab.id}
                        onClick={() => setViewMode(tab.id)}
                    />
                ))}
            </div>
        </div>
    );

    const renderForm = () => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowForm(false)}>
            <div className="fade-in" style={{ width: '100%', maxWidth: '850px', maxHeight: '92vh', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

                {/* Header - Cream Background */}
                <div style={{ background: '#FFF8E7', padding: '1rem 1.5rem', borderBottom: '1px solid #F3E8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>New Tensioning Entry</h2>
                        <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '10px', fontWeight: '700' }}>Record load values & verify SCADA data</p>
                    </div>
                    <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '14px' }}>✕</button>
                </div>

                {/* Scrollable Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* 1. Initial Declaration (Blue) */}
                        <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dbeafe', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '800' }}>Initial Declaration</h4>
                            </div>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                <div className="form-field">
                                    <label>Batch No.</label>
                                    <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}>
                                        <option value="">-- Select --</option>
                                        {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Sleeper Type</label>
                                    <input value="RT-1234" readOnly className="readOnly" style={{ background: '#fff', border: '1px solid #e2e8f0', width: '100%' }} />
                                </div>
                                <div className="form-field">
                                    <label>Wires / Sleeper</label>
                                    <input value={wiresPerSleeper} readOnly className="readOnly" style={{ background: '#fff', border: '1px solid #e2e8f0', width: '100%' }} />
                                </div>
                                <div className="form-field">
                                    <label>Target Load (KN)</label>
                                    <input value="730" readOnly className="readOnly" style={{ background: '#fff', border: '1px solid #e2e8f0', width: '100%' }} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Scada Fetched Values (Amber) */}
                        <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef3c7', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#d97706', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#78350f', fontWeight: '800' }}>Scada Fetched Values (Pending)</h4>
                            </div>
                            <table className="ui-table" style={{ background: '#fff', borderRadius: '12px' }}>
                                <thead>
                                    <tr>
                                        <th>PLC Time</th>
                                        <th>Bench</th>
                                        <th>Wire Length</th>
                                        <th>Cross Section</th>
                                        <th>Modulus</th>
                                        <th>Measured Elongation</th>
                                        <th>Force (Elong.)</th>
                                        <th>Total Load</th>
                                        <th>Final Load</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scadaRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                        <tr><td colSpan="10" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No pending SCADA data for this batch.</td></tr>
                                    ) : (
                                        scadaRecords.filter(r => r.batchNo === selectedBatch).map(record => (
                                            <tr key={record.id}>
                                                <td>{record.time}</td>
                                                <td><strong>{record.benchNo}</strong></td>
                                                <td>{record.wireLength}</td>
                                                <td>{record.crossSection}</td>
                                                <td>{record.modulus}</td>
                                                <td>{record.measuredElongation}</td>
                                                <td>{record.forceElongation}</td>
                                                <td>{record.totalLoad}</td>
                                                <td style={{ fontWeight: '700', color: '#42818c' }}>{record.finalLoad} KN</td>
                                                <td><button className="btn-action" onClick={() => handleWitness(record)}>Witness</button></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 3. Manual Entry Form (Green) */}
                        <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dcfce7', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#064e3b', fontWeight: '800' }}>Manual Entry Form</h4>
                            </div>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <div className="form-field">
                                    <label>Batch No.</label>
                                    <input type="text" name="batchNo" value={formData.batchNo} readOnly style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                                </div>
                                <div className="form-field">
                                    <label>Bench No.</label>
                                    <input type="number" min="0" name="benchNo" value={formData.benchNo} onChange={handleFormChange} placeholder="e.g. 405" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleFormChange} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Length of Wire (mm)</label>
                                    <input type="number" name="wireLength" value={formData.wireLength} onChange={handleFormChange} placeholder="mm" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Total Cross section (mm2)</label>
                                    <input type="number" name="crossSection" value={formData.crossSection} onChange={handleFormChange} placeholder="mm2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Youngs Modulus (x10^3)</label>
                                    <input type="number" name="modulus" value={formData.modulus} onChange={handleFormChange} placeholder="Kg/mm2" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Measured Elongation (mm)</label>
                                    <input type="number" name="measuredElongation" value={formData.measuredElongation} onChange={handleFormChange} placeholder="mm" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Pre-stress force (Elongation)</label>
                                    <input type="number" name="forceElongation" value={formData.forceElongation} onChange={handleFormChange} placeholder="KN" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Total pre-stress load (KN)</label>
                                    <input type="number" name="totalLoad" value={formData.totalLoad} onChange={handleFormChange} placeholder="KN" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div className="form-field">
                                    <label>Final Load (Pressure Gauge)</label>
                                    <input type="number" min="0" name="finalLoad" value={formData.finalLoad} onChange={handleFormChange} placeholder="KN" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <button className="toggle-btn" onClick={handleSaveManual} style={{ background: '#10b981', border: 'none', padding: '10px 24px', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>{editId ? 'Update Manual Record' : 'Save Manual Record'}</button>
                            </div>
                        </div>

                        {/* 4. Logs Saved for Current Batch (Slate) */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ paddingBottom: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#475569', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: '800' }}>Logs Saved for Batch {selectedBatch}</h4>
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table className="ui-table" style={{ background: '#fff' }}>
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Bench</th>
                                            <th>Source</th>
                                            <th>Force (KN)</th>
                                            <th>Elongation</th>
                                            <th>Final Load</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tensionRecords.filter(r => r.batchNo === selectedBatch).length === 0 ? (
                                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No records saved for this batch yet.</td></tr>
                                        ) : (
                                            tensionRecords.filter(r => r.batchNo === selectedBatch).map(record => (
                                                <tr key={record.id}>
                                                    <td>{record.time}</td>
                                                    <td><strong>{record.benchNo}</strong></td>
                                                    <td><span className={`status-pill ${record.source === 'Manual' ? 'manual' : 'witnessed'}`}>{record.source}</span></td>
                                                    <td>{record.forceElongation || '-'}</td>
                                                    <td>{record.measuredElongation || '-'}</td>
                                                    <td style={{ fontWeight: '700', color: '#42818c' }}>{record.finalLoad} KN</td>
                                                    <td>
                                                        <button
                                                            className="btn-action mini danger"
                                                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }}
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Final Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                className="toggle-btn"
                                onClick={() => setShowForm(false)}
                                style={{ background: '#0f172a', color: '#fff', padding: '12px 32px', borderRadius: '8px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            >
                                Save / Finish Batch
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'stats', label: 'Statistics', color: '#3b82f6' },
        { id: 'witnessed', label: 'Current Witness Logs', color: '#10b981' },
        { id: 'scada', label: 'Scada Data', color: '#f59e0b' }
    ];

    if (displayMode === 'inline') {
        return (
            <div className="wire-tension-inline" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    {/* The Add New Entry button is now managed by the parent console */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {tabs.map((tab) => (
                            <TensionSubCard
                                key={tab.id}
                                id={tab.id}
                                title={tab.label}
                                color={tab.color}
                                statusDetail={
                                    tab.id === 'stats' ? 'Live Monitoring' :
                                        tab.id === 'witnessed' ? `${tensionRecords.length} Verified Entries` :
                                            'PLCs Connected'
                                }
                                isActive={viewMode === tab.id}
                                onClick={() => setViewMode(tab.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="inline-body" style={{ flexGrow: 1 }}>
                    {viewMode === 'stats' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Select Batch:</label>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                                    <option value="">-- Select --</option>
                                    {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                </select>
                            </div>
                            <WireTensionStats stats={wireTensionStats} />
                        </div>
                    )}

                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontWeight: '800' }}>Current Witness Logs</h4>
                            <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Source</th>
                                            <th>Time</th>
                                            <th>Batch</th>
                                            <th>Bench</th>
                                            <th>Wire Length</th>
                                            <th>Cross Section</th>
                                            <th>Modulus</th>
                                            <th>Measured Elong.</th>
                                            <th>Force (Elong.)</th>
                                            <th>Total Load</th>
                                            <th>Final Load</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tensionRecords.length === 0 ? (
                                            <tr><td colSpan="12" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No records logged yet.</td></tr>
                                        ) : (
                                            tensionRecords.map(entry => (
                                                <tr key={entry.id}>
                                                    <td><span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>{entry.source}</span></td>
                                                    <td>{entry.time}</td>
                                                    <td>{entry.batchNo}</td>
                                                    <td>{entry.benchNo}</td>
                                                    <td>{entry.wireLength || '-'}</td>
                                                    <td>{entry.crossSection || '-'}</td>
                                                    <td>{entry.modulus || '-'}</td>
                                                    <td>{entry.measuredElongation || '-'}</td>
                                                    <td>{entry.forceElongation || '-'}</td>
                                                    <td>{entry.totalLoad || '-'}</td>
                                                    <td><strong>{entry.finalLoad} KN</strong></td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {entry.source === 'Manual' && <button className="btn-action mini" onClick={() => handleEdit(entry)}>Edit</button>}
                                                            <button className="btn-action mini danger" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(entry.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ marginRight: '10px' }}>Filter Batch:</label>
                                    <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                    </select>
                                </div>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>PLC Time</th>
                                            <th>Bench</th>
                                            <th>Wire Length</th>
                                            <th>Cross Section</th>
                                            <th>Modulus</th>
                                            <th>Measured Elong.</th>
                                            <th>Force (Elong.)</th>
                                            <th>Total Load</th>
                                            <th>Final Load</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scadaRecords.filter(r => r.batchNo === selectedBatch).map(r => (
                                            <tr key={r.id}>
                                                <td>{r.time}</td>
                                                <td><strong>{r.benchNo}</strong></td>
                                                <td>{r.wireLength}</td>
                                                <td>{r.crossSection}</td>
                                                <td>{r.modulus}</td>
                                                <td>{r.measuredElongation}</td>
                                                <td>{r.forceElongation}</td>
                                                <td>{r.totalLoad}</td>
                                                <td style={{ fontWeight: '700' }}>{r.finalLoad} KN</td>
                                                <td><span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>PENDING WITNESS</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showForm && renderForm()}
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Wire Tensioning Control Console</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Precision Load Integration & Assurance</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>X</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>

                    {viewMode === 'dashboard' && renderDashboard()}

                    {viewMode === 'stats' && (
                        <div className="fade-in">
                            <h3 style={{ marginBottom: '1.5rem' }}>Tensioning Statistical Analysis</h3>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ marginRight: '10px' }}>Select Batch:</label>
                                <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                    <option value="">-- Select --</option>
                                    {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                </select>
                            </div>
                            <WireTensionStats stats={wireTensionStats} />
                        </div>
                    )}

                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Current Witness Logs</h3>
                                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
                            </div>
                            <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Source</th>
                                            <th>Time</th>
                                            <th>Batch</th>
                                            <th>Bench</th>
                                            <th>Wire Length</th>
                                            <th>Cross Section</th>
                                            <th>Modulus</th>
                                            <th>Measured Elong.</th>
                                            <th>Force (Elong.)</th>
                                            <th>Total Load</th>
                                            <th>Final Load</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tensionRecords.length === 0 ? (
                                            <tr><td colSpan="12" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No records logged yet.</td></tr>
                                        ) : (
                                            tensionRecords.map(entry => (
                                                <tr key={entry.id}>
                                                    <td><span className={`status-pill ${entry.source === 'Manual' ? 'manual' : 'witnessed'}`}>{entry.source}</span></td>
                                                    <td>{entry.time}</td>
                                                    <td>{entry.batchNo}</td>
                                                    <td>{entry.benchNo}</td>
                                                    <td>{entry.wireLength || '-'}</td>
                                                    <td>{entry.crossSection || '-'}</td>
                                                    <td>{entry.modulus || '-'}</td>
                                                    <td>{entry.measuredElongation || '-'}</td>
                                                    <td>{entry.forceElongation || '-'}</td>
                                                    <td>{entry.totalLoad || '-'}</td>
                                                    <td><strong>{entry.finalLoad} KN</strong></td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            {entry.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>}
                                                            <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(entry.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <h3 style={{ marginBottom: '1.5rem' }}>Scada Data (Raw Feed)</h3>
                            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ marginRight: '10px' }}>Filter Batch:</label>
                                    <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                        {batches.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                                    </select>
                                </div>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>PLC Time</th>
                                            <th>Bench</th>
                                            <th>Wire Length</th>
                                            <th>Cross Section</th>
                                            <th>Modulus</th>
                                            <th>Measured Elong.</th>
                                            <th>Force (Elong.)</th>
                                            <th>Total Load</th>
                                            <th>Final Load</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scadaRecords.filter(r => r.batchNo === selectedBatch).map(r => (
                                            <tr key={r.id}>
                                                <td>{r.time}</td>
                                                <td><strong>{r.benchNo}</strong></td>
                                                <td>{r.wireLength}</td>
                                                <td>{r.crossSection}</td>
                                                <td>{r.modulus}</td>
                                                <td>{r.measuredElongation}</td>
                                                <td>{r.forceElongation}</td>
                                                <td>{r.totalLoad}</td>
                                                <td style={{ fontWeight: '700' }}>{r.finalLoad} KN</td>
                                                <td><span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>PENDING WITNESS</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {viewMode === 'form' && renderForm()}
                </div>
            </div>
        </div>
    );
};

export default WireTensioning;

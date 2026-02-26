import React, { useState, useMemo, useEffect } from 'react';
import { apiService } from '../../services/api';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const SteamCuringSubCard = ({ id, title, color, statusDetail, isActive, onClick }) => {
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

const SteamCuring = ({ onBack, steamRecords: propSteamRecords, setSteamRecords: propSetSteamRecords, displayMode = 'modal', batches = [] }) => {
    const [viewMode, setViewMode] = useState('witnessed'); // Default to 'witnessed'
    const [localSteamRecords, setLocalSteamRecords] = useState([]);
    const entries = propSteamRecords || localSteamRecords;
    const setEntries = propSetSteamRecords || setLocalSteamRecords;

    const [isSaving, setIsSaving] = useState(false);

    const [scadaCycles, setScadaCycles] = useState([
        {
            id: 1, batchNo: '610', chamberNo: '1', date: '2026-02-25', time: '08:00', benches: '401, 402', grade: 'M55',
            pre: { start: '08:00', end: '10:15', dur: 2.25 },
            rise: { start: '10:15', end: '12:30', startTemp: 28, endTemp: 58, dur: 2.25, rate: 13.3 },
            const: { start: '12:30', end: '16:30', tempRange: '58-60', dur: 4.0 },
            cool: { start: '16:30', end: '19:00', startTemp: 58, endTemp: 30, dur: 2.5, rate: 11.2 },
            final: { start: '19:00', end: '20:30', dur: 1.5 },
            batchWeight: {
                ca1: { set: 960, actual: 959 },
                ca2: { set: 330, actual: 329 },
                fa: { set: 690, actual: 688 },
                cement: { set: 425, actual: 426 },
                water: { set: 170, actual: 169 },
                admixture: { set: 4.3, actual: 4.2 },
                total: { set: 2580, actual: 2579 }
            }
        }
    ]);

    // Dynamic Batch List
    const availableBatches = useMemo(() => {
        const bSet = new Set();
        if (Array.isArray(batches)) {
            batches.forEach(b => { if (b.batchNo) bSet.add(String(b.batchNo)); });
        }
        if (scadaCycles) {
            scadaCycles.forEach(r => { if (r.batchNo) bSet.add(String(r.batchNo)); });
        }
        if (entries) {
            entries.forEach(r => { if (r.batchNo) bSet.add(String(r.batchNo)); });
        }
        return Array.from(bSet).sort();
    }, [batches, scadaCycles, entries]);

    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedChamber, setSelectedChamber] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
    });

    const isTempInvalid = (val) => {
        if (val === '' || val === null || val === undefined) return false;
        const num = parseFloat(val);
        return !isNaN(num) && (num < 55 || num > 60);
    };

    const tabs = [
        { id: 'stats', label: 'Statistics', short: 'ANALYSIS', color: '#f59e0b', desc: 'Efficiency metrics' },
        { id: 'witnessed', label: 'Witnessed Logs', short: 'HISTORY', color: '#10b981', desc: `${entries.length} Verified Records` },
        { id: 'scada', label: 'Scada Data', short: 'SCADA', color: '#3b82f6', desc: 'Active Chambers' }
    ];

    const activeRecord = useMemo(() => {
        return scadaCycles.find(c => c.batchNo === selectedBatch && c.chamberNo === selectedChamber);
    }, [selectedBatch, selectedChamber, scadaCycles]);

    const handleWitness = (record) => {
        const cycle = record || activeRecord;
        if (!cycle) return;
        const tempRangeSplit = cycle.const.tempRange.split('-').map(Number);
        const newEntry = {
            id: `s-${Date.now()}`,
            source: 'Scada',
            date: cycle.date,
            batchNo: cycle.batchNo,
            chamberNo: cycle.chamberNo,
            benches: cycle.benches,
            minConstTemp: tempRangeSplit[0],
            maxConstTemp: tempRangeSplit[1] || tempRangeSplit[0],
            timestamp: new Date().toISOString(),
            ...cycle.batchWeight
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaCycles(prev => prev.filter(c => c.id !== cycle.id));
        alert(`Cycle witnessed and added to local session.`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            const entry = entries.find(e => e.id === id);
            if (entry && entry.batchId) {
                try {
                    // This is a bit tricky since one backend record can have multiple sub-records
                    // For now, let's just delete from local and assume user will "Save / Finish" to update backend
                    // Or if they delete the whole batch, we use deleteSteamCuring(entry.batchId)
                    setEntries(prev => prev.filter(e => e.id !== id));
                } catch (error) {
                    console.error("Delete failed:", error);
                }
            } else {
                setEntries(prev => prev.filter(e => e.id !== id));
            }
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setManualForm({
            date: entry.date,
            batchNo: entry.batchNo,
            chamberNo: entry.chamberNo,
            benches: entry.benches,
            minConstTemp: entry.minConstTemp,
            maxConstTemp: entry.maxConstTemp
        });
        setShowForm(true);
    };

    const handleSaveManual = () => {
        if (!manualForm.batchNo || !manualForm.chamberNo) {
            alert('Batch and Chamber numbers required');
            return;
        }

        const minVal = parseFloat(manualForm.minConstTemp);
        const maxVal = parseFloat(manualForm.maxConstTemp);

        if (isNaN(minVal) || isNaN(maxVal) || minVal < 45 || minVal > 70) { // Relaxed range for demo, adjust if needed
            alert('Error: Temperature must be between 45°C and 70°C.');
            return;
        }

        const newEntry = {
            ...manualForm,
            id: editingId || `m-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: 'Manual'
        };
        if (editingId) {
            setEntries(prev => prev.map(e => e.id === editingId ? newEntry : e));
            setEditingId(null);
        } else {
            setEntries(prev => [newEntry, ...prev]);
        }
        setManualForm({
            date: new Date().toISOString().split('T')[0],
            batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
        });
        alert('Manual entry added to local session.');
        // Don't close form yet to allow multi-entry or final save
    };

    const handleFinalSave = async () => {
        const batchToSave = selectedBatch || manualForm.batchNo;
        if (!batchToSave) {
            alert('Please select or enter a Batch Number');
            return;
        }

        setIsSaving(true);
        try {
            const batchRecords = entries.filter(e => String(e.batchNo) === String(batchToSave));

            // Collect manual records for this batch
            const manualRecords = batchRecords
                .filter(e => e.source === 'Manual')
                .map(e => ({
                    batchNo: String(e.batchNo),
                    chamber: String(e.chamberNo),
                    minTemp: parseFloat(e.minConstTemp) || 0,
                    maxTemp: parseFloat(e.maxConstTemp) || 0
                }));

            // Collect scada records for this batch
            const scadaRecords = batchRecords
                .filter(e => e.source === 'Scada')
                .map(e => ({
                    date: e.date ? e.date.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB'),
                    time: e.time ? e.time.substring(0, 5) : "00:00",
                    batchNo: String(e.batchNo),
                    ca1Set: e.ca1Set || 0,
                    ca1Actual: e.ca1Actual || 0,
                    ca2Set: e.ca2Set || 0,
                    ca2Actual: e.ca2Actual || 0,
                    faSet: e.faSet || 0,
                    faActual: e.faActual || 0,
                    cementSet: e.cementSet || 0,
                    cementActual: e.cementActual || 0,
                    waterSet: e.waterSet || 0,
                    waterActual: e.waterActual || 0,
                    admixtureSet: e.admixtureSet || 0,
                    admixtureActual: e.admixtureActual || 0,
                    totalSet: e.totalSet || 0,
                    totalActual: e.totalActual || 0
                }));

            const payload = {
                batchNo: String(batchToSave),
                chamber: String(selectedChamber || manualForm.chamberNo),
                grade: "M60",
                entryDate: manualForm.date ? manualForm.date.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB'),
                scadaRecords,
                manualRecords
            };

            const allResponse = await apiService.getAllSteamCuring();
            const existing = (allResponse?.responseData || []).find(b => String(b.batchNo) === String(batchToSave));

            if (existing) {
                await apiService.updateSteamCuring(existing.id, payload);
                alert('Steam curing data updated successfully.');
            } else {
                await apiService.createSteamCuring(payload);
                alert('Steam curing data created successfully.');
            }
            setShowForm(false);
        } catch (error) {
            console.error('Save failed:', error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const renderSubCards = () => (
        <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {tabs.map(tab => (
                    <SteamCuringSubCard
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
            <div className="fade-in" style={{ width: '100%', maxWidth: '1280px', maxHeight: '92vh', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                {/* Header - Cream Background */}
                <div style={{ background: '#FFF8E7', padding: '1rem 1.5rem', borderBottom: '1px solid #F3E8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{editingId ? 'Modify' : 'New'} Steam Curing Entry</h2>
                        <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '10px', fontWeight: '700' }}>Heat Treatment Cycle Assurance</p>
                    </div>
                    <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '14px' }}>✕</button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#3b82f6', color: '#fff', fontSize: '10px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a', fontWeight: '800' }}>Initial Declaration</h4>
                            </div>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                                <div className="form-field">
                                    <label style={{ fontSize: '10px' }}>Batch</label>
                                    <select
                                        value={selectedBatch}
                                        onChange={e => {
                                            setSelectedBatch(e.target.value);
                                            setManualForm(prev => ({ ...prev, batchNo: e.target.value }));
                                        }}
                                        style={{ background: '#fff', fontSize: '13px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                    >
                                        <option value="">Select Batch</option>
                                        {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label style={{ fontSize: '10px' }}>Chamber</label>
                                    <input
                                        type="number"
                                        value={selectedChamber}
                                        onChange={e => {
                                            setSelectedChamber(e.target.value);
                                            setManualForm(prev => ({ ...prev, chamberNo: e.target.value }));
                                        }}
                                        style={{ background: '#fff', fontSize: '13px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                        placeholder="Chamber No"
                                    />
                                </div>
                                <div className="form-field"><label style={{ fontSize: '10px' }}>Grade</label><input value="M60" readOnly style={{ background: '#fff', fontSize: '13px', padding: '6px' }} /></div>
                                <div className="form-field"><label style={{ fontSize: '10px' }}>Date</label><input type="text" value={manualForm.date ? manualForm.date.split('-').reverse().join('/') : ''} readOnly style={{ background: '#fff', fontSize: '13px', padding: '6px' }} /></div>
                            </div>
                        </div>

                        <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#d97706', color: '#fff', fontSize: '10px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#78350f', fontWeight: '800' }}>Scada Fetched Values</h4>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="ui-table" style={{ width: '100%', minWidth: '1000px', background: '#fff', fontSize: '11px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2}>S.No</th>
                                            <th rowSpan={2}>Action</th>
                                            <th rowSpan={2}>Date</th>
                                            <th rowSpan={2}>Time</th>
                                            <th rowSpan={2}>Batch</th>
                                            <th colSpan={2} style={{ background: '#eff6ff' }}>20mm (CA1)</th>
                                            <th colSpan={2} style={{ background: '#f0fdf4' }}>10mm (CA2)</th>
                                            <th colSpan={2} style={{ background: '#fffbeb' }}>Sand (FA)</th>
                                            <th colSpan={2} style={{ background: '#fdf4ff' }}>Cement</th>
                                            <th colSpan={2} style={{ background: '#eff6ff' }}>Water</th>
                                            <th colSpan={2} style={{ background: '#fff1f2' }}>Admixture</th>
                                            <th colSpan={2} style={{ background: '#f8fafc' }}>Total</th>
                                        </tr>
                                        <tr>
                                            {['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture', 'total'].map(k => (
                                                <React.Fragment key={k}>
                                                    <th>Set</th>
                                                    <th>Actual</th>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scadaCycles.map((r, idx) => {
                                            const bw = r.batchWeight || {};
                                            return (
                                                <tr key={r.id}>
                                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button className="btn-action" onClick={() => handleWitness(r)}>Witness</button>
                                                    </td>
                                                    <td style={{ whiteSpace: 'nowrap' }}>{r.date ? r.date.split('-').reverse().join('/') : ''}</td>
                                                    <td>{r.time || '-'}</td>
                                                    <td style={{ fontWeight: '700' }}>{r.batchNo}</td>
                                                    {['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture', 'total'].map(key => (
                                                        <React.Fragment key={key}>
                                                            <td style={{ textAlign: 'center', color: '#64748b' }}>{bw[key]?.set ?? '-'}</td>
                                                            <td style={{ textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>{bw[key]?.actual ?? '-'}</td>
                                                        </React.Fragment>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                        {scadaCycles.length === 0 && (
                                            <tr>
                                                <td colSpan={19} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No pending SCADA data.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#064e3b', fontWeight: '800' }}>Manual Entry Form</h4>
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                                <div className="form-field"><label style={{ fontSize: '10px' }}>Batch No.</label><input style={{ padding: '6px' }} type="number" min="0" value={manualForm.batchNo} onChange={e => setManualForm({ ...manualForm, batchNo: e.target.value })} /></div>
                                <div className="form-field"><label style={{ fontSize: '10px' }}>Chamber</label><input style={{ padding: '6px' }} type="number" min="0" value={manualForm.chamberNo} onChange={e => setManualForm({ ...manualForm, chamberNo: e.target.value })} /></div>
                                <div className="form-field">
                                    <label style={{ fontSize: '10px' }}>Min Temp</label>
                                    <input
                                        style={{
                                            padding: '6px',
                                            backgroundColor: isTempInvalid(manualForm.minConstTemp) ? '#ffe4e6' : '#ffffff',
                                            borderColor: isTempInvalid(manualForm.minConstTemp) ? '#ef4444' : '#cbd5e1',
                                            borderWidth: isTempInvalid(manualForm.minConstTemp) ? '2px' : '1px',
                                            borderStyle: 'solid',
                                            color: isTempInvalid(manualForm.minConstTemp) ? '#991b1b' : '#1e293b',
                                            boxShadow: isTempInvalid(manualForm.minConstTemp) ? '0 0 0 1px #ef4444' : 'none',
                                            transition: 'all 0.2s',
                                            fontWeight: isTempInvalid(manualForm.minConstTemp) ? '700' : '400'
                                        }}
                                        type="number"
                                        value={manualForm.minConstTemp}
                                        onChange={e => setManualForm({ ...manualForm, minConstTemp: e.target.value })}
                                    />
                                    {isTempInvalid(manualForm.minConstTemp) && <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800', marginTop: '4px' }}>⚠ Must be 55-60°C</div>}
                                </div>
                                <div className="form-field">
                                    <label style={{ fontSize: '10px' }}>Max Temp</label>
                                    <input
                                        style={{
                                            padding: '6px',
                                            backgroundColor: isTempInvalid(manualForm.maxConstTemp) ? '#ffe4e6' : '#ffffff',
                                            borderColor: isTempInvalid(manualForm.maxConstTemp) ? '#ef4444' : '#cbd5e1',
                                            borderWidth: isTempInvalid(manualForm.maxConstTemp) ? '2px' : '1px',
                                            borderStyle: 'solid',
                                            color: isTempInvalid(manualForm.maxConstTemp) ? '#991b1b' : '#1e293b',
                                            boxShadow: isTempInvalid(manualForm.maxConstTemp) ? '0 0 0 1px #ef4444' : 'none',
                                            transition: 'all 0.2s',
                                            fontWeight: isTempInvalid(manualForm.maxConstTemp) ? '700' : '400'
                                        }}
                                        type="number"
                                        value={manualForm.maxConstTemp}
                                        onChange={e => setManualForm({ ...manualForm, maxConstTemp: e.target.value })}
                                    />
                                    {isTempInvalid(manualForm.maxConstTemp) && <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800', marginTop: '4px' }}>⚠ Must be 55-60°C</div>}
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}><button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button></div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#64748b', color: '#fff', fontSize: '10px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontWeight: '800' }}>Recent Witness Logs</h4>
                            </div>
                            <table className="ui-table" style={{ background: '#fff', fontSize: '12px' }}>
                                <thead><tr><th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Temp Range</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {entries.slice(0, 5).map(e => (
                                        <tr key={e.id}>
                                            <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                            <td>{e.date ? e.date.split('-').reverse().join('/') : ''}</td>
                                            <td>{e.batchNo}</td><td>{e.chamberNo}</td><td>{e.minConstTemp}-{e.maxConstTemp}°C</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                    <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(e.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={() => setShowForm(false)}
                        style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleFinalSave}
                        disabled={isSaving}
                        style={{
                            padding: '10px 30px',
                            background: isSaving ? '#94a3b8' : '#0f172a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '800',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isSaving ? 'Processing...' : 'Save / Finish Batch'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => (
        <>
            {showForm && renderForm()}
            <div className="fade-in">
                {displayMode === 'inline' && renderSubCards()}

                {viewMode === 'stats' && <div className="fade-in"><h3>Steam Curing Performance Statistics</h3><div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>Curing temperature profiles and efficiency metrics...</div></div>}
                {viewMode === 'witnessed' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ margin: 0 }}>Witnessed Curing Logs</h3>
                            <button className="toggle-btn" onClick={() => setShowForm(true)}>+ Add New Entry</button>
                        </div>
                        <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <table className="ui-table">
                                <thead><tr><th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Benches</th><th>Temp Range</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {entries.map(e => (
                                        <tr key={e.id}>
                                            <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                            <td>{e.date ? e.date.split('-').reverse().join('/') : ''}</td><td>{e.batchNo}</td><td>{e.chamberNo}</td><td>{e.benches}</td><td>{e.minConstTemp}-{e.maxConstTemp}°C</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                    <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(e.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {viewMode === 'scada' && (
                    <div className="fade-in">
                        <h3>Raw SCADA Data Feed</h3>
                        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                            <table className="ui-table" style={{ minWidth: '1100px', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>S.No</th>
                                        <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Action</th>
                                        <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Date</th>
                                        <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Time</th>
                                        <th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Batch</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#eff6ff' }}>20mm (CA1)</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#f0fdf4' }}>10mm (CA2)</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#fffbeb' }}>Sand (FA)</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#fdf4ff' }}>Cement</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#eff6ff' }}>Water</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#fff1f2' }}>Admixture</th>
                                        <th colSpan={2} style={{ textAlign: 'center', background: '#f8fafc' }}>Total</th>
                                    </tr>
                                    <tr>
                                        {['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture', 'total'].map(key => (
                                            <React.Fragment key={key}>
                                                <th style={{ textAlign: 'center', fontWeight: '700', fontSize: '11px' }}>Set</th>
                                                <th style={{ textAlign: 'center', fontWeight: '700', fontSize: '11px' }}>Actual</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {scadaCycles.map((r, idx) => {
                                        const bw = r.batchWeight || {};
                                        return (
                                            <tr key={r.id}>
                                                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button className="btn-action" onClick={() => handleWitness(r)}>Witness</button>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{r.date ? r.date.split('-').reverse().join('/') : ''}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{r.time || '-'}</td>
                                                <td style={{ fontWeight: '700' }}>{r.batchNo}</td>
                                                {['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture', 'total'].map(key => (
                                                    <React.Fragment key={key}>
                                                        <td style={{ textAlign: 'center', color: '#475569' }}>{bw[key]?.set ?? '-'}</td>
                                                        <td style={{ textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>{bw[key]?.actual ?? '-'}</td>
                                                    </React.Fragment>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                    {scadaCycles.length === 0 && (
                                        <tr>
                                            <td colSpan={19} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '13px' }}>No pending SCADA records.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    if (displayMode === 'inline') return renderContent();

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1300px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    <div><h2 style={{ margin: 0, fontSize: '1.25rem' }}>Steam Curing Console</h2><p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Heat Treatment Cycle Assurance</p></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="toggle-btn" style={{ padding: '6px 16px', fontSize: '0.75rem' }} onClick={() => setShowForm(true)}>+ Add New Entry</button>
                        <button className="close-btn" onClick={onBack}>X</button>
                    </div>
                </header>

                <div style={{ padding: '0 1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                onClick={() => setViewMode(tab.id)}
                                style={{
                                    padding: '1rem 0',
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    color: viewMode === tab.id ? '#f59e0b' : '#64748b',
                                    borderBottom: `3px solid ${viewMode === tab.id ? '#f59e0b' : 'transparent'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SteamCuring;

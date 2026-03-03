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

// Helper: info row for SCADA data panel
const InfoRow = ({ label, value, highlight }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px dashed #e2e8f0' }}>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: '800', color: highlight || '#1e293b' }}>{value ?? '—'}</span>
    </div>
);

// Stage block header/box for SCADA panel
const StageBlock = ({ title, color, bg, children }) => (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: '10px', padding: '12px 14px', marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', fontWeight: '900', color: color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', borderBottom: `2px solid ${color}30`, paddingBottom: '5px' }}>
            {title}
        </div>
        {children}
    </div>
);

// Inline row of columns for process stages
const InlineRow = ({ cols }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: '10px', marginBottom: '10px' }}>
        {cols.map((col, i) => (
            <div key={i} style={{ background: col.bg || '#fff', border: `1px solid ${col.color || '#e2e8f0'}30`, borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: col.color || '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{col.label}</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{col.value ?? '—'}</div>
            </div>
        ))}
    </div>
);

const SteamCuring = ({ onBack, steamRecords: propSteamRecords, setSteamRecords: propSetSteamRecords, displayMode = 'modal', batches = [], activeContainer }) => {
    const [viewMode, setViewMode] = useState('witnessed');
    const [localSteamRecords, setLocalSteamRecords] = useState([]);
    const entries = propSteamRecords || localSteamRecords;
    const setEntries = propSetSteamRecords || setLocalSteamRecords;

    const [isSaving, setIsSaving] = useState(false);

    // Mock SCADA cycles – rich structure matching all 5 process stages
    const [scadaCycles, setScadaCycles] = useState([
        {
            id: 1,
            batchNo: '610',
            chamberNo: '1',
            dateOfCasting: '2026-02-25',
            benches: '401, 402, 403',
            grade: 'M55',
            // Pre-Steaming
            pre: { startTime: '08:00', endTime: '10:15', duration: 2.25 },
            // Temp Rising
            rise: { startTime: '10:15', endTime: '12:30', startTemp: 28, endTemp: 58, duration: 2.25, rate: 13.3 },
            // Constant Temperature
            constant: { startTime: '12:30', endTime: '16:30', duration: 4.0, tempMin: 58, tempMax: 60 },
            // Cooling
            cool: { startTime: '16:30', endTime: '19:00', startTemp: 58, endTemp: 30, duration: 2.5, rate: 11.2 },
            // Final Stage
            final: { startTime: '19:00', endTime: '20:30', duration: 1.5 }
        },
        {
            id: 2,
            batchNo: '611',
            chamberNo: '2',
            dateOfCasting: '2026-02-26',
            benches: '404, 405',
            grade: 'M60',
            pre: { startTime: '07:30', endTime: '09:45', duration: 2.25 },
            rise: { startTime: '09:45', endTime: '12:00', startTemp: 27, endTemp: 58, duration: 2.25, rate: 13.8 },
            constant: { startTime: '12:00', endTime: '16:00', duration: 4.0, tempMin: 57, tempMax: 60 },
            cool: { startTime: '16:00', endTime: '18:30', startTemp: 57, endTemp: 28, duration: 2.5, rate: 11.6 },
            final: { startTime: '18:30', endTime: '20:00', duration: 1.5 }
        }
    ]);

    // State: batch & chamber selection (default to last SCADA record)
    const [selectedBatch, setSelectedBatch] = useState(() => {
        return scadaCycles.length > 0 ? scadaCycles[scadaCycles.length - 1].batchNo : '';
    });
    const [selectedChamber, setSelectedChamber] = useState(() => {
        return scadaCycles.length > 0 ? scadaCycles[scadaCycles.length - 1].chamberNo : '';
    });

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split('T')[0],
        batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: ''
    });

    // Available batches from all sources
    const availableBatches = useMemo(() => {
        const bSet = new Set();
        if (Array.isArray(batches)) batches.forEach(b => { if (b.batchNo) bSet.add(String(b.batchNo)); });
        scadaCycles.forEach(r => { if (r.batchNo) bSet.add(String(r.batchNo)); });
        entries.forEach(r => { if (r.batchNo) bSet.add(String(r.batchNo)); });
        return Array.from(bSet).sort();
    }, [batches, scadaCycles, entries]);

    // Auto-select chamber when batch changes
    useEffect(() => {
        const match = scadaCycles.find(c => String(c.batchNo) === String(selectedBatch));
        if (match) setSelectedChamber(match.chamberNo);
    }, [selectedBatch]);

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
        return scadaCycles.find(c => String(c.batchNo) === String(selectedBatch) && String(c.chamberNo) === String(selectedChamber));
    }, [selectedBatch, selectedChamber, scadaCycles]);

    const handleWitness = (cycle) => {
        if (!cycle) return;
        const newEntry = {
            id: `s-${Date.now()}`,
            source: 'Scada',
            date: cycle.dateOfCasting,
            batchNo: cycle.batchNo,
            chamberNo: cycle.chamberNo,
            benches: cycle.benches,
            grade: cycle.grade,
            minConstTemp: cycle.constant?.tempMin ?? '',
            maxConstTemp: cycle.constant?.tempMax ?? '',
            // Stage details for record keeping
            preStartTime: cycle.pre?.startTime,
            preEndTime: cycle.pre?.endTime,
            preDuration: cycle.pre?.duration,
            riseStartTime: cycle.rise?.startTime,
            riseEndTime: cycle.rise?.endTime,
            riseStartTemp: cycle.rise?.startTemp,
            riseEndTemp: cycle.rise?.endTemp,
            riseDuration: cycle.rise?.duration,
            riseRate: cycle.rise?.rate,
            constStartTime: cycle.constant?.startTime,
            constEndTime: cycle.constant?.endTime,
            constDuration: cycle.constant?.duration,
            coolStartTime: cycle.cool?.startTime,
            coolEndTime: cycle.cool?.endTime,
            coolStartTemp: cycle.cool?.startTemp,
            coolEndTemp: cycle.cool?.endTemp,
            coolDuration: cycle.cool?.duration,
            coolRate: cycle.cool?.rate,
            finalStartTime: cycle.final?.startTime,
            finalEndTime: cycle.final?.endTime,
            finalDuration: cycle.final?.duration,
            timestamp: new Date().toISOString(),
            status: (cycle.constant?.tempMin >= 55 && cycle.constant?.tempMax <= 60) ? 'OK' : 'NOT OK'
        };
        setEntries(prev => [newEntry, ...prev]);
        setScadaCycles(prev => prev.filter(c => c.id !== cycle.id));
        alert(`Cycle for Batch ${cycle.batchNo} / Chamber ${cycle.chamberNo} witnessed and added to session.`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setEntries(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleEdit = async (entry) => {
        try {
            let fetchedData = entry;
            if (entry.id && !isNaN(entry.id) && !String(entry.id).includes('-')) {
                const response = await apiService.getSteamCuringById(entry.id);
                fetchedData = response?.responseData || entry;
            }
            setEditingId(fetchedData.id);
            setManualForm({
                date: fetchedData.date,
                batchNo: fetchedData.batchNo,
                chamberNo: fetchedData.chamberNo,
                benches: fetchedData.benches,
                minConstTemp: fetchedData.minConstTemp,
                maxConstTemp: fetchedData.maxConstTemp
            });
            setShowForm(true);
        } catch (error) {
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
        }
    };

    const handleSaveManual = () => {
        if (!manualForm.batchNo || !manualForm.chamberNo) {
            alert('Batch and Chamber numbers required');
            return;
        }
        const minVal = parseFloat(manualForm.minConstTemp);
        const maxVal = parseFloat(manualForm.maxConstTemp);
        if (isNaN(minVal) || isNaN(maxVal) || minVal < 45 || minVal > 70) {
            alert('Error: Temperature must be between 45°C and 70°C.');
            return;
        }
        const newEntry = {
            ...manualForm,
            id: editingId || `m-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: 'Manual',
            status: (minVal >= 55 && maxVal <= 60) ? 'OK' : 'NOT OK'
        };
        if (editingId) {
            setEntries(prev => prev.map(e => e.id === editingId ? newEntry : e));
            setEditingId(null);
        } else {
            setEntries(prev => [newEntry, ...prev]);
        }
        setManualForm({ date: new Date().toISOString().split('T')[0], batchNo: '', chamberNo: '', benches: '', minConstTemp: '', maxConstTemp: '' });
        alert('Manual entry added to local session.');
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

            const manualRecords = batchRecords
                .filter(e => e.source === 'Manual')
                .map(e => ({
                    batchNo: String(e.batchNo),
                    chamber: String(e.chamberNo),
                    minTemp: parseFloat(e.minConstTemp) || 0,
                    maxTemp: parseFloat(e.maxConstTemp) || 0
                }));

            const scadaRecordsPayload = batchRecords
                .filter(e => e.source === 'Scada')
                .map(e => ({
                    date: e.date ? e.date.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB'),
                    batchNo: String(e.batchNo),
                    chamberNo: String(e.chamberNo),
                    benches: e.benches || '',
                    grade: e.grade || 'M60',
                    preStartTime: e.preStartTime || '',
                    preEndTime: e.preEndTime || '',
                    preDuration: parseFloat(e.preDuration) || 0,
                    riseStartTime: e.riseStartTime || '',
                    riseEndTime: e.riseEndTime || '',
                    riseStartTemp: parseFloat(e.riseStartTemp) || 0,
                    riseEndTemp: parseFloat(e.riseEndTemp) || 0,
                    riseDuration: parseFloat(e.riseDuration) || 0,
                    riseRate: parseFloat(e.riseRate) || 0,
                    constStartTime: e.constStartTime || '',
                    constEndTime: e.constEndTime || '',
                    constDuration: parseFloat(e.constDuration) || 0,
                    constTempMin: parseFloat(e.minConstTemp) || 0,
                    constTempMax: parseFloat(e.maxConstTemp) || 0,
                    coolStartTime: e.coolStartTime || '',
                    coolEndTime: e.coolEndTime || '',
                    coolStartTemp: parseFloat(e.coolStartTemp) || 0,
                    coolEndTemp: parseFloat(e.coolEndTemp) || 0,
                    coolDuration: parseFloat(e.coolDuration) || 0,
                    coolRate: parseFloat(e.coolRate) || 0,
                    finalStartTime: e.finalStartTime || '',
                    finalEndTime: e.finalEndTime || '',
                    finalDuration: parseFloat(e.finalDuration) || 0
                }));

            const payload = {
                batchNo: String(batchToSave),
                chamber: String(selectedChamber || manualForm.chamberNo),
                grade: 'M60',
                entryDate: manualForm.date ? manualForm.date.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB'),
                scadaRecords: scadaRecordsPayload,
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

    // Render the SCADA Data panel for a given cycle record
    const renderScadaDataPanel = (cycle) => {
        if (!cycle) return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px' }}>
                No SCADA data available for the selected Batch / Chamber.
            </div>
        );

        const tempOk = cycle.constant?.tempMin >= 55 && cycle.constant?.tempMax <= 60;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Header Info Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '4px' }}>
                    {[
                        { label: 'Batch Number', value: cycle.batchNo, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Chamber Number', value: cycle.chamberNo, color: '#7c3aed', bg: '#f5f3ff' },
                        { label: 'Date of Casting', value: cycle.dateOfCasting ? cycle.dateOfCasting.split('-').reverse().join('/') : '—', color: '#0891b2', bg: '#ecfeff' },
                        { label: 'Bench Numbers', value: cycle.benches, color: '#059669', bg: '#f0fdf4' },
                        { label: 'Grade of Concrete', value: cycle.grade, color: '#d97706', bg: '#fffbeb' },
                    ].map((item, i) => (
                        <div key={i} style={{ background: item.bg, borderRadius: '8px', padding: '10px 12px', border: `1px solid ${item.color}20` }}>
                            <div style={{ fontSize: '9px', fontWeight: '800', color: item.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', marginTop: '3px' }}>{item.value ?? '—'}</div>
                        </div>
                    ))}
                </div>

                {/* 1. Pre-Steaming */}
                <StageBlock title="① Pre-Steaming Process" color="#6366f1" bg="#f5f3ff">
                    <InlineRow cols={[
                        { label: 'Start Time', value: cycle.pre?.startTime, color: '#6366f1', bg: '#ede9fe' },
                        { label: 'End Time', value: cycle.pre?.endTime, color: '#6366f1', bg: '#ede9fe' },
                        { label: 'Pre-Steaming Duration', value: cycle.pre?.duration ? `${cycle.pre.duration} hrs` : '—', color: '#4f46e5', bg: '#eef2ff' },
                    ]} />
                </StageBlock>

                {/* 2. Temp Rising */}
                <StageBlock title="② Temp Rising Process" color="#f59e0b" bg="#fffbeb">
                    <InlineRow cols={[
                        { label: 'Start Time', value: cycle.rise?.startTime, color: '#d97706', bg: '#fef3c7' },
                        { label: 'End Time', value: cycle.rise?.endTime, color: '#d97706', bg: '#fef3c7' },
                        { label: 'Start Process Temp.', value: cycle.rise?.startTemp ? `${cycle.rise.startTemp}°C` : '—', color: '#b45309', bg: '#fde68a50' },
                        { label: 'End Process Temp.', value: cycle.rise?.endTemp ? `${cycle.rise.endTemp}°C` : '—', color: '#b45309', bg: '#fde68a50' },
                        { label: 'Rising Period', value: cycle.rise?.duration ? `${cycle.rise.duration} hrs` : '—', color: '#92400e', bg: '#fef3c7' },
                        { label: 'Rising Rate', value: cycle.rise?.rate ? `${cycle.rise.rate} °C/hr` : '—', color: '#92400e', bg: '#fef3c7' },
                    ]} />
                </StageBlock>

                {/* 3. Constant Temperature */}
                <StageBlock title="③ Constant Temperature" color="#10b981" bg="#f0fdf4">
                    <InlineRow cols={[
                        { label: 'Start Time', value: cycle.constant?.startTime, color: '#059669', bg: '#dcfce7' },
                        { label: 'End Time', value: cycle.constant?.endTime, color: '#059669', bg: '#dcfce7' },
                        { label: 'Duration', value: cycle.constant?.duration ? `${cycle.constant.duration} hrs` : '—', color: '#065f46', bg: '#d1fae5' },
                        { label: 'Temperature Range', value: cycle.constant?.tempMin && cycle.constant?.tempMax ? `${cycle.constant.tempMin}–${cycle.constant.tempMax}°C` : '—', color: tempOk ? '#065f46' : '#dc2626', bg: tempOk ? '#d1fae5' : '#fef2f2' },
                    ]} />
                    {!tempOk && (
                        <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800', padding: '4px 8px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                            ⚠ Temperature out of range (expected 55–60°C)
                        </div>
                    )}
                </StageBlock>

                {/* 4. Cooling Period */}
                <StageBlock title="④ Cooling Period" color="#0891b2" bg="#ecfeff">
                    <InlineRow cols={[
                        { label: 'Start Time', value: cycle.cool?.startTime, color: '#0891b2', bg: '#cffafe' },
                        { label: 'End Time', value: cycle.cool?.endTime, color: '#0891b2', bg: '#cffafe' },
                        { label: 'Start Process Temp.', value: cycle.cool?.startTemp ? `${cycle.cool.startTemp}°C` : '—', color: '#0e7490', bg: '#a5f3fc50' },
                        { label: 'End Process Temp.', value: cycle.cool?.endTemp ? `${cycle.cool.endTemp}°C` : '—', color: '#0e7490', bg: '#a5f3fc50' },
                        { label: 'Cooling Duration', value: cycle.cool?.duration ? `${cycle.cool.duration} hrs` : '—', color: '#164e63', bg: '#cffafe' },
                        { label: 'Cooling Rate', value: cycle.cool?.rate ? `${cycle.cool.rate} °C/hr` : '—', color: '#164e63', bg: '#cffafe' },
                    ]} />
                </StageBlock>

                {/* 5. Final Stage */}
                <StageBlock title="⑤ Final Stage" color="#64748b" bg="#f8fafc">
                    <InlineRow cols={[
                        { label: 'Start Time', value: cycle.final?.startTime, color: '#475569', bg: '#f1f5f9' },
                        { label: 'End Time', value: cycle.final?.endTime, color: '#475569', bg: '#f1f5f9' },
                        { label: 'Final Stage Duration', value: cycle.final?.duration ? `${cycle.final.duration} hrs` : '—', color: '#334155', bg: '#e2e8f0' },
                    ]} />
                </StageBlock>

                {/* Witness Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                        className="btn-action"
                        onClick={() => handleWitness(cycle)}
                        style={{
                            padding: '10px 28px',
                            fontSize: '13px',
                            fontWeight: '800',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px #3b82f640'
                        }}
                    >
                        ✓ Witness This Cycle
                    </button>
                </div>
            </div>
        );
    };

    const renderForm = () => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowForm(false)}>
            <div className="fade-in" style={{ width: '100%', maxWidth: '1280px', maxHeight: '92vh', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ background: '#FFF8E7', padding: '1rem 1.5rem', borderBottom: '1px solid #F3E8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{editingId ? 'Modify' : 'New'} Steam Curing Entry</h2>
                        <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '10px', fontWeight: '700' }}>Heat Treatment Cycle Assurance</p>
                    </div>
                    <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✕</button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, overscrollBehavior: 'contain' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* SECTION 1: Initial Declaration */}
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
                                    <select
                                        value={selectedChamber}
                                        onChange={e => {
                                            setSelectedChamber(e.target.value);
                                            setManualForm(prev => ({ ...prev, chamberNo: e.target.value }));
                                        }}
                                        style={{ background: '#fff', fontSize: '13px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                    >
                                        <option value="">Select Chamber</option>
                                        {scadaCycles
                                            .filter(c => !selectedBatch || String(c.batchNo) === String(selectedBatch))
                                            .map(c => <option key={c.chamberNo} value={c.chamberNo}>{c.chamberNo}</option>)
                                        }
                                    </select>
                                </div>
                                <div className="form-field"><label style={{ fontSize: '10px' }}>Grade</label><input value={activeRecord?.grade || 'M60'} readOnly style={{ background: '#fff', fontSize: '13px', padding: '6px' }} /></div>
                                <div className="form-field"><label style={{ fontSize: '10px' }}>Date</label><input type="text" value={manualForm.date ? manualForm.date.split('-').reverse().join('/') : ''} readOnly style={{ background: '#fff', fontSize: '13px', padding: '6px' }} /></div>
                            </div>
                        </div>

                        {/* SECTION 2: SCADA Data Fetched */}
                        <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#d97706', color: '#fff', fontSize: '10px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#78350f', fontWeight: '800' }}>SCADA Data Fetched</h4>
                                </div>
                                <span style={{ fontSize: '10px', color: '#92400e', fontWeight: '700', background: '#fde68a', padding: '2px 10px', borderRadius: '20px' }}>
                                    {activeRecord ? `Batch ${activeRecord.batchNo} · Chamber ${activeRecord.chamberNo}` : 'Select Batch & Chamber'}
                                </span>
                            </div>
                            {renderScadaDataPanel(activeRecord)}
                        </div>

                        {/* SECTION 3: Manual Entry Form */}
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
                                            transition: 'all 0.2s',
                                            fontWeight: isTempInvalid(manualForm.minConstTemp) ? '700' : '400'
                                        }}
                                        type="number"
                                        value={manualForm.minConstTemp}
                                        onChange={e => setManualForm({ ...manualForm, minConstTemp: e.target.value })}
                                    />
                                    {isTempInvalid(manualForm.minConstTemp) && <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800', marginTop: '4px' }}>⚠ Must be 55–60°C</div>}
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
                                            transition: 'all 0.2s',
                                            fontWeight: isTempInvalid(manualForm.maxConstTemp) ? '700' : '400'
                                        }}
                                        type="number"
                                        value={manualForm.maxConstTemp}
                                        onChange={e => setManualForm({ ...manualForm, maxConstTemp: e.target.value })}
                                    />
                                    {isTempInvalid(manualForm.maxConstTemp) && <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800', marginTop: '4px' }}>⚠ Must be 55–60°C</div>}
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}><button className="toggle-btn" onClick={handleSaveManual}>{editingId ? 'Update Record' : 'Save Manual Record'}</button></div>
                        </div>

                        {/* SECTION 4: Recent Witness Logs */}
                        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#64748b', color: '#fff', fontSize: '10px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontWeight: '800' }}>Recent Witness Logs</h4>
                            </div>
                            <table className="ui-table" style={{ background: '#fff', fontSize: '12px' }}>
                                <thead><tr><th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Temp Range</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {entries.slice(0, 5).map(e => (
                                        <tr key={e.id}>
                                            <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                            <td>{e.date ? e.date.split('-').reverse().join('/') : ''}</td>
                                            <td>{e.batchNo}</td><td>{e.chamberNo}</td><td>{e.minConstTemp}–{e.maxConstTemp}°C</td>
                                            <td>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', background: e.status === 'OK' ? '#ecfdf5' : '#fef2f2', color: e.status === 'OK' ? '#059669' : '#dc2626' }}>
                                                    {e.status || 'OK'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                    <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(e.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {entries.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No records yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleFinalSave} disabled={isSaving} style={{ padding: '10px 30px', background: isSaving ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
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
                                <thead><tr><th>Source</th><th>Date</th><th>Batch</th><th>Chamber</th><th>Temp Range</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {entries.map(e => (
                                        <tr key={e.id}>
                                            <td><span className={`status-pill ${e.source === 'Manual' ? 'manual' : 'witnessed'}`}>{e.source}</span></td>
                                            <td>{e.date ? e.date.split('-').reverse().join('/') : ''}</td>
                                            <td>{e.batchNo}</td><td>{e.chamberNo}</td>
                                            <td>{e.minConstTemp}–{e.maxConstTemp}°C</td>
                                            <td>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', background: e.status === 'OK' ? '#ecfdf5' : '#fef2f2', color: e.status === 'OK' ? '#059669' : '#dc2626' }}>
                                                    {e.status || 'OK'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {e.source === 'Manual' && <button className="btn-action" onClick={() => handleEdit(e)}>Edit</button>}
                                                    <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(e.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {entries.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No records found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewMode === 'scada' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ margin: 0 }}>SCADA Data Fetched</h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginRight: '6px' }}>Batch No.:</label>
                                    <select className="dash-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginRight: '6px' }}>Chamber No.:</label>
                                    <select className="dash-select" value={selectedChamber} onChange={e => setSelectedChamber(e.target.value)}>
                                        <option value="">-- Select --</option>
                                        {scadaCycles
                                            .filter(c => !selectedBatch || String(c.batchNo) === String(selectedBatch))
                                            .map(c => <option key={c.chamberNo} value={c.chamberNo}>{c.chamberNo}</option>)
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {renderScadaDataPanel(activeRecord)}
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

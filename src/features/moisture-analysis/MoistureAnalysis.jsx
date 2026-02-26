import React, { useState } from 'react';
import MoistureEntryForm from './components/MoistureEntryForm';
import { apiService } from '../../services/api';

const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";
    if (typeof dateStr !== 'string') return "-";

    // If it's already in DD/MM/YYYY format, return it as is
    if (dateStr.includes('/') && !dateStr.includes('-')) {
        return dateStr;
    }

    // Handle ISO format (2025-02-26T...) or simple YYYY-MM-DD
    let parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
    }

    return dateStr;
};

const formatToBackendDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    }
    return dateStr;
};

const extractTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    // Handle ISO strings (e.g., 2026-02-24T14:13:00)
    if (dateTimeStr.includes('T')) return dateTimeStr.substring(11, 16);
    // Handle simple time strings (e.g., 14:13:00 or 14:13)
    if (dateTimeStr.includes(':')) {
        const parts = dateTimeStr.split(':');
        if (parts.length >= 2) {
            return `${parts[0].trim().padStart(2, '0')}:${parts[1].trim().padStart(2, '0')}`;
        }
    }
    return dateTimeStr;
};

/**
 * MoistureAnalysis Component
 * Displays moisture analysis statistics, trend chart, and recent entries.
 */
const MoistureAnalysis = ({ onBack, onSave, initialView = 'list', records = [], setRecords, displayMode = 'modal' }) => {
    const [view, setView] = useState(initialView);
    const [editRecord, setEditRecord] = useState(null);
    const [saving, setSaving] = useState(false);

    // Group records by batch number and date to show unified rows in UI
    const groupRecordsByBatch = (flatRecords) => {
        const groups = {};
        flatRecords.forEach(r => {
            const key = `${r.batchNo}_${r.createdDate?.split('T')[0] || r.entryDate}`;
            if (!groups[key]) {
                groups[key] = {
                    id: r.id,
                    batchNo: r.batchNo,
                    date: r.entryDate || r.createdDate?.split('T')[0],
                    shift: r.shift,
                    timing: r.entryTime || r.createdDate?.substring(11, 16),
                    ca1Free: r.sectionType === 'CA1' ? r.freeMoisturePercent : '-',
                    ca2Free: r.sectionType === 'CA2' ? r.freeMoisturePercent : '-',
                    faFree: r.sectionType === 'FA' ? r.freeMoisturePercent : '-',
                    totalFree: r.totalFreeMoisture,
                    timestamp: r.createdDate || new Date().toISOString(),
                    records: [r]
                };
            } else {
                if (r.sectionType === 'CA1') groups[key].ca1Free = r.freeMoisturePercent;
                if (r.sectionType === 'CA2') groups[key].ca2Free = r.freeMoisturePercent;
                if (r.sectionType === 'FA') groups[key].faFree = r.freeMoisturePercent;
                groups[key].records.push(r);
                // Keep the "best" batch level metrics
                if (r.totalFreeMoisture) groups[key].totalFree = r.totalFreeMoisture;
            }
        });
        return Object.values(groups).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (24 * 60 * 60 * 1000); // 24 hour window
    };

    const handleSaveEntry = async (uiData) => {
        setSaving(true);
        try {
            const aggregates = [
                { type: 'CA1', result: uiData.ca1Result },
                { type: 'CA2', result: uiData.ca2Result },
                { type: 'FA', result: uiData.faResult }
            ];

            const batchInfo = {
                entryDate: formatToBackendDate(uiData.date),
                shift: uiData.shift,
                entryTime: uiData.timing,
                batchNo: String(uiData.batchNo),
                batchWtDryCa1: parseFloat(uiData.userDryCA1) || 0,
                batchWtDryCa2: parseFloat(uiData.userDryCA2) || 0,
                batchWtDryFa: parseFloat(uiData.userDryFA) || 0,
                batchWtDryWater: parseFloat(uiData.userDryWater) || 0,
                batchWtDryAdmix: parseFloat(uiData.userDryAdmix) || 0,
                batchWtDryCement: parseFloat(uiData.userDryCement) || 0,
                wtAdoptedCa1: parseFloat(uiData.ca1Result.wtAdopted) || 0,
                wtAdoptedCa2: parseFloat(uiData.ca2Result.wtAdopted) || 0,
                wtAdoptedFa: parseFloat(uiData.faResult.wtAdopted) || 0,
                totalFreeMoisture: parseFloat(uiData.totalFree) || 0,
                adjustedWaterWt: parseFloat(uiData.adjustedWater) || 0,
                wcRatio: parseFloat(uiData.wcRatio) || 0,
                acRatio: parseFloat(uiData.acRatio) || 0,
                createdBy: 0,
                updatedBy: 0
            };

            if (editRecord) {
                // If editing, we update all technical records associated with this batch group
                // For simplicity, we create three updates (the backend will handle them)
                await Promise.all(aggregates.map(agg => {
                    const payload = {
                        ...batchInfo,
                        sectionType: agg.type,
                        wtWetSample: parseFloat(agg.result.wetSample) || 0,
                        wtDriedSample: parseFloat(agg.result.driedSample) || 0,
                        wtMoistureSample: parseFloat(agg.result.moistureInSample) || 0,
                        moisturePercent: parseFloat(agg.result.moisturePct) || 0,
                        absorptionPercent: parseFloat(agg.result.absorption) || 0,
                        freeMoisturePercent: parseFloat(agg.result.freeMoisturePct) || 0,
                        batchWtDry: parseFloat(agg.result.batchWtDry) || 0,
                        freeMoistureKg: parseFloat(agg.result.freeMoistureKg) || 0,
                        adjustedWeight: parseFloat(agg.result.adjustedWt) || 0,
                        adoptedWeight: parseFloat(agg.result.wtAdopted) || 0,
                    };

                    // Match by section type if possible from group
                    const existingRecord = editRecord.records?.find(r => r.sectionType === agg.type);
                    if (existingRecord) {
                        return apiService.updateMoistureAnalysis(existingRecord.id, payload);
                    }
                    return apiService.createMoistureAnalysis(payload);
                }));
            } else {
                // For new entries, create 3 separate records as per schema constraints
                await Promise.all(aggregates.map(agg => {
                    const payload = {
                        ...batchInfo,
                        sectionType: agg.type,
                        wtWetSample: parseFloat(agg.result.wetSample) || 0,
                        wtDriedSample: parseFloat(agg.result.driedSample) || 0,
                        wtMoistureSample: parseFloat(agg.result.moistureInSample) || 0,
                        moisturePercent: parseFloat(agg.result.moisturePct) || 0,
                        absorptionPercent: parseFloat(agg.result.absorption) || 0,
                        freeMoisturePercent: parseFloat(agg.result.freeMoisturePct) || 0,
                        batchWtDry: parseFloat(agg.result.batchWtDry) || 0,
                        freeMoistureKg: parseFloat(agg.result.freeMoistureKg) || 0,
                        adjustedWeight: parseFloat(agg.result.adjustedWt) || 0,
                        adoptedWeight: parseFloat(agg.result.wtAdopted) || 0,
                    };
                    return apiService.createMoistureAnalysis(payload);
                }));
            }

            setView('list');
            setEditRecord(null);
            onSave(); // Refetch logs
        } catch (error) {
            console.error("Error saving moisture analysis:", error);
            alert("Failed to save moisture analysis. Payload check triggered.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setView('entry');
    };

    // Calculate statistics based on section types
    const ca1Records = records.filter(r => r.sectionType === 'CA1');
    const ca2Records = records.filter(r => r.sectionType === 'CA2');
    const faRecords = records.filter(r => r.sectionType === 'FA');

    const avgCA1 = ca1Records.length > 0 ? (ca1Records.reduce((sum, r) => sum + (parseFloat(r.freeMoisturePercent) || 0), 0) / ca1Records.length).toFixed(2) : '0.00';
    const avgCA2 = ca2Records.length > 0 ? (ca2Records.reduce((sum, r) => sum + (parseFloat(r.freeMoisturePercent) || 0), 0) / ca2Records.length).toFixed(2) : '0.00';
    const avgFA = faRecords.length > 0 ? (faRecords.reduce((sum, r) => sum + (parseFloat(r.freeMoisturePercent) || 0), 0) / faRecords.length).toFixed(2) : '0.00';
    const avgTotal = records.length > 0 ? (records.filter(r => r.totalFreeMoisture).reduce((sum, r) => sum + (parseFloat(r.totalFreeMoisture) || 0), 0) / records.filter(r => r.totalFreeMoisture).length).toFixed(2) : '0.00';

    // Sort records by timestamp (latest first)
    const sortedRecords = [...records].sort((a, b) => {
        const timeA = new Date(a.createdDate || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdDate || b.timestamp || 0).getTime();
        return timeB - timeA;
    });

    const displayRecords = groupRecordsByBatch(sortedRecords);

    const content = (
        <div className={displayMode === 'modal' ? "modal-body" : "inline-container"} style={{ padding: displayMode === 'modal' ? '1.5rem' : '0', width: '100%' }}>
            {view === 'list' ? (
                <div className="list-view fade-in">
                    {/* Statistics Cards */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.8125rem', fontWeight: '800', color: '#444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Free Moisture Content</h3>
                        <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                            <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #3b82f6', padding: '0.75rem' }}>
                                <span className="mini-label" style={{ fontSize: '0.6rem' }}>CA1 (20mm)</span>
                                <div className="calc-value" style={{ fontSize: '1.15rem', color: '#3b82f6' }}>{avgCA1}%</div>
                            </div>
                            <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #8b5cf6', padding: '0.75rem' }}>
                                <span className="mini-label" style={{ fontSize: '0.6rem' }}>CA2 (10mm)</span>
                                <div className="calc-value" style={{ fontSize: '1.15rem', color: '#8b5cf6' }}>{avgCA2}%</div>
                            </div>
                            <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #f59e0b', padding: '0.75rem' }}>
                                <span className="mini-label" style={{ fontSize: '0.6rem' }}>Fine Agg (FA)</span>
                                <div className="calc-value" style={{ fontSize: '1.15rem', color: '#f59e0b' }}>{avgFA}%</div>
                            </div>
                            <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #10b981', padding: '0.75rem' }}>
                                <span className="mini-label" style={{ fontSize: '0.6rem' }}>Total Kg / Batch</span>
                                <div className="calc-value" style={{ fontSize: '1.15rem', color: '#10b981' }}>{avgTotal} Kg</div>
                            </div>
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', marginBottom: '1.25rem', textTransform: 'uppercase' }}>Precision Moisture Trends</h3>
                        <div style={{ position: 'relative', height: '140px', width: '100%', padding: '0 0.5rem' }}>
                            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                {[0, 50, 100, 150, 200].map(v => (
                                    <line key={v} x1="0" y1={v} x2="1000" y2={v} stroke="#f1f5f9" strokeWidth="1" />
                                ))}
                                {['ca1Free', 'ca2Free', 'faFree'].map((key, kIdx) => {
                                    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b'];
                                    const groups = displayRecords.slice(0, 10).reverse();
                                    if (groups.length < 2) return null;
                                    const step = 1000 / (groups.length - 1);
                                    const points = groups.map((g, i) => {
                                        const val = parseFloat(g[key]) || 0;
                                        return `${i * step},${200 - (val / 5) * 200}`;
                                    }).join(' ');
                                    return (
                                        <g key={key}>
                                            <polyline fill="none" stroke={colors[kIdx]} strokeWidth="3" strokeLinecap="round" points={points} style={{ transition: 'all 0.3s ease' }} />
                                            {groups.map((g, i) => {
                                                const val = parseFloat(g[key]) || 0;
                                                return <circle key={i} cx={i * step} cy={200 - (val / 5) * 200} r="4" fill="#fff" stroke={colors[kIdx]} strokeWidth="2" />;
                                            })}
                                        </g>
                                    );
                                })}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                {displayRecords.slice(0, 10).reverse().map((g, i) => (
                                    <span key={i} style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '700' }}>{g.timing}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.65rem', fontWeight: '800' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }}></div><span>CA1</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8b5cf6' }}></div><span>CA2</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }}></div><span>FA</span></div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', margin: 0, textTransform: 'uppercase' }}>Recent Moisture Samples</h3>
                    </div>

                    <div className="table-outer-wrapper fade-in" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                        <table className="ui-table">
                            <thead>
                                <tr style={{ fontSize: '0.7rem' }}>
                                    <th>Date & Shift</th><th>Time</th><th>CA1 %</th><th>CA2 %</th><th>FA %</th><th>Total</th><th>Status</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.8rem' }}>
                                {displayRecords.map((group, index) => (
                                    <tr key={index}>
                                        <td>{formatDateForDisplay(group.date)} ({group.shift})</td>
                                        <td><strong>{extractTime(group.timing)}</strong></td>
                                        <td style={{ color: '#3b82f6', fontWeight: '700' }}>{group.ca1Free !== '-' ? `${group.ca1Free}%` : '-'}</td>
                                        <td style={{ color: '#8b5cf6', fontWeight: '700' }}>{group.ca2Free !== '-' ? `${group.ca2Free}%` : '-'}</td>
                                        <td style={{ color: '#f59e0b', fontWeight: '700' }}>{group.faFree !== '-' ? `${group.faFree}%` : '-'}</td>
                                        <td style={{ fontWeight: '700' }}>{group.totalFree} Kg</td>
                                        <td>
                                            {isRecordEditable(group.timestamp) ? (
                                                <button className="btn-action" style={{ fontSize: '10px' }} onClick={() => handleEdit({
                                                    ...group,
                                                    id: group.id,
                                                    // Map group back to UI state for editing
                                                    ca1Details: {
                                                        wetSample: group.records.find(r => r.sectionType === 'CA1')?.wtWetSample || '',
                                                        driedSample: group.records.find(r => r.sectionType === 'CA1')?.wtDriedSample || '',
                                                        absorption: group.records.find(r => r.sectionType === 'CA1')?.absorptionPercent || ''
                                                    },
                                                    ca2Details: {
                                                        wetSample: group.records.find(r => r.sectionType === 'CA2')?.wtWetSample || '',
                                                        driedSample: group.records.find(r => r.sectionType === 'CA2')?.wtDriedSample || '',
                                                        absorption: group.records.find(r => r.sectionType === 'CA2')?.absorptionPercent || ''
                                                    },
                                                    faDetails: {
                                                        wetSample: group.records.find(r => r.sectionType === 'FA')?.wtWetSample || '',
                                                        driedSample: group.records.find(r => r.sectionType === 'FA')?.wtDriedSample || '',
                                                        absorption: group.records.find(r => r.sectionType === 'FA')?.absorptionPercent || ''
                                                    },
                                                    userDryCA1: group.records[0]?.batchWtDryCa1 || '',
                                                    userDryCA2: group.records[0]?.batchWtDryCa2 || '',
                                                    userDryFA: group.records[0]?.batchWtDryFa || '',
                                                    userDryWater: group.records[0]?.batchWtDryWater || '',
                                                    userDryCement: group.records[0]?.batchWtDryCement || '',
                                                    userDryAdmix: group.records[0]?.batchWtDryAdmix || '1.44'
                                                })}>Modify</button>
                                            ) : (
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700' }}>LOCKED</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '1rem 0' }}>
                    <div style={{ width: '100%', maxWidth: '1100px' }}>
                        <MoistureEntryForm
                            onCancel={() => { setView('list'); setEditRecord(null); }}
                            onSave={handleSaveEntry}
                            initialData={editRecord}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    if (displayMode === 'inline') {
        return content;
    }

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1300px', width: '96%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Moisture Analysis Dashboard</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Precision Lab Verification</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="close-btn" onClick={onBack}>×</button>
                    </div>
                </header>
                {content}
            </div>
        </div>
    );
};

export default MoistureAnalysis;

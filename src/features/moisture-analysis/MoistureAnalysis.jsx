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

    const handleEdit = async (record) => {
        // Fallback: Use the record from the list directly. 
        // The backend for MoistureAnalysis currently returns 404/Resources not found for single ID lookups.
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

                    {/* Precision Moisture Trends Graph - High-Density Dashboard Widget */}
                    <div className="chart-panel" style={{
                        height: '280px',
                        marginBottom: '1.5rem',
                        padding: '16px 20px',
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Precision Moisture Trends</h3>
                                <p style={{ margin: 0, fontSize: '0.6rem', color: '#64748b', fontWeight: '600' }}>Chronological batch verification (Last 10)</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.65rem', fontWeight: '800' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F81FF' }}></div><span>CA1</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8A63D2' }}></div><span>CA2</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F4A62A' }}></div><span>FA</span></div>
                            </div>
                        </div>

                        {/* Graph Container with specific paddings for axes */}
                        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, paddingLeft: '50px', paddingRight: '15px', paddingBottom: '35px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <svg width="100%" height="100%" viewBox="0 0 1000 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="grad-ca1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F81FF" stopOpacity="0.15" /><stop offset="100%" stopColor="#4F81FF" stopOpacity="0" /></linearGradient>
                                        <linearGradient id="grad-ca2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8A63D2" stopOpacity="0.15" /><stop offset="100%" stopColor="#8A63D2" stopOpacity="0" /></linearGradient>
                                        <linearGradient id="grad-fa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F4A62A" stopOpacity="0.15" /><stop offset="100%" stopColor="#F4A62A" stopOpacity="0" /></linearGradient>
                                    </defs>

                                    {/* Y-Axis Grid & Labels (Visible Context) */}
                                    {[0, 4, 8, 12].map((val, idx) => {
                                        const y = 100 - (val / 12) * 100;
                                        return (
                                            <g key={val}>
                                                <line x1="0" y1={y} x2="1000" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray={idx === 0 ? "0" : "4 4"} />
                                                <text x="-12" y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="700">{val}%</text>
                                            </g>
                                        );
                                    })}

                                    {(() => {
                                        // Robust Timestamp Parser
                                        const parseTime = (ts) => {
                                            if (!ts) return 0;
                                            if (typeof ts === 'number') return ts;
                                            if (ts.includes('/') && !ts.includes('-')) {
                                                const parts = ts.split(' ')[0].split('/');
                                                if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                                            }
                                            return new Date(ts).getTime() || 0;
                                        };

                                        const graphData = [...displayRecords]
                                            .sort((a, b) => parseTime(a.timestamp) - parseTime(b.timestamp))
                                            .slice(-10);

                                        if (graphData.length < 2) {
                                            return <text x="500" y="50" textAnchor="middle" fill="#cbd5e1" fontSize="14" fontWeight="700">Waiting for trend data...</text>;
                                        }

                                        const step = 1000 / (graphData.length - 1);
                                        const maxY = 12.0;
                                        const colors = ['#4F81FF', '#8A63D2', '#F4A62A'];
                                        const grads = ['url(#grad-ca1)', 'url(#grad-ca2)', 'url(#grad-fa)'];

                                        // Bezier Curve Logic
                                        const smoothing = 0.15;
                                        const line = (pointA, pointB) => {
                                            const lengthX = pointB.x - pointA.x;
                                            const lengthY = pointB.y - pointA.y;
                                            return { length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)), angle: Math.atan2(lengthY, lengthX) };
                                        };
                                        const controlPoint = (current, previous, next, reverse) => {
                                            const p = previous || current; const n = next || current;
                                            const l = line(p, n);
                                            const angle = l.angle + (reverse ? Math.PI : 0);
                                            const length = l.length * smoothing;
                                            return [current.x + Math.cos(angle) * length, current.y + Math.sin(angle) * length];
                                        };
                                        const svgPath = (pts) => {
                                            if (pts.length < 2) return "";
                                            return pts.reduce((acc, pt, i, a) => {
                                                if (i === 0) return `M ${pt.x},${pt.y}`;
                                                const [cp1x, cp1y] = controlPoint(a[i - 1], a[i - 2], pt);
                                                const [cp2x, cp2y] = controlPoint(pt, a[i - 1], a[i + 1], true);
                                                return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
                                            }, "");
                                        };

                                        return ['ca1Free', 'ca2Free', 'faFree'].map((key, kIdx) => {
                                            const points = graphData.map((g, i) => {
                                                const rawVal = parseFloat(g[key]);
                                                if (isNaN(rawVal)) return null;
                                                const val = Math.max(0, Math.min(rawVal, maxY));
                                                return { x: i * step, y: 100 - (val / maxY) * 100 };
                                            }).filter(p => p !== null);

                                            if (points.length < 2) return null;
                                            const d = svgPath(points);
                                            const areaD = `${d} L ${points[points.length - 1].x},120 L ${points[0].x},120 Z`;

                                            return (
                                                <g key={key}>
                                                    <path d={areaD} fill={grads[kIdx]} style={{ transition: 'all 0.4s' }} />
                                                    <path d={d} fill="none" stroke={colors[kIdx]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                    {points.map((p, i) => (
                                                        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={colors[kIdx]} strokeWidth="2" />
                                                    ))}
                                                </g>
                                            );
                                        });
                                    })()}
                                </svg>
                            </div>

                            {/* X-Axis Labels Container - Precisely Aligned */}
                            <div style={{ position: 'absolute', bottom: 0, left: '50px', right: '15px', display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #e2e8f0', paddingTop: '8px' }}>
                                {[...displayRecords].sort((a, b) => {
                                    const parseTime = (ts) => {
                                        if (!ts) return 0;
                                        if (ts.includes('/') && !ts.includes('-')) {
                                            const parts = ts.split(' ')[0].split('/');
                                            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                                        }
                                        return new Date(ts).getTime() || 0;
                                    };
                                    return parseTime(a.timestamp) - parseTime(b.timestamp);
                                }).slice(-10).map((g, i) => (
                                    <div key={i} style={{ textAlign: 'center', width: `${100 / 10}%` }}>
                                        <span style={{ fontSize: '0.65rem', color: '#1e293b', fontWeight: '900', display: 'block' }}>{extractTime(g.timing)}</span>
                                        <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: '700' }}>{formatDateForDisplay(g.date).split('/').slice(0, 2).join('/')}</span>
                                    </div>
                                ))}
                            </div>
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

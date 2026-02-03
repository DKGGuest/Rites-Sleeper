import React, { useState } from 'react';
import MoistureEntryForm from './components/MoistureEntryForm';

/**
 * MoistureAnalysis Component
 * Displays moisture analysis statistics, trend chart, and recent entries.
 */
const MoistureAnalysis = ({ onBack, onSave, initialView = 'list', records = [], setRecords, displayMode = 'modal' }) => {
    const [view, setView] = useState(initialView);
    const [editRecord, setEditRecord] = useState(null);

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (1 * 60 * 60 * 1000); // 1 hour window
    };

    const handleSaveEntry = (newEntry) => {
        if (editRecord) {
            setRecords(prev => prev.map(r => r.id === editRecord.id ? { ...newEntry, id: r.id, timestamp: r.timestamp } : r));
        } else {
            setRecords(prev => [{ ...newEntry, id: Date.now(), timestamp: new Date().toISOString() }, ...prev].slice(0, 10)); // Keep only 10
        }
        setView('list');
        setEditRecord(null);
        onSave();
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setView('entry');
    };

    // Calculate statistics
    const avgCA1 = records.length > 0 ? (records.reduce((sum, r) => sum + parseFloat(r.ca1Free), 0) / records.length).toFixed(2) : '0.00';
    const avgCA2 = records.length > 0 ? (records.reduce((sum, r) => sum + parseFloat(r.ca2Free), 0) / records.length).toFixed(2) : '0.00';
    const avgFA = records.length > 0 ? (records.reduce((sum, r) => sum + parseFloat(r.faFree), 0) / records.length).toFixed(2) : '0.00';
    const avgTotal = records.length > 0 ? (records.reduce((sum, r) => sum + parseFloat(r.totalFree), 0) / records.length).toFixed(2) : '0.00';

    // Mock data if no records exist
    const initialRecords = records.length > 0 ? records : [
        { id: 101, date: '2026-01-30', shift: 'A', timing: '08:30', ca1Free: '1.20', ca2Free: '0.80', faFree: '3.20', totalFree: '5.20', timestamp: new Date('2026-01-30T08:30:00').toISOString() },
        { id: 102, date: '2026-01-30', shift: 'A', timing: '07:15', ca1Free: '1.10', ca2Free: '0.95', faFree: '2.90', totalFree: '4.95', timestamp: new Date('2026-01-30T07:15:00').toISOString() },
        { id: 103, date: '2026-01-29', shift: 'C', timing: '20:15', ca1Free: '1.35', ca2Free: '0.75', faFree: '3.40', totalFree: '5.50', timestamp: new Date('2026-01-29T20:15:00').toISOString() },
        { id: 104, date: '2026-01-29', shift: 'B', timing: '14:00', ca1Free: '1.25', ca2Free: '0.85', faFree: '3.10', totalFree: '5.20', timestamp: new Date('2026-01-29T14:00:00').toISOString() }
    ];

    // Sort records by timestamp (latest first)
    const sortedRecords = [...initialRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // ... logic remains same ...

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
                                    const chartData = sortedRecords.slice(0, 10).reverse();
                                    if (chartData.length < 2) return null;
                                    const step = 1000 / (chartData.length - 1);
                                    const points = chartData.map((r, i) => `${i * step},${200 - (parseFloat(r[key]) / 5) * 200}`).join(' ');
                                    return (
                                        <g key={key}>
                                            <polyline fill="none" stroke={colors[kIdx]} strokeWidth="3" strokeLinecap="round" points={points} style={{ transition: 'all 0.3s ease' }} />
                                            {chartData.map((r, i) => (
                                                <circle key={i} cx={i * step} cy={200 - (parseFloat(r[key]) / 5) * 200} r="4" fill="#fff" stroke={colors[kIdx]} strokeWidth="2" />
                                            ))}
                                        </g>
                                    );
                                })}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                {sortedRecords.slice(0, 10).reverse().map((r, i) => (
                                    <span key={i} style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '700' }}>{r.timing}</span>
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
                                {sortedRecords.map((r, index) => (
                                    <tr key={r.id}>
                                        <td>{r.date} ({r.shift})</td>
                                        <td><strong>{r.timing}</strong></td>
                                        <td style={{ color: '#3b82f6', fontWeight: '700' }}>{r.ca1Free}%</td>
                                        <td style={{ color: '#8b5cf6', fontWeight: '700' }}>{r.ca2Free}%</td>
                                        <td style={{ color: '#f59e0b', fontWeight: '700' }}>{r.faFree}%</td>
                                        <td style={{ fontWeight: '700' }}>{r.totalFree} Kg</td>
                                        <td>
                                            {index < 2 ? (
                                                <button className="btn-action" style={{ fontSize: '10px' }} onClick={() => handleEdit(r)}>Modify</button>
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
                    <div style={{ width: '100%', maxWidth: '850px' }}>
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

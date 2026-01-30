import React, { useState } from 'react';
import MoistureEntryForm from './components/MoistureEntryForm';

/**
 * MoistureAnalysis Component
 * Displays moisture analysis statistics, trend chart, and recent entries.
 */
const MoistureAnalysis = ({ onBack, onSave, initialView = 'list' }) => {
    const [view, setView] = useState(initialView);
    const [editRecord, setEditRecord] = useState(null);
    const [records, setRecords] = useState([
        {
            id: 1, date: '2026-01-30', shift: 'A', timing: '08:30',
            ca1Free: '1.20', ca2Free: '0.80', faFree: '3.20', totalFree: '5.20',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
            id: 2, date: '2026-01-30', shift: 'A', timing: '07:15',
            ca1Free: '1.10', ca2Free: '0.95', faFree: '2.90', totalFree: '4.95',
            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        },
        {
            id: 3, date: '2026-01-29', shift: 'C', timing: '20:15',
            ca1Free: '1.35', ca2Free: '0.75', faFree: '3.40', totalFree: '5.50',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4, date: '2026-01-29', shift: 'B', timing: '14:00',
            ca1Free: '1.25', ca2Free: '0.85', faFree: '3.10', totalFree: '5.20',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
        },
    ]);

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (8 * 60 * 60 * 1000); // 8 hour shift window
    };

    const handleSaveEntry = (newEntry) => {
        if (editRecord) {
            setRecords(prev => prev.map(r => r.id === editRecord.id ? { ...newEntry, id: r.id, timestamp: r.timestamp } : r));
        } else {
            setRecords(prev => [{ ...newEntry, id: Date.now(), timestamp: new Date().toISOString() }, ...prev]);
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
    const avgCA1 = (records.reduce((sum, r) => sum + parseFloat(r.ca1Free), 0) / records.length).toFixed(2);
    const avgCA2 = (records.reduce((sum, r) => sum + parseFloat(r.ca2Free), 0) / records.length).toFixed(2);
    const avgFA = (records.reduce((sum, r) => sum + parseFloat(r.faFree), 0) / records.length).toFixed(2);
    const avgTotal = (records.reduce((sum, r) => sum + parseFloat(r.totalFree), 0) / records.length).toFixed(2);

    // Sort records by timestamp (latest first)
    const sortedRecords = [...records].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                <header className="modal-header">
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Moisture Analysis Dashboard</h2>
                    <button className="close-btn" onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </header>

                <div className="modal-body">
                    {view === 'list' ? (
                        <div className="list-view fade-in">
                            {/* Statistics Cards */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1rem' }}>Average Free Moisture Content (% Weight)</h3>
                                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                        <span className="mini-label">Avg. CA1 (20mm)</span>
                                        <div className="calc-value" style={{ color: '#3b82f6' }}>{avgCA1}%</div>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                        <span className="mini-label">Avg. CA2 (10mm)</span>
                                        <div className="calc-value" style={{ color: '#8b5cf6' }}>{avgCA2}%</div>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                        <span className="mini-label">Avg. FA</span>
                                        <div className="calc-value" style={{ color: '#f59e0b' }}>{avgFA}%</div>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #10b981' }}>
                                        <span className="mini-label">Combined Total</span>
                                        <div className="calc-value" style={{ color: '#10b981' }}>{avgTotal} Kg</div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Chart */}
                            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1.5rem' }}>Analytical Trend: Free Moisture % Analysis</h3>
                                <div style={{ position: 'relative', height: '180px', width: '100%', padding: '0 1rem' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                        {/* Y-Axis Grid Lines */}
                                        {[0, 50, 100, 150, 200].map(v => (
                                            <line key={v} x1="0" y1={v} x2="1000" y2={v} stroke="#f1f5f9" strokeWidth="1" />
                                        ))}

                                        {/* Paths */}
                                        {['ca1Free', 'ca2Free', 'faFree'].map((key, kIdx) => {
                                            const colors = ['#3b82f6', '#8b5cf6', '#f59e0b'];
                                            const chartData = sortedRecords.slice(0, 10).reverse();
                                            if (chartData.length < 2) return null;
                                            const step = 1000 / (chartData.length - 1);
                                            const points = chartData.map((r, i) => `${i * step},${200 - (parseFloat(r[key]) / 5) * 200}`).join(' ');
                                            return (
                                                <g key={key}>
                                                    <polyline
                                                        fill="none"
                                                        stroke={colors[kIdx]}
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        points={points}
                                                        style={{ transition: 'all 0.3s ease' }}
                                                    />
                                                    {chartData.map((r, i) => (
                                                        <circle
                                                            key={i}
                                                            cx={i * step}
                                                            cy={200 - (parseFloat(r[key]) / 5) * 200}
                                                            r="4"
                                                            fill="#fff"
                                                            stroke={colors[kIdx]}
                                                            strokeWidth="2"
                                                        />
                                                    ))}
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* X-Axis Labels */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingLeft: '5px' }}>
                                        {sortedRecords.slice(0, 10).reverse().map((r, i) => (
                                            <span key={i} style={{ fontSize: '0.65rem', color: '#64748b' }}>{r.timing}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', fontSize: '0.75rem', fontWeight: '500' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '2px', background: '#3b82f6', border: '1px solid #3b82f6' }}></div>
                                        <span>CA1 (20mm)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '2px', background: '#8b5cf6', border: '1px solid #8b5cf6' }}></div>
                                        <span>CA2 (10mm)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '2px', background: '#f59e0b', border: '1px solid #f59e0b' }}></div>
                                        <span>Fine Aggregate (FA)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Add New Entry Button */}
                            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Moisture Analysis History</h3>
                                <button className="toggle-btn" onClick={() => { setEditRecord(null); setView('entry'); }}>+ Add New Analysis</button>
                            </div>

                            {/* Recent Entries Table */}
                            <div className="data-table-section">
                                <div className="table-outer-wrapper">
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Date & Shift</th>
                                                <th>Timing</th>
                                                <th>CA1 Free %</th>
                                                <th>CA2 Free %</th>
                                                <th>FA Free %</th>
                                                <th>Total (Kg)</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedRecords.map((r, index) => (
                                                <tr key={r.id}>
                                                    <td data-label="Date & Shift"><span>{r.date} (Shift {r.shift})</span></td>
                                                    <td data-label="Timing"><span>{r.timing}</span></td>
                                                    <td data-label="CA1 Free %"><span>{r.ca1Free}%</span></td>
                                                    <td data-label="CA2 Free %"><span>{r.ca2Free}%</span></td>
                                                    <td data-label="FA Free %"><span>{r.faFree}%</span></td>
                                                    <td data-label="Total" style={{ fontWeight: '700', color: 'var(--primary-color)' }}><span>{r.totalFree} Kg</span></td>
                                                    <td data-label="Action">
                                                        {index < 2 ? (
                                                            <button className="btn-action" onClick={() => handleEdit(r)}>Modify</button>
                                                        ) : (
                                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Locked</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <MoistureEntryForm
                            onCancel={() => { setView('list'); setEditRecord(null); }}
                            onSave={handleSaveEntry}
                            initialData={editRecord}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoistureAnalysis;

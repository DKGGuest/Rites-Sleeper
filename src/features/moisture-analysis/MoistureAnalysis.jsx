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
        return diffMs < (60 * 60 * 1000); // 1 hour window
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
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1rem' }}>Average Free Moisture Content</h3>
                                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                        <span className="mini-label">CA1 (20mm)</span>
                                        <div className="calc-value" style={{ color: '#3b82f6' }}>{avgCA1}%</div>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Coarse Aggregate 1</span>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                                        <span className="mini-label">CA2 (10mm)</span>
                                        <div className="calc-value" style={{ color: '#8b5cf6' }}>{avgCA2}%</div>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Coarse Aggregate 2</span>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                        <span className="mini-label">FA</span>
                                        <div className="calc-value" style={{ color: '#f59e0b' }}>{avgFA}%</div>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Fine Aggregate</span>
                                    </div>
                                    <div className="calc-card" style={{ borderLeft: '4px solid #10b981' }}>
                                        <span className="mini-label">TOTAL</span>
                                        <div className="calc-value" style={{ color: '#10b981' }}>{avgTotal} Kg</div>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Combined Average</span>
                                    </div>
                                </div>
                            </div>

                            {/* Line Chart */}
                            <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '1.5rem' }}>Free Moisture Trend (Last {records.length} Samples)</h3>
                                <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 1rem' }}>
                                    {/* Y-axis labels */}
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', paddingRight: '0.5rem' }}>
                                        <span>4.0%</span>
                                        <span>3.0%</span>
                                        <span>2.0%</span>
                                        <span>1.0%</span>
                                        <span>0.0%</span>
                                    </div>

                                    {/* Chart bars */}
                                    {sortedRecords.slice(0, 8).reverse().map((r, idx) => (
                                        <div key={r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginLeft: idx === 0 ? '2rem' : 0 }}>
                                            <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: '160px' }}>
                                                <div style={{ flex: 1, background: '#3b82f6', height: `${(parseFloat(r.ca1Free) / 4) * 100}%`, borderRadius: '4px 4px 0 0', minHeight: '4px' }} title={`CA1: ${r.ca1Free}%`}></div>
                                                <div style={{ flex: 1, background: '#8b5cf6', height: `${(parseFloat(r.ca2Free) / 4) * 100}%`, borderRadius: '4px 4px 0 0', minHeight: '4px' }} title={`CA2: ${r.ca2Free}%`}></div>
                                                <div style={{ flex: 1, background: '#f59e0b', height: `${(parseFloat(r.faFree) / 4) * 100}%`, borderRadius: '4px 4px 0 0', minHeight: '4px' }} title={`FA: ${r.faFree}%`}></div>
                                            </div>
                                            <span style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>{r.timing}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.7rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                        <span>CA1 (20mm)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '2px' }}></div>
                                        <span>CA2 (10mm)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
                                        <span>FA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Add New Entry Button */}
                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', margin: 0 }}>Recent Entries</h3>
                                <button className="toggle-btn" onClick={() => { setEditRecord(null); setView('entry'); }}>+ Add New Entry</button>
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
                                                        {index < 2 && isRecordEditable(r.timestamp) ? (
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

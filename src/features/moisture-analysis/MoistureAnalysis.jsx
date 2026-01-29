import React, { useState } from 'react';
import MoistureEntryForm from './components/MoistureEntryForm';

/**
 * MoistureAnalysis Component
 * Manages list of moisture records and the entry form overlay.
 */
const MoistureAnalysis = ({ onBack, onSave, initialView = 'list' }) => {
    const [view, setView] = useState(initialView);
    const [editRecord, setEditRecord] = useState(null);
    const [records, setRecords] = useState([
        {
            id: 1, date: '2026-01-17', shift: 'A', timing: '08:30',
            ca1Free: '1.20', ca2Free: '0.80', faFree: '3.20', totalFree: '5.20',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
            id: 2, date: '2026-01-16', shift: 'C', timing: '20:15',
            ca1Free: '1.10', ca2Free: '0.95', faFree: '2.90', totalFree: '4.95',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
    ]);

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (60 * 60 * 1000); // 1 hour window
    };

    const handleSaveEntry = (newEntry) => {
        if (editRecord) {
            setRecords(prev => prev.map(r => r.id === editRecord.id ? { ...newEntry, id: r.id } : r));
        } else {
            setRecords(prev => [newEntry, ...prev]);
        }
        setView('list');
        setEditRecord(null);
        onSave();
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setView('entry');
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                <header className="modal-header">
                    <h2 style={{ fontSize: '1.25rem' }}>Moisture Analysis Dashboard</h2>
                    <button className="close-btn" onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </header>

                <div className="modal-body">
                    {view === 'list' ? (
                        <div className="list-view fade-in">
                            <div className="data-table-section">
                                <div className="table-title-bar">Shift-wise Absorption & Moisture Logs</div>
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
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((r) => (
                                                <tr key={r.id}>
                                                    <td data-label="Date & Shift"><span>{r.date} (Shift {r.shift})</span></td>
                                                    <td data-label="Timing"><span>{r.timing}</span></td>
                                                    <td data-label="CA1 Free %"><span>{r.ca1Free}%</span></td>
                                                    <td data-label="CA2 Free %"><span>{r.ca2Free}%</span></td>
                                                    <td data-label="FA Free %"><span>{r.faFree}%</span></td>
                                                    <td data-label="Total" style={{ fontWeight: '700', color: 'var(--primary-color)' }}><span>{r.totalFree} Kg</span></td>
                                                    <td data-label="Status">
                                                        {isRecordEditable(r.timestamp) ? (
                                                            <button className="toggle-btn secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem' }} onClick={() => handleEdit(r)}>Modify</button>
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
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button className="toggle-btn" onClick={() => { setEditRecord(null); setView('entry'); }}>+ New Moisture Sample</button>
                            </div>
                        </div>
                    ) : (
                        <MoistureEntryForm
                            onCancel={() => setView('list')}
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

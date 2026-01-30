import React, { useState, useEffect } from 'react';
import MouldPrepForm from './components/MouldPrepForm';
import HTSWireForm from './components/HTSWireForm';
import DemouldingForm from './components/DemouldingForm';

/**
 * ManualChecks Feature Module
 * Manages the different types of manual inspections:
 * 1. Mould Preparation
 * 2. Placement of HTS Wire
 * 3. Demoulding of Sleepers
 */
const ManualChecks = ({ onBack, onAlertChange, activeContainer }) => {
    // Consolidated entries state
    const [entries, setEntries] = useState({
        mouldPrep: [],
        htsWire: [],
        demoulding: []
    });

    const [viewMode, setViewMode] = useState('landing'); // 'landing' or 'detail'
    const [activeForm, setActiveForm] = useState(null);
    const [isLongLine, setIsLongLine] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);

    // Alert Handling
    const [alerts, setAlerts] = useState({
        mouldPrep: true,
        htsWire: true,
        demoulding: true
    });

    useEffect(() => {
        const checkAlert = (subModuleEntries) => {
            if (subModuleEntries.length === 0) return true;
            const oneHourAgo = new Date(Date.now() - 3600 * 1000);
            return !subModuleEntries.some(e => new Date(e.timestamp) > oneHourAgo);
        };

        const newAlerts = {
            mouldPrep: checkAlert(entries.mouldPrep),
            htsWire: checkAlert(entries.htsWire),
            demoulding: checkAlert(entries.demoulding)
        };

        setAlerts(newAlerts);
        if (onAlertChange) {
            onAlertChange(newAlerts.mouldPrep || newAlerts.htsWire || newAlerts.demoulding);
        }
    }, [entries, onAlertChange]);

    const handleSave = (subModule, data) => {
        if (editingEntry) {
            setEntries(prev => ({
                ...prev,
                [subModule]: prev[subModule].map(e => e.id === editingEntry.id ? { ...data, id: editingEntry.id, timestamp: editingEntry.timestamp } : e)
            }));
            setEditingEntry(null);
            alert('Record updated successfully');
        } else {
            setEntries(prev => ({
                ...prev,
                [subModule]: [{ ...data, id: Date.now(), timestamp: new Date().toISOString() }, ...prev[subModule]]
            }));
            alert('Record saved successfully');
        }
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (60 * 60 * 1000); // 1 hour window
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openModule = (moduleName) => {
        setActiveForm(moduleName);
        setViewMode('detail');
    };

    // Helper to render history table for a specific submodule
    const renderHistoryTable = (type) => {
        const records = entries[type] || [];

        return (
            <div className="table-outer-wrapper" style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#475569', margin: 0 }}>Shift History Log</h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{records.length} entries recorded</span>
                </div>
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>{isLongLine ? 'Gang' : 'Bench'}</th>
                            {type === 'mouldPrep' && <><th>Lumps Free</th><th>Oil Applied</th></>}
                            {type === 'htsWire' && <><th>Wires</th><th>Dia</th><th>Satisfactory</th></>}
                            {type === 'demoulding' && <><th>Visual</th><th>Dim. Check</th><th>Result</th></>}
                            <th>Remarks</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr><td colSpan="11" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>No entries recorded for this sub-module in the current shift.</td></tr>
                        ) : (
                            records.map(entry => (
                                <tr key={entry.id}>
                                    <td data-label="Time"><span>{entry.time}</span></td>
                                    <td data-label={isLongLine ? 'Gang' : 'Bench'}><span>{entry.benchNo}</span></td>
                                    {type === 'mouldPrep' && (
                                        <>
                                            <td data-label="Lumps Free"><span>{entry.lumpsFree ? '✅' : '❌'}</span></td>
                                            <td data-label="Oil Applied"><span>{entry.oilApplied ? '✅' : '❌'}</span></td>
                                        </>
                                    )}
                                    {type === 'htsWire' && (
                                        <>
                                            <td data-label="Wires"><span>{entry.wiresUsed}</span></td>
                                            <td data-label="Dia"><span>{entry.wireDia}</span></td>
                                            <td data-label="Satisfactory"><span>{entry.satisfactory ? 'Yes' : 'No'}</span></td>
                                        </>
                                    )}
                                    {type === 'demoulding' && (
                                        <>
                                            <td data-label="Visual"><span>{entry.visualCheck}</span></td>
                                            <td data-label="Dim. Check"><span>{entry.dimCheck}</span></td>
                                            <td data-label="Result"><span>{entry.processSatisfactory ? 'Pass' : 'Fail'}</span></td>
                                        </>
                                    )}
                                    <td data-label="Remarks"><span>{entry.remarks}</span></td>
                                    <td data-label="Action">
                                        {isRecordEditable(entry.timestamp) ? (
                                            <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: viewMode === 'landing' ? '900px' : '1100px' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {viewMode === 'detail' && (
                            <button className="back-btn" onClick={() => { setViewMode('landing'); setEditingEntry(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-color)' }}>←</button>
                        )}
                        <div>
                            <h2 style={{ margin: 0 }}>{viewMode === 'landing' ? 'Manual Inspection Dashboard' :
                                activeForm === 'mouldPrep' ? 'Mould Preparation Console' :
                                    activeForm === 'htsWire' ? 'HTS Wire Placement Console' : 'Demoulding Console'}</h2>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer', marginTop: '4px' }}>
                                <input type="checkbox" checked={isLongLine} onChange={e => setIsLongLine(e.target.checked)} />
                                Plant declared as Long line plant
                            </label>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {viewMode === 'landing' ? (
                        <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
                            <div className="calc-card clickable" onClick={() => openModule('mouldPrep')} style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span className="mini-label" style={{ color: '#3b82f6' }}>SECTION 01</span>
                                    <span style={{ fontSize: '0.8rem', color: alerts.mouldPrep ? '#ef4444' : '#22c55e' }}>{alerts.mouldPrep ? '● Pending' : '● Updated'}</span>
                                </div>
                                <h3 style={{ margin: '0.75rem 0', fontSize: '1.1rem' }}>Mould Preparation</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Cleaning, oiling, and visual inspection of moulds before casting.</p>
                                <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>OPEN CONSOLE →</div>
                            </div>

                            <div className="calc-card clickable" onClick={() => openModule('htsWire')} style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #8b5cf6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span className="mini-label" style={{ color: '#8b5cf6' }}>SECTION 02</span>
                                    <span style={{ fontSize: '0.8rem', color: alerts.htsWire ? '#ef4444' : '#22c55e' }}>{alerts.htsWire ? '● Pending' : '● Updated'}</span>
                                </div>
                                <h3 style={{ margin: '0.75rem 0', fontSize: '1.1rem' }}>HTS Wire Placement</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Verification of wire dia, count, and arrangement as per drawing.</p>
                                <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>OPEN CONSOLE →</div>
                            </div>

                            <div className="calc-card clickable" onClick={() => openModule('demoulding')} style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span className="mini-label" style={{ color: '#f59e0b' }}>SECTION 03</span>
                                    <span style={{ fontSize: '0.8rem', color: alerts.demoulding ? '#ef4444' : '#22c55e' }}>{alerts.demoulding ? '● Pending' : '● Updated'}</span>
                                </div>
                                <h3 style={{ margin: '0.75rem 0', fontSize: '1.1rem' }}>Demoulding</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Final visual and dimensional checks of sleep after steam curing.</p>
                                <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>OPEN CONSOLE →</div>
                            </div>
                        </div>
                    ) : (
                        <div className="fade-in">
                            {activeForm === 'mouldPrep' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <MouldPrepForm
                                        onSave={(data) => handleSave('mouldPrep', data)}
                                        isLongLine={isLongLine}
                                        existingEntries={entries.mouldPrep}
                                        initialData={editingEntry}
                                        activeContainer={activeContainer}
                                    />
                                    {renderHistoryTable('mouldPrep')}
                                </div>
                            )}

                            {activeForm === 'htsWire' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <HTSWireForm
                                        onSave={(data) => handleSave('htsWire', data)}
                                        isLongLine={isLongLine}
                                        initialData={editingEntry}
                                        activeContainer={activeContainer}
                                    />
                                    {renderHistoryTable('htsWire')}
                                </div>
                            )}

                            {activeForm === 'demoulding' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <DemouldingForm
                                        onSave={(data) => handleSave('demoulding', data)}
                                        isLongLine={isLongLine}
                                        initialData={editingEntry}
                                    />
                                    {renderHistoryTable('demoulding')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualChecks;

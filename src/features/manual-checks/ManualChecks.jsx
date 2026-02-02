import React, { useState, useEffect } from 'react';
import MouldPrepForm from './components/MouldPrepForm';
import HTSWireForm from './components/HTSWireForm';
import DemouldingForm from './components/DemouldingForm';

/**
 * ManualChecks Feature Module
 * Refactored to 3-Card Dashboard -> List -> Form flow.
 */
const ManualChecks = ({ onBack, onAlertChange, activeContainer, initialSubModule, initialViewMode, sharedState }) => {
    // Shared state from parent
    const { entries, setEntries } = sharedState;

    // View Modes: 'dashboard', 'list', 'form'
    const [viewMode, setViewMode] = useState(initialSubModule ? 'list' : 'dashboard');
    const [activeModule, setActiveModule] = useState(initialSubModule || null); // 'mouldPrep', 'htsWire', 'demoulding'
    const [editingEntry, setEditingEntry] = useState(null);

    // Logic for Long Line vs Stress Bench
    const isLongLine = activeContainer?.type === 'Line';
    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    // Update active form if initialSubModule changes
    useEffect(() => {
        if (initialSubModule) {
            setActiveModule(initialSubModule);
            setViewMode('list');
        }
    }, [initialSubModule]);

    const handleSave = (subModule, data) => {
        const enrichedData = {
            ...data,
            location: activeContainer?.name || 'N/A',
            locationType: activeContainer?.type || 'Location'
        };

        if (editingEntry) {
            setEntries(prev => ({
                ...prev,
                [subModule]: prev[subModule].map(e => e.id === editingEntry.id ? { ...enrichedData, id: editingEntry.id, timestamp: editingEntry.timestamp } : e)
            }));
            setEditingEntry(null);
            setViewMode('list'); // Return to list after save
            alert('Record updated successfully');
        } else {
            setEntries(prev => ({
                ...prev,
                [subModule]: [{ ...enrichedData, id: Date.now(), timestamp: new Date().toISOString() }, ...prev[subModule]]
            }));
            setViewMode('list'); // Return to list after save
            alert('Record saved successfully');
        }
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (12 * 60 * 60 * 1000); // 12 hour shift window
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setViewMode('form');
    };

    const handleDelete = (subModule, entryId) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setEntries(prev => ({
                ...prev,
                [subModule]: prev[subModule].filter(e => e.id !== entryId)
            }));
            alert('Record deleted successfully');
        }
    };

    const handleCardClick = (moduleName) => {
        setActiveModule(moduleName);
        setViewMode('list');
    };

    const handleAddNew = () => {
        setEditingEntry(null);
        setViewMode('form');
    };

    const getModuleTitle = (mod) => {
        switch (mod) {
            case 'mouldPrep': return 'Mould Preparation';
            case 'htsWire': return 'HTS Wire Placement';
            case 'demoulding': return 'Demoulding Inspection';
            default: return 'Module';
        }
    };

    const renderDashboard = () => (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Mould Prep Card */}
                <div
                    className="dashboard-card hover-lift"
                    onClick={() => handleCardClick('mouldPrep')}
                    style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧹</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Mould Preparation</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Log cleaning, oiling, and preparation status.</p>
                    <div style={{ fontWeight: '700', color: '#3b82f6' }}>
                        {entries.mouldPrep?.length || 0} Entries Today
                    </div>
                </div>

                {/* HTS Wire Card */}
                <div
                    className="dashboard-card hover-lift"
                    onClick={() => handleCardClick('htsWire')}
                    style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧵</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>HTS Wire Placement</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Record wire usage and placement checks.</p>
                    <div style={{ fontWeight: '700', color: '#8b5cf6' }}>
                        {entries.htsWire?.length || 0} Entries Today
                    </div>
                </div>

                {/* Demoulding Card */}
                <div
                    className="dashboard-card hover-lift"
                    onClick={() => handleCardClick('demoulding')}
                    style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Demoulding Inspection</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Post-curing visual and lifting checks.</p>
                    <div style={{ fontWeight: '700', color: '#10b981' }}>
                        {entries.demoulding?.length || 0} Entries Today
                    </div>
                </div>
            </div>

            {/* Recent Shift Activity Section */}
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>📋</span> Recent Shift Activity
                </h3>
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table className="ui-table">
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ textAlign: 'left' }}>Time</th>
                                <th style={{ textAlign: 'left' }}>Module</th>
                                <th style={{ textAlign: 'left' }}>Location ({fieldLabel})</th>
                                <th style={{ textAlign: 'left' }}>Result / Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(entries).every(k => entries[k].length === 0) ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No activity recorded yet in this shift.</td></tr>
                            ) : (
                                Object.keys(entries).flatMap(k => entries[k].map(e => ({ ...e, module: k }))).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10).map(entry => (
                                    <tr key={entry.id}>
                                        <td>{entry.time}</td>
                                        <td style={{ fontWeight: '600', color: '#42818c' }}>{getModuleTitle(entry.module)}</td>
                                        <td><strong>{entry.benchNo}</strong></td>
                                        <td>
                                            {entry.module === 'mouldPrep' && (
                                                <span style={{ color: entry.lumpsFree && entry.oilApplied ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                                                    {entry.lumpsFree && entry.oilApplied ? 'Ready' : 'Incomplete'}
                                                </span>
                                            )}
                                            {entry.module === 'htsWire' && (
                                                <span style={{ color: entry.satisfactory ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                                                    {entry.satisfactory ? 'Pass' : 'Fail'} ({entry.wiresUsed} wires)
                                                </span>
                                            )}
                                            {entry.module === 'demoulding' && (
                                                <span className={`status-pill ${entry.processSatisfactory ? 'witnessed' : 'manual'}`}>
                                                    {entry.processSatisfactory ? 'Pass' : 'Fail'}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                {isRecordEditable(entry.timestamp) ? (
                                                    <>
                                                        <button className="btn-action" onClick={() => { setActiveModule(entry.module); handleEdit(entry); }}>Edit</button>
                                                        <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }} onClick={() => handleDelete(entry.module, entry.id)}>Delete</button>
                                                    </>
                                                ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderModuleView = () => {
        const records = entries[activeModule] || [];
        const isFormOpen = viewMode === 'form';

        return (
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setViewMode('dashboard')} style={{ background: '#fff', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', color: '#64748b', fontWeight: 'bold' }}>← BACK</button>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{getModuleTitle(activeModule)} Console</h3>
                    </div>
                    {!isFormOpen && (
                        <button className="toggle-btn" onClick={handleAddNew}>
                            + Add New Entry
                        </button>
                    )}
                </div>

                {/* Integrated Form Section */}
                {isFormOpen && (
                    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '2px solid #3b82f6', maxWidth: '1000px', margin: '0 auto 2rem auto', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '2rem', color: '#3b82f6', textAlign: 'center' }}>
                            {editingEntry ? 'Edit' : 'Add New'} {getModuleTitle(activeModule)} Record
                        </h3>

                        {activeModule === 'mouldPrep' && (
                            <MouldPrepForm
                                onSave={(data) => handleSave('mouldPrep', data)}
                                onCancel={() => setViewMode('list')}
                                isLongLine={isLongLine}
                                existingEntries={entries.mouldPrep}
                                initialData={editingEntry}
                                activeContainer={activeContainer}
                            />
                        )}

                        {activeModule === 'htsWire' && (
                            <HTSWireForm
                                onSave={(data) => handleSave('htsWire', data)}
                                onCancel={() => setViewMode('list')}
                                isLongLine={isLongLine}
                                existingEntries={entries.htsWire}
                                initialData={editingEntry}
                                activeContainer={activeContainer}
                            />
                        )}

                        {activeModule === 'demoulding' && (
                            <DemouldingForm
                                onSave={(data) => handleSave('demoulding', data)}
                                onCancel={() => setViewMode('list')}
                                isLongLine={isLongLine}
                                existingEntries={entries.demoulding}
                                initialData={editingEntry}
                                activeContainer={activeContainer}
                            />
                        )}
                    </div>
                )}

                {/* Logs Table Section */}
                <div className="table-outer-wrapper" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: '#475569' }}>Current Shift Logs</h4>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total: {records.length} Entries</span>
                    </div>
                    <table className="ui-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>{fieldLabel} No.</th>
                                {activeModule === 'mouldPrep' && <><th>Lumps Free</th><th>Oil Applied</th></>}
                                {activeModule === 'htsWire' && <><th>Wires</th><th>Satisfactory</th></>}
                                {activeModule === 'demoulding' && <><th>Visual</th><th>Result</th></>}
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No entries found for this shift.</td></tr>
                            ) : (
                                records.map(entry => (
                                    <tr key={entry.id}>
                                        <td>{entry.time}</td>
                                        <td><strong>{entry.benchNo}</strong></td>
                                        {activeModule === 'mouldPrep' && (
                                            <>
                                                <td>{entry.lumpsFree ? '✅' : '❌'}</td>
                                                <td>{entry.oilApplied ? '✅' : '❌'}</td>
                                            </>
                                        )}
                                        {activeModule === 'htsWire' && (
                                            <>
                                                <td>{entry.wiresUsed}</td>
                                                <td>{entry.satisfactory ? 'Yes' : 'No'}</td>
                                            </>
                                        )}
                                        {activeModule === 'demoulding' && (
                                            <>
                                                <td>{entry.visualCheck}</td>
                                                <td><span className={`status-pill ${entry.processSatisfactory ? 'witnessed' : 'manual'}`}>{entry.processSatisfactory ? 'Pass' : 'Fail'}</span></td>
                                            </>
                                        )}
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                {isRecordEditable(entry.timestamp) ? (
                                                    <>{/* isRecordEditable is defined at line 56 */}
                                                        <button className="btn-action" onClick={() => handleEdit(entry)}>Edit</button>
                                                        <button className="btn-action" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }} onClick={() => handleDelete(activeModule, entry.id)}>Delete</button>
                                                    </>
                                                ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: viewMode === 'dashboard' ? '1200px' : '1600px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Manual Inspection Console</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                            {activeContainer?.name} ({isLongLine ? 'Long Line Plant' : 'Stress Bench Plant'})
                        </p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: viewMode === 'dashboard' ? '#f8fafc' : '#fff' }}>
                    {viewMode === 'dashboard' && renderDashboard()}
                    {(viewMode === 'list' || viewMode === 'form') && renderModuleView()}
                </div>
            </div>
        </div>
    );
};

export default ManualChecks;

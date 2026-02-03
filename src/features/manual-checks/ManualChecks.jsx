import React, { useState, useEffect } from 'react';
import MouldPrepForm from './components/MouldPrepForm';
import HTSWireForm from './components/HTSWireForm';
import DemouldingForm from './components/DemouldingForm';
import './ManualChecks.css';

/**
 * ManualChecks Feature Module
 * Refactored for:
 * 1. Compact typography (smaller font sizes)
 * 2. Dynamic interactive design (hover effects, transitions)
 * 3. Clean architecture
 */

const SubCard = ({ id, title, color, count, isActive, onClick, onAdd, alert }) => {
    const label = id === 'mouldPrep' ? 'IN-PROGRESS' : id === 'htsWire' ? 'LOGS' : 'RESULTS';
    const category = id === 'mouldPrep' ? 'PREP' : id === 'htsWire' ? 'PLACEMENT' : 'QUALITY';

    return (
        <div
            onClick={onClick}
            className={`manual-sub-card ${isActive ? 'active' : ''}`}
            style={{
                borderColor: isActive ? color : '#e2e8f0',
                borderTopColor: color,
                boxShadow: isActive ? `0 4px 12px ${color}20` : 'none',
                position: 'relative'
            }}
        >
            {alert && (
                <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '900',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                    zIndex: 10
                }}>
                    No Reading (1h)
                </div>
            )}
            <div className="sub-card-header">
                <span className="sub-card-mini-label" style={{ color: isActive ? color : '#64748b' }}>{label}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onAdd(id); }}
                    className="add-btn-mini"
                    style={{ background: color }}
                >
                    +
                </button>
            </div>
            <span className="sub-card-title">{title}</span>
            <div className="sub-card-footer">
                <div className="log-count-indicator">
                    <div className="status-dot" style={{ background: color, opacity: isActive ? 1 : 0.5 }}></div>
                    <span className="log-count-text" style={{ color: isActive ? color : '#94a3b8' }}><strong>{count}</strong> {category} READINGS</span>
                </div>
            </div>
        </div>
    );
};

const ManualChecks = ({ onBack, activeContainer, initialSubModule, initialViewMode, sharedState, initialEditData, isInline = false }) => {
    const { entries, setEntries } = sharedState;
    const [viewMode, setViewMode] = useState(initialViewMode === 'form' ? 'form' : 'dashboard');
    const [activeModule, setActiveModule] = useState(initialSubModule || 'mouldPrep');
    const [editingEntry, setEditingEntry] = useState(initialEditData || null);

    const isLongLine = activeContainer?.type === 'Line';
    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    useEffect(() => {
        if (initialSubModule) setActiveModule(initialSubModule);
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
        } else {
            setEntries(prev => ({
                ...prev,
                [subModule]: [{ ...enrichedData, id: Date.now(), timestamp: new Date().toISOString() }, ...prev[subModule]]
            }));
        }
        setEditingEntry(null);
        setViewMode('dashboard');
    };

    const handleDelete = (subModule, entryId) => {
        if (window.confirm('Delete this record?')) {
            setEntries(prev => ({
                ...prev,
                [subModule]: prev[subModule].filter(e => e.id !== entryId)
            }));
        }
    };

    const getModuleTitle = (mod) => {
        switch (mod) {
            case 'mouldPrep': return 'Mould Preparation';
            case 'htsWire': return 'HTS Wire Placement';
            case 'demoulding': return 'Demoulding Inspection';
            default: return 'Module';
        }
    };

    const renderLogs = (mod) => {
        const records = entries[mod] || [];
        return (
            <div className="table-outer-wrapper fade-in">
                <div className="content-title-row">
                    <h4>{getModuleTitle(mod)} History</h4>
                </div>
                <div className="table-responsive">
                    <table className="ui-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>{fieldLabel} No.</th>
                                {mod === 'mouldPrep' && <><th>Lumps Free</th><th>Oil Applied</th></>}
                                {mod === 'htsWire' && <><th>Wires</th><th>Satisfactory</th></>}
                                {mod === 'demoulding' && <><th>Visual</th><th>Result</th></>}
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr><td colSpan="6" className="empty-msg">No logs found.</td></tr>
                            ) : (
                                records.map(entry => (
                                    <tr key={entry.id} className="table-row-hover">
                                        <td>{entry.time}</td>
                                        <td><strong>{entry.benchNo}</strong></td>
                                        {mod === 'mouldPrep' && (
                                            <>
                                                <td className={entry.lumpsFree ? 'text-success' : 'text-danger'}>{entry.lumpsFree ? 'OK' : 'ISSUE'}</td>
                                                <td className={entry.oilApplied ? 'text-success' : 'text-danger'}>{entry.oilApplied ? 'OK' : 'ISSUE'}</td>
                                            </>
                                        )}
                                        {mod === 'htsWire' && (
                                            <>
                                                <td>{entry.wiresUsed}</td>
                                                <td>{entry.satisfactory ? 'Yes' : 'No'}</td>
                                            </>
                                        )}
                                        {mod === 'demoulding' && (
                                            <>
                                                <td>{entry.visualCheck}</td>
                                                <td><span className={`status-pill ${entry.processSatisfactory ? 'witnessed' : 'manual'}`}>{entry.processSatisfactory ? 'Pass' : 'Fail'}</span></td>
                                            </>
                                        )}
                                        <td className="text-center">
                                            <div className="btn-group-center">
                                                <button className="btn-action mini" onClick={() => { setEditingEntry(entry); setViewMode('form'); }}>Modify</button>
                                                <button className="btn-action mini danger" onClick={() => handleDelete(mod, entry.id)}>Delete</button>
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

    const content = (
        <div className="manual-checks-container">
            {viewMode === 'dashboard' ? (
                <>
                    <div className="sub-cards-grid">
                        {[
                            { id: 'mouldPrep', title: 'Mould Preparation', color: '#3b82f6' },
                            { id: 'htsWire', title: 'HTS Wire Placement', color: '#f59e0b' },
                            { id: 'demoulding', title: 'Demoulding Inspection', color: '#10b981' }
                        ].map(mod => {
                            const lastHour = new Date(Date.now() - 60 * 60 * 1000);
                            const records = entries[mod.id] || [];
                            const hasRecentReading = records.some(e => new Date(e.timestamp) > lastHour);
                            const showAlert = !hasRecentReading;

                            return (
                                <SubCard
                                    key={mod.id}
                                    id={mod.id}
                                    title={mod.title}
                                    color={mod.color}
                                    count={records.length}
                                    isActive={activeModule === mod.id}
                                    onClick={() => setActiveModule(mod.id)}
                                    onAdd={(id) => { setActiveModule(id); setEditingEntry(null); setViewMode('form'); }}
                                    alert={showAlert}
                                />
                            );
                        })}
                    </div>

                    {renderLogs(activeModule)}
                </>
            ) : (
                <div className="fade-in">
                    <div className="content-title-row">
                        <h3>{editingEntry ? 'Modify' : 'New'} {getModuleTitle(activeModule)}</h3>
                        <button className="toggle-btn secondary mini" onClick={() => setViewMode('dashboard')}>Back to Logs</button>
                    </div>

                    <div className="manual-form-wrapper">
                        {activeModule === 'mouldPrep' && (
                            <MouldPrepForm
                                onSave={(data) => handleSave('mouldPrep', data)}
                                onCancel={() => setViewMode('dashboard')}
                                isLongLine={isLongLine}
                                existingEntries={entries.mouldPrep}
                                initialData={editingEntry}
                                activeContainer={activeContainer}
                            />
                        )}
                        {activeModule === 'htsWire' && (
                            <HTSWireForm
                                onSave={(data) => handleSave('htsWire', data)}
                                onCancel={() => setViewMode('dashboard')}
                                isLongLine={isLongLine}
                                existingEntries={entries.htsWire}
                                initialData={editingEntry}
                                activeContainer={activeContainer}
                            />
                        )}
                        {activeModule === 'demoulding' && (
                            <DemouldingForm
                                onSave={(data) => handleSave('demoulding', data)}
                                onCancel={() => setViewMode('dashboard')}
                                isLongLine={isLongLine}
                                existingEntries={entries.demoulding}
                                initialData={editingEntry}
                                activeContainer={activeContainer}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    if (isInline) return content;

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="header-titles">
                        <h2>Inspection Console</h2>
                        <p className="header-subtitle">
                            {activeContainer?.name} • {isLongLine ? 'LONG LINE' : 'STRESS BENCH'}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body-wrapper">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default ManualChecks;

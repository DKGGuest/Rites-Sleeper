import React, { useState, useEffect } from 'react';
import MouldPrepForm from './components/MouldPrepForm';
import HTSWireForm from './components/HTSWireForm';
import DemouldingForm from './components/DemouldingForm';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * ManualChecks Feature Module
 * Standardized to 4-section-like dashboard per sub-module.
 */
const ManualChecks = ({ onBack, onAlertChange, activeContainer, initialSubModule, initialViewMode, sharedState }) => {
    // Shared state from parent
    const { entries, setEntries } = sharedState;

    const [viewMode, setViewMode] = useState(initialViewMode || 'landing'); // 'landing' or 'detail'
    const [activeForm, setActiveForm] = useState(initialSubModule || null);
    const [editingEntry, setEditingEntry] = useState(null);

    // Logic for Long Line vs Stress Bench
    const isLongLine = activeContainer?.type === 'Line';
    const fieldLabel = isLongLine ? 'Gang' : 'Bench';

    // Update active form if initialSubModule changes
    useEffect(() => {
        if (initialSubModule) {
            setActiveForm(initialSubModule);
            setViewMode('detail');
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
            setViewMode('landing');
            alert('Record updated successfully');
        } else {
            setEntries(prev => ({
                ...prev,
                [subModule]: [{ ...enrichedData, id: Date.now(), timestamp: new Date().toISOString() }, ...prev[subModule]]
            }));
            setViewMode('landing');
            alert('Record saved successfully');
        }
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (8 * 60 * 60 * 1000); // 8 hour shift window
    };

    const handleEdit = (subModule, entry) => {
        setEditingEntry(entry);
        setActiveForm(subModule);
        setViewMode('detail');
    };

    const openNewEntry = (subModule) => {
        setEditingEntry(null);
        setActiveForm(subModule);
        setViewMode('detail');
    };

    const renderHistoryTable = (type) => {
        const records = entries[type] || [];
        const typeLabel = type === 'mouldPrep' ? 'Mould Prep' : type === 'htsWire' ? 'HTS Wire' : 'Demoulding';

        return (
            <div className="table-outer-wrapper">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>{fieldLabel} No.</th>
                            {type === 'mouldPrep' && <><th>Lumps Free</th><th>Oil Applied</th></>}
                            {type === 'htsWire' && <><th>Wires</th><th>Satisfactory</th></>}
                            {type === 'demoulding' && <><th>Visual</th><th>Result</th></>}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No {typeLabel} entries for this shift.</td></tr>
                        ) : (
                            records.map(entry => (
                                <tr key={entry.id}>
                                    <td>{entry.time}</td>
                                    <td><strong>{entry.benchNo}</strong></td>
                                    {type === 'mouldPrep' && (
                                        <>
                                            <td>{entry.lumpsFree ? '✅' : '❌'}</td>
                                            <td>{entry.oilApplied ? '✅' : '❌'}</td>
                                        </>
                                    )}
                                    {type === 'htsWire' && (
                                        <>
                                            <td>{entry.wiresUsed}</td>
                                            <td>{entry.satisfactory ? 'Yes' : 'No'}</td>
                                        </>
                                    )}
                                    {type === 'demoulding' && (
                                        <>
                                            <td>{entry.visualCheck}</td>
                                            <td><span className={`status-pill ${entry.processSatisfactory ? 'witnessed' : 'manual'}`}>{entry.processSatisfactory ? 'Pass' : 'Fail'}</span></td>
                                        </>
                                    )}
                                    <td>
                                        {isRecordEditable(entry.timestamp) ? (
                                            <button className="btn-action" onClick={() => handleEdit(type, entry)}>Edit</button>
                                        ) : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>}
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
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Manual Inspection Console</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                            {activeContainer?.name} ({isLongLine ? 'Long Line Plant' : 'Stress Bench Plant'})
                        </p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {viewMode === 'landing' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            <CollapsibleSection title="1 - Mould Preparation Logs" defaultOpen={true}>
                                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="toggle-btn" onClick={() => openNewEntry('mouldPrep')}>+ New Mould Prep Entry</button>
                                </div>
                                {renderHistoryTable('mouldPrep')}
                            </CollapsibleSection>

                            <CollapsibleSection title="2 - HTS Wire Placement Logs" defaultOpen={true}>
                                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="toggle-btn" onClick={() => openNewEntry('htsWire')}>+ New HTS Wire Entry</button>
                                </div>
                                {renderHistoryTable('htsWire')}
                            </CollapsibleSection>

                            <CollapsibleSection title="3 - Demoulding Inspection Logs" defaultOpen={true}>
                                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="toggle-btn" onClick={() => openNewEntry('demoulding')}>+ New Demoulding Entry</button>
                                </div>
                                {renderHistoryTable('demoulding')}
                            </CollapsibleSection>

                        </div>
                    ) : (
                        <div className="fade-in">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <button className="back-btn" onClick={() => setViewMode('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ← Back to Inspection Logs
                                </button>
                            </div>

                            {activeForm === 'mouldPrep' && (
                                <MouldPrepForm
                                    onSave={(data) => handleSave('mouldPrep', data)}
                                    isLongLine={isLongLine}
                                    existingEntries={entries.mouldPrep}
                                    initialData={editingEntry}
                                    activeContainer={activeContainer}
                                />
                            )}

                            {activeForm === 'htsWire' && (
                                <HTSWireForm
                                    onSave={(data) => handleSave('htsWire', data)}
                                    isLongLine={isLongLine}
                                    existingEntries={entries.htsWire}
                                    initialData={editingEntry}
                                    activeContainer={activeContainer}
                                />
                            )}

                            {activeForm === 'demoulding' && (
                                <DemouldingForm
                                    onSave={(data) => handleSave('demoulding', data)}
                                    isLongLine={isLongLine}
                                    existingEntries={entries.demoulding}
                                    initialData={editingEntry}
                                    activeContainer={activeContainer}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualChecks;

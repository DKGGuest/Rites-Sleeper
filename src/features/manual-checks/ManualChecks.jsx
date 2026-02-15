import React, { useState, useEffect } from 'react';
import MouldPrepForm from './components/MouldPrepForm';
import HTSWireForm from './components/HTSWireForm';
import DemouldingForm from './components/DemouldingForm';
import { apiService } from '../../services/api';
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
                borderTopColor: color,
                borderRightColor: isActive ? color : '#e2e8f0',
                borderBottomColor: isActive ? color : '#e2e8f0',
                borderLeftColor: isActive ? color : '#e2e8f0',
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

    const handleSave = async (subModule, data) => {
        // Prepare the payload with location data
        const enrichedData = {
            ...data,
            location: activeContainer?.name || 'N/A',
            locationType: activeContainer?.type || 'Location'
        };

        // Special handling for demoulding inspection
        if (subModule === 'demoulding') {
            // Ensure defectiveSleeperDetails is always included (empty array if no defects)
            if (!enrichedData.defectiveSleeperDetails) {
                enrichedData.defectiveSleeperDetails = [];
            }

            // Debug logging for demoulding
            console.log('=== DEMOULDING INSPECTION PAYLOAD ===');
            console.log('Full Payload:', JSON.stringify(enrichedData, null, 2));
            console.log('Defective Sleeper Details:', enrichedData.defectiveSleeperDetails);
            console.log('Number of defective sleepers:', enrichedData.defectiveSleeperDetails.length);
            console.log('=====================================');
        }

        try {
            if (editingEntry) {
                // UPDATE existing entry
                let response;
                if (subModule === 'mouldPrep') {
                    response = await apiService.updateMouldPreparation(editingEntry.id, enrichedData);
                } else if (subModule === 'htsWire') {
                    response = await apiService.updateHtsWirePlacement(editingEntry.id, enrichedData);
                } else if (subModule === 'demoulding') {
                    console.log('Updating demoulding inspection ID:', editingEntry.id);
                    response = await apiService.updateDemouldingInspection(editingEntry.id, enrichedData);
                    console.log('Update response:', response);
                }

                const updated = response?.responseData;
                setEntries(prev => ({
                    ...prev,
                    [subModule]: prev[subModule].map(e => e.id === editingEntry.id ? (updated || { ...enrichedData, id: editingEntry.id, timestamp: editingEntry.timestamp }) : e)
                }));
            } else {
                // CREATE new entry
                let response;
                if (subModule === 'mouldPrep') {
                    response = await apiService.createMouldPreparation(enrichedData);
                } else if (subModule === 'htsWire') {
                    response = await apiService.createHtsWirePlacement(enrichedData);
                } else if (subModule === 'demoulding') {
                    console.log('Creating new demoulding inspection...');
                    response = await apiService.createDemouldingInspection(enrichedData);
                    console.log('Create response:', response);
                }

                const created = response?.responseData;
                setEntries(prev => ({
                    ...prev,
                    [subModule]: [(created || { ...enrichedData, id: Date.now(), timestamp: new Date().toISOString() }), ...prev[subModule]]
                }));
            }

            setEditingEntry(null);
            setViewMode('dashboard');

            if (subModule === 'demoulding') {
                console.log('✅ Demoulding inspection saved successfully!');
            }
        } catch (error) {
            console.error(`❌ Error saving ${subModule}:`, error);
            console.error('Error details:', error.message);
            console.error('Full error object:', error);

            if (subModule === 'demoulding') {
                console.error('Failed payload was:', enrichedData);
            }

            alert(`Failed to save ${subModule}. Check console for details.`);
        }
    };

    const handleDelete = async (subModule, entryId) => {
        if (window.confirm('Delete this record?')) {
            try {
                if (subModule === 'mouldPrep') await apiService.deleteMouldPreparation(entryId);
                else if (subModule === 'htsWire') await apiService.deleteHtsWirePlacement(entryId);
                else if (subModule === 'demoulding') await apiService.deleteDemouldingInspection(entryId);

                setEntries(prev => ({
                    ...prev,
                    [subModule]: prev[subModule].filter(e => e.id !== entryId)
                }));
            } catch (error) {
                console.error(`Error deleting ${subModule}:`, error);
                alert(`Failed to delete ${subModule}.`);
            }
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
                {/* History Header Removed as per requirement */}
                <div className="table-responsive">
                    <table className="ui-table">
                        <thead>
                            <tr>
                                {mod === 'mouldPrep' ? (
                                    <>
                                        <th style={{ background: '#fffbeb' }}>Line/Shed</th>
                                        <th style={{ background: '#fffbeb' }}>Date & Time</th>
                                        <th style={{ background: '#fffbeb' }}>Batch</th>
                                        <th style={{ background: '#fffbeb' }}>{fieldLabel} No.</th>
                                        <th style={{ background: '#fffbeb' }}>Type</th>
                                        <th style={{ background: '#fffbeb' }}>Mould Cleaned?</th>
                                        <th style={{ background: '#fffbeb' }}>Oil Applied?</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={{ width: '80px', background: '#fffbeb' }}>Location</th>
                                        <th style={{ background: '#fffbeb' }}>Date & Time</th>
                                        <th style={{ background: '#fffbeb' }}>Batch</th>
                                        <th style={{ background: '#fffbeb' }}>{fieldLabel} No.</th>
                                        <th style={{ background: '#fffbeb' }}>Type</th>
                                        {mod === 'htsWire' && (
                                            <>
                                                <th style={{ background: '#fffbeb' }}>Wires</th>
                                                <th style={{ background: '#fffbeb' }}>Arrangement</th>
                                                <th style={{ background: '#fffbeb' }}>Status</th>
                                            </>
                                        )}
                                        {mod === 'demoulding' && (
                                            <>
                                                <th style={{ background: '#fffbeb' }}>Casting</th>
                                                <th style={{ background: '#fffbeb' }}>Process</th>
                                                <th style={{ background: '#fffbeb' }}>Check Status</th>
                                            </>
                                        )}
                                    </>
                                )}
                                <th className="text-center" style={{ background: '#fffbeb' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr><td colSpan="10" className="empty-msg">No logs found.</td></tr>
                            ) : (
                                records.map(entry => (
                                    <tr key={entry.id} className="table-row-hover">
                                        {mod === 'mouldPrep' ? (
                                            <>
                                                <td style={{ fontSize: '11px', color: '#64748b' }}>{entry.location || 'N/A'}</td>
                                                <td>
                                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{entry.time}</div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{entry.date || '-'}</div>
                                                </td>
                                                <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{entry.batchNo || '-'}</span></td>
                                                <td><strong>{entry.benchNo}</strong></td>
                                                <td><small>{entry.sleeperType || '-'}</small></td>
                                                <td>
                                                    <span style={{
                                                        color: entry.lumpsFree === 'Yes' ? '#059669' : '#ef4444',
                                                        fontWeight: '700',
                                                        fontSize: '11px'
                                                    }}>
                                                        {entry.lumpsFree === 'Yes' ? '✓ CLEAN' : '✗ DIRTY'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        color: entry.oilApplied === 'Yes' ? '#059669' : '#ef4444',
                                                        fontWeight: '700',
                                                        fontSize: '11px'
                                                    }}>
                                                        {entry.oilApplied === 'Yes' ? '✓ APPLIED' : '✗ NO'}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ fontSize: '11px', color: '#64748b' }}>{entry.location || 'N/A'}</td>
                                                <td>
                                                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{entry.time}</div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{entry.date}</div>
                                                </td>
                                                <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{entry.batchNo || '-'}</span></td>
                                                <td><strong>{entry.benchNo}</strong></td>
                                                <td><small>{entry.sleeperType}</small></td>

                                                {mod === 'htsWire' && (
                                                    <>
                                                        <td>{entry.wiresUsed}</td>
                                                        <td>{entry.htsArrangementCheck}</td>
                                                        <td>
                                                            <span className={`status-pill ${entry.overallStatus === 'OK' ? 'witnessed' : 'manual'}`} style={{ fontSize: '10px' }}>
                                                                {entry.overallStatus}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                {mod === 'demoulding' && (
                                                    <>
                                                        <td><small>{entry.dateOfCasting ? new Date(entry.dateOfCasting).toLocaleDateString('en-GB') : '-'}</small></td>
                                                        <td style={{ fontSize: '11px' }}>{entry.processSatisfactory}</td>
                                                        <td>
                                                            <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span style={{ color: entry.visualCheck === 'All OK' ? '#059669' : '#dc2626' }}>V: {entry.visualCheck}</span>
                                                                <span style={{ color: entry.dimCheck === 'All OK' ? '#059669' : '#dc2626' }}>D: {entry.dimCheck}</span>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
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
                            onClick={() => { setActiveModule(mod.id); setViewMode('dashboard'); }}
                            onAdd={(id) => { setActiveModule(id); setEditingEntry(null); setViewMode('form'); }}
                            alert={showAlert}
                        />
                    );
                })}
            </div>

            {viewMode === 'dashboard' ? (
                renderLogs(activeModule)
            ) : (
                <div className="fade-in">
                    <div className="content-title-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button className="back-btn-circle" onClick={() => setViewMode('dashboard')} title="Back to Dashboard">←</button>
                            <h3 style={{ margin: 0 }}>{editingEntry ? 'Modify' : 'New'} {getModuleTitle(activeModule)}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="status-pill manual" style={{ padding: '6px 12px' }}>Input Mode</span>
                        </div>
                    </div>

                    <div className="manual-form-wrapper" style={{
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        border: '1px solid #e2e8f0',
                        marginBottom: '32px'
                    }}>
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

                    {/* NEW SECTION: Logs shown below form */}
                    <div className="logs-preview-section">
                        <div style={{
                            padding: '16px 20px',
                            background: '#f8fafc',
                            borderLeft: '4px solid #3b82f6',
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: '800' }}>RECENTLY SAVED LOGS</h4>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Shift: Current</span>
                        </div>
                        {renderLogs(activeModule)}
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

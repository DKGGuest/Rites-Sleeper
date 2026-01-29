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
const ManualChecks = ({ onBack, onAlertChange }) => {
    // Consolidated entries state
    const [entries, setEntries] = useState({
        mouldPrep: [],
        htsWire: [],
        demoulding: []
    });

    const [activeForm, setActiveForm] = useState('mouldPrep');

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

        // Auto-select the first alerting module if any
        if (newAlerts.mouldPrep) setActiveForm('mouldPrep');
        else if (newAlerts.htsWire) setActiveForm('htsWire');
        else if (newAlerts.demoulding) setActiveForm('demoulding');

    }, [entries, onAlertChange]);

    const handleSave = (subModule, data) => {
        setEntries(prev => ({
            ...prev,
            [subModule]: [{ ...data, id: Date.now(), timestamp: new Date().toISOString() }, ...prev[subModule]]
        }));
    };

    // Helper to render history table for a specific submodule
    const renderHistoryTable = (type) => {
        const records = entries[type] || [];

        return (
            <div className="table-outer-wrapper" style={{ marginTop: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#475569', marginBottom: '1rem' }}>Shift History</h4>
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Bench</th>
                            {type === 'mouldPrep' && <><th>Lumps Free</th><th>Oil Applied</th></>}
                            {type === 'htsWire' && <><th>Wires</th><th>Dia</th><th>Satisfactory</th></>}
                            {type === 'demoulding' && <><th>Visual</th><th>Dim. Check</th><th>Result</th></>}
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr><td colSpan="10" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No entries this shift.</td></tr>
                        ) : (
                            records.slice(0, 5).map(entry => (
                                <tr key={entry.id}>
                                    <td data-label="Time"><span>{entry.time}</span></td>
                                    <td data-label="Bench"><span>{entry.benchNo}</span></td>
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
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                <header className="modal-header">
                    <h2>Manual Inspection Console</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {/* Segmented Toggle Control */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <div className="segmented-control" style={{
                            display: 'flex',
                            background: '#f1f5f9',
                            padding: '4px',
                            borderRadius: '8px',
                            gap: '4px'
                        }}>
                            <button
                                onClick={() => setActiveForm('mouldPrep')}
                                className={activeForm === 'mouldPrep' ? 'active' : ''}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeForm === 'mouldPrep' ? '#fff' : 'transparent',
                                    boxShadow: activeForm === 'mouldPrep' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    color: activeForm === 'mouldPrep' ? '#0f172a' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Mould Prep <span style={{ fontSize: '0.8em', color: alerts.mouldPrep ? '#ef4444' : '#22c55e' }}>●</span>
                            </button>
                            <button
                                onClick={() => setActiveForm('htsWire')}
                                className={activeForm === 'htsWire' ? 'active' : ''}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeForm === 'htsWire' ? '#fff' : 'transparent',
                                    boxShadow: activeForm === 'htsWire' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    color: activeForm === 'htsWire' ? '#0f172a' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                HTS Wire <span style={{ fontSize: '0.8em', color: alerts.htsWire ? '#ef4444' : '#22c55e' }}>●</span>
                            </button>
                            <button
                                onClick={() => setActiveForm('demoulding')}
                                className={activeForm === 'demoulding' ? 'active' : ''}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeForm === 'demoulding' ? '#fff' : 'transparent',
                                    boxShadow: activeForm === 'demoulding' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    color: activeForm === 'demoulding' ? '#0f172a' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Demoulding <span style={{ fontSize: '0.8em', color: alerts.demoulding ? '#ef4444' : '#22c55e' }}>●</span>
                            </button>
                        </div>
                    </div>

                    <div className="fade-in">
                        {activeForm === 'mouldPrep' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                <MouldPrepForm onSave={(data) => handleSave('mouldPrep', data)} />
                                {renderHistoryTable('mouldPrep')}
                            </div>
                        )}

                        {activeForm === 'htsWire' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                <HTSWireForm onSave={(data) => handleSave('htsWire', data)} />
                                {renderHistoryTable('htsWire')}
                            </div>
                        )}

                        {activeForm === 'demoulding' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                <DemouldingForm onSave={(data) => handleSave('demoulding', data)} />
                                {renderHistoryTable('demoulding')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualChecks;

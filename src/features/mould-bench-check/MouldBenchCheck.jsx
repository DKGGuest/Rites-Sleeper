import React, { useState } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * SummaryCard Component
 */
const SummaryCard = ({ label, value, subValue, icon, color }) => (
    <div className="calc-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="mini-label">{label}</span>
            {icon && <span>{icon}</span>}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color || 'inherit', margin: '5px 0' }}>{value}</div>
        {subValue && <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>{subValue}</div>}
    </div>
);

/**
 * MouldBenchCheck Feature
 * Manages plant asset inspections for benches and moulds.
 */
const MouldBenchCheck = ({ onBack }) => {
    const [view, setView] = useState('summary');

    // Mock Data
    const [stats] = useState({
        benchesInPlant: 60, mouldsInPlant: 240, benchesUsed30d: 55, mouldsUsed30d: 215,
        benchesCheckedMonth: 42, mouldsCheckedMonth: 168, mouldsNotFit: 4
    });

    const [checks, setChecks] = useState([
        { id: 1, time: '2026-01-22 09:30', benchNo: '210-A to D', benchResult: 'OK', mouldResult: 'OK', overallResult: 'OK' }
    ]);

    // Form State
    const [formState, setFormState] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        benchVisual: 'ok',
        benchVisualReason: '',
        benchDim: 'ok',
        benchDimReasons: {},
        mouldVisual: 'ok',
        mouldVisualReason: '',
        mouldDim: 'ok',
        mouldDimReasons: {},
        remarks: ''
    });

    const handleFormChange = (updates) => {
        setFormState(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        const newRecord = {
            id: Date.now(),
            time: `${new Date().toISOString().split('T')[0]} ${formState.time}`,
            benchNo: formState.benchNo,
            benchResult: (formState.benchVisual === 'ok' && formState.benchDim === 'ok') ? 'OK' : 'Not OK',
            mouldResult: (formState.mouldVisual === 'ok' && formState.mouldDim === 'ok') ? 'OK' : 'Not OK',
            overallResult: (formState.benchVisual === 'ok' && formState.benchDim === 'ok' && formState.mouldVisual === 'ok' && formState.mouldDim === 'ok') ? 'OK' : 'Not OK'
        };
        setChecks([newRecord, ...checks]);
        setView('history');
        // Reset form or keep defaults? keeping some defaults helpful
        setFormState(prev => ({ ...prev, benchNo: '', remarks: '' }));
    };

    const benchDimFields = [
        "Length", "Width inside bench", "Distance between fixed end of first channel",
        "Distance between 1st & 2nd channel", "Distance between 2nd & 3rd channel",
        "Distance between 3rd & 4th channel", "Distance between 4th & 5th channel",
        "Distance between 5th & 6th channel", "Distance between 6th & 7th channel",
        "Distance between 7th & 8th channel", "Distance between 8th & 9th channel",
        "Distance between lifting hooks", "Distance between lifting hook to fixed end",
        "Distance between lifting hook to free end", "Jack height (Left)", "Jack height (Right)",
        "Jack length (Left)", "Jack length (Right)", "End box stand length",
        "Tie plate thickness on channel", "Tie thickness", "Dab bolt and nut position",
        "Main channel", "Bottom channel", "Rail below lifting hook"
    ];

    const renderSummary = () => {
        const benchPct = ((stats.benchesCheckedMonth / stats.benchesUsed30d) * 100).toFixed(1);
        const mouldPct = ((stats.mouldsCheckedMonth / stats.mouldsUsed30d) * 100).toFixed(1);

        return (
            <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <SummaryCard label="Benches in Plant" value={stats.benchesInPlant} icon="🏗️" />
                <SummaryCard label="Moulds in Plant" value={stats.mouldsInPlant} icon="📦" />
                <SummaryCard label="Benches Checked (Month)" value={stats.benchesCheckedMonth} subValue={`${benchPct}% of used`} color="var(--primary-color)" />
                <SummaryCard label="Moulds Checked (Month)" value={stats.mouldsCheckedMonth} subValue={`${mouldPct}% of used`} color="var(--primary-color)" />
                <SummaryCard label="Unfit Moulds" value={stats.mouldsNotFit} color="var(--color-danger)" />
            </div>
        );
    };

    const renderForm = () => (
        <div className="fade-in">
            <div className="form-grid" style={{ marginBottom: '20px' }}>
                <div className="form-field">
                    <label>Time</label>
                    <input type="time" value={formState.time} onChange={e => handleFormChange({ time: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Bench / Mould No.</label>
                    <input type="text" placeholder="e.g. 210 - A to D" value={formState.benchNo} onChange={e => handleFormChange({ benchNo: e.target.value })} />
                </div>
            </div>

            <CollapsibleSection title="Bench Checking">
                <div className="form-field">
                    <label>Visual Checking Result</label>
                    <select value={formState.benchVisual} onChange={e => handleFormChange({ benchVisual: e.target.value })}>
                        <option value="ok">OK</option>
                        <option value="not_ok">Not OK</option>
                    </select>
                </div>
                {formState.benchVisual === 'not_ok' && (
                    <div className="form-field">
                        <label>Reason</label>
                        <select value={formState.benchVisualReason} onChange={e => handleFormChange({ benchVisualReason: e.target.value })}>
                            <option value="">Select Reason...</option>
                            <option value="welding">Welding condition</option>
                            <option value="material">Material usage</option>
                        </select>
                    </div>
                )}
                <div className="form-field" style={{ marginTop: '1rem' }}>
                    <label>Dimension Checking Result</label>
                    <select value={formState.benchDim} onChange={e => handleFormChange({ benchDim: e.target.value })}>
                        <option value="ok">OK</option>
                        <option value="not_ok">Not OK</option>
                    </select>
                </div>
                {formState.benchDim === 'not_ok' && (
                    <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '4px' }}>
                        <label className="mini-label">Discrepancies:</label>
                        {benchDimFields.map(field => (
                            <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                                <input type="checkbox" id={`b-${field}`} onChange={(e) => {
                                    const newReasons = { ...formState.benchDimReasons };
                                    if (e.target.checked) newReasons[field] = true;
                                    else delete newReasons[field];
                                    handleFormChange({ benchDimReasons: newReasons });
                                }} />
                                <label htmlFor={`b-${field}`} style={{ fontSize: '11px', fontWeight: '400' }}>{field}</label>
                            </div>
                        ))}
                    </div>
                )}
            </CollapsibleSection>

            <CollapsibleSection title="Mould Checking">
                <div className="form-field">
                    <label>Visual Result</label>
                    <select value={formState.mouldVisual} onChange={e => handleFormChange({ mouldVisual: e.target.value })}>
                        <option value="ok">OK</option>
                        <option value="not_ok">Not OK</option>
                    </select>
                </div>
            </CollapsibleSection>

            <div className="form-actions-center">
                <button className="toggle-btn" onClick={handleSave} style={{ width: '100%', maxWidth: '300px' }}>Submit Report</button>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>Asset Integrity Management</h2>
                        <nav className="modal-tabs" style={{ border: 'none', margin: 0 }}>
                            <button className={`modal-tab-btn ${view === 'summary' ? 'active' : ''}`} onClick={() => setView('summary')}>Summary</button>
                            <button className={`modal-tab-btn ${view === 'form' ? 'active' : ''}`} onClick={() => setView('form')}>Add Entry</button>
                            <button className={`modal-tab-btn ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>History</button>
                        </nav>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {view === 'summary' && renderSummary()}

                    {view === 'history' && (
                        <div className="table-outer-wrapper fade-in">
                            <table className="ui-table">
                                <thead>
                                    <tr><th>Timestamp</th><th>Bench / Mould</th><th>Bench Status</th><th>Mould Status</th><th>Overall</th></tr>
                                </thead>
                                <tbody>
                                    {checks.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.time}</td><td>{c.benchNo}</td><td>{c.benchResult}</td><td>{c.mouldResult}</td>
                                            <td><span className={`status-pill ${c.overallResult === 'OK' ? 'witnessed' : 'manual'}`}>{c.overallResult}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'form' && renderForm()}
                </div>
            </div>
        </div>
    );
};

export default MouldBenchCheck;

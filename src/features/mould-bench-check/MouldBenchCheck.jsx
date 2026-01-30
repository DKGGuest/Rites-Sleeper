import React, { useState, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * SummaryCard Component - Enhanced for Premium Look
 */
const SummaryCard = ({ label, value, subValue, icon, color, trend }) => (
    <div className="calc-card" style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span className="mini-label" style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>{label}</span>
            {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: color || '#1e293b', margin: '2px 0' }}>{value}</div>
        {subValue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{subValue}</span>
                {trend && <span style={{ fontSize: '0.7rem', color: trend === 'up' ? '#10b981' : '#ef4444' }}>{trend === 'up' ? '↑' : '↓'}</span>}
            </div>
        )}
    </div>
);

/**
 * MouldBenchCheck Feature
 */
const MouldBenchCheck = ({ onBack }) => {
    const [view, setView] = useState('summary');

    // Mock Stats Data
    const [stats] = useState({
        benchesInPlant: 60,
        mouldsInPlant: 240,
        benchesUsed30d: 55,
        mouldsUsed30d: 215,
        benchesCheckedMonth: 42,
        mouldsCheckedMonth: 168,
        mouldsNotFit: 4
    });

    // Mock Asset Data (List of all Benches & Moulds)
    const [assets] = useState([
        { no: '210 - A to D (single Bench)', type: 'Bench', lastCasting: '2026-01-25', lastChecking: '2026-01-10', result: 'OK' },
        { no: '210 - A to H (Twin Bench)', type: 'Bench', lastCasting: '2026-01-29', lastChecking: '2026-01-28', result: 'OK' },
        { no: 'M-101', type: 'Mould', lastCasting: '2025-12-15', lastChecking: '2025-11-20', result: 'Not OK' },
        { no: 'M-102', type: 'Mould', lastCasting: '2026-01-20', lastChecking: '2025-12-10', result: 'OK' },
        { no: 'M-103', type: 'Mould', lastCasting: '2026-01-28', lastChecking: '2026-01-29', result: 'OK' },
        { no: '211 - A to D', type: 'Bench', lastCasting: '2025-12-01', lastChecking: '2025-11-15', result: 'OK' }, // Not in use
        { no: '212 - A to D', type: 'Bench', lastCasting: '2026-01-28', lastChecking: '2025-12-01', result: 'OK' }, // Checking Pending
    ]);

    // Mock History Data
    const [checks, setChecks] = useState([
        { id: 1, dateTime: '2026-01-30 10:30', no: '210 - A to D', benchCheck: 'OK', mouldCheck: 'OK', overall: 'OK' },
        { id: 2, dateTime: '2026-01-29 14:15', no: '210 - A to H', benchCheck: 'OK', mouldCheck: 'Not OK', overall: 'Not OK' },
    ]);

    // Form State
    const [formState, setFormState] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        // Bench Checking
        benchVisual: 'ok',
        benchVisualReason: '',
        benchDim: 'ok',
        benchDimReasons: {},
        benchRemarks: '',
        // Mould Checking
        mouldVisual: 'ok',
        mouldVisualReason: '',
        mouldDim: 'ok',
        mouldDimReasons: {},
        mouldRemarks: '',
    });

    const handleFormChange = (updates) => {
        setFormState(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        const newRecord = {
            id: Date.now(),
            dateTime: `${new Date().toISOString().split('T')[0]} ${formState.time}`,
            no: formState.benchNo,
            benchCheck: (formState.benchVisual === 'ok' && formState.benchDim === 'ok') ? 'OK' : 'Not OK',
            mouldCheck: (formState.mouldVisual === 'ok' && formState.mouldDim === 'ok') ? 'OK' : 'Not OK',
            overall: (formState.benchVisual === 'ok' && formState.benchDim === 'ok' && formState.mouldVisual === 'ok' && formState.mouldDim === 'ok') ? 'OK' : 'Not OK'
        };
        setChecks([newRecord, ...checks]);
        setView('history');
        // Reset form
        setFormState(prev => ({
            ...prev,
            benchNo: '',
            benchVisual: 'ok', benchVisualReason: '', benchDim: 'ok', benchDimReasons: {}, benchRemarks: '',
            mouldVisual: 'ok', mouldVisualReason: '', mouldDim: 'ok', mouldDimReasons: {}, mouldRemarks: ''
        }));
    };

    const benchDimFields = [
        "Length", "Width inside bench", "Distance between fixed end of first channel",
        "Distance between first & second channel", "Distance between second & third channel",
        "Distance between third & fourth channel", "Distance between fourth & fifth channel",
        "Distance between fifth & sixth channel", "Distance between sixth & seventh channel",
        "Distance between seventh & eighth channel", "Distance between eighth & ninth channel",
        "Distance between lifting hooks", "Distance between lifting hook to fixed end",
        "Distance between lifting hook to free end", "Jack height (Left)", "Jack height (Right)",
        "Jack length (Left)", "Jack length (Right)", "End box stand length (Left)", "End box stand length (Right)",
        "Tie plate thickness on channel", "Tie thickness", "Distance between jack & end box stand",
        "Free end box hole position", "Fixed end box hole position", "Dab bolt and nut position",
        "Main channel", "Bottom channel", "Rail below lifting hook", "Height of rail below lifting hook"
    ];

    const mouldDimFields = [
        "Full Length", "Outer Length (insert to Insert)", "Between Rail Seat",
        "Centre of Mould to Centre of Rail Seat", "Centre of Rail Seat to Mould End",
        "Centre of Mould to Side", "End of Mould", "End Height", "Centre Height",
        "Rail Seat Height", "Slope Gauge", "End Plate Height"
    ];

    const renderSummary = () => {
        const benchPct = ((stats.benchesCheckedMonth / stats.benchesUsed30d) * 100).toFixed(1);
        const mouldPct = ((stats.mouldsCheckedMonth / stats.mouldsUsed30d) * 100).toFixed(1);

        return (
            <div className="summary-section fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    <SummaryCard label="No. of Benches in plant" value={stats.benchesInPlant} icon="🏗️" />
                    <SummaryCard label="No. of Moulds in plant" value={stats.mouldsInPlant} icon="📦" />
                    <SummaryCard label="No. of Benches used for casting (30d)" value={stats.benchesUsed30d} icon="📅" />
                    <SummaryCard label="No. of Moulds used for casting (30d)" value={stats.mouldsUsed30d} icon="📅" />
                    <SummaryCard label="No. of Benches checked (Month)" value={stats.benchesCheckedMonth} color="#42818c" />
                    <SummaryCard label="No. of Moulds checked (Month)" value={stats.mouldsCheckedMonth} color="#42818c" />
                    <SummaryCard label="Percentage of bench checked" value={`${benchPct}%`} subValue="of benches used for casting" color="#0ea5e9" />
                    <SummaryCard label="Percentage of Moulds checked" value={`${mouldPct}%`} subValue="of moulds used for casting" color="#0ea5e9" />
                    <SummaryCard label="No. of Moulds currently not fit" value={stats.mouldsNotFit} color="#ef4444" icon="⚠️" />
                </div>
            </div>
        );
    };

    const renderAssetStatus = () => {
        const calculateStatus = (asset) => {
            const today = new Date();
            const lastC = new Date(asset.lastCasting);
            const lastCh = new Date(asset.lastChecking);
            const diffC = Math.floor((today - lastC) / (1000 * 60 * 60 * 24));
            const diffCh = Math.floor((today - lastCh) / (1000 * 60 * 60 * 24));

            if (diffC > 30) return { text: 'Not in Use', class: 'manual' };
            if (diffC < 30 && diffCh > 30) return { text: 'Checking Pending', class: 'not-witnessed' };
            if (diffC < 30 && diffCh <= 30) return { text: 'Checking Done', class: 'witnessed' };
            return { text: 'Checking Done', class: 'witnessed' };
        };

        return (
            <div className="table-outer-wrapper fade-in" style={{ marginTop: '1rem' }}>
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Bench / Mould No.</th>
                            <th>Last Casting</th>
                            <th>Last Checking</th>
                            <th>Days Since Casting</th>
                            <th>Days Since Checking</th>
                            <th>Status</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((a, idx) => {
                            const status = calculateStatus(a);
                            const today = new Date();
                            const dc = Math.floor((today - new Date(a.lastCasting)) / (1000 * 60 * 60 * 24));
                            const dch = Math.floor((today - new Date(a.lastChecking)) / (1000 * 60 * 60 * 24));
                            return (
                                <tr key={idx}>
                                    <td data-label="Bench/Mould No."><strong>{a.no}</strong></td>
                                    <td data-label="Last Casting">{a.lastCasting}</td>
                                    <td data-label="Last Checking">{a.lastChecking}</td>
                                    <td data-label="Days Since Casting">{dc}</td>
                                    <td data-label="Days Since Checking">{dch}</td>
                                    <td data-label="Status"><span className={`status-pill ${status.class}`}>{status.text}</span></td>
                                    <td data-label="Result"><span style={{ color: a.result === 'OK' ? '#10b981' : '#ef4444', fontWeight: '700' }}>{a.result}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderHistory = () => (
        <div className="table-outer-wrapper fade-in">
            <table className="ui-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Bench / Mould No.</th>
                        <th>Bench Check</th>
                        <th>Mould Check</th>
                        <th>Overall Result</th>
                    </tr>
                </thead>
                <tbody>
                    {checks.map(c => (
                        <tr key={c.id}>
                            <td data-label="Date & Time">{c.dateTime}</td>
                            <td data-label="Bench/Mould No."><strong>{c.no}</strong></td>
                            <td data-label="Bench Check">{c.benchCheck}</td>
                            <td data-label="Mould Check">{c.mouldCheck}</td>
                            <td data-label="Overall"><span className={`status-pill ${c.overall === 'OK' ? 'witnessed' : 'manual'}`}>{c.overall}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderForm = () => (
        <div className="fade-in" style={{ padding: '0.5rem' }}>
            <div className="form-grid" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="form-field">
                    <label>Time of checking (Default Current)</label>
                    <input type="time" value={formState.time} onChange={e => handleFormChange({ time: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Bench Number to be checked</label>
                    <select value={formState.benchNo} onChange={e => handleFormChange({ benchNo: e.target.value })}>
                        <option value="">Select Bench / Mould...</option>
                        {assets.map(a => <option key={a.no} value={a.no}>{a.no}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Bench Checking Section */}
                <div className="section-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '2px solid #42818c', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#42818c' }}>Bench Checking</h3>

                    <div className="form-field">
                        <label>Visual Checking Result</label>
                        <select value={formState.benchVisual} onChange={e => handleFormChange({ benchVisual: e.target.value })}>
                            <option value="ok">OK</option>
                            <option value="not_ok">Not OK</option>
                        </select>
                    </div>

                    {formState.benchVisual === 'not_ok' && (
                        <div className="form-field fade-in">
                            <label>Reason for Visual discrepancy</label>
                            <select value={formState.benchVisualReason} onChange={e => handleFormChange({ benchVisualReason: e.target.value })}>
                                <option value="">Select Reason...</option>
                                <option value="Visual Inspection Welding condition">Visual Inspection Welding condition</option>
                                <option value="Visual Inspection Fresh material usage condition">Visual Inspection Fresh material usage condition</option>
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
                        <div className="fade-in" style={{ marginTop: '10px', height: '300px', overflowY: 'auto', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <label className="mini-label" style={{ marginBottom: '8px', display: 'block' }}>Reason for Dimensional discrepancy:</label>
                            {benchDimFields.map(field => (
                                <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <input
                                        type="checkbox"
                                        id={`b-${field}`}
                                        checked={!!formState.benchDimReasons[field]}
                                        onChange={(e) => {
                                            const newReasons = { ...formState.benchDimReasons };
                                            if (e.target.checked) newReasons[field] = true;
                                            else delete newReasons[field];
                                            handleFormChange({ benchDimReasons: newReasons });
                                        }}
                                    />
                                    <label htmlFor={`b-${field}`} style={{ fontSize: '12px', cursor: 'pointer' }}>{field}</label>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-field" style={{ marginTop: '1rem' }}>
                        <label>Remarks (Bench)</label>
                        <textarea
                            rows="2"
                            placeholder="Additional notes for bench..."
                            value={formState.benchRemarks}
                            onChange={e => handleFormChange({ benchRemarks: e.target.value })}
                        />
                    </div>
                </div>

                {/* Mould Checking Section */}
                <div className="section-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '2px solid #42818c', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#42818c' }}>Mould Checking</h3>

                    <div className="form-field">
                        <label>Visual Checking Result</label>
                        <select value={formState.mouldVisual} onChange={e => handleFormChange({ mouldVisual: e.target.value })}>
                            <option value="ok">OK</option>
                            <option value="not_ok">Not OK</option>
                        </select>
                    </div>

                    {formState.mouldVisual === 'not_ok' && (
                        <div className="form-field fade-in">
                            <label>Reason for Visual discrepancy</label>
                            <select value={formState.mouldVisualReason} onChange={e => handleFormChange({ mouldVisualReason: e.target.value })}>
                                <option value="">Select Reason...</option>
                                <option value="Cracks in mould plates or channels">Cracks in mould plates or channels</option>
                                <option value="Hairline cracks near welded joints">Hairline cracks near welded joints</option>
                                <option value="Warping or bending of side plates">Warping or bending of side plates</option>
                                <option value="Buckling of base plate">Buckling of base plate</option>
                                <option value="Dent marks due to mishandling or impact">Dent marks due to mishandling or impact</option>
                                <option value="Uneven or distorted mould profile">Uneven or distorted mould profile</option>
                            </select>
                        </div>
                    )}

                    <div className="form-field" style={{ marginTop: '1rem' }}>
                        <label>Dimension Checking Result</label>
                        <select value={formState.mouldDim} onChange={e => handleFormChange({ mouldDim: e.target.value })}>
                            <option value="ok">OK</option>
                            <option value="not_ok">Not OK</option>
                        </select>
                    </div>

                    {formState.mouldDim === 'not_ok' && (
                        <div className="fade-in" style={{ marginTop: '10px', height: '300px', overflowY: 'auto', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <label className="mini-label" style={{ marginBottom: '8px', display: 'block' }}>Reason for Dimensional discrepancy:</label>
                            {mouldDimFields.map(field => (
                                <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <input
                                        type="checkbox"
                                        id={`m-${field}`}
                                        checked={!!formState.mouldDimReasons[field]}
                                        onChange={(e) => {
                                            const newReasons = { ...formState.mouldDimReasons };
                                            if (e.target.checked) newReasons[field] = true;
                                            else delete newReasons[field];
                                            handleFormChange({ mouldDimReasons: newReasons });
                                        }}
                                    />
                                    <label htmlFor={`m-${field}`} style={{ fontSize: '12px', cursor: 'pointer' }}>{field}</label>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-field" style={{ marginTop: '1rem' }}>
                        <label>Remarks (Mould)</label>
                        <textarea
                            rows="2"
                            placeholder="Additional notes for mould..."
                            value={formState.mouldRemarks}
                            onChange={e => handleFormChange({ mouldRemarks: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions-center" style={{ marginTop: '2rem' }}>
                <button className="toggle-btn" onClick={handleSave} style={{ minWidth: '240px', padding: '1rem' }}>Submit Inspection Report</button>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header" style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Mould & Bench Checking</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Sleeper Process Integrity Management</p>
                        </div>
                        <nav className="modal-tabs" style={{ border: 'none', margin: 0 }}>
                            <button className={`modal-tab-btn ${view === 'summary' ? 'active' : ''}`} onClick={() => setView('summary')}>Summary</button>
                            <button className={`modal-tab-btn ${view === 'form' ? 'active' : ''}`} onClick={() => setView('form')}>Add Entry</button>
                            <button className={`modal-tab-btn ${view === 'asset_status' ? 'active' : ''}`} onClick={() => setView('asset_status')}>Asset Status List</button>
                            <button className={`modal-tab-btn ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>Checking Done</button>
                        </nav>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {view === 'summary' && renderSummary()}
                    {view === 'asset_status' && renderAssetStatus()}
                    {view === 'history' && renderHistory()}
                    {view === 'form' && renderForm()}
                </div>
            </div>
        </div>
    );
};

export default MouldBenchCheck;


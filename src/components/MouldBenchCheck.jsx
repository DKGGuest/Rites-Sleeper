import React, { useState, useMemo } from 'react';

const MouldBenchCheck = ({ onBack }) => {
    const [view, setView] = useState('summary'); // 'summary', 'form', 'status', 'history'

    // Mock Data for Assets
    const [stats] = useState({
        benchesInPlant: 60,
        mouldsInPlant: 240,
        benchesUsed30d: 55,
        mouldsUsed30d: 215,
        benchesCheckedMonth: 42,
        mouldsCheckedMonth: 168,
        mouldsNotFit: 4
    });

    const [checks, setChecks] = useState([
        {
            id: 1,
            time: '2026-01-22 09:30',
            benchNo: '210-A to D',
            benchResult: 'OK',
            mouldResult: 'OK',
            overallResult: 'OK'
        },
        {
            id: 2,
            time: '2026-01-21 14:15',
            benchNo: '212-A to H',
            benchResult: 'Not OK',
            mouldResult: 'OK',
            overallResult: 'Not OK'
        }
    ]);

    const [formState, setFormState] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        benchVisual: 'ok',
        benchVisualReason: '',
        benchDim: 'ok',
        benchDimReasons: {}, // Object to store discrepancies
        mouldVisual: 'ok',
        mouldVisualReason: '',
        mouldDim: 'ok',
        mouldDimReasons: {},
        remarks: ''
    });

    const handleFormChange = (section, field, value) => {
        setFormState(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
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
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95vw' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2 style={{ margin: 0 }}>Mould & Bench Checking</h2>
                        <nav className="modal-tabs" style={{ margin: 0, padding: 0, border: 'none' }}>
                            <button className={`modal-tab-btn ${view === 'summary' ? 'active' : ''}`} onClick={() => setView('summary')}>Summary</button>
                            <button className={`modal-tab-btn ${view === 'form' ? 'active' : ''}`} onClick={() => setView('form')}>Add Entry</button>
                            <button className={`modal-tab-btn ${view === 'status' ? 'active' : ''}`} onClick={() => setView('status')}>Status Master</button>
                            <button className={`modal-tab-btn ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>Checking History</button>
                        </nav>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ minHeight: '600px' }}>
                    {view === 'summary' && renderSummary(stats)}
                    {view === 'form' && renderForm(formState, setFormState, handleSave)}
                    {view === 'status' && renderStatusMaster()}
                    {view === 'history' && renderHistory(checks)}
                </div>
            </div>
        </div>
    );
};

const renderSummary = (stats) => {
    const benchPct = ((stats.benchesCheckedMonth / stats.benchesUsed30d) * 100).toFixed(1);
    const mouldPct = ((stats.mouldsCheckedMonth / stats.mouldsUsed30d) * 100).toFixed(1);

    return (
        <div className="fade-in">
            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <SummaryCard label="Benches in Plant" value={stats.benchesInPlant} icon="🏗️" />
                <SummaryCard label="Moulds in Plant" value={stats.mouldsInPlant} icon="📦" />
                <SummaryCard label="Benches Used (30d)" value={stats.benchesUsed30d} icon="🔄" />
                <SummaryCard label="Moulds Used (30d)" value={stats.mouldsUsed30d} icon="🔄" />
                <SummaryCard label="Benches Checked (Month)" value={stats.benchesCheckedMonth} subValue={`${benchPct}% of used`} color="var(--primary-color)" />
                <SummaryCard label="Moulds Checked (Month)" value={stats.mouldsCheckedMonth} subValue={`${mouldPct}% of used`} color="var(--primary-color)" />
                <SummaryCard label="Unfit Moulds" value={stats.mouldsNotFit} color="var(--color-danger)" />
            </div>
        </div>
    );
};

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

const renderForm = (data, setData, onSave) => {
    const benchDimFields = [
        "Length", "Width inside bench", "Distance between fixed end of first channel",
        "Distance between 1st & 2nd channel", "Distance between 2nd & 3rd channel",
        "Distance between 3rd & 4th channel", "Distance between 4th & 5th channel",
        "Distance between 5th & 6th channel", "Distance between 6th & 7th channel",
        "Distance between 7th & 8th channel", "Distance between 8th & 9th channel",
        "Distance between lifting hooks", "Distance between lifting hook to fixed end",
        "Distance between lifting hook to free end", "Jack height (Left)", "Jack height (Right)",
        "Jack length (Left)", "Jack length (Right)", "End box stand length (Left)",
        "End box stand length (Right)", "Tie plate thickness on channel", "Tie thickness",
        "Distance between jack & end box stand", "Free end box hole position",
        "Fixed end box hole position", "Dab bolt and nut position", "Main channel",
        "Bottom channel", "Rail below lifting hook", "Height of rail below lifting hook"
    ];

    const mouldDimFields = [
        "Full Length", "Outer Length (insert to Insert)", "Between Rail Seat",
        "Centre of Mould to Centre of Rail Seat", "Centre of Rail Seat to Mould End",
        "Centre of Mould to Side", "End of Mould", "End Height", "Centre Height",
        "Rail Seat Height", "Slope Gauge", "End Plate Height"
    ];

    return (
        <div className="form-container" style={{ padding: '20px', maxWidth: '100%', background: 'transparent' }}>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '20px' }}>
                <div className="form-field">
                    <label>Time of Checking</label>
                    <input type="time" value={data.time} onChange={e => setData({ ...data, time: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Bench Number</label>
                    <input type="text" placeholder="e.g. 210 - A to D" value={data.benchNo} onChange={e => setData({ ...data, benchNo: e.target.value })} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Bench Checking Section */}
                <div className="collapsible-section" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div className="section-header" style={{ background: 'var(--neutral-50)' }}>Bench Checking</div>
                    <div className="section-content" style={{ padding: '15px' }}>
                        <div className="form-field">
                            <label>Visual Checking Result</label>
                            <select value={data.benchVisual} onChange={e => setData({ ...data, benchVisual: e.target.value })}>
                                <option value="ok">OK</option>
                                <option value="not_ok">Not OK</option>
                            </select>
                        </div>
                        {data.benchVisual === 'not_ok' && (
                            <div className="form-field">
                                <label>Visual Discrepancy Reason</label>
                                <select value={data.benchVisualReason} onChange={e => setData({ ...data, benchVisualReason: e.target.value })}>
                                    <option value="">Select Reason...</option>
                                    <option value="welding">Visual Inspection Welding condition</option>
                                    <option value="material">Visual Inspection Fresh material usage condition</option>
                                </select>
                            </div>
                        )}

                        <div className="form-field" style={{ marginTop: '15px' }}>
                            <label>Dimension Checking Result</label>
                            <select value={data.benchDim} onChange={e => setData({ ...data, benchDim: e.target.value })}>
                                <option value="ok">OK</option>
                                <option value="not_ok">Not OK</option>
                            </select>
                        </div>
                        {data.benchDim === 'not_ok' && (
                            <div style={{ marginTop: '10px', maxHeight: '300px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '4px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b' }}>Check fields showing discrepancies:</label>
                                {benchDimFields.map(field => (
                                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                                        <input type="checkbox" id={`b-${field}`} onChange={(e) => {
                                            const newReasons = { ...data.benchDimReasons };
                                            if (e.target.checked) newReasons[field] = true;
                                            else delete newReasons[field];
                                            setData({ ...data, benchDimReasons: newReasons });
                                        }} />
                                        <label htmlFor={`b-${field}`} style={{ fontWeight: 'normal', fontSize: '11px' }}>{field}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mould Checking Section */}
                <div className="collapsible-section" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div className="section-header" style={{ background: 'var(--neutral-50)' }}>Mould Checking</div>
                    <div className="section-content" style={{ padding: '15px' }}>
                        <div className="form-field">
                            <label>Visual Checking Result</label>
                            <select value={data.mouldVisual} onChange={e => setData({ ...data, mouldVisual: e.target.value })}>
                                <option value="ok">OK</option>
                                <option value="not_ok">Not OK</option>
                            </select>
                        </div>
                        {data.mouldVisual === 'not_ok' && (
                            <div className="form-field">
                                <label>Visual Discrepancy Reason</label>
                                <select value={data.mouldVisualReason} onChange={e => setData({ ...data, mouldVisualReason: e.target.value })}>
                                    <option value="">Select Reason...</option>
                                    <option value="cracks">Cracks in mould plates or channels</option>
                                    <option value="hairline">Hairline cracks near welded joints</option>
                                    <option value="warping">Warping or bending of side plates</option>
                                    <option value="buckling">Buckling of base plate</option>
                                    <option value="dent">Dent marks due to mishandling</option>
                                    <option value="distorted">Uneven or distorted mould profile</option>
                                </select>
                            </div>
                        )}

                        <div className="form-field" style={{ marginTop: '15px' }}>
                            <label>Dimension Checking Result</label>
                            <select value={data.mouldDim} onChange={e => setData({ ...data, mouldDim: e.target.value })}>
                                <option value="ok">OK</option>
                                <option value="not_ok">Not OK</option>
                            </select>
                        </div>
                        {data.mouldDim === 'not_ok' && (
                            <div style={{ marginTop: '10px', maxHeight: '300px', overflowY: 'auto', padding: '10px', background: '#f8fafc', borderRadius: '4px' }}>
                                <label style={{ fontSize: '11px', color: '#64748b' }}>Check fields showing discrepancies:</label>
                                {mouldDimFields.map(field => (
                                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                                        <input type="checkbox" id={`m-${field}`} onChange={(e) => {
                                            const newReasons = { ...data.mouldDimReasons };
                                            if (e.target.checked) newReasons[field] = true;
                                            else delete newReasons[field];
                                            setData({ ...data, mouldDimReasons: newReasons });
                                        }} />
                                        <label htmlFor={`m-${field}`} style={{ fontWeight: 'normal', fontSize: '11px' }}>{field}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="form-field" style={{ marginTop: '20px' }}>
                <label>Remarks</label>
                <textarea rows="2" placeholder="Any additional observations..." value={data.remarks} onChange={e => setData({ ...data, remarks: e.target.value })}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px', gap: '15px' }}>
                <button className="toggle-btn" onClick={onSave} style={{ padding: '10px 30px' }}>Submit Checking Report</button>
            </div>
        </div>
    );
};

const renderStatusMaster = () => {
    // Logic for Status:
    // Not in Use: days since last casting > 30
    // Pending: days since casting < 30 and days since last check > 30
    // Done: days since casting < 30 and days since last check < 30
    const mockBenches = [
        { id: '210-A to D', lastCasting: '2026-01-20', lastCheck: '2026-01-05', result: 'OK' },
        { id: '212-A to H', lastCasting: '2025-12-15', lastCheck: '2025-12-10', result: 'Not OK' },
        { id: '215-A to D', lastCasting: '2026-01-18', lastCheck: '2025-12-05', result: 'OK' },
        { id: '218-A to H', lastCasting: '2026-01-21', lastCheck: '2026-01-22', result: 'OK' },
    ];

    const getStatus = (lastCasting, lastCheck) => {
        const today = new Date('2026-01-22');
        const castDate = new Date(lastCasting);
        const checkDate = new Date(lastCheck);
        const diffCast = (today - castDate) / (1000 * 3600 * 24);
        const diffCheck = (today - checkDate) / (1000 * 3600 * 24);

        if (diffCast > 30) return { label: 'Not in Use', class: 'status-pill', color: '#64748b' };
        if (diffCheck > 30) return { label: 'Checking Pending', class: 'status-pill manual', color: 'var(--color-danger)' };
        return { label: 'Checking Done', class: 'status-pill witnessed', color: 'var(--color-success)' };
    };

    return (
        <div className="data-table-section" style={{ margin: 0 }}>
            <div className="table-scroll-container" style={{ maxHeight: '500px' }}>
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Bench / Mould No.</th>
                            <th>Last Casting</th>
                            <th>Last Checking</th>
                            <th>Last Result</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockBenches.map(bench => {
                            const status = getStatus(bench.lastCasting, bench.lastCheck);
                            return (
                                <tr key={bench.id}>
                                    <td style={{ fontWeight: '600' }}>{bench.id}</td>
                                    <td>{bench.lastCasting}</td>
                                    <td>{bench.lastCheck}</td>
                                    <td>
                                        <span style={{ color: bench.result === 'OK' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'bold' }}>
                                            {bench.result}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={status.class} style={{ background: status.color, color: '#fff', fontSize: '10px' }}>
                                            {status.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const renderHistory = (checks) => (
    <div className="data-table-section" style={{ margin: 0 }}>
        <div className="table-scroll-container">
            <table className="ui-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Bench / Mould</th>
                        <th>Bench Result</th>
                        <th>Mould Result</th>
                        <th>Overall Result</th>
                    </tr>
                </thead>
                <tbody>
                    {checks.map(check => (
                        <tr key={check.id}>
                            <td>{check.time}</td>
                            <td>{check.benchNo}</td>
                            <td>{check.benchResult}</td>
                            <td>{check.mouldResult}</td>
                            <td>
                                <span className={`status-pill ${check.overallResult === 'OK' ? 'witnessed' : 'manual'}`}>
                                    {check.overallResult}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default MouldBenchCheck;

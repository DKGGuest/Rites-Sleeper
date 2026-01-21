import React, { useState, useMemo } from 'react';

const MouldBenchCheck = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('entry'); // 'entry', 'reference'
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

    // Mock Data
    const [totalBenches] = useState(60);
    const [totalMoulds] = useState(240); // 4 per bench
    const [benchesUsed30d] = useState(55);
    const [mouldsUsed30d] = useState(220);

    const [checks, setChecks] = useState([
        { id: 1, time: '08:30', benchNo: '12', result: 'OK', reason: '-' },
        { id: 2, time: '09:15', benchNo: '15', result: 'Not OK', reason: 'Alignment issue on Mould 3' },
    ]);

    // Derived Stats
    const benchesCheckedMonth = 12 + checks.length; // Mock starting count
    const mouldsCheckedMonth = benchesCheckedMonth * 4; // Approx

    const pctBenches = ((benchesCheckedMonth / benchesUsed30d) * 100).toFixed(1);
    const pctMoulds = ((mouldsCheckedMonth / mouldsUsed30d) * 100).toFixed(1);

    // Form Stats
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        result: 'OK',
        reason: ''
    });

    const handleSubmit = () => {
        const newCheck = {
            id: Date.now(),
            ...formData,
            reason: formData.result === 'OK' ? '-' : formData.reason
        };
        setChecks([newCheck, ...checks]);
        setFormData({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            benchNo: '',
            result: 'OK',
            reason: ''
        });
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
                <header className="modal-header">
                    <h2>Mould & Bench Checking</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {/* Summary Section */}
                    <div className="collapsible-section">
                        <div className="section-header" style={{ cursor: 'default' }}>Summary of Checking</div>
                        <div className="section-content">
                            <div className="summary-grid">
                                <div className="summary-card">
                                    <span className="summary-label">Plant Assets (Total)</span>
                                    <div className="summary-val-group">
                                        <div className="summary-val-row">
                                            <span>Benches</span>
                                            <strong>{totalBenches}</strong>
                                        </div>
                                        <div className="summary-val-row">
                                            <span>Moulds</span>
                                            <strong>{totalMoulds}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Used (Last 30 Days)</span>
                                    <div className="summary-val-group">
                                        <div className="summary-val-row">
                                            <span>Benches</span>
                                            <strong>{benchesUsed30d}</strong>
                                        </div>
                                        <div className="summary-val-row">
                                            <span>Moulds</span>
                                            <strong>{mouldsUsed30d}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Benches Checked (Month)</span>
                                    <div className="summary-val-group">
                                        <div className="summary-val-row">
                                            <span>Count</span>
                                            <strong style={{ color: 'var(--primary-color)' }}>{benchesCheckedMonth}</strong>
                                        </div>
                                        <div className="summary-val-row">
                                            <span>Percentage</span>
                                            <strong style={{ color: 'var(--primary-color)' }}>{pctBenches}%</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Moulds Checked (Month)</span>
                                    <div className="summary-val-group">
                                        <div className="summary-val-row">
                                            <span>Count</span>
                                            <strong style={{ color: 'var(--primary-color)' }}>{mouldsCheckedMonth}</strong>
                                        </div>
                                        <div className="summary-val-row">
                                            <span>Percentage</span>
                                            <strong style={{ color: 'var(--primary-color)' }}>{pctMoulds}%</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="modal-tabs" style={{ justifyContent: 'flex-start' }}>
                        <button
                            className={`modal-tab-btn ${activeTab === 'entry' ? 'active' : ''}`}
                            onClick={() => setActiveTab('entry')}
                        >
                            Entry & History
                        </button>
                        <button
                            className={`modal-tab-btn ${activeTab === 'reference' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reference')}
                        >
                            All Benches List
                        </button>
                    </nav>

                    {activeTab === 'entry' && (
                        <div className="two-col-layout">
                            {/* Form */}
                            <div className="form-container" style={{ height: 'fit-content' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--neutral-600)' }}>New Check Entry</h4>
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="form-field">
                                        <label>Time of Checking</label>
                                        <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                        <label>Bench Number <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            placeholder="Enter Bench No."
                                            value={formData.benchNo}
                                            onChange={e => setFormData({ ...formData, benchNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Checking Result</label>
                                        <select
                                            value={formData.result}
                                            onChange={e => setFormData({ ...formData, result: e.target.value })}
                                            style={{
                                                borderColor: formData.result === 'OK' ? 'var(--color-success)' : 'var(--color-danger)',
                                                color: formData.result === 'OK' ? 'var(--color-success)' : 'var(--color-danger)',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <option value="OK">OK</option>
                                            <option value="Not OK">Not OK</option>
                                        </select>
                                    </div>
                                    {formData.result === 'Not OK' && (
                                        <div className="form-field">
                                            <label>Reason for Discrepancy <span className="required">*</span></label>
                                            <textarea
                                                rows="3"
                                                placeholder="Describe the issue..."
                                                value={formData.reason}
                                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                                <button className="toggle-btn" style={{ width: '100%' }} onClick={handleSubmit}>Save Check Record</button>
                            </div>

                            {/* List */}
                            <div className="data-table-section" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--border-color)' }}>
                                <div className="table-title-bar">List of Checking Done</div>
                                <div className="table-scroll-container" style={{ maxHeight: '400px' }}>
                                    <table className="ui-table">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Bench</th>
                                                <th>Result</th>
                                                <th>Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {checks.length === 0 ? (
                                                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No checks recorded yet</td></tr>
                                            ) : (
                                                checks.map(check => (
                                                    <tr key={check.id}>
                                                        <td>{check.time}</td>
                                                        <td>Bench {check.benchNo}</td>
                                                        <td>
                                                            <span className={`status-pill ${check.result === 'OK' ? 'witnessed' : 'manual'}`}
                                                                style={{
                                                                    background: check.result === 'OK' ? '#dcfce7' : '#fee2e2',
                                                                    color: check.result === 'OK' ? '#15803d' : '#991b1b'
                                                                }}>
                                                                {check.result}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{check.reason}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reference' && (
                        <div className="data-table-section">
                            <div className="table-title-bar">List of All Benches & Moulds</div>
                            <div className="table-scroll-container">
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Bench No.</th>
                                            <th>Mould Capacity</th>
                                            <th>Last Casting Date</th>
                                            <th>Last Checked</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(10)].map((_, i) => (
                                            <tr key={i}>
                                                <td>Bench {i + 1}</td>
                                                <td>4 Moulds</td>
                                                <td>2026-01-{19 - i}</td>
                                                <td>{i % 3 === 0 ? 'Today' : '3 days ago'}</td>
                                                <td><span className="status-pill witnessed">Active</span></td>
                                            </tr>
                                        ))}
                                        {/* Mocking limit */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MouldBenchCheck;

import React, { useState, useMemo } from 'react';

/**
 * SteamCubeStats Component
 * Externalized statistics calculation for cube testing.
 */
export const SteamCubeStats = ({ records }) => {
    const categories = ['M55', 'M60'];

    const getStats = (grade) => {
        const filtered = records.filter(r => r.grade === grade);
        if (!filtered.length) return null;
        const strengths = filtered.map(r => r.strength);
        return {
            avg: strengths.reduce((a, b) => a + b, 0) / strengths.length,
            min: Math.min(...strengths),
            max: Math.max(...strengths),
            count: strengths.length
        };
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {categories.map(grade => {
                const stats = getStats(grade);
                if (!stats) return null;
                return (
                    <div key={grade} className="calc-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <span className="mini-label">GRADE {grade} (Avg)</span>
                        <div className="calc-value">{stats.avg.toFixed(2)} N/mm²</div>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>n={stats.count} | Min: {stats.min} | Max: {stats.max}</span>
                    </div>
                );
            })}
        </div>
    );
};

const SteamCubeTesting = ({ onBack }) => {
    const [view, setView] = useState('declared');
    const [showEntry, setShowEntry] = useState(null); // Sample being tested or Record being edited
    const [strengthInputValue, setStrengthInputValue] = useState('');

    const [samples, setSamples] = useState([
        { id: 1, batchNo: 610, chamberNo: 1, benchNo: 401, sequence: 'A', cubeNo: '401A', grade: 'M55', castDate: '2026-01-21', lbcTime: '10:30', benchesInChamber: '401, 402' }
    ]);
    const [tested, setTested] = useState([
        { id: 101, batchNo: 609, chamberNo: 5, cubeNo: '501C', grade: 'M55', strength: 42.5, testDate: '2026-01-22', timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString() }
    ]);

    const handleEnterResult = (sample) => {
        setShowEntry(sample);
        setStrengthInputValue(sample.strength || '');
    };

    const handleSaveResult = () => {
        if (!strengthInputValue || isNaN(strengthInputValue)) {
            alert('Please enter a valid strength value');
            return;
        }

        const strength = parseFloat(strengthInputValue);

        if (showEntry.strength !== undefined) {
            // Editing existing tested record
            setTested(prev => prev.map(t => t.id === showEntry.id ? { ...t, strength, testDate: new Date().toISOString().split('T')[0] } : t));
            alert('Test result updated');
        } else {
            // Processing new sample
            const newRecord = {
                ...showEntry,
                id: Date.now(),
                strength,
                testDate: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };
            setTested(prev => [newRecord, ...prev]);
            setSamples(prev => prev.filter(s => s.id !== showEntry.id));
            alert('Test result recorded');
        }

        setShowEntry(null);
        setStrengthInputValue('');
    };

    const isRecordEditable = (timestamp) => {
        if (!timestamp) return false;
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (60 * 60 * 1000); // 1 hour window
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1100px' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>Steam Cube Lab Results</h2>
                        <nav className="modal-tabs" style={{ border: 'none', margin: 0 }}>
                            <button className={`modal-tab-btn ${view === 'declared' ? 'active' : ''}`} onClick={() => setView('declared')}>Awaiting Test</button>
                            <button className={`modal-tab-btn ${view === 'tested' ? 'active' : ''}`} onClick={() => setView('tested')}>Completed Tests</button>
                        </nav>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body">
                    {showEntry && (
                        <div className="calc-card" style={{ marginBottom: '2rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Enter Strength Result for Cube: {showEntry.cubeNo}</h4>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Strength (N/mm²)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={strengthInputValue}
                                        onChange={e => setStrengthInputValue(e.target.value)}
                                        placeholder="e.g. 42.5"
                                        autoFocus
                                    />
                                </div>
                                <button className="toggle-btn" onClick={handleSaveResult}>Save Result</button>
                                <button className="toggle-btn" style={{ background: '#94a3b8' }} onClick={() => setShowEntry(null)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <SteamCubeStats records={tested} />

                    {view === 'declared' ? (
                        <div className="table-outer-wrapper fade-in">
                            <table className="ui-table">
                                <thead>
                                    <tr><th>Batch</th><th>Chamber</th><th>Cube No.</th><th>Grade</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {samples.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>No samples awaiting test.</td></tr>
                                    ) : (
                                        samples.map(s => (
                                            <tr key={s.id}>
                                                <td data-label="Batch">{s.batchNo}</td>
                                                <td data-label="Chamber">{s.chamberNo}</td>
                                                <td data-label="Cube No.">{s.cubeNo}</td>
                                                <td data-label="Grade">{s.grade}</td>
                                                <td data-label="Action">
                                                    <button className="btn-action" onClick={() => handleEnterResult(s)}>Enter Results</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-outer-wrapper fade-in">
                            <table className="ui-table">
                                <thead>
                                    <tr><th>Batch</th><th>Cube No.</th><th>Grade</th><th>Strength</th><th>Result</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {tested.map(t => (
                                        <tr key={t.id}>
                                            <td data-label="Batch"><span>{t.batchNo}</span></td>
                                            <td data-label="Cube No."><span>{t.cubeNo}</span></td>
                                            <td data-label="Grade"><span>{t.grade}</span></td>
                                            <td data-label="Strength" style={{ fontWeight: '700', color: t.strength >= 40 ? '#059669' : '#dc2626' }}><span>{t.strength} N/mm²</span></td>
                                            <td data-label="Result"><span><span className={`status-pill ${t.strength >= 40 ? 'witnessed' : 'manual'}`}>{t.strength >= 40 ? 'PASS' : 'FAIL'}</span></span></td>
                                            <td data-label="Action">
                                                {isRecordEditable(t.timestamp) ? (
                                                    <button className="btn-action" onClick={() => handleEnterResult(t)}>Edit</button>
                                                ) : (
                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Verified</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SteamCubeTesting;

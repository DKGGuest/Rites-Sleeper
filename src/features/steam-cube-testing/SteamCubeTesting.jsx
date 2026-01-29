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
    const [samples, setSamples] = useState([
        { id: 1, batchNo: 610, chamberNo: 1, benchNo: 401, sequence: 'A', cubeNo: '401A', grade: 'M55', castDate: '2026-01-21', lbcTime: '10:30', benchesInChamber: '401, 402' }
    ]);
    const [tested, setTested] = useState([
        { id: 101, batchNo: 609, chamberNo: 5, cubeNo: '501C', grade: 'M55', strength: 42.5, testDate: '2026-01-22' }
    ]);

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
                    <SteamCubeStats records={tested} />

                    {view === 'declared' ? (
                        <div className="table-outer-wrapper fade-in">
                            <table className="ui-table">
                                <thead>
                                    <tr><th>Batch</th><th>Chamber</th><th>Cube No.</th><th>Grade</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {samples.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.batchNo}</td><td>{s.chamberNo}</td><td>{s.cubeNo}</td><td>{s.grade}</td>
                                            <td><button className="btn-action">Enter Results</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-outer-wrapper fade-in">
                            <table className="ui-table">
                                <thead>
                                    <tr><th>Batch</th><th>Cube No.</th><th>Grade</th><th>Strength</th><th>Result</th></tr>
                                </thead>
                                <tbody>
                                    {tested.map(t => (
                                        <tr key={t.id}>
                                            <td>{t.batchNo}</td><td>{t.cubeNo}</td><td>{t.grade}</td>
                                            <td style={{ fontWeight: '700', color: t.strength >= 40 ? '#059669' : '#dc2626' }}>{t.strength}</td>
                                            <td><span className={`status-pill ${t.strength >= 40 ? 'witnessed' : 'manual'}`}>{t.strength >= 40 ? 'PASS' : 'FAIL'}</span></td>
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

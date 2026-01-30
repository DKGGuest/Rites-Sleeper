import React, { useMemo } from 'react';

/**
 * TensionHistogram Component
 * Visualizes the distribution of wire tension loads.
 */
export const TensionHistogram = ({ data, mean, stdDev }) => {
    const bins = 10;
    const safeStdDev = stdDev || 0.1; // Prevent division by zero
    const minVal = mean - 4 * safeStdDev;
    const maxVal = mean + 4 * safeStdDev;
    const binSize = (maxVal - minVal) / bins;

    const binCounts = new Array(bins).fill(0);
    data.forEach(val => {
        const binIndex = Math.min(bins - 1, Math.max(0, Math.floor((val - minVal) / binSize)));
        binCounts[binIndex]++;
    });

    const maxCount = Math.max(...binCounts, 1);
    const height = 120;
    const width = 300;

    const getX = (val) => {
        const totalRange = maxVal - minVal;
        if (totalRange === 0) return width / 2;
        return ((val - minVal) / totalRange) * width;
    };

    return (
        <div className="histogram-container" style={{ padding: '15px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '15px', textAlign: 'center', fontWeight: '600' }}>Final Load Distribution (Histogram)</h5>
            <svg width="100%" height={height + 25} viewBox={`0 0 ${width} ${height + 25}`} style={{ display: 'block', margin: '0 auto' }}>
                {/* Bands */}
                <rect x={getX(mean - 3 * safeStdDev)} y="0" width={Math.max(1, getX(mean + 3 * safeStdDev) - getX(mean - 3 * safeStdDev))} height={height} fill="#fee2e2" fillOpacity="0.2" />
                <rect x={getX(mean - 2 * safeStdDev)} y="0" width={Math.max(1, getX(mean + 2 * safeStdDev) - getX(mean - 2 * safeStdDev))} height={height} fill="#fef3c7" fillOpacity="0.2" />
                <rect x={getX(mean - 1 * safeStdDev)} y="0" width={Math.max(1, getX(mean + 1 * safeStdDev) - getX(mean - 1 * safeStdDev))} height={height} fill="#dcfce7" fillOpacity="0.2" />

                <line x1={getX(mean)} y1="0" x2={getX(mean)} y2={height} stroke="#334155" strokeWidth="1.5" strokeDasharray="4" />

                {binCounts.map((count, i) => {
                    const barHeight = (count / maxCount) * (height - 20);
                    const x = (i * width) / bins;
                    return (
                        <rect key={i} x={x + 2} y={height - barHeight} width={Math.max(1, width / bins - 4)} height={barHeight} fill="#42818c" rx="1" />
                    );
                })}

                <text x={getX(mean)} y={height + 15} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="700">μ ({mean.toFixed(1)})</text>
            </svg>
        </div>
    );
};

const WireTensionStats = ({ stats, theoreticalMean = 730 }) => {
    if (!stats) return <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Awaiting data for analysis...</div>;

    const zones = [
        { label: 'Normal Zone (±1σ)', value: stats.normalZone, color: '#22c55e', bg: '#f0fdf4' },
        { label: 'Warning Zone (±2σ)', value: stats.warningZone, color: '#eab308', bg: '#fffbeb' },
        { label: 'Action Zone (±3σ)', value: stats.actionZone, color: '#f97316', bg: '#fff7ed' },
        { label: 'Out of Control (>±3σ)', value: stats.outOfControl, color: '#ef4444', bg: '#fef2f2' },
    ];

    return (
        <div className="calculation-summary">
            <div className="dash-section-header" style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '700' }}>Theoretical Pre-Stress Summary</h4>
            </div>
            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="calc-card"><span className="calc-label">Min Theoretical</span><div className="calc-value">{(theoreticalMean - 5).toFixed(1)} KN</div></div>
                <div className="calc-card"><span className="calc-label">Max Theoretical</span><div className="calc-value">{(theoreticalMean + 5).toFixed(1)} KN</div></div>
                <div className="calc-card"><span className="calc-label">Mean Theoretical</span><div className="calc-value">{theoreticalMean.toFixed(1)} KN</div></div>
                <div className="calc-card"><span className="calc-label">Load Deviation</span><div className="calc-value" style={{ color: Math.abs(stats.deviationFromTheo) > 2 ? '#ef4444' : '#22c55e' }}>{stats.deviationFromTheo.toFixed(2)}%</div></div>
            </div>

            <div className="dash-section-header" style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '700' }}>Process Control Analysis (Shift Data)</h4>
            </div>
            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="calc-card"><span className="calc-label">Avg Final Load</span><div className="calc-value">{stats.mean.toFixed(1)} KN</div></div>
                <div className="calc-card"><span className="calc-label">Std Dev (σ)</span><div className="calc-value">{stats.stdDev.toFixed(2)}</div></div>
                <div className="calc-card"><span className="calc-label">CV (%)</span><div className="calc-value">{stats.cv.toFixed(2)}%</div></div>
                <div className="calc-card"><span className="calc-label">Sample Count</span><div className="calc-value">{stats.count}</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <TensionHistogram data={stats.values} mean={stats.mean} stdDev={stats.stdDev} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase' }}>Sigma Distribution</h5>
                    {zones.map(zone => (
                        <div key={zone.label} style={{ background: zone.bg, padding: '12px', borderRadius: '8px', border: `1px solid ${zone.color}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>{zone.label}</span>
                            <span style={{ fontSize: '14px', color: zone.color, fontWeight: '800' }}>{zone.value.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WireTensionStats;

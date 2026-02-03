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
    if (!stats) return <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>Awaiting SCADA data for batch analysis...</div>;

    const zones = [
        { label: 'Normal (±1σ)', value: stats.normalZone, color: '#22c55e', bg: '#f0fdf4' },
        { label: 'Warning (±2σ)', value: stats.warningZone, color: '#eab308', bg: '#fffbeb' },
        { label: 'Action (±3σ)', value: stats.actionZone, color: '#f97316', bg: '#fff7ed' },
        { label: 'Outlier (>±3σ)', value: stats.outOfControl, color: '#ef4444', bg: '#fef2f2' },
    ];

    return (
        <div className="calculation-summary fade-in">
            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.8125rem', color: '#444', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>Theoretical Benchmarking</h4>
                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Target Mean</span><div className="calc-value" style={{ fontSize: '1.15rem' }}>{theoreticalMean.toFixed(1)} KN</div></div>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Load Deviation</span><div className="calc-value" style={{ fontSize: '1.15rem', color: Math.abs(stats.deviationFromTheo) > 2 ? '#ef4444' : '#10b981' }}>{stats.deviationFromTheo.toFixed(2)}%</div></div>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Theoretical Range</span><div className="calc-value" style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#64748b' }}>{(theoreticalMean - 5).toFixed(1)} - {(theoreticalMean + 5).toFixed(1)}</div></div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.8125rem', color: '#444', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>Process Control (Live Analysis)</h4>
                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Actual Mean</span><div className="calc-value" style={{ fontSize: '1.15rem' }}>{stats.mean.toFixed(1)} KN</div></div>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Std Dev (σ)</span><div className="calc-value" style={{ fontSize: '1.15rem' }}>{stats.stdDev.toFixed(2)}</div></div>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Coeff Var (%)</span><div className="calc-value" style={{ fontSize: '1.15rem' }}>{stats.cv.toFixed(2)}%</div></div>
                    <div className="calc-card hover-lift" style={{ padding: '0.75rem' }}><span className="mini-label" style={{ fontSize: '0.6rem' }}>Sample Size</span><div className="calc-value" style={{ fontSize: '1.15rem' }}>{stats.count}</div></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <TensionHistogram data={stats.values} mean={stats.mean} stdDev={stats.stdDev} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h5 style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '800', textTransform: 'uppercase' }}>Sigma Distribution Profile</h5>
                    {zones.map(zone => (
                        <div key={zone.label} style={{ background: zone.bg, padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${zone.color}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease' }}>
                            <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: '700' }}>{zone.label}</span>
                            <span style={{ fontSize: '1rem', color: zone.color, fontWeight: '900' }}>{zone.value.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WireTensionStats;

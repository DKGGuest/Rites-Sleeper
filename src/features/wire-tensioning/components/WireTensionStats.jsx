import React, { useMemo } from 'react';

/**
 * TensionHistogram Component
 * Visualizes the distribution of wire tension loads.
 */
export const TensionHistogram = ({ data, mean, stdDev }) => {
    const bins = 10;
    const minVal = mean - 4 * stdDev;
    const maxVal = mean + 4 * stdDev;
    const binSize = (maxVal - minVal) / bins;

    const binCounts = new Array(bins).fill(0);
    data.forEach(val => {
        const binIndex = Math.min(bins - 1, Math.floor((val - minVal) / binSize));
        if (binIndex >= 0) binCounts[binIndex]++;
    });

    const maxCount = Math.max(...binCounts, 1);
    const height = 120;
    const width = 300;

    const getX = (val) => ((val - minVal) / (maxVal - minVal)) * width;

    return (
        <div className="histogram-container" style={{ padding: '15px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '15px', textAlign: 'center', fontWeight: '600' }}>Final Load Distribution (Histogram)</h5>
            <svg width="100%" height={height + 25} viewBox={`0 0 ${width} ${height + 25}`} style={{ display: 'block', margin: '0 auto' }}>
                {/* Bands */}
                <rect x={getX(mean - 3 * stdDev)} y="0" width={Math.max(0, getX(mean + 3 * stdDev) - getX(mean - 3 * stdDev))} height={height} fill="#fee2e2" fillOpacity="0.2" />
                <rect x={getX(mean - 2 * stdDev)} y="0" width={Math.max(0, getX(mean + 2 * stdDev) - getX(mean - 2 * stdDev))} height={height} fill="#fef3c7" fillOpacity="0.2" />
                <rect x={getX(mean - 1 * stdDev)} y="0" width={Math.max(0, getX(mean + 1 * stdDev) - getX(mean - 1 * stdDev))} height={height} fill="#dcfce7" fillOpacity="0.2" />

                <line x1={getX(mean)} y1="0" x2={getX(mean)} y2={height} stroke="#334155" strokeWidth="1.5" strokeDasharray="4" />

                {binCounts.map((count, i) => {
                    const barHeight = (count / maxCount) * (height - 20);
                    const x = (i * width) / bins;
                    return (
                        <rect key={i} x={x + 2} y={height - barHeight} width={width / bins - 4} height={barHeight} fill="#42818c" rx="1" />
                    );
                })}

                <text x={getX(mean)} y={height + 15} textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="700">μ ({mean.toFixed(1)})</text>
            </svg>
        </div>
    );
};

/**
 * WireTensionStats Component
 */
const WireTensionStats = ({ data, theoreticalMean = 730 }) => {
    const stats = useMemo(() => {
        if (!data.length) return null;
        const values = data.map(r => r.finalLoad);
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        return {
            min: Math.min(...values),
            max: Math.max(...values),
            mean,
            stdDev,
            cv: (stdDev / mean) * 100,
            deviationFromTheo: ((mean - theoreticalMean) / theoreticalMean) * 100,
            values
        };
    }, [data, theoreticalMean]);

    if (!stats) return <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Awaiting data for analysis...</div>;

    return (
        <div className="calculation-summary">
            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="calc-card"><span className="calc-label">Mean Load</span><div className="calc-value">{stats.mean.toFixed(1)} KN</div></div>
                <div className="calc-card"><span className="calc-label">Std Dev (σ)</span><div className="calc-value">{stats.stdDev.toFixed(2)}</div></div>
                <div className="calc-card"><span className="calc-label">CV (%)</span><div className="calc-value">{stats.cv.toFixed(2)}%</div></div>
                <div className="calc-card">
                    <span className="calc-label">Deviation</span>
                    <div className="calc-value" style={{ color: Math.abs(stats.deviationFromTheo) > 2 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {stats.deviationFromTheo.toFixed(2)}%
                    </div>
                </div>
            </div>
            <TensionHistogram data={stats.values} mean={stats.mean} stdDev={stats.stdDev} />
        </div>
    );
};

export default WireTensionStats;

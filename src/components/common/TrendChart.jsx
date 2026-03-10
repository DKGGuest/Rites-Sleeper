import React from 'react';

/**
 * TrendChart Component
 * A reusable SVG-based line chart for displaying trends.
 * Supports multiple lines, tooltips (simple), and automatic scaling.
 */
const TrendChart = ({
    data,
    xKey,
    lines, // Array of { key: string, color: string, label: string }
    height = 280,
    title = "Trend Analysis",
    description = "Time series tracking",
    yAxisLabel = "%"
}) => {
    // Robust Timestamp Parser
    const parseX = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        // Handle DD/MM/YYYY
        if (typeof val === 'string' && val.includes('/') && !val.includes('-')) {
            const parts = val.split(' ')[0].split('/');
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        }
        return new Date(val).getTime() || 0;
    };

    const sortedData = [...data].sort((a, b) => parseX(a[xKey]) - parseX(b[xKey])).slice(-10);

    if (sortedData.length < 2) {
        return (
            <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                Waiting for trend data (Min. 2 entries required)...
            </div>
        );
    }

    const allValues = sortedData.flatMap(d => lines.map(l => parseFloat(d[l.key]) || 0));
    const maxVal = Math.max(10.0, ...allValues) * 1.2;
    const minVal = Math.min(0, ...allValues);
    const range = maxVal - minVal;

    const step = 1000 / (sortedData.length - 1);

    // Smoothing logic components
    const smoothing = 0.15;
    const getPos = (pointA, pointB) => {
        const lengthX = pointB.x - pointA.x;
        const lengthY = pointB.y - pointA.y;
        return { length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)), angle: Math.atan2(lengthY, lengthX) };
    };
    const controlPoint = (current, previous, next, reverse) => {
        const p = previous || current; const n = next || current;
        const l = getPos(p, n);
        const angle = l.angle + (reverse ? Math.PI : 0);
        const length = l.length * smoothing;
        return [current.x + Math.cos(angle) * length, current.y + Math.sin(angle) * length];
    };
    const svgPath = (pts) => {
        if (pts.length < 2) return "";
        return pts.reduce((acc, pt, i, a) => {
            if (i === 0) return `M ${pt.x},${pt.y}`;
            const [cp1x, cp1y] = controlPoint(a[i - 1], a[i - 2], pt);
            const [cp2x, cp2y] = controlPoint(pt, a[i - 1], a[i + 1], true);
            return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
        }, "");
    };

    return (
        <div style={{
            height: height,
            padding: '20px',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>{description}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {lines.map(line => (
                        <div key={line.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', color: '#475569' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: line.color }}></div>
                            <span>{line.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', flex: 1, paddingLeft: '50px', paddingBottom: '30px', minHeight: 0 }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        {lines.map(line => (
                            <linearGradient key={`grad-${line.key}`} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={line.color} stopOpacity="0.15" />
                                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Y-Axis Grid */}
                    {[0, 25, 50, 75, 100].map(p => {
                        const y = 100 - p;
                        const val = (minVal + (p / 100) * range).toFixed(1);
                        return (
                            <g key={p}>
                                <line x1="0" y1={y} x2="1000" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                <text x="-12" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="700">{val}{yAxisLabel}</text>
                            </g>
                        );
                    })}

                    {lines.map(line => {
                        const points = sortedData.map((d, i) => {
                            const val = parseFloat(d[line.key]);
                            if (isNaN(val)) return null;
                            const yPos = 100 - ((val - minVal) / range) * 100;
                            return { x: i * step, y: yPos };
                        }).filter(p => p !== null);

                        if (points.length < 2) return null;
                        const d = svgPath(points);
                        const areaD = `${d} L ${points[points.length - 1].x},100 L ${points[0].x},100 Z`;

                        return (
                            <g key={line.key}>
                                <path d={areaD} fill={`url(#grad-${line.key})`} style={{ transition: 'all 0.4s' }} />
                                <path d={d} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                {points.map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke={line.color} strokeWidth="2" />
                                ))}
                            </g>
                        );
                    })}
                </svg>

                {/* X-Axis Labels */}
                <div style={{ position: 'absolute', bottom: 0, left: '50px', right: 0, display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f5f9', paddingTop: '8px' }}>
                    {sortedData.map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', width: `${100 / sortedData.length}%` }}>
                            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '800' }}>
                                {String(d[xKey]).includes('T') ? d[xKey].split('T')[0].split('-').reverse().slice(0, 2).join('/') : d[xKey]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendChart;

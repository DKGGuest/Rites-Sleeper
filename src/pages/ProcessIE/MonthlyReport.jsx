import React, { useState, useEffect } from 'react';
import './MonthlyReport.css';

const MonthlyReport = ({ onBack }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        // Simulate API fetch for the Monthly report
        setTimeout(() => {
            const mockData = {
                production: {
                    totalCastMtd: 24560,
                    totalNetGood: 24125,
                    rejectionRate: 1.77
                },
                qualityStats: {
                    demouldingRejections: 112,
                    finalInspectionRejections: 323,
                    rejectionByReason: [
                        { reason: 'Dimension OOR', qty: 154, color: '#f59e0b' },
                        { reason: 'Visual Cracks', qty: 98, color: '#ef4444' },
                        { reason: 'Edge Chipping', qty: 183, color: '#3b82f6' }
                    ]
                },
                mandays: {
                    totalMandays: 1240,
                    unitMandayCost: 312.55, // INR
                    trend: '+2.4%'
                },
                rawMaterialHealth: [
                    { name: 'Sulphate Resisting Cement', status: 'Healthy', stock: '240 MT', alert: false },
                    { name: 'HTS Wire (9.5mm)', status: 'Low Stock', stock: '12 MT', alert: true },
                    { name: 'Aggregate (20mm)', status: 'Re-Testing Pending', stock: '450 MT', alert: true },
                    { name: 'Admixture (Glenium)', status: 'Healthy', stock: '1.2 KL', alert: false }
                ]
            };
            setReportData(mockData);
            setLoading(false);
        }, 1000);
    }, [dateRange]);

    if (loading) {
        return (
            <div className="report-container fade-in">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Aggregating Monthly Performance Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="report-container fade-in">
            <header className="report-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={onBack} className="btn-back">← Back</button>
                    <h2>Monthly Performance Overview</h2>
                </div>

                <div className="filter-bar">
                    <div className="filter-input">
                        <label>Range Start</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="filter-input">
                        <label>Range End</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>
            </header>

            <div className="mtd-dashboard">
                {/* KPI TOP ROW */}
                <div className="kpi-row">
                    <div className="kpi-card">
                        <label>Sleepers Cast (MTD)</label>
                        <span className="value">{reportData.production.totalCastMtd.toLocaleString()}</span>
                        <div className="sub-stat">Target: 25,000</div>
                    </div>
                    <div className="kpi-card success">
                        <label>Net Good Sleepers</label>
                        <span className="value">{reportData.production.totalNetGood.toLocaleString()}</span>
                        <div className="sub-stat">Yield: 98.23%</div>
                    </div>
                    <div className="kpi-card danger">
                        <label>Overall Rejection Rate</label>
                        <span className="value">{reportData.production.rejectionRate}%</span>
                        <div className="sub-stat">Target &lt; 1.5%</div>
                    </div>
                    <div className="kpi-card dark">
                        <label>Unit Manday Cost</label>
                        <span className="value">₹{reportData.mandays.unitMandayCost}</span>
                        <div className="sub-stat trend-up">↑ {reportData.mandays.trend}</div>
                    </div>
                </div>

                <div className="report-main-grid">
                    {/* QUALITY BREAKDOWN */}
                    <section className="report-section quality-breakdown">
                        <div className="section-header">
                            <h3>Rejection Categorization</h3>
                        </div>
                        <div className="chart-placeholder">
                            <div className="donut-sim">
                                <div className="donut-center">
                                    <strong>{reportData.qualityStats.demouldingRejections + reportData.qualityStats.finalInspectionRejections}</strong>
                                    <span>Total Reg.</span>
                                </div>
                            </div>
                            <ul className="legend">
                                {reportData.qualityStats.rejectionByReason.map(item => (
                                    <li key={item.reason}>
                                        <span className="dot" style={{ backgroundColor: item.color }}></span>
                                        <span className="label">{item.reason}:</span>
                                        <strong>{item.qty}</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* RM HEALTH ALERTS */}
                    <section className="report-section rm-health">
                        <div className="section-header">
                            <h3>Raw Material Health & Inventory Alerts</h3>
                        </div>
                        <div className="rm-list">
                            {reportData.rawMaterialHealth.map(item => (
                                <div key={item.name} className={`rm-item ${item.alert ? 'alert' : ''}`}>
                                    <div className="rm-info">
                                        <h4>{item.name}</h4>
                                        <span className="rm-status">{item.status}</span>
                                    </div>
                                    <div className="rm-data">
                                        <span className="rm-stock">Stock: {item.stock}</span>
                                        {item.alert && <span className="alert-text">Alert</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;

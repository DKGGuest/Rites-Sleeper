import React, { useState, useEffect } from 'react';
import './LastShiftReport.css';

const LastShiftReport = ({ onBack }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch for the last shift report
        setTimeout(() => {
            const mockData = {
                shiftDetails: {
                    date: '2026-03-02',
                    shift: 'Shift A',
                    previousIE: 'Er. Naveen Kumar'
                },
                productionSummary: {
                    totalBatches: 42,
                    totalSleepers: 1008,
                    demouldingRejections: 12
                },
                processHighlights: [
                    { id: 1, type: 'Alert', message: 'Vibrator 4 underperforming (RPM < 2800 for 3 batches)', status: 'Warning' },
                    { id: 2, type: 'Info', message: 'Steam Curing Chamber 2 mapping initialized successfully.', status: 'OK' },
                    { id: 3, type: 'Critical', message: 'Moisture sensor in Bin 2 failed during last hour.', status: 'Error' }
                ],
                handoverNotes: "Plant is running at 90% capacity. Cement silos A & B are being refilled. Vibrator 4 needs technical inspection after current casting. Mix design adjusted for sudden temperature variation in aggregate yard."
            };
            setReportData(mockData);
            setLoading(false);
        }, 800);
    }, []);

    if (loading) {
        return (
            <div className="report-container fade-in">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching Last Shift Highlights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="report-container fade-in">
            <header className="report-header">
                <button onClick={onBack} className="btn-back">← Back</button>
                <h2>Last Shift Snapshot</h2>
            </header>

            <div className="report-layout">
                {/* LEFT COLUMN: Metadata & Production */}
                <div className="report-column">
                    <section className="report-section highlight-card">
                        <div className="section-header">
                            <span className="icon">🕒</span>
                            <h3>Shift Details</h3>
                        </div>
                        <div className="data-row">
                            <span>Immediate Previous Shift:</span>
                            <strong>{reportData.shiftDetails.shift} ({reportData.shiftDetails.date})</strong>
                        </div>
                        <div className="data-row">
                            <span>Inspecting Engineer:</span>
                            <strong>{reportData.shiftDetails.previousIE}</strong>
                        </div>
                    </section>

                    <section className="report-section highlight-card">
                        <div className="section-header">
                            <span className="icon">🏗️</span>
                            <h3>Production Summary</h3>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <label>Total Batches</label>
                                <span>{reportData.productionSummary.totalBatches}</span>
                            </div>
                            <div className="stat-item">
                                <label>Total Sleepers</label>
                                <span>{reportData.productionSummary.totalSleepers}</span>
                            </div>
                            <div className="stat-item danger">
                                <label>Initial Rejections</label>
                                <span>{reportData.productionSummary.demouldingRejections}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Alerts & Handover */}
                <div className="report-column">
                    <section className="report-section">
                        <div className="section-header">
                            <span className="icon">🛡️</span>
                            <h3>Process Highlights & Alerts</h3>
                        </div>
                        <div className="alerts-list">
                            {reportData.processHighlights.map(alert => (
                                <div key={alert.id} className={`alert-bubble ${alert.status.toLowerCase()}`}>
                                    <div className="alert-meta">
                                        <span className="alert-type">{alert.type}</span>
                                        <span className="alert-status">{alert.status}</span>
                                    </div>
                                    <p className="alert-msg">{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="report-section handover-section">
                        <div className="section-header">
                            <span className="icon">📝</span>
                            <h3>Shift Handover Log</h3>
                        </div>
                        <div className="handover-content">
                            {reportData.handoverNotes}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LastShiftReport;

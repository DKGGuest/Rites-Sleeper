import React, { useState } from 'react';
import { useShift } from '../../context/ShiftContext';
import './MainDashboard.css';

/**
 * MainDashboard - Landing page for Process IE after login.
 * Displays four action cards and handles start/resume duty logic.
 */
const MainDashboard = () => {
    const {
        dutyStarted,
        activeContainerId,
        setActiveContainerId,
        loadShiftData,
    } = useShift();

    const [showDutyForm, setShowDutyForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        shift: '',
        location: '',
    });

    // Check if there is an active duty (resume state)
    const hasActiveDuty = dutyStarted && activeContainerId != null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would call an API/Update context to create a new session
        // For simulation, we generate a temp ID and set it
        const newId = `session-${Date.now()}`;
        setActiveContainerId(newId);
        setShowDutyForm(false);
        redirectToDutyDashboard(formData.shift);
    };

    const redirectToDutyDashboard = (shift) => {
        const target = shift === 'General' ? 'Sleeper process IE-General' : 'Sleeper process Duty';
        const event = new CustomEvent('navigate', { detail: { target } });
        window.dispatchEvent(event);
    };

    const handleStartResumeClick = () => {
        if (hasActiveDuty) {
            // Placeholder: determine if active duty was for Shift or General
            // Defaulting to Shift duty for resume
            redirectToDutyDashboard('Shift');
        } else {
            setShowDutyForm(true);
        }
    };

    const navigateTo = (target) => {
        const event = new CustomEvent('navigate', { detail: { target } });
        window.dispatchEvent(event);
    };

    return (
        <div className="main-dashboard fade-in">
            <h1 className="dashboard-title">Process IE – Portal Home</h1>

            <div className="card-grid">
                {/* CARD 1: Start / Resume Duty */}
                <div className="dashboard-card" onClick={handleStartResumeClick}>
                    <div className="card-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
                        <span style={{ fontSize: '1.5rem', color: '#fff' }}>▶</span>
                    </div>
                    <h3>{hasActiveDuty ? 'Resume Active Duty' : 'Start New Duty'}</h3>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                        {hasActiveDuty ? 'Go back to your current data logging session.' : 'Log in to start your shift or general duties.'}
                    </p>
                </div>

                {/* CARD 2: Batch-wise Sleeper Report */}
                <div className="dashboard-card" onClick={() => navigateTo('BatchWiseSleeperReport')}>
                    <div className="card-icon" style={{ backgroundColor: 'var(--color-success)' }}>
                        <span style={{ fontSize: '1.5rem', color: '#fff' }}>📋</span>
                    </div>
                    <h3>Batch-wise Report</h3>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                        Complete end-to-end traceability for any batch.
                    </p>
                </div>

                {/* CARD 3: Last Shift Report */}
                <div className="dashboard-card" onClick={() => navigateTo('LastShiftReport')}>
                    <div className="card-icon" style={{ backgroundColor: 'var(--color-warning)' }}>
                        <span style={{ fontSize: '1.5rem', color: '#fff' }}>⌛</span>
                    </div>
                    <h3>Last Shift Snap</h3>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                        Immediate snapshot of the previous shift activity.
                    </p>
                </div>

                {/* CARD 4: Monthly Report */}
                <div className="dashboard-card" onClick={() => navigateTo('MonthlyReport')}>
                    <div className="card-icon" style={{ backgroundColor: 'var(--rites-dark)' }}>
                        <span style={{ fontSize: '1.5rem', color: '#fff' }}>📈</span>
                    </div>
                    <h3>Monthly Overview</h3>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                        Plant-wide KPIs and performance indicators.
                    </p>
                </div>
            </div>

            {/* MODAL POP-UP */}
            {showDutyForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Initialize Shift Duty</h2>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit} className="duty-form">
                                <label>
                                    Casting Date
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Shift Selection
                                    <select
                                        name="shift"
                                        value={formData.shift}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Shift</option>
                                        <option value="A">Shift A (Morning)</option>
                                        <option value="B">Shift B (Afternoon)</option>
                                        <option value="C">Shift C (Night)</option>
                                        <option value="General">General (Audit/RM)</option>
                                    </select>
                                </label>

                                <label>
                                    Production Location
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Location</option>
                                        <option value="Line I">Line I</option>
                                        <option value="Line II">Line II</option>
                                        <option value="Line III">Line III</option>
                                        <option value="Shed I">Shed I</option>
                                        <option value="Shed II">Shed II</option>
                                        <option value="Shed III">Shed III</option>
                                    </select>
                                </label>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setShowDutyForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        Begin Logging
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainDashboard;

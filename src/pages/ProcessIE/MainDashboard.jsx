import React, { useState } from 'react';
import { useShift } from '../../context/ShiftContext';
import './MainDashboard.css';

/**
 * MainDashboard – Landing page for Process IE after login.
 * Four action cards + start/resume duty modal.
 */
const DASHBOARD_CARDS = [
    {
        id: 'start-duty',
        iconClass: 'card-icon card-icon--primary',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
        title: (hasActive) => hasActive ? 'Resume Duty' : 'Start Duty',
        desc: (hasActive) => hasActive
            ? 'Continue your current active data logging session.'
            : 'Initialize your daily productivity and duty assignment.',
    },
    {
        id: 'batch-report',
        iconClass: 'card-icon card-icon--success',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
        title: () => 'Batch-wise Sleeper Report',
        desc: () => 'End-to-end traceability and lifecycle summary of batches.',
        target: 'BatchWiseSleeperReport',
    },
    {
        id: 'shift-report',
        iconClass: 'card-icon card-icon--warning',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        title: () => 'Last Shift Report',
        desc: () => 'Immediate snapshot and alerts from the previous shift.',
        target: 'LastShiftReport',
    },
    {
        id: 'monthly-report',
        iconClass: 'card-icon card-icon--dark',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
        title: () => 'Monthly Report',
        desc: () => 'High-level plant-wide monthly KPI dashboard.',
        target: 'MonthlyReport',
    },
];

const MainDashboard = () => {
    const {
        dutyStarted,
        setDutyStarted,
        activeContainerId,
        setActiveContainerId,
        selectedShift,
        setSelectedShift,
        setDutyDate,
        setDutyLocation,
        containers
    } = useShift();

    const [showDutyForm, setShowDutyForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        shift: '',
        location: '',
    });

    const hasActiveDuty = dutyStarted;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Update Context State
        setDutyStarted(true);
        setSelectedShift(formData.shift);
        setDutyDate(formData.date);
        setDutyLocation(formData.location);

        // Find or create container ID based on location
        const matchedContainer = containers.find(c => c.name === formData.location);
        if (matchedContainer) {
            setActiveContainerId(matchedContainer.id);
        } else {
            setActiveContainerId(1); // Default to 1 if not matched
        }

        setShowDutyForm(false);
        redirectToDutyDashboard(formData.shift);
    };

    const redirectToDutyDashboard = (shift) => {
        const target = shift === 'General' ? 'Sleeper process IE-General' : 'Sleeper process Duty';
        window.dispatchEvent(new CustomEvent('navigate', { detail: { target } }));
    };

    const navigateTo = (target) => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { target } }));
    };

    const handleCardClick = (card) => {
        if (card.id === 'start-duty') {
            hasActiveDuty ? redirectToDutyDashboard(selectedShift) : setShowDutyForm(true);
        } else if (card.target) {
            navigateTo(card.target);
        }
    };


    return (
        <div className="main-dashboard fade-in">
            <h1 className="dashboard-title">Process IE – Portal Home</h1>

            <div className="card-grid">
                {DASHBOARD_CARDS.map(card => (
                    <div
                        key={card.id}
                        className="dashboard-card"
                        onClick={() => handleCardClick(card)}
                    >
                        <div className={card.iconClass}>
                            <span className="card-icon-symbol">{card.icon}</span>
                        </div>
                        <h3>{card.title(hasActiveDuty)}</h3>
                        <p className="dashboard-card-desc">{card.desc(hasActiveDuty)}</p>
                    </div>
                ))}
            </div>

            {/* ── Start Duty Modal ── */}
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
                                    <button type="submit" className="btn-submit">
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

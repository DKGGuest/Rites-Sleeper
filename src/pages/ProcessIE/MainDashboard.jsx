import React, { useState, useEffect } from 'react';
import { useShift } from '../../context/ShiftContext';
import { getCompanyMappingByUser, getShedsByVendorCode } from '../../services/workflowService';
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
    {
        id: 'production-verification',
        iconClass: 'card-icon card-icon--primary',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /><polyline points="21 8 21 3 16 3" /></svg>,
        title: () => 'Production Verification',
        desc: () => 'Verify and authorize daily production declaration logs.',
        target: 'Sleeper process IE-General',
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
        dutyDate,
        setDutyDate,
        dutyUnit,
        setDutyUnit,
        dutyLocation,
        setDutyLocation,
        containers,
        plantVerificationData
    } = useShift();

    const [showDutyForm, setShowDutyForm] = useState(false);
    const [companyNames, setCompanyNames] = useState([]);
    const [unitVendorMap, setUnitVendorMap] = useState({});
    const [companyUnitMap, setCompanyUnitMap] = useState({});
    const [vendorSheds, setVendorSheds] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        shift: '',
        companyName: '',
        unit: '',
        location: '',
    });

    useEffect(() => {
        const fetchCompanyMapping = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const response = await getCompanyMappingByUser(userId);
                if (response) {
                    if (response.unitVendorMap) {
                        setUnitVendorMap(response.unitVendorMap);
                    }
                    if (response.companyUnitMap) {
                        setCompanyUnitMap(response.companyUnitMap);
                    }
                    if (response.companyNames) {
                        setCompanyNames(response.companyNames);
                        if (response.companyNames.length === 1) {
                            setFormData(prev => ({ ...prev, companyName: response.companyNames[0] }));
                        }
                    } else if (response.companyName) {
                        // Fallback
                        setCompanyNames([response.companyName]);
                        setFormData(prev => ({ ...prev, companyName: response.companyName }));
                    }
                }
            }
        };
        fetchCompanyMapping();
    }, []);

    // Effect to fetch sheds when unit changes
    useEffect(() => {
        const fetchSheds = async () => {
            if (formData.unit && unitVendorMap[formData.unit]) {
                const vendorCode = unitVendorMap[formData.unit];
                const sheds = await getShedsByVendorCode(vendorCode);
                if (sheds) {
                    setVendorSheds(sheds.sort((a,b) => a - b));
                } else {
                    setVendorSheds([]);
                }
            } else {
                setVendorSheds([]);
            }
        };
        fetchSheds();
    }, [formData.unit, unitVendorMap]);

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
        setDutyUnit(formData.unit);
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
        } else if (card.id === 'production-verification') {
            // Navigate to General portal which has the Production Verification card
            navigateTo('Sleeper process IE-General');
        } else if (card.target) {
            navigateTo(card.target);
        }
    };


    return (
        <div className="ie-general-container fade-in">
            {/* ── Page Header ── */}
            <header className="ie-modern-header">
                <div className="header-top-line">
                    <button
                        className="home-btn-glass"
                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { target: 'Main Dashboard' } }))}
                        title="Back to Dashboard"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </button>
                    <div className="header-titles">
                        <h1>Process IE – Portal Home</h1>
                    </div>
                </div>
            </header>

            <div className="ie-sub-nav-grid">
                {DASHBOARD_CARDS.map(card => (
                    <div
                        key={card.id}
                        className="ie-sub-nav-card"
                        onClick={() => handleCardClick(card)}
                    >
                        <div className="card-icon-wrapper">
                            <span className="card-icon-symbol-modern">{card.icon}</span>
                        </div>
                        <div className="card-info">
                            <h3 className="ie-sub-nav-card-title">{card.title(hasActiveDuty)}</h3>
                            <p className="ie-sub-nav-card-desc">{card.desc(hasActiveDuty)}</p>
                        </div>
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
                                    Company Name
                                    <select
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        disabled={companyNames.length <= 1}
                                        className={companyNames.length <= 1 ? "read-only-dropdown" : ""}
                                    >
                                        <option value="">Select Company</option>
                                        {companyNames.map((name, idx) => (
                                            <option key={idx} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </label>

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
                                    Production Unit
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Unit</option>
                                        {(() => {
                                            const options = [];
                                            if (formData.companyName && companyUnitMap[formData.companyName]) {
                                                companyUnitMap[formData.companyName].forEach((unitName, idx) => {
                                                    const profile = plantVerificationData?.profiles?.find(p => p.plantName === unitName);
                                                    const statusText = (profile && profile.status !== 'Verified') ? ` (${profile.status})` : '';
                                                    options.push(
                                                        <option key={`${unitName}-${idx}`} value={unitName}>
                                                            {unitName}{statusText}
                                                        </option>
                                                    );
                                                });
                                            } else {
                                                plantVerificationData?.profiles?.forEach(profile => {
                                                    options.push(
                                                        <option key={profile.id} value={profile.plantName}>
                                                            {profile.plantName} {profile.status !== 'Verified' ? `(${profile.status})` : ''}
                                                        </option>
                                                    );
                                                });
                                            }
                                            return options;
                                        })()}
                                    </select>
                                </label>

                                <label>
                                    Production Location
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.unit}
                                    >
                                        <option value="">Select Location</option>
                                        {(() => {
                                            const locations = [];
                                            const selectedProfile = plantVerificationData?.profiles?.find(p => p.plantName === formData.unit);
                                            
                                            if (vendorSheds && vendorSheds.length > 0) {
                                                vendorSheds.forEach(shedStr => {
                                                    const shedNum = Number(shedStr);
                                                    const roman = shedNum === 1 ? 'I' : shedNum === 2 ? 'II' : shedNum === 3 ? 'III' : shedNum === 4 ? 'IV' : shedNum === 5 ? 'V' : shedNum;
                                                    locations.push(`Shed ${roman}`);
                                                });
                                            } else if (selectedProfile && selectedProfile.status === 'Verified') {
                                                // Fallback to old behavior if no vendor sheds are fetched
                                                if (selectedProfile.sheds) {
                                                    for (let i = 1; i <= selectedProfile.sheds; i++) {
                                                        const roman = i === 1 ? 'I' : i === 2 ? 'II' : i === 3 ? 'III' : i === 4 ? 'IV' : i === 5 ? 'V' : i;
                                                        locations.push(`Shed ${roman}`);
                                                    }
                                                }
                                                if (selectedProfile.lines) {
                                                    for (let i = 1; i <= selectedProfile.lines; i++) {
                                                        const roman = i === 1 ? 'I' : i === 2 ? 'II' : i === 3 ? 'III' : i === 4 ? 'IV' : i === 5 ? 'V' : i;
                                                        locations.push(`Line ${roman}`);
                                                    }
                                                }
                                            }

                                            return locations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ));
                                        })()}
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

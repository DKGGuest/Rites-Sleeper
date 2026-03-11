import React from 'react';
import { useShift } from '../../context/ShiftContext';
import './DashboardTabs.css';

const TABS = [
    {
        id: 'Main Dashboard',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
        title: (hasActive) => hasActive ? 'Resume Duty' : 'Start Duty',
        desc: (hasActive) => hasActive
            ? 'Continue your current active data logging session.'
            : 'Initialize your daily productivity and duty assignment.',
        target: 'Main Dashboard'
    },
    {
        id: 'Batch Wise Sleeper Report',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
        title: () => 'Batch-wise Sleeper Report',
        desc: () => 'End-to-end traceability and lifecycle summary of batches.',
        target: 'Batch Wise Sleeper Report'
    },
    {
        id: 'Last Shift Report',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        title: () => 'Last Shift Report',
        desc: () => 'Immediate snapshot and alerts from the previous shift.',
        target: 'Last Shift Report'
    },
    {
        id: 'Monthly Performance Report',
        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
        title: () => 'Monthly Report',
        desc: () => 'High-level plant-wide monthly KPI dashboard.',
        target: 'Monthly Performance Report'
    }
];

const DashboardTabs = ({ activeItem, onItemClick }) => {
    const { dutyStarted } = useShift();
    const hasActiveDuty = dutyStarted;

    const currentActive = (activeItem === 'Sleeper process IE-General' || activeItem === 'Sleeper process Duty')
        ? 'Main Dashboard'
        : activeItem;

    return (
        <div className="mini-dashboard-header">
            <div className="ie-sub-nav-grid" style={{ position: 'static', marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                {TABS.map(tab => {
                    const isActive = currentActive === tab.id;
                    return (
                        <div
                            key={tab.id}
                            className={`ie-sub-nav-card ${isActive ? 'active' : ''}`}
                            onClick={() => onItemClick(tab.target)}
                        >
                            <div className="card-icon-wrapper">
                                {tab.icon}
                            </div>
                            <div className="card-info">
                                <h3 className="ie-sub-nav-card-title">{tab.title(hasActiveDuty)}</h3>
                                <p className="ie-sub-nav-card-desc">{tab.desc(hasActiveDuty)}</p>
                            </div>
                            {isActive && <div className="active-indicator"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default DashboardTabs;


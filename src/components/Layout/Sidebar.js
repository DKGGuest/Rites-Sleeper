import React from 'react';
import './Sidebar.css';

/**
 * Sidebar – Collapsible navigation rail.
 * Expands on hover / when pinned by parent.
 */
const menuSections = [
    {
        label: 'Navigation',
        items: [
            { id: 'Main Dashboard', label: 'Portal Home', icon: 'PH' },
        ],
    },
    {
        label: 'Inspection Dashboard',
        items: [
            { id: 'Sleeper process IE-General', label: 'IE General', icon: 'IE' },
            { id: 'Sleeper process Duty', label: 'IE Active Duty', icon: 'SD' },
        ],
    },
];

const Sidebar = ({ activeItem, onItemClick, isOpen, expanded, onMouseEnter, onMouseLeave, onClick }) => (
    <aside
        className={`sidebar-root${isOpen ? ' open' : ''}${expanded ? ' expanded' : ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
    >
        {/* Brand header */}
        <div className="sidebar-header">
            <h2 className="sidebar-logo">SARTHI</h2>
            <span className="sidebar-brand-sub">Rites Ltd.</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
            {menuSections.map((section, idx) => (
                <div key={idx} className="menu-section">
                    <div className="menu-section-label">{section.label}</div>
                    {section.items.map(item => {
                        const isActive = activeItem === item.id;
                        return (
                            <div
                                key={item.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemClick(item.id);
                                }}
                                className={`menu-item${isActive ? ' active' : ''}`}
                            >
                                <span className={`menu-icon${isActive ? ' menu-icon--active' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="menu-label">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </nav>

        {/* Version footer */}
        <div className="sidebar-version">
            <span className="menu-label">v1.2.0</span>
            <span className="sidebar-version-short">v1.2</span>
        </div>
    </aside>
);

export default Sidebar;

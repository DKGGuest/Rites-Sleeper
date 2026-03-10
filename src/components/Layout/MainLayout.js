import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

/**
 * MainLayout – Application shell: sidebar + topbar + content area.
 */
const MainLayout = ({ children, activeItem, onItemClick }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);

    return (
        <div className="main-layout-root">

            {/* Mobile sidebar backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="sidebar-overlay open"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                activeItem={activeItem}
                onItemClick={(item) => {
                    onItemClick(item);
                    setIsMobileMenuOpen(false);
                }}
                isOpen={isMobileMenuOpen}
                expanded={isSidebarPinned || isSidebarHovered}
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                onClick={() => setIsSidebarPinned(!isSidebarPinned)}
            />

            <div className="main-content-wrapper">
                <header className="main-header">

                    {/* Left: hamburger menu (mobile) */}
                    <div className="header-left">
                        <button
                            id="mobile-menu-btn"
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                            >
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Center: Dashboard shortcuts */}
                    <div className="header-center">
                        <div className="header-shortcuts">
                            <button
                                className={`shortcut-btn ${activeItem === 'Main Dashboard' ? 'active' : ''}`}
                                onClick={() => onItemClick('Main Dashboard')}
                                title="Home Dashboard"
                            >
                                <span className="shortcut-icon" style={{ background: '#eff6ff', color: '#1e40af' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </span>
                            </button>
                            <button
                                className={`shortcut-btn ${activeItem === 'Batch Wise Sleeper Report' ? 'active' : ''}`}
                                onClick={() => onItemClick('Batch Wise Sleeper Report')}
                                title="Batch-wise Report"
                            >
                                <span className="shortcut-icon" style={{ background: '#ecfdf5', color: '#065f46' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                </span>
                            </button>
                            <button
                                className={`shortcut-btn ${activeItem === 'Last Shift Report' ? 'active' : ''}`}
                                onClick={() => onItemClick('Last Shift Report')}
                                title="Last Shift Report"
                            >
                                <span className="shortcut-icon" style={{ background: '#fffbeb', color: '#92400e' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </span>
                            </button>
                            <button
                                className={`shortcut-btn ${activeItem === 'Monthly Performance Report' ? 'active' : ''}`}
                                onClick={() => onItemClick('Monthly Performance Report')}
                                title="Monthly Report"
                            >
                                <span className="shortcut-icon" style={{ background: '#f8fafc', color: '#1e293b' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right: user avatar + logout */}
                    <div className="header-right">
                        <div className="header-user-avatar">I</div>
                        <button className="header-logout-btn">Logout</button>
                    </div>

                </header>

                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

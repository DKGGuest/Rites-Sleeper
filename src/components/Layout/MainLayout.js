import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { logoutUser, getStoredUser } from '../../services/authService';
import { useShift } from '../../context/ShiftContext';
import { ROUTES } from '../../routes';
import './MainLayout.css';

/**
 * MainLayout – Application shell: sidebar + topbar + content area.
 */
const MainLayout = ({ children, activeItem, onItemClick }) => {
    const navigate = useNavigate();
    const { dutyStarted, endDuty } = useShift();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);

    const user = getStoredUser();

    const handleLogout = () => {
        logoutUser();
        navigate(ROUTES.LOGIN, { replace: true });
    };

    const handleEndDuty = () => {
        const confirmed = window.confirm("Are you sure you want to end your current duty session? Any unsaved changes may be lost.");
        if (confirmed) {
            endDuty();
            onItemClick('Main Dashboard'); // Navigate back to Portal Home
            // We also need to make sure App.jsx handles the view change.
            // App.jsx listens for onItemClick which is setMainView.
        }
    };

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

                    {/* Right: End Duty + user avatar + name/ID + logout */}
                    <div className="header-right">
                        {dutyStarted && (
                            <button 
                                className="end-duty-btn"
                                onClick={handleEndDuty}
                                title="End Shift Duty"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                    <line x1="12" y1="2" x2="12" y2="12" />
                                </svg>
                                <span>End Duty</span>
                            </button>
                        )}

                        <div className="header-divider"></div>
                        
                        <div className="user-profile-section">
                            <div className="header-user-avatar">
                                {user?.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.userName || 'User'}</span>
                                <span className="user-code">Emp Code: {user?.userId || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="header-divider"></div>
                        <button 
                            className="header-logout-btn"
                            onClick={handleLogout}
                            title="Sign Out"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Logout</span>
                        </button>
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

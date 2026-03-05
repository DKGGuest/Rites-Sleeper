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

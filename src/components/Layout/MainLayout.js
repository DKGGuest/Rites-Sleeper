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
    
    // Custom End Duty Modal state
    const [showEndDutyModal, setShowEndDutyModal] = useState(false);
    const [confirmCheckbox, setConfirmCheckbox] = useState(false);

    const user = getStoredUser();

    const handleLogout = () => {
        logoutUser();
        onItemClick('Main Dashboard');
        navigate(ROUTES.LOGIN, { replace: true });
    };

    const handleEndDutyConfirm = () => {
        endDuty();
        onItemClick('Main Dashboard');
        setShowEndDutyModal(false);
        setConfirmCheckbox(false);
    };

    return (
        <div className="main-layout-root">
            
            {/* End Duty Confirmation Modal */}
            {showEndDutyModal && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
                        <div className="modal-header" style={{ marginBottom: '20px' }}>
                            <h2 style={{ color: 'var(--color-danger)', fontSize: '20px' }}>End Duty Session?</h2>
                        </div>
                        <div className="modal-body" style={{ marginBottom: '25px' }}>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                                You are about to terminate your active duty session. <br/>
                                <strong style={{ color: '#1e293b' }}>Any unsaved data in current forms will be lost.</strong>
                            </p>
                            
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px', 
                                cursor: 'pointer',
                                padding: '12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={confirmCheckbox}
                                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Are you sure??</span>
                            </label>
                        </div>
                        
                        <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                className="btn-cancel" 
                                onClick={() => {
                                    setShowEndDutyModal(false);
                                    setConfirmCheckbox(false);
                                }}
                                style={{ flex: 1 }}
                            >
                                Back to Work
                            </button>
                            <button 
                                className="btn-submit" 
                                onClick={handleEndDutyConfirm}
                                disabled={!confirmCheckbox}
                                style={{ 
                                    flex: 1, 
                                    background: confirmCheckbox ? 'var(--color-danger)' : '#cbd5e1',
                                    borderColor: confirmCheckbox ? 'var(--color-danger)' : '#cbd5e1',
                                    cursor: confirmCheckbox ? 'pointer' : 'not-allowed'
                                }}
                            >
                                End Duty Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                onClick={() => setShowEndDutyModal(true)}
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
                                <span className="user-code">
                                    Code: {user?.userId || 'N/A'} {user?.vendorCode ? `| Vendor: ${user.vendorCode}` : ''}
                                </span>
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

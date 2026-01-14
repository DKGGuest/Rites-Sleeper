import React, { useState } from 'react';

const Sidebar = ({ activeItem, onItemClick }) => {
    const menuItems = [
        { label: 'Raw Material Inspection' },
    ];

    return (
        <>
            <style>{`
                .sidebar-root {
                    width: 240px;
                    background: #ffffff;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    flex-shrink: 0;
                    transition: width 0.3s;
                }
                .sidebar-header {
                    padding: 24px 16px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .sidebar-logo {
                    margin: 0;
                    font-size: var(--fs-xl);
                    color: #00838f;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .menu-item {
                    padding: 12px 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    font-size: var(--fs-sm);
                    color: #475467;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                }
                .menu-item:hover {
                    background: #f8fafc;
                    color: #101828;
                }
                .menu-item.active {
                    color: #00838f;
                    background: #f0f7f9;
                    border-left-color: #00838f;
                    font-weight: 600;
                }
                @media (max-width: 1024px) {
                    .sidebar-root {
                        width: 64px;
                    }
                    .menu-label, .sidebar-subtitle {
                        display: none;
                    }
                    .sidebar-header {
                        text-align: center;
                    }
                    .menu-item {
                        justify-content: center;
                        padding: 12px 0;
                    }
                }
                @media (max-width: 768px) {
                    .sidebar-root {
                        display: none;
                    }
                }
            `}</style>

            <div className="sidebar-root">
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">SARTHI</h2>
                    <span className="sidebar-subtitle" style={{ fontSize: 'var(--fs-xxs)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px', display: 'block' }}>Inspection Dashboard</span>
                </div>

                <nav style={{ padding: '12px 0', flex: 1 }}>
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={() => onItemClick(item.label)}
                            className={`menu-item ${activeItem === item.label ? 'active' : ''}`}
                        >
                            <span className="menu-label">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-subtitle" style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', fontSize: 'var(--fs-xxs)', color: '#94a3b8' }}>
                    v1.0.0
                </div>
            </div>
        </>
    );
};

export default Sidebar;

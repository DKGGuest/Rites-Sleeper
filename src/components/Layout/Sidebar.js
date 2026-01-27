import React from 'react';

const Sidebar = ({ activeItem, onItemClick, isOpen, expanded }) => {
    const menuSections = [
        {
            label: 'Inspection Dashboard',
            items: [
                { id: 'Sleeper process IE-General', label: 'Sleeper process IE-General', icon: '📊' },
                { id: 'Sleeper process Duty', label: 'Sleeper process Duty', icon: '⚡' },
            ]
        }
    ];

    return (
        <aside className={`sidebar-root ${isOpen ? 'open' : ''} ${expanded ? 'expanded' : ''}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-logo">SARTHI</h2>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px', display: 'block' }}>Rites Ltd.</span>
            </div>

            <nav className="sidebar-nav">
                {menuSections.map((section, sidx) => (
                    <div key={sidx} className="menu-section">
                        <div className="menu-section-label">{section.label}</div>
                        {section.items.map((item) => (
                            <div
                                key={item.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemClick(item.id);
                                }}
                                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                            >
                                <span className="menu-icon" style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>
                                    {item.icon}
                                </span>
                                <span className="menu-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', fontSize: 'var(--fs-xxs)', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {expanded ? 'v1.2.0' : 'v1.2'}
            </div>
        </aside>
    );
};

export default Sidebar;

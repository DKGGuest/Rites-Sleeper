import React from 'react';

const Sidebar = ({ activeItem, onItemClick, isOpen }) => {
    const menuSections = [
        {
            label: 'Inspection Dashboard',
            items: [
                { id: 'Sleeper process IE-General', label: 'Sleeper process IE-General' },
                { id: 'Sleeper process Duty', label: 'Sleeper process Duty' },
            ]
        }
    ];

    return (
        <aside className={`sidebar-root ${isOpen ? 'open' : ''}`}>
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
                                onClick={() => onItemClick(item.id)}
                                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                            >
                                <span className="menu-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', fontSize: 'var(--fs-xxs)', color: '#94a3b8' }}>
                v1.2.0
            </div>
        </aside>
    );
};

export default Sidebar;

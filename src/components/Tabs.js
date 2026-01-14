import React from 'react';
import '../styles/CallDeskDashboard.css'; // Ensure styles are available

const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="tabs-container">
            <div className="tabs-list">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onChange(tab.id)}
                    >
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-count">
                            {tab.count} {tab.countLabel || (tab.label.toLowerCase().includes('pending') ? 'pending' : 'items')}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;

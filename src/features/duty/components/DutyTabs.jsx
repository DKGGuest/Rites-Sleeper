import React from 'react';

const DutyTabs = ({ tabs, activeTab, setActiveTab, witnessedRecordsCount }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
        }}>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        background: activeTab === tab.id ? '#f0f9fa' : 'white',
                        border: `2px solid ${activeTab === tab.id ? '#42818c' : '#e2e8f0'}`,
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(66, 129, 140, 0.1)' : 'none',
                        transform: activeTab === tab.id ? 'translateY(-2px)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '100px'
                    }}
                >
                    <div>
                        <h3 style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            color: activeTab === tab.id ? '#42818c' : '#334155',
                            marginBottom: '4px',
                            margin: 0
                        }}>
                            {tab.title}
                        </h3>
                        <p style={{ fontSize: '10px', color: '#64748b', margin: 0, fontWeight: '500' }}>{tab.description}</p>
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: activeTab === tab.id ? '#42818c' : '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {tab.id === 'Batch Weighment' ? `${witnessedRecordsCount} Witnessed` :
                                tab.id === 'Moisture Analysis' ? '4 Logs Today' :
                                    tab.id === 'Compaction of Concrete (Vibrator Report)' ? 'Scada Live' : 'Active'}
                        </span>
                        {activeTab === tab.id && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#42818c' }}></span>
                        )}
                    </div>

                    {tab.alert && (
                        <span style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: '900',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                        }}>!</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default DutyTabs;

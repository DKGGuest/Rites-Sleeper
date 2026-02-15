import React from 'react';

const FeatureToolbar = ({ activeTab, witnessedRecordsCount, setShowBatchEntryForm, setShowWireTensionForm, setViewMode, setDetailView }) => {
    return (
        <div className="duty-section-toolbar" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {activeTab !== 'Steam Cube Testing' && (
                    <h2 className="duty-section-title" style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>{activeTab}</h2>
                )}
                {activeTab === 'Batch Weighment' && <span className="badge-count" style={{ marginLeft: 0, fontSize: '10px' }}>{witnessedRecordsCount}</span>}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                {activeTab === 'Batch Weighment' && (
                    <button className="toggle-btn" onClick={() => setShowBatchEntryForm(true)}>
                        + Add New Entry
                    </button>
                )}
                {activeTab === 'Wire Tensioning' && (
                    <button className="toggle-btn" onClick={() => setShowWireTensionForm(true)}>
                        + Add New Entry
                    </button>
                )}
                {!(activeTab === 'Mould & Bench Checking' || activeTab === 'Manual Checks' || activeTab === 'Steam Cube Testing' || activeTab === 'Batch Weighment' || activeTab === 'Wire Tensioning' || activeTab === 'Compaction of Concrete (Vibrator Report)' || activeTab === 'Steam Curing') && (
                    <button className="toggle-btn" style={{ fontSize: '0.7rem' }} onClick={() => { setViewMode('entry'); setDetailView('detail_modal'); }}>
                        {activeTab === 'Raw Material Inventory' ? 'Open Inventory Console' :
                            activeTab === 'Moisture Analysis' ? 'New Analysis Entry' : 'New Entry'}
                    </button>
                )}
                {activeTab === 'Mould & Bench Checking' && (
                    <div style={{ background: '#f0fdf4', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }}></div>
                        ASSET CONSOLE ACTIVE
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeatureToolbar;

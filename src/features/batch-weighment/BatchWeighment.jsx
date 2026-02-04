import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useBatchStats } from '../../hooks/useStats';
import InitialDeclaration from './components/InitialDeclaration';
import WeightBatching from './components/WeightBatching';
import ManualDataEntry from './components/ManualDataEntry';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * BatchWeighment Feature Module
 * Standardized to match Compaction module design pattern.
 */
const BWSubCard = ({ id, title, color, statusDetail, isActive, onClick }) => {
    const label = id === 'stats' ? 'ANALYSIS' : id === 'witnessed' ? 'HISTORY' : 'SCADA';
    return (
        <div
            onClick={onClick}
            style={{
                flex: '1 1 200px',
                padding: '16px 20px',
                background: isActive ? '#fff' : '#f8fafc',
                border: `1px solid ${isActive ? color : '#e2e8f0'}`,
                borderTop: `4px solid ${color}`,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 4px 12px ${color}20` : 'none',
                transform: isActive ? 'translateY(-2px)' : 'none',
                position: 'relative',
                minHeight: '100px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: isActive ? color : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, opacity: isActive ? 1 : 0.4 }}></span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{title}</span>
            <div style={{ marginTop: 'auto', fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                {statusDetail}
            </div>
        </div>
    );
};

const BatchWeighment = ({ onBack, sharedState, activeContainer, displayMode = 'modal', showForm: propsShowForm, setShowForm: propsSetShowForm }) => {
    const { batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords } = sharedState;
    const [viewMode, setViewMode] = useState('witnessed'); // Default to 'witnessed'
    const [localShowForm, setLocalShowForm] = useState(false);

    const showForm = propsShowForm !== undefined ? propsShowForm : localShowForm;
    const setShowForm = propsSetShowForm !== undefined ? propsSetShowForm : setLocalShowForm;

    const [selectedBatchNo, setSelectedBatchNo] = useState(batchDeclarations[0]?.batchNo || '601');
    const [editId, setEditId] = useState(null);

    const batchStats = useBatchStats(witnessedRecords, batchDeclarations, selectedBatchNo);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await apiService.getWitnessedRecords();
                if (history?.length > 0) setWitnessedRecords(history);
            } catch (e) {
                console.warn("History fetch failed, using local state.");
            }
        };
        loadHistory();
    }, [setWitnessedRecords]);

    const handleSaveWitness = async (record) => {
        try {
            await apiService.saveWitnessRecord(record);
        } catch (error) {
            console.warn("API unavailable, syncing locally.");
        }

        setWitnessedRecords(prev => {
            const exists = prev.find(r => r.id === record.id);
            return exists ? prev.map(r => r.id === record.id ? record : r) : [record, ...prev];
        });
        alert('Record saved successfully.');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setWitnessedRecords(prev => prev.filter(r => r.id !== id));
        }
    };

    const [formSections, setFormSections] = useState({ declaration: true, scada: true, manual: true });

    const toggleSection = (section) => {
        setFormSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const renderForm = () => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowForm(false)}>
            <div className="fade-in" style={{ width: '100%', maxWidth: '1250px', maxHeight: '92vh', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

                {/* Header - Cream Background */}
                <div style={{ background: '#FFF8E7', padding: '1rem 1.5rem', borderBottom: '1px solid #F3E8FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>New Batch Entry</h2>
                        <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '10px', fontWeight: '700' }}>Record weights & verify SCADA data</p>
                    </div>
                    <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '14px' }}>✕</button>
                </div>

                {/* Scrollable Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1, overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Section 1: Initial Declaration */}
                        <div style={{ background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div
                                onClick={() => toggleSection('declaration')}
                                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: formSections.declaration ? 'transparent' : '#eff6ff' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '800' }}>Initial Declaration</h3>
                                </div>
                                <span style={{ transition: 'transform 0.2s', transform: formSections.declaration ? 'rotate(180deg)' : 'rotate(0deg)', color: '#3b82f6' }}>▼</span>
                            </div>
                            {formSections.declaration && (
                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid #dbeafe', paddingTop: '1.5rem' }}>
                                    <InitialDeclaration batches={batchDeclarations} onBatchUpdate={setBatchDeclarations} />
                                </div>
                            )}
                        </div>

                        {/* Section 2: SCADA Data */}
                        <div style={{ background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div
                                onClick={() => toggleSection('scada')}
                                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: '#d97706', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#78350f', fontWeight: '800' }}>SCADA Data Fetched</h3>
                                </div>
                                <span style={{ transition: 'transform 0.2s', transform: formSections.scada ? 'rotate(180deg)' : 'rotate(0deg)', color: '#d97706' }}>▼</span>
                            </div>
                            {formSections.scada && (
                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid #fcd34d', paddingTop: '1.5rem' }}>
                                    <WeightBatching onWitness={handleSaveWitness} batches={batchDeclarations} selectedBatchNo={selectedBatchNo} />
                                </div>
                            )}
                        </div>

                        {/* Section 3: Manual Verification */}
                        <div style={{ background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <div
                                onClick={() => toggleSection('manual')}
                                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#064e3b', fontWeight: '800' }}>Manual Verification</h3>
                                </div>
                                <span style={{ transition: 'transform 0.2s', transform: formSections.manual ? 'rotate(180deg)' : 'rotate(0deg)', color: '#10b981' }}>▼</span>
                            </div>
                            {formSections.manual && (
                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid #86efac', paddingTop: '1.5rem' }}>
                                    <ManualDataEntry batches={batchDeclarations} witnessedRecords={witnessedRecords} onSave={handleSaveWitness} activeContainer={activeContainer} onDelete={handleDelete} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'stats', label: 'Statistics', desc: 'View weight distribution and material consumption.' },
        { id: 'witnessed', label: 'Witnessed Logs', desc: 'Manage all witnessed batch declarations.' },
        { id: 'scada', label: 'Scada Data', desc: 'Raw SCADA feed for weight batching.' }
    ];

    if (displayMode === 'inline') {
        return (
            <div className="batch-weighment-inline" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    {/* The Add New Entry button is now managed by the parent console to be on the same line as titles */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {tabs.map(tab => (
                            <BWSubCard
                                key={tab.id}
                                id={tab.id}
                                title={tab.label}
                                color={tab.id === 'stats' ? '#3b82f6' : tab.id === 'witnessed' ? '#10b981' : '#f59e0b'}
                                statusDetail={
                                    tab.id === 'stats' ? 'Live Monitoring' :
                                        tab.id === 'witnessed' ? `${witnessedRecords.length} Verified Entries` :
                                            'PLCs Connected'
                                }
                                isActive={viewMode === tab.id}
                                onClick={() => setViewMode(tab.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="inline-body" style={{ flexGrow: 1 }}>
                    {showForm && renderForm()}

                    {viewMode === 'stats' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Process Performance Analytics</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Real-time deviations and compliance metrics.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Select Batch:</span>
                                    <select
                                        value={selectedBatchNo}
                                        onChange={(e) => setSelectedBatchNo(e.target.value)}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                    >
                                        {[...new Set(batchDeclarations.map(b => b.batchNo))].map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Stats Content - Copy of previous stats structure but cleaner if possible. I will assume I can reuse the batchStats variable */}

                            {/* Section 1: Set Value Validation */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }}></span>
                                    Set Value Validation
                                </h3>
                                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Batch Weighments</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>{batchStats?.setValueValidation?.totalBatchWeighments || 0}</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Matching Proportion</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#10b981' }}>{batchStats?.setValueValidation?.matchingProportion || 0}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>Set values within tolerance</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Mismatching Proportion</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ef4444' }}>{batchStats?.setValueValidation?.mismatchingProportion || 0}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>Requires attention</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Actual Value Statistics (Per Ingredient) */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#f59e0b', borderRadius: '2px' }}></span>
                                    Actual Value Statistics (Per Ingredient)
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {batchStats?.actualValueStats?.ingredientStats.map(stat => (
                                        <div key={stat.ingredient} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>{stat.name}</h4>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', fontWeight: '700' }}>Set: {stat.setValue} kg</span>
                                            </div>
                                            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                                <div className="calc-card" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Total Batches</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800' }}>{stat.totalBatches}</div>
                                                </div>
                                                {/* Simplified stats for inline view if needed, but keeping full for now */}
                                                <div className="calc-card" style={{ padding: '0.75rem', borderRadius: '8px', background: stat.meanDeviation > 0 ? '#fef2f2' : stat.meanDeviation < 0 ? '#eff6ff' : '#f8fafc', borderLeft: `3px solid ${Math.abs(stat.meanDeviation) > 1 ? '#ef4444' : '#10b981'}` }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Mean Dev</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: Math.abs(stat.meanDeviation) > 1 ? '#ef4444' : '#10b981' }}>{stat.meanDeviation > 0 ? '+' : ''}{stat.meanDeviation.toFixed(2)}%</div>
                                                </div>
                                                <div className="calc-card" style={{ padding: '0.75rem', borderRadius: '8px', background: stat.outlierCount > 0 ? '#fef2f2' : '#ecfdf5', borderLeft: `3px solid ${stat.outlierCount > 0 ? '#ef4444' : '#10b981'}` }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Outliers</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: stat.outlierCount > 0 ? '#ef4444' : '#10b981' }}>{stat.outlierCount}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Historical Witnessed Logs</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Manage all witnessed batch declarations.</p>
                                </div>
                            </div>
                            <ManualDataEntry batches={batchDeclarations} witnessedRecords={witnessedRecords} onSave={handleSaveWitness} activeContainer={activeContainer} onDelete={handleDelete} onlyHistory={true} />
                        </div>
                    )}

                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Raw SCADA Weight Feed</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Raw SCADA feed for weight batching.</p>
                            </div>
                            <WeightBatching onWitness={handleSaveWitness} batches={batchDeclarations} selectedBatchNo={selectedBatchNo} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Fallback to Modal mode

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '2000px', width: '96%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Batch Weighment Control Console</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>SCADA Sync & Quality Assurance</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>


                {viewMode !== 'form' ? (
                    <div style={{ padding: '0 1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id)}
                                    style={{
                                        padding: '1rem 0',
                                        cursor: 'pointer',
                                        borderBottom: viewMode === tab.id ? '2px solid #21808d' : '2px solid transparent',
                                        color: viewMode === tab.id ? '#21808d' : '#64748b',
                                        fontWeight: viewMode === tab.id ? '700' : '500',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {tab.label}
                                </div>
                            ))}
                        </div>
                        <div>
                            <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>New Batch Entry</h3>
                        <button className="btn-secondary" onClick={() => setViewMode('witnessed')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                            ← Back to Logs
                        </button>
                    </div>
                )}

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {viewMode === 'form' && renderForm()}

                    {viewMode === 'stats' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Process Performance Analytics</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Real-time deviations and compliance metrics.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Select Batch:</span>
                                    <select
                                        value={selectedBatchNo}
                                        onChange={(e) => setSelectedBatchNo(e.target.value)}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                    >
                                        {[...new Set(batchDeclarations.map(b => b.batchNo))].map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Section 1: Set Value Validation */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }}></span>
                                    Set Value Validation
                                </h3>
                                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Batch Weighments</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>{batchStats?.setValueValidation?.totalBatchWeighments || 0}</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Matching Proportion</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#10b981' }}>{batchStats?.setValueValidation?.matchingProportion || 0}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>Set values within tolerance</div>
                                    </div>
                                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Mismatching Proportion</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ef4444' }}>{batchStats?.setValueValidation?.mismatchingProportion || 0}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>Requires attention</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Actual Value Statistics (Per Ingredient) */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '4px', height: '20px', background: '#f59e0b', borderRadius: '2px' }}></span>
                                    Actual Value Statistics (Per Ingredient)
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {batchStats?.actualValueStats?.ingredientStats.map(stat => (
                                        <div key={stat.ingredient} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>{stat.name}</h4>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', fontWeight: '700' }}>Set: {stat.setValue} kg</span>
                                            </div>
                                            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                                <div className="calc-card" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Total Batches</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800' }}>{stat.totalBatches}</div>
                                                </div>
                                                <div className="calc-card" style={{ padding: '0.75rem', borderRadius: '8px', background: stat.meanDeviation > 0 ? '#fef2f2' : stat.meanDeviation < 0 ? '#eff6ff' : '#f8fafc', borderLeft: `3px solid ${Math.abs(stat.meanDeviation) > 1 ? '#ef4444' : '#10b981'}` }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Mean Deviation</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: Math.abs(stat.meanDeviation) > 1 ? '#ef4444' : '#10b981' }}>
                                                        {stat.meanDeviation > 0 ? '+' : ''}{stat.meanDeviation.toFixed(2)}%
                                                    </div>
                                                </div>
                                                <div className="calc-card" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Std Deviation</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800' }}>{stat.stdDeviation.toFixed(2)}%</div>
                                                </div>
                                                <div className="calc-card" style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '8px' }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Max Positive</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>+{stat.maxPositiveDeviation.toFixed(2)}%</div>
                                                </div>
                                                <div className="calc-card" style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '8px' }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Max Negative</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6' }}>{stat.maxNegativeDeviation.toFixed(2)}%</div>
                                                </div>
                                                <div className="calc-card" style={{ padding: '0.75rem', borderRadius: '8px', background: stat.outlierCount > 0 ? '#fef2f2' : '#ecfdf5', borderLeft: `3px solid ${stat.outlierCount > 0 ? '#ef4444' : '#10b981'}` }}>
                                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Outliers (&gt;3%)</div>
                                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: stat.outlierCount > 0 ? '#ef4444' : '#10b981' }}>{stat.outlierCount}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Historical Witnessed Logs</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Manage all witnessed batch declarations.</p>
                                </div>
                            </div>
                            <ManualDataEntry batches={batchDeclarations} witnessedRecords={witnessedRecords} onSave={handleSaveWitness} activeContainer={activeContainer} onDelete={handleDelete} onlyHistory={true} />
                        </div>
                    )}

                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Raw SCADA Weight Feed</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Raw SCADA feed for weight batching.</p>
                            </div>
                            <WeightBatching onWitness={handleSaveWitness} batches={batchDeclarations} selectedBatchNo={selectedBatchNo} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BatchWeighment;

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import InitialDeclaration from './components/InitialDeclaration';
import WeightBatching from './components/WeightBatching';
import ManualDataEntry from './components/ManualDataEntry';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * BatchWeighment Feature Module
 * Standardized to match Compaction module design pattern.
 */
const BatchWeighment = ({ onBack, sharedState, activeContainer }) => {
    const { batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords } = sharedState;
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'stats', 'witnessed', 'scada', 'form'
    const [selectedBatchNo, setSelectedBatchNo] = useState(batchDeclarations[0]?.batchNo || '601');
    const [editId, setEditId] = useState(null);

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

    const renderDashboard = () => (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('stats')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
                    <h3 style={{ color: '#1e293b' }}>Statistics</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>View weight distribution and material consumption.</p>
                </div>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('witnessed')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ color: '#1e293b' }}>Witnessed Logs</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Manage all witnessed batch declarations.</p>
                </div>
                <div className="dashboard-card hover-lift" onClick={() => setViewMode('scada')} style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
                    <h3 style={{ color: '#1e293b' }}>Scada Data</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Raw SCADA feed for weight batching.</p>
                </div>
            </div>
        </div>
    );

    const renderForm = () => (
        <div className="fade-in">
            <div style={{ marginBottom: '1.5rem' }}><button className="back-btn" onClick={() => setViewMode('witnessed')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>← Back to Logs</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>1. Initial Declaration (Batch Targets)</h4>
                    <InitialDeclaration batches={batchDeclarations} onBatchUpdate={setBatchDeclarations} />
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>2. Scada Fetched Values</h4>
                    <WeightBatching onWitness={handleSaveWitness} batches={batchDeclarations} selectedBatchNo={selectedBatchNo} />
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>3. Manual Entry Form</h4>
                    <ManualDataEntry batches={batchDeclarations} witnessedRecords={witnessedRecords} onSave={handleSaveWitness} activeContainer={activeContainer} hideHistory={true} />
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>4. Current Witness Logs</h4>
                    <ManualDataEntry batches={batchDeclarations} witnessedRecords={witnessedRecords} onSave={handleSaveWitness} activeContainer={activeContainer} onlyHistory={true} onDelete={handleDelete} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1800px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Batch Weighment Control Console</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>SCADA Sync & Quality Assurance</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>
                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {viewMode !== 'dashboard' && <button className="back-btn" onClick={() => setViewMode('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold', marginBottom: '1.5rem' }}>← Main Menu</button>}

                    {viewMode === 'dashboard' && renderDashboard()}
                    {viewMode === 'form' && renderForm()}
                    {viewMode === 'stats' && <div className="fade-in"><h3>Weight Analysis Statistics</h3><div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>📊 Statistics Visualization Dashboard coming soon...</div></div>}
                    {viewMode === 'witnessed' && (
                        <div className="fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Historical Witnessed Logs</h3>
                                <button className="toggle-btn" onClick={() => setViewMode('form')}>+ Add New Entry</button>
                            </div>
                            <ManualDataEntry batches={batchDeclarations} witnessedRecords={witnessedRecords} onSave={handleSaveWitness} activeContainer={activeContainer} onlyHistory={true} onDelete={handleDelete} />
                        </div>
                    )}
                    {viewMode === 'scada' && (
                        <div className="fade-in">
                            <h3>Raw SCADA Weight Feed</h3>
                            <WeightBatching onWitness={handleSaveWitness} batches={batchDeclarations} selectedBatchNo={selectedBatchNo} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BatchWeighment;

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useBatchStats } from '../../hooks/useStats';

// Components
import BatchStats from './components/BatchStats';
import BatchLogs from './components/BatchLogs';
import BatchScadaFeed from './components/BatchScadaFeed';
import BatchEntryForm from './components/BatchEntryForm';

/**
 * BatchWeighment Feature Module
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

const BatchWeighment = ({
    onBack,
    sharedState,
    activeContainer,
    displayMode = 'modal',
    showEntryForm: propsShowForm,
    setShowEntryForm: propsSetShowForm
}) => {
    const { batchDeclarations, setAllBatchDeclarations, witnessedRecords, setAllWitnessedRecords } = sharedState;
    const [viewMode, setViewMode] = useState('witnessed');
    const [localShowForm, setLocalShowForm] = useState(false);

    const showForm = propsShowForm !== undefined ? propsShowForm : localShowForm;
    const setShowForm = propsSetShowForm !== undefined ? propsSetShowForm : setLocalShowForm;

    const [selectedBatchNo, setSelectedBatchNo] = useState('');

    // Safety check for watchedRecords being an array
    const records = Array.isArray(witnessedRecords) ? witnessedRecords : [];
    const declarations = Array.isArray(batchDeclarations) ? batchDeclarations : [];

    const batchStats = useBatchStats(records, declarations, selectedBatchNo);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await apiService.getWitnessedRecords();
                const history = response?.responseData || [];
                if (history?.length > 0) setAllWitnessedRecords(history);
            } catch (e) {
                console.warn("History fetch failed, using local state.");
            }
        };
        loadHistory();
    }, [setAllWitnessedRecords]);

    const handleSaveWitness = async (record) => {
        try {
            await apiService.saveWitnessRecord(record);
        } catch (error) {
            console.warn("API unavailable, syncing locally.");
        }

        setAllWitnessedRecords(prev => {
            const currentRecords = Array.isArray(prev) ? prev : [];
            const exists = currentRecords.find(r => r.id === record.id);
            return exists ? currentRecords.map(r => r.id === record.id ? record : r) : [record, ...currentRecords];
        });
        alert('Record saved successfully.');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setAllWitnessedRecords(prev => Array.isArray(prev) ? prev.filter(r => r.id !== id) : []);
        }
    };

    const tabs = [
        { id: 'stats', label: 'Statistics', desc: 'View weight distribution and material consumption.' },
        { id: 'witnessed', label: 'Witnessed Logs', desc: 'Manage all witnessed batch declarations.' },
        { id: 'scada', label: 'Scada Data', desc: 'Raw SCADA feed for weight batching.' }
    ];

    const renderContent = () => {
        switch (viewMode) {
            case 'stats':
                return <BatchStats batchStats={batchStats} batchDeclarations={declarations} selectedBatchNo={selectedBatchNo} setSelectedBatchNo={setSelectedBatchNo} />;
            case 'witnessed':
                return <BatchLogs batchDeclarations={declarations} witnessedRecords={records} handleSaveWitness={handleSaveWitness} activeContainer={activeContainer} handleDelete={handleDelete} />;
            case 'scada':
                return <BatchScadaFeed handleSaveWitness={handleSaveWitness} batchDeclarations={declarations} selectedBatchNo={selectedBatchNo} />;
            default:
                return null;
        }
    };

    if (displayMode === 'inline') {
        return (
            <div className="batch-weighment-inline" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {tabs.map(tab => (
                            <BWSubCard
                                key={tab.id}
                                id={tab.id}
                                title={tab.label}
                                color={tab.id === 'stats' ? '#3b82f6' : tab.id === 'witnessed' ? '#10b981' : '#f59e0b'}
                                statusDetail={
                                    tab.id === 'stats' ? 'Live Monitoring' :
                                        tab.id === 'witnessed' ? `${records.length} Verified Entries` :
                                            'PLCs Connected'
                                }
                                isActive={viewMode === tab.id}
                                onClick={() => setViewMode(tab.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="inline-body" style={{ flexGrow: 1 }}>
                    {showForm && (
                        <BatchEntryForm
                            setShowForm={setShowForm}
                            batchDeclarations={declarations}
                            setBatchDeclarations={setAllBatchDeclarations}
                            witnessedRecords={records}
                            handleSaveWitness={handleSaveWitness}
                            activeContainer={activeContainer}
                            handleDelete={handleDelete}
                            selectedBatchNo={selectedBatchNo}
                        />
                    )}
                    {renderContent()}
                </div>
            </div>
        );
    }

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
                        <button className="toggle-btn" onClick={() => setShowForm(true)}>+ Add New Entry</button>
                    </div>
                </div>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
                    {showForm && (
                        <BatchEntryForm
                            setShowForm={setShowForm}
                            batchDeclarations={declarations}
                            setBatchDeclarations={setAllBatchDeclarations}
                            witnessedRecords={records}
                            handleSaveWitness={handleSaveWitness}
                            activeContainer={activeContainer}
                            handleDelete={handleDelete}
                            selectedBatchNo={selectedBatchNo}
                        />
                    )}
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default BatchWeighment;

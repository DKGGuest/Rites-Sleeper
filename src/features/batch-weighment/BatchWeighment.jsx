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
    const [selectedBatchNo, setSelectedBatchNo] = useState(batchDeclarations[0]?.batchNo || '601');

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
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1600px', width: '98%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Batch Weighment Control Console</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>SCADA Sync & Quality Assurance</p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Batch:</span>
                            <select
                                className="dash-select"
                                style={{ margin: 0, width: '100px' }}
                                value={selectedBatchNo}
                                onChange={(e) => setSelectedBatchNo(e.target.value)}
                            >
                                {batchDeclarations.map(b => <option key={b.batchNo} value={b.batchNo}>{b.batchNo}</option>)}
                            </select>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    <CollapsibleSection title="Initial Information (Batch Targets)" defaultOpen={false}>
                        <InitialDeclaration
                            batches={batchDeclarations}
                            onBatchUpdate={setBatchDeclarations}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="SCADA Data Fetched" defaultOpen={true}>
                        <WeightBatching
                            onWitness={handleSaveWitness}
                            batches={batchDeclarations}
                            selectedBatchNo={selectedBatchNo} // Pass selection for filtering
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="Scada Witness / Manual Data Entry" defaultOpen={true}>
                        <ManualDataEntry
                            batches={batchDeclarations}
                            witnessedRecords={witnessedRecords}
                            onSave={handleSaveWitness}
                            activeContainer={activeContainer}
                        // No hideHistory or onlyHistory means it shows both integrated
                        />
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
};

export default BatchWeighment;

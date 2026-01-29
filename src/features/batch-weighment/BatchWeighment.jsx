import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import InitialDeclaration from './components/InitialDeclaration';
import WeightBatching from './components/WeightBatching';
import ManualDataEntry from './components/ManualDataEntry';
import CollapsibleSection from '../../components/common/CollapsibleSection';

/**
 * BatchWeighment Feature Module
 * Orchestrates the 3-step weighment verification process:
 * 1. Initial configuration and sensor setup.
 * 2. Automated SCADA monitoring and witnessing.
 * 3. Manual entry and full history logging.
 */
const BatchWeighment = ({ onBack, sharedState }) => {
    const { batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords } = sharedState;
    const [activeSection, setActiveSection] = useState('declaration');

    useEffect(() => {
        const loadHistory = async () => {
            const history = await apiService.getWitnessedRecords();
            if (history?.length > 0) setWitnessedRecords(history);
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
            return exists ? prev.map(r => r.id === record.id ? record : r) : [...prev, record];
        });
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Batch Weighment System</h2>
                        <span className="badge-count" style={{ background: 'var(--primary-color)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem' }}>
                            {witnessedRecords.length} Verified
                        </span>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ background: '#f8fafc' }}>
                    <CollapsibleSection title="I. Initial Declaration & Sensor Setup">
                        <InitialDeclaration
                            batches={batchDeclarations}
                            onBatchUpdate={setBatchDeclarations}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="II. Real-time SCADA Monitoring" defaultOpen={false}>
                        <WeightBatching
                            onWitness={handleSaveWitness}
                            batches={batchDeclarations}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="III. Duty Master Log & Verification" defaultOpen={false}>
                        <ManualDataEntry
                            batches={batchDeclarations}
                            witnessedRecords={witnessedRecords}
                            onSave={handleSaveWitness}
                        />
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
};

export default BatchWeighment;

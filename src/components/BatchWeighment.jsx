import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import InitialDeclaration from './InitialDeclaration';
import WeightBatching from './WeightBatching';
import ManualDataEntry from './ManualDataEntry';

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => (
    <div className="collapsible-section" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
        <div
            className="section-header"
            onClick={onToggle}
            style={{
                padding: '1rem 1.5rem',
                background: isOpen ? 'rgba(33, 128, 141, 0.05)' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: isOpen ? '1px solid var(--border-color)' : 'none'
            }}
        >
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>{title}</h3>
            <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </div>
        {isOpen && (
            <div className="section-content" style={{ padding: '1.5rem' }}>
                {children}
            </div>
        )}
    </div>
);

const BatchWeighment = ({ onBack, sharedState }) => {
    const { batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords } = sharedState;
    const [activeSection, setActiveSection] = useState('declaration');

    useEffect(() => {
        const loadHistory = async () => {
            const history = await apiService.getWitnessedRecords();
            if (history && history.length > 0) {
                setWitnessedRecords(history);
            }
        };
        loadHistory();
    }, []);

    const toggleSection = (section) => {
        setActiveSection(prev => prev === section ? null : section);
    };

    const handleBatchUpdate = (updatedBatches) => {
        setBatchDeclarations(updatedBatches);
    };

    const handleSaveWitness = async (record) => {
        try {
            await apiService.saveWitnessRecord(record);
        } catch (error) {
            console.warn("API Offline, changes saved to local state only.");
        }

        setWitnessedRecords(prev => {
            const exists = prev.find(r => r.id === record.id);
            if (exists) {
                return prev.map(r => r.id === record.id ? record : r);
            }
            return [...prev, record];
        });
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Batch Weighment – Shift Duty</h2>
                        <span className="badge-count">{witnessedRecords.length} Witnessed</span>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ background: '#f8fafc' }}>
                    <CollapsibleSection
                        title="1. Initial Declaration (Sensors & Batch Set Values)"
                        isOpen={activeSection === 'declaration'}
                        onToggle={() => toggleSection('declaration')}
                    >
                        <InitialDeclaration
                            batches={batchDeclarations}
                            onBatchUpdate={handleBatchUpdate}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="2. SCADA Data Fetched (Recent Logs)"
                        isOpen={activeSection === 'scada'}
                        onToggle={() => toggleSection('scada')}
                    >
                        <WeightBatching onWitness={handleSaveWitness} batches={batchDeclarations} />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="3. SCADA Witness / Manual Data Entry"
                        isOpen={activeSection === 'manual'}
                        onToggle={() => toggleSection('manual')}
                    >
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

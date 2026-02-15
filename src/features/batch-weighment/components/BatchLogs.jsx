import React from 'react';
import ManualDataEntry from './ManualDataEntry';

const BatchLogs = ({ batchDeclarations, witnessedRecords, handleSaveWitness, activeContainer, handleDelete }) => {
    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Historical Witnessed Logs</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Manage all witnessed batch declarations.</p>
                </div>
            </div>
            <ManualDataEntry
                batches={batchDeclarations}
                witnessedRecords={witnessedRecords}
                onSave={handleSaveWitness}
                activeContainer={activeContainer}
                onDelete={handleDelete}
                onlyHistory={true}
            />
        </div>
    );
};

export default BatchLogs;

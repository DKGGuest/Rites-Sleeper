import React from 'react';
import WeightBatching from './WeightBatching';

const BatchScadaFeed = ({ handleSaveWitness, batchDeclarations, selectedBatchNo }) => {
    return (
        <div className="fade-in">
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Raw SCADA Weight Feed</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Raw SCADA feed for weight batching.</p>
            </div>
            <WeightBatching
                onWitness={handleSaveWitness}
                batches={batchDeclarations}
                selectedBatchNo={selectedBatchNo}
            />
        </div>
    );
};

export default BatchScadaFeed;

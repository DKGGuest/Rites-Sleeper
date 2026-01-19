import React from 'react';

const BatchWeighmentCard = ({ active, onClick }) => {
    return (
        <div className={`rm-card ${active ? 'active' : ''}`} onClick={onClick}>
            <div className="rm-card-title">
                Batch Weighment
            </div>
            <span className="rm-card-subtitle">SCADA & Manual Sync</span>
        </div>
    );
};

export default BatchWeighmentCard;

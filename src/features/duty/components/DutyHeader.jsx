import React from 'react';
import { useShift } from '../../../context/ShiftContext';
import DutyMetaInfo from './DutyMetaInfo';

const containerValues = {
    'Line': ['Line I', 'Line II', 'Line III', 'Line IV'],
    'Shed': ['Shed I', 'Shed II', 'Shed III', 'Shed IV']
};

const DutyHeader = ({ setShowContainerForm }) => {
    const {
        containers,
        activeContainerId,
        setActiveContainerId,
        setContainers,
        dutyDate,
        selectedShift,
        dutyUnit
    } = useShift();

    const handleDeleteContainer = (id, name, e) => {
        if (e) e.stopPropagation();
        if (containers.length <= 1) {
            alert("At least one Line or Shed must be active for duty.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            setContainers(prev => {
                const filtered = prev.filter(c => c.id !== id);
                if (activeContainerId === id) {
                    setActiveContainerId(filtered[0]?.id || null);
                }
                return filtered;
            });
        }
    };

    return (
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { target: 'Main Dashboard' } }))}
                    style={{
                        background: '#e2e8f0',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Back to Dashboard"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </button>
                <div>
                    <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#42818c', margin: '0 0 4px 0' }}>Sleeper Process Duty</h1>
                    <DutyMetaInfo />
                </div>
            </div>
        </header >
    );
};

export default DutyHeader;

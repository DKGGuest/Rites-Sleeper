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

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

                <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', gap: '6px', border: '1px solid #e2e8f0' }}>
                    {containers.map(c => (
                        <div key={c.id} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setActiveContainerId(c.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    border: activeContainerId === c.id ? '1px solid #42818c' : 'none',
                                    background: activeContainerId === c.id ? '#fff' : 'transparent',
                                    color: activeContainerId === c.id ? '#42818c' : '#64748b',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: activeContainerId === c.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {c.name}
                            </button>
                            <button
                                onClick={(e) => handleDeleteContainer(c.id, c.name, e)}
                                style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    color: '#ef4444',
                                    border: '1px solid #fee2e2',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    zIndex: 5
                                }}
                            >×</button>
                        </div>
                    ))}
                </div>
                <button className="btn-secondary" onClick={() => setShowContainerForm(true)} style={{ padding: '8px 12px', fontSize: '0.75rem' }}>+ Add</button>
            </div>
        </header >
    );
};

export default DutyHeader;

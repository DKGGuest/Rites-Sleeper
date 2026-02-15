import React, { useState } from 'react';
import { useShift } from '../../../context/ShiftContext';

const containerValues = {
    'Line': ['Line I', 'Line II', 'Line III', 'Line IV'],
    'Shed': ['Shed I', 'Shed II', 'Shed III', 'Shed IV']
};

const DutySetup = () => {
    const {
        setDutyStarted,
        containers,
        setContainers,
        activeContainerId,
        setActiveContainerId,
        activeContainer
    } = useShift();

    const [showContainerForm, setShowContainerForm] = useState(false);
    const [newContainer, setNewContainer] = useState({ type: '', value: '' });
    const [containerToDelete, setContainerToDelete] = useState(null);

    const handleAddContainer = () => {
        if (!newContainer.type || !newContainer.value) {
            alert("Please select both Type and Identity.");
            return;
        }
        const id = Date.now();
        setContainers(prev => [...prev, { id, type: newContainer.type, name: newContainer.value }]);
        setActiveContainerId(id);
        setShowContainerForm(false);
        setNewContainer({ type: '', value: '' });
    };

    const handleDeleteContainer = (id, name, e) => {
        if (e) e.stopPropagation();
        if (containers.length <= 1) {
            alert("At least one Line or Shed must be active for duty.");
            return;
        }
        setContainerToDelete({ id, name });
    };

    return (
        <div className="duty-welcome-screen app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', background: '#f8fafc' }}>
            <div className="duty-welcome-card" style={{ maxWidth: '440px', width: '92%', padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 'var(--fs-lg)', marginBottom: '0.75rem', fontWeight: '900', color: '#42818c', textTransform: 'uppercase', letterSpacing: '3px' }}>Shift Log</div>
                <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#42818c', margin: '0 0 8px 0' }}>Sleeper Process Duty</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 'var(--fs-sm)' }}>Real-time production monitoring and quality control</p>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: 'var(--fs-xs)', fontWeight: '500' }}>Confirm your working line or shed to initialize today's duty</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '2rem' }}>
                    {containers.map(c => (
                        <div key={c.id} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setActiveContainerId(c.id)}
                                className="hover-lift"
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    border: activeContainerId === c.id ? '2px solid #42818c' : '1px solid #e2e8f0',
                                    background: activeContainerId === c.id ? '#f0f9fa' : '#fff',
                                    color: activeContainerId === c.id ? '#42818c' : '#64748b',
                                    fontSize: 'var(--fs-xs)',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    minWidth: '100px',
                                    boxShadow: activeContainerId === c.id ? '0 4px 6px -1px rgba(66, 129, 140, 0.1)' : 'none'
                                }}
                            >
                                {c.name}
                            </button>
                            <button
                                onClick={(e) => handleDeleteContainer(c.id, c.name, e)}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    width: '18px',
                                    height: '18px',
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
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >×</button>
                        </div>
                    ))}
                    {!showContainerForm && (
                        <button
                            onClick={() => setShowContainerForm(true)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px dashed #cbd5e1',
                                background: '#f8fafc',
                                color: '#64748b',
                                fontSize: 'var(--fs-xs)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >+ New</button>
                    )}
                </div>

                {showContainerForm && (
                    <div className="fade-in" style={{
                        background: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        marginBottom: '2rem',
                        border: '1px solid #e2e8f0',
                        textAlign: 'left',
                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Type</label>
                                <select
                                    value={newContainer.type}
                                    onChange={e => setNewContainer({ ...newContainer, type: e.target.value, value: containerValues[e.target.value][0] })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Line">Line</option>
                                    <option value="Shed">Shed</option>
                                </select>
                            </div>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Identity</label>
                                <select
                                    value={newContainer.value}
                                    onChange={e => setNewContainer({ ...newContainer, value: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                                >
                                    <option value="">Select Identity</option>
                                    {newContainer.type && containerValues[newContainer.type].map(val => <option key={val} value={val}>{val}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="toggle-btn" style={{ flex: 2, padding: '12px', fontSize: 'var(--fs-xs)', fontWeight: '800' }} onClick={handleAddContainer}>Add Now</button>
                            <button className="toggle-btn secondary" style={{ flex: 1, padding: '12px', fontSize: 'var(--fs-xs)', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: '800' }} onClick={() => setShowContainerForm(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <button
                    className="toggle-btn hover-lift"
                    style={{ width: '100%', padding: '1rem', fontSize: 'var(--fs-sm)', fontWeight: '900', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    onClick={() => {
                        if (!activeContainerId) alert("Please select a line or shed to continue.");
                        else setDutyStarted(true);
                    }}
                >
                    Start Duty {activeContainer ? `for ${activeContainer.name}` : ''}
                </button>
            </div>
        </div>
    );
};

export default DutySetup;

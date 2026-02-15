import React, { useState } from 'react';
import { useShift } from '../../../context/ShiftContext';

const containerValues = {
    'Line': ['Line I', 'Line II', 'Line III', 'Line IV'],
    'Shed': ['Shed I', 'Shed II', 'Shed III', 'Shed IV']
};

const ContainerForm = ({ onClose }) => {
    const { setContainers, setActiveContainerId } = useShift();
    const [newContainer, setNewContainer] = useState({ type: '', value: '' });

    const handleAddContainer = () => {
        if (!newContainer.type || !newContainer.value) {
            alert("Please select both Type and Identity.");
            return;
        }
        const id = Date.now();
        setContainers(prev => [...prev, { id, type: newContainer.type, name: newContainer.value }]);
        setActiveContainerId(id);
        onClose();
        setNewContainer({ type: '', value: '' });
    };

    return (
        <div className="container-form-overlay" style={{
            marginBottom: '2rem',
            padding: '1.25rem',
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.3s ease-in-out'
        }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add New Shed or Line</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-field" style={{ margin: 0, flex: '1 1 140px' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Select Type</label>
                    <select
                        value={newContainer.type}
                        onChange={e => setNewContainer({ ...newContainer, type: e.target.value, value: containerValues[e.target.value] ? containerValues[e.target.value][0] : '' })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                    >
                        <option value="">Select Type</option>
                        <option value="Line">Line</option>
                        <option value="Shed">Shed</option>
                    </select>
                </div>
                <div className="form-field" style={{ margin: 0, flex: '1 1 140px' }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Select Specific</label>
                    <select
                        value={newContainer.value}
                        onChange={e => setNewContainer({ ...newContainer, value: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: 'var(--fs-xs)', fontWeight: '600' }}
                    >
                        <option value="">Select Identity</option>
                        {newContainer.type && containerValues[newContainer.type].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', flex: '2 1 200px' }}>
                    <button className="toggle-btn" style={{ flex: 1, padding: '10px', fontSize: 'var(--fs-xs)' }} onClick={handleAddContainer}>Add Now</button>
                    <button className="toggle-btn secondary" style={{ flex: 1, padding: '10px', fontSize: 'var(--fs-xs)', background: '#94a3b8' }} onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ContainerForm;

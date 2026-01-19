import React, { useState, useEffect } from 'react';

const ManualChecks = ({ onBack, onAlertChange }) => {
    const [activeTab, setActiveTab] = useState('mould'); // 'mould', 'hts', 'demoulding'
    const [entries, setEntries] = useState({ mouldPrep: [], htsWire: [], demoulding: [] });
    const [alerts, setAlerts] = useState({ mouldPrep: true, htsWire: true, demoulding: true });

    useEffect(() => {
        const currentHour = new Date().getHours();
        const checkAlert = (subModuleEntries) => {
            if (subModuleEntries.length === 0) return true;
            // Check if any entry was made in the current hour
            return !subModuleEntries.some(e => new Date(e.timestamp).getHours() === currentHour);
        };
        const newAlerts = {
            mouldPrep: checkAlert(entries.mouldPrep),
            htsWire: checkAlert(entries.htsWire),
            demoulding: checkAlert(entries.demoulding)
        };
        setAlerts(newAlerts);
        onAlertChange(Object.values(newAlerts).some(a => a));
    }, [entries, onAlertChange]);

    const handleAddEntry = (type, data) => {
        const timestamp = data.time ? new Date().toISOString().split('T')[0] + 'T' + data.time + ':00Z' : new Date().toISOString();
        setEntries(prev => ({
            ...prev,
            [type]: [...prev[type], { ...data, timestamp }]
        }));
    };

    const tabs = [
        { id: 'mould', label: 'Mould Preparation', key: 'mouldPrep' },
        { id: 'hts', label: 'Placement of HTS Wire', key: 'htsWire' },
        { id: 'demoulding', label: 'Demoulding of Sleepers', key: 'demoulding' }
    ];

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Manual Shift Checks</h2>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <nav className="modal-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`modal-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ position: 'relative' }}
                        >
                            {tab.label}
                            {alerts[tab.key] && (
                                <span className="badge-count" style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>!</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="modal-body">
                    {activeTab === 'mould' && (
                        <MouldPrepForm onSave={d => handleAddEntry('mouldPrep', d)} isAlert={alerts.mouldPrep} />
                    )}
                    {activeTab === 'hts' && (
                        <HTSWireForm onSave={d => handleAddEntry('htsWire', d)} isAlert={alerts.htsWire} />
                    )}
                    {activeTab === 'demoulding' && (
                        <DemouldingForm onSave={d => handleAddEntry('demoulding', d)} isAlert={alerts.demoulding} />
                    )}

                    <div className="data-table-section">
                        <div className="table-title-bar">Shift History: {tabs.find(t => t.id === activeTab).label}</div>
                        <table className="ui-table">
                            <thead>
                                {activeTab === 'mould' ? (
                                    <tr><th>Time</th><th>Bench</th><th>Lumps Free</th><th>Oil Applied</th><th>Remarks</th></tr>
                                ) : activeTab === 'hts' ? (
                                    <tr><th>Time</th><th>Bench</th><th>Sleeper Type</th><th>Wires Used</th><th>Dia (mm)</th><th>Remarks</th></tr>
                                ) : (
                                    <tr><th>Time</th><th>Bench</th><th>Sleeper Type</th><th>Visual</th><th>Dim.</th><th>Remarks</th></tr>
                                )}
                            </thead>
                            <tbody>
                                {entries[tabs.find(t => t.id === activeTab).key]
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .map((e, idx) => (
                                        <tr key={idx}>
                                            <td data-label="Time"><span>{e.time}</span></td>
                                            <td data-label="Bench"><span>{e.benchNo}</span></td>
                                            {activeTab === 'mould' && (
                                                <>
                                                    <td data-label="Lumps Free"><span>{e.lumpsFree ? '✅' : '❌'}</span></td>
                                                    <td data-label="Oil Applied"><span>{e.oilApplied ? '✅' : '❌'}</span></td>
                                                    <td data-label="Remarks"><span>{e.remarks}</span></td>
                                                </>
                                            )}
                                            {activeTab === 'hts' && (
                                                <>
                                                    <td data-label="Sleeper Type"><span>{e.sleeperType}</span></td>
                                                    <td data-label="Wires Used"><span>{e.wiresUsed}</span></td>
                                                    <td data-label="Dia (mm)" style={{ color: (parseFloat(e.wireDia) < 2.97 || parseFloat(e.wireDia) > 3.03) ? 'red' : 'inherit' }}>
                                                        <span>{e.wireDia}</span>
                                                    </td>
                                                    <td data-label="Remarks"><span>{e.remarks}</span></td>
                                                </>
                                            )}
                                            {activeTab === 'demoulding' && (
                                                <>
                                                    <td data-label="Sleeper Type"><span>{e.sleeperType}</span></td>
                                                    <td data-label="Visual" style={{ color: e.visualCheck === 'Not OK' ? 'red' : 'green' }}><span>{e.visualCheck} {e.visualDefect ? `(${e.visualDefect})` : ''}</span></td>
                                                    <td data-label="Dim." style={{ color: e.dimCheck === 'Not OK' ? 'red' : 'green' }}><span>{e.dimCheck} {e.dimDefect ? `(${e.dimDefect})` : ''}</span></td>
                                                    <td data-label="Remarks"><span>{e.remarks}</span></td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                {entries[tabs.find(t => t.id === activeTab).key].length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>No records found for this section.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- SUB-FORM COMPONENTS --- */

const MouldPrepForm = ({ onSave, isAlert }) => {
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        lumpsFree: false,
        oilApplied: false,
        remarks: ''
    });

    return (
        <div className="form-container">
            <div className="form-section-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Mould Preparation Details</h3>
                </div>
            </div>
            <div className="form-grid">
                <div className="form-field">
                    <label>Time <span className="required">*</span></label>
                    <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Bench No. <span className="required">*</span></label>
                    <input type="number" placeholder="Enter Bench Integer" value={formData.benchNo} onChange={e => setFormData({ ...formData, benchNo: e.target.value })} />
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label>Quality Checks</label>
                    <div style={{ display: 'flex', gap: '2.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={formData.lumpsFree} onChange={e => setFormData({ ...formData, lumpsFree: e.target.checked })} />
                            Free from Concrete Lumps
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={formData.oilApplied} onChange={e => setFormData({ ...formData, oilApplied: e.target.checked })} />
                            Mould Oil Applied
                        </label>
                    </div>
                </div>
                <div className="form-field">
                    <label>Remarks</label>
                    <input type="text" placeholder="Enter string remarks" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </div>
            </div>
            <button className="toggle-btn" onClick={() => { onSave(formData); setFormData({ ...formData, benchNo: '', remarks: '' }); }}>Save Entry</button>
        </div>
    );
};

const HTSWireForm = ({ onSave, isAlert }) => {
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        sleeperType: '',
        wiresUsed: '',
        satisfactory: false,
        wireDia: '',
        remarks: ''
    });

    // Auto-fetch Sleeper Type simulation based on Bench No
    useEffect(() => {
        if (formData.benchNo) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            setFormData(prev => ({ ...prev, sleeperType: types[parseInt(formData.benchNo) % 3] }));
        } else {
            setFormData(prev => ({ ...prev, sleeperType: '' }));
        }
    }, [formData.benchNo]);

    return (
        <div className="form-container">
            <div className="form-section-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Placement of HTS Wire</h3>
                </div>
            </div>
            <div className="form-grid">
                <div className="form-field">
                    <label>Time <span className="required">*</span></label>
                    <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Bench No. <span className="required">*</span></label>
                    <input type="number" placeholder="Enter Bench No" value={formData.benchNo} onChange={e => setFormData({ ...formData, benchNo: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Type of Sleeper (Auto)</label>
                    <input type="text" readOnly value={formData.sleeperType} style={{ background: '#f8fafc', color: '#64748b' }} placeholder="Auto-populated" />
                </div>
                <div className="form-field">
                    <label>No. of Wires Used <span className="required">*</span></label>
                    <input type="number" placeholder="Integer" value={formData.wiresUsed} onChange={e => setFormData({ ...formData, wiresUsed: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>HTS Wire Dia (mm) <span className="required">*</span></label>
                    <input type="number" step="0.01" placeholder="Float (e.g. 3.00)" value={formData.wireDia} onChange={e => setFormData({ ...formData, wireDia: e.target.value })} />
                    <span className="helper-text" style={{ color: (formData.wireDia && (parseFloat(formData.wireDia) < 2.97 || parseFloat(formData.wireDia) > 3.03)) ? 'red' : 'inherit' }}>
                        Required Range: 2.97 - 3.03 mm
                    </span>
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label>Placement Satisfactory?</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                        <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={formData.satisfactory} onChange={e => setFormData({ ...formData, satisfactory: e.target.checked })} />
                        Check if placement is OK
                    </label>
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label>Remarks</label>
                    <input type="text" placeholder="String" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </div>
            </div>
            <button className="toggle-btn" onClick={() => { onSave(formData); setFormData({ ...formData, benchNo: '', wiresUsed: '', wireDia: '', remarks: '' }); }}>Save Entry</button>
        </div>
    );
};

const DemouldingForm = ({ onSave, isAlert }) => {
    const [formData, setFormData] = useState({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        benchNo: '',
        sleeperType: '',
        processSatisfactory: false,
        visualCheck: 'Ok',
        visualDefect: '',
        dimCheck: 'Ok',
        dimDefect: '',
        remarks: ''
    });

    useEffect(() => {
        if (formData.benchNo) {
            const types = ['RT-1234', 'RT-5678', 'RT-9012'];
            setFormData(prev => ({ ...prev, sleeperType: types[parseInt(formData.benchNo) % 3] }));
        } else {
            setFormData(prev => ({ ...prev, sleeperType: '' }));
        }
    }, [formData.benchNo]);

    return (
        <div className="form-container">
            <div className="form-section-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Demoulding of Sleepers</h3>
                </div>
            </div>
            <div className="form-grid">
                <div className="form-field">
                    <label>Time <span className="required">*</span></label>
                    <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Bench No. <span className="required">*</span></label>
                    <input type="number" placeholder="Enter Bench No" value={formData.benchNo} onChange={e => setFormData({ ...formData, benchNo: e.target.value })} />
                </div>
                <div className="form-field">
                    <label>Type of Sleeper (Auto)</label>
                    <input type="text" readOnly value={formData.sleeperType} style={{ background: '#f8fafc', color: '#64748b' }} placeholder="Auto-populated" />
                </div>
                <div className="form-field" style={{ gridColumn: formData.visualCheck === 'Not OK' ? 'auto' : 'span 2' }}>
                    <label>Process Satisfactory?</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', cursor: 'pointer', fontWeight: '500' }}>
                        <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={formData.processSatisfactory} onChange={e => setFormData({ ...formData, processSatisfactory: e.target.checked })} />
                        Demoulding Process OK
                    </label>
                </div>

                {/* Visual Check and Conditional Defect */}
                <div className="form-field">
                    <label>Visual Check <span className="required">*</span></label>
                    <select value={formData.visualCheck} onChange={e => setFormData({ ...formData, visualCheck: e.target.value, visualDefect: e.target.value === 'Ok' ? '' : formData.visualDefect })}>
                        <option value="Ok">Ok</option>
                        <option value="Not OK">Not OK</option>
                    </select>
                </div>
                {formData.visualCheck === 'Not OK' && (
                    <div className="form-field">
                        <label>Visual Defect <span className="required">*</span></label>
                        <select value={formData.visualDefect} onChange={e => setFormData({ ...formData, visualDefect: e.target.value })}>
                            <option value="">Select Defect</option>
                            <option value="Cracks">Cracks</option>
                            <option value="Honey Combing">Honey Combing</option>
                            <option value="Chipping">Chipping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                )}

                {/* Dimensional Check and Conditional Defect */}
                <div className="form-field">
                    <label>Dimensional Check <span className="required">*</span></label>
                    <select value={formData.dimCheck} onChange={e => setFormData({ ...formData, dimCheck: e.target.value, dimDefect: e.target.value === 'Ok' ? '' : formData.dimDefect })}>
                        <option value="Ok">Ok</option>
                        <option value="Not OK">Not OK</option>
                    </select>
                </div>
                {formData.dimCheck === 'Not OK' && (
                    <div className="form-field">
                        <label>Dimensional Defect <span className="required">*</span></label>
                        <select value={formData.dimDefect} onChange={e => setFormData({ ...formData, dimDefect: e.target.value })}>
                            <option value="">Select Defect</option>
                            <option value="Length deviation">Length deviation</option>
                            <option value="Width deviation">Width deviation</option>
                            <option value="Height deviation">Height deviation</option>
                        </select>
                    </div>
                )}

                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                    <label>Remarks <span className="required">*</span></label>
                    <input type="text" placeholder="String" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                </div>
            </div>
            <button className="toggle-btn" onClick={() => { onSave(formData); setFormData({ ...formData, benchNo: '', visualDefect: '', dimDefect: '', remarks: '' }); }}>Save Entry</button>
        </div>
    );
};

export default ManualChecks;

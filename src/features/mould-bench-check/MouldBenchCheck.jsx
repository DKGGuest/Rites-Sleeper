import React, { useState } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';

const MouldBenchCheck = ({ onBack }) => {
    // Form State with Initial Information
    const [formState, setFormState] = useState({
        // Initial Information
        batchNo: '',
        dateOfCasting: new Date().toISOString().split('T')[0],
        sleeperType: '',
        totalSleepers: '',
        sleeperNumbers: '',

        // Checking Results
        visual: 'all-ok',
        visualRejections: {},
        dimension: 'all-ok',
        dimensionRejections: {},
        ftc: 'all-ok',
        ftcRejections: {}
    });

    const visualRejectionOptions = [
        'Rail Seat Damage (LT)',
        'Rail Seat Damage (RT)'
    ];

    const dimensionRejectionOptions = [
        'Outer Gauge',
        'Rail Seat (LT)',
        'Rail Seat (RT)'
    ];

    const handleFormChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckingChange = (checkType, value) => {
        setFormState(prev => ({
            ...prev,
            [checkType]: value,
            [`${checkType}Rejections`]: value === 'all-ok' ? {} : prev[`${checkType}Rejections`]
        }));
    };

    const handleRejectionChange = (checkType, sleeperNo, reason) => {
        setFormState(prev => ({
            ...prev,
            [`${checkType}Rejections`]: {
                ...prev[`${checkType}Rejections`],
                [sleeperNo]: reason
            }
        }));
    };

    const handleSave = () => {
        console.log('Saving form:', formState);
        alert('Checking record saved successfully!');
        onBack();
    };

    const getSleeperArray = () => {
        if (!formState.sleeperNumbers) return [];
        return formState.sleeperNumbers.split(',').map(s => s.trim()).filter(Boolean);
    };

    const renderRejectionInputs = (checkType, options) => {
        const sleepers = getSleeperArray();
        const rejections = formState[`${checkType}Rejections`] || {};

        if (formState[checkType] === 'all-ok') return null;

        return (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <h5 style={{ margin: '0 0 1rem 0', color: '#dc2626', fontSize: '0.9rem' }}>Rejection Details</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {sleepers.map(sleeperNo => (
                        <div key={sleeperNo} className="form-field">
                            <label>Sleeper {sleeperNo} - Reason</label>
                            {options ? (
                                <select
                                    value={rejections[sleeperNo] || ''}
                                    onChange={(e) => handleRejectionChange(checkType, sleeperNo, e.target.value)}
                                >
                                    <option value="">Select reason...</option>
                                    {options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Enter reason"
                                    value={rejections[sleeperNo] || ''}
                                    onChange={(e) => handleRejectionChange(checkType, sleeperNo, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1400px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Mould & Bench Checking</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Quality Assurance & Asset Integrity</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>

                <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    {/* Initial Information Section - Sleek Dashboard Card Style */}
                    <div style={{ marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Batch Number</span>
                                <input
                                    type="text"
                                    value={formState.batchNo}
                                    onChange={(e) => handleFormChange('batchNo', e.target.value)}
                                    placeholder="Enter..."
                                    style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', background: 'transparent', border: 'none', borderBottom: '1px dashed #cbd5e1', padding: '0', width: '100%', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Date of Casting</span>
                                <input
                                    type="date"
                                    value={formState.dateOfCasting}
                                    onChange={(e) => handleFormChange('dateOfCasting', e.target.value)}
                                    style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', background: 'transparent', border: 'none', borderBottom: '1px dashed #cbd5e1', padding: '0', width: '100%', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Sleeper Type</span>
                                <select
                                    value={formState.sleeperType}
                                    onChange={(e) => handleFormChange('sleeperType', e.target.value)}
                                    style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', background: 'transparent', border: 'none', borderBottom: '1px dashed #cbd5e1', padding: '0', width: '100%', outline: 'none', appearance: 'none' }}
                                >
                                    <option value="" style={{ fontSize: '1rem' }}>Select...</option>
                                    <option value="RT-1234" style={{ fontSize: '1rem' }}>RT-1234</option>
                                    <option value="RT-5678" style={{ fontSize: '1rem' }}>RT-5678</option>
                                    <option value="RT-9012" style={{ fontSize: '1rem' }}>RT-9012</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>Total Sleepers Casted</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <input
                                        type="number"
                                        value={formState.totalSleepers}
                                        onChange={(e) => handleFormChange('totalSleepers', e.target.value)}
                                        placeholder="0"
                                        style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', background: 'transparent', border: 'none', borderBottom: '1px dashed #cbd5e1', padding: '0', maxWidth: '80px', outline: 'none' }}
                                    />
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: '#64748b' }}>Nos</span>
                                </div>
                            </div>
                        </div>

                        {/* Sleeper Selection Grid (Visual only as per request) */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'block' }}>
                                Available Sleepers (Batch {formState.batchNo || '...'})
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {getSleeperArray().length > 0 ? (
                                    getSleeperArray().map(num => (
                                        <div key={num} style={{
                                            padding: '6px 12px',
                                            background: '#fff',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            color: '#475569',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            {num}
                                        </div>
                                    ))
                                ) : (
                                    <input
                                        type="text"
                                        value={formState.sleeperNumbers}
                                        onChange={(e) => handleFormChange('sleeperNumbers', e.target.value)}
                                        placeholder="Enter sleeper numbers separated by comma (e.g. 1, 2, 3)"
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Visual Checking Section */}
                    <CollapsibleSection title="Visual Checking" defaultOpen={true}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className="form-field">
                                <label>Visual Inspection Result <span className="required">*</span></label>
                                <select
                                    value={formState.visual}
                                    onChange={(e) => handleCheckingChange('visual', e.target.value)}
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                >
                                    <option value="all-ok">All OK</option>
                                    <option value="partial-ok">Partial OK</option>
                                    <option value="all-rejected">All Rejected</option>
                                </select>
                            </div>

                            {renderRejectionInputs('visual', visualRejectionOptions)}
                        </div>
                    </CollapsibleSection>

                    {/* Dimension Checking Section */}
                    <CollapsibleSection title="Dimension Checking" defaultOpen={true}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className="form-field">
                                <label>Dimension Inspection Result <span className="required">*</span></label>
                                <select
                                    value={formState.dimension}
                                    onChange={(e) => handleCheckingChange('dimension', e.target.value)}
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                >
                                    <option value="all-ok">All OK</option>
                                    <option value="partial-ok">Partial OK</option>
                                    <option value="all-rejected">All Rejected</option>
                                </select>
                            </div>

                            {renderRejectionInputs('dimension', dimensionRejectionOptions)}
                        </div>
                    </CollapsibleSection>

                    {/* FTC Checking Section */}
                    <CollapsibleSection title="FTC (Fit to Cast) Checking" defaultOpen={true}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className="form-field">
                                <label>FTC Inspection Result <span className="required">*</span></label>
                                <select
                                    value={formState.ftc}
                                    onChange={(e) => handleCheckingChange('ftc', e.target.value)}
                                    style={{ fontSize: '1rem', padding: '0.75rem' }}
                                >
                                    <option value="all-ok">All OK</option>
                                    <option value="partial-ok">Partial OK</option>
                                    <option value="all-rejected">All Rejected</option>
                                </select>
                            </div>

                            {renderRejectionInputs('ftc', null)}
                        </div>
                    </CollapsibleSection>

                    {/* Action Buttons */}
                    <div className="form-actions-center" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0' }}>
                        <button className="toggle-btn" onClick={handleSave}>Save Checking Record</button>
                        <button className="toggle-btn secondary" onClick={onBack} style={{ marginLeft: '1rem' }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MouldBenchCheck;

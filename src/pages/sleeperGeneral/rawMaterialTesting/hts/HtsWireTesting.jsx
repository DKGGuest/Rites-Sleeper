import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/common/EnhancedDataTable';
import { MOCK_HTS_HISTORY, MOCK_INVENTORY, MOCK_VERIFIED_CONSIGNMENTS } from '../../../../utils/rawMaterialMockData';

import '../cement/CementForms.css';

const HtsWireTesting = ({ onBack }) => {
    const [showForm, setShowForm] = useState(false);
    const [history, setHistory] = useState(MOCK_HTS_HISTORY);
    const [availableCoils] = useState(MOCK_INVENTORY.HTS || []);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            testDate: new Date().toISOString().split('T')[0],
            consignmentNo: '',
            coilNo: '',
            inventoryId: '',
            nominalWeight: '',
            layLength: '',
            strandDiameter: ''
        }
    });

    const selectedCoilNo = watch('coilNo');

    // Auto-fill Inventory ID based on Coil No.
    useEffect(() => {
        const coil = availableCoils.find(c => c.coilNo === selectedCoilNo);
        if (coil) {
            setValue('inventoryId', coil.id);
        } else {
            setValue('inventoryId', '');
        }
    }, [selectedCoilNo, availableCoils, setValue]);

    const historyColumns = [
        { key: 'testDate', label: 'Date of Testing' },
        { key: 'consignmentNo', label: 'Consignment No.' },
        { key: 'coilNo', label: 'Coil No.' },
        { key: 'inventoryId', label: 'Inventory ID' },
        { key: 'nominalWeight', label: 'Nominal Weight' },
        { key: 'layLength', label: 'Lay Length' },
        { key: 'strandDiameter', label: 'Strand Diameter' }
    ];

    const onSubmit = (data) => {
        // Data Rule: Prevent >3 records for same Coil No. on same date
        const readingsToday = history.filter(h => h.testDate === data.testDate && h.coilNo === data.coilNo);

        if (readingsToday.length >= 3) {
            alert(`Maximum of 3 readings allowed for Coil ${data.coilNo} on ${data.testDate}.`);
            return;
        }

        const newRecord = {
            id: history.length + 1,
            ...data
        };

        setHistory([newRecord, ...history]);
        setShowForm(false);
        reset();
    };

    return (
        <div className="hts-testing-root cement-forms-scope">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#101828' }}>HTS Wire Testing (Daily Mandatory)</h2>
                {!showForm && (
                    <button
                        className="btn-save"
                        style={{ width: 'auto', padding: '0 16px' }}
                        onClick={() => setShowForm(true)}
                    >
                        + New Test Record
                    </button>
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => { setShowForm(false); reset(); }}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">New HTS Wire Test Record</span>
                            <button className="form-modal-close" onClick={() => { setShowForm(false); reset(); }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="form-modal-body">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Date of Testing <span className="required">*</span></label>
                                        <input
                                            type="date"
                                            {...register('testDate', { required: 'Date is required' })}
                                        />
                                        {errors.testDate && <span className="hint-text" style={{ color: 'red' }}>{errors.testDate.message}</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>Consignment No. <span className="required">*</span></label>
                                        <select {...register('consignmentNo', { required: 'Required' })}>
                                            <option value="">Select Consignment</option>
                                            {MOCK_VERIFIED_CONSIGNMENTS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        {errors.consignmentNo && <span className="hint-text" style={{ color: 'red' }}>{errors.consignmentNo.message}</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>Coil No. <span className="required">*</span></label>
                                        <select {...register('coilNo', { required: 'Coil No. is required' })}>
                                            <option value="">Select Coil</option>
                                            {availableCoils.map(c => (
                                                <option key={c.id} value={c.coilNo}>{c.coilNo}</option>
                                            ))}
                                        </select>
                                        {errors.coilNo && <span className="hint-text" style={{ color: 'red' }}>{errors.coilNo.message}</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>Inventory ID</label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="readOnly"
                                            {...register('inventoryId')}
                                            placeholder="Auto-filled"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Nominal Weight <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            {...register('nominalWeight', {
                                                required: 'Required',
                                                min: { value: 0.001, message: 'Must be positive' }
                                            })}
                                            placeholder="Enter weight"
                                        />
                                        {errors.nominalWeight && <span className="hint-text" style={{ color: 'red' }}>{errors.nominalWeight.message}</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>Lay Length <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('layLength', {
                                                required: 'Required',
                                                min: { value: 0.01, message: 'Must be positive' }
                                            })}
                                            placeholder="Enter lay length"
                                        />
                                        {errors.layLength && <span className="hint-text" style={{ color: 'red' }}>{errors.layLength.message}</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>Strand Diameter <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('strandDiameter', {
                                                required: 'Required',
                                                min: { value: 0.01, message: 'Must be positive' }
                                            })}
                                            placeholder="Enter diameter"
                                        />
                                        {errors.strandDiameter && <span className="hint-text" style={{ color: 'red' }}>{errors.strandDiameter.message}</span>}
                                    </div>
                                </div>

                                <div className="form-modal-footer" style={{ borderTop: 'none', padding: '24px 0 0' }}>
                                    <button type="submit" className="btn-save">Save Test</button>
                                    <button
                                        type="button"
                                        className="btn-save"
                                        style={{ background: '#64748b' }}
                                        onClick={() => { setShowForm(false); reset(); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="history-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h4 style={{ color: '#475467', margin: 0, fontSize: '16px' }}>Historical Quality Logs</h4>
                </div>
                <EnhancedDataTable
                    columns={historyColumns}
                    data={history}
                    emptyMessage="No HTS test records found."
                />
            </div>
        </div>
    );
};

export default HtsWireTesting;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import EnhancedDataTable from '../../../../components/EnhancedDataTable';
import { MOCK_WATER_HISTORY } from '../../../../utils/rawMaterialMockData';
import '../cement/CementForms.css';

const WaterTesting = () => {
    const [showForm, setShowForm] = useState(false);
    const [history, setHistory] = useState(MOCK_WATER_HISTORY);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            testDate: new Date().toISOString().split('T')[0],
            phValue: '',
            tdsResult: ''
        }
    });

    const onSubmit = (data) => {
        const newRecord = {
            id: history.length + 1,
            testDate: data.testDate,
            ph: data.phValue,
            tds: `${data.tdsResult} ppm`
        };
        setHistory([newRecord, ...history]);
        setShowForm(false);
        reset();
    };

    const historyColumns = [
        { key: 'testDate', label: 'Date of Testing' },
        { key: 'ph', label: 'PH Value' },
        { key: 'tds', label: 'TDS Result' }
    ];

    return (
        <div className="water-testing-root cement-forms-scope">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#101828' }}>Water Quality Testing</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-save" style={{ width: 'auto', background: '#059669' }}>Export PDF</button>
                    <button className="btn-save" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>+ New Water Test</button>
                </div>
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">New Water Quality Test</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
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
                                        <label>pH Value Test <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('phValue', {
                                                required: 'pH value is required',
                                                min: { value: 0, message: 'Min 0' },
                                                max: { value: 14, message: 'Max 14' }
                                            })}
                                            placeholder="Enter pH value"
                                        />
                                        <span className="hint-text">Typical range: 0–14</span>
                                        {errors.phValue && <span className="hint-text" style={{ color: 'red' }}>{errors.phValue.message}</span>}
                                    </div>

                                    <div className="input-group">
                                        <label>TDS Test <span className="required">*</span></label>
                                        <input
                                            type="number"
                                            {...register('tdsResult', {
                                                required: 'TDS result is required',
                                                validate: value => Number.isInteger(Number(value)) || 'Whole numbers only'
                                            })}
                                            placeholder="Enter TDS"
                                        />
                                        <span className="hint-text">ppm</span>
                                        {errors.tdsResult && <span className="hint-text" style={{ color: 'red' }}>{errors.tdsResult.message}</span>}
                                    </div>
                                </div>

                                <div className="form-modal-footer" style={{ borderTop: 'none', padding: '24px 0 0', background: 'transparent' }}>
                                    <button type="submit" className="btn-save">Submit Result</button>
                                    <button type="button" className="btn-save" style={{ background: '#64748b' }} onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#475467', fontSize: '15px' }}>Historical Quality Logs</h4>
                </div>
                <EnhancedDataTable columns={historyColumns} data={history} />
            </div>
        </div>
    );
};

export default WaterTesting;

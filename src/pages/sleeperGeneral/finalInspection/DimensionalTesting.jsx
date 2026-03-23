import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import { useShift } from '../../../context/ShiftContext';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import VisualInspectionForm from './VisualInspectionForm';
import CriticalDimensionForm from './CriticalDimensionForm';
import NonCriticalDimensionForm from './NonCriticalDimensionForm';

const DimensionalTesting = ({ type }) => {
    const { selectedShift } = useShift();
    const [showForm, setShowForm] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchDetails, setBatchDetails] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const data = await apiService.getFinalInspectionBatches();
            
            // Recalculate tested percentage properly: (Accepted + Rejected) / Total * 100
            // The percentage should reflect everything that is NOT 'PENDING'
            const processedData = (data || []).map(batch => {
                const total = Number(batch.noOfSleepers) || Number(batch.totalBatchQty) || (batch.sleepers?.length) || 1;
                
                let testedCount = 0;
                if (batch.sleepers && Array.isArray(batch.sleepers)) {
                    // Count everything that has been checked (not in PENDING state)
                    testedCount = batch.sleepers.filter(s => 
                        s.status && s.status.toUpperCase() !== 'PENDING'
                    ).length;
                } else {
                    // Fallback to pre-aggregated counts if sleepers array is missing
                    // We check common field naming patterns used in the DTOs
                    const accepted = Number(batch.acceptedCount || batch.acceptedQty || batch.numAccepted || batch.accepted || 0);
                    const rejected = Number(batch.rejectedCount || batch.rejectedQty || batch.numRejected || batch.rejected || 0);
                    testedCount = accepted + rejected;
                }

                // If we still have 0 tested items but the API gave us a percentage, 
                // we might want to respect it if our logic failed to find the counts
                let percentage = (testedCount / total) * 100;
                if (testedCount === 0 && (batch.testedPercentage !== undefined && batch.testedPercentage !== null)) {
                    percentage = Number(batch.testedPercentage);
                }
                
                return {
                    ...batch,
                    testedPercentage: Math.min(percentage, 100).toFixed(2)
                };
            });
            
            setBatches(processedData);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = async (batch) => {
        try {
            setFetchingDetails(true);
            setSelectedBatch(batch);
            const details = await apiService.getFinalInspectionBatchDetail(batch.batchId);
            setBatchDetails(details);
            setShowForm(true);
        } catch (error) {
            console.error('Error fetching batch details:', error);
            alert('Failed to load batch details');
        } finally {
            setFetchingDetails(false);
        }
    };

    const config = {
        visual: { title: 'Visual Check & Measurement', criteria: '100% Mandatory' },
        critical: { title: 'Critical Dimensions', criteria: '10% (T-39) / 20% (T-45)' },
        noncritical: { title: 'Non-Critical Dimensions', criteria: '1% (T-39) / 5% (T-45)' }
    };

    const currentConfig = config[type] || config.visual;

    const columns = [
        { key: 'batchNumber', label: 'Batch No.' },
        { key: 'totalBatchQty', label: 'Total Batch Qty' },
        { key: 'sleeperType', label: 'Type of Sleeper' },
        { key: 'noOfSleepers', label: 'No. of Sleepers' },
        {
            key: 'testedPercentage',
            label: 'Tested (%)',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${val}%`, background: val === 100 ? '#059669' : '#42818c' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700' }}>{Number(val).toFixed(2)}%</span>
                </div>
            )
        },
        {
            key: 'testingStatus',
            label: 'Status of Testing',
            render: (val) => {
                const colors = {
                    'Pending': { bg: '#fff7ed', color: '#c2410c' },
                    'Under Inspection': { bg: '#eff6ff', color: '#1d4ed8' },
                    'Completed': { bg: '#ecfdf5', color: '#059669' }
                };

                const style = colors[val] || colors.Pending;
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '700',
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.color}22`
                    }}>
                        {val}
                    </span>
                );
            }
        },
        { key: 'testingDate', label: 'Date of Testing' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    disabled={fetchingDetails}
                    onClick={() => handleOpenForm(row)}
                    style={{ padding: '6px 14px', fontSize: '11px', opacity: fetchingDetails ? 0.7 : 1 }}
                >
                    {fetchingDetails && selectedBatch?.batchId === row.batchId ? 'Loading...' : 'Open Test Form'}
                </button>
            )
        }
    ];

    return (
        <div className="dimensional-testing-root cement-forms-scope">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#42818c', margin: 0 }}>{currentConfig.title}</h2>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Completion Criteria: {currentConfig.criteria}</span>
                </div>
            </header>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px' }}>Batches Pending Dimensional Testing</h4>
                    <div style={{ fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: '4px' }}>
                        * Automated population via SCADA / Production Logs
                    </div>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading batches...</div>
                ) : (
                    <EnhancedDataTable columns={columns} data={batches} selectable={false} />
                )}
            </div>

            {showForm && (
                <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: (type === 'visual' || type === 'critical' || type === 'noncritical') ? '1200px' : '900px', width: '98%' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">{currentConfig.title} - {(type === 'visual' || type === 'critical' || type === 'noncritical') ? 'Full Inspection Form' : 'Batch Detail'}</span>
                            <button className="form-modal-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                            {type === 'visual' ? (
                                <VisualInspectionForm
                                    batch={batchDetails}
                                    onSave={() => { setShowForm(false); fetchBatches(); }}
                                    onCancel={() => setShowForm(false)}
                                    shift={selectedShift}
                                />
                            ) : type === 'critical' ? (
                                <CriticalDimensionForm
                                    batch={batchDetails}
                                    onSave={() => { setShowForm(false); fetchBatches(); }}
                                    onCancel={() => setShowForm(false)}
                                    shift={selectedShift}
                                />
                            ) : type === 'noncritical' ? (
                                <NonCriticalDimensionForm
                                    batch={batchDetails}
                                    onSave={() => { setShowForm(false); fetchBatches(); }}
                                    onCancel={() => setShowForm(false)}
                                    shift={selectedShift}
                                />
                            ) : (
                                <div style={{ padding: '20px' }}>Loading...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DimensionalTesting;

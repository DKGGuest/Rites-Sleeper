import React, { useState } from 'react';

const BatchStats = ({ batchStats, batchDeclarations, selectedBatchNo, setSelectedBatchNo }) => {
    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Process Performance Analytics</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Real-time deviations and compliance metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Select Batch:</span>
                    <select
                        value={selectedBatchNo}
                        onChange={(e) => setSelectedBatchNo(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    >
                        <option value="">-- Select --</option>
                        {[...new Set(batchDeclarations.map(b => b.batchNo))].map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Section 1: Set Value Validation */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }}></span>
                    Set Value Validation
                </h3>
                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Batch Weighments</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>{batchStats?.setValueValidation?.totalBatchWeighments || 0}</div>
                    </div>
                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Matching Proportion</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#10b981' }}>{batchStats?.setValueValidation?.matchingProportion || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>Set values within tolerance</div>
                    </div>
                    <div className="calc-card hover-lift" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Mismatching Proportion</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ef4444' }}>{batchStats?.setValueValidation?.mismatchingProportion || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>Requires attention</div>
                    </div>
                </div>
            </div>

            {/* Section 2: Actual Value Statistics (Per Ingredient) */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '20px', background: '#f59e0b', borderRadius: '2px' }}></span>
                    Actual Value Statistics (Per Ingredient)
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {batchStats?.actualValueStats?.ingredientStats.map(stat => (
                        <div key={stat.ingredient} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1e293b' }}>{stat.name}</h4>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', fontWeight: '700' }}>Set: {stat.setValue} kg</span>
                            </div>
                            <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                <div className="calc-card" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Total Batches</div>
                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800' }}>{stat.totalBatches}</div>
                                </div>
                                <div className="calc-card" style={{ padding: '0.75rem', borderRadius: '8px', background: stat.meanDeviation > 0 ? '#fef2f2' : stat.meanDeviation < 0 ? '#eff6ff' : '#f8fafc', borderLeft: `3px solid ${Math.abs(stat.meanDeviation) > 1 ? '#ef4444' : '#10b981'}` }}>
                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Mean Deviation</div>
                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: Math.abs(stat.meanDeviation) > 1 ? '#ef4444' : '#10b981' }}>
                                        {stat.meanDeviation > 0 ? '+' : ''}{stat.meanDeviation.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="calc-card" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Std Deviation</div>
                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800' }}>{stat.stdDeviation.toFixed(2)}%</div>
                                </div>
                                <div className="calc-card" style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '8px' }}>
                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Max Positive</div>
                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>+{stat.maxPositiveDeviation.toFixed(2)}%</div>
                                </div>
                                <div className="calc-card" style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '8px' }}>
                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Max Negative</div>
                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6' }}>{stat.maxNegativeDeviation.toFixed(2)}%</div>
                                </div>
                                <div className="calc-card" style={{ padding: '0.75rem', borderRadius: '8px', background: stat.outlierCount > 0 ? '#fef2f2' : '#ecfdf5', borderLeft: `3px solid ${stat.outlierCount > 0 ? '#ef4444' : '#10b981'}` }}>
                                    <div className="mini-label" style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700' }}>Outliers (&gt;3%)</div>
                                    <div className="calc-value" style={{ fontSize: '1.1rem', fontWeight: '800', color: stat.outlierCount > 0 ? '#ef4444' : '#10b981' }}>{stat.outlierCount}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BatchStats;

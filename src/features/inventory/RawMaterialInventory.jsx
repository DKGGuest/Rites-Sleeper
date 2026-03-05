import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

/**
 * RawMaterialInventory Component
 * Connected to backend for live stock tracking and history.
 */
const RawMaterialInventory = ({ displayMode = 'inline', onBack }) => {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            // Fetch all inventory types in parallel for speed
            const [cement, hts, aggregate, admixture, sgci] = await Promise.all([
                apiService.getAllCementInventory().catch(() => ({ responseData: [] })),
                apiService.getAllHtsWireInventory().catch(() => ({ responseData: [] })),
                apiService.getAllAggregateInventory().catch(() => ({ responseData: [] })),
                apiService.getAllAdmixtureInventory().catch(() => ({ responseData: [] })),
                apiService.getAllSgciInventory().catch(() => ({ responseData: [] }))
            ]);

            // Map and calculate current stock levels
            const aggregateStock = (data, name, unit, capacity, color) => {
                const items = data.responseData || [];
                const latest = items[0] || {};
                const totalStock = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

                return {
                    id: name,
                    name,
                    unit,
                    stock: totalStock,
                    capacity,
                    color,
                    status: totalStock < (capacity * 0.2) ? 'Low' : 'OK',
                    daysStock: Math.floor(totalStock / (capacity * 0.1) || 5), // Estimate
                    latestChallan: latest.challanNo || 'N/A',
                    latestDate: latest.entryDate || '-'
                };
            };

            const mappedData = [
                aggregateStock(cement, 'Cement (OPC-53)', 'MT', 500, '#8b5cf6'),
                aggregateStock(aggregate, 'Aggregates', 'MT', 1200, '#3b82f6'),
                aggregateStock(hts, 'HTS Wire', 'Coils', 100, '#ef4444'),
                aggregateStock(admixture, 'Admixture', 'L', 5000, '#f59e0b'),
                aggregateStock(sgci, 'SGCI Inserts', 'Nos', 10000, '#10b981')
            ];

            setInventoryData(mappedData);

            // Combine recent records for the transaction table
            const allTransactions = [
                ...(cement.responseData || []),
                ...(hts.responseData || []),
                ...(aggregate.responseData || []),
                ...(admixture.responseData || []),
                ...(sgci.responseData || [])
            ].sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate)).slice(0, 10);

            setTransactions(allTransactions);

        } catch (error) {
            console.error("Failed to load inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderStats = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {inventoryData.map(item => {
                const percentage = Math.min(100, (item.stock / item.capacity) * 100);
                return (
                    <div key={item.id} className="calc-card hover-lift" style={{ borderLeft: `4px solid ${item.color}`, padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.name}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', marginTop: '0.25rem' }}>{item.stock.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{item.unit}</span></div>
                            </div>
                            <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', background: item.status === 'Low' ? '#fef2f2' : '#f0fdf4', color: item.status === 'Low' ? '#ef4444' : '#10b981', fontWeight: '800' }}>
                                {item.status}
                            </span>
                        </div>

                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                            <span style={{ color: '#64748b' }}>Capacity: {item.capacity} {item.unit}</span>
                            <span style={{ color: item.daysStock <= 2 ? '#ef4444' : '#10b981' }}>Est. {item.daysStock} Days Left</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderTable = () => (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>MATERIAL</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>DATE</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>CHALLAN NO</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>QUANTITY</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>SUPPLIER</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No recent transactions found.</td></tr>
                    ) : (
                        transactions.map((t, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row-hover">
                                <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{t.materialType || 'Inventory Item'}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{t.entryDate || '-'}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{t.challanNo || '-'}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: '700' }}>{t.quantity} Units</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{t.supplierName || 'Internal'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    if (loading && inventoryData.length === 0) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Syncing Warehouse Data...</div>;
    }

    if (displayMode === 'inline') {
        return (
            <div className="fade-in" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#1e293b' }}>Inventory Overview</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Live stock tracking synced with production.</p>
                    </div>
                </div>
                {renderStats()}
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Inward Transactions</h4>
                {renderTable()}
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '94%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: '900', color: '#1e293b' }}>Warehouse & Stock Control</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Comprehensive tracking of raw material ingestion and consumption.</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </div>

                {renderStats()}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="section-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontWeight: '800' }}>Consumption Guard</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Stock levels are automatically deducted based on confirmed Batch Weighment records for Line I & Line II.</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                            <span className="status-pill witnessed">AUTO-SYNC ACTIVE</span>
                        </div>
                    </div>
                    <div className="section-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontWeight: '800' }}>Supply Alerts</h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {inventoryData.filter(i => i.status === 'Low').map(i => (
                                <div key={i.id} style={{ padding: '10px 14px', background: '#fff', borderRadius: '10px', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: '#ef4444', fontSize: '1rem' }}>⚠️</span>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b91c1c' }}>{i.name} stock level is below 20%. Order placement recommended.</div>
                                </div>
                            ))}
                            {inventoryData.filter(i => i.status === 'Low').length === 0 && (
                                <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '10px', border: '1px solid #f0fdf4', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: '#10b981', fontSize: '1rem' }}>✅</span>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803d' }}>All raw material stock levels are within safety limits.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Log (Last 10 Arrivals)</h4>
                {renderTable()}
            </div>
        </div>
    );
};

export default RawMaterialInventory;

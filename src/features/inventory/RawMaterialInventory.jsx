import React, { useState } from 'react';

const RawMaterialInventory = ({ displayMode = 'inline', onBack }) => {
    const [inventoryData] = useState([
        { id: 1, name: 'Cement (OPC-53)', unit: 'MT', stock: 120.5, capacity: 500, color: '#8b5cf6', status: 'OK', daysStock: 3 },
        { id: 2, name: '20mm Aggregate', unit: 'MT', stock: 450.0, capacity: 600, color: '#3b82f6', status: 'Full', daysStock: 7 },
        { id: 3, name: '10mm Aggregate', unit: 'MT', stock: 320.3, capacity: 600, color: '#3b82f6', status: 'Low', daysStock: 2 },
        { id: 4, name: 'Admixture', unit: 'L', stock: 2400, capacity: 5000, color: '#f59e0b', status: 'OK', daysStock: 5 },
        { id: 5, name: 'HTS Wire', unit: 'Coils', stock: 45, capacity: 100, color: '#ef4444', status: 'Low', daysStock: 1.5 }
    ]);

    const renderStats = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {inventoryData.map(item => {
                const percentage = (item.stock / item.capacity) * 100;
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
                            <div style={{ width: `${percentage}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                            <span style={{ color: '#64748b' }}>Capacity: {item.capacity} {item.unit}</span>
                            <span style={{ color: item.daysStock <= 2 ? '#ef4444' : '#10b981' }}>{item.daysStock} Days Left</span>
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
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>LAST RECEIVED</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>CHALLAN NO</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>QUANTITY</th>
                        <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>SUPPLIER</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>Cement (OPC-53)</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>2026-02-12</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>CHL-99823</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: '700' }}>40 MT</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>UltraTech Cement</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>20mm Aggregate</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>2026-02-11</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>AGG-11202</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: '700' }}>25 MT</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>Local Crusher A</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    if (displayMode === 'inline') {
        return (
            <div className="fade-in" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#1e293b' }}>Inventory Overview</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Real-time stock levels and recent arrivals.</p>
                    </div>
                    <button className="toggle-btn" style={{ background: '#1e293b', fontSize: '0.8rem', padding: '8px 16px' }}>+ Record Entry</button>
                </div>
                {renderStats()}
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Inward Transactions</h4>
                {renderTable()}
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: '900', color: '#1e293b' }}>Raw Material Inventory Management</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Comprehensive stock control and procurement tracking.</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </div>

                {renderStats()}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="section-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                        <h4 style={{ margin: '0 0 1rem 0' }}>Quick Consumption Log</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-field">
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>Material</label>
                                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <option>Cement (OPC-53)</option>
                                    <option>20mm Aggregate</option>
                                    <option>10mm Aggregate</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>Quantity to Deduct</label>
                                <input type="number" placeholder="Enter quantity" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <button className="toggle-btn" style={{ background: '#10b981', marginTop: '0.5rem' }}>Update Stock</button>
                        </div>
                    </div>
                    <div className="section-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                        <h4 style={{ margin: '0 0 1rem 0' }}>Predictive Alerts</h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div style={{ padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>⚠️</span>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b' }}>HTS Wire Scarcity</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Stock will deplete in 36 hours based on current cast rate.</div>
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>📅</span>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b' }}>Order Pending: Aggregate</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Shipment from Supplier B expected tomorrow at 10 AM.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historical Log</h4>
                {renderTable()}
            </div>
        </div>
    );
};

export default RawMaterialInventory;

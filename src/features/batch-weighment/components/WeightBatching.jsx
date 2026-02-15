import React, { useState, useEffect } from 'react';
import ScadaTable from "../../../components/common/ScadaTable.jsx";
import { apiService } from '../../../services/api';

/**
 * WeightBatching Component
 * Displays live SCADA data for batching and allows witnessing of records.
 * Updated to use parent-provided batch selection for consistency.
 */
const WeightBatching = ({ onWitness, batches = [], selectedBatchNo }) => {
    // If selectedBatchNo is provided by parent (header), use it. otherwise local fallback.
    const [localBatch, setLocalBatch] = useState('');
    const activeBatch = selectedBatchNo || localBatch;

    const columns = [
        { label: "S.No", key: "sno", rowSpan: 2 },
        { label: "Action", key: "action", rowSpan: 2 },
        { label: "Date", key: "date", rowSpan: 2 },
        { label: "Time", key: "time", rowSpan: 2 },
        { label: "Batch", key: "batch", rowSpan: 2 },
        {
            label: "20mm (CA1)",
            children: [
                { label: "Set", key: "mm20_set" },
                { label: "Actual", key: "mm20_actual" }
            ]
        },
        {
            label: "10mm (CA2)",
            children: [
                { label: "Set", key: "mm10_set" },
                { label: "Actual", key: "mm10_actual" }
            ]
        },
        {
            label: "Sand (FA)",
            children: [
                { label: "Set", key: "sand_set" },
                { label: "Actual", key: "sand_actual" }
            ]
        },
        {
            label: "Cement",
            children: [
                { label: "Set", key: "cement_set" },
                { label: "Actual", key: "cement_actual" }
            ]
        },
        {
            label: "Water",
            children: [
                { label: "Set", key: "water_set" },
                { label: "Actual", key: "water_actual" }
            ]
        },
        {
            label: "Admixture",
            children: [
                { label: "Set", key: "admix_set" },
                { label: "Actual", key: "admix_actual" }
            ]
        },
        { label: "Total", key: "total", rowSpan: 2 }
    ];

    const fetchScadaData = async ({ page, size, batch }) => {
        try {
            const response = await apiService.getScadaRecords(page, size, batch);
            const apiRes = response?.responseData;
            if (apiRes) {
                return {
                    rows: (apiRes.rows || []).map(r => ({ ...r, action: renderAction(r) })),
                    total: apiRes.total || 0
                };
            }
        } catch (e) {
            console.error("Failed to fetch SCADA data", e);
        }
        return { rows: [], total: 0 };
    };

    const renderAction = (record) => (
        <button
            className="toggle-btn"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}
            onClick={() => onWitness({
                ...record,
                id: Date.now() + Math.random(),
                batchNo: record.batch,
                source: 'Scada Witnessed',
                ca1: record.mm20_actual,
                ca2: record.mm10_actual,
                fa: record.sand_actual,
                cement: record.cement_actual,
                water: record.water_actual,
                admixture: record.admix_actual,
                time: record.time,
                date: record.date
            })}
        >
            Witness
        </button>
    );

    return (
        <div className="scada-monitoring">
            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                {!selectedBatchNo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ fontWeight: '600', color: '#64748b' }}>Select Batch:</label>
                        <select
                            value={activeBatch}
                            onChange={(e) => setLocalBatch(e.target.value)}
                            style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                        >
                            <option value="">-- Select --</option>
                            {batches.map(b => <option key={b.id} value={b.batchNo}>{b.batchNo}</option>)}
                        </select>
                    </div>
                )}
                <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', marginLeft: selectedBatchNo ? '0' : 'auto' }}>
                    <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>
                    Synchronizing with Plant SCADA...
                </div>
            </div>

            <div className="scada-table-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <ScadaTable
                    columns={columns}
                    fetchData={fetchScadaData}
                    pageSize={10}
                    batchId={activeBatch}
                    height="400px"
                />
            </div>
        </div>
    );
};

export default WeightBatching;

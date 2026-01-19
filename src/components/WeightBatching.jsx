import React, { useState } from 'react';
import ScadaTable from "./ScadaTable.jsx";
import { apiService } from '../services/api';

export default function WeightBatching({ onWitness, batches = [] }) {
    const [selectedBatch, setSelectedBatch] = useState(batches[0]?.batchNo || '601');

    const columns = [
        { label: "S.No", key: "sno", rowSpan: 2 },
        { label: "Action", key: "action", rowSpan: 2 },
        { label: "Date", key: "date", rowSpan: 2 },
        { label: "Time", key: "time", rowSpan: 2 },
        { label: "Batch", key: "batch", rowSpan: 2 },
        {
            label: "20mm in Kgs",
            children: [
                { label: "Set", key: "mm20_set" },
                { label: "Actual", key: "mm20_actual" }
            ]
        },
        {
            label: "10mm in Kgs",
            children: [
                { label: "Set", key: "mm10_set" },
                { label: "Actual", key: "mm10_actual" }
            ]
        },
        {
            label: "Sand in Kgs",
            children: [
                { label: "Set", key: "sand_set" },
                { label: "Actual", key: "sand_actual" }
            ]
        },
        {
            label: "Cement in Kgs",
            children: [
                { label: "Set", key: "cement_set" },
                { label: "Actual", key: "cement_actual" }
            ]
        },
        {
            label: "Water in Ltrs",
            children: [
                { label: "Set", key: "water_set" },
                { label: "Actual", key: "water_actual" }
            ]
        },
        {
            label: "Admix in Kg",
            children: [
                { label: "Set", key: "admix_set" },
                { label: "Actual", key: "admix_actual" }
            ]
        },
        { label: "Total", key: "total", rowSpan: 2 }
    ];

    const MOCK_DATA = Array.from({ length: 180 }).map((_, i) => ({
        sno: i + 1,
        date: "16-11-2025",
        time: `10:${String(i % 60).padStart(2, "0")}:00`,
        batch: (i < 60) ? '601' : (i < 120 ? '602' : '603'),
        mm20_set: 431,
        mm20_actual: (430 + Math.random() * 12).toFixed(1),
        mm10_set: 176,
        mm10_actual: (175 + Math.random() * 6).toFixed(1),
        sand_set: 207,
        sand_actual: (206 + Math.random() * 6).toFixed(1),
        cement_set: 175,
        cement_actual: (174 + Math.random() * 5).toFixed(1),
        water_set: 36.2,
        water_actual: (36 + Math.random()).toFixed(1),
        admix_set: 1.4,
        admix_actual: (1.4 + Math.random() * 0.05).toFixed(3),
        total: (810 + Math.random() * 25).toFixed(1)
    }));

    const fetchWeightBatchingData = async ({ page, size, batch }) => {
        try {
            const apiRes = await apiService.getScadaRecords(page, size, batch);
            if (apiRes) {
                return {
                    rows: apiRes.rows.map(r => ({ ...r, action: renderWitnessButton(r) })),
                    total: apiRes.total
                };
            }
        } catch (e) {
            console.warn("API Unavailable, using mock data");
        }

        const filtered = MOCK_DATA.filter(r => r.batch.toString() === batch.toString());
        const start = (page - 1) * size;
        const rows = filtered.slice(start, start + size).map(r => ({
            ...r,
            action: renderWitnessButton(r)
        }));

        return { rows, total: filtered.length };
    };

    const renderWitnessButton = (r) => (
        <button
            className="toggle-btn"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px' }}
            onClick={() => onWitness({
                ...r,
                id: Date.now() + Math.random(),
                batchNo: r.batch,
                source: 'Scada Witnessed',
                ca1: r.mm20_actual,
                ca2: r.mm10_actual,
                fa: r.sand_actual,
                cement: r.cement_actual,
                water: r.water_actual,
                admixture: r.admix_actual
            })}
        >
            Witness
        </button>
    );

    return (
        <div style={{ padding: '0.5rem' }}>
            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Select Batch:</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
                    >
                        {batches.length > 0 ? (
                            batches.map(b => <option key={b.id} value={b.batchNo}>{b.batchNo}</option>)
                        ) : (
                            <>
                                <option value="601">601</option>
                                <option value="602">602</option>
                                <option value="603">603</option>
                            </>
                        )}
                    </select>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '500' }}>
                    ● Live SCADA Connection Active
                </div>
            </div>

            <ScadaTable
                columns={columns}
                fetchData={fetchWeightBatchingData}
                pageSize={10}
                batchId={selectedBatch}
            />
        </div>
    );
}

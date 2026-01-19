import React, { useState } from 'react';
import ScadaTable from "./ScadaTable.jsx";

export default function TensionRegister({ batches = [] }) {
    const [selectedBatch, setSelectedBatch] = useState(batches[0]?.batchNo || '601');

    const columns = [
        { label: "S.No", key: "sno", rowSpan: 4 },
        { label: "Batch", key: "batch", rowSpan: 4 },
        { label: "Bench", key: "bench", rowSpan: 4 },
        { label: "Time", key: "time", rowSpan: 4 },
        { label: "Length of Wires mm (L)", key: "wire_length", rowSpan: 4 },
        { label: "Total Area mm² (a)", key: "area", rowSpan: 4 },
        { label: "Youngs Modulus Lot (E)", key: "youngs_modulus", rowSpan: 4 },
        { label: "Initial (C)", key: "initial_c", rowSpan: 4 },
        {
            label: "Elongation in mm",
            children: [
                {
                    label: "Reading at 2 × 0 KN (A)",
                    children: [
                        { label: "Left U", key: "a_left_u" },
                        { label: "Left L", key: "a_left_l" },
                        { label: "Right U", key: "a_right_u" },
                        { label: "Right L", key: "a_right_l" }
                    ]
                },
                {
                    label: "Final Reading at 2 × 243 KN (B)",
                    children: [
                        { label: "Left U", key: "b_left_u" },
                        { label: "Left L", key: "b_left_l" },
                        { label: "Right U", key: "b_right_u" },
                        { label: "Right L", key: "b_right_l" }
                    ]
                }
            ]
        },
        {
            label: "Stress Force Details",
            children: [
                { label: "Measured Elongation (B-A)", key: "elongation_measured" },
                { label: "Stressed Force (P)", key: "stress_force" },
                { label: "Total Pre Stress", key: "total_pre_stress" }
            ]
        },
        { label: "Final Load KN", key: "final_load", rowSpan: 4 }
    ];

    const MOCK_DATA = Array.from({ length: 120 }).map((_, i) => ({
        sno: i + 1,
        batch: (i < 40) ? '601' : (i < 80 ? '602' : '603'),
        bench: 400 + (i % 10),
        time: `08:${String(i % 60).padStart(2, "0")}`,
        wire_length: 12050,
        area: 571.6,
        youngs_modulus: 201.21,
        initial_c: 54,
        a_left_u: 330, a_left_l: 332, a_right_u: 329, a_right_l: 331,
        b_left_u: 410, b_left_l: 412, b_right_u: 409, b_right_l: 411,
        elongation_measured: 80.5,
        stress_force: 722,
        total_pre_stress: 735,
        final_load: 730
    }));

    const fetchTensionRegisterData = async ({ page, size, batch }) => {
        const filtered = MOCK_DATA.filter(r => r.batch.toString() === batch.toString());
        const start = (page - 1) * size;
        return {
            rows: filtered.slice(start, start + size),
            total: filtered.length
        };
    };

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
                    ● Tension Feed Synchronized
                </div>
            </div>

            <ScadaTable
                columns={columns}
                fetchData={fetchTensionRegisterData}
                pageSize={10}
                batchId={selectedBatch}
            />
        </div>
    );
}

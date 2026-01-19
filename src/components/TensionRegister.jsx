import React, { useState } from 'react';
import ScadaTable from "./ScadaTable.jsx";
import { apiService } from '../services/api';

export default function TensionRegister({ batches = [] }) {
    // ... (rest of the component state and columns)
    const [selectedBatch, setSelectedBatch] = useState(batches[0]?.batchNo || '601');

    const columns = [
        { label: "S.No", key: "sno", rowSpan: 4 },
        { label: "Batch", key: "batch", rowSpan: 4 },
        { label: "Bench", key: "bench", rowSpan: 4 },
        { label: "Time", key: "time", rowSpan: 4 },

        { label: "Length of Wires mm (L)", key: "wire_length", rowSpan: 4 },
        { label: "Total Cross Sectional Area mm² (a)", key: "area", rowSpan: 4 },
        { label: "Youngs Modulus of the Lot KN/mm² (E)", key: "youngs_modulus", rowSpan: 4 },
        { label: "Initial (C)", key: "initial_c", rowSpan: 4 },

        {
            label: "Elongation in mm",
            children: [
                {
                    label: "Reading at 2 × 0 KN (Total Load) A",
                    children: [
                        {
                            label: "Left Side",
                            children: [
                                { label: "U", key: "a_left_u" },
                                { label: "L", key: "a_left_l" }
                            ]
                        },
                        {
                            label: "Right Side",
                            children: [
                                { label: "U", key: "a_right_u" },
                                { label: "L", key: "a_right_l" }
                            ]
                        }
                    ]
                },
                {
                    label: "Final Reading at 2 × 243 KN (B) mm",
                    children: [
                        {
                            label: "Left Side",
                            children: [
                                { label: "U", key: "b_left_u" },
                                { label: "L", key: "b_left_l" }
                            ]
                        },
                        {
                            label: "Right Side",
                            children: [
                                { label: "U", key: "b_right_u" },
                                { label: "L", key: "b_right_l" }
                            ]
                        }
                    ]
                }
            ]
        },

        {
            label: "Pre Stressed Force based on measured from 54KN",
            children: [
                {
                    label: "Measured Elongation",
                    children: [
                        { label: "(B-A) mm", key: "elongation_measured" }
                    ]
                },
                {
                    label: "Stressed Force based on Measured",
                    children: [
                        { label: "E(B-A)/L (P)", key: "stress_force" }
                    ]
                },
                {
                    label: "Total Pre Stress",
                    key: "total_pre_stress"
                }
            ]
        },

        { label: "Final Load KN", key: "final_load", rowSpan: 4 }
    ];


    const MOCK_DATA = Array.from({ length: 120 }).map((_, i) => ({
        sno: i + 1,
        // Make batch dynamic for demo purposes
        batch: (i < 40) ? '601' : (i < 80 ? '602' : '603'),
        bench: 400 + (i % 10),
        time: `08:${String(i % 60).padStart(2, "0")}`,

        wire_length: 12050,
        area: 571.6,
        youngs_modulus: 201.21,
        initial_c: 54,

        a_left_u: 330 + Math.floor(Math.random() * 10),
        a_left_l: 330 + Math.floor(Math.random() * 10),
        a_right_u: 330 + Math.floor(Math.random() * 10),
        a_right_l: 330 + Math.floor(Math.random() * 10),

        b_left_u: 400 + Math.floor(Math.random() * 15),
        b_left_l: 400 + Math.floor(Math.random() * 15),
        b_right_u: 400 + Math.floor(Math.random() * 15),
        b_right_l: 400 + Math.floor(Math.random() * 15),

        elongation_measured: (65 + Math.random() * 10).toFixed(2),
        // elongation_calculated missing in columns but added to data in user diff?
        // Ah, checked columns: Measured Elongation, Stressed Force, Total Pre Stress.
        // I will keep the data generation as is.

        stress_force: Math.floor(700 + Math.random() * 50),
        total_pre_stress: Math.floor(720 + Math.random() * 40),
        final_load: 730
    }));


    const fetchTensionRegisterData = async ({ page, size, batch }) => {
        try {
            const apiRes = await apiService.getTensionRecords(page, size, batch);
            if (apiRes) {
                return {
                    rows: apiRes.rows,
                    total: apiRes.total
                };
            }
        } catch (e) {
            console.warn("API Unavailable, using mock data");
        }

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
                pageSize={20}
                batchId={selectedBatch}
            />
        </div>
    );
}

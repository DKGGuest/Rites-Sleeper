import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import './BatchWiseSleeperReport.css';

const BatchWiseSleeperReport = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        // Fetch batches for the dropdown
        const fetchBatches = async () => {
            try {
                // Mocking batch list retrieval
                // const response = await apiService.getAllBatchWeighment();
                // setBatches(response);
                const mockBatches = ['B-101', 'B-102', 'B-103', 'B-104', 'B-105'];
                setBatches(mockBatches);
            } catch (err) {
                console.error('Error fetching batches:', err);
            }
        };
        fetchBatches();
    }, []);

    const handleSearch = (batchNo) => {
        setLoading(true);
        // Simulate API delay for fetching batch lifecycle
        setTimeout(() => {
            const mockLifecycleData = {
                batchNo: batchNo,
                genesis: {
                    date: '2026-03-01',
                    shift: 'Shift A',
                    location: 'Line I',
                    mixDesign: 'M60-R1',
                    totalCast: 240
                },
                processParams: {
                    weighment: { status: 'OK', deviations: 'None' },
                    tensioning: { avgLoad: '38.5 kN', min: '37.8', max: '39.1', outliers: 0 },
                    compaction: { avgRpm: '3200', duration: '120 sec' },
                    steamCuring: { chamber: 'CH-4', duration: '7 hrs', maxTemp: '62°C' }
                },
                sleeperData: [
                    { id: 'S-7701', status: 'Good', rejection: '-' },
                    { id: 'S-7702', status: 'Good', rejection: '-' },
                    { id: 'S-7703', status: 'Rejected', rejection: 'Visual Crack' },
                    { id: 'S-7704', status: 'Good', rejection: '-' },
                ],
                yield: {
                    demoulding: { qty: 2, reason: 'Edge Chipping' },
                    inspection: { qty: 1, reason: 'Dimension OOR' },
                    netGood: 237
                },
                testing: {
                    steamCube: 'Pass',
                    waterCube: 'Pass',
                    links: ['SBT Link', 'MOR Link']
                }
            };
            setSelectedBatch(mockLifecycleData);
            setLoading(false);
        }, 500);
    };

    return (
        <div className="report-container fade-in">
            <header className="report-header">
                <h2>Batch-wise Sleeper Traceability</h2>
            </header>

            <section className="search-section">
                <div className="search-box">
                    <label>Enter or Select Batch Number</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        >
                            <option value="">Select a Batch</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <button
                            className="btn-submit"
                            onClick={() => handleSearch(searchTerm)}
                            disabled={!searchTerm || loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>
            </section>

            {selectedBatch && (
                <div className="lifecycle-view fade-in-up">
                    <div className="report-grid">
                        {/* GENESIS */}
                        <div className="report-card">
                            <h3>1. Genesis (Casting Info)</h3>
                            <div className="card-data">
                                <p><strong>Date:</strong> {selectedBatch.genesis.date}</p>
                                <p><strong>Shift:</strong> {selectedBatch.genesis.shift}</p>
                                <p><strong>Location:</strong> {selectedBatch.genesis.location}</p>
                                <p><strong>Mix Design:</strong> {selectedBatch.genesis.mixDesign}</p>
                                <p><strong>Total Cast:</strong> {selectedBatch.genesis.totalCast}</p>
                            </div>
                        </div>

                        {/* PROCESS PARAMETERS */}
                        <div className="report-card">
                            <h3>2. Process Parameters</h3>
                            <div className="card-data">
                                <p><strong>Weighment:</strong> {selectedBatch.processParams.weighment.status}</p>
                                <p><strong>Avg Tension Load:</strong> {selectedBatch.processParams.tensioning.avgLoad}</p>
                                <p><strong>Vibrator RPM:</strong> {selectedBatch.processParams.compaction.avgRpm}</p>
                                <p><strong>Chamber Mapping:</strong> {selectedBatch.processParams.steamCuring.chamber}</p>
                            </div>
                        </div>

                        {/* YIELDS */}
                        <div className="report-card">
                            <h3>3. Yield & Rejections</h3>
                            <div className="card-data">
                                <p><strong>Demoulding Rejections:</strong> {selectedBatch.yield.demoulding.qty}</p>
                                <p><strong>Final Rejections:</strong> {selectedBatch.yield.inspection.qty}</p>
                                <p style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                                    <strong>True Net Good:</strong> {selectedBatch.yield.netGood}
                                </p>
                            </div>
                        </div>

                        {/* TESTING */}
                        <div className="report-card">
                            <h3>4. Testing Results</h3>
                            <div className="card-data">
                                <p><strong>Steam Cube:</strong> {selectedBatch.testing.steamCube}</p>
                                <p><strong>Water Cube:</strong> {selectedBatch.testing.waterCube}</p>
                                <div className="test-links">
                                    {selectedBatch.testing.links.map(l => (
                                        <button key={l} className="btn-link">{l}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sleeper-list-section">
                        <h3>Sleeper Wise Data Report</h3>
                        <div className="table-outer-wrapper">
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Sleeper ID</th>
                                        <th>Date of Casting</th>
                                        <th>Status</th>
                                        <th>Rejection Reason</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {selectedBatch.sleeperData.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.id}</td>
                                            <td>{selectedBatch.genesis.date}</td>
                                            <td>
                                                <span className={`status-badge ${s.status.toLowerCase()}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td>{s.rejection}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchWiseSleeperReport;

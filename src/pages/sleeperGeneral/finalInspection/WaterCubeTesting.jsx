import React, { useState, useEffect, useMemo } from 'react';
import EnhancedDataTable from '../../../components/common/EnhancedDataTable';
import WaterCuredCubeForm from './WaterCuredCubeForm';
import { 
    getProductionDeclarations, 
    saveWaterCubeSample, 
    getWaterCubeSamples, 
    deleteWaterCubeSample,
    saveWaterCubeTestResult,
    getWaterCubeTestResultsByUser
} from '../../../services/workflowService';
import { getStoredUser } from '../../../services/authService';
import { useShift } from '../../../context/ShiftContext';

// Helper to handle DD/MM/YYYY or YYYY-MM-DD
const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return null;
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
};

// Helper to check 15 day eligibility
const checkEligibility = (castingDate) => {
    // Temporary override: allow testing immediately
    return true;
};

// Mock Data for Batches pending declaration
// const MOCK_PENDING_DECLARATION = [
//     { batchNo: 'B-801', date: '2026-01-28', grade: 'M55', sleepers: 160, typesCount: 1 },
//     { batchNo: 'B-802', date: '2026-01-29', grade: 'M60', sleepers: 160, typesCount: 2 },
//     { batchNo: 'B-803', date: '2026-01-30', grade: 'M55', sleepers: 80, typesCount: 1 },
// ];

export const WaterCubeStats = () => {
    const [filters, setFilters] = useState({ batch: '', grade: 'All', dateRange: '' });

    const stats = {
        readyBatches: 14,
        pendingSamples: 6,
        avgStrength: 59.2,
        minStrength: 51.5,
        maxStrength: 65.8,
        deviation: 3.8
    };

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Cube Integrity Analytics</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>Real-time strength metrics and testing readiness tracking</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                {[
                    { label: 'Ready for Testing', sub: '(>15 Days)', value: stats.readyBatches, color: '#42818c' },
                    { label: 'Samples Pending', sub: 'In Queue', value: stats.pendingSamples, color: '#f59e0b' },
                    { label: 'Avg. Strength', sub: 'N/mm²', value: stats.avgStrength, color: '#1e293b' },
                    { label: 'Min Strength', sub: 'Critical', value: stats.minStrength, color: '#ef4444' },
                    { label: 'Max Strength', sub: 'Peak', value: stats.maxStrength, color: '#10b981' },
                    { label: 'Deviation %', sub: 'Consistency', value: `${stats.deviation}%`, color: '#6366f1' },
                ].map((s, idx) => (
                    <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '8px' }}>{s.sub}</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WaterCubeTesting = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'declaration', 'pending', 'done'
    const [isModifying, setIsModifying] = useState(false);
    const { selectedShift, dutyLocation } = useShift();
    
    // Live Data State
    const [pendingDeclarations, setPendingDeclarations] = useState([]);
    const [loadingDeclarations, setLoadingDeclarations] = useState(false);
    
    // Active declarations (saved to DB)
    const [activeDeclarations, setActiveDeclarations] = useState([]);
    const [loadingActive, setLoadingActive] = useState(false);

    const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null); 

    useEffect(() => {
        fetchDeclarations();
        fetchActiveDeclarations();
    }, []);

    const fetchDeclarations = async () => {
        setLoadingDeclarations(true);
        try {
            const currentUser = getStoredUser();
            const currentUserId = currentUser?.userId;

            if (!currentUserId) {
                setPendingDeclarations([]);
                return [];
            }

            // Fetch active declarations first to filter out already declared batches
            const activeData = await fetchActiveDeclarations();
            const activeDeclarationIds = activeData.map(d => d.productionDeclarationId);

            // Fast API: only fetches declarations for this user at the DB level
            const data = await getProductionDeclarations();
            if (data && data.length > 0) {
                const mappedData = data
                    .map(d => ({
                        id: d.id,
                        batchNo: d.batchNumber || 'N/A',
                        date: d.castingDate || 'N/A',
                        grade: d.mixDesignReference || 'N/A',
                        sleepers: d.totalCastedSleepers || 0,
                        typesCount: d.totalSleeperTypes || 0,
                        raw: d
                    }))
                    .filter(d => !activeDeclarationIds.includes(d.id)); // Filter out declared batches
                setPendingDeclarations(mappedData);
            } else {
                setPendingDeclarations([]);
            }
        } catch (error) {
            console.error("Error fetching declarations:", error);
            setPendingDeclarations([]);
        } finally {
            setLoadingDeclarations(false);
        }
    };

    const fetchActiveDeclarations = async () => {
        setLoadingActive(true);
        try {
            const currentUser = getStoredUser();
            const currentUserId = currentUser?.userId;

            if (!currentUserId) {
                setActiveDeclarations([]);
                return [];
            }

            // Fetch both in parallel to filter out completed tests
            const [data, testResults] = await Promise.all([
                getWaterCubeSamples(),
                getWaterCubeTestResultsByUser(currentUserId).catch(() => []) 
            ]);

            const completedTestIds = new Set(
                 (testResults || [])
                    .map(tr => tr.waterCubeSampleDeclarationId)
                    .filter(id => id != null)
            );

            if (data && data.length > 0) {
                const mappedData = data
                    .filter(d => !completedTestIds.has(d.id))

                    .map(d => ({
                    id: d.id,
                    productionDeclarationId: d.productionDeclarationId,
                    batchNo: d.batchNumber,
                    grade: d.concreteGrade,
                    castingDate: d.castingDate,
                    shift: d.shift,
                    lineNo: d.lineNo,
                    sample1Raw: d.details?.filter(det => det.sampleNumber === 1).map(det => ({ bench: det.benchNumber, seq: det.sequence })) || [],
                    sample2Raw: d.details?.filter(det => det.sampleNumber === 2).map(det => ({ bench: det.benchNumber, seq: det.sequence })) || [],
                    sample1: d.details?.filter(det => det.sampleNumber === 1).map(det => `${det.benchNumber}${det.sequence}`) || [],
                    sample2: d.details?.filter(det => det.sampleNumber === 2).map(det => `${det.benchNumber}${det.sequence}`) || [],
                    status: 'Testing Pending',
                    raw: d
                }));
                setActiveDeclarations(mappedData);
                return mappedData;
            } else {
                setActiveDeclarations([]);
                return [];
            }

        } catch (error) {
            console.error("Error fetching active water cube samples:", error);
            setActiveDeclarations([]);
            return [];
        } finally {
            setLoadingActive(false);
        }
    };

    const handleFinalizeSample = async (formData) => {
        try {
            const currentUser = getStoredUser();
            const currentUserId = currentUser?.userId;

            if (!currentUserId) {
                alert("User not authenticated.");
                return;
            }

            const payload = {
                productionDeclarationId: selectedBatch.id,
                castingDate: formData.castingDate,
                batchNumber: formData.batchNo,
                shift: selectedShift || 'General',
                lineNo: dutyLocation || 'N/A',
                concreteGrade: formData.grade,
                details: [
                    ...formData.sample1Raw.map((c, i) => ({ sampleNumber: 1, cubeNumber: i + 1, benchNumber: c.bench, sequence: c.seq })),
                    ...formData.sample2Raw.map((c, i) => ({ sampleNumber: 2, cubeNumber: i + 1, benchNumber: c.bench, sequence: c.seq }))
                ],
                createdBy: currentUserId
            };

            let response;
            if (isModifying && selectedBatch?.id) {
                response = await saveWaterCubeSample(payload, selectedBatch.id); // Assuming saveWaterCubeSample can handle updates
                alert("Sample declaration updated successfully!");
            } else {
                response = await saveWaterCubeSample(payload);
                alert("Sample declaration saved successfully!");
            }
            
            setIsSampleModalOpen(false);
            fetchActiveDeclarations(); // Refresh the list of active declarations
            fetchDeclarations(); // Refresh pending declarations as one might have been moved
        } catch (error) {
            console.error("Error saving sample declaration:", error);
            alert("Failed to save sample declaration.");
        }
    };

    const handleDeleteSample = async (sampleId) => {
        if (window.confirm("Are you sure you want to delete this sample declaration? This action cannot be undone.")) {
            try {
                await deleteWaterCubeSample(sampleId);
                alert("Sample declaration deleted successfully!");
                fetchActiveDeclarations();
                fetchDeclarations(); // Refresh pending declarations
            } catch (error) {
                console.error("Error deleting sample declaration:", error);
                alert("Failed to delete sample declaration.");
            }
        }
    };

    const [showTestModal, setShowTestModal] = useState(false);
    const [showTestForm, setShowTestForm] = useState(false);
    const [doneTests, setDoneTests] = useState([]);

    // Fetch done tests on mount or when active tab changes
    useEffect(() => {
        const fetchDoneTests = async () => {
            const currentUser = getStoredUser();
            if (currentUser?.userId) {
                try {
                    const results = await getWaterCubeTestResultsByUser(currentUser.userId);
                    if (results && results.length > 0) {
                        const mapped = results.map(r => ({
                            batchNo: r.batchNumber,
                            castingDate: r.castingDate,
                            testDate: r.createdDate ? new Date(r.createdDate).toISOString().split('T')[0] : '',
                            sample1Results: r.details?.filter(d => d.sampleNumber === 1).map(d => d.strengthNmm2) || [],
                            sample2Results: r.details?.filter(d => d.sampleNumber === 2).map(d => d.strengthNmm2) || [],
                            avgStrength: r.avgX,
                            status: r.finalTestResult
                        }));
                        setDoneTests(mapped);
                    }
                } catch (error) {
                    console.error("Failed to fetch done tests:", error);
                }
            }
        };
        fetchDoneTests();
    }, [activeTab]);

    const handleSaveTestData = async (data) => {
        try {
            const currentUser = getStoredUser();
            const currentUserId = currentUser?.userId;

            if (!currentUserId) {
                alert("User not authenticated.");
                return;
            }

            const calculateAge = (castingDate) => {
                const dt = parseDate(castingDate);
                if (!dt) return 0;
                const diffTime = Math.abs(new Date() - dt);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            };

            const fckTarget = selectedBatch.grade === 'M55' ? 55 : (selectedBatch.grade === 'M60' ? 60 : 55);

            const payload = {
                productionDeclarationId: selectedBatch.productionDeclarationId,
                waterCubeSampleDeclarationId: selectedBatch.id,
                batchNumber: selectedBatch.batchNo,
                concreteGrade: selectedBatch.grade,
                castingDate: selectedBatch.castingDate,
                shift: selectedBatch.shift || 'General',
                lineNo: selectedBatch.lineNo || 'N/A',
                fckTarget: fckTarget,
                ageDays: calculateAge(selectedBatch.castingDate),
                s1Avg: data.results.s1Avg,
                s2Avg: data.results.s2Avg,
                avgX: data.results.x,
                minY: data.results.y,
                s1Variation: data.results.s1Variation,
                s2Variation: data.results.s2Variation,
                condition1: data.results.condition1,
                condition2: data.results.condition2,
                condition3: data.results.condition3,
                mrSamplesRequired: data.results.mrSamples,
                finalTestResult: data.results.testResult,
                createdBy: currentUserId,
                details: data.cubes.map((c, idx) => ({
                    sampleNumber: c.sample,
                    cubeIndex: c.id,
                    cubeId: c.sample === 1 
                        ? (selectedBatch.sample1[idx] || `1-${c.id}`) 
                        : (selectedBatch.sample2[idx - 3] || `2-${c.id}`),
                    weightKg: parseFloat(c.weight) || 0,
                    loadKn: parseFloat(c.load) || 0,
                    strengthNmm2: parseFloat(c.strength) || 0,
                    testingDate: c.date,
                    testingTime: c.time
                }))
            };

            await saveWaterCubeTestResult(payload);
            alert("Test results saved successfully!");

            setShowTestForm(false);
            setActiveTab('done');
            fetchActiveDeclarations(); // Refresh the active list
        } catch (error) {
            console.error("Error saving test data:", error);
            alert("Failed to save test results.");
        }
    };

    // const [declaredBatches, setDeclaredBatches] = useState([ // Removed, now using activeDeclarations
    //     {
    //         batchNo: 'B-701', grade: 'M55', castingDate: '2026-01-15',
    //         declarationTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    //         sample1Raw: [{ bench: '201', seq: 'A' }, { bench: '210', seq: 'B' }, { bench: '315', seq: 'D' }],
    //         sample2Raw: [{ bench: '209', seq: 'D' }, { bench: '415', seq: 'B' }, { bench: '410', seq: 'B' }],
    //         sample1: ['201A', '210B', '315D'], sample2: ['209D', '415B', '410B'],
    //         status: 'Testing Pending'
    //     },
    //     {
    //         batchNo: 'B-750', grade: 'M60', castingDate: new Date().toISOString().split('T')[0],
    //         declarationTime: new Date().toISOString(),
    //         sample1Raw: [{ bench: '101', seq: 'A' }, { bench: '102', seq: 'A' }, { bench: '103', seq: 'A' }],
    //         sample2Raw: [{ bench: '104', seq: 'A' }, { bench: '105', seq: 'A' }, { bench: '106', seq: 'A' }],
    //         sample1: ['101A', '102A', '103A'], sample2: ['104A', '105A', '106A'],
    //         status: 'Not Eligible for Testing'
    //     }
    // ]);

    const declarationColumns = [
        { key: 'batchNo', label: 'Batch No' },
        { key: 'date', label: 'Date of Casting' },
        { key: 'grade', label: 'Grade' },
        { key: 'sleepers', label: 'Sleepers in Batch' },
        { key: 'typesCount', label: 'Sleeper Types' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    className="btn-verify"
                    onClick={() => { setSelectedBatch(row); setIsModifying(false); setIsSampleModalOpen(true); }}
                >
                    Declare Samples
                </button>
            )
        }
    ];

    const pendingColumns = [
        { key: 'batchNo', label: 'Batch Number' },
        { key: 'grade', label: 'Grade' },
        { key: 'castingDate', label: 'Date of Casting' },
        {
            key: 'sample1',
            label: 'Sample 1 - 3 Cubes',
            render: (val) => <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>{val.join(', ')}</span>
        },
        {
            key: 'sample2',
            label: 'Sample 2 - 3 Cubes',
            render: (val) => <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>{val.join(', ')}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, row) => {
                const isEligible = checkEligibility(row.castingDate);
                const displayStatus = isEligible ? 'Testing Pending' : 'Not Eligible for Testing';
                return (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '800',
                        background: isEligible ? '#ecfdf5' : '#fff7ed',
                        color: isEligible ? '#059669' : '#c2410c'
                    }}>
                        {displayStatus}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => {
                const canModify = (new Date() - new Date(row.declarationTime)) < (24 * 60 * 60 * 1000);
                const isEligible = checkEligibility(row.castingDate);
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-save"
                            style={{ fontSize: '10px', padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                            onClick={() => { setSelectedBatch(row); setShowTestModal(true); }}
                        >
                            Open Details
                        </button>
                        {canModify && (
                            <button
                                className="btn-delete"
                                style={{ fontSize: '10px', padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                                onClick={() => handleDeleteSample(row.id)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="water-cube-module cement-forms-scope">
            <header style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#13343b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Water Cured Cube Strength</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>SUB CARD- 4</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>FINAL INSPECTION PROFILE</span>
                </div>
            </header>

            <WaterCubeStats />

            <div className="nav-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <button className={`nav-tab ${activeTab === 'declaration' ? 'active' : ''}`} onClick={() => setActiveTab('declaration')}>
                    Declare Samples for Testing
                </button>
                <button className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    Declared Samples
                </button>
                <button className={`nav-tab ${activeTab === 'done' ? 'active' : ''}`} onClick={() => setActiveTab('done')}>
                    List of Testing Done
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'declaration' && (
                    <div className="fade-in" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Batches Pending Declaration</h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Source: SCADA / Vendor Inventory</span>
                            </div>
                        </div>
                        <EnhancedDataTable columns={declarationColumns} data={pendingDeclarations} selectable={false} loading={loadingDeclarations} />
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div className="fade-in" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Batches with Active Declarations</h4>
                        </div>
                        <EnhancedDataTable columns={pendingColumns} data={activeDeclarations} selectable={false} loading={loadingActive} />
                    </div>
                )}

                {activeTab === 'done' && (
                    <div className="fade-in" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Historical Strength Logs</h4>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Individual cube strengths shown in detail</div>
                        </div>
                        <EnhancedDataTable
                            columns={[
                                { key: 'batchNo', label: 'Batch' },
                                { key: 'castingDate', label: 'Cast Date' },
                                { key: 'testDate', label: 'Test Date' },
                                {
                                    key: 's1Strengths',
                                    label: 'Sample 1 Strengths',
                                    render: (_, row) => (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {row.sample1Results?.map((s, i) => (
                                                <span key={i} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{s.toFixed(1)}</span>
                                            ))}
                                        </div>
                                    )
                                },
                                {
                                    key: 's2Strengths',
                                    label: 'Sample 2 Strengths',
                                    render: (_, row) => (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {row.sample2Results?.map((s, i) => (
                                                <span key={i} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{s.toFixed(1)}</span>
                                            ))}
                                        </div>
                                    )
                                },
                                { key: 'avgStrength', label: 'Avg Strength', render: (val) => <strong>{val.toFixed(2)}</strong> },
                                {
                                    key: 'status',
                                    label: 'Result',
                                    render: (val) => (
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            background: val === 'PASS' ? '#ecfdf5' : '#fee2e2',
                                            color: val === 'PASS' ? '#059669' : '#b91c1c'
                                        }}>
                                            {val}
                                        </span>
                                    )
                                }
                            ]}
                            data={doneTests}
                            selectable={false}
                        />
                    </div>
                )}
            </div>

            {/* Declaration Modal */}
            {isSampleModalOpen && (
                <SampleDeclarationModal
                    batch={selectedBatch}
                    isModifying={isModifying}
                    onClose={() => setIsSampleModalOpen(false)}
                    onSave={handleFinalizeSample}
                />
            )}

            {/* Test Detail Pop-up (Detailed View with 2 Buttons) */}
            {showTestModal && (
                <TestDetailPopup
                    batch={selectedBatch}
                    onClose={() => setShowTestModal(false)}
                    onModify={() => {
                        setIsModifying(true);
                        setShowTestModal(false);
                        setShowDeclareModal(true);
                    }}
                    onSaveTest={() => {
                        setShowTestModal(false);
                        setShowTestForm(true);
                    }}
                />
            )}

            {/* Actual Save Test Data Form Modal */}
            {showTestForm && (
                <div className="form-modal-overlay">
                    <div className="form-modal-container" style={{ maxWidth: '1200px', width: '98%' }}>
                        <div className="form-modal-header">
                            <span className="form-modal-header-title">Enter Cube Strength Data - Batch {selectedBatch.batchNo}</span>
                            <button className="form-modal-close" onClick={() => setShowTestForm(false)}>✕</button>
                        </div>
                        <div className="form-modal-body" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                            <WaterCuredCubeForm
                                batch={selectedBatch}
                                onSave={handleSaveTestData}
                                onCancel={() => setShowTestForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-Components ---

const SampleDeclarationModal = ({ batch, isModifying, onClose, onSave }) => {
    const [form, setForm] = useState({
        sample1: isModifying ? batch.sample1Raw : [{ bench: '', seq: '' }, { bench: '', seq: '' }, { bench: '', seq: '' }],
        sample2: isModifying ? batch.sample2Raw : [{ bench: '', seq: '' }, { bench: '', seq: '' }, { bench: '', seq: '' }]
    });

    // Build a map of Bench Number -> Available Sleeper Suffixes from live API data
    const benchToSleepers = useMemo(() => {
        const map = {};
        const rawData = batch?.raw;
        if (!rawData) return map;

        // Handle Stress Bench (Chambers -> BenchGroups -> Sleepers)
        if (rawData.chambers && rawData.chambers.length > 0) {
            rawData.chambers.forEach(chamber => {
                chamber.benchGroups?.forEach(group => {
                    const bNo = String(group.benchNo);
                    if (!map[bNo]) map[bNo] = [];
                    group.sleepers?.forEach(s => {
                        // Extract suffix: if sleeper is "1A" and bench is "1", suffix is "A"
                        // Handle cases where suffix might be different (e.g., "11A" for bench 11)
                        const suffix = s.startsWith(bNo) ? s.substring(bNo.length) : s;
                        map[bNo].push({ full: s, suffix: suffix });
                    });
                });
            });
        }
        return map;
    }, [batch]);

    const handleUpdate = (sampleIdx, cubeIdx, field, val) => {
        const key = `sample${sampleIdx + 1}`;
        const updated = [...form[key]];
        updated[cubeIdx][field] = val;
        
        // If bench changes, clear the sequence if it's no longer valid? 
        // For now, let the user pick.
        
        setForm({ ...form, [key]: updated });
    };

    const renderSequenceOptions = (benchNo) => {
        const available = benchToSleepers[benchNo];
        if (available && available.length > 0) {
            return (
                <>
                    <optgroup label="Casted Sleepers">
                        {available.map(s => (
                            <option key={s.full} value={s.suffix}>{s.suffix}</option>
                        ))}
                    </optgroup>
                </>
            );
        }
        
        // Fallback to defaults if no live data or bench not found
        return (
            <>
                <optgroup label="Single Bench">
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
                <optgroup label="Twin Bench">
                    {['E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
            </>
        );
    };

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">{isModifying ? 'Modify Sample Details' : 'Sample Declaration Form'}</span>
                    <button className="form-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="form-modal-body" style={{ background: '#f8fafc' }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div className="input-group"><label>Batch Number</label><input readOnly value={batch?.batchNo} className="readOnly" /></div>
                            <div className="input-group"><label>Date of Casting</label><input readOnly value={batch?.date || batch?.castingDate} className="readOnly" /></div>
                            <div className="input-group"><label>Concrete Grade</label><input readOnly value={batch?.grade} className="readOnly" /></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {[0, 1].map(sIdx => (
                            <div key={sIdx} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ fontSize: '13px', color: '#42818c', marginBottom: '16px', fontWeight: '800', textTransform: 'uppercase' }}>
                                    Sample {sIdx + 1} (3 Cubes)
                                </h4>
                                {form[`sample${sIdx + 1}`].map((c, cIdx) => (
                                    <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', marginBottom: '12px' }}>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                placeholder="Bench Number"
                                                value={c.bench}
                                                onChange={(e) => handleUpdate(sIdx, cIdx, 'bench', e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <select value={c.seq} onChange={(e) => handleUpdate(sIdx, cIdx, 'seq', e.target.value)}>
                                                <option value="">Select No.</option>
                                                {renderSequenceOptions(c.bench)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button className="btn-verify" style={{ flex: 1, padding: '14px' }} onClick={() => {
                            const allCubes = [...form.sample1, ...form.sample2];
                            if (allCubes.some(c => !c.bench || !c.seq)) {
                                alert("Please provide both Bench Number and Sequence for all samples.");
                                return;
                            }
                            
                            // Check for duplicates
                            const combinations = allCubes.map(c => `${c.bench}-${c.seq}`);
                            const uniqueCombinations = new Set(combinations);
                            if (uniqueCombinations.size !== combinations.length) {
                                alert("Duplicate combination of Bench and Sequence detected. Each cube must have a unique Bench & Sequence combination.");
                                return;
                            }
                            
                            onSave({
                                batchNo: batch.batchNo,
                                grade: batch.grade,
                                castingDate: batch.date || batch.castingDate,
                                sample1Raw: form.sample1,
                                sample2Raw: form.sample2,
                                sample1: form.sample1.map(c => `${c.bench}${c.seq}`),
                                sample2: form.sample2.map(c => `${c.bench}${c.seq}`),
                            });
                        }}>
                            {isModifying ? 'Update Declaration' : 'Finalize Declaration'}
                        </button>
                        <button className="btn-save" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none' }} onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TestDetailPopup = ({ batch, onClose, onModify, onSaveTest }) => {
    const isEligible = checkEligibility(batch.castingDate);
    const canModify = (new Date() - new Date(batch.declarationTime)) < (24 * 60 * 60 * 1000);

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="form-modal-header">
                    <span className="form-modal-header-title">Batch Test Readiness</span>
                    <button className="form-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="form-modal-body">
                    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>BATCH NO</label><div style={{ fontWeight: '800' }}>{batch.batchNo}</div></div>
                            <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>GRADE</label><div style={{ fontWeight: '800' }}>{batch.grade}</div></div>
                            <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>CASTING DATE</label><div style={{ fontWeight: '800' }}>{batch.castingDate}</div></div>
                            <div><label style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>STATUS</label><div style={{ fontWeight: '800', color: isEligible ? '#10b981' : '#c2410c' }}>{isEligible ? 'Testing Pending' : 'Wait Required'}</div></div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block', marginBottom: '8px' }}>DECLARED SAMPLES</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1, background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#42818c' }}>SAMPLE 1</div>
                                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{batch.sample1.join(', ')}</div>
                                </div>
                                <div style={{ flex: 1, background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#42818c' }}>SAMPLE 2</div>
                                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{batch.sample2.join(', ')}</div>
                                </div>
                            </div>
                        </div>

                        {!isEligible && (
                            <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '11px', fontWeight: '700', marginBottom: '20px' }}>
                                {(() => {
                                    const castDate = parseDate(batch.castingDate);
                                    if (!castDate || isNaN(castDate.getTime())) return "Check casting date format";
                                    const eligibleDate = new Date(castDate.getTime() + 15 * 24 * 60 * 60 * 1000);
                                    return `Testing will become eligible on ${eligibleDate.toLocaleDateString('en-GB')}`;
                                })()}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="btn-save"
                                style={{ flex: 1, background: canModify ? '#f8fafc' : '#f1f5f9', color: canModify ? '#475569' : '#94a3b8', border: '1px solid #e2e8f0', cursor: canModify ? 'pointer' : 'not-allowed' }}
                                disabled={!canModify}
                                onClick={onModify}
                            >
                                Modify Sample Details
                            </button>
                            <button
                                className="btn-verify"
                                style={{ flex: 1, opacity: isEligible ? 1 : 0.5, cursor: isEligible ? 'pointer' : 'not-allowed' }}
                                disabled={!isEligible}
                                onClick={onSaveTest}
                            >
                                Save Test Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterCubeTesting;

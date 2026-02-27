import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ShiftContext = createContext();

export const useShift = () => {
    const context = useContext(ShiftContext);
    if (!context) {
        throw new Error('useShift must be used within a ShiftProvider');
    }
    return context;
};

export const ShiftProvider = ({ children }) => {
    const [dutyStarted, setDutyStarted] = useState(false);
    const [containers, setContainers] = useState([{ id: 1, type: 'Line', name: 'Line I' }]);
    const [activeContainerId, setActiveContainerId] = useState(1);

    // Shared state for all features
    const [allWitnessedRecords, setAllWitnessedRecords] = useState({ 1: [] });
    const [allTensionRecords, setAllTensionRecords] = useState({ 1: [] });
    const [allBatchDeclarations, setAllBatchDeclarations] = useState({ 1: [] });
    const [allSessionConfigs, setAllSessionConfigs] = useState({ 1: { sandType: 'River Sand', sensorStatus: 'working' } });
    const [sharedBatchNo, setSharedBatchNo] = useState('');
    const [sharedBenchNo, setSharedBenchNo] = useState('');
    const [allCompactionRecords, setAllCompactionRecords] = useState({ 1: [] });
    const [htsData, setHtsData] = useState([]);
    const [manualCheckEntries, setManualCheckEntries] = useState({
        mouldPrep: [],
        htsWire: [],
        demoulding: []
    });
    const [moistureRecords, setMoistureRecords] = useState([]);
    const [steamRecords, setSteamRecords] = useState([]);
    const [testedRecords, setTestedRecords] = useState([]);
    const [benchMouldCheckRecords, setBenchMouldCheckRecords] = useState([
        { id: 1, type: 'Bench', assetNo: '210-A', location: 'Line I', dateOfChecking: '2026-01-30', checkTime: '10:30', visualResult: 'ok', dimensionResult: 'ok', overallResult: 'OK', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), lastCasting: '2026-01-25', sleeperType: 'RT-1234' },
        { id: 2, type: 'Bench', assetNo: '210', location: 'Line I', dateOfChecking: '2026-01-30', checkTime: '11:15', visualResult: 'ok', dimensionResult: 'ok', overallResult: 'OK', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), lastCasting: '2026-01-29', sleeperType: 'RT-1234' },
        { id: 3, type: 'Mould', assetNo: 'M-205', location: 'Line I', dateOfChecking: '2026-01-29', checkTime: '14:20', visualResult: 'ok', dimensionResult: 'not-ok', overallResult: 'FAIL', dimensionReason: 'Rail Seat distance error', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), lastCasting: '2026-01-29', sleeperType: 'RT-1234' }
    ]);

    const [allBenchesMoulds, setAllBenchesMoulds] = useState([
        { id: 1, type: 'Bench', name: 'Bench 210-A', lastCasting: '2026-01-25', lastChecking: '2026-01-30' },
        { id: 2, type: 'Bench', name: 'Twin Bench-210', lastCasting: '2026-01-29', lastChecking: '2026-01-30' },
        { id: 3, type: 'Bench', name: 'Bench 211-B', lastCasting: '2026-01-28', lastChecking: '2026-01-15' },
        { id: 4, type: 'Mould', name: 'Mould M-101', lastCasting: '2025-12-15', lastChecking: '2025-11-20' },
        { id: 5, type: 'Mould', name: 'Mould M-205', lastCasting: '2026-01-29', lastChecking: '2026-01-29' },
        { id: 6, type: 'Mould', name: 'Mould M-310', lastCasting: '2026-01-30', lastChecking: '2026-01-28' }
    ]);

    const [newContainer, setNewContainer] = useState({ type: 'Line', name: '' });
    const containerValues = [
        { id: 1, label: 'Line', prefix: 'Line ' },
        { id: 2, label: 'Shed', prefix: 'Shed ' }
    ];

    const handleAddContainer = () => {
        if (!newContainer.name.trim()) return;
        const newId = containers.length > 0 ? Math.max(...containers.map(c => c.id)) + 1 : 1;
        const container = { id: newId, ...newContainer };
        setContainers([...containers, container]);
        setNewContainer({ type: 'Line', name: '' });
    };

    const handleDeleteContainer = (id) => {
        if (containers.length <= 1) {
            alert("At least one line or shed must remain.");
            return;
        }
        setContainers(containers.filter(c => c.id !== id));
        if (activeContainerId === id) {
            setActiveContainerId(containers.find(c => c.id !== id).id);
        }
    };

    const activeContainer = containers.find(c => c.id === activeContainerId);

    const loadShiftData = async () => {
        try {
            const [moisture, mouldPrep, htsWireResponse, demoulding, benchMould, wireTensionResponse, compactionResponse, steamResponse, batchWeighmentResponse] = await Promise.all([
                apiService.getAllMoistureAnalysis(),
                apiService.getAllMouldPreparations(),
                apiService.getAllHtsWirePlacement(),
                apiService.getAllDemouldingInspection(),
                apiService.getAllBenchMouldInspections(),
                apiService.getAllWireTensioning(),
                apiService.getAllCompaction(),
                apiService.getAllSteamCuring(),
                apiService.getAllBatchWeighment()
            ]);

            if (moisture?.responseData) setMoistureRecords(moisture.responseData);

            // Mapping backend wire tensioning to frontend flat state
            if (wireTensionResponse?.responseData) {
                const flattenedRecords = [];
                wireTensionResponse.responseData.forEach(batchRecord => {
                    const { batchNo, sleeperType, wiresPerSleeper, targetLoadKn } = batchRecord;

                    // Add manual records
                    (batchRecord.manualRecords || []).forEach(m => {
                        flattenedRecords.push({
                            ...m,
                            batchNo,
                            modulus: m.modulus || m.youngsModulus, // Unified key for UI
                            source: 'Manual',
                            sleeperType,
                            wiresPerSleeper,
                            targetLoadKn
                        });
                    });

                    // Add witnessed scada records (those already in the batch aggregate)
                    (batchRecord.scadaRecords || []).forEach(s => {
                        flattenedRecords.push({
                            ...s,
                            batchNo,
                            time: s.time || s.plcTime, // Unified key for UI
                            modulus: s.modulus || s.youngsModulus, // Unified key for UI
                            source: 'Scada',
                            sleeperType,
                            wiresPerSleeper,
                            targetLoadKn
                        });
                    });
                });

                setAllTensionRecords(prev => ({
                    ...prev,
                    [activeContainerId]: flattenedRecords
                }));
            }

            // Mapping backend compaction to frontend flat state
            if (compactionResponse?.responseData) {
                const flattenedRecords = [];
                compactionResponse.responseData.forEach(batchRecord => {
                    const { batchNo, sleeperType, entryDate } = batchRecord;

                    (batchRecord.manualRecords || []).forEach(m => {
                        flattenedRecords.push({
                            ...m,
                            batchNo,
                            date: entryDate,
                            source: 'Manual',
                            sleeperType
                        });
                    });

                    (batchRecord.scadaRecords || []).forEach(s => {
                        flattenedRecords.push({
                            ...s,
                            batchNo,
                            date: entryDate,
                            source: 'Scada',
                            sleeperType
                        });
                    });
                });

                setAllCompactionRecords(prev => ({
                    ...prev,
                    [activeContainerId]: flattenedRecords
                }));
            }

            // Mapping backend batch weighment to frontend state
            if (batchWeighmentResponse?.responseData) {
                const allDeclarations = {};
                const allConfigs = {};
                const allWitnessed = {};

                batchWeighmentResponse.responseData.forEach(session => {
                    const matchedContainer = containers.find(c => c.name === session.lineNo);
                    const containerId = matchedContainer ? matchedContainer.id : 1;

                    // Map Declarations
                    allDeclarations[containerId] = (session.batchDetails || []).map(d => ({
                        id: d.id,
                        batchNo: d.batchNo,
                        proportionMatch: d.proportionStatus,
                        setValues: {
                            ca1: d.ca1Set, ca2: d.ca2Set, fa: d.faSet,
                            cement: d.cementSet, water: d.waterSet, admixture: d.admixtureSet
                        },
                        adjustedWeights: {
                            ca1: d.ca1Ref, ca2: d.ca2Ref, fa: d.faRef,
                            cement: d.cementRef, water: d.waterRef, admixture: d.admixtureRef
                        }
                    }));

                    allConfigs[containerId] = {
                        sandType: session.sandType,
                        sensorStatus: (session.moistureSensorStatus || 'working').toLowerCase()
                    };

                    // Map Witnessed Records (Flattened)
                    const witnessed = [];
                    (session.scadaRecords || []).forEach(s => {
                        witnessed.push({
                            ...s,
                            id: s.id, // Use numeric ID from backend
                            source: 'Scada',
                            type: 'weight-batching',
                            // Normalize to frontend display keys
                            ca1: s.ca1Actual,
                            ca2: s.ca2Actual,
                            fa: s.faActual,
                            cement: s.cementActual,
                            water: s.waterActual,
                            admixture: s.admixtureActual
                        });
                    });
                    (session.manualRecords || []).forEach(m => {
                        witnessed.push({
                            ...m,
                            id: m.id, // Use numeric ID from backend
                            source: 'Manual',
                            type: 'weight-batching',
                            // Normalize to frontend display keys
                            ca1: m.ca1Actual,
                            ca2: m.ca2Actual,
                            fa: m.faActual,
                            cement: m.cementActual,
                            water: m.waterActual,
                            admixture: m.admixtureActual
                        });
                    });
                    allWitnessed[containerId] = witnessed;
                });

                setAllWitnessedRecords(allWitnessed);
                setAllBatchDeclarations(allDeclarations);
                setAllSessionConfigs(prev => ({ ...prev, ...allConfigs }));
            }

            // Mapping backend steam curing to frontend flat state
            if (steamResponse?.responseData) {
                const flattenedRecords = [];
                steamResponse.responseData.forEach(batchRecord => {
                    const { batchNo, chamber, grade, entryDate, id } = batchRecord;

                    (batchRecord.manualRecords || []).forEach(m => {
                        flattenedRecords.push({
                            ...m,
                            id: `${id}-m-${flattenedRecords.length}`,
                            batchId: id,
                            batchNo,
                            chamberNo: chamber,
                            date: entryDate,
                            source: 'Manual',
                            grade,
                            minConstTemp: m.minTemp,
                            maxConstTemp: m.maxTemp
                        });
                    });

                    (batchRecord.scadaRecords || []).forEach(s => {
                        flattenedRecords.push({
                            ...s,
                            id: `${id}-s-${flattenedRecords.length}`,
                            batchId: id,
                            batchNo,
                            chamberNo: chamber,
                            date: entryDate,
                            source: 'Scada',
                            grade,
                            minConstTemp: s.minTemp || 0, // Backend doesn't have min/max in scadaRecords yet?
                            maxConstTemp: s.maxTemp || 0
                        });
                    });
                });
                setSteamRecords(flattenedRecords);
            }

            const htsListData = htsWireResponse?.responseData || [];
            if (htsWireResponse?.responseData) {
                setHtsData(htsListData);
            }

            setManualCheckEntries({
                mouldPrep: mouldPrep?.responseData || [],
                htsWire: htsListData,
                demoulding: demoulding?.responseData || []
            });
            if (benchMould?.responseData) setBenchMouldCheckRecords(benchMould.responseData);
        } catch (error) {
            console.error("Error loading shift data:", error);
        }
    };

    const value = {
        dutyStarted,
        setDutyStarted,
        containers,
        setContainers,
        activeContainerId,
        setActiveContainerId,
        activeContainer,
        allWitnessedRecords,
        setAllWitnessedRecords,
        allTensionRecords,
        setAllTensionRecords,
        allBatchDeclarations,
        setAllBatchDeclarations,
        allSessionConfigs,
        setAllSessionConfigs,
        allCompactionRecords,
        setAllCompactionRecords,
        htsData,
        setHtsData,
        manualCheckEntries,
        setManualCheckEntries,
        moistureRecords,
        setMoistureRecords,
        steamRecords,
        setSteamRecords,
        testedRecords,
        setTestedRecords,
        benchMouldCheckRecords,
        setBenchMouldCheckRecords,
        allBenchesMoulds,
        setAllBenchesMoulds,
        newContainer,
        setNewContainer,
        containerValues,
        handleAddContainer,
        handleDeleteContainer,
        sharedBatchNo,
        setSharedBatchNo,
        sharedBenchNo,
        setSharedBenchNo,
        loadShiftData
    };


    return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
};

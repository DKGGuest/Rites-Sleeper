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
    const [manualCheckEntries, setManualCheckEntries] = useState({
        mouldPrep: [],
        htsWire: [],
        demoulding: []
    });
    const [moistureRecords, setMoistureRecords] = useState([]);
    const [steamRecords, setSteamRecords] = useState([
        { id: 1, batchNo: '601', chamberNo: '1', date: '2026-01-20', preDur: 2.25, risePeriod: 2.25, riseRate: 13.3, constTemp: 58, constDur: 4.0, coolDur: 2.5, coolRate: 11.2 },
    ]);
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
            const [moisture, mouldPrep, htsWire, demoulding, benchMould] = await Promise.all([
                apiService.getAllMoistureAnalysis(),
                apiService.getAllMouldPreparations(),
                apiService.getAllHtsWirePlacement(),
                apiService.getAllDemouldingInspection(),
                apiService.getAllBenchMouldInspections()
            ]);

            if (moisture?.responseData) setMoistureRecords(moisture.responseData);
            setManualCheckEntries({
                mouldPrep: mouldPrep?.responseData || [],
                htsWire: htsWire?.responseData || [],
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
        loadShiftData
    };


    return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { mapWireTensionRecords, mapCompactionRecords, mapSteamCuringRecords, mapBatchWeighmentData } from '../utils/shiftMappingUtils';

const ShiftContext = createContext();

export const useShift = () => {
    const context = useContext(ShiftContext);
    if (!context) {
        throw new Error('useShift must be used within a ShiftProvider');
    }
    return context;
};

export const ShiftProvider = ({ children }) => {
    const [dutyStarted, setDutyStarted] = useState(() => localStorage.getItem('dutyStarted') === 'true');
    const [selectedShift, setSelectedShift] = useState(() => localStorage.getItem('selectedShift') || ''); // 'A', 'B', 'C', 'General'
    const [dutyDate, setDutyDate] = useState(() => localStorage.getItem('dutyDate') || new Date().toISOString().split('T')[0]);
    const [dutyUnit, setDutyUnit] = useState(() => localStorage.getItem('dutyUnit') || '');
    const [dutyLocation, setDutyLocation] = useState(() => localStorage.getItem('dutyLocation') || '');

    const [containers, setContainers] = useState([{ id: 1, type: 'Line', name: 'Line I' }]);
    const [activeContainerId, setActiveContainerId] = useState(() => parseInt(localStorage.getItem('activeContainerId')) || 1);

    const endDuty = () => {
        setDutyStarted(false);
        setSelectedShift('');
        setDutyDate(new Date().toISOString().split('T')[0]);
        setDutyUnit('');
        setDutyLocation('');
        setActiveContainerId(1);
        setContainers([{ id: 1, type: 'Line', name: 'Line I' }]);

        // Reset all logs as requested
        setManualCheckEntries({
            mouldPrep: [],
            htsWire: [],
            demoulding: []
        });
        setAllBatchDeclarations({ 1: [] });
        setAllTensionRecords({ 1: [] });
        setAllCompactionRecords({ 1: [] });
        setAllWitnessedRecords({ 1: [] });
        setAllSessionConfigs({ 1: { sandType: 'River Sand', sensorStatus: 'working' } });
        setSteamRecords([]);
        
        localStorage.removeItem('dutyStarted');
        localStorage.removeItem('selectedShift');
        localStorage.removeItem('dutyDate');
        localStorage.removeItem('dutyUnit');
        localStorage.removeItem('dutyLocation');
        localStorage.removeItem('activeContainerId');
        localStorage.removeItem('vendorCode');
    };

    // Persist basic shift state
    useEffect(() => {
        localStorage.setItem('dutyStarted', dutyStarted);
        localStorage.setItem('selectedShift', selectedShift);
        localStorage.setItem('dutyDate', dutyDate);
        localStorage.setItem('dutyUnit', dutyUnit);
        localStorage.setItem('dutyLocation', dutyLocation);
        localStorage.setItem('activeContainerId', activeContainerId);
    }, [dutyStarted, selectedShift, dutyDate, dutyUnit, dutyLocation, activeContainerId]);

    // Shared state for all features
    const [allWitnessedRecords, setAllWitnessedRecords] = useState({ 1: [] });
    const [allTensionRecords, setAllTensionRecords] = useState({ 1: [] });
    const [allBatchDeclarations, setAllBatchDeclarations] = useState({ 1: [] });
    const [allSessionConfigs, setAllSessionConfigs] = useState({ 1: { sandType: 'River Sand', sensorStatus: 'working' } });
    const [sharedBatchNo, setSharedBatchNo] = useState('');
    const [sharedBenchNo, setSharedBenchNo] = useState('');
    const [allCompactionRecords, setAllCompactionRecords] = useState({ 1: [] });
    const [htsData, setHtsData] = useState([]);
    const [plantVerificationData, setPlantVerificationData] = useState({
        profiles: [
            { id: 'PP-001', plantName: 'Sleeper Plant – Unit 1', location: 'Bhilai, Chhattisgarh', vendorCode: 'VND-2201', plantType: 'Stress Bench – Twin', sheds: 3, lines: null, status: 'Pending', rejectionRemarks: '' },
            { id: 'PP-002', plantName: 'Sleeper Plant – Unit 2', location: 'Raipur, Chhattisgarh', vendorCode: 'VND-2202', plantType: 'Long Line', sheds: null, lines: 5, status: 'Verified', rejectionRemarks: '' },
            { id: 'PP-003', plantName: 'Sleeper Plant – Unit 3', location: 'Durg, Chhattisgarh', vendorCode: 'VND-2203', plantType: 'Stress Bench – Single', sheds: 2, lines: null, status: 'Rejected', rejectionRemarks: 'Invalid vendor code format provided.' },
        ],
        benches: [],
        rawMaterials: [
            { id: 'RM-001', materialType: 'Cement', supplierName: 'Ultra Tech Cements Ltd', sourceLocation: 'Bhilai', approvalRef: 'RDSO/2023/CE-441', validUpto: '2026-05-01', status: 'Pending', rejectionRemarks: '' },
            { id: 'RM-002', materialType: 'HTS Wire', supplierName: 'Usha Martin Ltd', sourceLocation: 'Ranchi', approvalRef: 'RDSO/2022/HW-209', validUpto: '2026-03-25', status: 'Verified', rejectionRemarks: '' },
            { id: 'RM-003', materialType: 'SGCI Insert', supplierName: 'Sharp Iron Works', sourceLocation: 'Faridabad', approvalRef: 'RITES/2024/SI-088', validUpto: '2026-03-12', status: 'Pending', rejectionRemarks: '' },
            { id: 'RM-004', materialType: 'Aggregates', supplierName: 'National Quarry Depot', sourceLocation: 'Durg', approvalRef: 'RDSO/2021/AG-310', validUpto: '2026-02-25', status: 'Rejected', rejectionRemarks: 'RDSO approval validity has expired.' },
        ],
        mixDesigns: [
            { id: 'MD-001', designId: 'MXD-M60-R1', grade: 'M60', authority: 'RDSO', cement: 450, ca1: 780, ca2: 410, fa: 675, water: 135, ac: 0.60, wc: 0.30, status: 'Pending', rejectionRemarks: '' },
            { id: 'MD-002', designId: 'MXD-M55-R2', grade: 'M55', authority: 'RITES', cement: 420, ca1: 760, ca2: 390, fa: 660, water: 130, ac: 0.62, wc: 0.31, status: 'Verified', rejectionRemarks: '' },
        ]
    });

    const [manualCheckEntries, setManualCheckEntries] = useState({
        mouldPrep: [],
        htsWire: [],
        demoulding: []
    });
    const [moistureRecords, setMoistureRecords] = useState([]);
    const [steamRecords, setSteamRecords] = useState([]);
    const [testedRecords, setTestedRecords] = useState([]);

    const [benchMouldCheckRecords, setBenchMouldCheckRecords] = useState([]);
    const [allBenchesMoulds, setAllBenchesMoulds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    // Granular fetch functions for better performance and targeted updates
    const fetchMoisture = async () => {
        const res = await apiService.getAllMoistureAnalysis();
        if (res?.responseData) setMoistureRecords(res.responseData);
    };

    const fetchManualChecks = async () => {
        const [mouldPrep, htsWire, demoulding] = await Promise.all([
            apiService.getAllMouldPreparations(),
            apiService.getAllHtsWirePlacement(),
            apiService.getAllDemouldingInspection()
        ]);
        const htsListData = htsWire?.responseData || [];
        setHtsData(htsListData);
        setManualCheckEntries({
            mouldPrep: mouldPrep?.responseData || [],
            htsWire: htsListData,
            demoulding: demoulding?.responseData || []
        });
    };

    const fetchWireTension = async () => {
        const res = await apiService.getAllWireTensioning();
        if (res?.responseData) {
            const flattenedRecords = mapWireTensionRecords(res.responseData);
            setAllTensionRecords(prev => ({ ...prev, [activeContainerId]: flattenedRecords }));
        }
    };

    const fetchCompaction = async () => {
        const res = await apiService.getAllCompaction();
        if (res?.responseData) {
            const flattenedRecords = mapCompactionRecords(res.responseData);
            setAllCompactionRecords(prev => ({ ...prev, [activeContainerId]: flattenedRecords }));
        }
    };

    const fetchBatchWeighment = async () => {
        const res = await apiService.getAllBatchWeighment();
        if (res?.responseData) {
            const { declarations, configs, witnessed } = mapBatchWeighmentData(res.responseData, containers);
            setAllWitnessedRecords(witnessed);
            setAllBatchDeclarations(declarations);
            setAllSessionConfigs(prev => ({ ...prev, ...configs }));
        }
    };

    const fetchSteamCuring = async () => {
        const res = await apiService.getAllSteamCuring();
        if (res?.responseData) {
            setSteamRecords(mapSteamCuringRecords(res.responseData));
        }
    };

    const fetchBenchMoulds = async () => {
        const [benchMould, stressBenches] = await Promise.all([
            apiService.getAllBenchMouldInspections(),
            apiService.getAllStressBenches()
        ]);
        if (benchMould?.responseData) setBenchMouldCheckRecords(benchMould.responseData);
        if (stressBenches?.responseData) {
            const masterList = stressBenches.responseData.map(b => ({
                id: b.id,
                type: 'Bench',
                name: b.entryType === 'Single' ? `Bench ${b.benchNo}` : `Range ${b.benchFrom}-${b.benchTo}`,
                assetNo: b.entryType === 'Single' ? b.benchNo : `${b.benchFrom}-${b.benchTo}`,
                lastCasting: b.latestCastingDate || '2025-01-31',
                lastChecking: b.lastCheckingDate || '2026-01-30',
                sleeperType: b.sleeperCategory
            }));
            setAllBenchesMoulds(masterList);
            setPlantVerificationData(prev => ({
                ...prev,
                benches: stressBenches.responseData.map(b => ({
                    ...b, moduleId: 2, requestId: b.id, status: b.status || 'Pending'
                }))
            }));
        }
    };

    const loadShiftData = async () => {
        setIsLoading(true);
        try {
            // Firing all groups in parallel but each updates its own state when ready
            await Promise.allSettled([
                fetchMoisture(),
                fetchManualChecks(),
                fetchWireTension(),
                fetchCompaction(),
                fetchBatchWeighment(),
                fetchSteamCuring(),
                fetchBenchMoulds()
            ]);
        } catch (error) {
            console.error("Error loading shift data:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const value = {
        dutyStarted,
        setDutyStarted,
        selectedShift,
        setSelectedShift,
        dutyDate,
        setDutyDate,
        dutyUnit,
        setDutyUnit,
        dutyLocation,
        setDutyLocation,
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
        plantVerificationData,
        setPlantVerificationData,
        loadShiftData,
        fetchMoisture,
        fetchManualChecks,
        fetchWireTension,
        fetchCompaction,
        fetchBatchWeighment,
        fetchSteamCuring,
        fetchBenchMoulds,
        isLoading,
        endDuty
    };



    return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
};

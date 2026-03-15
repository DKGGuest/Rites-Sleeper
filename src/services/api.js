import axios from 'axios';

const BASE_URL = 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30-second timeout prevents hanging indefinitely
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for standardized error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('API Error:', message, error.config?.url);
        return Promise.reject(new Error(message));
    }
);

export const apiService = {
    // ================= Moisture Analysis =================
    getAllMoistureAnalysis: () => api.get('/MoistureAnalysis/all'),
    getMoistureAnalysisById: (id) => api.get(`/MoistureAnalysis/${id}`),
    createMoistureAnalysis: (payload) => api.post('/MoistureAnalysis/create', payload),
    updateMoistureAnalysis: (id, payload) => api.put(`/MoistureAnalysis/update/${id}`, payload),
    deleteMoistureAnalysis: (id) => api.delete(`/MoistureAnalysis/delete/${id}`),

    // ================= HTS Wire Placement =================
    getAllHtsWirePlacement: () => api.get('/HtsWirePlacement/all'),
    getHtsWirePlacementById: (id) => api.get(`/HtsWirePlacement/${id}`),
    createHtsWirePlacement: (payload) => api.post('/HtsWirePlacement/create', payload),
    updateHtsWirePlacement: (id, payload) => api.put(`/HtsWirePlacement/update/${id}`, payload),
    deleteHtsWirePlacement: (id) => api.delete(`/HtsWirePlacement/delete/${id}`),

    // ================= Demoulding Inspection =================
    getAllDemouldingInspection: () => api.get('/DemouldingInspection/all'),
    getDemouldingInspectionById: (id) => api.get(`/DemouldingInspection/${id}`),
    createDemouldingInspection: (payload) => api.post('/DemouldingInspection/create', payload),
    updateDemouldingInspection: (id, payload) => api.put(`/DemouldingInspection/update/${id}`, payload),
    deleteDemouldingInspection: (id) => api.delete(`/DemouldingInspection/delete/${id}`),

    // ================= Mould Preparation =================
    getAllMouldPreparations: () => api.get('/MouldPreparation/all'),
    getMouldPreparationById: (id) => api.get(`/MouldPreparation/${id}`),
    createMouldPreparation: (data) => api.post('/MouldPreparation/create', data),
    updateMouldPreparation: (id, payload) => api.put(`/MouldPreparation/update/${id}`, payload),
    deleteMouldPreparation: (id) => api.delete(`/MouldPreparation/delete/${id}`),

    // ================= Steam Cube Testing =================
    getAllSteamCubes: () => api.get('/SteamCube/get-all'),
    getSteamCubeById: (id) => api.get(`/SteamCube/get/${id}`),
    createSteamCube: (payload) => api.post('/SteamCube/create', payload),
    updateSteamCube: (id, payload) => api.put(`/SteamCube/update/${id}`, payload),
    deleteSteamCube: (id) => api.delete(`/SteamCube/delete/${id}`),

    // ================= Bench Mould Inspection =================
    getAllBenchMouldInspections: () => api.get('/bench-mould-inspection/get-all'),
    getBenchMouldInspectionById: (id) => api.get(`/bench-mould-inspection/get/${id}`),
    createBenchMouldInspection: (payload) => api.post('/bench-mould-inspection/create', payload),
    updateBenchMouldInspection: (id, payload) => api.put(`/bench-mould-inspection/update/${id}`, payload),
    deleteBenchMouldInspection: (id) => api.delete(`/bench-mould-inspection/delete/${id}`),

    // ================= Wire Tensioning =================
    getAllWireTensioning: () => api.get('/wire-tensioning/get-all'),
    getWireTensioningById: (id) => api.get(`/wire-tensioning/get/${id}`),
    createWireTensioning: (payload) => api.post('/wire-tensioning/create', payload),
    updateWireTensioning: (id, payload) => api.put(`/wire-tensioning/update/${id}`, payload),
    deleteWireTensioning: (id) => api.delete(`/wire-tensioning/delete/${id}`),

    // ================= Compaction (Vibrator Report) =================
    getAllCompaction: () => api.get('/compaction/getAll'),
    getCompactionById: (id) => api.get(`/compaction/${id}`),
    createCompaction: (payload) => api.post('/compaction/create', payload),
    updateCompaction: (id, payload) => api.put(`/compaction/update/${id}`, payload),
    deleteCompaction: (id) => api.delete(`/compaction/delete/${id}`),

    // ================= Steam Curing =================
    getAllSteamCuring: () => api.get('/steam-curing/getAll'),
    getSteamCuringById: (id) => api.get(`/steam-curing/${id}`),
    createSteamCuring: (payload) => api.post('/steam-curing/create', payload),
    updateSteamCuring: (id, payload) => api.put(`/steam-curing/update/${id}`, payload),
    deleteSteamCuring: (id) => api.delete(`/steam-curing/delete/${id}`),

    // ================= Batch Weighment =================
    getAllBatchWeighment: () => api.get('/batch-weighment/get-all'),
    getBatchWeighmentById: (id) => api.get(`/batch-weighment/get/${id}`),
    createBatchWeighment: (payload) => api.post('/batch-weighment/create', payload),
    updateBatchWeighment: (id, payload) => api.put(`/batch-weighment/update/${id}`, payload),
    deleteBatchWeighment: (id) => api.delete(`/batch-weighment/delete/${id}`),

    // ================= Inventory – Cement =================
    getAllCementInventory: () => api.get('/inventory/cement/all'),
    getCementInventoryById: (id) => api.get(`/inventory/cement/${id}`),
    createCementInventory: (payload) => api.post('/inventory/cement/create', payload),
    updateCementInventory: (id, payload) => api.put(`/inventory/cement/update/${id}`, payload),
    deleteCementInventory: (id) => api.delete(`/inventory/cement/delete/${id}`),

    // ================= Inventory – HTS Wire =================
    getAllHtsWireInventory: () => api.get('/inventory/hts-wire/all'),
    getHtsWireInventoryById: (id) => api.get(`/inventory/hts-wire/${id}`),
    createHtsWireInventory: (payload) => api.post('/inventory/hts-wire/create', payload),
    updateHtsWireInventory: (id, payload) => api.put(`/inventory/hts-wire/update/${id}`, payload),
    deleteHtsWireInventory: (id) => api.delete(`/inventory/hts-wire/delete/${id}`),

    // ================= Inventory – Aggregate =================
    getAllAggregateInventory: () => api.get('/inventory/aggregate/all'),
    getAggregateInventoryById: (id) => api.get(`/inventory/aggregate/${id}`),
    createAggregateInventory: (payload) => api.post('/inventory/aggregate/create', payload),
    updateAggregateInventory: (id, payload) => api.put(`/inventory/aggregate/update/${id}`, payload),
    deleteAggregateInventory: (id) => api.delete(`/inventory/aggregate/delete/${id}`),

    // ================= Inventory – Admixture =================
    getAllAdmixtureInventory: () => api.get('/inventory/admixture/all'),
    getAdmixtureInventoryById: (id) => api.get(`/inventory/admixture/${id}`),
    createAdmixtureInventory: (payload) => api.post('/inventory/admixture/create', payload),
    updateAdmixtureInventory: (id, payload) => api.put(`/inventory/admixture/update/${id}`, payload),
    deleteAdmixtureInventory: (id) => api.delete(`/inventory/admixture/delete/${id}`),

    // ================= Inventory – SGCI Insert =================
    getAllSgciInventory: () => api.get('/inventory/sgci/all'),
    getSgciInventoryById: (id) => api.get(`/inventory/sgci/${id}`),
    createSgciInventory: (payload) => api.post('/inventory/sgci/create', payload),
    updateSgciInventory: (id, payload) => api.put(`/inventory/sgci/update/${id}`, payload),
    deleteSgciInventory: (id) => api.delete(`/inventory/sgci/delete/${id}`),

    // ================= Sleeper Workflow =================

    /**
     * Initiates workflow when vendor submits a form record.
     * Called from VENDOR side only, NOT from IE dashboard.
     */
    initiateWorkflow: (requestId, moduleId, workflowId, createdBy) =>
        api.post(
            `/sleeper-workflow/initiateWorkflow?requestId=${requestId}&moduleId=${moduleId}&workflowId=${workflowId}&createdBy=${createdBy}`,
            null
        ),

    /**
     * IE Dashboard: fetch all pending workflow transitions for a given role.
     * @param {string} roleName - e.g. "IE"
     * Returns: [{ workflowTransitionId, moduleId, requestId, assignedTo, ... }]
     */
    getAllPendingWorkflowTransitions: (roleName = 'IE') =>
        api.get(`/sleeper-workflow/allPendingWorkflowTransition?roleName=${roleName}`),

    /**
     * IE Action: Verify or Request Change on a workflow transition.
     * @param {object} payload - { workflowTransitionId, action, actionBy, remarks }
     *   action = "VERIFY" | "REQUEST_BACK"
     */
    performTransitionAction: (payload) =>
        api.post('/sleeper-workflow/performTransitionAction', payload),

    // ── Module getById APIs (used by IE dashboard to fetch record details) ──
    // moduleId=1  PLANT_PROFILE
    // getPlantProfileById:       (id) => api.get(`/plant-profile/getById/${id}`),
    getPlantProfileById: (id) => api.get(`/plant-profile/${id}`),


    // moduleId=2  BENCH_MOULD_MASTER
    getBenchMouldMasterById: (id) => api.get(`/bench-mould-inspection/get/${id}`),

    // moduleId=3  RAW_MATERIAL_SOURCE
    getRawMaterialSourceById: (id) => api.get(`/raw-material-source/${id}`),

    // moduleId=4  MIX_DESIGN
    getMixDesignById: (id) => api.get(`/mix-design/${id}`),

    // moduleId=5  HTS Wire
    getHtsWireRecordById: (id) => api.get(`/hts-wire/${id}`),

    // moduleId=6  Cement
    getCementRecordById: (id) => api.get(`/cement/${id}`),

    // moduleId=7  Admixture
    getAdmixtureRecordById: (id) => api.get(`/admixture/${id}`),

    // moduleId=8  Aggregates
    getAggregateRecordById: (id) => api.get(`/aggregates/${id}`),

    // moduleId=9  SGCI Insert
    getSgciRecordById: (id) => api.get(`/sgci-insert/${id}`),

    // moduleId=10 Dowel
    getDowelRecordById: (id) => api.get(`/dowel/${id}`),

    // moduleId=11 Production Declaration
    getProductionDeclarationRecordById: (id) => api.get(`/production-declaration/${id}`),

    /**
     * IE Dashboard: fetch all workflow transitions (including verified) for history.
     */
    getAllWorkflowTransitions: (roleName = 'IE') =>
        api.get(`/sleeper-workflow/allWorkflowTransition?roleName=${roleName}`),

    // ================= Final Inspection Controller =================
    getFinalInspectionBatches: () => api.get('/FinalInspectionController/inspection/batches'),
    getFinalInspectionBatchDetail: (batchId) => api.get(`/FinalInspectionController/inspection/batch/${batchId}`),
    saveFinalInspection: (payload) => api.post('/FinalInspectionController/save', payload),
};
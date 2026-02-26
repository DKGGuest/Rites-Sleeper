import axios from 'axios';

const BASE_URL = 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for standardized error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

export const apiService = {
    // ================= Moisture Analysis =================
    getAllMoistureAnalysis: () => api.get('/MoistureAnalysis/all'),
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
};


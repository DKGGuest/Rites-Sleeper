import axios from 'axios';

const BASE_URL = 'http://localhost:8080/sleeper-backend/api';

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
};


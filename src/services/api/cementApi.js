import { API_BASE_URL } from '../api';

export const saveCement7DayStrength = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-7-day-strength`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save 7 Day Strength record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving 7 Day Strength:', error);
    throw error;
  }
};

export const saveCementNormalConsistency = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-normal-consistency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Normal Consistency record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Normal Consistency:', error);
    throw error;
  }
};

export const saveCementSpecificSurface = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-specific-surface`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Specific Surface record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Specific Surface:', error);
    throw error;
  }
};

export const saveCementSettingTime = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-setting-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Setting Time record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Setting Time:', error);
    throw error;
  }
};

export const saveCementFineness = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-fineness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Fineness record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Fineness:', error);
    throw error;
  }
};

export const getCement7DayStrengthByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-7-day-strength/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch 7 Day Strength');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateCement7DayStrength = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-7-day-strength/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getCementNormalConsistencyByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-normal-consistency/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Normal Consistency');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateCementNormalConsistency = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-normal-consistency/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getCementSpecificSurfaceByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-specific-surface/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Specific Surface');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateCementSpecificSurface = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-specific-surface/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getCementSettingTimeByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-setting-time/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Setting Time');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateCementSettingTime = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-setting-time/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getCementFinenessByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-fineness/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Fineness');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateCementFineness = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-fineness/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

// --- BULK STATUS FETCH ---

export const getBulkCementTestStatus = async (requestIds) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/cement-status/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestIds)
    });
    if (!response.ok) throw new Error('Failed to fetch bulk status');
    const result = await response.json();
    return result.responseData || {};
  } catch (error) {
    console.error('Error fetching bulk status:', error);
    return {};
  }
};

// --- AGGREGATE EDIT ENHANCEMENTS ---

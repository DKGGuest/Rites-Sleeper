import { API_BASE_URL } from '../api';

export const saveAggregate10mmQuality = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-10mm-quality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save 10mm Quality record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving 10mm Quality:', error);
    throw error;
  }
};

export const saveAggregate20mmQuality = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-20mm-quality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save 20mm Quality record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving 20mm Quality:', error);
    throw error;
  }
};

export const saveAggregateFlakiness = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-flakiness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Flakiness record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Flakiness:', error);
    throw error;
  }
};

export const saveAggregateGranulometric = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-granulometric`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Granulometric record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Granulometric:', error);
    throw error;
  }
};

export const saveAggregateSoundness = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-soundness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Soundness record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Soundness:', error);
    throw error;
  }
};

export const getAggregate10mmQualityByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-10mm-quality/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch 10mm Quality');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateAggregate10mmQuality = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-10mm-quality/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update 10mm Quality');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getAggregate20mmQualityByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-20mm-quality/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch 20mm Quality');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateAggregate20mmQuality = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-20mm-quality/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update 20mm Quality');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getAggregateFlakinessByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-flakiness/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Flakiness');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateAggregateFlakiness = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-flakiness/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update Flakiness');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getAggregateGranulometricByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-granulometric/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Granulometric');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateAggregateGranulometric = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-granulometric/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update Granulometric');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getAggregateSoundnessByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-soundness/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Soundness');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const updateAggregateSoundness = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-soundness/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update Soundness');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getBulkAggregateTestStatus = async (requestIds) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/aggregate-status/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestIds)
    });
    if (!response.ok) throw new Error('Failed to fetch bulk aggregate status');
    const result = await response.json();
    return result.responseData || {};
  } catch (error) {
    console.error('Error fetching bulk aggregate status:', error);
    return {};
  }
};

// ==========================================
// ADMIXTURE TESTING (PHASE 2)
// ==========================================

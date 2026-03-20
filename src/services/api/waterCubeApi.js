import { API_BASE_URL } from '../api';

export const saveWaterCubeSample = async (data, id = null) => {
  try {
    const token = localStorage.getItem('authToken');
    const url = id
      ? `${API_BASE_URL}/water-cube-sample/update/${id}`
      : `${API_BASE_URL}/water-cube-sample/create`;

    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save water cube sample declaration');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving water cube sample declaration:', error);
    throw error;
  }
};

export const getWaterCubeSamplesByUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/water-cube-sample/getByUser/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch water cube sample declarations');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching water cube sample declarations:', error);
    return [];
  }
};

export const getWaterCubeSamples = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/water-cube-sample/getAll`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch all water cube sample declarations');
      }
  
      const data = await response.json();
      return data.responseData || data;
    } catch (error) {
      console.error('Error fetching all water cube sample declarations:', error);
      return [];
    }
  };

export const deleteWaterCubeSample = async (id) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/water-cube-sample/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete water cube sample declaration');
    }
  } catch (error) {
    console.error('Error deleting water cube sample declaration:', error);
    throw error;
  }
};

export const saveWaterCubeTestResult = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/water-cube-sample/save-test-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Water Cube Test Result');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Water Cube Test Result:', error);
    throw error;
  }
};

export const getWaterCubeTestResultsByUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/water-cube-sample/test-results/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Water Cube Test Results');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error fetching Water Cube Test Results:', error);
    return [];
  }
};

// --- CEMENT EDIT ENHANCEMENTS ---

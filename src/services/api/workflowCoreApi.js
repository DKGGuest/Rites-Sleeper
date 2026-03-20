import { API_BASE_URL } from '../api';

export const getAllCompletedCalls = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/sleeper-workflow/allCompletedCalls`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch completed calls');
    }

    const data = await response.json();
    // Based on the structure provided by user, response might be a direct array 
    // or wrapped in a responseData object. Assuming direct array or data.responseData.
    return data.responseData?.responseData || data.responseData || data;
  } catch (error) {
    console.error('Error fetching completed calls:', error);
    return [];
  }
};

export const getMaterialDetail = async (type, requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/${type}/${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} details`);
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    return null;
  }
};

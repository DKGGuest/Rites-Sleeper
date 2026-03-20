import { API_BASE_URL } from '../api';

export const saveHtsWireDailyTest = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/hts-wire-daily-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save HTS Wire Daily record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving HTS Wire:', error);
    throw error;
  }
};

export const updateHtsWireDailyTest = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/hts-wire-daily-test/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update HTS Wire Daily record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error updating HTS Wire:', error);
    throw error;
  }
};

export const getHtsWireDailyTestByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/hts-wire-daily-test/request/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch HTS Wire Daily record by Request ID');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error fetching HTS Wire:', error);
    return null;
  }
};

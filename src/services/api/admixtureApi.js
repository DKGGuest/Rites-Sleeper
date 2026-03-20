import { API_BASE_URL } from '../api';

export const saveAdmixtureTest = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admixture-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save Admixture record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving Admixture:', error);
    throw error;
  }
};

export const updateAdmixtureTest = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admixture-test/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update Admixture Test');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); throw error; }
};

export const getAdmixtureTestById = async (id) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admixture-test/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Admixture Test');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

export const getAdmixtureTestByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/admixture-test/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Admixture Test by Request ID');
    const result = await response.json();
    return result.responseData || result;
  } catch (error) { console.error('Error:', error); return null; }
};

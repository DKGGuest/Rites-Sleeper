import { API_BASE_URL } from '../api';

export const saveSgciInsertAudit = async (data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/sgci-insert-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save SGCI Insert Audit record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving SGCI Audit:', error);
    throw error;
  }
};

export const updateSgciInsertAudit = async (id, data) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/sgci-insert-audit/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update SGCI Insert Audit record');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error updating SGCI Audit:', error);
    throw error;
  }
};

export const getSgciInsertAuditByRequestId = async (requestId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/sgci-insert-audit/request/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch SGCI Insert Audit record by Request ID');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error fetching SGCI Audit:', error);
    return null;
  }
};

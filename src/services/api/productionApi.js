import { API_BASE_URL } from '../api';

export const getProductionDeclarations = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/production-declaration/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch production declarations');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching production declarations:', error);
    return [];
  }
};

export const getProductionDeclarationsByUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/production-declaration/getByUser/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch production declarations for user');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching production declarations by user:', error);
    return [];
  }
};

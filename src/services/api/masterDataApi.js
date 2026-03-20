import { API_BASE_URL } from '../api';

export const getCompanyMappingByUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/sleeper-mapping/company-units/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company mapping details');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching company mapping details:', error);
    return null;
  }
};

export const getShedsByVendorCode = async (vendorCode) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/plant-profile/vendor/${vendorCode}/sheds`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sheds for vendor');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching sheds strictly for vendor:', error);
    return [];
  }
};

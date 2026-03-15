/**
 * Workflow Service
 * Handles fetching workflow-related data
 */

import { API_BASE_URL } from './api';

/**
 * Fetch all completed workflow calls
 * @returns {Promise<Array>} List of completed workflow transitions
 */
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
/**
 * Fetch detailed material information by requestId
 * @param {string} type - Material type (e.g., 'cement', 'aggregates')
 * @param {string} requestId - The request ID from the workflow call
 * @returns {Promise<Object>} Detailed material data
 */
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

/**
 * Fetch all Production Declarations
 * @returns {Promise<Array>} List of production declarations
 */
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

/**
 * Fetch Production Declarations by a specific user (fast, filtered at DB level)
 * @param {number|string} userId - The user ID (createdBy)
 * @returns {Promise<Array>} List of production declarations for that user
 */
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

/**
 * Save Water Cube Sample Declaration (Create or Update)
 * @param {Object} data - Declaration data
 * @param {number|string} [id] - Optional ID for update
 * @returns {Promise<Object>} Saved declaration
 */
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

/**
 * Fetch Water Cube Sample Declarations by User
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>} List of declarations
 */
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

/**
 * Delete Water Cube Sample Declaration
 * @param {number|string} id - Declaration ID
 * @returns {Promise<void>}
 */
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

/**
 * Save Water Cube Strength Test Results (Create or Update)
 * @param {Object} data - Test data
 * @param {number|string} [id] - Optional ID for update
 * @returns {Promise<Object>} Saved test result
 */
export const saveWaterCubeStrengthTest = async (data, id = null) => {
  try {
    const token = localStorage.getItem('authToken');
    const url = id 
      ? `${API_BASE_URL}/water-cube-strength/update/${id}`
      : `${API_BASE_URL}/water-cube-strength/create`;
    
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
      throw new Error('Failed to save water cube strength test results');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving water cube strength test results:', error);
    throw error;
  }
};

/**
 * Fetch Water Cube Strength Testing Results by User
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>} List of testing results
 */
export const getWaterCubeStrengthResultsByUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/water-cube-strength/getByUser/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch water cube strength testing results');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching water cube strength testing results:', error);
    return [];
  }
};

/**
 * Fetch Water Cube Strength Testing Result by Declaration ID
 * @param {number|string} declarationId - Declaration ID
 * @returns {Promise<Object>} Testing result
 */
export const getWaterCubeStrengthTestByDeclaration = async (declarationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/water-cube-strength/getByDeclaration/${declarationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch water cube strength test result by declaration');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching water cube strength test result by declaration:', error);
    return null;
  }
};
/**
 * Save Cement 7 Day Strength test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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
/**
 * Save Cement Normal Consistency test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Cement Specific Surface test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Cement Setting Time test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Cement Fineness test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Aggregate 10mm Quality test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Aggregate 20mm Quality test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Aggregate Flakiness & Elongation test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Aggregate Granulometric Curve test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Aggregate Soundness test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save Admixture test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save HTS Wire Daily test result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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

/**
 * Save SGCI Insert Audit result
 * @param {Object} data - Test data record
 * @returns {Promise<Object>} Saved record
 */
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
/**
 * Fetch MR Pending Sample Declarations (Passed Water Cube Tests)
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>} List of pending declarations
 */
export const getMorPendingDeclarations = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/mor-sample/getPending/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch MR pending declarations');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching MR pending declarations:', error);
    return [];
  }
};

/**
 * Save MR Sample Declaration (Create or Update)
 * @param {Object} data - Declaration data
 * @param {number|string} [id] - Optional ID for update
 * @returns {Promise<Object>} Saved declaration
 */
export const saveMorSampleDeclaration = async (data, id = null) => {
  try {
    const token = localStorage.getItem('authToken');
    const url = id 
      ? `${API_BASE_URL}/mor-sample/update/${id}`
      : `${API_BASE_URL}/mor-sample/create`;
    
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
      throw new Error('Failed to save MR sample declaration');
    }

    const result = await response.json();
    return result.responseData || result;
  } catch (error) {
    console.error('Error saving MR sample declaration:', error);
    throw error;
  }
};

/**
 * Fetch Active MR Sample Declarations
 * @returns {Promise<Array>} List of declarations
 */
export const getMorActiveDeclarations = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/mor-sample/getAll/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch MR active declarations');
    }

    const data = await response.json();
    return data.responseData || data;
  } catch (error) {
    console.error('Error fetching MR active declarations:', error);
    return [];
  }
};

/**
 * Fetch Historical MR Records
 * @returns {Promise<Array>} List of historical records
 */
export const getMorHistoricalDeclarations = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/mor-sample/getHistorical/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch MR historical records');
      }
  
      const data = await response.json();
      return data.responseData || data;
    } catch (error) {
      console.error('Error fetching MR historical records:', error);
      return [];
    }
  };
  
  /**
   * Save MR Test Results
   * @param {number|string} declarationId - ID of the declaration
   * @param {Array} results - List of test results for each sleeper
   * @returns {Promise<Object>} Saved results
   */
  export const saveMorTestResults = async (declarationId, results) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/mor-sample/saveResults/${declarationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(results)
      });
  
      if (!response.ok) {
        throw new Error('Failed to save MR test results');
      }
  
      const data = await response.json();
      return data.responseData || data;
    } catch (error) {
      console.error('Error saving MR test results:', error);
      throw error;
    }
  };

/**
 * Delete MR Sample Declaration
 * @param {number|string} id - Declaration ID
 * @returns {Promise<void>}
 */
export const deleteMorSample = async (id) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/mor-sample/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete MR sample declaration');
        }
    } catch (error) {
        console.error('Error deleting MR sample declaration:', error);
        throw error;
    }
};

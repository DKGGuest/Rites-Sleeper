/**
 * useCallDeskData Hook
 * Main data hook for Call Desk Module
 */

import { useState, useEffect } from 'react';
import {
  MOCK_PENDING_VERIFICATION_CALLS,
  MOCK_VERIFIED_OPEN_CALLS,
  MOCK_DISPOSED_CALLS,
  MOCK_DASHBOARD_KPIS,
  MOCK_VENDORS,
  MOCK_RIO_OFFICES,
  MOCK_CALL_HISTORY
} from '../utils/mockData';

/**
 * Custom hook for Call Desk data management
 */
export const useCallDeskData = () => {
  const [pendingCalls, setPendingCalls] = useState([]);
  const [verifiedCalls, setVerifiedCalls] = useState([]);
  const [disposedCalls, setDisposedCalls] = useState([]);
  const [dashboardKPIs, setDashboardKPIs] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [rioOffices, setRioOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate API call to fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set mock data
      setPendingCalls(MOCK_PENDING_VERIFICATION_CALLS);
      setVerifiedCalls(MOCK_VERIFIED_OPEN_CALLS);
      setDisposedCalls(MOCK_DISPOSED_CALLS);
      setDashboardKPIs(MOCK_DASHBOARD_KPIS);
      setVendors(MOCK_VENDORS);
      setRioOffices(MOCK_RIO_OFFICES);

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Get call by ID
  const getCallById = (callId) => {
    const allCalls = [...pendingCalls, ...verifiedCalls, ...disposedCalls];
    return allCalls.find(call => call.id === callId || call.callNumber === callId);
  };

  // Get call history
  const getCallHistory = (callNumber) => {
    return MOCK_CALL_HISTORY[callNumber] || [];
  };

  // Get calls by status
  const getCallsByStatus = (status) => {
    const allCalls = [...pendingCalls, ...verifiedCalls, ...disposedCalls];
    return allCalls.filter(call => call.status === status);
  };

  // Get calls by RIO
  const getCallsByRIO = (rio) => {
    const allCalls = [...pendingCalls, ...verifiedCalls, ...disposedCalls];
    return allCalls.filter(call => call.rio === rio);
  };

  // Get vendor by ID
  const getVendorById = (vendorId) => {
    return vendors.find(vendor => vendor.id === vendorId);
  };

  // Refresh data
  const refreshData = () => {
    fetchData();
  };

  return {
    // Data
    pendingCalls,
    verifiedCalls,
    disposedCalls,
    dashboardKPIs,
    vendors,
    rioOffices,
    
    // State
    loading,
    error,
    
    // Functions
    getCallById,
    getCallHistory,
    getCallsByStatus,
    getCallsByRIO,
    getVendorById,
    refreshData
  };
};

export default useCallDeskData;


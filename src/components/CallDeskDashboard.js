/**
 * Call Desk Dashboard Component
 * Main dashboard component with 3 tabs
 */

import React, { useState } from 'react';
import Tabs from './Tabs';
import PendingVerificationTab from './PendingVerificationTab';
import VerifiedOpenCallsTab from './VerifiedOpenCallsTab';
import DisposedCallsTab from './DisposedCallsTab';
import useCallDeskData from '../hooks/useCallDeskData';
import useCallActions from '../hooks/useCallActions';
import '../styles/CallDeskDashboard.css';

const CallDeskDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [selectedRIO, setSelectedRIO] = useState('');
  const [flaggedFields, setFlaggedFields] = useState([]);

  // Hooks
  const {
    pendingCalls,
    verifiedCalls,
    disposedCalls,
    dashboardKPIs,
    rioOffices,
    loading,
    error,
    getCallHistory,
    refreshData
  } = useCallDeskData();

  const {
    verifyAndAccept,
    returnForRectification,
    rerouteToRIO,
    loading: actionLoading
  } = useCallActions();

  // Tab configuration
  const tabs = [
    {
      id: 'pending',
      label: 'Pending Verification',
      count: dashboardKPIs?.pendingVerification?.total || 0
    },
    {
      id: 'verified',
      label: 'Verified & Open Calls',
      count: dashboardKPIs?.verifiedOpen?.total || 0
    },
    {
      id: 'disposed',
      label: 'Disposed Calls',
      count: dashboardKPIs?.disposed?.total || 0
    }
  ];

  // Action handlers
  const handleViewHistory = (call) => {
    setSelectedCall(call);
    setShowHistoryModal(true);
  };

  const handleViewDetails = (call) => {
    setSelectedCall(call);
    setShowDetailsModal(true);
  };

  const handleVerifyAccept = (call) => {
    setSelectedCall(call);
    setActionRemarks('');
    setShowVerifyModal(true);
  };

  const handleReturn = (call) => {
    setSelectedCall(call);
    setActionRemarks('');
    setFlaggedFields([]);
    setShowReturnModal(true);
  };

  const handleReroute = (call) => {
    setSelectedCall(call);
    setActionRemarks('');
    setSelectedRIO('');
    setShowRerouteModal(true);
  };

  // Submit actions
  const submitVerify = async () => {
    if (!selectedCall) return;

    const result = await verifyAndAccept(selectedCall.id, actionRemarks);
    if (result.success) {
      alert('Call verified and registered successfully!');
      setShowVerifyModal(false);
      refreshData();
    } else {
      alert(result.message);
    }
  };

  const submitReturn = async () => {
    // Validation: Check if remarks are provided
    if (!selectedCall || !actionRemarks.trim()) {
      alert('Remarks are mandatory for returning a call');
      return;
    }

    // Validation: Check if at least one field is flagged
    if (flaggedFields.length === 0) {
      alert('Please select at least one field that requires correction');
      return;
    }

    const result = await returnForRectification(selectedCall.id, actionRemarks, flaggedFields);
    if (result.success) {
      alert('Call returned for rectification successfully!');
      setShowReturnModal(false);
      setActionRemarks('');
      setFlaggedFields([]);
      refreshData();
    } else {
      alert(result.message);
    }
  };

  const submitReroute = async () => {
    if (!selectedCall || !selectedRIO || !actionRemarks.trim()) {
      alert('Target RIO and remarks are mandatory for re-routing');
      return;
    }

    const result = await rerouteToRIO(selectedCall.id, selectedRIO, actionRemarks);
    if (result.success) {
      alert(`Call re-routed to ${selectedRIO} successfully!`);
      setShowRerouteModal(false);
      refreshData();
    } else {
      alert(result.message);
    }
  };

  // Toggle flagged field
  const toggleFlaggedField = (field) => {
    setFlaggedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading Call Desk Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p className="error-message">❌ {error}</p>
          <button className="btn btn-primary" onClick={refreshData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">Call Desk Dashboard</span>
      </div>

      {/* Page Title */}
      <h1 className="page-title">Call Desk Dashboard</h1>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <PendingVerificationTab
          calls={pendingCalls}
          kpis={dashboardKPIs?.pendingVerification || {}}
          onVerifyAccept={handleVerifyAccept}
          onReturn={handleReturn}
          onReroute={handleReroute}
          onViewHistory={handleViewHistory}
          onViewDetails={handleViewDetails}
        />
      )}

      {activeTab === 'verified' && (
        <VerifiedOpenCallsTab
          calls={verifiedCalls}
          kpis={dashboardKPIs?.verifiedOpen || {}}
          onViewHistory={handleViewHistory}
        />
      )}

      {activeTab === 'disposed' && (
        <DisposedCallsTab
          calls={disposedCalls}
          kpis={dashboardKPIs?.disposed || {}}
          onViewHistory={handleViewHistory}
        />
      )}

      {/* Call History Modal */}
      {showHistoryModal && selectedCall && (
        <div className="form-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="form-modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <span className="form-modal-header-title">Call History - {selectedCall.callNumber}</span>
              <button className="form-modal-close" onClick={() => setShowHistoryModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-modal-body">
              <div className="call-history-timeline">
                {getCallHistory(selectedCall.callNumber).map((entry, index) => (
                  <div key={index} className="timeline-entry">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">{new Date(entry.timestamp).toLocaleString()}</div>
                      <div className="timeline-action" style={{ fontWeight: 600, color: '#111827' }}>{entry.action}</div>
                      <div className="timeline-user">By: {entry.user}</div>
                      {entry.remarks && <div className="timeline-remarks" style={{ marginTop: '4px', fontStyle: 'italic', color: '#64748b' }}>{entry.remarks}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      {showDetailsModal && selectedCall && (
        <div className="form-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <span className="form-modal-header-title">Call Details - {selectedCall.callNumber}</span>
              <button className="form-modal-close" onClick={() => setShowDetailsModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Call Number:</label>
                  <span>{selectedCall.callNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Vendor:</label>
                  <span>{selectedCall.vendor?.name}</span>
                </div>
                <div className="detail-item">
                  <label>PO Number:</label>
                  <span>{selectedCall.poNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Product - Stage:</label>
                  <span>{selectedCall.productStage}</span>
                </div>
                <div className="detail-item">
                  <label>Quantity:</label>
                  <span>{selectedCall.quantity} units</span>
                </div>
                <div className="detail-item">
                  <label>Desired Inspection Date:</label>
                  <span>{new Date(selectedCall.desiredInspectionDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Place of Inspection:</label>
                  <span>{selectedCall.placeOfInspection}</span>
                </div>
                <div className="detail-item">
                  <label>RIO:</label>
                  <span>{selectedCall.rio}</span>
                </div>
                <div className="detail-item">
                  <label>Submission Count:</label>
                  <span>{selectedCall.submissionCount}</span>
                </div>
                {selectedCall.returnReason && (
                  <div className="detail-item full-width">
                    <label>Return Reason:</label>
                    <span className="text-warning">{selectedCall.returnReason}</span>
                  </div>
                )}
                {selectedCall.documents && (
                  <div className="detail-item full-width">
                    <label>Documents:</label>
                    <div className="document-list">
                      {selectedCall.documents.map((doc, idx) => (
                        <span key={idx} className="document-badge">📄 {doc}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-modal-footer" style={{ background: 'white' }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify & Accept Modal */}
      {showVerifyModal && selectedCall && (
        <div className="form-modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="form-modal-container" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <span className="form-modal-header-title">Verify & Accept Call - {selectedCall.callNumber}</span>
              <button className="form-modal-close" onClick={() => setShowVerifyModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-modal-body">
              <p className="modal-description" style={{ marginBottom: '20px', color: '#475467' }}>
                Are you sure you want to verify and accept this call? The call will be registered and moved to the verified queue.
              </p>
              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Remarks (Optional):</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter any remarks or notes..."
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', padding: '12px' }}
                />
              </div>
            </div>
            <div className="form-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={submitVerify}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : '✅ Verify & Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return for Rectification Modal */}
      {showReturnModal && selectedCall && (
        <div className="form-modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="form-modal-container" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <span className="form-modal-header-title">Return for Rectification - {selectedCall.callNumber}</span>
              <button className="form-modal-close" onClick={() => setShowReturnModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-modal-body">
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 600 }}>Flagged Fields for Correction: <span className="text-danger">*</span></label>
                <p className="field-description" style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Select the specific sections that require correction by the vendor</p>
                <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { value: 'poDetails', label: '📄 PO Details' },
                    { value: 'deliveryPeriod', label: '📅 Delivery Period' },
                    { value: 'maDetails', label: '📋 MA Details' },
                    { value: 'quantity', label: '🔢 Quantity' },
                    { value: 'placeOfInspection', label: '📍 Place of Inspection' },
                    { value: 'subPoDetails', label: '📦 Sub PO Details' }
                  ].map(field => (
                    <label key={field.value} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={flaggedFields.includes(field.value)}
                        onChange={() => toggleFlaggedField(field.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '14px' }}>{field.label}</span>
                    </label>
                  ))}
                </div>
                {flaggedFields.length === 0 && (
                  <p className="validation-hint text-danger" style={{ marginTop: '8px', fontSize: '13px' }}>
                    ⚠️ Please select at least one field that requires correction
                  </p>
                )}
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Remarks (Mandatory): <span className="text-danger">*</span></label>
                <p className="field-description" style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Provide exact details about the issues identified in the selected fields above</p>
                <textarea
                  className="form-control"
                  rows="5"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter detailed explanation of the issues found in the flagged fields. Be specific about what needs to be corrected..."
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', padding: '12px' }}
                  required
                />
                {actionRemarks.trim().length === 0 && (
                  <p className="validation-hint text-danger" style={{ marginTop: '8px', fontSize: '13px' }}>
                    ⚠️ Remarks are mandatory for returning a call
                  </p>
                )}
              </div>
            </div>
            <div className="form-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={submitReturn}
                disabled={actionLoading || !actionRemarks.trim() || flaggedFields.length === 0}
              >
                {actionLoading ? 'Processing...' : '↩️ Return for Rectification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-route to RIO Modal */}
      {showRerouteModal && selectedCall && (
        <div className="form-modal-overlay" onClick={() => setShowRerouteModal(false)}>
          <div className="form-modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <span className="form-modal-header-title">Re-route to Another RIO - {selectedCall.callNumber}</span>
              <button className="form-modal-close" onClick={() => setShowRerouteModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="form-modal-body">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Target RIO: <span className="text-danger">*</span></label>
                <select
                  className="form-control"
                  value={selectedRIO}
                  onChange={(e) => setSelectedRIO(e.target.value)}
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px' }}
                  required
                >
                  <option value="">Select RIO...</option>
                  {rioOffices.filter(rio => rio.code !== selectedCall.rio).map(rio => (
                    <option key={rio.id} value={rio.code}>
                      {rio.name} ({rio.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Remarks (Mandatory): <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter reason for re-routing..."
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #d1d5db', padding: '12px' }}
                  required
                />
              </div>
            </div>
            <div className="form-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRerouteModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitReroute}
                disabled={actionLoading || !selectedRIO || !actionRemarks.trim()}
              >
                {actionLoading ? 'Processing...' : '🔀 Re-route Call'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallDeskDashboard;


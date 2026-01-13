/**
 * Call Details Modal Component
 * Displays comprehensive call information in three sections:
 * 1. PO Details
 * 2. Inspection Call Details
 * 3. Sub PO Details
 *
 * Updated: 2025-01-01 - Added verification action buttons
 */

import React from 'react';
import { formatDateTime, formatDate } from '../utils/helpers';

const CallDetailsModal = ({
  isOpen,
  onClose,
  call,
  onVerifyAccept
}) => {
  if (!isOpen || !call) return null;

  // Handle action button clicks
  const handleVerifyAccept = () => {
    if (onVerifyAccept) {
      onVerifyAccept(call);
    }
  };

  // Helper to display value or fallback
  const displayValue = (value, fallback = '-') => {
    return value || fallback;
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div
        className="form-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px' }}
      >
        {/* Modal Header */}
        <div className="form-modal-header">
          <span className="form-modal-header-title">Call Details - {call.callNumber}</span>
          <button className="form-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="form-modal-body" style={{ background: '#f8fafc' }}>

          {/* Section 1: PO Details */}
          <div className="details-section" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <h3 className="section-title" style={{ margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
              <span className="section-icon">📄</span>
              PO Details
            </h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>PO Number</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.poNumber)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>PO Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.poDate ? formatDate(call.poDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>PO Quantity</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.poQuantity)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Vendor Name</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.vendor?.name)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>MA Number</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.maNumber)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>MA Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.maDate ? formatDate(call.maDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Purchasing Authority</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.purchasingAuthority)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Bill Paying Officer</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.billPayingOfficer)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Inspection Call Details */}
          <div className="details-section" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <h3 className="section-title" style={{ margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
              <span className="section-icon">🔍</span>
              Inspection Call Details
            </h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>PO + Serial Number</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.poSerialNumber)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Call Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.submissionDateTime ? formatDateTime(call.submissionDateTime) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Desired Date of Inspection</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.desiredInspectionDate ? formatDate(call.desiredInspectionDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Item Description</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.itemDescription)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Original Delivery Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.originalDeliveryDate ? formatDate(call.originalDeliveryDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Extended Delivery Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.extendedDeliveryDate ? formatDate(call.extendedDeliveryDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Original DP Start</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.originalDPStart ? formatDate(call.originalDPStart) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Call Quantity</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.quantity)}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 3' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Place of Inspection</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.placeOfInspection)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Sub PO Details */}
          <div className="details-section" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 className="section-title" style={{ margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
              <span className="section-icon">📋</span>
              Sub PO Details
            </h3>
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sub PO Number</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.subPoNumber)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sub PO Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.subPoDate ? formatDate(call.subPoDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>TC Number</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.tcNumber)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>TC Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.tcDate ? formatDate(call.tcDate) : null)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Manufacturer of Material</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.manufacturerOfMaterial)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sub PO Quantity</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.subPoQuantity)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Invoice Number</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.invoiceNumber)}</span>
              </div>
              <div className="detail-item">
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Invoice Date</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.invoiceDate ? formatDate(call.invoiceDate) : null)}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 3' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Place of Inspection</label>
                <span style={{ fontWeight: 500, color: '#111827' }}>{displayValue(call.subPoPlaceOfInspection || call.placeOfInspection)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="form-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-success"
            onClick={handleVerifyAccept}
            title="Verify and Accept Call"
          >
            ✅ Verify & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallDetailsModal;


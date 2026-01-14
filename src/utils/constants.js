/**
 * Call Desk Module Constants
 * Centralized constants for the Call Desk Module
 */

// Call Status Constants
export const CALL_STATUS = {
  // Pending Verification Section
  PENDING_VERIFICATION: 'pending_verification',
  FRESH_SUBMISSION: 'fresh_submission',
  RESUBMISSION: 'resubmission',
  RETURNED: 'returned',
  
  // Verified & Open Section
  VERIFIED_REGISTERED: 'verified_registered',
  IE_ASSIGNMENT_PENDING: 'ie_assignment_pending',
  ASSIGNED_TO_IE: 'assigned_to_ie',
  SCHEDULED: 'scheduled',
  UNDER_INSPECTION: 'under_inspection',
  UNDER_LAB_TESTING: 'under_lab_testing',
  IC_PENDING: 'ic_pending',
  BILLING_PENDING: 'billing_pending',
  PAYMENT_PENDING: 'payment_pending',
  
  // Disposed Section
  COMPLETED: 'completed',
  WITHDRAWN: 'withdrawn',
  CANCELLED_CHARGEABLE: 'cancelled_chargeable',
  CANCELLED_NON_CHARGEABLE: 'cancelled_non_chargeable',
  REJECTED_CLOSED: 'rejected_closed'
};

// Call Status Display Configuration
export const CALL_STATUS_CONFIG = {
  [CALL_STATUS.PENDING_VERIFICATION]: {
    label: 'Pending Verification',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.25)'
  },
  [CALL_STATUS.FRESH_SUBMISSION]: {
    label: 'Fresh Submission',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.25)'
  },
  [CALL_STATUS.RESUBMISSION]: {
    label: 'Resubmission',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.25)'
  },
  [CALL_STATUS.RETURNED]: {
    label: 'Returned',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  [CALL_STATUS.VERIFIED_REGISTERED]: {
    label: 'Verified & Registered',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.25)'
  },
  [CALL_STATUS.IE_ASSIGNMENT_PENDING]: {
    label: 'IE Assignment Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.25)'
  },
  [CALL_STATUS.ASSIGNED_TO_IE]: {
    label: 'Assigned to IE',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.25)'
  },
  [CALL_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.25)'
  },
  [CALL_STATUS.UNDER_INSPECTION]: {
    label: 'Under Inspection',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.25)'
  },
  [CALL_STATUS.UNDER_LAB_TESTING]: {
    label: 'Under Lab Testing',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.25)'
  },
  [CALL_STATUS.IC_PENDING]: {
    label: 'IC Pending',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  [CALL_STATUS.BILLING_PENDING]: {
    label: 'Billing Pending',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.25)'
  },
  [CALL_STATUS.PAYMENT_PENDING]: {
    label: 'Payment Pending',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    borderColor: 'rgba(107, 114, 128, 0.25)'
  },
  [CALL_STATUS.COMPLETED]: {
    label: 'Completed',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.25)'
  },
  [CALL_STATUS.WITHDRAWN]: {
    label: 'Withdrawn by Vendor',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    borderColor: 'rgba(107, 114, 128, 0.25)'
  },
  [CALL_STATUS.CANCELLED_CHARGEABLE]: {
    label: 'Cancelled (Chargeable)',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  [CALL_STATUS.CANCELLED_NON_CHARGEABLE]: {
    label: 'Cancelled (Non-chargeable)',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.25)'
  },
  [CALL_STATUS.REJECTED_CLOSED]: {
    label: 'Rejected & Closed',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.25)'
  }
};

// Product Types
export const PRODUCT_TYPES = {
  ERC: 'ERC',
  SLEEPER: 'Sleeper',
  GRSP: 'GRSP'
};

// Inspection Stages
export const INSPECTION_STAGES = {
  RAW_MATERIAL: 'RM',
  PROCESS: 'Process',
  FINAL: 'Final'
};

// RIO (Regional Inspection Office) Types
export const RIO_TYPES = {
  CRIO: 'CRIO',
  ERIO: 'ERIO',
  NRIO: 'NRIO',
  SRIO: 'SRIO',
  WRIO: 'WRIO'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Local Storage Keys
export const STORAGE_KEYS = {
  CALL_DESK_FILTERS: 'call_desk_module_filters',
  CALL_DESK_PREFERENCES: 'call_desk_module_preferences'
};


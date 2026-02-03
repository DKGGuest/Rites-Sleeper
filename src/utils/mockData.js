/**
 * Call Desk Module Mock Data
 * Comprehensive mock data for demonstration and testing
 */

import { CALL_STATUS, PRODUCT_TYPES, INSPECTION_STAGES, RIO_TYPES } from './constants';

// Mock Vendors
export const MOCK_VENDORS = [
  { id: 'V001', name: 'Global Materials Corp', location: 'Mumbai', contact: '+91-9876543210', email: 'contact@globalmat.com' },
  { id: 'V002', name: 'Premium Materials Inc', location: 'Delhi', contact: '+91-9876543211', email: 'info@premiummat.com' },
  { id: 'V003', name: 'Steel Industries Ltd', location: 'Bangalore', contact: '+91-9876543212', email: 'sales@steelindustries.com' },
  { id: 'V004', name: 'Quality Forge Pvt Ltd', location: 'Chennai', contact: '+91-9876543213', email: 'quality@forge.com' },
  { id: 'V005', name: 'Precision Engineering Co', location: 'Pune', contact: '+91-9876543214', email: 'contact@precision.com' },
  { id: 'V006', name: 'Advanced Metallurgy Works', location: 'Kolkata', contact: '+91-9876543215', email: 'info@advancedmet.com' }
];

// Mock RIO Offices
export const MOCK_RIO_OFFICES = [
  { id: 'CRIO', name: 'Central Regional Inspection Office', location: 'Delhi', code: RIO_TYPES.CRIO },
  { id: 'ERIO', name: 'Eastern Regional Inspection Office', location: 'Kolkata', code: RIO_TYPES.ERIO },
  { id: 'NRIO', name: 'Northern Regional Inspection Office', location: 'Chandigarh', code: RIO_TYPES.NRIO },
  { id: 'SRIO', name: 'Southern Regional Inspection Office', location: 'Chennai', code: RIO_TYPES.SRIO },
  { id: 'WRIO', name: 'Western Regional Inspection Office', location: 'Mumbai', code: RIO_TYPES.WRIO }
];

// Mock Pending Verification Calls
export const MOCK_PENDING_VERIFICATION_CALLS = [
  {
    id: 'CALL-2025-PV-001',
    callNumber: 'CALL-2025-PV-001',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-24T09:30:00',
    poNumber: 'PO-2024-1234',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-02-05',
    placeOfInspection: 'Mumbai Plant - Unit 1',
    status: CALL_STATUS.FRESH_SUBMISSION,
    rio: RIO_TYPES.WRIO,
    quantity: 1500,
    submissionCount: 1,
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf'],
    // PO Details
    poDate: '2024-11-15',
    poQuantity: 5000,
    maNumber: 'MA-2024-789',
    maDate: '2024-10-01',
    purchasingAuthority: 'Railway Board, New Delhi',
    billPayingOfficer: 'Accounts Officer, WRIO Mumbai',
    // Inspection Call Details
    poSerialNumber: 'PO-2024-1234/001',
    itemDescription: 'Elastic Rail Clips - Type ERC-60',
    originalDeliveryDate: '2025-01-31',
    extendedDeliveryDate: '2025-02-28',
    originalDPStart: '2024-12-01',
    // Sub PO Details
    subPoNumber: 'SUB-PO-2024-1234-A',
    subPoDate: '2024-12-10',
    tcNumber: 'TC-2024-5678',
    tcDate: '2024-12-20',
    manufacturerOfMaterial: 'Steel Authority of India Ltd (SAIL)',
    subPoQuantity: 1500,
    invoiceNumber: 'INV-2025-001',
    invoiceDate: '2025-01-20',
    subPoPlaceOfInspection: 'Mumbai Plant - Unit 1'
  },
  {
    id: 'CALL-2025-PV-002',
    callNumber: 'CALL-2025-PV-002',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-24T10:15:00',
    poNumber: 'PO-2024-1235',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-06',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.RESUBMISSION,
    rio: RIO_TYPES.CRIO,
    quantity: 2000,
    submissionCount: 2,
    returnReason: 'Incomplete documentation - TC missing',
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf', 'Revised_TC.pdf'],
    // PO Details
    poDate: '2024-11-20',
    poQuantity: 8000,
    maNumber: 'MA-2024-790',
    maDate: '2024-10-05',
    purchasingAuthority: 'Railway Board, New Delhi',
    billPayingOfficer: 'Accounts Officer, CRIO Delhi',
    // Inspection Call Details
    poSerialNumber: 'PO-2024-1235/002',
    itemDescription: 'Concrete Sleepers - PSC Type',
    originalDeliveryDate: '2025-02-15',
    extendedDeliveryDate: '2025-03-15',
    originalDPStart: '2024-12-15',
    // Sub PO Details
    subPoNumber: 'SUB-PO-2024-1235-B',
    subPoDate: '2024-12-18',
    tcNumber: 'TC-2024-5679',
    tcDate: '2024-12-28',
    manufacturerOfMaterial: 'Premium Concrete Industries',
    subPoQuantity: 2000,
    invoiceNumber: 'INV-2025-002',
    invoiceDate: '2025-01-22',
    subPoPlaceOfInspection: 'Delhi Manufacturing Facility'
  },
  {
    id: 'CALL-2025-PV-003',
    callNumber: 'CALL-2025-PV-003',
    vendor: MOCK_VENDORS[2],
    submissionDateTime: '2025-01-24T11:00:00',
    poNumber: 'PO-2024-1236',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-02-07',
    placeOfInspection: 'Bangalore Production Unit',
    status: CALL_STATUS.FRESH_SUBMISSION,
    rio: RIO_TYPES.SRIO,
    quantity: 1200,
    submissionCount: 1,
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf', 'Test_Report.pdf'],
    // PO Details
    poDate: '2024-11-25',
    poQuantity: 6000,
    maNumber: 'MA-2024-791',
    maDate: '2024-10-10',
    purchasingAuthority: 'Railway Board, New Delhi',
    billPayingOfficer: 'Accounts Officer, SRIO Bangalore',
    // Inspection Call Details
    poSerialNumber: 'PO-2024-1236/003',
    itemDescription: 'Guide Rail Securing Plates - GRSP Type',
    originalDeliveryDate: '2025-02-20',
    extendedDeliveryDate: null,
    originalDPStart: '2024-12-20',
    // Sub PO Details
    subPoNumber: 'SUB-PO-2024-1236-C',
    subPoDate: '2024-12-22',
    tcNumber: 'TC-2024-5680',
    tcDate: '2025-01-05',
    manufacturerOfMaterial: 'Steel Industries Ltd',
    subPoQuantity: 1200,
    invoiceNumber: 'INV-2025-003',
    invoiceDate: '2025-01-23',
    subPoPlaceOfInspection: 'Bangalore Production Unit'
  },
  {
    id: 'CALL-2025-PV-004',
    callNumber: 'CALL-2025-PV-004',
    vendor: MOCK_VENDORS[3],
    submissionDateTime: '2025-01-23T14:30:00',
    poNumber: 'PO-2024-1237',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-08',
    placeOfInspection: 'Chennai Forge Works',
    status: CALL_STATUS.RETURNED,
    rio: RIO_TYPES.SRIO,
    quantity: 1800,
    submissionCount: 3,
    returnReason: 'PO number mismatch with documents',
    flaggedFields: ['poNumber', 'quantity'],
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf'],
    // PO Details
    poDate: '2024-11-18',
    poQuantity: 7000,
    maNumber: 'MA-2024-792',
    maDate: '2024-10-12',
    purchasingAuthority: 'Railway Board, New Delhi',
    billPayingOfficer: 'Accounts Officer, SRIO Chennai',
    // Inspection Call Details
    poSerialNumber: 'PO-2024-1237/004',
    itemDescription: 'Elastic Rail Clips - Type ERC-60',
    originalDeliveryDate: '2025-02-10',
    extendedDeliveryDate: '2025-03-10',
    originalDPStart: '2024-12-10',
    // Sub PO Details
    subPoNumber: 'SUB-PO-2024-1237-D',
    subPoDate: '2024-12-15',
    tcNumber: null,
    tcDate: null,
    manufacturerOfMaterial: 'Quality Forge Pvt Ltd',
    subPoQuantity: 1800,
    invoiceNumber: null,
    invoiceDate: null,
    subPoPlaceOfInspection: 'Chennai Forge Works'
  },
  {
    id: 'CALL-2025-PV-005',
    callNumber: 'CALL-2025-PV-005',
    vendor: MOCK_VENDORS[4],
    submissionDateTime: '2025-01-24T08:45:00',
    poNumber: 'PO-2024-1238',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-02-09',
    placeOfInspection: 'Pune Steel Plant',
    status: CALL_STATUS.FRESH_SUBMISSION,
    rio: RIO_TYPES.WRIO,
    quantity: 2500,
    submissionCount: 1,
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing.pdf', 'Material_Cert.pdf']
  },
  {
    id: 'CALL-2025-PV-006',
    callNumber: 'CALL-2025-PV-006',
    vendor: MOCK_VENDORS[5],
    submissionDateTime: '2025-01-23T16:20:00',
    poNumber: 'PO-2024-1239',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-02-10',
    placeOfInspection: 'Kolkata Manufacturing Hub',
    status: CALL_STATUS.RESUBMISSION,
    rio: RIO_TYPES.ERIO,
    quantity: 1600,
    submissionCount: 2,
    returnReason: 'Drawing revision mismatch',
    documents: ['PO_Copy.pdf', 'TC_Certificate.pdf', 'Drawing_Rev2.pdf']
  }
];

// Mock Verified & Open Calls
export const MOCK_VERIFIED_OPEN_CALLS = [
  {
    id: 'CALL-2025-VO-001',
    callNumber: 'CALL-2025-VO-001',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-20T09:00:00',
    poNumber: 'PO-2024-1220',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-02-01',
    placeOfInspection: 'Mumbai Plant - Unit 2',
    status: CALL_STATUS.VERIFIED_REGISTERED,
    rio: RIO_TYPES.WRIO,
    quantity: 1400,
    verifiedDate: '2025-01-20T14:30:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar'
  },
  {
    id: 'CALL-2025-VO-002',
    callNumber: 'CALL-2025-VO-002',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-19T10:30:00',
    poNumber: 'PO-2024-1221',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-02',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.IE_ASSIGNMENT_PENDING,
    rio: RIO_TYPES.CRIO,
    quantity: 1900,
    verifiedDate: '2025-01-19T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma'
  },
  {
    id: 'CALL-2025-VO-003',
    callNumber: 'CALL-2025-VO-003',
    vendor: MOCK_VENDORS[2],
    submissionDateTime: '2025-01-18T11:15:00',
    poNumber: 'PO-2024-1222',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-02-03',
    placeOfInspection: 'Bangalore Production Unit',
    status: CALL_STATUS.ASSIGNED_TO_IE,
    rio: RIO_TYPES.SRIO,
    quantity: 1100,
    verifiedDate: '2025-01-18T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Rajesh Kumar',
    assignedDate: '2025-01-19T10:00:00'
  },
  {
    id: 'CALL-2025-VO-004',
    callNumber: 'CALL-2025-VO-004',
    vendor: MOCK_VENDORS[3],
    submissionDateTime: '2025-01-17T09:45:00',
    poNumber: 'PO-2024-1223',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-02-04',
    placeOfInspection: 'Chennai Forge Works',
    status: CALL_STATUS.SCHEDULED,
    rio: RIO_TYPES.SRIO,
    quantity: 1700,
    verifiedDate: '2025-01-17T14:00:00',
    verifiedBy: 'Call Desk Officer - Sneha Reddy',
    assignedIE: 'IE - Priya Sharma',
    assignedDate: '2025-01-18T09:00:00',
    scheduledDate: '2025-02-04'
  },
  {
    id: 'CALL-2025-VO-005',
    callNumber: 'CALL-2025-VO-005',
    vendor: MOCK_VENDORS[4],
    submissionDateTime: '2025-01-16T13:20:00',
    poNumber: 'PO-2024-1224',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-01-28',
    placeOfInspection: 'Pune Steel Plant',
    status: CALL_STATUS.UNDER_INSPECTION,
    rio: RIO_TYPES.WRIO,
    quantity: 2200,
    verifiedDate: '2025-01-16T16:00:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar',
    assignedIE: 'IE - Amit Patel',
    assignedDate: '2025-01-17T10:00:00',
    scheduledDate: '2025-01-28',
    inspectionStartDate: '2025-01-28T09:00:00'
  },
  {
    id: 'CALL-2025-VO-006',
    callNumber: 'CALL-2025-VO-006',
    vendor: MOCK_VENDORS[5],
    submissionDateTime: '2025-01-15T10:00:00',
    poNumber: 'PO-2024-1225',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-27',
    placeOfInspection: 'Kolkata Manufacturing Hub',
    status: CALL_STATUS.UNDER_LAB_TESTING,
    rio: RIO_TYPES.ERIO,
    quantity: 1300,
    verifiedDate: '2025-01-15T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma',
    assignedIE: 'IE - Vikram Singh',
    assignedDate: '2025-01-16T09:00:00',
    scheduledDate: '2025-01-27',
    inspectionStartDate: '2025-01-27T08:30:00',
    labTestingStartDate: '2025-01-29T10:00:00'
  },
  {
    id: 'CALL-2025-VO-007',
    callNumber: 'CALL-2025-VO-007',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-14T11:30:00',
    poNumber: 'PO-2024-1226',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-26',
    placeOfInspection: 'Mumbai Plant - Unit 3',
    status: CALL_STATUS.IC_PENDING,
    rio: RIO_TYPES.WRIO,
    quantity: 1550,
    verifiedDate: '2025-01-14T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Rajesh Kumar',
    assignedDate: '2025-01-15T09:00:00',
    scheduledDate: '2025-01-26',
    inspectionStartDate: '2025-01-26T09:00:00',
    inspectionCompletedDate: '2025-01-27T17:00:00'
  },
  {
    id: 'CALL-2025-VO-008',
    callNumber: 'CALL-2025-VO-008',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-13T09:15:00',
    poNumber: 'PO-2024-1227',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-25',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.BILLING_PENDING,
    rio: RIO_TYPES.CRIO,
    quantity: 2100,
    verifiedDate: '2025-01-13T14:00:00',
    verifiedBy: 'Call Desk Officer - Sneha Reddy',
    assignedIE: 'IE - Priya Sharma',
    assignedDate: '2025-01-14T09:00:00',
    scheduledDate: '2025-01-25',
    inspectionStartDate: '2025-01-25T08:00:00',
    inspectionCompletedDate: '2025-01-26T16:00:00',
    icIssuedDate: '2025-01-27T11:00:00'
  }
];

// Mock Disposed Calls
export const MOCK_DISPOSED_CALLS = [
  {
    id: 'CALL-2025-D-001',
    callNumber: 'CALL-2025-D-001',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-05T09:00:00',
    poNumber: 'PO-2024-1200',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-01-15',
    placeOfInspection: 'Mumbai Plant - Unit 1',
    status: CALL_STATUS.COMPLETED,
    rio: RIO_TYPES.WRIO,
    quantity: 1500,
    verifiedDate: '2025-01-05T14:00:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar',
    assignedIE: 'IE - Rajesh Kumar',
    completedDate: '2025-01-20T17:00:00',
    disposalReason: 'Inspection completed successfully'
  },
  {
    id: 'CALL-2025-D-002',
    callNumber: 'CALL-2025-D-002',
    vendor: MOCK_VENDORS[1],
    submissionDateTime: '2025-01-06T10:30:00',
    poNumber: 'PO-2024-1201',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-16',
    placeOfInspection: 'Delhi Manufacturing Facility',
    status: CALL_STATUS.WITHDRAWN,
    rio: RIO_TYPES.CRIO,
    quantity: 2000,
    verifiedDate: '2025-01-06T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma',
    withdrawnDate: '2025-01-18T11:00:00',
    disposalReason: 'Vendor requested withdrawal due to production delay'
  },
  {
    id: 'CALL-2025-D-003',
    callNumber: 'CALL-2025-D-003',
    vendor: MOCK_VENDORS[2],
    submissionDateTime: '2025-01-07T11:15:00',
    poNumber: 'PO-2024-1202',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-17',
    placeOfInspection: 'Bangalore Production Unit',
    status: CALL_STATUS.CANCELLED_CHARGEABLE,
    rio: RIO_TYPES.SRIO,
    quantity: 1200,
    verifiedDate: '2025-01-07T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Priya Sharma',
    cancelledDate: '2025-01-19T14:00:00',
    disposalReason: 'Vendor failed to provide material on scheduled date (3rd instance)'
  },
  {
    id: 'CALL-2025-D-004',
    callNumber: 'CALL-2025-D-004',
    vendor: MOCK_VENDORS[3],
    submissionDateTime: '2025-01-08T09:45:00',
    poNumber: 'PO-2024-1203',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-18',
    placeOfInspection: 'Chennai Forge Works',
    status: CALL_STATUS.COMPLETED,
    rio: RIO_TYPES.SRIO,
    quantity: 1800,
    verifiedDate: '2025-01-08T14:00:00',
    verifiedBy: 'Call Desk Officer - Sneha Reddy',
    assignedIE: 'IE - Amit Patel',
    completedDate: '2025-01-22T16:30:00',
    disposalReason: 'Inspection completed successfully'
  },
  {
    id: 'CALL-2025-D-005',
    callNumber: 'CALL-2025-D-005',
    vendor: MOCK_VENDORS[4],
    submissionDateTime: '2025-01-09T13:20:00',
    poNumber: 'PO-2024-1204',
    product: PRODUCT_TYPES.SLEEPER,
    stage: INSPECTION_STAGES.RAW_MATERIAL,
    productStage: `${PRODUCT_TYPES.SLEEPER} - ${INSPECTION_STAGES.RAW_MATERIAL}`,
    desiredInspectionDate: '2025-01-19',
    placeOfInspection: 'Pune Steel Plant',
    status: CALL_STATUS.CANCELLED_NON_CHARGEABLE,
    rio: RIO_TYPES.WRIO,
    quantity: 2500,
    verifiedDate: '2025-01-09T16:00:00',
    verifiedBy: 'Call Desk Officer - Ramesh Kumar',
    cancelledDate: '2025-01-17T10:00:00',
    disposalReason: 'PO cancelled by railway administration'
  },
  {
    id: 'CALL-2025-D-006',
    callNumber: 'CALL-2025-D-006',
    vendor: MOCK_VENDORS[5],
    submissionDateTime: '2025-01-10T10:00:00',
    poNumber: 'PO-2024-1205',
    product: PRODUCT_TYPES.ERC,
    stage: INSPECTION_STAGES.FINAL,
    productStage: `${PRODUCT_TYPES.ERC} - ${INSPECTION_STAGES.FINAL}`,
    desiredInspectionDate: '2025-01-20',
    placeOfInspection: 'Kolkata Manufacturing Hub',
    status: CALL_STATUS.REJECTED_CLOSED,
    rio: RIO_TYPES.ERIO,
    quantity: 1600,
    verifiedDate: '2025-01-10T15:00:00',
    verifiedBy: 'Call Desk Officer - Priya Sharma',
    assignedIE: 'IE - Vikram Singh',
    rejectedDate: '2025-01-21T13:00:00',
    disposalReason: 'Material failed critical quality parameters - rejected by IE'
  },
  {
    id: 'CALL-2025-D-007',
    callNumber: 'CALL-2025-D-007',
    vendor: MOCK_VENDORS[0],
    submissionDateTime: '2025-01-11T11:30:00',
    poNumber: 'PO-2024-1206',
    product: PRODUCT_TYPES.GRSP,
    stage: INSPECTION_STAGES.PROCESS,
    productStage: `${PRODUCT_TYPES.GRSP} - ${INSPECTION_STAGES.PROCESS}`,
    desiredInspectionDate: '2025-01-21',
    placeOfInspection: 'Mumbai Plant - Unit 2',
    status: CALL_STATUS.COMPLETED,
    rio: RIO_TYPES.WRIO,
    quantity: 1400,
    verifiedDate: '2025-01-11T16:00:00',
    verifiedBy: 'Call Desk Officer - Amit Patel',
    assignedIE: 'IE - Rajesh Kumar',
    completedDate: '2025-01-23T15:00:00',
    disposalReason: 'Inspection completed successfully'
  }
];

// Mock Call History
export const MOCK_CALL_HISTORY = {
  // Pending Verification Calls History
  'CALL-2025-PV-001': [
    { timestamp: '2025-01-24T09:30:00', action: 'Call Submitted', user: 'Vendor - Global Materials Corp', remarks: 'Fresh call submission for RM inspection' }
  ],
  'CALL-2025-PV-002': [
    { timestamp: '2025-01-23T10:00:00', action: 'Call Submitted', user: 'Vendor - Premium Materials Inc', remarks: 'Fresh call submission' },
    { timestamp: '2025-01-23T15:30:00', action: 'Returned for Rectification', user: 'Call Desk - Priya Sharma', remarks: 'TC certificate missing' },
    { timestamp: '2025-01-24T10:15:00', action: 'Call Resubmitted', user: 'Vendor - Premium Materials Inc', remarks: 'Resubmitted with TC certificate' }
  ],
  'CALL-2025-PV-004': [
    { timestamp: '2025-01-21T09:00:00', action: 'Call Submitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Fresh call submission' },
    { timestamp: '2025-01-21T14:00:00', action: 'Returned for Rectification', user: 'Call Desk - Amit Patel', remarks: 'PO number mismatch' },
    { timestamp: '2025-01-22T10:00:00', action: 'Call Resubmitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Corrected PO number' },
    { timestamp: '2025-01-22T16:00:00', action: 'Returned for Rectification', user: 'Call Desk - Sneha Reddy', remarks: 'Quantity mismatch with PO' },
    { timestamp: '2025-01-23T14:30:00', action: 'Call Resubmitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Corrected quantity' }
  ],

  // Verified & Open Calls History
  'CALL-2025-VO-001': [
    { timestamp: '2025-01-20T09:00:00', action: '“ Call Submitted', user: 'Vendor - Global Materials Corp', remarks: 'Fresh call submission for ERC - Raw Material inspection' },
    { timestamp: '2025-01-20T14:30:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'All documents verified and call registered in system' }
  ],
  'CALL-2025-VO-002': [
    { timestamp: '2025-01-19T10:30:00', action: '“ Call Submitted', user: 'Vendor - Premium Materials Inc', remarks: 'Fresh call submission for Sleeper - Process inspection' },
    { timestamp: '2025-01-19T15:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Priya Sharma', remarks: 'Documents verified, awaiting IE assignment' }
  ],
  'CALL-2025-VO-003': [
    { timestamp: '2025-01-18T11:15:00', action: '“ Call Submitted', user: 'Vendor - Steel Forge India Ltd', remarks: 'Fresh call submission for GRSP - Final inspection' },
    { timestamp: '2025-01-18T16:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Amit Patel', remarks: 'All documents verified' },
    { timestamp: '2025-01-19T09:30:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Rajesh Verma' }
  ],
  'CALL-2025-VO-004': [
    { timestamp: '2025-01-17T12:00:00', action: '“ Call Submitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Fresh call submission for ERC - Process inspection' },
    { timestamp: '2025-01-17T17:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Sneha Reddy', remarks: 'Documents verified' },
    { timestamp: '2025-01-18T10:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Priya Menon' },
    { timestamp: '2025-01-19T08:30:00', action: '” Inspection Started', user: 'IE - Priya Menon', remarks: 'Inspection commenced at vendor site' }
  ],
  'CALL-2025-VO-005': [
    { timestamp: '2025-01-16T13:30:00', action: '“ Call Submitted', user: 'Vendor - Precision Parts Co', remarks: 'Fresh call submission for Sleeper - Final inspection' },
    { timestamp: '2025-01-16T18:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'All documents verified' },
    { timestamp: '2025-01-17T09:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Anil Sharma' },
    { timestamp: '2025-01-18T07:30:00', action: '” Inspection Started', user: 'IE - Anil Sharma', remarks: 'Inspection commenced' },
    { timestamp: '2025-01-19T16:00:00', action: '“„ Inspection Completed', user: 'IE - Anil Sharma', remarks: 'Inspection completed, IC pending' }
  ],
  'CALL-2025-VO-006': [
    { timestamp: '2025-01-15T14:00:00', action: '“ Call Submitted', user: 'Vendor - Advanced Metallurgy Works', remarks: 'Fresh call submission for GRSP - Raw Material inspection' },
    { timestamp: '2025-01-15T19:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Priya Sharma', remarks: 'Documents verified' },
    { timestamp: '2025-01-16T10:30:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Vikram Singh' },
    { timestamp: '2025-01-17T08:00:00', action: '” Inspection Started', user: 'IE - Vikram Singh', remarks: 'Inspection commenced' },
    { timestamp: '2025-01-18T15:30:00', action: '“„ Inspection Completed', user: 'IE - Vikram Singh', remarks: 'Inspection completed successfully' },
    { timestamp: '2025-01-19T11:00:00', action: '“‹ IC Generated', user: 'IE - Vikram Singh', remarks: 'Inspection Certificate generated, billing pending' }
  ],
  'CALL-2025-VO-007': [
    { timestamp: '2025-01-14T15:30:00', action: '“ Call Submitted', user: 'Vendor - Industrial Components Ltd', remarks: 'Fresh call submission for ERC - Final inspection' },
    { timestamp: '2025-01-14T20:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Amit Patel', remarks: 'All documents verified' },
    { timestamp: '2025-01-15T11:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Meera Nair' },
    { timestamp: '2025-01-16T09:00:00', action: '” Inspection Started', user: 'IE - Meera Nair', remarks: 'Inspection commenced at vendor facility' },
    { timestamp: '2025-01-17T14:00:00', action: '“„ Inspection Completed', user: 'IE - Meera Nair', remarks: 'Inspection completed' },
    { timestamp: '2025-01-18T10:30:00', action: '“‹ IC Generated', user: 'IE - Meera Nair', remarks: 'IC generated' },
    { timestamp: '2025-01-19T12:00:00', action: '’° Billing Completed', user: 'Accounts - Ravi Kumar', remarks: 'Invoice generated and sent to vendor' }
  ],
  'CALL-2025-VO-008': [
    { timestamp: '2025-01-13T16:00:00', action: '“ Call Submitted', user: 'Vendor - Supreme Steel Industries', remarks: 'Fresh call submission for Sleeper - Process inspection' },
    { timestamp: '2025-01-13T21:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Sneha Reddy', remarks: 'Documents verified' },
    { timestamp: '2025-01-14T12:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Karthik Reddy' },
    { timestamp: '2025-01-15T08:30:00', action: '” Inspection Started', user: 'IE - Karthik Reddy', remarks: 'Inspection commenced' },
    { timestamp: '2025-01-16T16:00:00', action: '“„ Inspection Completed', user: 'IE - Karthik Reddy', remarks: 'Inspection completed successfully' },
    { timestamp: '2025-01-17T11:30:00', action: '“‹ IC Generated', user: 'IE - Karthik Reddy', remarks: 'IC generated' },
    { timestamp: '2025-01-18T13:00:00', action: '’° Billing Completed', user: 'Accounts - Ravi Kumar', remarks: 'Invoice generated' },
    { timestamp: '2025-01-19T14:00:00', action: 'šš Dispatch Clearance Issued', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'Dispatch clearance issued to vendor' }
  ],

  // Disposed Calls History
  'CALL-2025-D-001': [
    { timestamp: '2025-01-05T09:00:00', action: '“ Call Submitted', user: 'Vendor - Global Materials Corp', remarks: 'Fresh call submission for ERC - Raw Material inspection' },
    { timestamp: '2025-01-05T14:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'All documents verified and call registered' },
    { timestamp: '2025-01-06T10:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Rajesh Kumar' },
    { timestamp: '2025-01-08T08:30:00', action: '” Inspection Started', user: 'IE - Rajesh Kumar', remarks: 'Inspection commenced at Mumbai Plant - Unit 1' },
    { timestamp: '2025-01-10T16:00:00', action: '“„ Inspection Completed', user: 'IE - Rajesh Kumar', remarks: 'Inspection completed, all parameters within specification' },
    { timestamp: '2025-01-12T11:00:00', action: '“‹ IC Generated', user: 'IE - Rajesh Kumar', remarks: 'Inspection Certificate IC-2025-001 generated' },
    { timestamp: '2025-01-15T14:30:00', action: '’° Billing Completed', user: 'Accounts - Ravi Kumar', remarks: 'Invoice INV-2025-001 generated and sent to vendor' },
    { timestamp: '2025-01-18T10:00:00', action: 'šš Dispatch Clearance Issued', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'Dispatch clearance issued to vendor' },
    { timestamp: '2025-01-20T17:00:00', action: '… Call Completed & Disposed', user: 'System - Auto Disposal', remarks: 'Inspection completed successfully - Call moved to disposed archive' }
  ],
  'CALL-2025-D-002': [
    { timestamp: '2025-01-06T10:30:00', action: '“ Call Submitted', user: 'Vendor - Premium Materials Inc', remarks: 'Fresh call submission for Sleeper - Process inspection' },
    { timestamp: '2025-01-06T15:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Priya Sharma', remarks: 'Documents verified and call registered' },
    { timestamp: '2025-01-07T11:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Anil Sharma' },
    { timestamp: '2025-01-09T09:00:00', action: '” Inspection Scheduled', user: 'IE - Anil Sharma', remarks: 'Inspection scheduled for 2025-01-16' },
    { timestamp: '2025-01-15T14:00:00', action: '“ž Vendor Communication', user: 'Vendor - Premium Materials Inc', remarks: 'Vendor requested call withdrawal due to production delay' },
    { timestamp: '2025-01-16T10:00:00', action: '“ Withdrawal Request Received', user: 'Call Desk Officer - Priya Sharma', remarks: 'Formal withdrawal request received from vendor' },
    { timestamp: '2025-01-17T15:00:00', action: '… Withdrawal Approved', user: 'Admin - Suresh Kumar', remarks: 'Withdrawal request approved - no charges applicable' },
    { timestamp: '2025-01-18T11:00:00', action: '”™ Call Withdrawn & Disposed', user: 'Call Desk Officer - Priya Sharma', remarks: 'Vendor requested withdrawal due to production delay - Call moved to disposed archive' }
  ],
  'CALL-2025-D-003': [
    { timestamp: '2025-01-07T11:15:00', action: '“ Call Submitted', user: 'Vendor - Steel Forge India Ltd', remarks: 'Fresh call submission for GRSP - Final inspection' },
    { timestamp: '2025-01-07T16:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Amit Patel', remarks: 'All documents verified' },
    { timestamp: '2025-01-08T10:30:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Priya Sharma' },
    { timestamp: '2025-01-10T08:00:00', action: '” Inspection Scheduled', user: 'IE - Priya Sharma', remarks: 'Inspection scheduled for 2025-01-17 at Bangalore Production Unit' },
    { timestamp: '2025-01-17T08:30:00', action: 'âš ï¸ Material Not Ready', user: 'IE - Priya Sharma', remarks: 'Vendor failed to provide material on scheduled date - 1st instance' },
    { timestamp: '2025-01-17T14:00:00', action: '”„ Inspection Rescheduled', user: 'IE - Priya Sharma', remarks: 'Inspection rescheduled to 2025-01-18' },
    { timestamp: '2025-01-18T08:30:00', action: 'âš ï¸ Material Not Ready', user: 'IE - Priya Sharma', remarks: 'Vendor failed to provide material again - 2nd instance' },
    { timestamp: '2025-01-18T15:00:00', action: '”„ Final Reschedule', user: 'IE - Priya Sharma', remarks: 'Final reschedule to 2025-01-19 - warned vendor about cancellation' },
    { timestamp: '2025-01-19T08:30:00', action: 'âš ï¸ Material Not Ready', user: 'IE - Priya Sharma', remarks: 'Vendor failed to provide material for 3rd time' },
    { timestamp: '2025-01-19T11:00:00', action: '“ Cancellation Recommended', user: 'IE - Priya Sharma', remarks: 'Recommended call cancellation with charges due to repeated non-compliance' },
    { timestamp: '2025-01-19T14:00:00', action: 'âŒ Call Cancelled (Chargeable) & Disposed', user: 'Admin - Suresh Kumar', remarks: 'Vendor failed to provide material on scheduled date (3rd instance) - Cancellation charges applicable - Call moved to disposed archive' }
  ],
  'CALL-2025-D-004': [
    { timestamp: '2025-01-08T09:45:00', action: '“ Call Submitted', user: 'Vendor - Quality Forge Pvt Ltd', remarks: 'Fresh call submission for ERC - Process inspection' },
    { timestamp: '2025-01-08T14:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Sneha Reddy', remarks: 'Documents verified and call registered' },
    { timestamp: '2025-01-09T10:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Amit Patel' },
    { timestamp: '2025-01-11T08:30:00', action: '” Inspection Started', user: 'IE - Amit Patel', remarks: 'Inspection commenced at Chennai Forge Works' },
    { timestamp: '2025-01-13T15:00:00', action: '“„ Inspection Completed', user: 'IE - Amit Patel', remarks: 'Inspection completed, material meets all specifications' },
    { timestamp: '2025-01-15T10:30:00', action: '“‹ IC Generated', user: 'IE - Amit Patel', remarks: 'Inspection Certificate IC-2025-004 generated' },
    { timestamp: '2025-01-17T13:00:00', action: '’° Billing Completed', user: 'Accounts - Ravi Kumar', remarks: 'Invoice INV-2025-004 generated' },
    { timestamp: '2025-01-20T11:00:00', action: 'šš Dispatch Clearance Issued', user: 'Call Desk Officer - Sneha Reddy', remarks: 'Dispatch clearance issued' },
    { timestamp: '2025-01-22T16:30:00', action: '… Call Completed & Disposed', user: 'System - Auto Disposal', remarks: 'Inspection completed successfully - Call moved to disposed archive' }
  ],
  'CALL-2025-D-005': [
    { timestamp: '2025-01-09T13:20:00', action: '“ Call Submitted', user: 'Vendor - Precision Parts Co', remarks: 'Fresh call submission for Sleeper - Raw Material inspection' },
    { timestamp: '2025-01-09T16:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'All documents verified' },
    { timestamp: '2025-01-10T11:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Vikram Singh' },
    { timestamp: '2025-01-12T09:00:00', action: '” Inspection Scheduled', user: 'IE - Vikram Singh', remarks: 'Inspection scheduled for 2025-01-19' },
    { timestamp: '2025-01-15T10:00:00', action: '“ž Railway Communication', user: 'Railway Admin - DRM Office', remarks: 'PO cancellation notice received from railway administration' },
    { timestamp: '2025-01-15T14:30:00', action: '“ PO Cancellation Verified', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'Verified PO cancellation order from railway administration' },
    { timestamp: '2025-01-16T11:00:00', action: '“§ Vendor Notified', user: 'Call Desk Officer - Ramesh Kumar', remarks: 'Vendor notified about PO cancellation and call cancellation' },
    { timestamp: '2025-01-17T10:00:00', action: 'âŒ Call Cancelled (Non-Chargeable) & Disposed', user: 'Admin - Suresh Kumar', remarks: 'PO cancelled by railway administration - No charges applicable to vendor - Call moved to disposed archive' }
  ],
  'CALL-2025-D-006': [
    { timestamp: '2025-01-10T10:00:00', action: '“ Call Submitted', user: 'Vendor - Advanced Metallurgy Works', remarks: 'Fresh call submission for ERC - Final inspection' },
    { timestamp: '2025-01-10T15:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Priya Sharma', remarks: 'Documents verified and call registered' },
    { timestamp: '2025-01-11T10:30:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Vikram Singh' },
    { timestamp: '2025-01-13T08:00:00', action: '” Inspection Started', user: 'IE - Vikram Singh', remarks: 'Inspection commenced at Kolkata Manufacturing Hub' },
    { timestamp: '2025-01-15T14:00:00', action: 'âš ï¸ Quality Issues Identified', user: 'IE - Vikram Singh', remarks: 'Critical quality parameters not meeting specification - dimensional deviations observed' },
    { timestamp: '2025-01-16T10:00:00', action: '”¬ Detailed Testing', user: 'IE - Vikram Singh', remarks: 'Conducted detailed testing and measurements - confirmed non-compliance' },
    { timestamp: '2025-01-17T11:30:00', action: '“ Rejection Report Prepared', user: 'IE - Vikram Singh', remarks: 'Prepared detailed rejection report with test results and photographs' },
    { timestamp: '2025-01-18T09:00:00', action: '“§ Vendor Notified', user: 'IE - Vikram Singh', remarks: 'Vendor notified about material rejection with detailed report' },
    { timestamp: '2025-01-19T14:00:00', action: '… Rejection Confirmed', user: 'Admin - Suresh Kumar', remarks: 'Rejection confirmed after review of IE report' },
    { timestamp: '2025-01-21T13:00:00', action: 'š« Call Rejected & Disposed', user: 'Call Desk Officer - Priya Sharma', remarks: 'Material failed critical quality parameters - rejected by IE - Call moved to disposed archive' }
  ],
  'CALL-2025-D-007': [
    { timestamp: '2025-01-11T11:30:00', action: '“ Call Submitted', user: 'Vendor - Global Materials Corp', remarks: 'Fresh call submission for GRSP - Process inspection' },
    { timestamp: '2025-01-11T16:00:00', action: '… Call Verified & Registered', user: 'Call Desk Officer - Amit Patel', remarks: 'All documents verified' },
    { timestamp: '2025-01-12T10:00:00', action: '‘¤ IE Assigned', user: 'Admin - Suresh Kumar', remarks: 'Assigned to IE - Rajesh Kumar' },
    { timestamp: '2025-01-14T08:30:00', action: '” Inspection Started', user: 'IE - Rajesh Kumar', remarks: 'Inspection commenced at Mumbai Plant - Unit 2' },
    { timestamp: '2025-01-16T15:00:00', action: '“„ Inspection Completed', user: 'IE - Rajesh Kumar', remarks: 'Inspection completed successfully, all tests passed' },
    { timestamp: '2025-01-18T11:00:00', action: '“‹ IC Generated', user: 'IE - Rajesh Kumar', remarks: 'Inspection Certificate IC-2025-007 generated' },
    { timestamp: '2025-01-20T13:30:00', action: '’° Billing Completed', user: 'Accounts - Ravi Kumar', remarks: 'Invoice INV-2025-007 generated and sent' },
    { timestamp: '2025-01-22T10:00:00', action: 'šš Dispatch Clearance Issued', user: 'Call Desk Officer - Amit Patel', remarks: 'Dispatch clearance issued to vendor' },
    { timestamp: '2025-01-23T15:00:00', action: '… Call Completed & Disposed', user: 'System - Auto Disposal', remarks: 'Inspection completed successfully - Call moved to disposed archive' }
  ]
};

// Mock Dashboard KPIs
export const MOCK_DASHBOARD_KPIS = {
  pendingVerification: {
    total: 6,
    fresh: 3,
    resubmissions: 2,
    returned: 1
  },
  verifiedOpen: {
    total: 8,
    ieAssignmentPending: 1,
    assignedToIE: 1,
    underInspection: 1,
    icPending: 1,
    billingPending: 1
  },
  disposed: {
    total: 7,
    completed: 3,
    withdrawn: 1,
    cancelled: 2,
    rejected: 1
  }
};

// Export all mock data
export const MOCK_ALL_CALLS = [
  ...MOCK_PENDING_VERIFICATION_CALLS,
  ...MOCK_VERIFIED_OPEN_CALLS,
  ...MOCK_DISPOSED_CALLS
];



/**
 * Mock Data for Raw Material Testing and Verification Modules
 */

export const MOCK_INVENTORY = {
    CEMENT: [
        { id: 'INV-CEM-001', vendor: 'UltraTech Cement', consignmentNo: 'CON-1029', lotNo: 'LOT-A1', qty: '200 MT', receivedDate: '2026-01-05', status: 'Unverified' },
        { id: 'INV-CEM-002', vendor: 'Ambuja Cement', consignmentNo: 'CON-1045', lotNo: 'LOT-B2', qty: '150 MT', receivedDate: '2026-01-07', status: 'Verified', verifiedBy: 'John Doe (IE)', verifiedAt: '2026-01-08 10:30 AM' },
        { id: 'INV-CEM-003', vendor: 'ACC Cement', consignmentNo: 'CON-1060', lotNo: 'LOT-C3', qty: '300 MT', receivedDate: '2026-01-10', status: 'Unverified' },
    ],
    HTS: [
        { id: 'HTS-COIL-001', coilNo: 'COIL-001', vendor: 'Tata Steel', qty: '25 Coils', receivedDate: '2026-01-10', status: 'Unverified' },
        { id: 'HTS-COIL-002', coilNo: 'COIL-002', vendor: 'JSW Steel', qty: '40 Coils', receivedDate: '2026-01-11', status: 'Verified', verifiedBy: 'Jane Smith (IE)', verifiedAt: '2026-01-12 02:15 PM' },
        { id: 'HTS-COIL-003', coilNo: 'COIL-003', vendor: 'Vizag Steel', qty: '15 Coils', receivedDate: '2026-01-12', status: 'Unverified' },
    ],
    AGGREGATES: [
        { id: 'INV-AGG-001', vendor: 'Local Quarry Solutions', consignmentNo: 'CON-AG-99', lotNo: '10MM-A', qty: '500 Cum', receivedDate: '2026-01-02', status: 'Verified', verifiedBy: 'John Doe (IE)', verifiedAt: '2026-01-03 09:00 AM' },
        { id: 'INV-AGG-002', vendor: 'Stone Crushers Ltd', consignmentNo: 'CON-AG-105', lotNo: '20MM-B', qty: '800 Cum', receivedDate: '2026-01-06', status: 'Unverified' },
    ],
    ADMIXTURE: [
        { id: 'INV-ADM-001', vendor: 'Fosroc Chemicals', consignmentNo: 'AD-501', qty: '2000 Litres', receivedDate: '2026-01-08', status: 'Unverified' },
        { id: 'INV-ADM-002', vendor: 'Sika India', consignmentNo: 'SI-992', qty: '1500 Litres', receivedDate: '2026-01-15', status: 'Unverified' },
    ],
    SGCI: [
        { id: 'SG-INV-001', lotNo: 'LOT-SG-101', supplier: 'India Castings', type: 'MCI-18', qty: '5000 Nos', ritesIc: 'IC/2026/01/01', ritesBook: 'BK-05/ST-02', approvalValidity: '2026-12-31', status: 'Verified', verifiedBy: 'John Doe (IE)', verifiedAt: '2026-01-02 11:45 AM' },
        { id: 'SG-INV-002', lotNo: 'LOT-SG-102', supplier: 'Kirloskar Ferrous', type: 'MCI-18', qty: '7500 Nos', ritesIc: 'IC/2026/01/15', ritesBook: 'BK-08/ST-04', approvalValidity: '2027-06-30', status: 'Unverified' },
    ],
    DOWEL: [
        { id: 'DW-INV-001', vendor: 'Plastic Components Ltd', consignmentNo: 'DW-701', qty: '10000 Nos', receivedDate: '2026-01-09', status: 'Unverified' },
    ]
};

export const MOCK_CEMENT_HISTORY = [
    { id: 1, testDate: '2025-12-25', testType: 'Periodic', consignmentNo: 'CON-0950', lotNo: 'LOT-X1', surface: '320', initialSetting: '145', finalSetting: '280', consistency: '28%', soundness: '0.5' },
    { id: 2, testDate: '2026-01-02', testType: 'New Inventory', consignmentNo: 'CON-1001', lotNo: 'LOT-Z5', surface: '315', initialSetting: '155', finalSetting: '295', consistency: '27.5%', soundness: '0.8' },
];

export const MOCK_AGGREGATES_HISTORY = [
    { id: 1, testDate: '2025-12-20', testType: 'New Inventory', consignmentNo: 'CON-AG-88', lotNo: '20MM-X', crushing: '22%', impact: '18%' },
    { id: 2, testDate: '2026-01-04', testType: 'Periodic', consignmentNo: 'CON-AG-92', lotNo: '10MM-Y', crushing: '21.5%', impact: '17.5%' },
];

export const MOCK_HTS_HISTORY = [
    { id: 1, testDate: '2026-01-07', consignmentNo: 'HTS-990', lotNo: 'COIL-1', weight: '2.5kg/m', layLength: '95mm', diameter: '9.5mm' },
    { id: 2, testDate: '2026-01-08', consignmentNo: 'HTS-991', lotNo: 'COIL-2', weight: '2.51kg/m', layLength: '96mm', diameter: '9.51mm' },
];

export const MOCK_SGCI_HISTORY = [
    { id: 1, testDate: '2026-01-02', lotNo: 'SG-202', supplier: 'India Castings', type: 'MCI-18', ritesIc: 'IC/2026/01/01', checked: 500, accepted: 498, rejected: 2 },
];

export const MOCK_WATER_HISTORY = [
    { id: 1, testDate: '2025-12-15', ph: '7.2', tds: '450 ppm' },
    { id: 2, testDate: '2026-01-05', ph: '7.1', tds: '420 ppm' },
];

export const MOCK_VERIFIED_CONSIGNMENTS = [
    'CON-1029 (UltraTech)',
    'CON-1045 (Ambuja)',
    'CON-AG-105 (Stone Crushers)',
    'HTS-991 (Tata Steel)',
    'CON-1001 (New Inventory)'
];

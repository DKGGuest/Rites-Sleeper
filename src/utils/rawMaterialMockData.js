/**
 * Mock Data for Raw Material Testing Module
 */

export const MOCK_INVENTORY = {
    CEMENT: [
        { id: 'INV-CEM-001', vendor: 'UltraTech Cement', consignmentNo: 'CON-1029', lotNo: 'LOT-A1', receivedDate: '2026-01-05' },
        { id: 'INV-CEM-002', vendor: 'Ambuja Cement', consignmentNo: 'CON-1045', lotNo: 'LOT-B2', receivedDate: '2026-01-07' },
    ],
    AGGREGATES: [
        { id: 'INV-AGG-001', vendor: 'Local Quarry Solutions', consignmentNo: 'CON-AG-99', lotNo: '10MM-A', receivedDate: '2026-01-02' },
        { id: 'INV-AGG-002', vendor: 'Stone Crushers Ltd', consignmentNo: 'CON-AG-105', lotNo: '20MM-B', receivedDate: '2026-01-06' },
    ],
    HTS: [
        { id: 'HTS-COIL-001', coilNo: 'COIL-001', vendor: 'Tata Steel', receivedDate: '2026-01-10' },
        { id: 'HTS-COIL-002', coilNo: 'COIL-002', vendor: 'JSW Steel', receivedDate: '2026-01-11' },
        { id: 'HTS-COIL-003', coilNo: 'COIL-003', vendor: 'Vizag Steel', receivedDate: '2026-01-12' },
    ],
    SGCI: [
        { id: 'SG-INV-001', lotNo: 'LOT-SG-101', supplier: 'India Castings', type: 'MCI-18', ritesIc: 'IC/2026/01/01', ritesBook: 'BK-05/ST-02', approvalValidity: '2026-12-31' },
        { id: 'SG-INV-002', lotNo: 'LOT-SG-102', supplier: 'Kirloskar Ferrous', type: 'MCI-18', ritesIc: 'IC/2026/01/15', ritesBook: 'BK-08/ST-04', approvalValidity: '2027-06-30' },
    ]
};

export const MOCK_CEMENT_HISTORY = [
    {
        id: 1,
        testDate: '2025-12-25',
        testType: 'Periodic',
        consignmentNo: 'CON-0950',
        lotNo: 'LOT-X1',
        surface: '320',
        initialSetting: '145',
        finalSetting: '280',
        consistency: '28%',
        soundness: '0.5'
    },
    {
        id: 2,
        testDate: '2026-01-02',
        testType: 'New Inventory',
        consignmentNo: 'CON-1001',
        lotNo: 'LOT-Z5',
        surface: '315',
        initialSetting: '155',
        finalSetting: '295',
        consistency: '27.5%',
        soundness: '0.8'
    },
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
    {
        id: 1,
        testDate: '2026-01-02',
        lotNo: 'SG-202',
        supplier: 'India Castings',
        type: 'MCI-18',
        ritesIc: 'IC/2026/01/01',
        checked: 500,
        accepted: 498,
        rejected: 2
    },
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


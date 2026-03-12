import React, { useState } from 'react';
import MoistureEntryForm from './components/MoistureEntryForm';
import { apiService } from '../../services/api';
import TrendChart from '../../components/common/TrendChart';

const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";
    if (typeof dateStr !== 'string') return "-";

    // If it's already in DD/MM/YYYY format, return it as is
    if (dateStr.includes('/') && !dateStr.includes('-')) {
        return dateStr;
    }

    // Handle ISO format (2025-02-26T...) or simple YYYY-MM-DD
    let parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
    }

    return dateStr;
};

const formatToBackendDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    }
    return dateStr;
};

const formatFromBackendDate = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
    return dateStr;
};

const extractTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    // Handle ISO strings (e.g., 2026-02-24T14:13:00)
    if (dateTimeStr.includes('T')) return dateTimeStr.substring(11, 16);
    // Handle simple time strings (e.g., 14:13:00 or 14:13)
    if (dateTimeStr.includes(':')) {
        const parts = dateTimeStr.split(':');
        if (parts.length >= 2) {
            return `${parts[0].trim().padStart(2, '0')}:${parts[1].trim().padStart(2, '0')}`;
        }
    }
    return dateTimeStr;
};

/**
 * MoistureAnalysis Component
 * Displays moisture analysis statistics, trend chart, and recent entries.
 */
const MoistureAnalysis = ({ onBack, onSave, initialView = 'list', records = [], setRecords, displayMode = 'modal', showForm, setShowForm }) => {
    const [view, setView] = useState(initialView);
    const [editRecord, setEditRecord] = useState(null);

    const isFormOpen = showForm !== undefined ? showForm : false;
    const closeForm = () => {
        if (setShowForm) setShowForm(false);
        setEditRecord(null);
        setView('list');
    };
    const [saving, setSaving] = useState(false);
    const [localRecords, setLocalRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const activeRecords = records.length > 0 ? records : localRecords;

    React.useEffect(() => {
        if (records.length === 0) {
            const fetchRecords = async () => {
                setLoading(true);
                try {
                    const data = await apiService.getAllMoistureAnalysis();
                    if (data && data.responseData && Array.isArray(data.responseData)) {
                        setLocalRecords(data.responseData);
                    } else if (Array.isArray(data)) {
                        setLocalRecords(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch moisture records:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchRecords();
        }
    }, [records.length]);

    // Group records by batch number and date to show unified rows in UI
    const groupRecordsByBatch = (flatRecords) => {
        const groups = {};
        flatRecords.forEach(r => {
            const key = `${r.batchNo}_${r.entryDate || r.createdDate?.split('T')[0]}`;
            if (!groups[key]) {
                const isAll = r.sectionType === 'ALL';
                groups[key] = {
                    id: r.id,
                    batchNo: r.batchNo,
                    date: r.entryDate || r.createdDate?.split('T')[0],
                    shift: r.shift,
                    timing: r.entryTime || r.createdDate?.substring(11, 16),
                    ca1Free: isAll ? (r.batchWtDryCa1 > 0 ? (((r.wtAdoptedCa1 - r.batchWtDryCa1) / r.batchWtDryCa1) * 100).toFixed(2) : '0') : (r.sectionType === 'CA1' ? r.freeMoisturePercent : '-'),
                    ca2Free: isAll ? (r.batchWtDryCa2 > 0 ? (((r.wtAdoptedCa2 - r.batchWtDryCa2) / r.batchWtDryCa2) * 100).toFixed(2) : '0') : (r.sectionType === 'CA2' ? r.freeMoisturePercent : '-'),
                    faFree: isAll ? (r.batchWtDryFa > 0 ? (((r.wtAdoptedFa - r.batchWtDryFa) / r.batchWtDryFa) * 100).toFixed(2) : '0') : (r.sectionType === 'FA' ? r.freeMoisturePercent : '-'),
                    totalFree: r.totalFreeMoisture,
                    timestamp: r.createdDate || r.timestamp || new Date().toISOString(),
                    // Chart-friendly numeric values
                    ca1Val: isAll ? (r.batchWtDryCa1 > 0 ? ((r.wtAdoptedCa1 - r.batchWtDryCa1) / r.batchWtDryCa1) * 100 : 0) : (r.sectionType === 'CA1' ? parseFloat(r.freeMoisturePercent) || 0 : 0),
                    ca2Val: isAll ? (r.batchWtDryCa2 > 0 ? ((r.wtAdoptedCa2 - r.batchWtDryCa2) / r.batchWtDryCa2) * 100 : 0) : (r.sectionType === 'CA2' ? parseFloat(r.freeMoisturePercent) || 0 : 0),
                    faVal: isAll ? (r.batchWtDryFa > 0 ? ((r.wtAdoptedFa - r.batchWtDryFa) / r.batchWtDryFa) * 100 : 0) : (r.sectionType === 'FA' ? parseFloat(r.freeMoisturePercent) || 0 : 0),
                    records: [r]
                };
            } else {
                const current = groups[key];
                if (r.sectionType === 'ALL') {
                    current.id = r.id; // Prefer the consolidated record ID
                    current.ca1Free = r.batchWtDryCa1 > 0 ? (((r.wtAdoptedCa1 - r.batchWtDryCa1) / r.batchWtDryCa1) * 100).toFixed(2) : current.ca1Free;
                    current.ca2Free = r.batchWtDryCa2 > 0 ? (((r.wtAdoptedCa2 - r.batchWtDryCa2) / r.batchWtDryCa2) * 100).toFixed(2) : current.ca2Free;
                    current.faFree = r.batchWtDryFa > 0 ? (((r.wtAdoptedFa - r.batchWtDryFa) / r.batchWtDryFa) * 100).toFixed(2) : current.faFree;
                    current.ca1Val = r.batchWtDryCa1 > 0 ? ((r.wtAdoptedCa1 - r.batchWtDryCa1) / r.batchWtDryCa1) * 100 : current.ca1Val;
                    current.ca2Val = r.batchWtDryCa2 > 0 ? ((r.wtAdoptedCa2 - r.batchWtDryCa2) / r.batchWtDryCa2) * 100 : current.ca2Val;
                    current.faVal = r.batchWtDryFa > 0 ? ((r.wtAdoptedFa - r.batchWtDryFa) / r.batchWtDryFa) * 100 : current.faVal;
                } else if (r.sectionType === 'CA1') {
                    current.ca1Free = r.freeMoisturePercent;
                    current.ca1Val = parseFloat(r.freeMoisturePercent) || 0;
                } else if (r.sectionType === 'CA2') {
                    current.ca2Free = r.freeMoisturePercent;
                    current.ca2Val = parseFloat(r.freeMoisturePercent) || 0;
                } else if (r.sectionType === 'FA') {
                    current.faFree = r.freeMoisturePercent;
                    current.faVal = parseFloat(r.freeMoisturePercent) || 0;
                }
                current.records.push(r);
                if (r.totalFreeMoisture) current.totalFree = r.totalFreeMoisture;
            }
        });
        return Object.values(groups).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const isRecordEditable = (timestamp) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        return diffMs < (24 * 60 * 60 * 1000); // 24 hour window
    };

    const handleSaveEntry = async (uiData) => {
        setSaving(true);
        try {
            const getSectionData = (section, result) => ({
                entryDate: formatToBackendDate(uiData.date),
                shift: uiData.shift,
                entryTime: uiData.timing,
                batchNo: String(uiData.batchNo),
                batchWtDryCa1: parseFloat(uiData.userDryCA1) || 0,
                batchWtDryCa2: parseFloat(uiData.userDryCA2) || 0,
                batchWtDryFa: parseFloat(uiData.userDryFA) || 0,
                batchWtDryWater: parseFloat(uiData.userDryWater) || 0,
                batchWtDryAdmix: parseFloat(uiData.userDryAdmix) || 0,
                batchWtDryCement: parseFloat(uiData.userDryCement) || 0,
                wtAdoptedCa1: parseFloat(uiData.ca1Result?.wtAdopted) || 0,
                wtAdoptedCa2: parseFloat(uiData.ca2Result?.wtAdopted) || 0,
                wtAdoptedFa: parseFloat(uiData.faResult?.wtAdopted) || 0,
                totalFreeMoisture: parseFloat(uiData.totalFree) || 0,
                adjustedWaterWt: parseFloat(uiData.adjustedWater) || 0,
                wcRatio: parseFloat(uiData.wcRatio) || 0,
                acRatio: parseFloat(uiData.acRatio) || 0,
                sectionType: section,
                wtWetSample: parseFloat(result?.wetSample) || 0,
                wtDriedSample: parseFloat(result?.driedSample) || 0,
                wtMoistureSample: parseFloat(result?.moistureInSample) || 0,
                moisturePercent: parseFloat(result?.moisturePct) || 0,
                absorptionPercent: parseFloat(result?.absorption) || 0,
                freeMoisturePercent: parseFloat(result?.freeMoisturePct) || 0,
                batchWtDry: parseFloat(result?.batchWtDry) || 0,
                freeMoistureKg: parseFloat(result?.freeMoistureKg) || 0,
                adjustedWeight: parseFloat(result?.adjustedWt) || 0,
                adoptedWeight: parseFloat(result?.wtAdopted) || 0,
                createdBy: 0,
                updatedBy: 0
            });

            const payloads = [
                { type: 'CA1', data: getSectionData('CA1', uiData.ca1Result) },
                { type: 'CA2', data: getSectionData('CA2', uiData.ca2Result) },
                { type: 'FA', data: getSectionData('FA', uiData.faResult) }
            ];

            for (const { type, data } of payloads) {
                if (editRecord) {
                    const existingRecord = editRecord.records?.find(r => r.sectionType === type);
                    if (existingRecord) {
                        await apiService.updateMoistureAnalysis(existingRecord.id, data);
                    } else {
                        await apiService.createMoistureAnalysis(data);
                    }
                } else {
                    await apiService.createMoistureAnalysis(data);
                }
            }

            onSave();
            closeForm();
        } catch (error) {
            console.error("Error saving moisture analysis:", error);
            alert("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };


    const handleEdit = async (record) => {
        // Fallback: Use the record from the list directly. 
        // The backend for MoistureAnalysis currently returns 404/Resources not found for single ID lookups.
        setEditRecord(record);
        if (setShowForm) setShowForm(true);
        setView('entry');
    };

    // Calculate statistics based on section types
    const ca1Records = activeRecords.filter(r => r.sectionType === 'CA1');
    const ca2Records = activeRecords.filter(r => r.sectionType === 'CA2');
    const faRecords = activeRecords.filter(r => r.sectionType === 'FA');

    const avgCA1 = ca1Records.length > 0 ? (ca1Records.reduce((sum, r) => sum + (parseFloat(r.freeMoisturePercent) || 0), 0) / ca1Records.length).toFixed(2) : '0.00';
    const avgCA2 = ca2Records.length > 0 ? (ca2Records.reduce((sum, r) => sum + (parseFloat(r.freeMoisturePercent) || 0), 0) / ca2Records.length).toFixed(2) : '0.00';
    const avgFA = faRecords.length > 0 ? (faRecords.reduce((sum, r) => sum + (parseFloat(r.freeMoisturePercent) || 0), 0) / faRecords.length).toFixed(2) : '0.00';
    const avgTotal = activeRecords.length > 0 ? (activeRecords.filter(r => r.totalFreeMoisture).reduce((sum, r) => sum + (parseFloat(r.totalFreeMoisture) || 0), 0) / activeRecords.filter(r => r.totalFreeMoisture).length).toFixed(2) : '0.00';

    // Sort activeRecords by timestamp (latest first)
    const sortedRecords = [...activeRecords].sort((a, b) => {
        const timeA = new Date(a.createdDate || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdDate || b.timestamp || 0).getTime();
        return timeB - timeA;
    });

    const displayRecords = groupRecordsByBatch(sortedRecords);

    const content = (
        <div className={displayMode === 'modal' ? "modal-body" : "inline-container"} style={{ padding: displayMode === 'modal' ? '1.5rem' : '0', width: '100%' }}>
            {(isFormOpen || editRecord) && (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '1100px' }}>
                        <MoistureEntryForm
                            onCancel={closeForm}
                            onSave={handleSaveEntry}
                            initialData={editRecord}
                        />
                    </div>
                </div>
            )}
            
            <div className={`list-view fade-in ${(isFormOpen || editRecord) ? 'dimmed' : ''}`} style={{ opacity: (isFormOpen || editRecord) ? 0.4 : 1, pointerEvents: (isFormOpen || editRecord) ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
                {/* Statistics Cards */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: '800', color: '#444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Free Moisture Content</h3>
                    <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                        {loading && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                                Loading latest data...
                            </div>
                        )}
                        <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #3b82f6', padding: '0.75rem' }}>
                            <span className="mini-label" style={{ fontSize: '0.6rem' }}>CA1 (20mm)</span>
                            <div className="calc-value" style={{ fontSize: '1.15rem', color: '#3b82f6' }}>{avgCA1}%</div>
                        </div>
                        <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #8b5cf6', padding: '0.75rem' }}>
                            <span className="mini-label" style={{ fontSize: '0.6rem' }}>CA2 (10mm)</span>
                            <div className="calc-value" style={{ fontSize: '1.15rem', color: '#8b5cf6' }}>{avgCA2}%</div>
                        </div>
                        <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #f59e0b', padding: '0.75rem' }}>
                            <span className="mini-label" style={{ fontSize: '0.6rem' }}>Fine Agg (FA)</span>
                            <div className="calc-value" style={{ fontSize: '1.15rem', color: '#f59e0b' }}>{avgFA}%</div>
                        </div>
                        <div className="calc-card hover-lift" style={{ borderLeft: '3px solid #10b981', padding: '0.75rem' }}>
                            <span className="mini-label" style={{ fontSize: '0.6rem' }}>Total Kg / Batch</span>
                            <div className="calc-value" style={{ fontSize: '1.15rem', color: '#10b981' }}>{avgTotal} Kg</div>
                        </div>
                    </div>
                </div>

                {/* Precision Moisture Trends Graph - High-Density Dashboard Widget */}
                <TrendChart
                    data={[...displayRecords].reverse().slice(-10)}
                    xKey="timestamp"
                    lines={[
                        { key: 'ca1Val', color: '#4F81FF', label: 'CA1' },
                        { key: 'ca2Val', color: '#8A63D2', label: 'CA2' },
                        { key: 'faVal', color: '#F4A62A', label: 'FA' }
                    ]}
                    title="Precision Moisture Trends"
                    description="Chronological batch verification (Last 10)"
                />


                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', margin: 0, textTransform: 'uppercase' }}>Recent Moisture Samples</h3>
                </div>

                <div className="table-outer-wrapper fade-in" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                    <table className="ui-table">
                        <thead>
                            <tr style={{ fontSize: '0.7rem' }}>
                                <th>Date & Shift</th><th>Time</th><th>Batch No.</th><th>CA1 %</th><th>CA2 %</th><th>FA %</th><th>Total</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.8rem' }}>
                            {displayRecords.map((group, index) => (
                                <tr key={index}>
                                    <td>{formatDateForDisplay(group.date)} ({group.shift})</td>
                                    <td><strong>{extractTime(group.timing)}</strong></td>
                                    <td><strong>{group.batchNo}</strong></td>
                                    <td style={{ color: '#3b82f6', fontWeight: '700' }}>{group.ca1Free !== '-' ? `${group.ca1Free}%` : '-'}</td>
                                    <td style={{ color: '#8b5cf6', fontWeight: '700' }}>{group.ca2Free !== '-' ? `${group.ca2Free}%` : '-'}</td>
                                    <td style={{ color: '#f59e0b', fontWeight: '700' }}>{group.faFree !== '-' ? `${group.faFree}%` : '-'}</td>
                                    <td style={{ fontWeight: '700' }}>{group.totalFree} Kg</td>
                                    <td>
                                        {isRecordEditable(group.timestamp) ? (
                                            <button className="btn-action" style={{ fontSize: '10px' }} onClick={() => {
                                                const consolidated = group.records.find(r => r.sectionType === 'ALL');
                                                handleEdit({
                                                    ...group,
                                                    id: group.id,
                                                    date: formatFromBackendDate(group.date),
                                                    mixDesignId: group.records[0]?.mixDesignId || group.mixDesignId || 'MIX-01',
                                                    // Map group back to UI state for editing
                                                    ca1Details: {
                                                        wetSample: group.records.find(r => r.sectionType === 'CA1')?.wtWetSample ?? consolidated?.wtWetSample ?? '',
                                                        driedSample: group.records.find(r => r.sectionType === 'CA1')?.wtDriedSample ?? consolidated?.wtDriedSample ?? '',
                                                        absorption: group.records.find(r => r.sectionType === 'CA1')?.absorptionPercent ?? consolidated?.absorptionPercent ?? ''
                                                    },
                                                    ca2Details: {
                                                        wetSample: group.records.find(r => r.sectionType === 'CA2')?.wtWetSample ?? '',
                                                        driedSample: group.records.find(r => r.sectionType === 'CA2')?.wtDriedSample ?? '',
                                                        absorption: group.records.find(r => r.sectionType === 'CA2')?.absorptionPercent ?? ''
                                                    },
                                                    faDetails: {
                                                        wetSample: group.records.find(r => r.sectionType === 'FA')?.wtWetSample ?? consolidated?.wtWetSample ?? '',
                                                        driedSample: group.records.find(r => r.sectionType === 'FA')?.wtDriedSample ?? consolidated?.wtDriedSample ?? '',
                                                        absorption: group.records.find(r => r.sectionType === 'FA')?.absorptionPercent ?? consolidated?.absorptionPercent ?? ''
                                                    },
                                                    userDryCA1: group.records.find(r => r.batchWtDryCa1)?.batchWtDryCa1 ?? consolidated?.batchWtDryCa1 ?? '',
                                                    userDryCA2: group.records.find(r => r.batchWtDryCa2)?.batchWtDryCa2 ?? consolidated?.batchWtDryCa2 ?? '',
                                                    userDryFA: group.records.find(r => r.batchWtDryFa)?.batchWtDryFa ?? consolidated?.batchWtDryFa ?? '',
                                                    userDryWater: group.records.find(r => r.batchWtDryWater)?.batchWtDryWater ?? consolidated?.batchWtDryWater ?? '',
                                                    userDryCement: group.records.find(r => r.batchWtDryCement)?.batchWtDryCement ?? consolidated?.batchWtDryCement ?? '',
                                                    userDryAdmix: group.records.find(r => r.batchWtDryAdmix)?.batchWtDryAdmix ?? consolidated?.batchWtDryAdmix ?? '1.44'
                                                });
                                            }}>Modify</button>
                                        ) : (
                                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700' }}>LOCKED</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );

    if (displayMode === 'inline') {
        return content;
    }

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1300px', width: '96%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <header className="modal-header">
                    <div>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Moisture Analysis Dashboard</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Precision Lab Verification</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="close-btn" onClick={onBack}>×</button>
                    </div>
                </header>
                {content}
            </div>
        </div>
    );
};

export default MoistureAnalysis;

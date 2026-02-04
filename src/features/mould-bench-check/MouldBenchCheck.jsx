import React, { useState, useEffect, useMemo } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import './MouldBenchCheck.css';

/**
 * MOULD & BENCH CHECKING MODULE
 * Refactored for modularity, readability, and SRS compliance.
 */

// --- Constants & Config ---
const CONSTANTS = {
    ASSET_TYPES: {
        BENCH: 'Bench',
        MOULD: 'Mould'
    },
    BENCH_VISUAL_OPTIONS: [
        "Visual Inspection Welding condition",
        "Visual Inspection Fresh material usage condition"
    ],
    MOULD_VISUAL_OPTIONS: [
        "Cracks in mould plates or channels",
        "Hairline cracks near welded joints",
        "Warping or bending of side plates",
        "Buckling of base plate",
        "Dent marks due to mishandling or impact",
        "Uneven or distorted mould profile"
    ],
    BENCH_DIMENSIONS: [
        "Length", "Width inside bench", "Distance between fixed end of first channel", "Distance between first & second channel",
        "Distance between second & third channel", "Distance between third & fourth channel", "Distance between fourth & fifth channel",
        "Distance between fifth & sixth channel", "Distance between sixth & seventh channel", "Distance between seventh & eighth channel",
        "Distance between eighth & ninth channel", "Distance between lifting hooks", "Distance between lifting hook to fixed end",
        "Distance between lifting hook to free end", "Jack height (Left)", "Jack height (Right)", "Jack length (Left)",
        "Jack length (Right)", "End box stand length (Left)", "End box stand length (Right)", "Tie plate thickness on channel",
        "Tie thickness", "Distance between jack & end box stand", "Free end box hole position", "Fixed end box hole position",
        "Dab bolt and nut position", "Main channel", "Bottom channel", "Rail below lifting hook", "Height of rail below lifting hook"
    ],
    MOULD_DIMENSIONS: [
        "Full Length", "Outer Length (insert to Insert)", "Between Rail Seat", "Centre of Mould to Centre of Rail Seat",
        "Centre of Rail Seat to Mould End", "Centre of Mould to Side", "End of Mould", "End Height", "Centre Height",
        "Rail Seat Height", "Slope Gauge", "End Plate Height"
    ]
};

// --- Helper Utilities ---
const DateUtils = {
    getNowISO: () => new Date().toISOString().split('T')[0],
    getNowTime: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    getDaysDiff: (dateStr) => {
        if (!dateStr) return null;
        return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    },
    isWithinHour: (timestamp) => {
        if (!timestamp) return false;
        return (Date.now() - new Date(timestamp).getTime()) < (60 * 60 * 1000);
    }
};

// --- Sub-Components ---

const SummaryCard = ({ title, count, subtext, border }) => (
    <div className="calc-card hover-lift" style={{ borderTop: `3px solid ${border}`, '--hover-border': border, flex: 1 }}>
        <div className="card-main">
            <span className="mini-label">{title}</span>
            <div className="calc-value">{count}</div>
        </div>
        <div className="card-bottom-row">
            <div className="subtext-label" style={{ color: border }}>{subtext}</div>
        </div>
    </div>
);

const AssetSummary = ({ allAssets, records }) => {
    const metrics = useMemo(() => {
        const benches = allAssets.filter(a => a.type === CONSTANTS.ASSET_TYPES.BENCH).length;
        const moulds = allAssets.filter(a => a.type === CONSTANTS.ASSET_TYPES.MOULD).length;

        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const benchesUsed = allAssets.filter(a => a.type === CONSTANTS.ASSET_TYPES.BENCH && a.lastCasting && new Date(a.lastCasting) >= thirtyDaysAgo).length;
        const mouldsUsed = allAssets.filter(a => a.type === CONSTANTS.ASSET_TYPES.MOULD && a.lastCasting && new Date(a.lastCasting) >= thirtyDaysAgo).length;

        const benchesCheckedMTD = new Set(records.filter(r => r.type === CONSTANTS.ASSET_TYPES.BENCH && new Date(r.dateOfChecking) >= firstOfMonth).map(r => r.assetNo)).size;
        const mouldsCheckedMTD = new Set(records.filter(r => r.type === CONSTANTS.ASSET_TYPES.MOULD && new Date(r.dateOfChecking) >= firstOfMonth).map(r => r.assetNo)).size;

        const unfitMoulds = new Set(records.filter(r => r.type === CONSTANTS.ASSET_TYPES.MOULD && r.overallResult === 'FAIL').map(r => r.assetNo)).size;

        const benchYield = benchesUsed ? Math.round((benchesCheckedMTD / benchesUsed) * 100) : 0;
        const mouldYield = mouldsUsed ? Math.round((mouldsCheckedMTD / mouldsUsed) * 100) : 0;

        return [
            { title: 'No. of Benches', count: benches, subtext: 'In Plant', color: '#3b82f6' },
            { title: 'No. of Moulds', count: moulds, subtext: 'In Plant', color: '#8b5cf6' },
            { title: 'Benches Used', count: benchesUsed, subtext: 'Last 30 Days', color: '#10b981' },
            { title: 'Moulds Used', count: mouldsUsed, subtext: 'Last 30 Days', color: '#10b981' },
            { title: 'Benches Checked', count: benchesCheckedMTD, subtext: 'This Month', color: '#f59e0b' },
            { title: 'Moulds Checked', count: mouldsCheckedMTD, subtext: 'This Month', color: '#f59e0b' },
            { title: '% Benches Checked', count: `${benchYield}%`, subtext: 'Out of Used', color: '#10b981' },
            { title: '% Moulds Checked', count: `${mouldYield}%`, subtext: 'Out of Used', color: '#10b981' },
            { title: 'Not Fit for Casting', count: unfitMoulds, subtext: 'Moulds currently', color: '#ef4444' }
        ];
    }, [allAssets, records]);

    return (
        <div className="fade-in">
            <div className="mould-bench-summary-grid">
                {metrics.map((m, i) => <SummaryCard key={i} {...m} />)}
            </div>
        </div>
    );
};

const HistoryLogs = ({ records, onAdd, onModify, onDelete }) => (
    <div className="table-outer-wrapper fade-in">
        <div className="history-header">
            <h4 className="m-0 fw-800 color-navy">List of Checking Done</h4>
            <div className="btn-group">
                <button className="toggle-btn" onClick={() => onAdd(CONSTANTS.ASSET_TYPES.BENCH)}>+ New Bench Check</button>
                <button className="toggle-btn purple-btn" onClick={() => onAdd(CONSTANTS.ASSET_TYPES.MOULD)}>+ New Mould Check</button>
            </div>
        </div>
        <div className="table-responsive">
            <table className="ui-table">
                <thead>
                    <tr>
                        <th>Date & Time of Checking</th>
                        <th>Bench / Mould No.</th>
                        <th>Bench Check Result</th>
                        <th>Mould Check Result</th>
                        <th>Overall Check Result</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length === 0 ? (
                        <tr><td colSpan="6" className="empty-msg">No records found.</td></tr>
                    ) : (
                        records.map(record => (
                            <tr key={record.id} className="table-row-hover">
                                <td><span className="fw-700">{record.dateOfChecking}</span> <span className="text-muted">{record.checkTime}</span></td>
                                <td><strong>{record.assetNo}</strong> <span className="location-tag">({record.location})</span></td>
                                <td className={record.type === 'Bench' ? (record.overallResult === 'OK' ? 'text-success' : 'text-danger') : ''}>
                                    {record.type === 'Bench' ? record.overallResult : 'N/A'}
                                </td>
                                <td className={record.type === 'Mould' ? (record.overallResult === 'OK' ? 'text-success' : 'text-danger') : ''}>
                                    {record.type === 'Mould' ? record.overallResult : 'N/A'}
                                </td>
                                <td><span className={`fw-800 ${record.overallResult === 'OK' ? 'text-success' : 'text-danger'}`}>{record.overallResult}</span></td>
                                <td className="text-center">
                                    {DateUtils.isWithinHour(record.timestamp) ? (
                                        <div className="btn-group-center">
                                            <button className="btn-action mini" onClick={() => onModify(record)}>Modify</button>
                                            <button className="btn-action mini danger" onClick={() => onDelete(record.id)}>Delete</button>
                                        </div>
                                    ) : <span className="locked-text">Locked</span>}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const AssetMasterList = ({ allAssets, records }) => {
    const listData = useMemo(() => {
        return allAssets.map(asset => {
            const lastCheck = records
                .filter(r => r.assetNo === (asset.assetNo || asset.name))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            const lastCheckDate = lastCheck ? lastCheck.dateOfChecking : asset.lastChecking;
            const daysSinceCasting = DateUtils.getDaysDiff(asset.lastCasting) || 0;
            const daysSinceChecking = DateUtils.getDaysDiff(lastCheckDate) ?? 999;

            let status = "Checking Done";
            let color = "#10b981";

            if (daysSinceCasting > 30) { status = "Not in Use"; color = "#94a3b8"; }
            else if (daysSinceChecking > 30) { status = "Checking Pending"; color = "#ef4444"; }

            return { ...asset, lastCheck, lastCheckDate, daysSinceCasting, daysSinceChecking, status, color };
        });
    }, [allAssets, records]);

    return (
        <div className="table-outer-wrapper fade-in">
            <div className="content-title-row">
                <h4>List of all Benches & Moulds with Checking Status</h4>
            </div>
            <div className="table-responsive">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Bench or Mould No.</th>
                            <th>Last Date of Casting</th>
                            <th>Last Date of Checking</th>
                            <th>Days since Last Casting</th>
                            <th>Days since Last Checking</th>
                            <th>Status</th>
                            <th>Last Checking Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listData.map(asset => (
                            <tr key={asset.id} className="table-row-hover">
                                <td><strong>{asset.assetNo || asset.name}</strong> <span className="type-tag">{asset.type.toUpperCase()}</span></td>
                                <td>{asset.lastCasting || '-'}</td>
                                <td>{asset.lastCheckDate || '-'}</td>
                                <td>{asset.daysSinceCasting}</td>
                                <td>{asset.daysSinceChecking === 999 ? 'N/A' : asset.daysSinceChecking}</td>
                                <td><span className="status-badge" style={{ color: asset.color, background: `${asset.color}10` }}>{asset.status.toUpperCase()}</span></td>
                                <td className={asset.lastCheck ? (asset.lastCheck.overallResult === 'OK' ? 'text-success' : 'text-danger') : ''}>
                                    {asset.lastCheck ? asset.lastCheck.overallResult : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const InspectionForm = ({ formState, setFormState, onSave, onCancel, editingEntry }) => {
    const isBench = formState.type === CONSTANTS.ASSET_TYPES.BENCH;
    const visualOptions = isBench ? CONSTANTS.BENCH_VISUAL_OPTIONS : CONSTANTS.MOULD_VISUAL_OPTIONS;
    const dimensionLabels = isBench ? CONSTANTS.BENCH_DIMENSIONS : CONSTANTS.MOULD_DIMENSIONS;

    return (
        <div className="fade-in">
            <div className="content-title-row">
                <h3>{editingEntry ? 'Modify' : 'New'} {formState.type} Check Entry</h3>
                <button className="toggle-btn secondary mini" onClick={onCancel}>Back to Logs</button>
            </div>

            <div className="mould-form-container">
                <div className="mould-form-header-info">
                    <div className="form-field">
                        <label className="field-label-mini">LINE / SHED NO.</label>
                        <input className="field-input-static" value={formState.location} readOnly />
                    </div>
                    <div className="form-field">
                        <label className="field-label-mini">ASSET TYPE</label>
                        <select className="field-select-bold" value={formState.type} onChange={e => setFormState({ ...formState, type: e.target.value, dimensionReasons: {} })}>
                            <option value={CONSTANTS.ASSET_TYPES.BENCH}>Bench / Gang</option>
                            <option value={CONSTANTS.ASSET_TYPES.MOULD}>Mould</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="field-label-mini">{isBench ? 'BENCH / GANG NO.' : 'MOULD NO.'}</label>
                        <input className="field-input" placeholder="e.g. 210-A" value={formState.assetNo} onChange={e => setFormState({ ...formState, assetNo: e.target.value })} />
                    </div>
                    <div className="form-field">
                        <label className="field-label-mini">DATE OF CHECKING</label>
                        <input className="field-input" type="date" value={formState.dateOfChecking} onChange={e => setFormState({ ...formState, dateOfChecking: e.target.value })} />
                    </div>
                    <div className="form-field">
                        <label className="field-label-mini">LAST CASTING DATE</label>
                        <input className="field-input-static" value={formState.lastCasting} readOnly />
                    </div>
                    <div className="form-field">
                        <label className="field-label-mini">SLEEPER TYPE</label>
                        <input className="field-input-static" value={formState.sleeperType} readOnly />
                    </div>
                </div>

                <h4 className="form-section-title">{formState.type} Quality Check</h4>

                <CollapsibleSection title="Visual Inspection" defaultOpen={true}>
                    <div className="form-grid-2">
                        <div className="form-field">
                            <label className="field-label-sm">Visual Result</label>
                            <select className="field-select" value={formState.visualResult} onChange={e => setFormState({ ...formState, visualResult: e.target.value })}>
                                <option value="ok">OK</option>
                                <option value="not-ok">Not OK</option>
                            </select>
                        </div>
                        {formState.visualResult === 'not-ok' && (
                            <div className="form-field">
                                <label className="field-label-sm">Visual Discrepancy Reason</label>
                                <select className="field-select" value={formState.visualReason} onChange={e => setFormState({ ...formState, visualReason: e.target.value })}>
                                    <option value="">Select Reason...</option>
                                    {visualOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Dimensional Checking" defaultOpen={true}>
                    <div className="form-field mg-b-24">
                        <label className="field-label-sm">Dimensional Result</label>
                        <select className="field-select" value={formState.dimensionResult} onChange={e => setFormState({ ...formState, dimensionResult: e.target.value })}>
                            <option value="ok">OK</option>
                            <option value="not-ok">Not OK</option>
                        </select>
                    </div>

                    {formState.dimensionResult === 'not-ok' && (
                        <div className="discrepancy-card">
                            <label className="discrepancy-label">Enter Measurements for Discrepancy</label>
                            <div className="dimensional-discrepancy-grid">
                                {dimensionLabels.map(label => (
                                    <div key={label} className="dimension-input-row">
                                        <label>{label}</label>
                                        <input
                                            type="text"
                                            value={formState.dimensionReasons[label] || ''}
                                            onChange={e => setFormState({
                                                ...formState,
                                                dimensionReasons: { ...formState.dimensionReasons, [label]: e.target.value }
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CollapsibleSection>

                <div className="form-field">
                    <label className="field-label-sm">Remarks</label>
                    <textarea
                        className="field-textarea"
                        placeholder="Additional observations..."
                        value={formState.remarks}
                        onChange={e => setFormState({ ...formState, remarks: e.target.value })}
                    />
                </div>

                <div className="action-row-center mg-t-40">
                    <button className="toggle-btn" onClick={onSave}>{editingEntry ? 'Update Record' : 'Submit Entry'}</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const MouldBenchCheck = ({ onBack, sharedState, initialModule, initialViewMode, activeContainer, isInline = false, showForm, setShowForm }) => {
    const { records, setRecords, allAssets } = sharedState;
    const [viewMode, setViewMode] = useState(initialViewMode === 'form' ? 'form' : 'dashboard');
    const [activeModule, setActiveModule] = useState(initialModule || 'summary');
    const [editingEntry, setEditingEntry] = useState(null);

    const effectiveShowForm = showForm !== undefined ? showForm : (viewMode === 'form');

    const [formState, setFormState] = useState({
        type: CONSTANTS.ASSET_TYPES.BENCH,
        assetNo: '',
        location: activeContainer?.name || '',
        lastCasting: '',
        sleeperType: 'RT-1234',
        dateOfChecking: DateUtils.getNowISO(),
        visualResult: 'ok',
        visualReason: '',
        dimensionResult: 'ok',
        dimensionReasons: {},
        remarks: ''
    });

    useEffect(() => {
        if (editingEntry) setFormState({ ...editingEntry });
        else if (activeContainer?.name) setFormState(prev => ({ ...prev, location: activeContainer.name }));
    }, [editingEntry, activeContainer]);

    const handleSave = () => {
        if (!formState.assetNo) return alert('Please enter Asset No.');

        const newRecord = {
            ...formState,
            id: editingEntry ? editingEntry.id : Date.now(),
            timestamp: editingEntry ? editingEntry.timestamp : new Date().toISOString(),
            checkTime: DateUtils.getNowTime(),
            overallResult: (formState.visualResult === 'ok' && formState.dimensionResult === 'ok') ? 'OK' : 'FAIL'
        };

        setRecords(prev => editingEntry ? prev.map(r => r.id === editingEntry.id ? newRecord : r) : [newRecord, ...prev]);
        handleCloseForm();
    };

    const handleAdd = (type) => {
        setEditingEntry(null);
        setFormState({
            type, assetNo: '', location: activeContainer?.name || '',
            lastCasting: '2025-01-31', sleeperType: 'RT-1234',
            dateOfChecking: DateUtils.getNowISO(),
            visualResult: 'ok', visualReason: '', dimensionResult: 'ok', dimensionReasons: {}, remarks: ''
        });
        if (setShowForm) setShowForm(true); else setViewMode('form');
    };

    const handleCloseForm = () => {
        if (setShowForm) setShowForm(false); else setViewMode('dashboard');
        setEditingEntry(null);
    };

    const dashboardCards = useMemo(() => [
        { id: 'summary', title: 'Summary', color: '#42818c', count: allAssets?.length || 0, label: 'Quality Metrics' },
        { id: 'checked', title: 'List of Checking Done', color: '#10b981', count: records.length, label: 'Add / View Logs' },
        { id: 'allAssets', title: 'All Benches & Moulds', color: '#3b82f6', count: allAssets?.length || 0, label: 'Checking Status' }
    ], [allAssets, records]);

    const content = (
        <div className="mould-bench-container">
            <div className="mould-bench-dashboard-grid mb-24">
                {dashboardCards.map(card => (
                    <div
                        key={card.id}
                        className={`asset-card ${activeModule === card.id ? 'active' : ''}`}
                        onClick={() => { setActiveModule(card.id); handleCloseForm(); }}
                        style={{ borderColor: activeModule === card.id ? card.color : '#e2e8f0', '--active-color-alpha': `${card.color}20` }}
                    >
                        <div className="asset-card-header">
                            <div>
                                <h4 className="asset-card-title">{card.title}</h4>
                                <div className="asset-card-count">{card.count}</div>
                            </div>
                        </div>
                        <div className="asset-card-label" style={{ color: card.color }}>{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="mould-bench-content-area">
                {effectiveShowForm ? (
                    <InspectionForm
                        formState={formState}
                        setFormState={setFormState}
                        onSave={handleSave}
                        onCancel={handleCloseForm}
                        editingEntry={editingEntry}
                    />
                ) : (
                    <>
                        {activeModule === 'summary' && <AssetSummary allAssets={allAssets} records={records} />}
                        {activeModule === 'checked' && <HistoryLogs records={records} onAdd={handleAdd} onModify={(r) => { setEditingEntry(r); if (setShowForm) setShowForm(true); else setViewMode('form'); }} onDelete={(id) => setRecords(p => p.filter(r => r.id !== id))} />}
                        {activeModule === 'allAssets' && <AssetMasterList allAssets={allAssets} records={records} />}
                    </>
                )}
            </div>
        </div>
    );

    if (isInline) return content;

    return (
        <div className="modal-overlay" onClick={onBack}>
            <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="header-titles">
                        <h2>Asset Monitoring Console</h2>
                        <p className="header-subtitle">ASSET QUALITY & CALIBRATION TRACKING</p>
                    </div>
                    <button className="close-btn" onClick={onBack}>×</button>
                </header>
                <div className="modal-body-wrapper">{content}</div>
            </div>
        </div>
    );
};

export default MouldBenchCheck;

import React, { useState, useEffect } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import './MouldBenchCheck.css';

/**
 * Mould & Bench Checking Console
 * Refactored for:
 * 1. Compact typography (smaller font sizes)
 * 2. Dynamic interactive design (hover effects, transitions)
 * 3. Clean component-based architecture
 */

// --- Sub-Components ---

const SummaryCard = ({ title, count, label, color, background, border, subtext, percentage }) => (
    <div className="calc-card hover-lift" style={{
        borderTop: `3px solid ${border}`,
        '--hover-border': border,
        flex: 1
    }}>
        <div className="card-main">
            <span className="mini-label">{title}</span>
            <div className="calc-value">{count}</div>
        </div>
        <div className="card-bottom-row">
            <div className="subtext-label" style={{ color: border }}>{subtext}</div>
            {percentage !== undefined && (
                <div className="yield-pill">
                    {percentage}% Yield
                </div>
            )}
        </div>
    </div>
);

const AssetSummary = ({ allAssets, records }) => {
    const benches = allAssets.filter(a => a.type === 'Bench').length;
    const moulds = allAssets.filter(a => a.type === 'Mould').length;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentRecords = records.filter(r => new Date(r.dateOfChecking || r.checkDate) >= thirtyDaysAgo);
    const mtdRecords = records.filter(r => new Date(r.dateOfChecking || r.checkDate) >= firstOfCurrentMonth);

    const uniqueBenchesUsed = new Set(recentRecords.filter(r => r.type === 'Bench').map(r => r.assetNo || r.name)).size;
    const uniqueMouldsUsed = new Set(recentRecords.filter(r => r.type === 'Mould').map(r => r.assetNo || r.name)).size;

    const checkedBenchesMTD = new Set(mtdRecords.filter(r => r.type === 'Bench').map(r => r.assetNo || r.name)).size;
    const checkedMouldsMTD = new Set(mtdRecords.filter(r => r.type === 'Mould').map(r => r.assetNo || r.name)).size;

    const nonFitMoulds = records.filter(r => r.type === 'Mould' && (r.overallResult === 'FAIL' || r.result === 'FAIL' || r.dimensionalCheck === 'Minor Issue')).length;

    const metrics = [
        { title: 'Total Benches', count: benches, subtext: 'In Plant', color: '#3b82f6' },
        { title: 'Total Moulds', count: moulds, subtext: 'In Plant', color: '#8b5cf6' },
        { title: 'Benches Used', count: uniqueBenchesUsed, subtext: 'Last 30 Days', color: '#10b981' },
        { title: 'Moulds Used', count: uniqueMouldsUsed, subtext: 'Last 30 Days', color: '#10b981' },
        { title: 'Checked (MTD)', count: checkedBenchesMTD, subtext: 'Benches', color: '#f59e0b', percentage: benches ? Math.round((checkedBenchesMTD / benches) * 100) : 0 },
        { title: 'Checked (MTD)', count: checkedMouldsMTD, subtext: 'Moulds', color: '#f59e0b', percentage: moulds ? Math.round((checkedMouldsMTD / moulds) * 100) : 0 },
        { title: 'Failed Checks', count: nonFitMoulds, subtext: 'Requires Attention', color: '#ef4444' }
    ];

    return (
        <div className="fade-in">
            <div className="mould-bench-summary-grid">
                {metrics.map((m, i) => (
                    <SummaryCard key={i} title={m.title} count={m.count} subtext={m.subtext} border={m.color} percentage={m.percentage} />
                ))}
            </div>
        </div>
    );
};

// --- Main Module ---

const MouldBenchCheck = ({ onBack, sharedState, initialModule, initialViewMode, isInline = false, showForm: propsShowForm, setShowForm: propsSetShowForm }) => {
    const { records, setRecords, allAssets } = sharedState;
    const [localShowForm, setLocalShowForm] = useState(initialViewMode === 'form');
    const [viewMode, setViewMode] = useState(initialViewMode === 'form' ? 'form' : 'dashboard');
    const [activeModule, setActiveModule] = useState(initialModule || 'summary');
    const [editingEntry, setEditingEntry] = useState(null);

    const isFormOpen = propsShowForm !== undefined ? propsShowForm : (viewMode === 'form');
    const setIsFormOpen = (val) => {
        if (propsSetShowForm) propsSetShowForm(val);
        setViewMode(val ? 'form' : 'dashboard');
    };

    const [formState, setFormState] = useState({
        name: '', type: 'Bench', assetNo: '', lastCasting: '', sleeperType: 'RT-1234', dateOfChecking: new Date().toISOString().split('T')[0],
        visualResult: 'ok', visualReason: '', dimensionResult: 'ok', dimensionReasons: {}, remarks: ''
    });

    useEffect(() => {
        if (editingEntry) setFormState({ ...editingEntry });
    }, [editingEntry]);

    const handleSave = () => {
        const newRecord = {
            ...formState,
            id: editingEntry ? editingEntry.id : Date.now(),
            timestamp: editingEntry ? editingEntry.timestamp : new Date().toISOString(),
            checkTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            overallResult: (formState.visualResult === 'ok' && formState.dimensionResult === 'ok') ? 'OK' : 'FAIL'
        };
        if (editingEntry) {
            setRecords(prev => prev.map(r => r.id === editingEntry.id ? newRecord : r));
        } else {
            setRecords(prev => [newRecord, ...prev]);
        }
        setIsFormOpen(false);
        setEditingEntry(null);
    };

    const handleAddNew = () => {
        setEditingEntry(null);
        setFormState({
            name: '', type: 'Bench', assetNo: '', lastCasting: '2024-05-30', sleeperType: 'RT-1234', dateOfChecking: new Date().toISOString().split('T')[0],
            visualResult: 'ok', visualReason: '', dimensionResult: 'ok', dimensionReasons: {}, remarks: ''
        });
        setIsFormOpen(true);
    };

    const isWithinHour = (timestamp) => {
        if (!timestamp) return false;
        const diff = Date.now() - new Date(timestamp).getTime();
        return diff < (60 * 60 * 1000);
    };

    const renderLogs = () => (
        <div className="table-outer-wrapper fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0.5rem' }}>
                <h4 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>History of Checks</h4>
                <button className="toggle-btn" onClick={handleAddNew} style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '800' }}>+ Add New Entry</button>
            </div>
            <div className="table-responsive">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Asset No.</th>
                            <th>Type</th>
                            <th>Bench Result</th>
                            <th>Mould Result</th>
                            <th>Overall Result</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr><td colSpan="7" className="empty-msg">No records found.</td></tr>
                        ) : (
                            records.map(record => (
                                <tr key={record.id} className="table-row-hover">
                                    <td><span className="fw-700">{record.dateOfChecking || record.checkDate}</span> <span className="text-muted">{record.checkTime}</span></td>
                                    <td><strong>{record.assetNo || record.name}</strong></td>
                                    <td><span className={`status-pill ${record.type === 'Bench' ? 'witnessed' : 'manual'}`}>{record.type}</span></td>
                                    <td className={(record.visualResult || record.visualCheck) === 'ok' || (record.visualResult || record.visualCheck) === 'OK' ? 'text-success' : 'text-danger'}>
                                        {record.type === 'Bench' ? (record.visualResult || record.visualCheck || 'N/A').toUpperCase() : 'N/A'}
                                    </td>
                                    <td className={(record.dimensionResult || record.dimensionalCheck) === 'ok' || (record.dimensionResult || record.dimensionalCheck) === 'OK' ? 'text-success' : 'text-danger'}>
                                        {record.type === 'Mould' ? (record.dimensionResult || record.dimensionalCheck || 'N/A').toUpperCase() : 'N/A'}
                                    </td>
                                    <td><span className={`fw-800 ${(record.overallResult || record.result) === 'OK' ? 'text-success' : 'text-danger'}`}>{record.overallResult || record.result}</span></td>
                                    <td className="text-center">
                                        {isWithinHour(record.timestamp) ? (
                                            <div className="btn-group-center">
                                                <button className="btn-action mini" onClick={() => { setEditingEntry(record); setIsFormOpen(true); }}>Modify</button>
                                                <button className="btn-action mini danger" onClick={() => setRecords(prev => prev.filter(r => r.id !== record.id))}>Delete</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Locked</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- Mock Data for All Assets ---
    const mockAssets = Array.from({ length: 15 }, (_, i) => ({
        id: `mock-${i}`,
        assetNo: `${i % 2 === 0 ? 'B' : 'M'}-${300 + i}`,
        name: `${i % 2 === 0 ? 'Bench' : 'Mould'} ${300 + i}`,
        type: i % 2 === 0 ? 'Bench' : 'Mould',
        lastCasting: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastChecking: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));

    const displayAssets = (allAssets && allAssets.length > 0) ? allAssets : mockAssets;

    const renderAllAssets = () => (
        <div className="table-outer-wrapper fade-in">
            <div className="content-title-row">
                <h4>List of all Benches & Moulds with Checking Status</h4>
            </div>
            <div className="table-responsive">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th>Asset No.</th>
                            <th>Type</th>
                            <th>Last Date of Casting</th>
                            <th>Last Date of Bench / Mould Checking</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayAssets.map(asset => {
                            const daysSinceCasting = asset.lastCasting ? Math.floor((Date.now() - new Date(asset.lastCasting).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                            const daysSinceChecking = asset.lastChecking ? Math.floor((Date.now() - new Date(asset.lastChecking).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                            let status = "Checking Done";
                            let statusColor = "#10b981";

                            if (daysSinceCasting > 30) {
                                status = "Not in Use";
                                statusColor = "#94a3b8";
                            } else if (daysSinceChecking > 30) {
                                status = "Checking Pending";
                                statusColor = "#ef4444";
                            }

                            return (
                                <tr key={asset.id} className="table-row-hover">
                                    <td><strong>{asset.assetNo || asset.name}</strong></td>
                                    <td><span className={`status-pill ${asset.type === 'Bench' ? 'witnessed' : 'manual'}`}>{asset.type}</span></td>
                                    <td>{asset.lastCasting || '-'}</td>
                                    <td>{asset.lastChecking || '-'}</td>
                                    <td>
                                        <span className="status-badge" style={{ color: statusColor, background: `${statusColor}10` }}>
                                            {status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderForm = () => {
        const benchDimensionLabels = [
            "Length", "Width inside bench", "Distance between fixed end of first channel", "Distance between first & second channel",
            "Distance between second & third channel", "Distance between third & fourth channel", "Distance between fourth & fifth channel",
            "Distance between fifth & sixth channel", "Distance between sixth & seventh channel", "Distance between seventh & eighth channel",
            "Distance between eighth & ninth channel", "Distance between lifting hooks", "Distance between lifting hook to fixed end",
            "Distance between lifting hook to free end", "Jack height (Left)", "Jack height (Right)", "Jack length (Left)",
            "Jack length (Right)", "End box stand length (Left)", "End box stand length (Right)", "Tie plate thickness on channel",
            "Tie thickness", "Distance between jack & end box stand", "Free end box hole position", "Fixed end box hole position",
            "Dab bolt and nut position", "Main channel", "Bottom channel", "Rail below lifting hook", "Height of rail below lifting hook"
        ];

        const mouldDimensionLabels = [
            "Full Length", "Outer Length (insert to Insert)", "Between Rail Seat", "Centre of Mould to Centre of Rail Seat",
            "Centre of Rail Seat to Mould End", "Centre of Mould to Side", "End of Mould", "End Height", "Centre Height",
            "Rail Seat Height", "Slope Gauge", "End Plate Height"
        ];

        const visualDiscrepancyOptions = formState.type === 'Bench'
            ? ["Welding condition", "Fresh material usage condition"]
            : ["Cracks in mould plates or channels", "Hairline cracks near welded joints", "Warping or bending of side plates", "Buckling of base plate", "Dent marks due to mishandling or impact", "Uneven or distorted mould profile"];

        return (
            <div className="fade-in">
                <div className="content-title-row">
                    <h3>{editingEntry ? 'Modify' : 'New'} {formState.type} Check Entry</h3>
                    <button className="toggle-btn secondary mini" onClick={() => setIsFormOpen(false)}>Back to Dashboard</button>
                </div>

                <div className="mould-form-container">
                    {/* Header Info */}
                    <div className="mould-form-header-info">
                        <div className="form-field">
                            <label className="field-label-mini">ASSET TYPE</label>
                            <select className="field-select-bold" value={formState.type} onChange={e => setFormState({ ...formState, type: e.target.value })}>
                                <option value="Bench">Bench / Gang</option>
                                <option value="Mould">Mould</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="field-label-mini">{formState.type.toUpperCase()} NO.</label>
                            <input className="field-input" type="text" placeholder="e.g. 210-A" value={formState.assetNo} onChange={e => setFormState({ ...formState, assetNo: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label className="field-label-mini">LAST CASTING DATE</label>
                            <input className="field-input-static" type="text" value={formState.lastCasting} readOnly />
                        </div>
                        <div className="form-field">
                            <label className="field-label-mini">SLEEPER TYPE</label>
                            <input className="field-input-static" type="text" value={formState.sleeperType} readOnly />
                        </div>
                        <div className="form-field">
                            <label className="field-label-mini">CHECKING DATE</label>
                            <input className="field-input" type="date" value={formState.dateOfChecking} onChange={e => setFormState({ ...formState, dateOfChecking: e.target.value })} />
                        </div>
                    </div>

                    {/* Visual Inspection */}
                    <CollapsibleSection title="Visual Inspection" defaultOpen={true}>
                        <div className="form-grid-2">
                            <div className="form-field">
                                <label className="field-label-sm">Visual Checking Result</label>
                                <select className="field-select" value={formState.visualResult} onChange={e => setFormState({ ...formState, visualResult: e.target.value })}>
                                    <option value="ok">OK</option>
                                    <option value="not-ok">Not OK</option>
                                </select>
                            </div>
                            {formState.visualResult === 'not-ok' && (
                                <div className="form-field">
                                    <label className="field-label-sm">Discrepancy Reason</label>
                                    <select className="field-select" value={formState.visualReason} onChange={e => setFormState({ ...formState, visualReason: e.target.value })}>
                                        <option value="">Select Reason...</option>
                                        {visualDiscrepancyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                    {/* Dimensional Checking */}
                    <CollapsibleSection title="Dimensional Checking" defaultOpen={true}>
                        <div className="form-field mg-b-24">
                            <label className="field-label-sm">Overall Dimensional Result</label>
                            <select className="field-select" value={formState.dimensionResult} onChange={e => setFormState({ ...formState, dimensionResult: e.target.value })}>
                                <option value="ok">OK</option>
                                <option value="not-ok">Not OK</option>
                            </select>
                        </div>

                        {formState.dimensionResult === 'not-ok' && (
                            <div className="discrepancy-card">
                                <label className="discrepancy-label">Discrepancy Details (Enter measurements for issues)</label>
                                <div className="dimensional-discrepancy-grid">
                                    {(formState.type === 'Bench' ? benchDimensionLabels : mouldDimensionLabels).map(label => (
                                        <div key={label} className="dimension-input-row">
                                            <label>{label}</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Value"
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
                            placeholder="Enter any additional observations..."
                            value={formState.remarks}
                            onChange={e => setFormState({ ...formState, remarks: e.target.value })}
                        />
                    </div>

                    <div className="action-row-center mg-t-40">
                        <button className="toggle-btn" onClick={handleSave}>
                            {editingEntry ? 'Update Inspection Record' : 'Submit Check Entry'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const dashboardContent = (
        <div className="mould-bench-dashboard-grid">
            {[
                { id: 'summary', title: 'Summary', color: '#42818c', count: displayAssets?.length || 0, label: '' },
                { id: 'checked', title: 'Bench & Mould Checked', color: '#10b981', count: records.length, label: 'Add / View Logs' },
                { id: 'allAssets', title: 'All Bench & Mould', color: '#3b82f6', count: displayAssets?.length || 0, label: 'Master Assets' }
            ].map(mod => (
                <div
                    key={mod.id}
                    className={`asset-card ${activeModule === mod.id ? 'active' : ''}`}
                    onClick={() => {
                        setActiveModule(mod.id);
                        if (isFormOpen) setIsFormOpen(false);
                    }}
                    style={{
                        borderColor: activeModule === mod.id ? mod.color : '#e2e8f0',
                        '--active-color-alpha': `${mod.color}20`
                    }}
                >
                    <div className="asset-card-header">
                        <div>
                            <h4 className="asset-card-title">{mod.title}</h4>
                            <div className="asset-card-count">{mod.count}</div>
                        </div>
                    </div>
                    <div className="asset-card-label" style={{ color: mod.color }}>{mod.label}</div>
                </div>
            ))}
        </div>
    );

    const content = (
        <div className="mould-bench-container">
            {isFormOpen ? renderForm() : (
                <>
                    {dashboardContent}
                    {activeModule === 'summary' && <AssetSummary allAssets={displayAssets} records={records} />}
                    {activeModule === 'checked' && renderLogs()}
                    {activeModule === 'allAssets' && renderAllAssets()}
                </>
            )}
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

                <div className="modal-body-wrapper">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default MouldBenchCheck;

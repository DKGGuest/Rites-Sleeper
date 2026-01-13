/**
 * Pending Verification Tab Component
 * Optimized for Compact "In-View" Desktop Display
 */

import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import CallsFilterSection from './common/CallsFilterSection';
import CallDetailsModal from './CallDetailsModal';
import { formatDateTime } from '../utils/helpers';

// Compact Icons
const Icons = {
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Details: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Verify: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  Return: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  Reroute: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  ),
  Total: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Fresh: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>,
  Resub: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  ReturnedList: () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

const KPICard = ({ title, value, icon, variant }) => (
  <div className={`kpi-card kpi-${variant}`}>
    <div className="kpi-header">
      <div className="kpi-icon-box">{icon}</div>
      <span className="kpi-title">{title}</span>
    </div>
    <div className="kpi-value">{value}</div>
  </div>
);

const PendingVerificationTab = ({ calls = [], kpis = {}, onVerifyAccept, onReturn, onReroute, onViewHistory, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'callNumber', label: 'Call No.', render: (v) => <span className="col-nowrap col-bold">{v}</span> },
    { key: 'vendor', label: 'Vendor Name', render: (v) => <span style={{ fontWeight: 500 }}>{v?.name || '-'}</span> },
    { key: 'submissionDateTime', label: 'Submitted', render: (v) => <span className="col-nowrap">{formatDateTime(v).split(' ')[0]}</span> },
    { key: 'poNumber', label: 'PO No.', render: (v) => <span className="col-nowrap">{v}</span> },
    { key: 'product', label: 'Prod-Stage', render: (_, r) => <span style={{ fontSize: '11px' }}>{r.product || r.productStage}</span> },
    { key: 'desiredInspectionDate', label: 'Insp.Date', render: (v) => <span className="col-nowrap">{formatDateTime(v).split(' ')[0]}</span> },
    { key: 'placeOfInspection', label: 'Location', render: (v, r) => <div style={{ maxWidth: '100px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || r.location}</div> },
    { key: 'status', label: 'Status', render: () => <span className="status-badge">Pending</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons-flex">
          <button className="btn-action" onClick={() => onViewHistory(row)} title="History"><Icons.History /> Hist</button>
          <button className="btn-action" onClick={() => onViewDetails(row)} title="Details"><Icons.Details /> Det</button>
          <button className="btn-action btn-verify" onClick={() => onVerifyAccept(row)}><Icons.Verify /> Verify</button>
          <button className="btn-action" onClick={() => onReturn(row)}>Retn</button>
          <button className="btn-action btn-reroute" onClick={() => onReroute(row)}>Route</button>
        </div>
      )
    }
  ];

  const filteredCalls = useMemo(() => {
    return calls.filter(call =>
      !searchTerm ||
      call.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [calls, searchTerm]);

  return (
    <div className="tab-content-inner">
      <div className="kpi-grid">
        <KPICard title="TOTAL" value={kpis?.total || 0} icon={<Icons.Total />} variant="blue" />
        <KPICard title="FRESH" value={kpis?.fresh || 0} icon={<Icons.Fresh />} variant="green" />
        <KPICard title="RESUB" value={kpis?.resubmissions || 0} icon={<Icons.Resub />} variant="purple" />
        <KPICard title="RETURN" value={kpis?.returned || 0} icon={<Icons.ReturnedList />} variant="red" />
      </div>

      <div className="search-container-large">
        <input
          type="text"
          placeholder="Search calls, vendors, or POs..."
          className="main-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table-card">
        <div className="table-toolbar">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Pending Verification Calls ({filteredCalls.length})</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select className="page-select" style={{ padding: '2px 4px', fontSize: '10px' }}><option>10 / page</option></select>
          </div>
        </div>

        <DataTable columns={columns} data={filteredCalls} emptyMessage="No calls found" />
      </div>
    </div>
  );
};

export default PendingVerificationTab;

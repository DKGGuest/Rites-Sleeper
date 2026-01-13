/**
 * Disposed Calls Tab Component
 * Displays disposed calls (read-only)
 */

import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
import CallsFilterSection from './common/CallsFilterSection';
import { CALL_STATUS_CONFIG } from '../utils/constants';
import { formatDateTime } from '../utils/helpers';

const DisposedCallsTab = ({ calls = [], kpis = {}, onViewHistory }) => {
  const [searchTerm] = useState('');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Product Type');
  const [filters, setFilters] = useState({
    productTypes: [],
    vendors: [],
    dateFrom: '',
    dateTo: '',
    poNumbers: [],
    stage: '',
    callNumbers: []
  });

  // KPI tiles data
  const kpiTiles = [
    {
      label: 'Total Disposed',
      value: kpis.total || 0,
      color: '#6b7280',
      icon: '📦'
    },
    {
      label: 'Completed',
      value: kpis.completed || 0,
      color: '#22c55e',
      icon: '✅'
    },
    {
      label: 'Withdrawn',
      value: kpis.withdrawn || 0,
      color: '#6b7280',
      icon: '🔙'
    },
    {
      label: 'Cancelled',
      value: kpis.cancelled || 0,
      color: '#f59e0b',
      icon: '❌'
    },
    {
      label: 'Rejected',
      value: kpis.rejected || 0,
      color: '#ef4444',
      icon: '🚫'
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'callNumber',
      label: 'Call Number',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'vendor',
      label: 'Vendor Name',
      sortable: true,
      render: (value) => value?.name || '-'
    },
    {
      key: 'submissionDateTime',
      label: 'Submission Date/Time',
      sortable: true,
      render: (value) => formatDateTime(value)
    },
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true
    },
    {
      key: 'productStage',
      label: 'Product Type - Stage',
      sortable: true
    },
    {
      key: 'desiredInspectionDate',
      label: 'Desired Inspection Date',
      sortable: true,
      render: (value) => formatDateTime(value).split(' ')[0]
    },
    {
      key: 'placeOfInspection',
      label: 'Place of Inspection',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const config = CALL_STATUS_CONFIG[value];
        return config ? (
          <StatusBadge
            label={config.label}
            color={config.color}
            bgColor={config.bgColor}
            borderColor={config.borderColor}
          />
        ) : null;
      }
    },
    {
      key: 'disposalReason',
      label: 'Disposal Reason',
      render: (value) => (
        <span className="text-sm" title={value}>
          {value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onViewHistory(row)}
            title="View Call History"
          >
            📜 History
          </button>
        </div>
      )
    }
  ];

  // Apply filters to data - convert Call Desk data structure to match filter expectations
  const filteredCalls = useMemo(() => {
    let result = [...calls];

    // Product Type filter
    if (filters.productTypes.length > 0) {
      result = result.filter(call => filters.productTypes.includes(call.product));
    }

    // Vendor filter
    if (filters.vendors.length > 0) {
      result = result.filter(call => filters.vendors.includes(call.vendor?.name));
    }

    // Date range filter (using submissionDateTime)
    if (filters.dateFrom) {
      result = result.filter(call => new Date(call.submissionDateTime) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter(call => new Date(call.submissionDateTime) <= new Date(filters.dateTo));
    }

    // PO Number filter
    if (filters.poNumbers.length > 0) {
      result = result.filter(call => filters.poNumbers.includes(call.poNumber));
    }

    // Stage filter
    if (filters.stage) {
      result = result.filter(call => call.stage === filters.stage);
    }

    // Call Number filter
    if (filters.callNumbers.length > 0) {
      result = result.filter(call => filters.callNumbers.includes(call.callNumber));
    }

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(call =>
        call.callNumber?.toLowerCase().includes(term) ||
        call.vendor?.name?.toLowerCase().includes(term) ||
        call.poNumber?.toLowerCase().includes(term) ||
        call.placeOfInspection?.toLowerCase().includes(term) ||
        call.disposalReason?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [calls, filters, searchTerm]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectToggle = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      productTypes: [],
      vendors: [],
      dateFrom: '',
      dateTo: '',
      poNumbers: [],
      stage: '',
      callNumbers: []
    });
  };

  // Prepare data for CallsFilterSection - map Call Desk data structure to expected format
  const callsForFilter = useMemo(() => calls.map(call => ({
    product_type: call.product,
    vendor_name: call.vendor?.name,
    po_no: call.poNumber,
    call_no: call.callNumber,
    requested_date: call.submissionDateTime,
    stage: call.stage
  })), [calls]);

  // Map filtered calls for CallsFilterSection
  const filteredCallsForFilter = useMemo(() => filteredCalls.map(call => ({
    product_type: call.product,
    vendor_name: call.vendor?.name,
    po_no: call.poNumber,
    call_no: call.callNumber,
    requested_date: call.submissionDateTime,
    stage: call.stage
  })), [filteredCalls]);

  return (
    <div className="tab-content">
      {/* KPI Tiles */}
      <div className="kpi-grid">
        {kpiTiles.map((kpi, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="stat-content">
              <div className="stat-label">{kpi.label}</div>
              <div className="stat-value" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <CallsFilterSection
        allCalls={callsForFilter}
        filteredCalls={filteredCallsForFilter}
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterSearch={filterSearch}
        setFilterSearch={setFilterSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        clearAllFilters={clearAllFilters}
        handleFilterChange={handleFilterChange}
        handleMultiSelectToggle={handleMultiSelectToggle}
        summaryLabel="disposed calls"
      />

      {/* Info Message */}
      <div className="info-message">
        <span className="info-icon">ℹ️</span>
        <span>This is a read-only archive of disposed calls for reference and audit purposes.</span>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCalls}
        emptyMessage="No disposed calls found"
      />
    </div>
  );
};

export default DisposedCallsTab;


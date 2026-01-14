import React, { useState, useMemo } from 'react';

const EnhancedDataTable = ({
  columns,
  data,
  title,
  onRowClick,
  selectable = true,
  emptyMessage = "No records found"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, currentPage, perPage]);

  const totalPages = Math.ceil(filteredData.length / perPage) || 1;

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((_, idx) => idx));
    }
  };

  const toggleRowSelect = (idx) => {
    if (selectedRows.includes(idx)) {
      setSelectedRows(selectedRows.filter(i => i !== idx));
    } else {
      setSelectedRows([...selectedRows, idx]);
    }
  };

  return (
    <div className="enhanced-table-container" style={{ background: 'transparent', border: 'none', overflow: 'visible' }}>
      <style>{`
        .table-controls {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .table-outer-wrapper {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          background: #fbf7ed;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #475467;
          border-bottom: 1px solid #e5e7eb;
          text-transform: none;
          letter-spacing: normal;
          vertical-align: middle;
        }

        .data-table td {
          padding: 18px 16px;
          background: white;
          font-size: 14px;
          color: #344054;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover td {
          background-color: #fafafa;
        }

        .pagination-footer {
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-top: 1px solid #f2f4f7;
          font-size: var(--fs-xs);
          color: #667085;
        }
        
        .search-input {
          padding: 6px 12px;
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          font-size: var(--fs-sm);
          outline: none;
          color: #101828;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
          height: 32px;
        }

        .search-input:focus {
          border-color: #21808d;
          box-shadow: 0 0 0 2px rgba(33, 128, 141, 0.1);
        }

        .per-page-select {
          padding: 4px 10px;
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          font-size: var(--fs-sm);
          background: white;
          cursor: pointer;
          color: #344054;
          font-weight: 500;
          height: 32px;
          outline: none;
        }

        .checkbox-cell {
          width: 36px;
          padding-left: 12px !important;
          padding-right: 0 !important;
        }

        .status-pill {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: var(--fs-xxs);
          font-weight: 600;
        }

        .page-btn {
          padding: 4px 12px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: var(--fs-xs);
          margin-left: 8px;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #21808d;
          color: #21808d;
        }
      `}</style>

      <div className="table-controls">
        <input
          type="text"
          placeholder="Search by keywords..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="per-page-select"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="table-outer-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="checkbox-cell">
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
              <tr key={idx} onClick={() => onRowClick && onRowClick(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
                {selectable && (
                  <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedRows.includes(idx)} onChange={() => toggleRowSelect(idx)} />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#98a2b3' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-footer">
        <div>
          Showing {Math.min(filteredData.length, (currentPage - 1) * perPage + 1)} to {Math.min(filteredData.length, currentPage * perPage)} of {filteredData.length} entries
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(v => v - 1)}
          >
            Previous
          </button>
          <span style={{ margin: '0 12px' }}>Page {currentPage} of {totalPages}</span>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(v => v + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataTable;

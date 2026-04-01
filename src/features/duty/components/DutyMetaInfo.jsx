import React from 'react';
import { useShift } from '../../../context/ShiftContext';

const DutyMetaInfo = ({ showUnit = true, showLocation = true }) => {
    const { dutyDate, selectedShift, dutyUnit, dutyLocation, companyName, vendorCode, vendorId } = useShift();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split('-').reverse().join('/');
    };

    const formatShift = (shift) => {
        if (!shift) return '';
        return shift === 'General' ? 'General' : `Shift ${shift}`;
    };

    return (
        <div className="header-meta-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {dutyDate && (
                <span className="meta-pill date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                    {formatDate(dutyDate)}
                </span>
            )}
            {selectedShift && (
                <span className="meta-pill shift">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {formatShift(selectedShift)}
                </span>
            )}
            {companyName && (
                <span className="meta-pill company" style={{ background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e91e63" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span style={{ fontWeight: '700' }}>
                        {companyName}
                    </span>
                </span>
            )}
            {dutyUnit && (
                <span className="meta-pill unit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    {dutyUnit}
                </span>
            )}
            {showLocation && dutyLocation && (
                <span className="meta-pill loc">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    {dutyLocation}
                </span>
            )}
        </div>
    );
};

export default DutyMetaInfo;

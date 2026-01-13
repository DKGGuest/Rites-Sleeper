/**
 * Call Desk Module Entry Point
 * Exports all components, hooks, and utilities
 */

// Components
export { default as CallDeskDashboard } from './components/CallDeskDashboard';
export { default as PendingVerificationTab } from './components/PendingVerificationTab';
export { default as VerifiedOpenCallsTab } from './components/VerifiedOpenCallsTab';
export { default as DisposedCallsTab } from './components/DisposedCallsTab';

// Hooks
export { default as useCallDeskData } from './hooks/useCallDeskData';
export { default as useCallActions } from './hooks/useCallActions';

// Utils
export * from './utils/constants';
export * from './utils/helpers';
export * from './utils/mockData';


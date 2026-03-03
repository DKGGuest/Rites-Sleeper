import React, { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import SleeperProcessDuty from './pages/sleeperGeneral/SleeperProcessDuty';
import SleeperProcessIEGeneral from './pages/sleeperGeneral/SleeperProcessIEGeneral';
import { ShiftProvider } from './context/ShiftContext';
import MainDashboard from './pages/ProcessIE/MainDashboard';
import BatchWiseSleeperReport from './pages/ProcessIE/BatchWiseSleeperReport';
import LastShiftReport from './pages/ProcessIE/LastShiftReport';
import MonthlyReport from './pages/ProcessIE/MonthlyReport';
import LoginPage from './pages/Login/LoginPage';

/**
 * App Component - Main Entry Point
 */
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mainView, setMainView] = useState('Main Dashboard');

  // Listen for navigation events dispatched from components
  useEffect(() => {
    const handler = (e) => {
      const target = e.detail?.target;
      if (target) {
        switch (target) {
          case 'Sleeper process IE-General':
            setMainView('Sleeper process IE-General');
            break;
          case 'Sleeper process Duty':
            setMainView('Sleeper process Duty');
            break;
          case 'BatchWiseSleeperReport':
            setMainView('Batch Wise Sleeper Report');
            break;
          case 'LastShiftReport':
            setMainView('Last Shift Report');
            break;
          case 'MonthlyReport':
            setMainView('Monthly Performance Report');
            break;
          default:
            setMainView('Main Dashboard');
        }
      }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  const renderView = () => {
    switch (mainView) {
      case 'Sleeper process IE-General':
        return <SleeperProcessIEGeneral />;
      case 'Sleeper process Duty':
        return <SleeperProcessDuty />;
      case 'Batch Wise Sleeper Report':
        return <div className="fade-in"><BatchWiseSleeperReport onBack={() => setMainView('Main Dashboard')} /></div>;
      case 'Last Shift Report':
        return <div className="fade-in"><LastShiftReport onBack={() => setMainView('Main Dashboard')} /></div>;
      case 'Monthly Performance Report':
        return <div className="fade-in"><MonthlyReport onBack={() => setMainView('Main Dashboard')} /></div>;
      case 'Main Dashboard':
      default:
        return <MainDashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <ShiftProvider>
      <MainLayout activeItem={mainView} onItemClick={setMainView}>
        {renderView()}
      </MainLayout>
    </ShiftProvider>
  );
};

export default App;


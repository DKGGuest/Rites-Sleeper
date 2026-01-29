import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import SleeperProcessDuty from './pages/sleeperGeneral/SleeperProcessDuty';
import SleeperProcessIEGeneral from './pages/sleeperGeneral/SleeperProcessIEGeneral';

/**
 * App Component - Main Entry Point
 * 
 * Handles top-level navigation between main modules (Sleeper Process Duty vs IE-General).
 * Uses a Layout-based architecture for consistent UI across routes.
 */
const App = () => {
  const [mainView, setMainView] = useState('Sleeper process Duty');

  const renderView = () => {
    switch (mainView) {
      case 'Sleeper process IE-General':
        return <SleeperProcessIEGeneral />;
      case 'Sleeper process Duty':
      default:
        return <SleeperProcessDuty />;
    }
  };

  return (
    <MainLayout activeItem={mainView} onItemClick={setMainView}>
      {renderView()}
    </MainLayout>
  );
};

export default App;

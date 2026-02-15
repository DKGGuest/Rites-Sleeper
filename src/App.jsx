import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import SleeperProcessDuty from './pages/sleeperGeneral/SleeperProcessDuty';
import SleeperProcessIEGeneral from './pages/sleeperGeneral/SleeperProcessIEGeneral';
import { ShiftProvider } from './context/ShiftContext';

/**
 * App Component - Main Entry Point
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
    <ShiftProvider>
      <MainLayout activeItem={mainView} onItemClick={setMainView}>
        {renderView()}
      </MainLayout>
    </ShiftProvider>
  );
};

export default App;


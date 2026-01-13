import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import CallDeskDashboard from './components/CallDeskDashboard';
import RawMaterialDashboard from './pages/sleeperGeneral/rawMaterialTesting/RawMaterialDashboard';

const App = () => {
    const [view, setView] = useState('Raw Material Inspection');

    const renderView = () => {
        switch (view) {
            case 'Call Desk Dashboard':
                return <CallDeskDashboard />;
            case 'Raw Material Inspection':
                return <RawMaterialDashboard />;
            default:
                return (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <h1>{view}</h1>
                        <p>This module is under development.</p>
                        <button
                            className="btn-action btn-verify"
                            style={{ margin: '0 auto' }}
                            onClick={() => setView('Call Desk Dashboard')}
                        >
                            Go to Call Desk Dashboard
                        </button>
                    </div>
                );
        }
    };

    return (
        <MainLayout activeItem={view} onItemClick={setView}>
            {renderView()}
        </MainLayout>
    );
};

export default App;

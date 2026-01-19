import React, { useState, useMemo } from 'react';
import MainLayout from './components/Layout/MainLayout';
// Removed CallDeskDashboard and RawMaterialDashboard imports as per request
import BatchWeighment from './components/BatchWeighment'
import ManualChecks from './components/ManualChecks'
import MoistureAnalysis from './components/MoistureAnalysis'
import TensionRegister from './components/TensionRegister'

const App = () => {
  const [dutyStarted, setDutyStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('Manual Checks');
  const [manualChecksAlert, setManualChecksAlert] = useState(true);
  const [moistureAlert, setMoistureAlert] = useState(true);
  const [detailView, setDetailView] = useState('dashboard');

  // Shared State for Batch Weighment (Process Engineer)
  const [batchDeclarations, setBatchDeclarations] = useState([
    {
      id: 1,
      batchNo: '601',
      setValues: { ca1: 431, ca2: 176, fa: 207, cement: 175, water: 36.2, admixture: 1.400 },
      adjustedWeights: { ca1: 436.2, ca2: 178.6, fa: 207.1, cement: 175.5, water: 37.0, admixture: 1.440 },
      proportionMatch: 'OK'
    }
  ]);
  const [witnessedRecords, setWitnessedRecords] = useState([]);
  const [selectedBatchNo, setSelectedBatchNo] = useState('601');

  const tabs = [
    { title: 'Manual Checks', subtitle: 'Hourly inspection', alert: manualChecksAlert },
    { title: 'Moisture Analysis', subtitle: 'Shift-wise samples', alert: moistureAlert },
    { title: 'Weight Batching', subtitle: 'SCADA & Manual Sync' },
    { title: 'Wire Tensioning', subtitle: 'Pressure logs' },
    { title: 'Casting', subtitle: 'Mould cycle' },
    { title: 'Steam Curing', subtitle: 'Temp profiles' }
  ]

  // Calculate Dashboard Summary Stats for Batch Weighment
  const batchStats = useMemo(() => {
    const records = witnessedRecords.filter(r => r.batchNo === selectedBatchNo);
    const declared = batchDeclarations.find(b => b.batchNo === selectedBatchNo);

    if (!declared) return null;

    const ingredients = ['ca1', 'ca2', 'fa', 'cement', 'water', 'admixture'];
    const TOLERANCE = 3;

    const ingredientStats = ingredients.map(ing => {
      const setVal = declared.setValues[ing];
      const deviations = records.map(r => ((r[ing] - setVal) / setVal) * 100);
      const count = deviations.length;
      const meanDev = count ? deviations.reduce((a, b) => a + b, 0) / count : 0;
      const variance = count ? deviations.reduce((a, b) => a + Math.pow(b - meanDev, 2), 0) / count : 0;
      const stdDev = Math.sqrt(variance);
      const maxPos = count ? Math.max(...deviations, 0) : 0;
      const maxNeg = count ? Math.min(...deviations, 0) : 0;
      const outliers = deviations.filter(d => Math.abs(d) > TOLERANCE).length;

      return {
        name: ing.toUpperCase(),
        count,
        meanDev,
        stdDev,
        maxPos,
        maxNeg,
        outliers
      };
    });

    return {
      totalBatches: records.length,
      matchingSetValues: batchDeclarations.filter(b => b.proportionMatch === 'OK').length,
      mismatchSetValues: batchDeclarations.filter(b => b.proportionMatch === 'NOT OK').length,
      ingredientStats
    };
  }, [witnessedRecords, batchDeclarations, selectedBatchNo]);

  const renderProcessEngineerDashboard = () => {
    if (!dutyStarted) {
      return (
        <div className="login-landing app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-color)' }}>
          <div className="section-card" style={{ textAlign: 'center', maxWidth: '400px', padding: '3rem', background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <h1 style={{ marginBottom: '1rem', color: '#1e293b' }}>Sleeper Process Engineer – Shift</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Ready to start your shift duty?</p>
            <button className="toggle-btn" style={{ width: '100%', padding: '1rem' }} onClick={() => setDutyStarted(true)}>
              Start Duty
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="app-container">
        <div className="dashboard-header" style={{ border: 'none', padding: 0, marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '500', color: '#13343b' }}>Sleeper Process Engineer – Shift</h1>
        </div>

        <div className="rm-grid-cards">
          {tabs.map((tab) => (
            <div
              key={tab.title}
              className={`rm-card ${activeTab === tab.title ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.title)}
            >
              <div className="rm-card-title">{tab.title}</div>
              <span className="rm-card-subtitle">{tab.subtitle}</span>
              <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {tab.title === 'Weight Batching' ? `● ${witnessedRecords.length} Witnessed` :
                  tab.title === 'Moisture Analysis' ? '● 4 Logs (Shift A)' :
                    tab.title === 'Wire Tensioning' ? '● Sync Active' : '● Online'}
              </div>
              {tab.alert && (
                <span className="badge-count" style={{ position: 'absolute', top: '10px', right: '10px', margin: 0 }}>!</span>
              )}
            </div>
          ))}
        </div>

        <div className="dashboard-detail-view" style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#1e293b' }}>{activeTab} Record</h2>
              {activeTab === 'Weight Batching' && <span className="badge-count" style={{ marginLeft: 0 }}>{witnessedRecords.length}</span>}
            </div>
            <button className="toggle-btn" onClick={() => setDetailView('detail_modal')}>New Entry</button>
          </div>

          <div style={{ marginTop: '3rem' }}>
            {activeTab === 'Weight Batching' ? (
              <>
                <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#475569', marginBottom: '1.5rem' }}>Historical Statistics (Batch {selectedBatchNo})</h3>
                <div className="rm-grid-cards" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                  {batchStats?.ingredientStats.map(stat => (
                    <div key={stat.name} className="calc-card" style={{ flex: '0 0 160px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>{stat.name} DEV</span>
                      <div className="calc-value" style={{ fontSize: '1.1rem', color: Math.abs(stat.meanDev) > 1 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {stat.meanDev > 0 ? '+' : ''}{stat.meanDev.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Std Dev: {stat.stdDev.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="data-table-section" style={{ marginTop: '1rem' }}>
                  <div className="table-title-bar">Recent Witnessed Logs</div>
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Batch</th>
                        <th>Cement (Actual)</th>
                        <th>Water (Actual)</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {witnessedRecords.filter(r => r.batchNo === selectedBatchNo).length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No records for this batch yet.</td></tr>
                      ) : (
                        witnessedRecords.filter(r => r.batchNo === selectedBatchNo).slice(0, 5).map(r => (
                          <tr key={r.id}>
                            <td data-label="Time"><span>{r.time}</span></td>
                            <td data-label="Batch"><span>{r.batchNo}</span></td>
                            <td data-label="Cement"><span>{r.cement} Kg</span></td>
                            <td data-label="Water"><span>{r.water} Ltr</span></td>
                            <td data-label="Source"><span>{r.source}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : activeTab === 'Manual Checks' ? (
              <>
                <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#475569', marginBottom: '1.5rem' }}>Pending Inspection Requirements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div className="calc-card" style={{ textAlign: 'left', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Mould Prep</h4>
                      {manualChecksAlert && <span className="badge-count">Pending</span>}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Next check due in {60 - new Date().getMinutes()} mins</p>
                  </div>
                  <div className="calc-card" style={{ textAlign: 'left', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>HTS Wire</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 'bold' }}>COMPLETED</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Last check: 10:45 AM</p>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px dotted #cbd5e1' }}>
                <p style={{ color: '#94a3b8' }}>Select a process card above to view real-time logs and statistics for {activeTab}.</p>
                <button className="toggle-btn secondary" style={{ marginTop: '1rem' }} onClick={() => setDetailView('detail_modal')}>Open {activeTab} Console</button>
              </div>
            )}
          </div>
        </div>

        {detailView === 'detail_modal' && (
          <div className="modal-container-wrapper">
            {activeTab === 'Weight Batching' ? (
              <BatchWeighment
                onBack={() => setDetailView('dashboard')}
                sharedState={{ batchDeclarations, setBatchDeclarations, witnessedRecords, setWitnessedRecords }}
              />
            ) : activeTab === 'Manual Checks' ? (
              <ManualChecks onBack={() => setDetailView('dashboard')} onAlertChange={setManualChecksAlert} />
            ) : activeTab === 'Moisture Analysis' ? (
              <MoistureAnalysis onBack={() => setDetailView('dashboard')} onSave={() => setMoistureAlert(false)} />
            ) : activeTab === 'Wire Tensioning' ? (
              <div className="modal-overlay" onClick={() => setDetailView('dashboard')}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <header className="modal-header">
                    <h2>Wire Tensioning Record</h2>
                    <button className="close-btn" onClick={() => setDetailView('dashboard')}>×</button>
                  </header>
                  <div className="modal-body">
                    <TensionRegister batches={batchDeclarations} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const renderView = () => {
    return renderProcessEngineerDashboard();
  };

  return (
    <MainLayout activeItem="Sleeper Process Duty" onItemClick={() => { }}>
      {renderView()}
    </MainLayout>
  );
};

export default App;

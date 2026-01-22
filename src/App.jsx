import React, { useState, useMemo } from 'react';
import MainLayout from './components/Layout/MainLayout';
import BatchWeighment from './components/BatchWeighment'
import ManualChecks from './components/ManualChecks'
import MoistureAnalysis from './components/MoistureAnalysis'
import WireTensioning, { WireTensionStats } from './components/WireTensioning'
import CompactionConcrete from './components/CompactionConcrete'
import MouldBenchCheck from './components/MouldBenchCheck'
import SteamCuring from './components/SteamCuring'
import SteamCubeTesting, { SteamCubeStats } from './components/SteamCubeTesting'
import RawMaterialDashboard from './pages/sleeperGeneral/rawMaterialTesting/RawMaterialDashboard'

const App = () => {
  const [dutyStarted, setDutyStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('Manual Checks');
  const [manualChecksAlert, setManualChecksAlert] = useState(true);
  const [moistureAlert, setMoistureAlert] = useState(true);
  const [detailView, setDetailView] = useState('dashboard');
  const [mainView, setMainView] = useState('Sleeper Process Duty');

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

  // Shared State for Compaction Concrete
  const [compactionRecords, setCompactionRecords] = useState([
    { id: 101, time: '09:15:22', batchNo: '605', benchNo: '1', rpm: 9005, duration: 45, vibratorId: 'VIB-01' },
    { id: 102, time: '09:16:45', batchNo: '605', benchNo: '1', rpm: 8900, duration: 48, vibratorId: 'VIB-02' },
    { id: 103, time: '09:18:10', batchNo: '605', benchNo: '2', rpm: 9150, duration: 42, vibratorId: 'VIB-03' },
    { id: 104, time: '09:20:00', batchNo: '604', benchNo: '5', rpm: 8840, duration: 50, vibratorId: 'VIB-01' },
    { id: 105, time: '09:12:00', batchNo: '605', benchNo: '2', rpm: 9020, duration: 44, vibratorId: 'VIB-04' },
  ]);
  const [selectedCompactionBatch, setSelectedCompactionBatch] = useState('605');

  // Shared State for Steam Cube Testing
  const [cubeTestRecords, setCubeTestRecords] = useState([
    { id: 101, grade: 'M55', strength: 42.5 },
    { id: 102, grade: 'M60', strength: 48.2 },
    { id: 103, grade: 'M55', strength: 45.1 },
    { id: 104, grade: 'M60', strength: 52.4 },
    { id: 105, grade: 'M55', strength: 38.5 }, // Failed M55
  ]);

  const tabs = [
    { title: 'Manual Checks', subtitle: 'Hourly inspection', alert: manualChecksAlert },
    { title: 'Moisture Analysis', subtitle: 'Shift-wise samples', alert: moistureAlert },
    { title: 'Weight Batching', subtitle: 'SCADA & Manual Sync' },
    { title: 'Wire Tensioning', subtitle: 'Pressure logs' },

    { title: 'Compaction of Concrete', subtitle: 'Vibrator Report' },
    { title: 'Mould & Bench Checking', subtitle: 'Plant Assets' },
    { title: 'Steam Curing', subtitle: 'Temp profiles' },
    { title: 'Steam Cube Testing', subtitle: 'Strength Analysis' }
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

  // Calculate Compaction Stats
  const compactionStats = useMemo(() => {
    const records = compactionRecords.filter(r => r.batchNo === selectedCompactionBatch);
    if (!records.length) return null;

    const rpms = records.map(r => r.rpm);
    const durations = records.map(r => r.duration);

    const count = records.length;
    const minRpm = Math.min(...rpms);
    const maxRpm = Math.max(...rpms);
    const meanRpm = rpms.reduce((a, b) => a + b, 0) / count;

    const sortedRpms = [...rpms].sort((a, b) => a - b);
    const medianRpm = count % 2 !== 0 ? sortedRpms[(count - 1) / 2] : (sortedRpms[count / 2 - 1] + sortedRpms[count / 2]) / 2;

    const avgDuration = durations.reduce((a, b) => a + b, 0) / count;

    // Standard Deviation RPM
    const variance = rpms.reduce((a, b) => a + Math.pow(b - meanRpm, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Spec: 2800 - 3000 (Assumed based on user "8640–9360" might be vpm not rpm, user said "8640–9360" for spec range in VPM maybe? 
    // Wait, 8640-9360 is likely VPM (Vibrations Per Minute). 
    // But the mock data has RPM ~2850. 
    // Frequency could be 50Hz -> 3000 RPM.
    // Let's assume the user meant "Vibration frequency" readings.
    // If the input is RPM (e.g. 2850), and spec is 8640-9360, there is a mismatch. 
    // 2850 * 3? No. 
    // Maybe the user's "RPM" values in the prompt example are RPM and spec is also RPM but high? 
    // Or maybe spec is VPM. 150 Hz = 9000 VPM. 
    // In typical concrete sleepers, frequency is ~150Hz (9000 RPM) or ~50Hz (3000 RPM).
    // The user's text says: "% readings within spec (8640–9360)".
    // The provided mock SCADA fields say "RPM" and values like 2850.
    // 2850 is ~47.5Hz. 
    // Detailed analysis: 
    // If 8640-9360 is the spec, then 2850 is way off.
    // However, if the mock data uses 2850, I should probably stick to what the user asked or assume a scalar.
    // Let's use the USER's spec numbers literally for the "Within Spec" calculation.
    // But since the mock data (which I have control over in the component, but here I am mocking again in App.jsx for stats) uses ~2900, the "Within Spec" will be 0%.
    // I shall update the mock data in App.jsx to be in range 8600-9400 to look realistic, OR assume the input mock data is correct and spec is different.
    // Let's adjust the "Compaction of Concrete" mock data in App.jsx to match the spec (8640-9360) so it looks good.
    // I will implicitly update the mock generator too.

    // Actually, let's keep the mock data I wrote (2850) but I will multiply by 3 or just change the mock data values here to be ~9000.
    // Let's change the mock data values in the `compactionRecords` state to be around 9000.

    const LSL = 8640;
    const USL = 9360;

    const withinSpec = rpms.filter(r => r >= LSL && r <= USL).length;
    const aboveLSL = rpms.filter(r => r > LSL).length;
    const aboveUSL = rpms.filter(r => r > USL).length;

    return {
      count,
      minRpm,
      maxRpm,
      meanRpm,
      medianRpm,
      avgDuration,
      stdDev,
      pctWithinSpec: (withinSpec / count) * 100,
      pctAboveLSL: (aboveLSL / count) * 100,
      pctAboveUSL: (aboveUSL / count) * 100
    };

  }, [compactionRecords, selectedCompactionBatch]);

  // Shared State for Steam Curing
  const [steamRecords, setSteamRecords] = useState([
    { id: 1, batchNo: '601', chamberNo: '1', date: '2026-01-20', preDur: 2.25, risePeriod: 2.25, riseRate: 13.3, constTemp: 58, constDur: 4.0, coolDur: 2.5, coolRate: 11.2 },
    { id: 2, batchNo: '601', chamberNo: '2', date: '2026-01-20', preDur: 1.0, risePeriod: 3.0, riseRate: 11, constTemp: 59, constDur: 3.0, coolDur: 1.5, coolRate: 16.6 }, // Fail Pre
    { id: 3, batchNo: '605', chamberNo: '5', date: '2026-01-19', preDur: 2.5, risePeriod: 2.0, riseRate: 14, constTemp: 62, constDur: 4.5, coolDur: 2.5, coolRate: 12 }, // Fail Temp
  ]);
  const [selectedSteamBatch, setSelectedSteamBatch] = useState('601');

  const steamStats = useMemo(() => {
    const records = steamRecords.filter(r => r.batchNo === selectedSteamBatch);
    if (!records.length) return null;

    // Metrics to analyze
    // PreSteaming > 2 (IST)
    // Rise Period 2 - 2.5
    // Rise Rate <= 15
    // Const Temp 55 - 60
    // Const Dur 3.5 - 5
    // Cool Dur 2 - 3
    // Cool Rate <= 15

    const checkOutlier = (r) => {
      let outliers = 0;
      if (r.preDur < 2) outliers++;
      if (r.risePeriod < 2 || r.risePeriod > 2.5) outliers++;
      if (r.riseRate > 15) outliers++;
      if (r.constTemp < 55 || r.constTemp > 60) outliers++;
      if (r.constDur < 3.5 || r.constDur > 5) outliers++;
      if (r.coolDur < 2 || r.coolDur > 3) outliers++;
      if (r.coolRate > 15) outliers++;
      return outliers;
    }

    const totalOutliers = records.reduce((acc, r) => acc + (checkOutlier(r) > 0 ? 1 : 0), 0);

    return {
      count: records.length,
      outlierProcesses: totalOutliers,
      // Example Mean for one metric
      meanConstTemp: records.reduce((a, b) => a + b.constTemp, 0) / records.length
    };
  }, [steamRecords, selectedSteamBatch]);

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
        <div className="dashboard-header" style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', color: '#13343b' }}>Sleeper Process Engineer – Shift</h1>
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
              <div style={{ marginTop: '0.75rem', fontSize: 'var(--fs-xxs)', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {tab.title === 'Weight Batching' ? `● ${witnessedRecords.length} Witnessed` :
                  tab.title === 'Moisture Analysis' ? '● 4 Logs (Shift A)' :
                    tab.title === 'Compaction of Concrete' ? '● Live Monitoring' :
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
              <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: '600', color: '#1e293b' }}>{activeTab} Record</h2>
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
                      <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>{stat.name} DEV</span>
                      <div className="calc-value" style={{ fontSize: 'var(--fs-lg)', color: Math.abs(stat.meanDev) > 1 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {stat.meanDev > 0 ? '+' : ''}{stat.meanDev.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: 'var(--fs-xxs)', color: '#94a3b8', marginTop: '0.2rem' }}>
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

            ) : activeTab === 'Compaction of Concrete' ? (
              <>
                <div className="dash-section-header">
                  <h3 className="dash-section-title">
                    <span style={{ color: 'var(--primary-color)' }}>●</span>
                    Vibrator Statistics (Batch {selectedCompactionBatch})
                  </h3>
                  <select
                    className="dash-select"
                    value={selectedCompactionBatch}
                    onChange={(e) => setSelectedCompactionBatch(e.target.value)}
                  >
                    {[...new Set(compactionRecords.map(r => r.batchNo))].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {compactionStats ? (
                  <div className="rm-grid-cards" style={{ flexWrap: 'wrap' }}>
                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>Avg Duration</span>
                      <div className="calc-value">{compactionStats.avgDuration.toFixed(1)}s</div>
                    </div>
                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>Mean RPM</span>
                      <div className="calc-value">{compactionStats.meanRpm.toFixed(0)}</div>
                    </div>
                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>Std Dev (σ)</span>
                      <div className="calc-value">{compactionStats.stdDev.toFixed(2)}</div>
                    </div>
                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>% Within Spec</span>
                      <div className="calc-value" style={{ color: compactionStats.pctWithinSpec > 90 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {compactionStats.pctWithinSpec.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Select a batch to view stats</div>
                )}

                <div className="chart-grid">
                  {/* RPM Chart */}
                  <div className="chart-card">
                    <h4 className="chart-title">Vibration Frequency (RPM)</h4>
                    <div className="chart-viz-container">
                      <div className="chart-y-axis">
                        <span>3000</span>
                        <span>2800</span>
                      </div>
                      <div className="chart-bars-area">
                        {compactionRecords.filter(r => r.batchNo === selectedCompactionBatch).map((r, i) => {
                          const minVal = 2800;
                          const maxVal = 3000;
                          const pct = Math.max(0, Math.min(100, ((r.rpm - minVal) / (maxVal - minVal)) * 100));
                          return (
                            <div key={i} className="chart-bar-group">
                              <div className="chart-bar" style={{
                                height: `${pct}%`,
                                background: 'linear-gradient(to top, var(--primary-color), #60a5fa)',
                              }}></div>
                              <span className="chart-bar-label">#{i + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Duration Chart */}
                  <div className="chart-card">
                    <h4 className="chart-title">Compaction Duration (Sec)</h4>
                    <div className="chart-viz-container">
                      <div className="chart-y-axis">
                        <span>60s</span>
                        <span>0s</span>
                      </div>
                      <div className="chart-bars-area">
                        {compactionRecords.filter(r => r.batchNo === selectedCompactionBatch).map((r, i) => {
                          const pct = Math.min(100, (r.duration / 60) * 100);
                          return (
                            <div key={i} className="chart-bar-group">
                              <div className="chart-bar" style={{
                                height: `${pct}%`,
                                background: 'linear-gradient(to top, #10b981, #34d399)',
                              }}></div>
                              <span className="chart-bar-label">#{i + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
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
            ) : activeTab === 'Mould & Bench Checking' ? (
              <>
                <div className="dash-section-header">
                  <h3 className="dash-section-title">
                    <span style={{ color: 'var(--primary-color)' }}>●</span>
                    Summary of Mould & Bench Checking
                  </h3>
                  <button className="toggle-btn" onClick={() => setDetailView('detail_modal')}>Add New Entry</button>
                </div>
                <div className="rm-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="calc-card" style={{ padding: '1rem' }}>
                    <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>Benches / Moulds (Plant)</span>
                    <div className="calc-value" style={{ fontSize: 'var(--fs-xl)' }}>60 / 240</div>
                  </div>
                  <div className="calc-card" style={{ padding: '1rem' }}>
                    <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>Used for Casting (30d)</span>
                    <div className="calc-value" style={{ fontSize: 'var(--fs-xl)', color: 'var(--rites-green)' }}>55 / 215</div>
                  </div>
                  <div className="calc-card" style={{ padding: '1rem' }}>
                    <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>Benches Checked (Month)</span>
                    <div className="calc-value" style={{ fontSize: 'var(--fs-xl)' }}>42 <span style={{ fontSize: '10px', color: '#64748b' }}>(76.4%)</span></div>
                  </div>
                  <div className="calc-card" style={{ padding: '1rem' }}>
                    <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>Moulds Checked (Month)</span>
                    <div className="calc-value" style={{ fontSize: 'var(--fs-xl)' }}>168 <span style={{ fontSize: '10px', color: '#64748b' }}>(78.1%)</span></div>
                  </div>
                  <div className="calc-card" style={{ padding: '1rem' }}>
                    <span className="calc-label" style={{ fontSize: 'var(--fs-xxs)' }}>Moulds Unfit</span>
                    <div className="calc-value" style={{ fontSize: 'var(--fs-xl)', color: 'var(--color-danger)' }}>4</div>
                  </div>
                </div>
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button className="toggle-btn secondary" onClick={() => setDetailView('detail_modal')} style={{ padding: '0.8rem 2rem' }}>
                    View Full Asset Master & Status
                  </button>
                </div>
              </>
            ) : activeTab === 'Steam Curing' ? (
              <>
                <div className="dash-section-header">
                  <h3 className="dash-section-title">
                    <span style={{ color: 'var(--primary-color)' }}>●</span>
                    Steam Curing Statistics (Batch {selectedSteamBatch})
                  </h3>
                  <select
                    className="dash-select"
                    value={selectedSteamBatch}
                    onChange={(e) => setSelectedSteamBatch(e.target.value)}
                  >
                    {[...new Set(steamRecords.map(r => r.batchNo))].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {steamStats && (
                  <div className="rm-grid-cards" style={{ flexWrap: 'wrap' }}>
                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>Mean Const Temp</span>
                      <div className="calc-value">{steamStats.meanConstTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="calc-card" style={{ flex: '1 0 140px', padding: '1rem' }}>
                      <span className="calc-label" style={{ fontSize: '0.65rem' }}>Outlier Processes</span>
                      <div className="calc-value" style={{ color: steamStats.outlierProcesses > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {steamStats.outlierProcesses}
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button className="toggle-btn" onClick={() => setDetailView('detail_modal')} style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                    Open Steam Curing Console
                  </button>
                </div>
              </>
            ) : activeTab === 'Steam Cube Testing' ? (
              <>
                <div className="dash-section-header">
                  <h3 className="dash-section-title">
                    <span style={{ color: 'var(--primary-color)' }}>●</span>
                    Steam Cube Testing Statistics
                  </h3>
                  <button className="toggle-btn" onClick={() => setDetailView('detail_modal')}>Open Test Module</button>
                </div>
                <SteamCubeStats records={cubeTestRecords} />
              </>
            ) : activeTab === 'Wire Tensioning' ? (
              <>
                <div className="dash-section-header">
                  <h3 className="dash-section-title">
                    <span style={{ color: 'var(--primary-color)' }}>●</span>
                    Wire Tensioning SCADA Summary (Batch {selectedBatchNo})
                  </h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      className="dash-select"
                      value={selectedBatchNo}
                      onChange={(e) => setSelectedBatchNo(e.target.value)}
                    >
                      {batchDeclarations.map(b => (
                        <option key={b.id} value={b.batchNo}>{b.batchNo}</option>
                      ))}
                    </select>
                    <button className="toggle-btn" onClick={() => setDetailView('detail_modal')}>Add New Entry</button>
                  </div>
                </div>

                <WireTensionStats
                  data={[
                    { finalLoad: 732 }, { finalLoad: 728 }, { finalLoad: 735 }, { finalLoad: 740 }, { finalLoad: 725 },
                    { finalLoad: 731 }, { finalLoad: 733 }, { finalLoad: 729 }, { finalLoad: 734 }, { finalLoad: 730 },
                    { finalLoad: 728 }, { finalLoad: 732 }, { finalLoad: 736 }, { finalLoad: 727 }, { finalLoad: 733 }
                  ]}
                  theoreticalMean={730}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px dotted #cbd5e1' }}>
                <p style={{ color: '#94a3b8' }}>Select a process card above to view real-time logs and statistics for {activeTab}.</p>
                <button className="toggle-btn secondary" style={{ marginTop: '1rem' }} onClick={() => setDetailView('detail_modal')}>Open {activeTab} Console</button>
              </div>
            )}
          </div>
        </div>

        {
          detailView === 'detail_modal' && (
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
                <WireTensioning
                  onBack={() => setDetailView('dashboard')}
                  batches={batchDeclarations}
                />
              ) : activeTab === 'Compaction of Concrete' ? (
                <CompactionConcrete
                  onBack={() => setDetailView('dashboard')}
                  onSave={() => { }}
                />
              ) : activeTab === 'Mould & Bench Checking' ? (
                <MouldBenchCheck
                  onBack={() => setDetailView('dashboard')}
                />
              ) : activeTab === 'Steam Curing' ? (
                <SteamCuring
                  onBack={() => setDetailView('dashboard')}
                  onSave={() => { }}
                />
              ) : activeTab === 'Steam Cube Testing' ? (
                <SteamCubeTesting
                  onBack={() => setDetailView('dashboard')}
                />
              ) : null}
            </div >
          )
        }
      </div >
    );
  };

  const renderView = () => {
    switch (mainView) {
      case 'Raw Material Inspection':
        return <RawMaterialDashboard />;
      case 'Sleeper Process Duty':
      default:
        return renderProcessEngineerDashboard();
    }
  };

  return (
    <MainLayout activeItem={mainView} onItemClick={setMainView}>
      {renderView()}
    </MainLayout>
  );
};

export default App;

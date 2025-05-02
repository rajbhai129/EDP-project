import './Dashboard.css';

function Dashboard() {
  const mockData = {
    pulse: 72,
    spo2: 98,
    temperature: 36.5,
    airQuality: 'Good',
  };

  return (
    <div className="dashboard-container">
      <h1>Real-Time Monitoring</h1>
      <div className="vitals-container">
        <div className="vital-card">
          <h3>Pulse</h3>
          <p className="vital-value">{mockData.pulse} bpm</p>
        </div>
        <div className="vital-card">
          <h3>SpO2</h3>
          <p className="vital-value">{mockData.spo2}%</p>
        </div>
        <div className="vital-card">
          <h3>Temperature</h3>
          <p className="vital-value">{mockData.temperature}°C</p>
        </div>
        <div className="vital-card">
          <h3>Air Quality</h3>
          <p className="vital-value">{mockData.airQuality}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

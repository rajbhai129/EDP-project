import './Alerts.css';

function Alerts() {
  const alerts = [
    { id: 1, message: 'Fall detected! Immediate attention required.', type: 'critical' },
    { id: 2, message: 'Air quality is poor. Consider ventilation.', type: 'warning' },
    { id: 3, message: 'Pulse rate is stable.', type: 'info' },
  ];

  return (
    <div className="alerts-container">
      <h1>Alerts</h1>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-card ${alert.type}`}>
            <p>{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;
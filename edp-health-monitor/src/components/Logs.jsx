import './Logs.css';

function Logs() {
  const logs = [
    {
      id: 1,
      date: '2023-10-01',
      time: '10:30 AM',
      pulse: 72,
      spo2: 98,
      temperature: 36.5,
    },
    {
      id: 2,
      date: '2023-10-01',
      time: '11:00 AM',
      pulse: 75,
      spo2: 97,
      temperature: 36.7,
    },
    {
      id: 3,
      date: '2023-10-01',
      time: '11:30 AM',
      pulse: 70,
      spo2: 99,
      temperature: 36.4,
    },
    {
      id: 4,
      date: '2023-10-01',
      time: '12:00 PM',
      pulse: 74,
      spo2: 96,
      temperature: 36.6,
    },
    {
      id: 5,
      date: '2023-10-01',
      time: '12:30 PM',
      pulse: 73,
      spo2: 98,
      temperature: 36.5,
    },
  ];

  return (
    <div className="logs-container">
      <h1>Health Logs</h1>
      <div className="logs-list">
        {logs.map((log) => (
          <div key={log.id} className="log-card">
            <div className="log-header">
              <span className="log-date">{log.date}</span>
              <span className="log-time">{log.time}</span>
            </div>
            <div className="log-data">
              <p>
                <strong>Pulse:</strong> {log.pulse} bpm
              </p>
              <p>
                <strong>SpO2:</strong> {log.spo2}%
              </p>
              <p>
                <strong>Temperature:</strong> {log.temperature}°C
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Logs;
import { useState, useEffect } from "react";

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Retrieve the health data logs from localStorage
    const storedLogs = JSON.parse(localStorage.getItem("healthLogs")) || [];
    // Display only the last 10 entries
    setLogs(storedLogs.slice(-10).reverse());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
        Health Logs
      </h1>

      {/* Logs List */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-yellow-300 font-semibold">{log.date}</span>
                  <span className="text-gray-100">{log.time}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <p className="flex items-center gap-2">
                    <span className="text-green-300">❤️</span>
                    <span className="font-semibold text-yellow-300">Pulse:</span> {log.pulse} bpm
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-300">💧</span>
                    <span className="font-semibold text-yellow-300">SpO2:</span> {log.spo2}%
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-red-300">🌡️</span>
                    <span className="font-semibold text-yellow-300">Temperature:</span> {log.temperature}°C
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No logs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Logs;
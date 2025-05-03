import { useState, useEffect } from "react";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch trend analysis from localStorage
    const trendAnalysis = JSON.parse(localStorage.getItem("trendAnalysis")) || [];

    // Filter critical alerts from trend analysis
    const criticalAlerts = trendAnalysis
      .filter((analysis) =>
        analysis.toLowerCase().includes("critical") || analysis.toLowerCase().includes("sudden")
      )
      .map((message, index) => ({
        id: index + 1,
        message,
        type: "critical",
      }));

    // Set the alerts state with critical alerts
    setAlerts(criticalAlerts);
  }, []);

  // Function to determine alert card styles based on type
  const getAlertStyles = (type) => {
    switch (type) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      case "info":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
        Alerts
      </h1>

      {/* Alerts List */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-2 ${getAlertStyles(
                  alert.type
                )} text-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}
              >
                <span className="text-xl">🚨</span>
                <p className="text-sm sm:text-base">{alert.message}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No critical alerts at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alerts;
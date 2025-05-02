import { Link } from "react-router-dom";
import { Heart, Droplet, Thermometer, Clock, AlertTriangle } from "lucide-react";

function Dashboard() {
  // Retrieve data from localStorage
  const storedData = JSON.parse(localStorage.getItem("healthData"));

  // If data exists in localStorage, use it, otherwise fallback to mock data
  const data = storedData || {
    heartRate: 72,
    spo2: 98,
    temperature: 36.5,
    timestamp: new Date().toLocaleString(),
  };

  // Risk level detection logic (Rule-based "ML")
  const getRiskLevel = ({ heartRate, spo2, temperature }) => {
    if (heartRate > 120 || spo2 < 90 || temperature > 38.5) return "Critical";
    if (heartRate > 100 || spo2 < 95 || temperature > 37.5) return "Warning";
    return "Normal";
  };

  const riskLevel = getRiskLevel(data);

  const getRiskColor = (level) => {
    if (level === "Critical") return "text-red-600";
    if (level === "Warning") return "text-orange-500";
    return "text-green-600";
  };

  const getHeartRateColor = (rate) => {
    if (rate < 60) return "text-blue-500";
    if (rate > 80) return "text-red-500";
    return "text-green-500";
  };

  const getSpO2Color = (value) => {
    if (value < 90) return "text-red-500";
    if (value < 95) return "text-orange-500";
    return "text-green-500";
  };

  const getTempColor = (temp) => {
    if (temp < 36.5) return "text-blue-500";
    if (temp > 37.2) return "text-red-500";
    return "text-green-500";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Real-Time Health Monitoring
          </h2>
          <Clock className="text-indigo-600 w-6 h-6" />
        </div>

        {/* Health Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Heart Rate Card */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
            <div className="flex items-center mb-2">
              <Heart className={`w-5 h-5 mr-2 ${getHeartRateColor(data.heartRate)}`} />
              <span className="text-gray-700 font-medium">Heart Rate</span>
            </div>
            <div className="flex items-end">
              <span className={`text-3xl font-bold ${getHeartRateColor(data.heartRate)}`}>
                {data.heartRate}
              </span>
              <span className="text-gray-500 ml-2 mb-1">bpm</span>
            </div>
          </div>

          {/* SpO2 Card */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
            <div className="flex items-center mb-2">
              <Droplet className={`w-5 h-5 mr-2 ${getSpO2Color(data.spo2)}`} />
              <span className="text-gray-700 font-medium">SpO₂</span>
            </div>
            <div className="flex items-end">
              <span className={`text-3xl font-bold ${getSpO2Color(data.spo2)}`}>
                {data.spo2}
              </span>
              <span className="text-gray-500 ml-2 mb-1">%</span>
            </div>
          </div>

          {/* Temperature Card */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
            <div className="flex items-center mb-2">
              <Thermometer className={`w-5 h-5 mr-2 ${getTempColor(data.temperature)}`} />
              <span className="text-gray-700 font-medium">Temperature</span>
            </div>
            <div className="flex items-end">
              <span className={`text-3xl font-bold ${getTempColor(data.temperature)}`}>
                {data.temperature}
              </span>
              <span className="text-gray-500 ml-2 mb-1">°C</span>
            </div>
          </div>

          {/* Timestamp Card */}
          <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Last Updated</span>
            </div>
            <div className="text-gray-600 text-sm">{data.timestamp}</div>
          </div>
        </div>

        {/* Risk Prediction */}
        <div className={`mt-6 flex items-center justify-center gap-2 text-lg font-semibold ${getRiskColor(riskLevel)}`}>
          <AlertTriangle className="w-5 h-5" />
          Health Status: {riskLevel}
        </div>

        {/* Link to Health Monitor page */}
        <Link to="/health">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mt-6">
            View Health Monitor
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;

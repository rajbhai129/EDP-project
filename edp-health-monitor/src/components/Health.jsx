import React, { useState, useEffect } from "react";
import { Heart, Thermometer, Droplet, Clock, Activity } from "lucide-react";

const Health = () => {
  const [data, setData] = useState({
    heartRate: 0,
    spo2: 0,
    temperature: 0,
    timestamp: "",
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showConnectionMessage, setShowConnectionMessage] = useState(true);
  const [showData, setShowData] = useState(false);
  const [simulatedUsingOldData, setSimulatedUsingOldData] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Clamp value with ±range and within min-max
  const clampWithRange = (oldVal, range, min, max) => {
    const change = Math.floor(Math.random() * (2 * range + 1)) - range; // [-range, +range]
    let newVal = oldVal + change;
    return Math.max(min, Math.min(max, newVal));
  };

  // Simulate data (use old data if recent)
  const simulateData = () => {
    const oldData = JSON.parse(localStorage.getItem("healthData"));
    const now = new Date();

    let heartRate, spo2, temperature;
    let usedOldData = false;

    if (oldData && oldData.timestamp) {
      const oldTime = new Date(oldData.timestamp);
      const diffMin = (now - oldTime) / (1000 * 60);

      if (diffMin <= 2) {
        usedOldData = true;
        heartRate = clampWithRange(oldData.heartRate, 5, 65, 85);
        spo2 = clampWithRange(oldData.spo2, 5, 95, 98);
        temperature = clampWithRange(
          parseFloat(oldData.temperature),
          0.5,
          36.5,
          37.5
        ).toFixed(1);
      } else {
        heartRate = Math.floor(Math.random() * (85 - 65 + 1) + 60);
        spo2 = Math.floor(Math.random() * (98 - 95 + 1) + 94);
        temperature = (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1);
      }
    } else {
      heartRate = Math.floor(Math.random() * (85 - 65 + 1) + 60);
      spo2 = Math.floor(Math.random() * (98 - 95 + 1) + 95);
      temperature = (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1);
    }

    const timestamp = now.toLocaleString();
    const newData = { heartRate, spo2, temperature, timestamp };

    setSimulatedUsingOldData(usedOldData);
    setData(newData);
    localStorage.setItem("healthData", JSON.stringify(newData));
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setShowConnectionMessage(false);
    setShowData(false);

    simulateData(); // immediate

    const id = setInterval(() => {
      simulateData();
    }, 100000); // every 1 min

    setIntervalId(id);

    setTimeout(() => {
      setShowData(true);
    }, 10000); // reduced to 2 seconds for better UX
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // Simulate connection after a short delay
  useEffect(() => {
    setTimeout(() => setIsConnected(true), 100);
  }, []);

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
            Health Monitor
          </h2>
          <Activity className="text-indigo-600 w-6 h-6" />
        </div>

        {/* Connection state */}
        {isConnected && !isSimulating && (
          <div className="flex flex-col items-center py-8">
            {showConnectionMessage && (
              <div className="flex items-center text-red-500 text-lg font-medium mb-6 bg-red-50 px-4 py-3 rounded-xl w-full justify-center">
                <div className="mr-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Connection not established
              </div>
            )}

            <button
              onClick={handleStartSimulation}
              className="bg-gray-50 text-white px-2 py-2 flex items-center justify-center w-full sm:w-auto"
            ></button>
          </div>
        )}

        {/* Loading Message */}
        {isSimulating && !showData && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-indigo-600 font-semibold">
              Simulating Health Data...
            </p>
          </div>
        )}

        {/* Health Data */}
        {isSimulating && showData && (
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-700 mb-5 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Vital Signs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Heart Rate Card */}
              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Heart
                    className={`w-5 h-5 mr-2 ${getHeartRateColor(
                      data.heartRate
                    )}`}
                  />
                  <span className="text-gray-700 font-medium">Heart Rate</span>
                </div>
                <div className="flex items-end">
                  <span
                    className={`text-3xl font-bold ${getHeartRateColor(
                      data.heartRate
                    )}`}
                  >
                    {data.heartRate}
                  </span>
                  <span className="text-gray-500 ml-2 mb-1">bpm</span>
                </div>
              </div>

              {/* SpO2 Card */}
              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Droplet
                    className={`w-5 h-5 mr-2 ${getSpO2Color(data.spo2)}`}
                  />
                  <span className="text-gray-700 font-medium">SpO₂</span>
                </div>
                <div className="flex items-end">
                  <span
                    className={`text-3xl font-bold ${getSpO2Color(data.spo2)}`}
                  >
                    {data.spo2}
                  </span>
                  <span className="text-gray-500 ml-2 mb-1">%</span>
                </div>
              </div>

              {/* Temperature Card */}
              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Thermometer
                    className={`w-5 h-5 mr-2 ${getTempColor(data.temperature)}`}
                  />
                  <span className="text-gray-700 font-medium">Temperature</span>
                </div>
                <div className="flex items-end">
                  <span
                    className={`text-3xl font-bold ${getTempColor(
                      data.temperature
                    )}`}
                  >
                    {data.temperature}
                  </span>
                  <span className="text-gray-500 ml-2 mb-1">°C</span>
                </div>
              </div>

              {/* Timestamp Card */}
              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    Last Updated
                  </span>
                </div>
                <div className="text-gray-600 text-sm">{data.timestamp}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Health;

import { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Trends() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dailyChartData, setDailyChartData] = useState({ labels: [], datasets: [] });
  const [tenDayChartData, setTenDayChartData] = useState({ labels: [], datasets: [] });
  const [trendAnalysis, setTrendAnalysis] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Memoize dummyData to prevent regeneration on every render
  const dummyData = useMemo(() => generateDummyData(), []);

  // Daily Chart Data
  useEffect(() => {
    const filtered = dummyData.filter((entry) => entry.timestamp.startsWith(selectedDate));
    const labels = filtered.map((entry) => entry.timestamp.split(" ")[1]);
    const pulse = filtered.map((entry) => entry.pulse);
    const spo2 = filtered.map((entry) => entry.spo2);
    const temp = filtered.map((entry) => entry.temp);
  
    setDailyChartData({
      labels,
      datasets: [
        {
          label: "Pulse (bpm)",
          data: pulse,
          borderColor: "#f39c12",
          backgroundColor: "rgba(243, 156, 18, 0.2)",
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: "SpO2 (%)",
          data: spo2,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: "Temperature (°C)",
          data: temp,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.2)",
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    });
  
    // Analyze daily trends
    const analysis = analyzeDailyTrends(filtered);
    setTrendAnalysis(analysis);
  
    // Save trend analysis to localStorage
    localStorage.setItem("trendAnalysis", JSON.stringify(analysis));
  
    setSuggestions(generateSuggestions(analysis, filtered));
  }, [selectedDate]);

  // 10-Day Chart Data
  useEffect(() => {
    const lastTenDays = getLastTenDays();
    const labels = lastTenDays.reverse();
    const pulseData = [];
    const spo2Data = [];
    const tempData = [];

    lastTenDays.forEach((date) => {
      const dayData = dummyData.filter((entry) => entry.timestamp.startsWith(date));
      const avgPulse = dayData.length
        ? dayData.reduce((sum, entry) => sum + entry.pulse, 0) / dayData.length
        : 0;
      const avgSpo2 = dayData.length
        ? dayData.reduce((sum, entry) => sum + entry.spo2, 0) / dayData.length
        : 0;
      const avgTemp = dayData.length
        ? dayData.reduce((sum, entry) => sum + entry.temp, 0) / dayData.length
        : 0;

      pulseData.push(avgPulse.toFixed(1));
      spo2Data.push(avgSpo2.toFixed(1));
      tempData.push(avgTemp.toFixed(1));
    });

    setTenDayChartData({
      labels,
      datasets: [
        {
          label: "Avg Pulse (bpm)",
          data: pulseData,
          borderColor: "#f39c12",
          backgroundColor: "rgba(243, 156, 18, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Avg SpO2 (%)",
          data: spo2Data,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Avg Temperature (°C)",
          data: tempData,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    });
  }, [dummyData]); // Only re-run when dummyData changes (which is memoized, so only once)

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
        Health Trends
      </h1>

      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <label className="font-semibold text-gray-700">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={getMinDate()}
          max={getTodayDate()}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Daily Chart */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daily Health Trends - {selectedDate}
        </h2>
        <div className="relative h-96">
          <Line
            data={dailyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Hourly Health Data" },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: { stepSize: 5 },
                },
              },
            }}
          />
        </div>
      </div>

      {/* 10-Day Chart */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          10-Day Health Trends (Daily Averages)
        </h2>
        <div className="relative h-96">
          <Line
            data={tenDayChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "10-Day Average Health Data" },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: { stepSize: 5 },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Trend Analysis */}
      {trendAnalysis.length > 0 && (
        <div className="max-w-4xl mx-auto bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Trend Analysis</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {trendAnalysis.map((msg, index) => (
              <li key={index} className="mb-2">{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="max-w-4xl mx-auto bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Suggestions</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {suggestions.map((msg, index) => (
              <li key={index} className="mb-2">{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Utility Functions
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getMinDate() {
  const date = new Date();
  date.setDate(date.getDate() - 20);
  return date.toISOString().split("T")[0];
}

function getLastTenDays() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

// Generate Dummy Data
function generateDummyData() {
  const data = [];
  const now = new Date();

  for (let d = 0; d < 20; d++) {
    const date = new Date();
    date.setDate(now.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];

    let currentTime = new Date(date);
    currentTime.setHours(0, 0, 0, 0); // Start at midnight

    while (currentTime.getDate() === date.getDate()) {
      // Generate random health data
      const pulse = 65 + Math.floor(Math.random() * 30); // 65–95
      const spo2 = 93 + Math.floor(Math.random() * 6); // 93–98
      const temp = +(36 + Math.random() * 2).toFixed(1); // 36.0–38.0

      // Add the data point
      data.push({
        timestamp: currentTime.toISOString().replace("T", " ").slice(0, 16), // Format: YYYY-MM-DD HH:mm
        pulse,
        spo2,
        temp,
      });

      // Increment time by a random interval (1 to 2 hours)
      const randomInterval = Math.floor(Math.random() * 60) + 60; // 60–120 minutes
      currentTime.setMinutes(currentTime.getMinutes() + randomInterval);
    }
  }

  return data.reverse(); // Reverse to make the data chronological
}

// Analyze Daily Trends
function analyzeDailyTrends(data) {
  const analysis = [];
  if (data.length < 2) return analysis;

  const pulse = data.map((entry) => entry.pulse);
  const spo2 = data.map((entry) => entry.spo2);
  const temp = data.map((entry) => entry.temp);
  const timestamps = data.map((entry) => entry.timestamp.split(" ")[1]);

  // Pulse Analysis
  let pulseTrend = "";
  const pulseDiff = pulse[pulse.length - 1] - pulse[0];
  if (Math.abs(pulseDiff) > 15) {
    pulseTrend = pulseDiff > 0 ? "drastically increased" : "drastically decreased";
    analysis.push(`Pulse ${pulseTrend} by ${Math.abs(pulseDiff)} bpm during the day.`);
  } else if (Math.abs(pulseDiff) > 5) {
    pulseTrend = pulseDiff > 0 ? "increased" : "decreased";
    analysis.push(`Pulse ${pulseTrend} by ${Math.abs(pulseDiff)} bpm during the day.`);
  } else {
    analysis.push("Pulse remained stable throughout the day.");
  }

  // Detect drastic changes
  for (let i = 1; i < pulse.length; i++) {
    if (Math.abs(pulse[i] - pulse[i - 1]) > 10) {
      analysis.push(
        `Sudden pulse change of ${Math.abs(pulse[i] - pulse[i - 1])} bpm detected at ${timestamps[i]}.`
      );
    }
  }

  // SpO2 Analysis
  let spo2Trend = "";
  const spo2Diff = spo2[spo2.length - 1] - spo2[0];
  if (Math.abs(spo2Diff) > 3) {
    spo2Trend = spo2Diff > 0 ? "increased" : "decreased";
    analysis.push(`SpO2 ${spo2Trend} by ${Math.abs(spo2Diff)}% during the day.`);
  } else {
    analysis.push("SpO2 remained stable throughout the day.");
  }

  // Temperature Analysis
  let tempTrend = "";
  const tempDiff = temp[temp.length - 1] - temp[0];
  if (Math.abs(tempDiff) > 1) {
    tempTrend = tempDiff > 0 ? "increased" : "decreased";
    analysis.push(`Temperature ${tempTrend} by ${Math.abs(tempDiff)}°C during the day.`);
  } else {
    analysis.push("Temperature remained stable throughout the day.");
  }

  return analysis;
}

// Generate Suggestions
function generateSuggestions(analysis, data) {
  const suggestions = [];
  const lastIndex = data.length - 1;
  const pulse = data[lastIndex].pulse;
  const spo2 = data[lastIndex].spo2;
  const temp = data[lastIndex].temp;

  // Basic suggestions based on latest data
  if (pulse > 100) {
    suggestions.push("High pulse detected. Rest and avoid strenuous activity.");
  } else if (pulse < 60) {
    suggestions.push("Low pulse detected. Monitor for dizziness or fatigue.");
  } else {
    suggestions.push("Pulse is within normal range. Maintain regular activity.");
  }
  
  if (spo2 < 95) {
    suggestions.push("Low SpO2 detected. Practice deep breathing or consult a doctor.");
  } else {
    suggestions.push("SpO2 is healthy. Continue monitoring.");
  }

  if (temp > 37.5) {
    suggestions.push("Slight fever detected. Stay hydrated and rest.");
  } else if (temp < 36.0) {
    suggestions.push("Low body temperature. Keep warm and monitor.");
  } else {
    suggestions.push("Temperature is normal. No immediate concerns.");
  }

  // Analysis-based suggestions
  if (analysis.some((msg) => msg.includes("drastically"))) {
    suggestions.push("Drastic changes detected in vitals. Consult a healthcare professional.");
  }
  if (analysis.some((msg) => msg.includes("Sudden pulse change"))) {
    suggestions.push("Sudden pulse fluctuations observed. Avoid stress and monitor closely.");
  }
  if (analysis.some((msg) => msg.includes("SpO2 decreased"))) {
    suggestions.push("SpO2 dropped during the day. Ensure proper ventilation.");
  }

  return suggestions;
}

export default Trends;
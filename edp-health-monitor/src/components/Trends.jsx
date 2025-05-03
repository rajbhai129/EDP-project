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

  // Daily Chart Data (Last 12 Hours in IST)
  useEffect(() => {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago

    // Filter data for the last 12 hours
    const filtered = dummyData.filter((entry) => {
      const entryTime = new Date(entry.timestamp.replace(" ", "T"));
      return entryTime >= twelveHoursAgo && entryTime <= now;
    });

    // Convert timestamps to IST and sort in ascending order
    const sortedFiltered = filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    // Use exact IST timestamps for labels with seconds (e.g., 02:34:23)
    const labels = sortedFiltered.map((entry) => {
      const istTime = convertToISTWithSeconds(entry.timestamp);
      return istTime.split(" ")[1]; // Show only time part (HH:mm:ss)
    });
    const pulse = sortedFiltered.map((entry) => entry.pulse);
    const spo2 = sortedFiltered.map((entry) => entry.spo2);
    const temp = sortedFiltered.map((entry) => entry.temp);

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
          hidden: false, // Allow toggling
        },
        {
          label: "SpO2 (%)",
          data: spo2,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          hidden: false, // Allow toggling
        },
        {
          label: "Temperature (°C)",
          data: temp,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.2)",
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          hidden: false, // Allow toggling
        },
      ],
    });

    // Analyze daily trends
    const analysis = analyzeDailyTrends(sortedFiltered);
    setTrendAnalysis(analysis);

    // Save trend analysis to localStorage
    localStorage.setItem("trendAnalysis", JSON.stringify(analysis));

    setSuggestions(generateSuggestions(analysis, sortedFiltered));
  }, [dummyData]);

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
          hidden: false, // Allow toggling
        },
        {
          label: "Avg SpO2 (%)",
          data: spo2Data,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          hidden: false, // Allow toggling
        },
        {
          label: "Avg Temperature (°C)",
          data: tempData,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          hidden: false, // Allow toggling
        },
      ],
    });
  }, [dummyData]);

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
          Daily Health Trends - Last 12 Hours (IST)
        </h2>
        <div className="relative h-96">
          <Line
            data={dailyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    const meta = ci.getDatasetMeta(index);
                    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                    ci.update();
                  },
                },
                title: { display: true, text: "Hourly Health Data (Last 12 Hours)" },
              },
              scales: {
                x: {
                  ticks: {
                    maxTicksLimit: 6, // Limit number of ticks to avoid clutter
                    autoSkip: true,
                  },
                },
                y: {
                  min: 30,
                  max: 105,
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
                legend: {
                  position: "top",
                  onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    const meta = ci.getDatasetMeta(index);
                    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                    ci.update();
                  },
                },
                title: { display: true, text: "10-Day Average Health Data" },
              },
              scales: {
                y: {
                  min: 30,
                  max: 105,
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
function convertToISTWithSeconds(timestamp) {
  const date = new Date(timestamp.replace(" ", "T"));
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toISOString().replace("T", " ").slice(0, 19); // Format: YYYY-MM-DD HH:mm:ss
}

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
  // Check if data already exists in localStorage
  const storedData = JSON.parse(localStorage.getItem("dummyHealthData"));
  if (storedData && storedData.length >= 120) { // Ensure enough data points
    return storedData; // Reuse existing data to prevent changes on refresh
  }

  const data = [];
  const today = new Date();
  // Generate data for the last 20 days to ensure coverage
  for (let d = 0; d < 20; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];

    // For daily chart (last 12 hours), use random intervals with seconds
    if (d === 0) { // Only for today
      const now = new Date();
      const offset = Math.floor(Math.random() * 20) * 60 * 1000; // Random offset up to 20 minutes
      const endTime = new Date(now.getTime() - offset); // Current time or up to 20 minutes earlier
      const twelveHoursAgo = new Date(endTime.getTime() - 12 * 60 * 60 * 1000);
      let currentTime = twelveHoursAgo;

      while (currentTime <= endTime) {
        // Add random seconds (0-59)
        const randomSeconds = Math.floor(Math.random() * 60);
        currentTime.setSeconds(randomSeconds);
        const timestamp = currentTime.toISOString().replace("T", " ").slice(0, 19);
        let pulse = 65 + Math.floor(Math.random() * 30); // 65–95
        let spo2 = 93 + Math.floor(Math.random() * 6); // 93–98
        let temp = +(36 + Math.random() * 2).toFixed(1); // 36.0–38.0

        // Introduce random drastic changes to make it realistic
        if (Math.random() < 0.2) { // 20% chance of a drastic change
          pulse += Math.random() > 0.5 ? 15 : -15; // Drastic pulse change
          pulse = Math.max(50, Math.min(120, pulse)); // Keep within realistic bounds
        }
        if (Math.random() < 0.1) { // 10% chance of a drastic SpO2 change
          spo2 -= Math.floor(Math.random() * 4); // Drastic SpO2 drop
          spo2 = Math.max(90, spo2); // Keep within realistic bounds
        }
        if (Math.random() < 0.15) { // 15% chance of a drastic temp change
          temp += Math.random() > 0.5 ? 1 : -1; // Drastic temp change
          temp = Math.max(35, Math.min(39, temp)); // Keep within realistic bounds
        }

        data.push({
          timestamp,
          pulse,
          spo2,
          temp,
        });

        // Increment time by a random interval (15 to 60 minutes)
        const randomInterval = Math.floor(Math.random() * 46) + 15; // 15–60 minutes
        currentTime = new Date(currentTime.getTime() + randomInterval * 60 * 1000);
      }
    } else {
      // For other days (for 10-day chart), use 2-hour intervals
      for (let hour = 0; hour < 24; hour += 2) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00:00`;
        const timestamp = `${dateStr} ${timeStr}`;
        const pulse = 65 + Math.floor(Math.random() * 30); // 65–95
        const spo2 = 93 + Math.floor(Math.random() * 6); // 93–98
        const temp = +(36 + Math.random() * 2).toFixed(1); // 36.0–38.0

        data.push({
          timestamp,
          pulse,
          spo2,
          temp,
        });
      }
    }
  }

  // Sort data in ascending order
  const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Store the generated data in localStorage to prevent changes on refresh
  localStorage.setItem("dummyHealthData", JSON.stringify(sortedData));
  return sortedData;
}

// Analyze Daily Trends
function analyzeDailyTrends(data) {
  const analysis = [];
  if (data.length < 2) return analysis;

  const pulse = data.map((entry) => entry.pulse);
  const spo2 = data.map((entry) => entry.spo2);
  const temp = data.map((entry) => entry.temp);
  const timestamps = data.map((entry) => convertToISTWithSeconds(entry.timestamp).split(" ")[1]);

  // Pulse Analysis
  let pulseTrend = "";
  const pulseDiff = pulse[pulse.length - 1] - pulse[0];
  if (Math.abs(pulseDiff) > 15) {
    pulseTrend = pulseDiff > 0 ? "drastically increased" : "drastically decreased";
    analysis.push(`Pulse ${pulseTrend} by ${Math.abs(pulseDiff)} bpm over the last 12 hours.`);
  } else if (Math.abs(pulseDiff) > 5) {
    pulseTrend = pulseDiff > 0 ? "increased" : "decreased";
    analysis.push(`Pulse ${pulseTrend} by ${Math.abs(pulseDiff)} bpm over the last 12 hours.`);
  } else {
    analysis.push("Pulse remained stable over the last 12 hours.");
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
    analysis.push(`SpO2 ${spo2Trend} by ${Math.abs(spo2Diff)}% over the last 12 hours.`);
  } else {
    analysis.push("SpO2 remained stable over the last 12 hours.");
  }

  // Temperature Analysis
  let tempTrend = "";
  const tempDiff = temp[temp.length - 1] - temp[0];
  if (Math.abs(tempDiff) > 1) {
    tempTrend = tempDiff > 0 ? "increased" : "decreased";
    analysis.push(`Temperature ${tempTrend} by ${Math.abs(tempDiff)}°C over the last 12 hours.`);
  } else {
    analysis.push("Temperature remained stable over the last 12 hours.");
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
    suggestions.push("SpO2 dropped over the last 12 hours. Ensure proper ventilation.");
  }

  return suggestions;
}

export default Trends;
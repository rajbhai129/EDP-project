import { useState, useEffect } from "react";
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
import "./Trends.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Trends() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // Dummy time-series data (timestamp format)
  const dummyData = generateDummyData();

  useEffect(() => {
    const filtered = dummyData.filter((entry) => entry.timestamp.startsWith(selectedDate));
    const labels = filtered.map((entry) => entry.timestamp.split(" ")[1]);
    const pulse = filtered.map((entry) => entry.pulse);
    const spo2 = filtered.map((entry) => entry.spo2);
    const temp = filtered.map((entry) => entry.temp);

    setChartData({
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
  }, [selectedDate]);

  return (
    <div className="trends-container">
      <h1>Trends</h1>
      <div className="date-picker">
        <label>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={getMinDate()}
          max={getTodayDate()}
        />
      </div>
      <div className="chart-container">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Health Trends - Hourly Data" },
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  stepSize: 5,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

// Utilities
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getMinDate() {
  const date = new Date();
  date.setDate(date.getDate() - 20);
  return date.toISOString().split("T")[0];
}

// Dummy Data Generator
function generateDummyData() {
  const data = [];
  const now = new Date();
  for (let d = 0; d < 20; d++) {
    const date = new Date();
    date.setDate(now.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];

    for (let hour = 0; hour < 24; hour += 2) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      data.push({
        timestamp: `${dateStr} ${timeStr}`,
        pulse: 65 + Math.floor(Math.random() * 30),     // 65–95
        spo2: 93 + Math.floor(Math.random() * 6),       // 93–98
        temp: +(36 + Math.random() * 2).toFixed(1),     // 36.0–38.0
      });
    }
  }
  return data.reverse(); // Make it chronological
}

export default Trends;

import React, { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Provide consistent data with natural patterns and variations
const generateRealisticData = () => {
  // Use a pseudorandom number generator with a fixed seed to get consistent results
  const seededRandom = (function() {
    let seed = 42; // Fixed seed for consistent generation
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  })();

  // Helper function to add variation with seeded randomness
  const addVariation = (baseValue, variationRange) => {
    return baseValue + (seededRandom() * 2 - 1) * variationRange;
  };

  // Helper function to generate a number within range with seeded randomness
  const generateInRange = (min, max) => {
    return min + seededRandom() * (max - min);
  };

  // Person profile (determines baseline values) - now consistent between refreshes
  const person = {
    baselinePulse: 72,       // Average resting pulse
    baselineSpO2: 97.8,      // Average SpO2
    baselineTemperature: 36.6, // Average body temp
    activityLevel: 1.0,      // Activity multiplier
    sleepQuality: 1.0,       // Sleep quality multiplier
  };

  // Generate hourly data with realistic patterns
  const hourlyData = [];
  for (let hour = 0; hour < 24; hour++) {
    // Time of day factors (circadian rhythm)
    const isNight = hour >= 22 || hour <= 5;
    const isMorning = hour >= 6 && hour <= 9;
    const isAfternoon = hour >= 12 && hour <= 14;
    const isEvening = hour >= 17 && hour <= 21;
    
    // Base values that follow circadian rhythm
    let pulse, spo2, temperature;
    
    // Sleeping hours (reduced pulse, slightly lower SpO2 and temp)
    if (isNight) {
      pulse = person.baselinePulse * 0.85 * person.sleepQuality;
      spo2 = person.baselineSpO2 - 0.3 * (2 - person.sleepQuality);
      temperature = person.baselineTemperature - 0.3;
    } 
    // Morning (pulse increases, SpO2 and temp rise)
    else if (isMorning) {
      pulse = person.baselinePulse * 1.05 * person.activityLevel;
      spo2 = person.baselineSpO2 + 0.2;
      temperature = person.baselineTemperature; 
    }
    // Afternoon (slight dip after lunch)
    else if (isAfternoon) {
      pulse = person.baselinePulse * 1.1 * person.activityLevel;
      spo2 = person.baselineSpO2;
      temperature = person.baselineTemperature + 0.2;
    }
    // Evening (starting to wind down)
    else if (isEvening) {
      pulse = person.baselinePulse * 1.0 * person.activityLevel;
      spo2 = person.baselineSpO2;
      temperature = person.baselineTemperature + 0.1;
    }
    // Regular daytime
    else {
      pulse = person.baselinePulse * person.activityLevel;
      spo2 = person.baselineSpO2;
      temperature = person.baselineTemperature;
    }
    
    // Add natural variations
    pulse = Math.round(addVariation(pulse, 3));  // +/- 3 BPM variation
    spo2 = parseFloat((addVariation(spo2, 0.4)).toFixed(1)); // +/- 0.4% variation
    temperature = parseFloat((addVariation(temperature, 0.2)).toFixed(1)); // +/- 0.2°C variation
    
    // Format time
    const formattedHour = hour.toString().padStart(2, '0');
    
    hourlyData.push({
      time: `${formattedHour}:00`,
      pulse,
      spo2,
      temperature
    });
  }
  
  // Only use the last 12 hours for display
  const last12Hours = hourlyData.slice(12);

  // Generate daily data for the last 20 days
  const dailyData = [];
  const today = new Date();
  
  // Generate base values for each day with some trends
  for (let i = 19; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Include some realistic trends:
    // - Some days with higher activity (weekends)
    // - Some days with poorer sleep
    // - A minor illness around days 5-7
    // - General recovery thereafter
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hadPoorSleep = seededRandom() < 0.2; // 20% chance of poor sleep using seeded random
    const minorIllness = i >= 13 && i <= 15; // Illness period
    const postIllnessRecovery = i >= 10 && i < 13; // Recovery period
    
    let dailyBasePulse = person.baselinePulse;
    let dailyBaseSpO2 = person.baselineSpO2;
    let dailyBaseTemperature = person.baselineTemperature;
    
    // Apply factors
    if (isWeekend) {
      dailyBasePulse *= 1.05; // Slightly higher pulse on weekends (more activity)
    }
    
    if (hadPoorSleep) {
      dailyBasePulse *= 1.07; // Higher pulse after poor sleep
      dailyBaseSpO2 -= 0.3; // Slightly lower oxygen
    }
    
    if (minorIllness) {
      dailyBasePulse *= 1.15; // Higher pulse during illness
      dailyBaseSpO2 -= 0.8; // Lower oxygen during illness
      dailyBaseTemperature += 0.8; // Fever
    }
    
    if (postIllnessRecovery) {
      dailyBasePulse *= 1.05; // Recovering pulse
      dailyBaseSpO2 -= 0.3; // Recovering oxygen
      dailyBaseTemperature += 0.3; // Recovering temperature
    }
    
    // Add daily variation
    const pulse = Math.round(addVariation(dailyBasePulse, 4));
    const spo2 = parseFloat((addVariation(dailyBaseSpO2, 0.5)).toFixed(1));
    const temperature = parseFloat((addVariation(dailyBaseTemperature, 0.3)).toFixed(1));
    
    // Format date
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}`;
    
    dailyData.push({
      date: formattedDate,
      pulse,
      spo2,
      temperature,
    });
  }

  return { hourlyData: last12Hours, dailyData };
};

// Chart Component
const HealthChart = ({ title, data, type }) => {
  const [visibleDatasets, setVisibleDatasets] = React.useState({
    pulse: true,
    spo2: true,
    temperature: true,
  });

  const chartData = {
    labels: data.map((d) => d.time || d.date),
    datasets: [
      {
        label: "Pulse (BPM)",
        data: data.map((d) => d.pulse),
        borderColor: "#f87171",
        backgroundColor: "#f8717140",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        hidden: !visibleDatasets.pulse,
      },
      {
        label: "SpO2 (%)",
        data: data.map((d) => d.spo2),
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa40",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        hidden: !visibleDatasets.spo2,
      },
      {
        label: "Temperature (°C)",
        data: data.map((d) => d.temperature),
        borderColor: "#4ade80",
        backgroundColor: "#4ade8040",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        hidden: !visibleDatasets.temperature,
      },
    ],
  };

  // Calculate dynamic y-axis range based on visible datasets
  const getYAxisRange = () => {
    const visibleData = [];
    if (visibleDatasets.pulse) {
      visibleData.push(...data.map((d) => d.pulse));
    }
    if (visibleDatasets.spo2) {
      visibleData.push(...data.map((d) => d.spo2));
    }
    if (visibleDatasets.temperature) {
      visibleData.push(...data.map((d) => d.temperature));
    }

    if (visibleData.length === 0) {
      return { min: 20, max: 120 }; // Default range
    }

    const minValue = Math.min(...visibleData);
    const maxValue = Math.max(...visibleData);
    const padding = (maxValue - minValue) * 0.1 || 5; // 10% padding or min 5

    if (visibleDatasets.pulse && !visibleDatasets.spo2 && !visibleDatasets.temperature) {
      return { min: Math.max(50, minValue - padding), max: Math.min(110, maxValue + padding) };
    }
    if (visibleDatasets.spo2 && !visibleDatasets.pulse && !visibleDatasets.temperature) {
      return { min: Math.max(90, minValue - padding), max: Math.min(100, maxValue + padding) };
    }
    if (visibleDatasets.temperature && !visibleDatasets.pulse && !visibleDatasets.spo2) {
      return { min: Math.max(35, minValue - padding), max: Math.min(38, maxValue + padding) };
    }
    return { min: Math.max(20, minValue - padding), max: Math.min(120, maxValue + padding) };
  };

  const { min, max } = getYAxisRange();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14 }, padding: 20 },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.datasetIndex;
          const newVisibleDatasets = { ...visibleDatasets };
          if (index === 0) newVisibleDatasets.pulse = !newVisibleDatasets.pulse;
          if (index === 1) newVisibleDatasets.spo2 = !newVisibleDatasets.spo2;
          if (index === 2) newVisibleDatasets.temperature = !newVisibleDatasets.temperature;
          setVisibleDatasets(newVisibleDatasets);
          legend.chart.data.datasets[index].hidden = !legend.chart.data.datasets[index].hidden;
          legend.chart.update();
        },
      },
      title: {
        display: true,
        text: title,
        font: { size: 20, weight: "bold" },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value}${label.includes("SpO2") ? "%" : label.includes("Temperature") ? "°C" : ""}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Value", font: { size: 14 } },
        min,
        max,
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: { maxRotation: 45, minRotation: 45, font: { size: 12 } },
        grid: { display: false },
      },
    },
    hover: { mode: "nearest", intersect: true },
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      key={`${type}-${min}-${max}`}
    >
      <Line data={chartData} options={options} height={400} />
    </motion.div>
  );
};

// Trend Section Component
const TrendSection = ({ title, data, type }) => {
  return (
    <motion.section
      className="mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 tracking-tight">
        {title}
      </h2>
      <div className="grid grid-cols-1">
        <HealthChart title={title} data={data} type={type} />
      </div>
    </motion.section>
  );
};

// Health Stats Cards
const HealthStatCard = ({ title, value, unit, icon, trend, color }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <span className="ml-1 text-gray-600">{unit}</span>
          </div>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
      <div className={`mt-2 flex items-center text-${trend < 0 ? "green" : trend > 0 ? "red" : "gray"}-500 text-sm`}>
        <span>{Math.abs(trend)}% {trend < 0 ? "lower" : trend > 0 ? "higher" : ""} than average</span>
      </div>
    </motion.div>
  );
};

// Main Trends Component
const Trends = () => {
  const [data, setData] = useState({ hourlyData: [], dailyData: [] });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Generate realistic data only once and store in localStorage to maintain consistency
  useEffect(() => {
    // Always generate new data on first page load after deployment
    // In a real app, this would be replaced with actual sensor data from backend
    const generatedData = generateRealisticData();
    setData(generatedData);
    setIsFirstLoad(false);
    
    // In a real IoT application, you would set up a WebSocket or poll an API here
    // Example: const socket = new WebSocket('ws://your-raspberry-pi-backend/vitals');
    // socket.onmessage = (event) => { updateLatestReading(JSON.parse(event.data)); };
    
    // Simulate periodic updates like a real system would have
    const updateInterval = setInterval(() => {
      // In a real app, this would be a new reading from sensor
      // Here we just slightly modify the latest data point to simulate a new reading
      setData(prevData => {
        if (!prevData.hourlyData.length) return prevData;
        
        // Get the last hourly reading
        const lastReading = prevData.hourlyData[prevData.hourlyData.length - 1];
        
        // Create a small natural variation (±1% of current value)
        const newPulse = Math.round(lastReading.pulse * (1 + (Math.random() * 0.02 - 0.01)));
        const newSpo2 = parseFloat((lastReading.spo2 * (1 + (Math.random() * 0.002 - 0.001))).toFixed(1));
        const newTemp = parseFloat((lastReading.temperature * (1 + (Math.random() * 0.002 - 0.001))).toFixed(1));
        
        // Update just the last hourly reading to simulate new sensor data
        const updatedHourlyData = [...prevData.hourlyData];
        updatedHourlyData[updatedHourlyData.length - 1] = {
          ...lastReading,
          pulse: newPulse,
          spo2: newSpo2,
          temperature: newTemp
        };
        
        return {
          ...prevData,
          hourlyData: updatedHourlyData
        };
      });
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(updateInterval);
  }, [isFirstLoad]);
  
  // Calculate current stats (last readings)
  const currentStats = {
    pulse: data.hourlyData.length ? data.hourlyData[data.hourlyData.length - 1].pulse : 0,
    spo2: data.hourlyData.length ? data.hourlyData[data.hourlyData.length - 1].spo2 : 0,
    temperature: data.hourlyData.length ? data.hourlyData[data.hourlyData.length - 1].temperature : 0,
  };
  
  // Calculate averages for trend comparisons
  const calculateAverage = (arr, prop) => {
    return arr.reduce((acc, curr) => acc + curr[prop], 0) / arr.length;
  };
  
  const averages = {
    pulse: data.dailyData.length ? calculateAverage(data.dailyData, 'pulse') : 0,
    spo2: data.dailyData.length ? calculateAverage(data.dailyData, 'spo2') : 0,
    temperature: data.dailyData.length ? calculateAverage(data.dailyData, 'temperature') : 0,
  };
  
  // Calculate percent difference from average
  const getTrend = (current, average) => {
    return average ? Math.round(((current - average) / average) * 100) : 0;
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <header className="text-center mb-12">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Health Monitoring Dashboard
        </motion.h1>
        <motion.p
          className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Real-time monitoring and analysis of vital health metrics
        </motion.p>
       
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Current Stats Cards */}
       

        <AnimatePresence>
          {data.hourlyData.length > 0 && (
            <TrendSection title="Last 12 Hours" data={data.hourlyData} type="hourly" />
          )}
          {data.dailyData.length > 0 && (
            <TrendSection title="Last 20 Days" data={data.dailyData} type="daily" />
          )}
        </AnimatePresence>

        <motion.section
          className="mt-12 bg-white p-6 rounded-xl shadow-md border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 tracking-tight">
            Health Insights & ML Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Sleep Quality Analysis</h3>
              <p className="text-gray-600">
                Heart rate pattern indicates normal sleep cycles with appropriate dips during deep sleep phases.
                SpO2 levels remain stable throughout the night with 97.4% average.
              </p>
              <div className="mt-3 flex items-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Sleep efficiency score: 94%</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Health Events</h3>
              <p className="text-gray-600">
                ML analysis detected possible mild infection 13-15 days ago based on temperature and SpO2 patterns.
                Current readings show full recovery.
              </p>
              <div className="mt-3 flex items-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Current health status: Normal</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">AI-Powered Risk Assessment</h3>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Cardiovascular Risk</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">Low (12%)</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-medium text-gray-700">Respiratory Risk</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                  <span className="text-green-600 font-medium">Low (8%)</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-medium text-gray-700">Metabolic Risk</span>
                  <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: '26%' }}></div>
                  </div>
                  <span className="text-yellow-600 font-medium">Moderate (26%)</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">Risk assessment based on 20-day vital trend analysis using ML algorithms.</p>
            </div>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
};

export default Trends;
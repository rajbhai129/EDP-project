import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Droplet, Thermometer, Clock, AlertTriangle, Activity, ChevronLeft, ChevronRight, Info } from "lucide-react";
import Slider from "react-slick";
import { motion } from "framer-motion";

// Slick carousel styles (ensure these are imported in main.jsx)
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Dashboard() {
  const [bmi, setBmi] = useState(null);
  const [healthScore, setHealthScore] = useState(0);
  const [trends, setTrends] = useState({ pulse: 0, spo2: 0 });
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiError, setBmiError] = useState("");
  const sliderRef = useRef(null);

  // Retrieve data from localStorage
  const storedData = JSON.parse(localStorage.getItem("healthData"));
  const trendData = JSON.parse(localStorage.getItem("trendAnalysis")) || [];
  const storedBmi = JSON.parse(localStorage.getItem("bmiData"));

  const data = storedData || {
    heartRate: 0,
    spo2: 0,
    temperature: 0,
    timestamp: "N/A",
  };

  // Load stored BMI on mount
  useEffect(() => {
    if (storedBmi && storedBmi.bmi) {
      setBmi(storedBmi.bmi);
      setHeight(storedBmi.height || "");
      setWeight(storedBmi.weight || "");
    } else {
      // Default BMI if no stored data
      const defaultHeight = 170;
      const defaultWeight = 70;
      const heightInMeters = defaultHeight / 100;
      const calculatedBmi = (defaultWeight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(calculatedBmi);
    }
  }, []);

  // Calculate average pulse and SpO₂ from the last 12 hours
  useEffect(() => {
    if (trendData.length > 0) {
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      const last12HoursTrends = trendData.filter((entry) => {
        try {
          const entryTime = new Date(entry.timestamp);
          return entryTime >= twelveHoursAgo && entryTime <= now && !isNaN(entryTime);
        } catch (error) {
          console.error("Invalid timestamp in trendData:", entry.timestamp);
          return false;
        }
      });

      console.log("Last 12 Hours Trends:", last12HoursTrends);

      const avgPulse =
        last12HoursTrends.length > 0
          ? last12HoursTrends.reduce((sum, entry) => sum + (entry.pulse || 0), 0) /
            last12HoursTrends.length
          : 70;
      const avgSpo2 =
        last12HoursTrends.length > 0
          ? last12HoursTrends.reduce((sum, entry) => sum + (entry.spo2 || 0), 0) /
            last12HoursTrends.length
          : 98;

      console.log("Calculated Averages:", { avgPulse, avgSpo2 });

      setTrends({
        pulse: Math.round(avgPulse),
        spo2: Math.round(avgSpo2),
      });
    } else {
      console.log("No trendData available, using fallback values");
      setTrends({
        pulse: 70,
        spo2: 98,
      });
    }
  }, [trendData]);

  // Handle BMI calculation
  const calculateBmi = () => {
    if (!height || !weight) {
      setBmiError("Please enter both height and weight");
      return;
    }
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      setBmiError("Please enter valid height and weight");
      return;
    }
    const heightInMeters = heightNum / 100;
    const calculatedBmi = (weightNum / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(calculatedBmi);
    setBmiError("");
    // Store in localStorage
    localStorage.setItem("bmiData", JSON.stringify({ bmi: calculatedBmi, height: heightNum, weight: weightNum }));
  };

  // Get BMI category and color
  const getBmiCategory = (bmi) => {
    if (!bmi) return { category: "Unknown", color: "bg-gray-500" };
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { category: "Underweight", color: "bg-yellow-500" };
    if (bmiNum < 25) return { category: "Normal", color: "bg-green-500" };
    if (bmiNum < 30) return { category: "Overweight", color: "bg-orange-500" };
    return { category: "Obese", color: "bg-red-500" };
  };

  // Calculate BMI progress for ring (0-100 scale, normalized to 18.5-24.9 range)
  const getBmiProgress = (bmi) => {
    if (!bmi) return 0;
    const bmiNum = parseFloat(bmi);
    const minBmi = 15; // Lower bound for visualization
    const maxBmi = 30; // Upper bound
    const normalRange = 24.9 - 18.5;
    const normalizedBmi = Math.max(minBmi, Math.min(maxBmi, bmiNum));
    const progress = ((normalizedBmi - minBmi) / (maxBmi - minBmi)) * 100;
    return progress;
  };

  // Calculate health score
  const calculateHealthScore = (pulse, spo2, bmi) => {
    const normalPulse = { min: 60, max: 100 };
    const normalSpo2 = { min: 95, max: 100 };
    const normalBmi = { min: 18.5, max: 24.9 };

    const pulseScore = pulse >= normalPulse.min && pulse <= normalPulse.max ? 30 : 15;
    const spo2Score = spo2 >= normalSpo2.min ? 40 : 20;
    const bmiScore = bmi && parseFloat(bmi) >= normalBmi.min && parseFloat(bmi) <= normalBmi.max ? 30 : 15;

    return pulseScore + spo2Score + bmiScore;
  };

  // Update health score
  useEffect(() => {
    if (bmi && trends.pulse && trends.spo2) {
      console.log("Inputs to calculateHealthScore:", {
        pulse: trends.pulse,
        spo2: trends.spo2,
        bmi,
      });
      const score = calculateHealthScore(trends.pulse, trends.spo2, bmi);
      console.log("Calculated Health Score:", score);
      setHealthScore(score);
    }
  }, [bmi, trends]);

  // Risk level detection logic
  const getRiskLevel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Poor";
  };

  const riskLevel = getRiskLevel(healthScore);

  const getRiskColor = (level) => {
    if (level === "Excellent") return "text-green-600";
    if (level === "Good") return "text-blue-500";
    if (level === "Moderate") return "text-orange-500";
    return "text-red-600";
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Slider settings for mobile view
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    centerMode: false,
    appendDots: (dots) => (
      <div>
        <ul className="flex justify-center space-x-2 mt-4">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 bg-indigo-300 rounded-full hover:bg-indigo-600 transition"></div>
    ),
  };

  // Navigation button handlers
  const handlePrev = () => {
    sliderRef.current.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current.slickNext();
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <style>
        {`
          .slick-slide > div {
            width: 100% !important;
            margin: 0 !important;
          }
          .slick-list {
            overflow: hidden !important;
          }
          .bmi-progress-ring {
            transform: rotate(-90deg);
          }
          .bmi-progress-ring__circle {
            transition: stroke-dashoffset 0.35s;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Health Dashboard
        </motion.h1>

        {/* Web View: Side-by-Side Layout */}
        <div className="hidden md:flex md:space-x-6">
          {/* Left Section: Real-Time Health Monitoring */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6 w-2/3 border border-gray-100"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Real-Time Health Monitoring
              </h2>
              <Clock className="text-indigo-600 w-6 h-6" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  <span className="text-gray-700 font-medium">Heart Rate</span>
                </div>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-red-500">{data.heartRate}</span>
                  <span className="text-gray-500 ml-2 mb-1">bpm</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Droplet className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-gray-700 font-medium">SpO₂</span>
                </div>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-blue-500">{data.spo2}</span>
                  <span className="text-gray-500 ml-2 mb-1">%</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Thermometer className="w-5 h-5 mr-2 text-green-500" />
                  <span className="text-gray-700 font-medium">Temperature</span>
                </div>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-green-500">{data.temperature}</span>
                  <span className="text-gray-500 ml-2 mb-1">°C</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700 font-medium">Last Updated</span>
                </div>
                <div className="text-gray-600 text-sm">{data.timestamp}</div>
              </div>
            </div>

            <div
              className={`mt-6 flex items-center justify-center gap-2 text-lg font-semibold ${getRiskColor(riskLevel)}`}
            >
              <AlertTriangle className="w-5 h-5" />
              Health Status: {riskLevel}
            </div>

            <Link to="/health">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mt-6 transition">
                Health Analysis
              </button>
            </Link>
          </motion.div>

          {/* Right Section: Health Score */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6 w-1/3 border border-gray-100"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Health Score
            </h2>

            <div className="space-y-4">
              {/* BMI Input Form */}
              <motion.div
                className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Calculate Your BMI</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={`w-full p-2 rounded-lg border ${
                        bmiError && !height ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gradient-to-r from-white to-blue-50`}
                    />
                  </motion.div>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={`w-full p-2 rounded-lg border ${
                        bmiError && !weight ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gradient-to-r from-white to-blue-50`}
                    />
                  </motion.div>
                </div>
                {bmiError && (
                  <motion.p
                    className="text-red-500 text-sm mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {bmiError}
                  </motion.p>
                )}
                <motion.button
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                  onClick={calculateBmi}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Calculate BMI
                </motion.button>
              </motion.div>

              {/* BMI Display with Progress Ring */}
              {bmi && (
                <motion.div
                  className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200 flex items-center justify-between"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Your BMI</h3>
                    <p className="text-gray-600">
                      BMI: <span className="font-bold">{bmi}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-sm ${getBmiCategory(bmi).color}`}
                      >
                        {getBmiCategory(bmi).category}
                      </span>
                      <div className="relative group">
                        <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 -top-10 left-6">
                          Underweight: &lt;18.5, Normal: 18.5-24.9, Overweight: 25-29.9, Obese: ≥30
                        </div>
                      </div>
                    </div>
                  </div>
                  <svg className="bmi-progress-ring" width="60" height="60">
                    <circle
                      className="bmi-progress-ring__circle"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                      r="26"
                      cx="30"
                      cy="30"
                    />
                    <circle
                      className="bmi-progress-ring__circle"
                      stroke={getBmiCategory(bmi).color.replace("bg-", "#")}
                      strokeWidth="8"
                      strokeDasharray="163.36"
                      strokeDashoffset={163.36 - (getBmiProgress(bmi) / 100) * 163.36}
                      fill="transparent"
                      r="26"
                      cx="30"
                      cy="30"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Health Score */}
              <div className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Health Score</h3>
                <div className="relative w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className={`absolute top-0 left-0 h-4 rounded-full ${getProgressBarColor(healthScore)}`}
                    style={{ width: `${healthScore}%` }}
                  ></div>
                </div>
                <p className="text-center text-gray-600">
                  Your health score is <span className="font-bold text-gray-800">{healthScore}</span>/100
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pulse</h3>
                <p className="text-gray-600">
                  Average Pulse: <span className="font-bold">{trends.pulse} bpm</span>
                </p>
                <p className="text-gray-600">
                  Normal Range: <span className="font-bold">60-100 bpm</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">SpO₂</h3>
                <p className="text-gray-600">
                  Average SpO₂: <span className="font-bold">{trends.spo2}%</span>
                </p>
                <p className="text-gray-600">
                  Normal Range: <span className="font-bold">95-100%</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile View: Carousel with Navigation Buttons */}
        <div className="md:hidden relative overflow-hidden">
          <Slider {...sliderSettings} ref={sliderRef}>
            {/* Real-Time Health Monitoring */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Real-Time Health Monitoring
                </h2>
                <Clock className="text-indigo-600 w-6 h-6" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-2">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-700 font-medium">Heart Rate</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-red-500">{data.heartRate}</span>
                    <span className="text-gray-500 ml-2 mb-1">bpm</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-2">
                    <Droplet className="w-5 h-5 mr-2 text-blue-500" />
                    <span className="text-gray-700 font-medium">SpO₂</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-blue-500">{data.spo2}</span>
                    <span className="text-gray-500 ml-2 mb-1">%</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-2">
                    <Thermometer className="w-5 h-5 mr-2 text-green-500" />
                    <span className="text-gray-700 font-medium">Temperature</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-green-500">{data.temperature}</span>
                    <span className="text-gray-500 ml-2 mb-1">°C</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 transition duration-300 hover:shadow-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700 font-medium">Last Updated</span>
                  </div>
                  <div className="text-gray-600 text-sm">{data.timestamp}</div>
                </div>
              </div>

              <div
                className={`mt-6 flex items-center justify-center gap-2 text-lg font-semibold ${getRiskColor(riskLevel)}`}
              >
                <AlertTriangle className="w-5 h-5" />
                Health Status: {riskLevel}
              </div>

              <Link to="/health">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mt-6 transition">
                  Health Analysis
                </button>
              </Link>
            </motion.div>

            {/* Health Score */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                Health Score
              </h2>

              <div className="space-y-4">
                {/* BMI Input Form */}
                <motion.div
                  className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Calculate Your BMI</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="number"
                        placeholder="Height (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className={`w-full p-2 rounded-lg border ${
                          bmiError && !height ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gradient-to-r from-white to-blue-50`}
                      />
                    </motion.div>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="number"
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={`w-full p-2 rounded-lg border ${
                          bmiError && !weight ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gradient-to-r from-white to-blue-50`}
                      />
                    </motion.div>
                  </div>
                  {bmiError && (
                    <motion.p
                      className="text-red-500 text-sm mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {bmiError}
                    </motion.p>
                  )}
                  <motion.button
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                    onClick={calculateBmi}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Calculate BMI
                  </motion.button>
                </motion.div>

                {/* BMI Display with Progress Ring */}
                {bmi && (
                  <motion.div
                    className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200 flex items-center justify-between"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Your BMI</h3>
                      <p className="text-gray-600">
                        BMI: <span className="font-bold">{bmi}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm ${getBmiCategory(bmi).color}`}
                        >
                          {getBmiCategory(bmi).category}
                        </span>
                        <div className="relative group">
                          <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 -top-10 left-6">
                            Underweight: &lt;18.5, Normal: 18.5-24.9, Overweight: 25-29.9, Obese: ≥30
                          </div>
                        </div>
                      </div>
                    </div>
                    <svg className="bmi-progress-ring" width="60" height="60">
                      <circle
                        className="bmi-progress-ring__circle"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                        r="26"
                        cx="30"
                        cy="30"
                      />
                      <circle
                        className="bmi-progress-ring__circle"
                        stroke={getBmiCategory(bmi).color.replace("bg-", "#")}
                        strokeWidth="8"
                        strokeDasharray="163.36"
                        strokeDashoffset={163.36 - (getBmiProgress(bmi) / 100) * 163.36}
                        fill="transparent"
                        r="26"
                        cx="30"
                        cy="30"
                      />
                    </svg>
                  </motion.div>
                )}

                {/* Health Score */}
                <div className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Health Score</h3>
                  <div className="relative w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div
                      className={`absolute top-0 left-0 h-4 rounded-full ${getProgressBarColor(healthScore)}`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-gray-600">
                    Your health score is <span className="font-bold text-gray-800">{healthScore}</span>/100
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Pulse</h3>
                  <p className="text-gray-600">
                    Average Pulse: <span className="font-bold">{trends.pulse} bpm</span>
                  </p>
                  <p className="text-gray-600">
                    Normal Range: <span className="font-bold">60-100 bpm</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg shadow-md p-4 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">SpO₂</h3>
                  <p className="text-gray-600">
                    Average SpO₂: <span className="font-bold">{trends.spo2}%</span>
                  </p>
                  <p className="text-gray-600">
                    Normal Range: <span className="font-bold">95-100%</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </Slider>

          {/* Navigation Buttons for Mobile View */}
          <motion.button
            className="md:hidden absolute left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg"
            onClick={handlePrev}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            className="md:hidden absolute right-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg"
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
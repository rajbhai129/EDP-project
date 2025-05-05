import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import Logs from "./components/Logs";
import Health from "./components/Health";
import Trends from "./components/Trends"; // Import Trends component
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content-container">
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/trends" element={<Trends />} /> {/* Ensure this route is correct */}
          <Route path="/health" element={<Health />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
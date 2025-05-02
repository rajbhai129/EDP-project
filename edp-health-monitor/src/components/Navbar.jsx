import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { FaHome, FaHeartbeat, FaBell, FaClipboardList, FaChartLine } from "react-icons/fa";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="bottom-navbar">
      <Link
        to="/"
        className={`navbar-icon ${location.pathname === "/" ? "active" : ""}`}
      >
        <FaHome />
        <span>Home</span>
      </Link>
      <Link
        to="/dashboard"
        className={`navbar-icon ${
          location.pathname === "/dashboard" ? "active" : ""
        }`}
      >
        <FaHeartbeat />
        <span>Dashboard</span>
      </Link>
      <Link
        to="/alerts"
        className={`navbar-icon ${
          location.pathname === "/alerts" ? "active" : ""
        }`}
      >
        <FaBell />
        <span>Alerts</span>
      </Link>
      <Link
        to="/logs"
        className={`navbar-icon ${
          location.pathname === "/logs" ? "active" : ""
        }`}
      >
        <FaClipboardList />
        <span>Logs</span>
      </Link>
      <Link
        to="/trends"
        className={`navbar-icon ${
          location.pathname === "/trends" ? "active" : ""
        }`}
      >
        <FaChartLine />
        <span>Trends</span>
      </Link>
    </nav>
  );
}

export default Navbar;
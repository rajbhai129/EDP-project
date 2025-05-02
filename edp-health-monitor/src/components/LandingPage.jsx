import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="landing-container">
      <div className="glass-card">
        <h1>AI-Powered Health Monitoring</h1>
        <p>
          Monitor heart rate, SpO₂, temperature, air quality, and detect falls in real-time.<br />
          Stay safe and connected with our intelligent health system.
        </p>
        <button onClick={handleLoginClick} className="login-button">
          Login
        </button>
      </div>
    </div>
  );
}

export default LandingPage;

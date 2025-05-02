import './Login.css';

function Login() {
  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic here
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Log in to monitor your health in real-time.</p>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
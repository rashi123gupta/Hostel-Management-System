import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './app/login';
import StudentDashboard from './app/student/dashboard';
import './App.css';
// import './app/login.css';
// import './app/student/dashboard.css';

function App() {
  // `user` state will be null if not logged in, or contain user data on success
  const [user, setUser] = useState(null);

  // This function is passed to the LoginPage and is called on successful login
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const renderView = () => {
    // If a user is logged in, show the dashboard, otherwise show the login page.
    if (user) {
      return <StudentDashboard />;
    } else {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        {renderView()}
      </div>
    </div>
  );
}

export default App;

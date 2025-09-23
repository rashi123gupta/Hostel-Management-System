import React from 'react';
import './Navbar.css';

function Navbar({ setView }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">HMS</div>
      {/* <div className="navbar-links">
        <span onClick={() => setView('login')} className="nav-link">Login</span>
        <span onClick={() => setView('signup')} className="nav-link">Signup</span>
      </div> */}
    </nav>
  );
}

export default Navbar;

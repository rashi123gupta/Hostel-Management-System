import React, { useState } from 'react';
import FormInput from '../components/FormInput';
import { loginWithEmailAndPassword } from '../services/authService';

function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    
    // Call the authentication service
    const result = await loginWithEmailAndPassword(formData.email, formData.password);

    if (result.success) {
      setMessage('Login successful!');
      // Call the success handler from the parent component
      onLoginSuccess(result.user);
    } else {
      setMessage(`Login failed: ${result.error}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <FormInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormInput
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" className="btn-primary">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default LoginPage;

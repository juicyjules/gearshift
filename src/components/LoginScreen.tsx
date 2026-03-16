import React from 'react';
import { useOAuth } from '../hooks/useOAuth';
import { motion } from 'framer-motion';
import './LoginScreen.css';

const LoginScreen: React.FC = () => {
  const { login, isLoading, error } = useOAuth();

  return (
    <div className="login-screen">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Gearshift</h1>
        <p>Please log in to manage your Transmission client.</p>

        {error && <div className="error-message">{error}</div>}

        <button
          className="save-button"
          onClick={login}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login with IDP'}
        </button>
      </motion.div>
    </div>
  );
};

export default LoginScreen;

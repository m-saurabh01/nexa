import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {isLogin ? (
        <Login 
          key="login"
          onSwitchToSignup={() => setIsLogin(false)} 
        />
      ) : (
        <Signup 
          key="signup"
          onSwitchToLogin={() => setIsLogin(true)} 
        />
      )}
    </AnimatePresence>
  );
};

export default AuthPage;

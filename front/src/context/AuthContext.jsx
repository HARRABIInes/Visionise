import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api/auth';

  // Check for existing token on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await fetch(`${API_BASE}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsSignedIn(true);
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const signUp = async (userData) => {
    try {
      console.log('Sending signup request with:', userData);
      
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Signup response status:', response.status);
      
      const data = await response.json();
      console.log('Signup response data:', data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsSignedIn(true);
        return { success: true };
      } else {
        return { success: false, errors: data.errors || data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, errors: ['Network error'] };
    }
  };

  const signIn = async (credentials) => {
    try {
      console.log('Sending signin request with:', credentials);
      
      const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Signin response status:', response.status);
      
      const data = await response.json();
      console.log('Signin response data:', data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsSignedIn(true);
        return { success: true };
      } else {
        return { success: false, errors: data.errors || data.message };
      }
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, errors: ['Network error'] };
    }
  };

  const logout = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      isSignedIn, 
      user, 
      signUp, 
      signIn, 
      logout,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
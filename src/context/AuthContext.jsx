import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/apiService'; // Use the centralized apiService
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {

      const token = sessionStorage.getItem('jwtToken');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Log the role from the decoded token

          // ✅ Check if token is expired
          if (decodedToken.exp * 1000 < Date.now()) {
            logout();
          } else {
            setIsAuthenticated(true);
            setUserRole(decodedToken.role); // Set the role from the token
            await fetchUser();
          }
        } catch (error) {
          console.error("AuthContext: Invalid token:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ✅ Fetch current user details
  const fetchUser = async () => {
    try {
      const res = await api.get('/admin/users/user'); // Assumes endpoint returns user details
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Don't logout on fetch failure - token might still be valid
    }
  };

  // ✅ Login function
  const login = async (username, password, recaptchaToken) => {
    try {
      const response = await api.post('/auth/login', { username, password, recaptchaToken });
      const { jwtToken, role } = response.data;
      
      // ✅ Validate that the role exists in our supported roles
      if (!Object.values(USER_ROLES).includes(role)) {
        console.warn(`AuthContext: Unknown role received from API: ${role}`);
      }
      
      sessionStorage.setItem('jwtToken', jwtToken);
      setIsAuthenticated(true);
      setUserRole(role); // Set the role from the login response
      
      await fetchUser();
      return role;//true;
    } catch (error) {
      console.error("AuthContext: Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

    // ✅ Login function
  const loginWithMobileOtp = async (mobile, otp) => {
    try {
      const response = await api.post('/auth/login-with-otp', { mobile, otp});
      const { jwtToken, role } = response.data;
      
      // ✅ Validate that the role exists in our supported roles
      if (!Object.values(USER_ROLES).includes(role)) {
        console.warn(`AuthContext: Unknown role received from API: ${role}`);
      }
      
      sessionStorage.setItem('jwtToken', jwtToken);
      setIsAuthenticated(true);
      setUserRole(role); // Set the role from the login response
      await fetchUser();
      return role;//true;
    } catch (error) {
      console.error("AuthContext: Login failed:", error.response?.data || error.message);
      throw error;
    }
  };


  // ✅ Logout function
  const logout = () => {
    sessionStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null); // ✅ Clear user data on logout
  };

  // ✅ Check if user has specific role(s)
  const hasRole = (roles) => {
    if (!isAuthenticated || !userRole) {
      return false;
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return userRole === roles;
  };

  // ✅ Helper function to check if user has admin access
  const hasAdminAccess = () => {
    return hasRole([
      USER_ROLES.PORTAL_ADMIN,
      USER_ROLES.ZONAL_HEAD,
      USER_ROLES.DISTRICT_OFFICER,
      USER_ROLES.BLOCK_OFFICER,
      USER_ROLES.CMTC_MANAGER
    ]);
  };

  // ✅ Helper function to check if user has CMS access
  const hasCMSAccess = () => {
    return hasRole([
      USER_ROLES.PORTAL_ADMIN,
      USER_ROLES.EDITOR,
      USER_ROLES.PUBLISHER
    ]);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        userRole, 
        login, 
        logout, 
        hasRole, 
        hasAdminAccess,
        hasCMSAccess,
        loading,
        loginWithMobileOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Helper functions for token management
export const getAuthToken = () => {
  return sessionStorage.getItem("jwtToken");
};

export const isLoggedIn = () => {
  return !!getAuthToken();
};

// ✅ Helper to get decoded token
export const getDecodedToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
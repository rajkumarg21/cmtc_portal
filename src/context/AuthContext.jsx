import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/apiService'; // Use the centralized apiService

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
const [user, setUser] = useState(null);
  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Log the role from the decoded token
        console.log("AuthContext: Decoded token role:", decodedToken.role);
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("AuthContext: Token expired.");
          logout();
        } else {
          setIsAuthenticated(true);
          setUserRole(decodedToken.role); // Set the role from the token
           fetchUser();
        }
      } catch (error) {
        console.error("AuthContext: Invalid token:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  
const fetchUser = async () => {
  try {
    const res = await api.get('/admin/users/user'); // Assumes /auth/me endpoint
    setUser(res.data);
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
};
  const login = async (username, password, recaptchaToken) => {
    try {
      const response = await api.post('/auth/login', { username, password, recaptchaToken });
      const { jwtToken, role } = response.data;
      sessionStorage.setItem('jwtToken', jwtToken);
      setIsAuthenticated(true);
      setUserRole(role); // Set the role from the login response
      await fetchUser(); 
      //console.log("AuthContext: Logged in user role from API response:", role); // <-- DEBUG LOG HERE
      return true;
    } catch (error) {
      console.error("AuthContext: Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
   sessionStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const hasRole = (roles) => {
   // console.log("AuthContext: hasRole check - Current userRole:", userRole, "Roles being checked against:", roles); // <-- DEBUG LOG HERE
    if (!isAuthenticated || !userRole) {
     // console.log("AuthContext: hasRole - Not authenticated or userRole is null/empty.");
      return false;
    }
    if (Array.isArray(roles)) {
      const result = roles.includes(userRole);
     // console.log(`AuthContext: hasRole - Array check: ${userRole} in [${roles.join(', ')}]? ${result}`);
      return result;
    }
    const result = userRole === roles;
   // console.log(`AuthContext: hasRole - Single role check: ${userRole} === ${roles}? ${result}`);
    return result;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated,user, userRole, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
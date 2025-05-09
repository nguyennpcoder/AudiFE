import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthResponse } from '../services/authService';
import axios from 'axios';
import { User } from 'firebase/auth';
import auth, { getCurrentUser } from '../services/firebaseService';
import { useNotification } from './NotificationContext'; // Replace antd message import


interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  firebaseUser: User | null;
  login: (userData: AuthResponse) => void;
  logout: () => void;
  setFirebaseUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { showNotification } = useNotification(); // Use our custom notification

  // First useEffect to handle localStorage
  useEffect(() => {
    // Check for traditional token-based auth
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("Loading user from localStorage:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Set the authorization header for all future axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clean up corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []); // Only run once on mount

  // Separate useEffect to handle Firebase auth
  useEffect(() => {
    // Set up Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setFirebaseUser(authUser);
        setIsAuthenticated(true);
        
        // Check if this is a Facebook login (by checking provider data)
        const isFacebookLogin = authUser.providerData?.some(
          (provider) => provider.providerId === 'facebook.com'
        );
        
        // For Facebook login without email, add a special prefix to the name
        let displayName = authUser.displayName || 'User';
        let email = authUser.email || '';
        let role = 'khach_hang'; // Default role
        
        if (isFacebookLogin && !authUser.email) {
          displayName = `${displayName}`;
        }
        
        // Add logic to determine if this user is an admin
        // For testing, check if the email matches admin@audi.com
        if (email === 'admin@audi.com') {
          role = 'quan_tri';
        }
        
        // Create a user object from the Firebase profile
        const firebaseUserData: AuthResponse = {
          success: true,
          message: 'Login successful with social provider',
          userId: parseInt(authUser.uid.slice(0, 8), 16) || 1000,
          fullName: displayName,
          email: email,
          role: role // Use the determined role
        };
        
        // Get Firebase ID token to use for API authorization
        authUser.getIdToken().then(token => {
          firebaseUserData.token = token;
          localStorage.setItem('user', JSON.stringify(firebaseUserData));
          localStorage.setItem('token', token);
          setUser(firebaseUserData);
          
          // Set the authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        });
      } else {
        setFirebaseUser(null);
        // Check if we have a user from localStorage before setting isAuthenticated to false
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setIsAuthenticated(false);
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []); // Only run once on mount

  const login = (userData: AuthResponse) => {
    console.log("AuthContext login called with:", userData);
    
    if (userData.token) {
      // Format the user data before storing
      const userDataToStore = {
        ...userData,
        // Make sure role is exactly as in the database, trimmed and normalized
        role: userData.role ? userData.role.trim() : undefined
      };
      
      console.log("Storing user data in localStorage:", userDataToStore);
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userDataToStore));
      
      setUser(userDataToStore);
      setIsAuthenticated(true);
      
      // Set the authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      console.log('Login successful, authentication state updated');
    }
  };

  const logout = () => {
    // Clear regular auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Clear Firebase auth
    auth.signOut();
    
    // Update state
    setIsAuthenticated(false);
    
    // Remove the authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Show notification using our custom notification
    showNotification('success', 'Đăng xuất thành công!');
    
    console.log('Logout successful, authentication state cleared');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      firebaseUser,
      login, 
      logout,
      setFirebaseUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
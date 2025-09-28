import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthResponse, validateToken } from '../services/authService';
import axios from 'axios';
import { User } from 'firebase/auth';
import auth, { getCurrentUser } from '../services/firebaseService';
import { useNotification } from './NotificationContext'; // Replace antd message import


interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  firebaseUser: User | null;
  isValidating: boolean;
  login: (userData: AuthResponse) => void;
  logout: () => void;
  setFirebaseUser: (user: User | null) => void;
  checkUserStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize auth state as not authenticated by default
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const { showNotification } = useNotification(); // Use our custom notification

  // Function to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMode');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Function to check user status
  const checkUserStatus = async (): Promise<boolean> => {
    if (!user || !user.token) return true;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung/profile`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      // Check if account is locked
      if (response.data.trangThai === false) {
        clearAuthData();
        showNotification('warning', 'Tài khoản của bạn đã bị quản trị viên khóa');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking user status:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAuthData();
        showNotification('warning', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        return false;
      }
      // For other errors, assume user is still valid
      return true;
    }
  };

  // First useEffect to initialize auth state (optimistic for local sessions)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // Parse user data first
          let parsedUser: AuthResponse;
          try {
            parsedUser = JSON.parse(storedUser);
          } catch (error) {
            console.error("Error parsing user data:", error);
            clearAuthData();
            setIsValidating(false);
            return;
          }
            // // Validate token with backend
            // const isTokenValid = await validateToken(storedToken);
          
            // if (isTokenValid) {
            //   // Token is valid, set up authentication
            //   setUser(parsedUser);
            //   setIsAuthenticated(true);
            //   axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            //   console.log('Token validation successful, user authenticated');
            // } else {
            //   // Token is invalid, clear everything
            //   console.log('Token validation failed, clearing auth data');
            //   clearAuthData();
          // Optimistic hydration: trust localStorage on load.
          // The axios 401 interceptor will clear auth later if token truly invalid.
          setUser(parsedUser);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          if (!localStorage.getItem('authMode')) {
            localStorage.setItem('authMode', 'local');
          }
          console.log('Auth hydrated from localStorage');
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        clearAuthData();
      } finally {
        setIsValidating(false);
      }
    };

    initializeAuth();
  }, []);

  // Setup axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config || {};
        if (status === 401) {
          const hadAuthHeader = !!(
            originalRequest?.headers?.Authorization ||
            originalRequest?.headers?.authorization ||
            axios.defaults.headers.common['Authorization']
          );
          // If the failing request was not authenticated, do not force logout/global notice
          if (!hadAuthHeader) {
            return Promise.reject(error);
          }
          const authMode = localStorage.getItem('authMode');
          try {
            // Attempt a single token refresh for Firebase users before logging out
            if (!originalRequest._retry && auth.currentUser) {
              originalRequest._retry = true;
              const newToken = await auth.currentUser.getIdToken(true);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${newToken}`
              };
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Fall through to clear auth below
            console.warn('Token refresh failed, proceeding to logout');
          }
          // If session is from Firebase social login, do NOT clear auth or show global notice
          if (authMode === 'firebase') {
            console.log('401 on Firebase session; suppressing global logout/notice');
            return Promise.reject(error);
          }
          console.log('Received 401 on local session, clearing auth data');
          clearAuthData();
          // Only show notification for local (database) accounts
          showNotification('warning', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        }
        // Kiểm tra nếu lỗi là do tài khoản bị khóa
        else if (status === 403) {
          // Kiểm tra nếu người dùng là tài khoản local (không phải Firebase)
          const authMode = localStorage.getItem('authMode');
          if (authMode !== 'firebase') {
            clearAuthData();
            showNotification('warning', 'Tài khoản của bạn đã bị quản trị viên khóa');
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [showNotification]);

  // Separate useEffect to handle Firebase auth
  useEffect(() => {
    // Set up Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setIsValidating(true);
        setFirebaseUser(authUser);
        
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
        
        // Check if this is a Google login
        const isGoogleLogin = authUser.providerData?.some(
          (provider) => provider.providerId === 'google.com'
        );
        
        console.log('AuthContext - Is Google login:', isGoogleLogin);
        console.log('AuthContext - authUser.photoURL:', authUser.photoURL);
        console.log('AuthContext - authUser.providerData:', authUser.providerData);
        
        // For Google login, ensure we preserve the photoURL properly
        let avatar = authUser.photoURL;
        if (isGoogleLogin && authUser.photoURL) {
          // For Google, the photoURL is already a complete URL, so use it directly
          avatar = authUser.photoURL;
          console.log('AuthContext - Using Google photoURL:', avatar);
        }
        
        // Create a user object from the Firebase profile
        const firebaseUserData: AuthResponse = {
          success: true,
          message: 'Login successful with social provider',
          userId: parseInt(authUser.uid.slice(0, 8), 16) || 1000,
          fullName: displayName,
          email: email,
          role: role,
          avatar: avatar || undefined
        };
        
        console.log('AuthContext - firebaseUserData:', firebaseUserData);
        
        // Get Firebase ID token to use for API authorization and set headers BEFORE marking authenticated
        authUser.getIdToken().then(token => {
          firebaseUserData.token = token;
          localStorage.setItem('user', JSON.stringify(firebaseUserData));
          localStorage.setItem('token', token);
          localStorage.setItem('authMode', 'firebase');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(firebaseUserData);
          setIsAuthenticated(true);
        }).finally(() => {
          setIsValidating(false);
        });
      } else {
        setFirebaseUser(null);
        // Check if we have a user from localStorage before setting isAuthenticated to false
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setIsAuthenticated(false);
        }
        setIsValidating(false);
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
      localStorage.setItem('authMode', 'local');
      
      setUser(userDataToStore);
      setIsAuthenticated(true);
      
      // Set the authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      console.log('Login successful, authentication state updated');
    }
  };

  const logout = () => {
    // Clear regular auth
    clearAuthData();
    
    // Clear Firebase auth
    auth.signOut();
    
    // Show notification using our custom notification
    showNotification('success', 'Đăng xuất thành công!');
    
    console.log('Logout successful, authentication state cleared');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      firebaseUser,
      isValidating,
      login, 
      logout,
      setFirebaseUser,
      checkUserStatus
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
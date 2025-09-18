import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  GithubAuthProvider,
  Auth, 
  UserCredential,
  signOut,
  fetchSignInMethodsForEmail as firebaseFetchSignInMethodsForEmail,
  signInWithCredential as firebaseSignInWithCredential,
  AuthCredential,
  OAuthProvider,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqRry2n8b06ZRr9A98XYk9EOkN464809E",
  authDomain: "audi-1109.firebaseapp.com",
  projectId: "audi-1109",
  storageBucket: "audi-1109.firebasestorage.app",
  messagingSenderId: "284228544705",
  appId: "1:284228544705:web:f42467f64ce153328d4c40",
  measurementId: "G-8X3S7L84ZV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Guard analytics initialization to avoid runtime errors in unsupported environments
try {
  if (typeof window !== 'undefined') {
    getAnalytics(app);
  }
} catch (e) {
  console.warn('Analytics initialization skipped:', (e as Error)?.message);
}
const auth: Auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
// Create a new instance for Facebook provider
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();
// Apple Sign-In via generic OAuthProvider
const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Facebook provider configuration
// Add all necessary scopes for your app
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
facebookProvider.setCustomParameters({
  'display': 'popup',
  // Force re-authentication each time
  'auth_type': 'reauthenticate'
});

githubProvider.setCustomParameters({
  'allow_signup': 'true'
});

// Apple provider configuration
// Note: Apple only shares name on first consent; email may be private/relay
appleProvider.addScope('email');
appleProvider.addScope('name');

// Firebase authentication functions
export const signInWithGoogle = (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = (): Promise<UserCredential> => {
  // Clear any previous auth state before attempting Facebook login
  // This can help with token issues
  return signInWithPopup(auth, facebookProvider);
};


export const signInWithGithub = (): Promise<UserCredential> => {
  return signInWithPopup(auth, githubProvider);
};

export const signInWithApple = (): Promise<UserCredential> => {
  return signInWithPopup(auth, appleProvider);
};

export const logoutFirebase = (): Promise<void> => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Additional export for handling account-exists-with-different-credential error
export const fetchSignInMethodsForEmail = (email: string): Promise<string[]> => {
  return firebaseFetchSignInMethodsForEmail(auth, email);
};

export const signInWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
  return firebaseSignInWithCredential(auth, credential);
};

// Export provider classes for handling credentials
export { GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider };

export default auth;

export const sendOtpViaFirebase = async (phoneNumber: string): Promise<void> => {
  try {
    // Tạo RecaptchaVerifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        console.log('reCAPTCHA solved', response);
      }
    });

    // Gửi OTP
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    // Lưu confirmationResult để sử dụng khi xác thực OTP
    localStorage.setItem('confirmationResult', JSON.stringify(confirmationResult));
    
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (otp: string): Promise<boolean> => {
  try {
    const confirmationResultStr = localStorage.getItem('confirmationResult');
    if (!confirmationResultStr) {
      throw new Error('No confirmation result found');
    }

    const confirmationResult = JSON.parse(confirmationResultStr);
    const result = await confirmationResult.confirm(otp);
    
    if (result.user) {
      console.log('OTP verified successfully');
      localStorage.removeItem('confirmationResult');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Add function to handle Google avatar
export const handleGoogleAvatar = async (photoURL: string): Promise<string> => {
  try {
    // If it's a Google URL, we need to handle CORS
    if (photoURL.includes('googleusercontent.com')) {
      // Option 1: Use a simple CORS proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(photoURL)}`;
      console.log('Using CORS proxy for Google avatar:', proxyUrl);
      return proxyUrl;
    }
    
    return photoURL;
  } catch (error) {
    console.error('Error handling Google avatar:', error);
    return '/avatar-default.png';
  }
};
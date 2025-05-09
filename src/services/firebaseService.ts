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
  OAuthProvider
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
const analytics = getAnalytics(app);
const auth: Auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
// Create a new instance for Facebook provider
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

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
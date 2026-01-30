import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  // Login with GitHub
  function loginWithGitHub() {
    return signInWithPopup(auth, githubProvider);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Get user's login provider
  function getUserProvider(user) {
    if (!user || !user.providerData || user.providerData.length === 0) {
      return 'Email';
    }

    const providerId = user.providerData[0].providerId;
    if (providerId.includes('google')) {
      return 'Google';
    } else if (providerId.includes('github')) {
      return 'GitHub';
    } else {
      return 'Email';
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithGitHub,
    getUserProvider,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
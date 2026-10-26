import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  updateProfile,
  onAuthStateChanged
} from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'NetLab User',
            isAnonymous: firebaseUser.isAnonymous,
            photoURL: firebaseUser.photoURL
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local fallback session
      const savedUser = localStorage.getItem('netlab_local_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  // Email/Password Login
  const loginWithEmail = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } else {
      // Local demo mode
      const localUser = {
        uid: `user_${Date.now()}`,
        email,
        displayName: email.split('@')[0] || 'Demo Engineer',
        isAnonymous: false
      };
      localStorage.setItem('netlab_local_user', JSON.stringify(localUser));
      setUser(localUser);
      return localUser;
    }
  };

  // Email/Password Registration
  const signupWithEmail = async (email, password, displayName) => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    } else {
      const localUser = {
        uid: `user_${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        isAnonymous: false
      };
      localStorage.setItem('netlab_local_user', JSON.stringify(localUser));
      setUser(localUser);
      return localUser;
    }
  };

  // Google One-Click Login
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      return cred.user;
    } else {
      const localUser = {
        uid: `google_user_${Date.now()}`,
        email: 'engineer@google.com',
        displayName: 'Google Test User',
        isAnonymous: false
      };
      localStorage.setItem('netlab_local_user', JSON.stringify(localUser));
      setUser(localUser);
      return localUser;
    }
  };

  // Guest / Anonymous Access
  const loginAsGuest = async (customName) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInAnonymously(auth);
      if (customName) {
        await updateProfile(cred.user, { displayName: customName });
      }
      return cred.user;
    } else {
      const guestName = customName || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
      const localUser = {
        uid: `guest_${Date.now()}`,
        email: null,
        displayName: guestName,
        isAnonymous: true
      };
      localStorage.setItem('netlab_local_user', JSON.stringify(localUser));
      setUser(localUser);
      return localUser;
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem('netlab_local_user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isFirebaseConfigured,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginAsGuest,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

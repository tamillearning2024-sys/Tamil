import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // firebase auth user
  const [profile, setProfile] = useState(null); // firestore user document
  const [loading, setLoading] = useState(true);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com'];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setProfile({
              ...data
            });
          } else {
            // ensure admin console-created accounts have a profile doc
            await setDoc(userRef, {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Admin',
              email: fbUser.email,
              role: 'admin',
              year: null,
              createdAt: serverTimestamp(),
              emailVerified: true,
              accountActive: true
            });
            setProfile({
              uid: fbUser.uid,
              name: fbUser.displayName || 'Admin',
              email: fbUser.email,
              role: 'admin',
              year: null,
              emailVerified: true,
              accountActive: true
            });
          }
        } catch (err) {
          console.warn('Failed to load profile (offline?). Using auth info.', err);
          setProfile({
            uid: fbUser.uid,
            name: fbUser.displayName || 'User',
            email: fbUser.email,
            role: 'student',
            year: null,
            emailVerified: true,
            accountActive: true
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signupStudent = async ({ name, email, password, year }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanName || !cleanEmail || !year) {
      throw new Error('Please fill all fields.');
    }
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (blockedDomains.some((d) => cleanEmail.endsWith(`@${d}`))) {
      throw new Error('Temporary email addresses are not allowed.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName: cleanName });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: cleanName,
        email: cleanEmail,
        role: 'student',
        year,
        approved: false,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      await signOut(auth); // require admin approval before first login
      throw new Error('Signup successful. Your account is waiting for admin approval.');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in.');
      }
      throw err;
    }
  };

  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      const error = new Error('Account data missing. Contact admin.');
      error.code = 'profile-missing';
      throw error;
    }
    const data = snap.data();
    // Cache profile immediately for downstream redirects
    setProfile(data);
    if (data.role === 'student') {
      if (!(data.status === 'approved' || data.approved === true)) {
        await signOut(auth);
        let msg = 'Your account is waiting for admin approval.';
        if (data.status === 'rejected') msg = 'Your signup request was rejected by admin.';
        if (data.status === 'blocked') msg = 'Your account is blocked. Contact admin.';
        const error = new Error(msg);
        error.code = 'not-approved';
        throw error;
      }
      if (!data.year) {
        const error = new Error('No year assigned to this student. Contact admin.');
        error.code = 'year-missing';
        throw error;
      }
    }
    return data;
  };

  // Admin-only login: blocks students
  const loginAdmin = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      const error = new Error('User not found');
      error.code = 'profile-missing';
      throw error;
    }
    const data = snap.data();
    if (data.role !== 'admin') {
      await signOut(auth);
      const error = new Error('Only admin can login here');
      error.code = 'not-admin';
      throw error;
    }
    setProfile(data);
    return data;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = { user, profile, loading, signupStudent, login, loginAdmin, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

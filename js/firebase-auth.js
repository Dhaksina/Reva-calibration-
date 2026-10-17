/**
 * REVA PHOENIX CALIBRATION — FIREBASE AUTHENTICATION CLIENT
 * Complete Firebase Auth module for Login, Signup, Password Reset, and Session Management
 */
(function () {
  'use strict';

  let firebaseApp = null;
  let authInstance = null;

  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK not loaded from CDN.');
      return false;
    }

    if (!firebaseApp && window.CLOUD_CONFIG && window.CLOUD_CONFIG.firebase) {
      try {
        if (!firebase.apps.length) {
          firebaseApp = firebase.initializeApp(window.CLOUD_CONFIG.firebase);
        } else {
          firebaseApp = firebase.app();
        }
        authInstance = firebase.auth();
        // Set local persistence so admin stays logged in across tabs & refreshes
        authInstance.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
          console.warn('[Firebase] Persistence error:', err);
        });
        console.log('[Firebase] Successfully initialized with project:', window.CLOUD_CONFIG.firebase.projectId);
        return true;
      } catch (err) {
        console.error('[Firebase] Initialization error:', err);
        return false;
      }
    }
    return !!authInstance;
  }

  // Friendly error formatter
  function formatAuthError(error) {
    if (!error) return 'An unknown error occurred.';
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact administrator.';
      case 'auth/user-not-found':
        return 'No registered account found with this email.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please wait a few minutes before trying again.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return error.message || 'Authentication failed.';
    }
  }

  const FirebaseAuth = {
    init: initFirebase,

    // Login with Email & Password
    async login(email, password) {
      initFirebase();
      if (!authInstance) throw new Error('Firebase Auth is not available.');
      try {
        const userCredential = await authInstance.signInWithEmailAndPassword(email.trim(), password);
        return { success: true, user: userCredential.user };
      } catch (err) {
        return { success: false, error: formatAuthError(err), raw: err };
      }
    },

    // Sign up / Create New Admin User
    async signup(email, password) {
      initFirebase();
      if (!authInstance) throw new Error('Firebase Auth is not available.');
      try {
        const userCredential = await authInstance.createUserWithEmailAndPassword(email.trim(), password);
        return { success: true, user: userCredential.user };
      } catch (err) {
        return { success: false, error: formatAuthError(err), raw: err };
      }
    },

    // Send Password Reset Email
    async resetPassword(email) {
      initFirebase();
      if (!authInstance) throw new Error('Firebase Auth is not available.');
      try {
        await authInstance.sendPasswordResetEmail(email.trim());
        return { success: true, message: `Password reset instructions sent to ${email.trim()}` };
      } catch (err) {
        return { success: false, error: formatAuthError(err), raw: err };
      }
    },

    // Logout
    async logout() {
      initFirebase();
      if (!authInstance) return { success: true };
      try {
        await authInstance.signOut();
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    // Get current authenticated user
    getCurrentUser() {
      initFirebase();
      return authInstance ? authInstance.currentUser : null;
    },

    // Get ID token for secure backend / Supabase bridge verification
    async getIdToken(forceRefresh = false) {
      initFirebase();
      const user = authInstance ? authInstance.currentUser : null;
      if (!user) return null;
      try {
        return await user.getIdToken(forceRefresh);
      } catch (err) {
        console.error('[Firebase] Error retrieving ID token:', err);
        return null;
      }
    },

    // Subscribe to Auth state changes
    onAuthStateChanged(callback) {
      initFirebase();
      if (!authInstance) {
        // Retry when SDK loads
        const checkInterval = setInterval(() => {
          if (initFirebase()) {
            clearInterval(checkInterval);
            authInstance.onAuthStateChanged(callback);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
      return authInstance.onAuthStateChanged(callback);
    }
  };

  window.FirebaseAuth = FirebaseAuth;
})();

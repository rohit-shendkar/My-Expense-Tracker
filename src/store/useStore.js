import { create } from 'zustand';
import { auth, db, appId } from '../api/firebase';
import { 
  onSnapshot, collection, 
  doc, addDoc, deleteDoc, serverTimestamp,
  query, orderBy, limit
} from 'firebase/firestore';
import { 
  signOut, 
  signInWithCustomToken, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

export const useStore = create((set, get) => ({
  user: null,
  activeUserId: null,
  expenses: [],
  isSyncing: false,
  errorMsg: null,
  authInitialized: false,
  isOnline: true,

  setUser: (user) => set({ user, authInitialized: true }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setError: (errorMsg) => set({ errorMsg }),
  
  initAuth: async () => {
    try {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      }
    } catch (error) {
      console.error("Auth init error:", error);
    } finally {
      set({ authInitialized: true });
    }
  },

  fetchExpenses: (userId) => {
    if (!userId) return;
    
    const state = get();
    
    // If we already have a subscription for this user, skip
    if (state.activeUserId === userId && state.expenses.length > 0) {
      set({ isSyncing: false });
      return () => {};
    }
    
    set({ isSyncing: true, activeUserId: userId, expenses: [] });

    // Optimized query - order by date desc, limit to recent 200
    const expensesRef = collection(db, 'artifacts', appId, 'users', userId, 'expenses');
    const expensesQuery = query(
      expensesRef,
      orderBy('date', 'desc'),
      limit(200)
    );
    
    const unsubscribe = onSnapshot(expensesQuery, 
      (snapshot) => {
        // Skip if no changes
        if (snapshot.metadata.hasPendingWrites) return;
        
        const loadedExpenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        set({ expenses: loadedExpenses, isSyncing: false, isOnline: true });
      },
      (error) => {
        console.error("Firestore sync error:", error);
        set({ isSyncing: false, isOnline: false });
      }
    );

    return unsubscribe;
  },

  addExpense: async (data) => {
    const { user } = get();
    if (!user) return;

    set({ isSyncing: true, errorMsg: null });
    try {
      const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
      await addDoc(expensesRef, {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      set({ errorMsg: "Failed to add expense. Please try again." });
    }
  },

  deleteExpense: async (expenseId) => {
    const { user } = get();
    if (!user) return;

    set({ isSyncing: true, errorMsg: null });
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', expenseId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting expense:", error);
      set({ errorMsg: "Failed to delete expense. Please try again." });
    }
  },

  // Map mobile numbers to a virtual identifier for Firebase Auth
  getIdentifier: (email) => `${email}@ledger.app`,

  login: async (email, password) => {
    const { setUser, fetchExpenses } = get();
    set({ errorMsg: null, isSyncing: true, expenses: [] });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      fetchExpenses(userCredential.user.uid);
      set({ isSyncing: false });
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      let msg = "Identification failed.";
      if (error.code === 'auth/invalid-email') msg = "Malformed email address.";
      if (error.code === 'auth/user-not-found') msg = "Member profile not located.";
      if (error.code === 'auth/wrong-password') msg = "Security key is incorrect.";
      if (error.code === 'auth/invalid-credential') msg = "Invalid credentials.";
      set({ errorMsg: msg, isSyncing: false });
      return false;
    }
  },

  resetPassword: async (email) => {
    set({ errorMsg: null, isSyncing: true });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isSyncing: false, errorMsg: "Password reset link sent to your email." });
      return true;
    } catch (error) {
      let msg = "Failed to send reset email.";
      if (error.code === 'auth/user-not-found') msg = "No account with this email.";
      set({ errorMsg: msg, isSyncing: false });
      return false;
    }
  },

  register: async (email, password) => {
    set({ errorMsg: null, isSyncing: true });
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      set({ isSyncing: false });
      return userCredentials;
    } catch (error) {
      console.error("Signup Error:", error);
      let msg = "Registration failed.";
      if (error.code === 'auth/email-already-in-use') msg = "Member already exists.";
      if (error.code === 'auth/weak-password') msg = "Key must be at least 6 characters.";
      set({ errorMsg: msg, isSyncing: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ 
        user: null, 
        activeUserId: null,
        expenses: [], 
        isSyncing: false, 
        errorMsg: null,
        isOnline: true 
      });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, expenses: [], activeUserId: null });
    }
  }
}));
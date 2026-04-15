import { create } from 'zustand';
import { auth, db, appId } from '../api/firebase';
import { 
  onSnapshot, collection, 
  doc, addDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore'; // plus auth imports
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

export const useStore = create((set, get) => ({
  user: null,
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
      // RULE 3: Ensure auth is initialized before any queries
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
    set({ isSyncing: true });

    // RULE 1: Strict Path Implementation
    const expensesRef = collection(db, 'artifacts', appId, 'users', userId, 'expenses');
    
    const unsubscribe = onSnapshot(expensesRef, 
      (snapshot) => {
        const loadedExpenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // RULE 2: Manual sort in memory
        const sorted = loadedExpenses.sort((a, b) => {
          const dateDiff = new Date(b.date) - new Date(a.date);
          if (dateDiff !== 0) return dateDiff;
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        set({ expenses: sorted, isSyncing: false, isOnline: true });
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

    try {
      set({ isSyncing: true });
      const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
      await addDoc(expensesRef, {
        ...data,
        createdAt: serverTimestamp()
      });
      set({ isSyncing: false });
    } catch (error) {
      console.error("Error adding expense:", error);
      set({ isSyncing: false, errorMsg: "Cloud ledger update failed." });
    }
  },

  deleteExpense: async (expenseId) => {
    const { user } = get();
    if (!user) return;

    try {
      set({ isSyncing: true });
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', expenseId);
      await deleteDoc(docRef);
      set({ isSyncing: false });
    } catch (error) {
      console.error("Error deleting expense:", error);
      set({ isSyncing: false, errorMsg: "Cloud ledger removal failed." });
    }
  },

  // Map mobile numbers to a virtual identifier for Firebase Auth
  getIdentifier: (email) => `${email}@ledger.app`,

  login: async (email, password) => {
    set({ errorMsg: null, isSyncing: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      set({ isSyncing: false });
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      let msg = "Identification failed.";
      if (error.code === 'auth/invalid-email') msg = "Malformed email address.";
      if (error.code === 'auth/user-not-found') msg = "Member profile not located.";
      if (error.code === 'auth/wrong-password') msg = "Security key is incorrect.";
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
      set({ expenses: [] });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}));
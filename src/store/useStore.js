import { create } from 'zustand';
import { auth, db, provider, appId } from '../api/firebase';
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
  signInAnonymously 
} from 'firebase/auth';

export const useStore = create((set, get) => ({
  user: null,
  expenses: [],
  isSyncing: false,
  loading: false,
  errorMsg: null,

  // User Actions
  initAuth: (setUser) => onAuthStateChanged(auth, (u) => {
    set({ user: u?.isAnonymous ? null : u, loading: false });
  }),

  login: async () => {
    try {
      set({ errorMsg: null });
      await signInWithPopup(auth, provider);
    } catch (e) {
      set({ errorMsg: e.code === 'auth/unauthorized-domain' ? "Domain unauthorized" : "Login failed" });
    }
  },

  // Data Actions
  syncExpenses: (userId) => {
    if (!userId) return;
    set({ isSyncing: true });
    const ref = collection(db, 'artifacts', appId, 'users', userId, 'expenses');
    
    return onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      set({ expenses: sorted, isSyncing: false });
    });
  },

  addExpense: async (data) => {
    const { user } = get();
    const ref = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
  }
}));
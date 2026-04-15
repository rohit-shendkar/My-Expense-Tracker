import React, { useEffect,useMemo,useState } from 'react';
import {useStore} from './store/useStore';
import {auth} from './api/firebase'
import {formatINR} from './utils/formatters'
import Header from './components/layout/Header';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  LogOut, 
  LogIn, 
  User, 
  Loader2,
  AlertCircle,
  MapPin,
  X,
  ShieldCheck
} from 'lucide-react';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';


const App = () => {
  const { 
    user, expenses, isSyncing, loading, errorMsg,
    login, logout, addExpense, deleteExpense, setUser, fetchExpenses, setError ,initAuth
  } = useStore();

  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Essentials');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['Essentials', 'Lifestyle', 'Travel', 'Wellness', 'Dining', 'Business', 'Other'];

  // Auth initialization
  useEffect(() => {
    const initAuth = async () => {
      // RULE 3: Auth FIRST
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          // Default to Guest Session
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Initial auth failed", e);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Sync data when user changes
  useEffect(() => {
    if (user) {
      const unsubscribe = fetchExpenses(user.uid);
      return () => unsubscribe && unsubscribe();
    }
  }, [user]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    addExpense({
      description,
      merchant,
      amount: parseFloat(amount),
      category,
      date
    });
    setDescription('');
    setMerchant('');
    setAmount('');
  };

  const totals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySum = expenses
      .filter(exp => exp.date === today)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const totalSum = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { today: todaySum, allTime: totalSum };
  }, [expenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-stone-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] p-6 md:p-12 font-serif text-stone-800">
      <div className="max-w-xl mx-auto relative">
        
        {/* Sync Indicator */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-100 rounded-full shadow-sm">
            {isSyncing ? (
              <>
                <Loader2 className="w-3 h-3 text-stone-400 animate-spin" />
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-sans font-bold">Syncing</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                <span className="text-[9px] uppercase tracking-widest text-stone-300 font-sans font-bold">Ledger Secured</span>
              </>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white border border-stone-200 p-4 shadow-xl rounded-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest font-sans font-bold text-stone-800 mb-1">Notice</p>
              <p className="text-xs text-stone-500 font-sans leading-relaxed">{errorMsg}</p>
            </div>
            <button onClick={() => setError(null)} className="text-stone-300 hover:text-stone-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-stone-100 shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-stone-400" />
                  </div>
                )}
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-sans font-bold">
                  {user.displayName?.split(' ')[0] || 'Member'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-help">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-medium italic">Guest Ledger</span>
              </div>
            )}
          </div>
          
          {user && !user.isAnonymous ? (
            <button onClick={logout} className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold flex items-center gap-2">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          ) : (
            <button onClick={login} className="text-[10px] uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors font-sans font-bold border border-stone-200 px-4 py-2 rounded-sm hover:border-stone-400 bg-white flex items-center gap-2 shadow-sm active:scale-95 transition-all">
              <ShieldCheck className="w-3 h-3" /> Secure with Google
            </button>
          )}
        </nav>

        {/* Header */}
        <Header/>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-8 mb-16 px-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 font-sans font-bold">Today</p>
            <p className="text-2xl font-light text-stone-800 tracking-tighter">₹{formatINR(totals.today)}</p>
          </div>
          <div className="text-center border-l border-stone-100">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 font-sans font-bold">Total Outlay</p>
            <p className="text-2xl font-light text-stone-800 tracking-tighter">₹{formatINR(totals.allTime)}</p>
          </div>
        </div>

        {/* Form */}
        <section className="bg-white border border-stone-100 p-8 rounded-sm mb-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] group transition-all duration-700 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)]">
          <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-8 font-sans font-bold text-center opacity-70">Record Transaction</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <input
              type="text"
              placeholder="What was acquired?"
              className="w-full bg-transparent border-b border-stone-100 py-3 px-1 focus:border-stone-800 transition-colors outline-none font-light placeholder:text-stone-200 text-lg italic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Establishment / Source"
              className="w-full bg-transparent border-b border-stone-100 py-3 px-1 focus:border-stone-800 transition-colors outline-none font-sans text-[10px] uppercase tracking-widest placeholder:text-stone-200"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="relative">
                <span className="absolute left-0 bottom-3 text-stone-300 font-light">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-transparent border-b border-stone-100 py-3 pl-5 focus:border-stone-800 transition-colors outline-none font-light text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <select
                  className="w-full bg-transparent border-b border-stone-100 py-3 pr-4 focus:border-stone-800 transition-colors outline-none font-sans text-[10px] uppercase tracking-wider appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronRight className="absolute right-0 bottom-4 w-3 h-3 text-stone-300 rotate-90" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-stone-50 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-500 font-sans font-bold mt-4 shadow-sm"
            >
              {isSyncing ? 'Synchronizing...' : 'Commit to Ledger'}
            </button>
          </form>
        </section>

        {/* History */}
        <section className="px-2 pb-20">
          <div className="flex items-center justify-between mb-8 border-b border-stone-50 pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">Recent Debits</h3>
            <span className="text-[10px] text-stone-300 font-sans italic">{expenses.length} Entries</span>
          </div>

          <div className="space-y-10">
            {expenses.length === 0 && !isSyncing ? (
              <div className="text-center py-20">
                <p className="text-stone-300 italic font-light">The ledger is currently silent.</p>
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="group flex items-start justify-between border-b border-stone-50 pb-8 hover:border-stone-100 transition-colors">
                  <div className="flex gap-6">
                    <div className="text-[10px] uppercase tracking-tighter text-stone-300 font-sans pt-1.5 w-12 shrink-0">
                      {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div>
                      <h4 className="text-lg font-light text-stone-800 leading-none mb-1 italic group-hover:text-stone-900 transition-colors">{exp.description}</h4>
                      {exp.merchant && (
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-3 flex items-center gap-1.5">
                          <MapPin className="w-2.5 h-2.5" strokeWidth={1.5} /> {exp.merchant}
                        </p>
                      )}
                      <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 font-sans font-bold bg-stone-50 px-2 py-0.5 rounded-sm">{exp.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-light text-stone-800 tracking-tight">₹{formatINR(exp.amount)}</span>
                    <button onClick={() => deleteExpense(exp.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-200 hover:text-stone-800 transition-all">
                      <Trash2 className="w-4 h-4" strokeWidth={1.2} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="mt-12 mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-200 font-sans italic">Refined Personal Finance</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
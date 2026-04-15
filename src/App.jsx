import React, { useEffect,useMemo,useState } from 'react';
import {useStore} from './store/useStore';
import {auth} from './api/firebase'
import {formatINR} from './utils/formatters'
import Header from './components/layout/Header';
import History from './components/layout/History';
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
  ShieldCheck,
  Mail,
  Lock,
  UserPlus,
  
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


const App = () => {
  const { 
    user, expenses, isSyncing, errorMsg, authInitialized, isOnline,
    initAuth, login, register, logout, addExpense, deleteExpense, setUser, fetchExpenses, setError 
  } = useStore();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Essentials');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const categories = ['Essentials', 'Lifestyle', 'Travel', 'Wellness', 'Dining', 'Business', 'Other'];

  useEffect(() => {
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, [initAuth, setUser]);

  // In src/App.jsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // Logic to set user in your Zustand store
      useStore.getState().setUser(user); 
      // Ensure you call your fetch function here
      useStore.getState().fetchExpenses(user.uid);
    } else {
      useStore.getState().setUser(null);
    }
  });

  return () => unsubscribe();
}, [user,fetchExpenses]);

  const formatINR = (val) => {
    return val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    addExpense({
      description,
      amount: parseFloat(amount),
      category,
      date
    });
    setDescription('');
    setAmount('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      await login(emailInput, passwordInput);
    } else {
      await register(emailInput, passwordInput);
    }
  };

  const totals = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySum = expenses
      .filter(exp => exp.date === todayStr)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const totalSum = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { today: todaySum, allTime: totalSum };
  }, [expenses]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-stone-200 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  // --- AUTH VIEW ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 font-serif">
        <div className="max-w-sm w-full space-y-12 animate-in fade-in duration-1000">
          <header className="text-center">
            <h1 className="text-[10px] uppercase tracking-[0.5em] text-stone-300 mb-4 font-sans font-bold">Private Ledger</h1>
            <h2 className="text-5xl font-light text-stone-900 tracking-tight italic">SpendWise</h2>
          </header>
          
          <div className="bg-white border border-stone-100 p-10 rounded-sm shadow-[0_30px_70px_-20px_rgba(0,0,0,0.05)] space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-stone-500 font-sans font-bold">
                {authMode === 'login' ? 'Member Entry' : 'Create Profile'}
              </h3>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-0 bottom-3 w-4 h-4 text-stone-200 group-focus-within:text-stone-800 transition-colors" strokeWidth={1.5} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-transparent border-b border-stone-100 py-3 pl-8 focus:border-stone-800 transition-all outline-none font-sans text-sm tracking-widest placeholder:text-stone-100"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-0 bottom-3 w-4 h-4 text-stone-200 group-focus-within:text-stone-800 transition-colors" strokeWidth={1.5} />
                  <input
                    type="password"
                    placeholder="Security Key"
                    className="w-full bg-transparent border-b border-stone-100 py-3 pl-8 focus:border-stone-800 transition-all outline-none font-sans text-sm tracking-widest placeholder:text-stone-100"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-[10px] text-red-400 uppercase tracking-widest font-sans text-center leading-relaxed">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-100 text-stone-50 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-500 font-sans font-bold shadow-sm flex items-center justify-center gap-2"
              >
                {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : authMode === 'login' ? <LogIn className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                {authMode === 'login' ? 'Access Vault' : 'Create Vault'}
              </button>
            </form>

            <div className="pt-4 text-center">
              <button 
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-[10px] uppercase tracking-widest text-stone-300 hover:text-stone-800 transition-colors font-sans font-bold underline underline-offset-4"
              >
                {authMode === 'login' ? 'Register Account' : 'Back to Entry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-[#FBFBF9] p-6 md:p-12 font-serif text-stone-800">
      <div className="max-w-xl mx-auto relative">
        <div className="fixed bottom-6 right-6 z-40">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-100 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            {isSyncing ? (
              <>
                <Loader2 className="w-3 h-3 text-stone-400 animate-spin" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-sans font-bold tracking-[0.2em]">Syncing</span>
              </>
            ) : isOnline ? (
              <>
                <Check className="w-3.5 h-3.5 text-stone-300" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-stone-300 font-sans font-bold italic tracking-[0.1em]">Ledger Secured</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-red-300" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-red-300 font-sans font-bold italic">Offline</span>
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white border border-stone-100 p-4 shadow-xl rounded-sm flex items-start gap-4">
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

        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
              <User className="w-4 h-4 text-stone-300" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-sans font-bold tracking-[0.2em]">Member</span>
          </div>
          <button onClick={logout} className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold flex items-center gap-2">
            <LogOut className="w-3 h-3" /> Terminate Session
          </button>
        </nav>

        <header className="mb-16 text-center">
          <h1 className="text-xs uppercase tracking-[0.3em] text-stone-300 mb-2 font-sans font-medium">Cloud Ledger</h1>
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-light text-stone-900 tracking-tight mb-1 italic leading-tight">SpendWise</h2>
            <div className="w-8 h-[1px] bg-stone-200 my-4"></div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-8 mb-16 px-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 font-sans font-bold opacity-60">Today</p>
            <p className="text-2xl font-light text-stone-800 tracking-tighter">₹{formatINR(totals.today)}</p>
          </div>
          <div className="text-center border-l border-stone-100">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 font-sans font-bold opacity-60">Grand Total</p>
            <p className="text-2xl font-light text-stone-800 tracking-tighter">₹{formatINR(totals.allTime)}</p>
          </div>
        </div>

        <section className="bg-white border border-stone-100 p-8 rounded-sm mb-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] group hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] transition-all duration-1000">
          <form onSubmit={handleAdd} className="space-y-8">
            <input
              type="text"
              placeholder="Nature of expense"
              className="w-full bg-transparent border-b border-stone-100 py-3 px-1 focus:border-stone-800 transition-colors outline-none font-light placeholder:text-stone-200 text-lg italic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="relative group">
                <span className="absolute left-0 bottom-3 text-stone-200 font-light italic">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-transparent border-b border-stone-100 py-3 pl-6 focus:border-stone-800 transition-colors outline-none font-light text-lg tracking-tight"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="relative group">
                <select
                  className="w-full bg-transparent border-b border-stone-100 py-3 pr-4 focus:border-stone-800 transition-colors outline-none font-sans text-[10px] uppercase tracking-wider appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronRight className="absolute right-0 bottom-4 w-3 h-3 text-stone-200 rotate-90" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSyncing}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-50 text-stone-50 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-500 font-sans font-bold mt-4 shadow-sm"
            >
              {isSyncing ? 'Committing...' : 'Commit to Cloud'}
            </button>
          </form>
        </section>

        <section className="px-2 pb-20">
          <div className="flex items-center justify-between mb-8 border-b border-stone-50 pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold tracking-[0.1em]">Recent Records</h3>
            <span className="text-[10px] text-stone-200 font-sans italic">{expenses.length} Entries</span>
          </div>
          <div className="space-y-12">
            {expenses.length === 0 && !isSyncing ? (
              <div className="text-center py-20 opacity-30 italic font-light">The ledger is silent.</div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="group flex items-start justify-between border-b border-stone-50 pb-8 hover:border-stone-100 transition-all duration-500">
                  <div className="flex gap-6">
                    <div className="text-[10px] uppercase tracking-tighter text-stone-200 font-sans pt-1.5 w-12 shrink-0 italic">
                      {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div>
                      <h4 className="text-lg font-light text-stone-800 leading-none mb-3 italic group-hover:text-stone-900 transition-colors leading-relaxed">{exp.description}</h4>
                      <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 font-sans font-bold bg-stone-50 px-2 py-0.5 rounded-sm">{exp.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-light text-stone-800 tracking-tight">₹{formatINR(exp.amount)}</span>
                    <button onClick={() => deleteExpense(exp.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-200 hover:text-stone-800 transition-all duration-300">
                      <Trash2 className="w-4 h-4" strokeWidth={1.2} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        <footer className="mt-12 mb-12 text-center border-t border-stone-50 pt-8 opacity-40 italic text-[10px] uppercase tracking-[0.3em] text-stone-200 font-sans">
          Quiet Luxury Personal Finance
        </footer>
      </div>
    </div>
  );
};

export default App;
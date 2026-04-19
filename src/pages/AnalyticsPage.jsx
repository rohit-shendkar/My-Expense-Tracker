import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Analytics from '../components/Analytics';
import { ArrowLeft, Target } from 'lucide-react';

const DEFAULT_BUDGET = 10000;
const STORAGE_KEY = 'monthlyBudget';

function getStoredBudget() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_BUDGET;
  const parsed = parseFloat(stored);
  return isNaN(parsed) || parsed <= 0 ? DEFAULT_BUDGET : parsed;
}

function setStoredBudget(value) {
  const validValue = isNaN(value) || value <= 0 ? DEFAULT_BUDGET : value;
  localStorage.setItem(STORAGE_KEY, validValue.toString());
  return validValue;
}

export default function AnalyticsPage({ onLogout }) {
  const navigate = useNavigate();
  const { expenses } = useStore();
  const [budget, setBudget] = useState(getStoredBudget);

  const handleBudgetChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const validValue = setStoredBudget(value);
    setBudget(validValue);
  };

  const handleLogout = useCallback(async () => {
    if (onLogout) {
      onLogout();
    } else {
      const { logout } = useStore.getState();
      await logout();
    }
  }, [onLogout]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] p-6 md:p-12 font-serif text-stone-800">
      <div className="max-w-xl mx-auto relative">
        <nav className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Ledger
          </button>
          <button 
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold"
          >
            Logout
          </button>
        </nav>

        <header className="mb-16 text-center">
          <h1 className="text-xs uppercase tracking-[0.3em] text-stone-300 mb-2 font-sans font-medium">Data Insights</h1>
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-light text-stone-900 tracking-tight mb-1 italic leading-tight">Analytics</h2>
            <div className="w-8 h-[1px] bg-stone-200 my-4"></div>
          </div>
        </header>

        <div className="bg-white border border-stone-100 p-4 rounded-sm mb-8">
          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans flex items-center gap-2 mb-2">
            <Target className="w-3 h-3" /> Monthly Budget
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg text-stone-400">₹</span>
            <input
              type="number"
              value={budget}
              onChange={handleBudgetChange}
              className="text-2xl font-light text-stone-800 bg-transparent outline-none w-full"
            />
          </div>
        </div>

        <Analytics expenses={expenses} budget={budget} />
        
        <footer className="mt-12 mb-12 text-center border-t border-stone-50 pt-8 opacity-40 italic text-[10px] uppercase tracking-[0.3em] text-stone-200 font-sans">
          SpendWise Analytics
        </footer>
      </div>
    </div>
  );
}
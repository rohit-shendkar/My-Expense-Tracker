import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Analytics from '../components/Analytics';
import { ArrowLeft, Target, Download, Calendar } from 'lucide-react';

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
  const [dateRange, setDateRange] = useState('all');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (dateRange === 'all') return expenses;
    
    if (dateRange === 'today') {
      return expenses.filter(e => e.date === today);
    }
    
    if (dateRange === '7days') {
      const date7 = new Date(now);
      date7.setDate(date7.getDate() - 7);
      const date7Str = date7.toISOString().split('T')[0];
      return expenses.filter(e => e.date >= date7Str);
    }
    
    if (dateRange === '30days') {
      const date30 = new Date(now);
      date30.setDate(date30.getDate() - 30);
      const date30Str = date30.toISOString().split('T')[0];
      return expenses.filter(e => e.date >= date30Str);
    }
    
    if (dateRange === 'thisMonth') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      return expenses.filter(e => e.date >= monthStartStr);
    }
    
    if (dateRange === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return expenses.filter(e => e.date >= lastMonth.toISOString().split('T')[0] && e.date <= lastMonthEnd.toISOString().split('T')[0]);
    }
    
    return expenses;
  }, [expenses, dateRange]);

  const handleExportCSV = useCallback(() => {
    if (filteredExpenses.length === 0) return;
    
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = filteredExpenses.map(exp => [
      exp.date,
      exp.description,
      exp.category,
      exp.amount
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredExpenses]);

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

  // Budget stats
  const budgetStats = useMemo(() => {
    const now = new Date();
    const thisMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const spent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = budget - spent;
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    const dailyAverage = daysLeft > 0 ? remaining / daysLeft : 0;
    const percentUsed = (spent / budget) * 100;
    
    return { spent, remaining, daysLeft, dailyAverage, percentUsed };
  }, [expenses, budget]);

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
          <div className="flex gap-4">
            <button 
              onClick={handleExportCSV}
              className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Export
            </button>
            <button 
              onClick={handleLogout}
              className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold"
            >
              Logout
            </button>
          </div>
        </nav>

        <header className="mb-16 text-center">
          <h1 className="text-xs uppercase tracking-[0.3em] text-stone-300 mb-2 font-sans font-medium">Data Insights</h1>
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-light text-stone-900 tracking-tight mb-1 italic leading-tight">Analytics</h2>
            <div className="w-8 h-[1px] bg-stone-200 my-4"></div>
          </div>
        </header>

        {/* Date Range Filter */}
        <div className="bg-white border border-stone-100 p-4 rounded-sm mb-6">
          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans flex items-center gap-2 mb-3">
            <Calendar className="w-3 h-3" /> Date Range
          </label>
          <div className="flex gap-2">
            {['all', 'today', '7days', '30days', 'thisMonth', 'lastMonth'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`text-[9px] uppercase tracking-widest px-3 py-2 font-sans font-bold transition-colors ${
                  dateRange === range 
                    ? 'bg-stone-800 text-white' 
                    : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                }`}
              >
                {range === 'all' ? 'All' : 
                 range === 'today' ? 'Today' : 
                 range === '7days' ? '7 Days' : 
                 range === '30days' ? '30 Days' : 
                 range === 'thisMonth' ? 'This Month' : 
                 'Last Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white border border-stone-100 p-4 rounded-sm mb-6">
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

        {/* Budget Progress */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-sm border ${budgetStats.percentUsed > 100 ? 'border-red-200 bg-red-50' : 'border-stone-100 bg-white'}`}>
            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-sans mb-1">Spent</p>
            <p className="text-xl font-light text-stone-800">₹{budgetStats.spent.toLocaleString()}</p>
            <p className="text-[9px] text-stone-400 mt-1">of ₹{budget.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-sm border border-stone-100 bg-white">
            <p className="text-[9px] uppercase tracking-widest text-stone-400 font-sans mb-1">Remaining</p>
            <p className={`text-xl font-light ${budgetStats.remaining < 0 ? 'text-red-500' : 'text-stone-800'}`}>
              ₹{budgetStats.remaining.toLocaleString()}
            </p>
            <p className="text-[9px] text-stone-400 mt-1">{budgetStats.daysLeft} days left</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-stone-100 p-4 rounded-sm mb-6">
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${budgetStats.percentUsed > 100 ? 'bg-red-500' : 'bg-stone-800'}`}
              style={{ width: `${Math.min(budgetStats.percentUsed, 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-stone-400 mt-2 text-center">
            {budgetStats.percentUsed.toFixed(0)}% of budget used • ₹{budgetStats.dailyAverage.toFixed(0)}/day avg
          </p>
        </div>

        <Analytics expenses={filteredExpenses} budget={budget} />
        
        <footer className="mt-12 mb-12 text-center border-t border-stone-50 pt-8 opacity-40 italic text-[10px] uppercase tracking-[0.3em] text-stone-200 font-sans">
          SpendWise Analytics
        </footer>
      </div>
    </div>
  );
}
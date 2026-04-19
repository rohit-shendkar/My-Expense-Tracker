import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../utils/constants';

import Header from '../components/Header';
import StatusBar from '../components/StatusBar';
import ErrorBanner from '../components/ErrorBanner';
import Summary from '../components/Summary';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { BarChart3 } from 'lucide-react';

export default function HomePage({ onLogout }) {
  const navigate = useNavigate();
  const { 
    expenses, isSyncing, errorMsg, isOnline, addExpense, deleteExpense, setError 
  } = useStore();
  
  const handleLogout = useCallback(async () => {
    if (onLogout) {
      onLogout();
    } else {
      const { logout } = useStore.getState();
      await logout();
    }
  }, [onLogout]);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Essentials');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const categories = CATEGORIES;

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      today: expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0),
      allTime: expenses.reduce((sum, e) => sum + e.amount, 0)
    };
  }, [expenses]);

  const validateExpense = useCallback(() => {
    if (!description || description.trim().length === 0) {
      return { valid: false, error: "Please enter a description." };
    }
    if (!amount || parseFloat(amount) <= 0) {
      return { valid: false, error: "Please enter a valid amount." };
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      return { valid: false, error: "Date cannot be in the future." };
    }
    return { valid: true };
  }, [description, amount, date]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    const validation = validateExpense();
    if (!validation.valid) {
      useStore.getState().setError(validation.error);
      return;
    }
    
    await addExpense({ 
      description: description.trim(), 
      amount: parseFloat(amount), 
      category, 
      date 
    });
    setDescription('');
    setAmount('');
    setCategory('Essentials');
    setDate(new Date().toISOString().split('T')[0]);
  }, [description, amount, category, date, addExpense, validateExpense]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] p-6 md:p-12 font-serif text-stone-800">
      <div className="max-w-xl mx-auto relative">
        <StatusBar isSyncing={isSyncing} isOnline={isOnline} />
        <ErrorBanner errorMsg={errorMsg} onClose={() => setError(null)} />
        
        <Header logout={handleLogout} />
        
        <Summary totals={stats} />
        
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/analytics')}
            className="text-[10px] uppercase tracking-widest font-sans font-bold flex items-center gap-2 text-stone-300 hover:text-stone-500 transition-colors"
          >
            <BarChart3 className="w-3 h-3" />
            Analytics
          </button>
        </div>
        
        <ExpenseForm 
          description={description}
          setDescription={setDescription}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={setCategory}
          categories={categories}
          date={date}
          setDate={setDate}
          isSyncing={isSyncing}
          onSubmit={handleAdd}
        />
        
        <ExpenseList 
          expenses={expenses}
          isSyncing={isSyncing}
          deleteExpense={deleteExpense}
        />
        
        <footer className="mt-12 mb-12 text-center border-t border-stone-50 pt-8 opacity-40 italic text-[10px] uppercase tracking-[0.3em] text-stone-200 font-sans">
          Quiet Luxury Personal Finance
        </footer>
      </div>
    </div>
  );
}
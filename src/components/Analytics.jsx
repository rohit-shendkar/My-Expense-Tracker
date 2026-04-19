import { useMemo } from 'react';
import { formatINR } from '../utils/formatters';
import { CATEGORIES } from '../utils/constants';
import { TrendingUp, TrendingDown, Calendar, Target, Award, Clock } from 'lucide-react';

export default function Analytics({ expenses, budget }) {
  const stats = useMemo(() => {
    if (expenses.length === 0) return null;

    const now = new Date();
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avg = total / expenses.length;

    // This month
    const thisMonth = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);

    // Last month for comparison
    const lastMonth = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === now.getMonth() - 1 || (now.getMonth() === 0 && d.getMonth() === 11);
    });
    const lastMonthTotal = lastMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const monthChange = lastMonthTotal ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Last 7 days
    const last7Days = expenses.filter(exp => {
      const d = new Date(exp.date);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const weekTotal = last7Days.reduce((sum, exp) => sum + exp.amount, 0);

    // Last 30 days
    const last30Days = expenses.filter(exp => {
      const d = new Date(exp.date);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });
    const month30Total = last30Days.reduce((sum, exp) => sum + exp.amount, 0);

    // Daily average (last 30 days)
    const dailyAvg = last30Days.length > 0 ? month30Total / 30 : 0;

    // Category breakdown
    const categoryBreakdown = CATEGORIES.map(cat => ({
      category: cat,
      total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter(e => e.category === cat).length
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    // Top expenses
    const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Daily spending (last 7 days)
    const dailySpending = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayExpenses = expenses.filter(e => e.date === dateStr);
      return {
        date: dateStr,
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        total: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: dayExpenses.length
      };
    }).reverse();

    // Monthly spending by month
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
      });
      return {
        month: monthDate.toLocaleDateString('en-IN', { month: 'short' }),
        total: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: monthExpenses.length
      };
    }).reverse();

    // Transactions per day of week
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
      const count = expenses.filter(exp => {
        const d = new Date(exp.date);
        return day === ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      }).length;
      return { day, count };
    });

    // Budget status
    const budgetStatus = budget ? {
      budget,
      spent: monthTotal,
      remaining: budget - monthTotal,
      percent: (monthTotal / budget) * 100
    } : null;

    // Streak (consecutive days with expenses)
    let streak = 0;
    let checkDate = new Date(now);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (expenses.some(e => e.date === dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { 
      total, avg, monthTotal, weekTotal, month30Total, dailyAvg,
      categoryBreakdown, topExpenses, dailySpending, monthlyData, dayOfWeek,
      monthChange, budgetStatus, streak
    };
  }, [expenses, budget]);

  if (!stats) {
    return (
      <div className="text-center py-8 opacity-40 italic font-light text-sm">
        Analytics will appear once you add expenses.
      </div>
    );
  }

  const isOverBudget = stats.budgetStatus && stats.budgetStatus.spent > stats.budgetStatus.budget;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white border border-stone-100 rounded-sm">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-sans mb-1">This Week</p>
          <p className="text-lg font-light text-stone-800">₹{formatINR(stats.weekTotal)}</p>
        </div>
        <div className="text-center p-4 bg-white border border-stone-100 rounded-sm">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-sans mb-1">This Month</p>
          <p className="text-lg font-light text-stone-800">₹{formatINR(stats.monthTotal)}</p>
        </div>
        <div className="text-center p-4 bg-white border border-stone-100 rounded-sm">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-sans mb-1">Daily Avg</p>
          <p className="text-lg font-light text-stone-800">₹{formatINR(stats.dailyAvg)}</p>
        </div>
        <div className="text-center p-4 bg-white border border-stone-100 rounded-sm">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-sans mb-1">Total</p>
          <p className="text-lg font-light text-stone-800">₹{formatINR(stats.total)}</p>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white border border-stone-100 p-6 rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Monthly Trend</h4>
          <div className={`flex items-center gap-1 text-xs ${stats.monthChange > 0 ? 'text-red-400' : 'text-green-500'}`}>
            {stats.monthChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(stats.monthChange).toFixed(1)}% vs last month
          </div>
        </div>
        <div className="flex items-end gap-2 h-24">
          {stats.monthlyData.map(({ month, total }) => {
            const max = Math.max(...stats.monthlyData.map(m => m.total), 1);
            const height = total > 0 ? (total / max) * 100 : 5;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-stone-800 rounded-t-sm"
                  style={{ height: `${height}%`, minHeight: total > 0 ? '4px' : '0' }}
                />
                <span className="text-[8px] text-stone-300">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last 7 Days */}
      <div className="bg-white border border-stone-100 p-6 rounded-sm">
        <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-4">Last 7 Days</h4>
        <div className="flex items-end gap-2 h-20">
          {stats.dailySpending.map(({ day, total }) => {
            const max = Math.max(...stats.dailySpending.map(d => d.total), 1);
            const height = total > 0 ? (total / max) * 100 : 5;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[8px] text-stone-400">₹{formatINR(total)}</span>
                <div 
                  className="w-full bg-stone-200 rounded-t-sm"
                  style={{ height: `${height}%`, minHeight: total > 0 ? '4px' : '0' }}
                />
                <span className="text-[8px] text-stone-300">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Status */}
      {stats.budgetStatus && (
        <div className={`bg-white border p-6 rounded-sm ${isOverBudget ? 'border-red-200' : 'border-stone-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-sans flex items-center gap-2">
              <Target className="w-3 h-3" /> Budget
            </h4>
            <span className={`text-xs ${isOverBudget ? 'text-red-400' : 'text-green-500'}`}>
              {isOverBudget ? 'Over budget!' : 'On track'}
            </span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${isOverBudget ? 'bg-red-400' : 'bg-stone-800'}`}
              style={{ width: `${Math.min(stats.budgetStatus.percent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-400">
            <span>₹{formatINR(stats.budgetStatus.spent)} spent</span>
            <span>₹{formatINR(stats.budgetStatus.budget)} budget</span>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-white border border-stone-100 p-6 rounded-sm">
        <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-4">By Category</h4>
        <div className="space-y-3">
          {stats.categoryBreakdown.map(({ category, total }) => (
            <div key={category} className="flex items-center gap-4">
              <span className="text-xs text-stone-500 w-24 shrink-0">{category}</span>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-stone-800 rounded-full"
                  style={{ width: `${(total / stats.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-stone-400 w-20 text-right">₹{formatINR(total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Expenses */}
      <div className="bg-white border border-stone-100 p-6 rounded-sm">
        <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-4 flex items-center gap-2">
          <Award className="w-3 h-3" /> Largest Expenses
        </h4>
        <div className="space-y-3">
          {stats.topExpenses.map((exp, idx) => (
            <div key={exp.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-300 w-4">{idx + 1}.</span>
                <span className="text-stone-600 italic">{exp.description}</span>
              </div>
              <span className="text-stone-800">₹{formatINR(exp.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-stone-100 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-2">
            <Clock className="w-3 h-3" /> Current Streak
          </div>
          <p className="text-2xl font-light text-stone-800">{stats.streak} days</p>
        </div>
        <div className="bg-white border border-stone-100 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-2">
            <Calendar className="w-3 h-3" /> Transactions
          </div>
          <p className="text-2xl font-light text-stone-800">{expenses.length}</p>
        </div>
      </div>
    </div>
  );
}
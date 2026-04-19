import { Trash2 } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function ExpenseList({ expenses, isSyncing, deleteExpense }) {
  return (
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
                <button onClick={() => {
                  if (window.confirm('Are you sure you want to delete this entry?')) {
                    deleteExpense(exp.id);
                  }
                }} className="opacity-0 group-hover:opacity-100 p-1 text-stone-200 hover:text-red-500 transition-all duration-300">
                  <Trash2 className="w-4 h-4" strokeWidth={1.2} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
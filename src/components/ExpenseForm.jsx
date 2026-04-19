import { ChevronRight, Loader2 } from 'lucide-react';

export default function ExpenseForm({ description, setDescription, amount, setAmount, category, setCategory, categories, date, setDate, isSyncing, onSubmit }) {
  return (
    <section className="bg-white border border-stone-100 p-8 rounded-sm mb-16 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] group hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] transition-all duration-1000">
      <form onSubmit={onSubmit} className="space-y-8">
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
        <input
          type="date"
          className="w-full bg-transparent border-b border-stone-100 py-3 text-sm text-stone-400 focus:border-stone-800 transition-colors outline-none"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          type="submit"
          disabled={isSyncing}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-50 text-stone-50 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-500 font-sans font-bold mt-4 shadow-sm"
        >
          {isSyncing ? 'Saving...' : 'Save'}
        </button>
      </form>
    </section>
  );
}
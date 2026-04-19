import { formatINR } from '../utils/formatters';

export default function Summary({ totals }) {
  return (
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
  );
}
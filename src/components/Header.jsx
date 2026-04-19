import { LogOut, User } from 'lucide-react';

export default function Header({ logout }) {
  return (
    <>
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
            <User className="w-4 h-4 text-stone-300" strokeWidth={1.5} />
          </div>
          {/* <span className="text-[10px] uppercase tracking-widest text-stone-500 font-sans font-bold tracking-[0.2em]">Member</span> */}
        </div>
        <button onClick={logout} className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold flex items-center gap-2">
          <LogOut className="w-3 h-3" /> Logout
        </button>
      </nav>

      <header className="mb-16 text-center">
        <h1 className="text-xs uppercase tracking-[0.3em] text-stone-300 mb-2 font-sans font-medium">Cloud Ledger</h1>
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-light text-stone-900 tracking-tight mb-1 italic leading-tight">SpendWise</h2>
          <div className="w-8 h-[1px] bg-stone-200 my-4"></div>
        </div>
      </header>
    </>
  );
}
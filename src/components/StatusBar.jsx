import { Loader2, Check, CloudOff } from 'lucide-react';

export default function StatusBar({ isSyncing, isOnline }) {
  return (
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
  );
}
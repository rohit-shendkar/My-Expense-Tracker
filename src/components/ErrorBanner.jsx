import { AlertCircle, X } from 'lucide-react';

export default function ErrorBanner({ errorMsg, onClose }) {
  if (!errorMsg) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white border border-stone-100 p-4 shadow-xl rounded-sm flex items-start gap-4">
      <AlertCircle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest font-sans font-bold text-stone-800 mb-1">Notice</p>
        <p className="text-xs text-stone-500 font-sans leading-relaxed">{errorMsg}</p>
      </div>
      <button onClick={onClose} className="text-stone-300 hover:text-stone-800 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
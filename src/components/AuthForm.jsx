import { useState } from 'react';
import { Loader2, LogIn, UserPlus, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function AuthForm({ 
  authMode: initialMode, 
  setAuthMode, 
  errorMsg, 
  isSyncing, 
  onSubmit,
  setError
}) {
  const [authMode, setAuthModeState] = useState(initialMode || 'login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleModeChange = (mode) => {
    setAuthModeState(mode);
    if (setAuthMode) {
      setAuthMode(mode);
    }
    setPasswordInput('');
    if (setError) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (onSubmit) {
      await onSubmit(e, { email: emailInput, password: passwordInput });
    }
  };

  const handlePasswordReset = async () => {
    // If parent provides onSubmit with 'reset' mode, use it
    if (onSubmit) {
      await onSubmit({ preventDefault: () => {} }, { email: emailInput, password: '' });
    }
  };

  const isResetMode = authMode === 'reset';
  const showPassword = !isResetMode;

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 font-serif">
      <div className="max-w-sm w-full space-y-12 animate-in fade-in duration-1000">
        <header className="text-center">
          <h1 className="text-[10px] uppercase tracking-[0.5em] text-stone-300 mb-4 font-sans font-bold">Private Ledger</h1>
          <h2 className="text-5xl font-light text-stone-900 tracking-tight italic">SpendWise</h2>
        </header>
        
        <div className="bg-white border border-stone-100 p-10 rounded-sm shadow-[0_30px_70px_-20px_rgba(0,0,0,0.05)] space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-stone-500 font-sans font-bold">
              {isResetMode ? 'Reset Password' : authMode === 'login' ? 'Member Entry' : 'Create Profile'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-0 bottom-3 w-4 h-4 text-stone-200 group-focus-within:text-stone-800 transition-colors" strokeWidth={1.5} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-stone-100 py-3 pl-8 focus:border-stone-800 transition-all outline-none font-sans text-sm tracking-widest placeholder:text-stone-100"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
              {showPassword && (
                <div className="relative group">
                  <Lock className="absolute left-0 bottom-3 w-4 h-4 text-stone-200 group-focus-within:text-stone-800 transition-colors" strokeWidth={1.5} />
                  <input
                    type="password"
                    placeholder="Security Key"
                    className="w-full bg-transparent border-b border-stone-100 py-3 pl-8 focus:border-stone-800 transition-all outline-none font-sans text-sm tracking-widest placeholder:text-stone-100"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {errorMsg && (
              <p className={`text-[10px] uppercase tracking-widest font-sans text-center leading-relaxed ${errorMsg.includes('sent') ? 'text-green-500' : 'text-red-400'}`}>
                {errorMsg}
              </p>
            )}

            {isResetMode ? (
              <button
                type="button"
                onClick={() => handlePasswordReset()}
                disabled={isSyncing}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-100 text-stone-50 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-500 font-sans font-bold shadow-sm flex items-center justify-center gap-2"
              >
                {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send Reset Link'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSyncing}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-100 text-stone-50 text-[11px] uppercase tracking-[0.2em] py-4 transition-all duration-500 font-sans font-bold shadow-sm flex items-center justify-center gap-2"
              >
                {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : authMode === 'login' ? <LogIn className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                {authMode === 'login' ? 'Access Vault' : 'Create Vault'}
              </button>
            )}
          </form>

          <div className="pt-4 text-center space-y-2">
            {isResetMode ? (
              <button 
                onClick={() => handleModeChange('login')}
                className="text-[10px] uppercase tracking-widest text-stone-300 hover:text-stone-800 transition-colors font-sans font-bold flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </button>
            ) : (
              <>
                {authMode === 'login' && (
                  <button 
                    onClick={() => handleModeChange('reset')}
                    className="text-[10px] uppercase tracking-widest text-stone-300 hover:text-stone-800 transition-colors font-sans font-bold block w-full"
                  >
                    Forgot Password?
                  </button>
                )}
                <button 
                  onClick={() => handleModeChange(authMode === 'login' ? 'signup' : 'login')}
                  className="text-[10px] uppercase tracking-widest text-stone-300 hover:text-stone-800 transition-colors font-sans font-bold underline underline-offset-4"
                >
                  {authMode === 'login' ? 'Register Account' : 'Back to Entry'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
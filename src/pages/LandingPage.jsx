import { ArrowRight, TrendingDown, BarChart3, Shield, Cloud, Wallet } from 'lucide-react';

const features = [
  {
    Icon: Wallet,
    title: 'Track Expenses',
    description: 'Record your daily expenses with category tagging'
  },
  {
    Icon: BarChart3,
    title: 'Analytics',
    description: 'Visualize spending patterns with detailed insights'
  },
  {
    Icon: Cloud,
    title: 'Cloud Sync',
    description: 'Your data synced securely across devices'
  },
  {
    Icon: Shield,
    title: 'Private & Secure',
    description: 'Your financial data encrypted end-to-end'
  }
];

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[#FBFBF9] font-serif">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50 to-transparent opacity-50" />
        
        {/* Nav */}
        <nav className="relative flex justify-between items-center p-6 md:p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center">
              <span className="text-white font-light text-sm">SW</span>
            </div>
            <span className="text-lg text-stone-900 font-light tracking-tight italic">SpendWise</span>
          </div>
          <button 
            onClick={onGetStarted}
            className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors font-sans font-bold"
          >
            Sign In
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-xl mx-auto px-6 py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-stone-900 tracking-tight italic mb-6">
            Smart Expense<br />Tracking
          </h1>
          <p className="text-stone-500 font-light text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Track, analyze, and control your spending with powerful insights. 
            Beautiful finance management made simple.
          </p>
          <button 
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs uppercase tracking-[0.2em] py-4 px-8 transition-all duration-500 font-sans font-bold"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 gap-8 md:gap-12">
          {features.map((feature) => {
            const IconComponent = feature.Icon;
            return (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm text-stone-800 font-medium mb-1">{feature.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 opacity-30">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300 font-sans">
          Quiet Luxury Personal Finance
        </p>
      </footer>
    </div>
  );
}
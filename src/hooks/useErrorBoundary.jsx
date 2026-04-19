import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 font-serif">
          <div className="text-center space-y-4">
            <h1 className="text-2xl text-stone-800">Something went wrong.</h1>
            <p className="text-stone-500 text-sm">Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
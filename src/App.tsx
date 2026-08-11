import React, { useState, useEffect } from 'react';
import { Database, LogIn, LayoutGrid, AlertCircle } from 'lucide-react';
import InventoryDashboard from './components/InventoryDashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Check local storage for existing session
  useEffect(() => {
    const loggedIn = localStorage.getItem('gudangku_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      localStorage.setItem('gudangku_logged_in', 'true');
    } else {
      setLoginError('ACCESS_DENIED: INVALID_CREDENTIALS');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('gudangku_logged_in');
  };

  if (isLoggedIn) {
    return <InventoryDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="h-screen bg-[#111113] text-[#EDEDED] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans antialiased">
      <div className="max-w-md w-full border border-white/10 p-8 sm:p-12 relative flex flex-col bg-[#111113]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ letterSpacing: '-0.05em' }}>
            GUDANG<span className="text-[#5D5FEF]">KU</span>
          </h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-mono mt-4">
            SYSTEM_AUTHENTICATION
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 font-mono uppercase">{loginError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-2 font-mono" htmlFor="username">
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#EDEDED] text-sm focus:outline-none focus:border-[#5D5FEF] transition-colors font-mono rounded-none"
              placeholder="ENTER USERNAME..."
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-2 font-mono" htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#EDEDED] text-sm focus:outline-none focus:border-[#5D5FEF] transition-colors font-mono rounded-none"
              placeholder="ENTER PASSWORD..."
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#5D5FEF] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#4b4cd1] transition-colors focus:outline-none rounded-none"
            >
              AUTHENTICATE
            </button>
          </div>
        </form>

        <div className="mt-10 flex justify-center text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 font-mono">
          <span>U: admin | P: admin</span>
        </div>
      </div>
    </div>
  );
}

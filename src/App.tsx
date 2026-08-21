import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Database,
  LogIn,
  LayoutGrid,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import InventoryDashboard from "./components/InventoryDashboard";
import { db } from "./lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check local storage for existing session
  useEffect(() => {
    const loggedIn = localStorage.getItem("gudangku_logged_in");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsAuthenticating(true);

    // Artificial delay for loading effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (username === "admin" && password === "return") {
      setIsLoggedIn(true);
      setIsAuthenticating(false);
      localStorage.setItem("gudangku_logged_in", "true");
      try {
        await addDoc(collection(db, "audit_logs"), {
          action: "LOGIN",
          details: "Admin logged into the system",
          timestamp: new Date().toISOString(),
          user: username,
        });
      } catch (e) {}
    } else {
      setLoginError("ACCESS_DENIED: INVALID_CREDENTIALS");
      try {
        await addDoc(collection(db, "audit_logs"), {
          action: "LOGIN_FAILED",
          details: `Failed login attempt with username: ${username}`,
          timestamp: new Date().toISOString(),
          user: username,
        });
      } catch (e) {}
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("gudangku_logged_in");
  };

  if (isLoggedIn) {
    return <InventoryDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="h-screen bg-[#111113] text-[#ececec] flex flex-col justify-center items-center p-4 relative overflow-hidden font-['Space_Mono',monospace] antialiased">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full border border-[rgba(236,236,236,0.1)] p-8 sm:p-12 relative flex flex-col bg-black/20"
      >
        <div className="text-center mb-10 border-b border-[rgba(236,236,236,0.1)] pb-8">
          <h1 className="text-4xl font-['Syne'] tracking-[-0.04em] text-[#00f2ff] mb-2 uppercase">
            GUDANGKU_
          </h1>
          <div className="text-[0.6rem] text-[#00f2ff] uppercase tracking-widest mt-[-2px]">
            Owner App Riki
          </div>
          <p className="text-[#ececec]/40 text-[10px] uppercase tracking-[0.2em] mt-4">
            SYSTEM_AUTHENTICATION
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 bg-[#ff3b30]/10 border border-[#ff3b30]/30 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#ff3b30] shrink-0 mt-0.5" />
            <p className="text-xs text-[#ff3b30] uppercase">{loginError}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              className="block text-[10px] text-[#ececec]/50 uppercase tracking-[0.1em] mb-2"
              htmlFor="username"
            >
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-[rgba(236,236,236,0.1)] text-[#ececec] text-sm focus:outline-none focus:border-[#00f2ff] transition-colors"
              placeholder="ENTER USERNAME..."
              required
            />
          </div>

          <div>
            <label
              className="block text-[10px] text-[#ececec]/50 uppercase tracking-[0.1em] mb-2"
              htmlFor="password"
            >
              PASSWORD
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-[rgba(236,236,236,0.1)] text-[#ececec] text-sm focus:outline-none focus:border-[#00f2ff] transition-colors pr-12"
                placeholder="ENTER PASSWORD..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ececec]/50 hover:text-[#00f2ff] transition-colors"
                title={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full flex items-center justify-center gap-2 bg-[#00f2ff] text-[#111113] px-6 py-4 font-bold uppercase hover:bg-opacity-80 transition-all ${isAuthenticating ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <span>AUTHENTICATE</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 flex justify-center text-[10px] uppercase tracking-[0.1em] text-[#ececec]/30">
          <span>U: admin | P: return</span>
        </div>
      </motion.div>
    </div>
  );
}

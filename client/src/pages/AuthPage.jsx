import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Prefill credentials in development for quick testing
  const devDefaults = import.meta.env.DEV
    ? {
        name: 'Test User',
        email: 'test@studyflow.dev',
        password: 'password123'
      }
    : { name: '', email: '', password: '' };

  const [name, setName] = useState(devDefaults.name);
  const [email, setEmail] = useState(devDefaults.email);
  const [password, setPassword] = useState(devDefaults.password);
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setLocalError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      let result;

      if (isLogin) {
        result = await login(email, password);
      } else {
        if (!name.trim()) {
          setLocalError("Name is required.");
          setLoading(false);
          return;
        }

        result = await register(name, email, password);
      }

      if (result && result.success) {
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      } else {
        setLocalError(
          result?.message ||
            "Authentication failed. Please verify credentials."
        );
      }
    } catch (err) {
      setLocalError(
        "Network error. Unable to contact authentication services."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060816] text-white flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_35%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px] opacity-20" />

      {/* Floating Glow */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-violet-600/20 blur-[140px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[140px] rounded-full" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b1020]/80 backdrop-blur-2xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h1 className="mt-4 text-2xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            StudyFlow
          </h1>

          <p className="text-[11px] tracking-[0.3em] uppercase text-slate-500 font-bold mt-1">
            AI Academic System
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
          <button
            onClick={() => {
              setIsLogin(true);
              setLocalError("");
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              isLogin
                ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setIsLogin(false);
              setLocalError("");
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              !isLogin
                ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {localError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{localError}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">
                Full Name
              </label>

              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 blur transition duration-300" />

                <UserIcon className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 z-10" />

                <input
                  type="text"
                  required
                  placeholder="Enter the name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="
                    relative z-10
                    w-full
                    rounded-2xl
                    border border-white/10
                    bg-white/[0.03]
                    backdrop-blur-xl
                    px-12 py-4
                    text-sm
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    transition-all duration-300
                    focus:border-violet-500/40
                    focus:bg-white/[0.05]
                  "
                />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">
              Email Address
            </label>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 blur transition duration-300" />

              <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 z-10" />

              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  relative z-10
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  px-12 py-4
                  text-sm
                  text-white
                  placeholder:text-slate-500
                  outline-none
                  transition-all duration-300
                  focus:border-violet-500/40
                  focus:bg-white/[0.05]
                "
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-1">
              Password
            </label>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 blur transition duration-300" />

              <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 z-10" />

              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  relative z-10
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  px-12 py-4
                  text-sm
                  text-white
                  placeholder:text-slate-500
                  outline-none
                  transition-all duration-300
                  focus:border-violet-500/40
                  focus:bg-white/[0.05]
                "
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              group
              relative
              overflow-hidden
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-violet-500
              to-indigo-500
              py-4
              font-bold
              text-sm
              text-white
              shadow-2xl
              shadow-violet-500/25
              transition-all duration-300
              hover:scale-[1.02]
              hover:shadow-violet-500/40
              active:scale-[0.98]
              disabled:opacity-50
            "
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300" />

            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading
                ? "Authenticating..."
                : isLogin
                ? "Access Dashboard"
                : "Create Account"}

              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">
            Secured JWT Authentication • 256-bit Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
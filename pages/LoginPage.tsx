import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="mesh-gradient"></div>
      <div className="relative w-full max-w-md z-10">
        <div className="glass-card p-8 md:p-12 rounded-2xl shadow-2xl shadow-slate-900/10 border-t-4 border-indigo-500">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              <span className="gradient-text">تسجيل الدخول</span>
            </h1>
            <p className="text-slate-600 mt-2">مرحبًا بك في نظام كشف الحضور</p>
          </div>
          
          {error && (
            <div className="bg-rose-100 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg mb-6 text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-slate-300 bg-slate-100 py-3 px-4 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

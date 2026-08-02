import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        if (data.data.mustChangePassword) {
          alert('Harap segera mengganti password default Anda setelah login demi keamanan!');
        }
        navigate('/admin');
      } else {
        setError(data.message || 'Login gagal. Periksa username dan password.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-navy" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 60%)' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-border-subtle"
      >
        <div className="p-8 pb-6 border-b border-border-subtle flex flex-col items-center bg-sand-dark">
          <div className="w-16 h-16 bg-navy text-gold rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-navy tracking-wide">Admin Portal</h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-2">GPdI Melati Depok</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy uppercase tracking-wider ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-sand-darker/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold focus:bg-white transition-all text-sm text-navy"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-sand-darker/50 border border-border-subtle rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold focus:bg-white transition-all text-sm text-navy"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-navy text-gold font-bold uppercase tracking-wider text-xs rounded-full py-4 flex items-center justify-center gap-2 hover:bg-navy-light transition-colors disabled:opacity-70 mt-4 shadow-sm"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> : 'Masuk ke Dashboard'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-sand-dark text-navy font-bold uppercase tracking-wider text-xs rounded-full py-4 flex items-center justify-center gap-2 hover:bg-sand-darker transition-colors mt-2"
          >
            <ArrowLeft size={16} /> Kembali ke Halaman Public
          </button>
        </form>
      </motion.div>
    </div>
  );
}

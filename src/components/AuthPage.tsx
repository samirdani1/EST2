import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, GraduationCap, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    await new Promise(r => setTimeout(r, 500));

    if (isLogin) {
      const result = login(email, password);
      if (!result.success) setMessage({ type: 'error', text: result.message });
      else setMessage({ type: 'success', text: result.message });
    } else {
      const result = register(name, email, password);
      if (!result.success) setMessage({ type: 'error', text: result.message });
      else setMessage({ type: 'success', text: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-800 to-green-700 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-green-400/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 text-center border border-white/20">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
              <img src="/images/est-logo.png" alt="EST Meknès" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h1 className="text-white font-bold text-xl">Université Moulay Ismaïl</h1>
          <p className="text-green-200 font-semibold text-sm">École Supérieure de Technologie - Meknès</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
            <GraduationCap className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-200 text-sm font-medium">TM-FBA | Section A | S2 2024-2025</span>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isLogin ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                !isLogin ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inscription
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Bon retour ! 👋' : 'Rejoignez-nous ! 🎓'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin 
                ? 'Connectez-vous avec votre email académique'
                : 'Créez votre compte avec votre email académique'
              }
            </p>
          </div>

          {message && (
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 text-sm ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.type === 'error' 
                ? <AlertCircle className="w-4 h-4 shrink-0" />
                : <CheckCircle className="w-4 h-4 shrink-0" />
              }
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nom complet"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="prenom.nom@edu.umi.ac.ma"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Email notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-blue-600 text-xs">
                <strong>Email académique requis :</strong> Votre email doit se terminer par{' '}
                <span className="font-mono font-bold">@edu.umi.ac.ma</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-green-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Connexion...' : 'Inscription...'}
                </span>
              ) : (
                isLogin ? 'Se connecter' : "S'inscrire"
              )}
            </button>
          </form>

          {/* Admin hint */}
          {isLogin && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700 text-xs font-medium">Accès Admin</span>
              </div>
              <p className="text-amber-600 text-xs mt-1">
                Email: <span className="font-mono">admin@edu.umi.ac.ma</span><br/>
                Mot de passe: <span className="font-mono">admin2024</span>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-white/60 text-xs mt-4">
          © 2025 ESTM - Université Moulay Ismaïl, Meknès
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api, AuthUser } from '../services/api';
import { ScudropLogo } from './ScudropLogo';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login(email.trim(), password);
      localStorage.setItem('scudrop_auth_token', response.token);
      localStorage.setItem('scudrop_auth_user', JSON.stringify(response.user));
      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(
        err.message ||
          'Email ou mot de passe incorrect. Vérifiez vos identifiants autorisés.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreFill = () => {
    setEmail('Frscudrop@gmail.com');
    setPassword('Fourat12345;');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100 selection:bg-[#001cd6] selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
            <ScudropLogo size={56} showText={false} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Scudrop FR
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Plateforme privée de gestion des commandes, devises & frais
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-7 shadow-2xl border border-white/20 text-slate-900 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Connexion Sécurisée</h2>
              <p className="text-xs text-slate-500">Accès administrateur exclusif</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#001cd6] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Frscudrop@gmail.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#001cd6] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#001cd6] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Fill Demo Helper Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">Compte Scudrop officiel</span>
              <button
                type="button"
                onClick={handlePreFill}
                className="text-[11px] font-semibold text-[#001cd6] hover:underline cursor-pointer bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100"
              >
                Remplir identifiants
              </button>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à l'application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Accès réservé aux gestionnaires autorisés Scudrop FR</span>
        </div>
      </div>
    </div>
  );
};

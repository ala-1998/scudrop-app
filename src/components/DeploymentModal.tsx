import React, { useState } from 'react';
import {
  X,
  Server,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      id="deployment-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="deployment-modal-container"
        className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#001cd6] text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Architecture & Déploiement Découplé
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#001cd6]">
                  Frontend & Backend Séparés
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Déployez le client (Vercel/Netlify) et le serveur (Render/Railway/VPS) indépendamment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
          {/* Visual Architecture Diagram */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Flux Découplé (Client ↔ API)
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Frontend Card */}
              <div className="flex-1 w-full bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                <div className="inline-flex p-2 rounded-lg bg-indigo-50 text-indigo-600 mb-1.5">
                  <Monitor className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900">Frontend (Client)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  React 19 + Vite + Tailwind CSS
                </p>
                <div className="mt-2 text-[10px] bg-slate-100 py-1 px-2 rounded font-mono text-slate-600">
                  Hébergement : Vercel / Netlify
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center text-slate-400">
                <div className="flex items-center gap-1 font-mono text-[10px] text-[#001cd6] font-semibold">
                  REST API (JSON & Uploads)
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] text-slate-400">CORS Activé</span>
              </div>

              {/* Backend Card */}
              <div className="flex-1 w-full bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs text-center">
                <div className="inline-flex p-2 rounded-lg bg-[#001cd6]/10 text-[#001cd6] mb-1.5">
                  <Server className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900">Backend (Serveur)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Express + Multer + MongoDB / Mongoose
                </p>
                <div className="mt-2 text-[10px] bg-slate-100 py-1 px-2 rounded font-mono text-slate-600">
                  Hébergement : Render / Railway / VPS
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#001cd6]" />
                URL Backend Active côté Frontend
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 text-[#001cd6] font-semibold">
                {API_BASE_URL || '(Même domaine / Relatif : /api)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Lorsque vous déployez le frontend sur Vercel/Netlify, définissez la variable{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-slate-800">
                VITE_API_BASE_URL=https://votre-backend.onrender.com
              </code>
            </p>
          </div>

          {/* Quick Commands */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              Commandes d'Exécution & Compilation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              {/* Dev Backend */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Lancer Backend seul :</span>
                  <code>npm run dev:backend</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run dev:backend', 'dev-backend')}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Copier"
                >
                  {copiedKey === 'dev-backend' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Dev Frontend */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Lancer Frontend seul :</span>
                  <code>npm run dev:frontend</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run dev:frontend', 'dev-frontend')}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Copier"
                >
                  {copiedKey === 'dev-frontend' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Build Backend */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Compiler Backend :</span>
                  <code>npm run build:backend</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run build:backend', 'build-backend')}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Copier"
                >
                  {copiedKey === 'build-backend' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Build Frontend */}
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] block">Compiler Frontend :</span>
                  <code>npm run build:frontend</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run build:frontend', 'build-frontend')}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Copier"
                >
                  {copiedKey === 'build-frontend' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Environment Variables Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
              <span>Variables d'Environnement Requises</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Voir DEPLOYMENT.md pour guide complet
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-[11px]">
              <div className="p-3 flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">VITE_API_BASE_URL</span>
                  <span className="text-slate-500 block text-[10px]">
                    (Côté Frontend) URL de base de votre backend déployé (ex: https://api.scudrop.com)
                  </span>
                </div>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Frontend
                </span>
              </div>
              <div className="p-3 flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">MONGODB_URI</span>
                  <span className="text-slate-500 block text-[10px]">
                    (Côté Backend) Chaîne de connexion MongoDB Atlas (optionnel, fallback JSON si absent)
                  </span>
                </div>
                <span className="bg-[#001cd6]/10 text-[#001cd6] px-2 py-0.5 rounded font-semibold text-[10px]">
                  Backend
                </span>
              </div>
              <div className="p-3 flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">CLIENT_URL</span>
                  <span className="text-slate-500 block text-[10px]">
                    (Côté Backend) URL de votre frontend pour autoriser les requêtes CORS
                  </span>
                </div>
                <span className="bg-[#001cd6]/10 text-[#001cd6] px-2 py-0.5 rounded font-semibold text-[10px]">
                  Backend
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            Un fichier complet <strong>DEPLOYMENT.md</strong> est disponible à la racine du projet.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#001cd6] hover:bg-[#0017b8] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};

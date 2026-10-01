import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Monitor,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Layers,
  ArrowRight,
  ArrowLeftRight,
  Database,
  Globe,
  Cpu,
  Rocket,
  Code2,
  Play,
  Package,
  Zap,
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fermer avec Échap + bloquer le scroll
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      id="deployment-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        id="deployment-modal-container"
        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/30 flex flex-col max-h-[92vh] border border-slate-200 animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════════════════════════════
            HEADER — Hero sombre
        ═══════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
          {/* Décor lumineux */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4 px-6 py-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    Architecture & Déploiement
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                    <Zap className="w-2.5 h-2.5" />
                    Full-Stack
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Frontend et backend découplés — déployez chaque partie indépendamment
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            BODY
        ═══════════════════════════════════════════════════════════ */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
          {/* ── Diagramme d'architecture ───────────────────────── */}
          <section>
            <SectionTitle
              icon={<Layers className="w-3.5 h-3.5" />}
              title="Flux Découplé"
              subtitle="Communication Client ↔ API"
            />

            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 p-5">
              <div className="flex flex-col lg:flex-row items-stretch gap-4">
                {/* Frontend Card */}
                <ArchitectureCard
                  icon={<Monitor className="w-5 h-5" />}
                  badge="Client"
                  badgeColor="indigo"
                  title="Frontend"
                  subtitle="React 19 + Vite + Tailwind"
                  hosting="Vercel / Netlify"
                  dotColor="bg-indigo-500"
                />

                {/* Connecteur central */}
                <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0">
                  <div className="hidden lg:block w-px flex-1 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                  <div className="flex lg:flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-200 shadow-sm flex items-center justify-center text-indigo-600">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div className="lg:text-center">
                      <div className="text-[10px] font-bold text-indigo-700 whitespace-nowrap">
                        REST API
                      </div>
                      <div className="text-[9px] text-slate-500 whitespace-nowrap">
                        JSON + Uploads
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block w-px flex-1 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                </div>

                {/* Backend Card */}
                <ArchitectureCard
                  icon={<Server className="w-5 h-5" />}
                  badge="Serveur"
                  badgeColor="blue"
                  title="Backend"
                  subtitle="Express + Multer + Mongoose"
                  hosting="Render / Railway / VPS"
                  dotColor="bg-blue-500"
                />
              </div>

              {/* CORS note */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px]">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  CORS activé
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Uploads fichiers
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Auth token
                </span>
              </div>
            </div>
          </section>

          {/* ── Statut de configuration ────────────────────────── */}
          <section>
            <SectionTitle
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              title="Configuration Actuelle"
              subtitle="URL backend détectée côté frontend"
            />

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      API_BASE_URL
                    </div>
                    <code className="font-mono text-xs font-bold text-slate-900 break-all">
                      {API_BASE_URL || '(Relatif : /api)'}
                    </code>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200/60 text-[11px] text-slate-700 leading-relaxed">
                💡 Lors du déploiement sur <strong>Vercel / Netlify</strong>, définissez la variable :
                <code
                  onClick={() =>
                    copyToClipboard(
                      'VITE_API_BASE_URL=https://votre-backend.onrender.com',
                      'env-var'
                    )
                  }
                  className="ml-1 inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-blue-200 font-mono text-slate-800 cursor-pointer hover:border-blue-400 transition-colors group"
                >
                  VITE_API_BASE_URL=https://…
                  {copiedKey === 'env-var' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  )}
                </code>
              </div>
            </div>
          </section>

          {/* ── Commandes rapides ──────────────────────────────── */}
          <section>
            <SectionTitle
              icon={<Terminal className="w-3.5 h-3.5" />}
              title="Commandes"
              subtitle="Exécution & compilation"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CommandCard
                icon={<Play className="w-3.5 h-3.5" />}
                label="Dev Backend"
                command="npm run dev:backend"
                copied={copiedKey === 'dev-backend'}
                onCopy={() => copyToClipboard('npm run dev:backend', 'dev-backend')}
              />
              <CommandCard
                icon={<Play className="w-3.5 h-3.5" />}
                label="Dev Frontend"
                command="npm run dev:frontend"
                copied={copiedKey === 'dev-frontend'}
                onCopy={() => copyToClipboard('npm run dev:frontend', 'dev-frontend')}
              />
              <CommandCard
                icon={<Package className="w-3.5 h-3.5" />}
                label="Build Backend"
                command="npm run build:backend"
                copied={copiedKey === 'build-backend'}
                onCopy={() => copyToClipboard('npm run build:backend', 'build-backend')}
              />
              <CommandCard
                icon={<Package className="w-3.5 h-3.5" />}
                label="Build Frontend"
                command="npm run build:frontend"
                copied={copiedKey === 'build-frontend'}
                onCopy={() => copyToClipboard('npm run build:frontend', 'build-frontend')}
              />
            </div>
          </section>

          {/* ── Variables d'environnement ──────────────────────── */}
          <section>
            <SectionTitle
              icon={<Cpu className="w-3.5 h-3.5" />}
              title="Variables d'Environnement"
              subtitle="Configuration par plateforme"
            />

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <EnvRow
                name="VITE_API_BASE_URL"
                description="URL de base de votre backend déployé (ex: https://api.scudrop.com)"
                side="frontend"
              />
              <EnvRow
                name="MONGODB_URI"
                description="Chaîne de connexion MongoDB Atlas (fallback JSON si absent)"
                side="backend"
              />
              <EnvRow
                name="CLIENT_URL"
                description="URL de votre frontend pour autoriser les requêtes CORS"
                side="backend"
                isLast
              />
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════ */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Guide complet dans{' '}
              <strong className="text-slate-700 font-mono">DEPLOYMENT.md</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
═══════════════════════════════════════════════════════════════ */

/* ── Titre de section ─────────────────────────────────────── */
interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  icon,
  title,
  subtitle,
}) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
      {icon}
    </div>
    <div>
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      )}
    </div>
  </div>
);

/* ── Carte d'architecture ─────────────────────────────────── */
interface ArchitectureCardProps {
  icon: React.ReactNode;
  badge: string;
  badgeColor: 'indigo' | 'blue';
  title: string;
  subtitle: string;
  hosting: string;
  dotColor: string;
}

const ArchitectureCard: React.FC<ArchitectureCardProps> = ({
  icon,
  badge,
  badgeColor,
  title,
  subtitle,
  hosting,
  dotColor,
}) => {
  const styles =
    badgeColor === 'indigo'
      ? {
          iconBox: 'bg-indigo-100 text-indigo-700',
          badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          border: 'border-indigo-100 hover:border-indigo-300',
        }
      : {
          iconBox: 'bg-blue-100 text-blue-700',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          border: 'border-blue-100 hover:border-blue-300',
        };

  return (
    <div
      className={`flex-1 bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${styles.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBox}`}
        >
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          {badge}
        </span>
      </div>
      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
      <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
        <Database className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-mono text-slate-600">{hosting}</span>
      </div>
    </div>
  );
};

/* ── Carte de commande ────────────────────────────────────── */
interface CommandCardProps {
  icon: React.ReactNode;
  label: string;
  command: string;
  copied: boolean;
  onCopy: () => void;
}

const CommandCard: React.FC<CommandCardProps> = ({
  icon,
  label,
  command,
  copied,
  onCopy,
}) => (
  <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700/50 hover:border-indigo-500/40 transition-all">
    <div className="flex items-center justify-between gap-3 px-3.5 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-300 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
            {label}
          </div>
          <code className="font-mono text-[11px] text-slate-100 font-semibold truncate block">
            {command}
          </code>
        </div>
      </div>

      <button
        onClick={onCopy}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
          copied
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
        }`}
        title="Copier"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
    {copied && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500 animate-[progress_2.5s_linear]" />
    )}
  </div>
);

/* ── Ligne de variable d'environnement ────────────────────── */
interface EnvRowProps {
  name: string;
  description: string;
  side: 'frontend' | 'backend';
  isLast?: boolean;
}

const EnvRow: React.FC<EnvRowProps> = ({
  name,
  description,
  side,
  isLast,
}) => {
  const sideStyles =
    side === 'frontend'
      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';

  const sideLabel = side === 'frontend' ? 'Frontend' : 'Backend';

  return (
    <div
      className={`flex items-start justify-between gap-4 px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors ${
        !isLast ? 'border-b border-slate-100' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <code className="font-mono font-bold text-xs text-slate-900">
          {name}
        </code>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <span
        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sideStyles}`}
      >
        {sideLabel}
      </span>
    </div>
  );
};
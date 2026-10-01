import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  User,
  Phone,
  Tag,
  Image as ImageIcon,
  Download,
  Maximize2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Order } from '../types';
import { getUploadUrl } from '../config/api';

interface ImageLightboxModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  order,
  onClose,
}) => {
  // Fermer avec Échap + bloquer le scroll body
  useEffect(() => {
    if (!order || !order.screenshot) return;
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
  }, [order, onClose]);

  if (!order || !order.screenshot) return null;

  const imageUrl = getUploadUrl(order.screenshot) || '';
  const isDelivered = order.deliveryStatus === 'Livré';

  return (
    <div
      id="lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        id="lightbox-container"
        className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/40 flex flex-col max-h-[92vh] border border-slate-200 animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════════════════════════════
            HEADER — Hero sombre
        ═══════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
          {/* Décors lumineux */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4 px-6 py-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    Preuve de commande
                  </h2>
                  {order.reference && (
                    <span className="inline-flex items-center font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-indigo-200 border border-white/10">
                      {order.reference}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isDelivered
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                    }`}
                  >
                    {isDelivered ? (
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    ) : (
                      <Clock className="w-2.5 h-2.5" />
                    )}
                    {order.deliveryStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Visualisation du justificatif d'achat ou de validation
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Ouvrir dans un nouvel onglet"
              >
                <Maximize2 className="w-4 h-4" />
              </a>
              <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Télécharger l'image"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                id="lightbox-close-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/30 flex items-center justify-center text-slate-300 hover:text-rose-200 transition-all cursor-pointer"
                title="Fermer (Échap)"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CONTENU — Image
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6 flex items-center justify-center min-h-[320px] relative">
          {/* Quadrillage décoratif subtil */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <img
            src={imageUrl}
            alt={`Capture pour ${order.clientName}`}
            className="relative max-h-[58vh] max-w-full object-contain rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/50 bg-white"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MÉTADONNÉES
        ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white border-t border-slate-100 px-6 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetaCard
              icon={<User className="w-3.5 h-3.5" />}
              label="Client"
              value={order.clientName}
              accent="indigo"
            />
            <MetaCard
              icon={<Phone className="w-3.5 h-3.5" />}
              label="Téléphone"
              value={order.phoneNumber}
              accent="blue"
              href={`tel:${order.phoneNumber}`}
            />
            <MetaCard
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Date commande"
              value={new Date(order.orderDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              accent="violet"
            />
            <MetaCard
              icon={<Tag className="w-3.5 h-3.5" />}
              label="Statut livraison"
              value={order.deliveryStatus}
              accent={isDelivered ? 'emerald' : 'amber'}
              badge
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANT — MetaCard
═══════════════════════════════════════════════════════════════ */
type MetaAccent = 'indigo' | 'blue' | 'violet' | 'emerald' | 'amber';

interface MetaCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: MetaAccent;
  href?: string;
  badge?: boolean;
}

const ACCENT_STYLES: Record<
  MetaAccent,
  { icon: string; label: string; value: string; badge?: string }
> = {
  indigo: {
    icon: 'bg-indigo-100 text-indigo-700',
    label: 'text-indigo-700',
    value: 'text-slate-900',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-700',
    label: 'text-blue-700',
    value: 'text-slate-900',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-700',
    label: 'text-violet-700',
    value: 'text-slate-900',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700',
    label: 'text-emerald-700',
    value: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    label: 'text-amber-700',
    value: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const MetaCard: React.FC<MetaCardProps> = ({
  icon,
  label,
  value,
  accent,
  href,
  badge,
}) => {
  const styles = ACCENT_STYLES[accent];

  const content = (
    <>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.icon}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`text-[10px] font-bold uppercase tracking-wider ${styles.label}`}
        >
          {label}
        </div>
        {badge ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 mt-0.5 rounded-md border ${styles.badge}`}
          >
            {value}
          </span>
        ) : (
          <div
            className={`text-xs font-bold truncate mt-0.5 ${styles.value}`}
            title={value}
          >
            {value}
          </div>
        )}
      </div>
    </>
  );

  const wrapperClass =
    'flex items-center gap-2.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 transition-all';

  if (href) {
    return (
      <a
        href={href}
        className={`${wrapperClass} hover:border-blue-300 group`}
      >
        {content}
      </a>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
};
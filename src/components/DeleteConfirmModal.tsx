import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  // Fermer avec Échap
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isDeleting, onCancel]);

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={() => !isDeleting && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        id="delete-confirm-card"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden animate-[scaleIn_0.2s_ease-out]"
      >
        {/* Bandeau rouge décoratif en haut */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />

        {/* Bouton X en haut à droite */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-7 space-y-5">
          {/* Icône + Titre */}
          <div className="flex items-start gap-4">
            {/* Icône d'alerte avec halo */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-md" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-7 h-7" strokeWidth={2.2} />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3 h-3" />
                  Action irréversible
                </span>
              </div>
              <h3
                id="delete-modal-title"
                className="text-base font-bold text-slate-900 leading-snug"
              >
                {title}
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Encadré d'avertissement */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cette action supprimera définitivement cet élément de votre base de
              données. Il ne pourra <strong className="text-slate-800">pas être restauré</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="group inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Suppression…
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  Supprimer définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { X, ExternalLink, Calendar, User, Phone, Tag } from 'lucide-react';
import { Order } from '../types';
import { getUploadUrl } from '../config/api';

interface ImageLightboxModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ order, onClose }) => {
  if (!order || !order.screenshot) return null;

  const imageUrl = getUploadUrl(order.screenshot) || '';

  return (
    <div
      id="lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="lightbox-container"
        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">Preuve / Capture de commande</span>
              {order.reference && (
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-200 text-slate-700">
                  {order.reference}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisation du justificatif d'achat ou de validation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              id="lightbox-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Image */}
        <div className="flex-1 overflow-auto bg-slate-900/5 p-4 flex items-center justify-center min-h-[300px]">
          <img
            src={imageUrl}
            alt={`Capture pour ${order.clientName}`}
            className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>

        {/* Metadata Footer */}
        <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Client
            </span>
            <span className="font-medium text-slate-800 truncate block mt-0.5">
              {order.clientName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Téléphone
            </span>
            <span className="font-medium text-slate-800 block mt-0.5">
              {order.phoneNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date
            </span>
            <span className="font-medium text-slate-800 block mt-0.5">
              {new Date(order.orderDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Statut
            </span>
            <span
              className={`inline-block font-medium mt-0.5 px-2 py-0.5 rounded text-[11px] ${
                order.deliveryStatus === 'Livré'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.deliveryStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

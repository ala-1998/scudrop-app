import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Calculator,
  User,
  Phone,
  FileText,
  Hash,
  Calendar,
  AlertCircle,
  TrendingUp,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { Order, DeliveryStatus } from '../types';
import { getUploadUrl } from '../config/api';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  orderToEdit: Order | null;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  orderToEdit,
}) => {
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(
    'En cours de livraison'
  );

  // Financial inputs (EUR + Rates)
  const [invoicedPriceForeign, setInvoicedPriceForeign] = useState<number | string>(0);
  const [invoicedPriceRate, setInvoicedPriceRate] = useState<number | string>(3.35);

  const [spentPriceForeign, setSpentPriceForeign] = useState<number | string>(0);
  const [spentPriceRate, setSpentPriceRate] = useState<number | string>(3.35);

  const [transportForeign, setTransportForeign] = useState<number | string>(0);
  const [transportRate, setTransportRate] = useState<number | string>(3.35);

  // Client Advance state (Acompte payé par le client en TND)
  const [advanceTND, setAdvanceTND] = useState<number | string>(0);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize when opening or changing order to edit
  useEffect(() => {
    if (orderToEdit) {
      setClientName(orderToEdit.clientName || '');
      setPhoneNumber(orderToEdit.phoneNumber || '');
      setDescription(orderToEdit.description || '');
      setReference(orderToEdit.reference || '');
      setOrderDate(
        orderToEdit.orderDate
          ? new Date(orderToEdit.orderDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDeliveryStatus(orderToEdit.deliveryStatus || 'En cours de livraison');
      setInvoicedPriceForeign(orderToEdit.invoicedPriceForeign ?? 0);
      setInvoicedPriceRate(orderToEdit.invoicedPriceRate ?? 3.35);
      setSpentPriceForeign(orderToEdit.spentPriceForeign ?? 0);
      setSpentPriceRate(orderToEdit.spentPriceRate ?? 3.35);
      setTransportForeign(orderToEdit.transportForeign ?? 0);
      setTransportRate(orderToEdit.transportRate ?? 3.35);
      setAdvanceTND(orderToEdit.advanceTND ?? 0);
      setPreviewUrl(getUploadUrl(orderToEdit.screenshot) || '');
      setSelectedFile(null);
    } else {
      // Reset defaults
      setClientName('');
      setPhoneNumber('');
      setDescription('');
      setReference(`CMD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryStatus('En cours de livraison');
      setInvoicedPriceForeign(0);
      setInvoicedPriceRate(3.35);
      setSpentPriceForeign(0);
      setSpentPriceRate(3.35);
      setTransportForeign(0);
      setTransportRate(3.35);
      setAdvanceTND(0);
      setSelectedFile(null);
      setPreviewUrl('');
    }
    setFormError(null);
  }, [orderToEdit, isOpen]);

  // Live Auto-calculated TND values
  const calcInvoicedTND = (Number(invoicedPriceForeign) || 0) * (Number(invoicedPriceRate) || 0);
  const calcSpentTND = (Number(spentPriceForeign) || 0) * (Number(spentPriceRate) || 0);
  const calcTransportTND = (Number(transportForeign) || 0) * (Number(transportRate) || 0);
  // Total Billed to Client = Invoiced Items + Transport
  const calcTotalDueTND = calcInvoicedTND + calcTransportTND;
  const numAdvance = Number(advanceTND) || 0;
  const calcRemainingTND = Math.max(0, calcTotalDueTND - numAdvance);
  // Formula: invoicedPriceTND + transportTND - spentPriceTND
  const calcGainTND = calcInvoicedTND + calcTransportTND - calcSpentTND;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setFormError('Le nom du client est obligatoire.');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError('Le numéro de téléphone est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('clientName', clientName.trim());
      formData.append('phoneNumber', phoneNumber.trim());
      formData.append('description', description.trim());
      formData.append('reference', reference.trim());
      formData.append('orderDate', orderDate);
      formData.append('deliveryStatus', deliveryStatus);

      formData.append('invoicedPriceForeign', String(invoicedPriceForeign));
      formData.append('invoicedPriceRate', String(invoicedPriceRate));

      formData.append('spentPriceForeign', String(spentPriceForeign));
      formData.append('spentPriceRate', String(spentPriceRate));

      formData.append('transportForeign', String(transportForeign));
      formData.append('transportRate', String(transportRate));

      formData.append('advanceTND', String(advanceTND));

      if (selectedFile) {
        formData.append('screenshot', selectedFile);
      } else if (orderToEdit && previewUrl) {
        formData.append('screenshot', previewUrl);
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue lors de l’enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="order-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="order-modal-card"
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {orderToEdit ? 'Modifier la Demande / Commande' : 'Nouvelle Demande / Commande'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Renseignez les détails, justificatifs et devises pour calcul instantané en TND
            </p>
          </div>
          <button
            id="order-modal-close"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Informations Client & Commande */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Informations Générales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du Client <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-client-name"
                    type="text"
                    required
                    placeholder="ex: Karim Ben Salem"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-phone-number"
                    type="text"
                    required
                    placeholder="ex: +216 98 450 123"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Référence Commande
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-reference"
                    type="text"
                    placeholder="CMD-2026-001"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de la commande
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-order-date"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description des articles / Demande
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="input-description"
                    type="text"
                    placeholder="Articles commandés, liens, tailles, coloris..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statut de livraison
                </label>
                <select
                  id="select-delivery-status"
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-slate-800 font-medium"
                >
                  <option value="En cours de livraison">En cours de livraison</option>
                  <option value="Livré">Livré</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Upload de la capture d'écran / justificatif */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Capture d'écran / Preuve d'achat (Multer)
            </h3>

            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-colors">
              {previewUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {selectedFile ? selectedFile.name : 'Image enregistrée'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} Ko`
                        : 'Prête pour le tableau de bord'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <label className="text-xs text-slate-900 font-medium hover:underline cursor-pointer">
                        Remplacer l'image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="text-xs text-red-600 font-medium hover:underline cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-3">
                  <Upload className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-800">
                    Cliquez pour téléverser une capture d'écran (PNG, JPG, WEBP)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Téléchargée via Multer sur le serveur Express
                  </span>
                  <input
                    id="input-file-screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Section 3: Calculs Financiers & Taux de Change */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-500" />
                Détails Financiers & Taux de Change
              </h3>
              <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Calculs automatiques en TND
              </span>
            </div>

            {/* 3 Blocks: Facturé, Dépensé, Transport */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Prix Facturé */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-blue-700 block">
                  1. Prix Facturé (Client)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Montant (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={invoicedPriceForeign}
                      onChange={(e) => setInvoicedPriceForeign(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Taux Change</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={invoicedPriceRate}
                      onChange={(e) => setInvoicedPriceRate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total TND:</span>
                  <span className="font-bold text-blue-900">
                    {calcInvoicedTND.toFixed(3)} TND
                  </span>
                </div>
              </div>

              {/* Prix Dépensé */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-amber-700 block">
                  2. Prix Dépensé (Achat)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Montant (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={spentPriceForeign}
                      onChange={(e) => setSpentPriceForeign(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Taux Change</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={spentPriceRate}
                      onChange={(e) => setSpentPriceRate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total TND:</span>
                  <span className="font-bold text-amber-900">
                    {calcSpentTND.toFixed(3)} TND
                  </span>
                </div>
              </div>

              {/* Frais de Transport */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-sky-700 block">
                  3. Transport Facturé
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Montant (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transportForeign}
                      onChange={(e) => setTransportForeign(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Taux Change</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={transportRate}
                      onChange={(e) => setTransportRate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total TND:</span>
                  <span className="font-bold text-sky-900">
                    {calcTransportTND.toFixed(3)} TND
                  </span>
                </div>
              </div>
            </div>

            {/* Live Gain Net Preview banner */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                calcGainTND >= 0
                  ? 'bg-emerald-100/70 border-emerald-200 text-emerald-950'
                  : 'bg-red-100/70 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-xs">
                  Aperçu du Gain Net de la Commande (TND) :
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Facturé + Transport - Dépensé)
                </span>
              </div>
              <span className="text-base font-extrabold tracking-tight">
                {calcGainTND >= 0 ? '+' : ''}
                {calcGainTND.toFixed(3)} TND
              </span>
            </div>
          </div>

          {/* Section 4: Avance Reçue du Client & Reste à Payer */}
          <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#001cd6] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#001cd6]" />
                4. Avance & Règlement Client (TND)
              </h3>
              <span className="text-[11px] font-semibold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                Acompte & Reste à encaisser
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Avance input & quick presets */}
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Avance reçue du client (TND)
                </label>
                <div className="relative">
                  <input
                    id="input-advance-tnd"
                    type="number"
                    step="0.1"
                    min="0"
                    value={advanceTND}
                    onChange={(e) => setAdvanceTND(e.target.value)}
                    placeholder="ex: 50.000"
                    className="w-full pl-3 pr-12 py-2 border border-slate-300 rounded-lg text-sm font-bold text-blue-950 focus:ring-2 focus:ring-[#001cd6] focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">TND</span>
                </div>

                {/* Quick click presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-medium text-slate-400">Raccourcis :</span>
                  <button
                    type="button"
                    onClick={() => setAdvanceTND(0)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
                  >
                    0 DT
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceTND(50)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors cursor-pointer"
                  >
                    50 DT
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceTND(100)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors cursor-pointer"
                  >
                    100 DT
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceTND(Number(calcTotalDueTND.toFixed(3)))}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded transition-colors cursor-pointer"
                  >
                    Totalité ({calcTotalDueTND.toFixed(1)} DT)
                  </button>
                </div>
              </div>

              {/* Financial Balance & Remaining */}
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total client (Articles + Port) :</span>
                    <span className="font-bold text-slate-900">{calcTotalDueTND.toFixed(3)} TND</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Avance payée :</span>
                    <span className="font-bold text-emerald-700">{numAdvance.toFixed(3)} TND</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Reste à payer (Livraison) :</span>
                    <span
                      className={`text-sm font-extrabold ${
                        calcRemainingTND === 0 ? 'text-emerald-600' : 'text-amber-700'
                      }`}
                    >
                      {calcRemainingTND.toFixed(3)} TND
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  {calcRemainingTND === 0 && numAdvance > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      Commande soldée à 100%
                    </span>
                  ) : numAdvance > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                      Acompte de {((numAdvance / (calcTotalDueTND || 1)) * 100).toFixed(0)}% versé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                      Aucune avance versée (Paiement à la livraison)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="order-modal-submit"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#001cd6] hover:bg-[#0017b8] rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isSubmitting
                ? 'Enregistrement...'
                : orderToEdit
                ? 'Mettre à jour la commande'
                : 'Enregistrer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

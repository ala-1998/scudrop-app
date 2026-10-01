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
  TrendingDown,
  Wallet,
  CheckCircle2,
  ShoppingBag,
  Truck,
  Euro,
  Percent,
  Package,
  Loader2,
  Sparkles,
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
  const [invoicedPriceRate, setInvoicedPriceRate] = useState<number | string>(4.5);

  const [spentPriceForeign, setSpentPriceForeign] = useState<number | string>(0);
  const [spentPriceRate, setSpentPriceRate] = useState<number | string>(3.35);

  const [transportForeign, setTransportForeign] = useState<number | string>(0);
  const [transportRate, setTransportRate] = useState<number | string>(3.35);

  const [advanceTND, setAdvanceTND] = useState<number | string>(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fermer avec Échap + bloquer scroll
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handler);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = original;
    };
  }, [isOpen, isSubmitting, onClose]);

  // Sync formulaire
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
      setInvoicedPriceRate(orderToEdit.invoicedPriceRate ?? 4.5);
      setSpentPriceForeign(orderToEdit.spentPriceForeign ?? 0);
      setSpentPriceRate(orderToEdit.spentPriceRate ?? 3.35);
      setTransportForeign(orderToEdit.transportForeign ?? 0);
      setTransportRate(orderToEdit.transportRate ?? 3.35);
      setAdvanceTND(orderToEdit.advanceTND ?? 0);
      setPreviewUrl(getUploadUrl(orderToEdit.screenshot) || '');
      setSelectedFile(null);
    } else {
      setClientName('');
      setPhoneNumber('');
      setDescription('');
      setReference(
        `CMD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
      );
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryStatus('En cours de livraison');
      setInvoicedPriceForeign(0);
      setInvoicedPriceRate(4.5);
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

  // Calculs live
  const calcInvoicedTND =
    (Number(invoicedPriceForeign) || 0) * (Number(invoicedPriceRate) || 0);
  const calcSpentTND =
    (Number(spentPriceForeign) || 0) * (Number(spentPriceRate) || 0);
  const calcTransportTND =
    (Number(transportForeign) || 0) * (Number(transportRate) || 0);
  const calcTotalDueTND = calcInvoicedTND + calcTransportTND;
  const numAdvance = Number(advanceTND) || 0;
  const calcRemainingTND = Math.max(0, calcTotalDueTND - numAdvance);
  const calcGainTND = calcInvoicedTND + calcTransportTND - calcSpentTND;
  const isGainPositive = calcGainTND >= 0;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
      onClick={() => !isSubmitting && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        id="order-modal-card"
        className="bg-white rounded-3xl shadow-2xl shadow-slate-900/30 border border-slate-200 w-full max-w-4xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════════════════════════════
            HEADER — Hero sombre (FIX shrink-0 pour éviter compression)
        ═══════════════════════════════════════════════════════════ */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
          {/* Décors lumineux */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4 px-6 py-5">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              {/* Icône */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                {orderToEdit ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>

              {/* Titre + sous-titre */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-white leading-tight">
                    {orderToEdit ? 'Modifier la commande' : 'Nouvelle commande'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 shrink-0">
                    {orderToEdit ? 'Édition' : 'Création'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Renseignez les détails et les montants — les calculs TND sont instantanés
                </p>
              </div>
            </div>

            {/* Bouton fermer */}
            <button
              id="order-modal-close"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/30 flex items-center justify-center text-slate-300 hover:text-rose-200 transition-all cursor-pointer disabled:opacity-40 shrink-0"
              title="Fermer (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FORM BODY
        ═══════════════════════════════════════════════════════════ */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 space-y-6 flex-1"
        >
          {formError && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs animate-[fadeIn_0.2s_ease-out]">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="pt-0.5">
                <strong className="block font-bold">Erreur</strong>
                <span className="text-red-600">{formError}</span>
              </div>
            </div>
          )}

          {/* ── SECTION 1 : Informations générales ───────────── */}
          <section>
            <SectionTitle
              icon={<User className="w-3.5 h-3.5" />}
              title="Informations Générales"
              subtitle="Client, référence et statut"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                icon={<User className="w-4 h-4" />}
                label="Nom du client"
                required
                value={clientName}
                onChange={setClientName}
                placeholder="ex: Karim Ben Salem"
                id="input-client-name"
              />

              <InputField
                icon={<Phone className="w-4 h-4" />}
                label="Numéro de téléphone"
                required
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="ex: +216 98 450 123"
                id="input-phone-number"
              />

              <InputField
                icon={<Hash className="w-4 h-4" />}
                label="Référence"
                value={reference}
                onChange={setReference}
                placeholder="CMD-2026-001"
                id="input-reference"
                mono
              />

              <InputField
                icon={<Calendar className="w-4 h-4" />}
                label="Date de commande"
                type="date"
                value={orderDate}
                onChange={setOrderDate}
                id="input-order-date"
              />

              <div className="sm:col-span-2">
                <InputField
                  icon={<FileText className="w-4 h-4" />}
                  label="Description des articles"
                  value={description}
                  onChange={setDescription}
                  placeholder="Articles commandés, liens, tailles, coloris..."
                  id="input-description"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Statut de livraison
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <select
                    id="select-delivery-status"
                    value={deliveryStatus}
                    onChange={(e) =>
                      setDeliveryStatus(e.target.value as DeliveryStatus)
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="En cours de livraison">
                      En cours de livraison
                    </option>
                    <option value="Livré">Livré</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 2 : Upload capture ───────────────────── */}
          <section>
            <SectionTitle
              icon={<ImageIcon className="w-3.5 h-3.5" />}
              title="Capture / Preuve d'achat"
              subtitle="Upload via Multer (PNG, JPG, WEBP)"
            />

            <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50/40 p-4">
              {previewUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Aperçu"
                      className="w-24 h-24 object-cover rounded-xl border-2 border-slate-200 shadow-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedFile ? selectedFile.name : 'Image enregistrée'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} Ko`
                        : 'Prête pour le tableau de bord'}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-700 rounded-lg text-[11px] font-bold cursor-pointer transition-all">
                        <Upload className="w-3 h-3" />
                        Remplacer
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-300 text-rose-600 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                      >
                        <X className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Cliquez pour téléverser une capture
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, WEBP — Téléchargée via Multer
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
          </section>

          {/* ── SECTION 3 : Détails financiers ───────────────── */}
          <section>
            <SectionTitle
              icon={<Calculator className="w-3.5 h-3.5" />}
              title="Détails Financiers"
              subtitle="Montants en € + taux de change → calcul TND"
              badge="Auto"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <FinancialBlock
                step="1"
                title="Prix Facturé Client"
                accent="blue"
                icon={<ShoppingBag className="w-4 h-4" />}
                foreignValue={invoicedPriceForeign}
                onForeignChange={setInvoicedPriceForeign}
                rateValue={invoicedPriceRate}
                onRateChange={setInvoicedPriceRate}
                totalTND={calcInvoicedTND}
              />

              <FinancialBlock
                step="2"
                title="Prix Dépensé Achat"
                accent="amber"
                icon={<Euro className="w-4 h-4" />}
                foreignValue={spentPriceForeign}
                onForeignChange={setSpentPriceForeign}
                rateValue={spentPriceRate}
                onRateChange={setSpentPriceRate}
                totalTND={calcSpentTND}
              />

              <FinancialBlock
                step="3"
                title="Transport Facturé"
                accent="sky"
                icon={<Truck className="w-4 h-4" />}
                foreignValue={transportForeign}
                onForeignChange={setTransportForeign}
                rateValue={transportRate}
                onRateChange={setTransportRate}
                totalTND={calcTransportTND}
              />
            </div>

            {/* Aperçu Gain Net */}
            <div
              className={`mt-4 rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                isGainPositive
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    isGainPositive
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                  }`}
                >
                  {isGainPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isGainPositive ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    Gain Net de la commande
                  </div>
                  <div className="text-[11px] text-slate-500">
                    (Facturé + Transport) − Dépensé
                  </div>
                </div>
              </div>
              <div
                className={`text-2xl font-black tracking-tight ${
                  isGainPositive ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {isGainPositive ? '+' : ''}
                {calcGainTND.toFixed(3)}
                <span className="text-sm font-semibold opacity-80 ml-1">TND</span>
              </div>
            </div>
          </section>

          {/* ── SECTION 4 : Avance & Règlement ──────────────── */}
          <section>
            <SectionTitle
              icon={<Wallet className="w-3.5 h-3.5" />}
              title="Avance & Règlement Client"
              subtitle="Acompte versé et reste à encaisser"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Avance + presets */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  Avance reçue (TND)
                </label>

                <div className="relative">
                  <input
                    id="input-advance-tnd"
                    type="number"
                    step="0.1"
                    min="0"
                    value={advanceTND}
                    onChange={(e) => setAdvanceTND(e.target.value)}
                    placeholder="0.000"
                    className="w-full pl-4 pr-16 py-3 bg-white border-2 border-blue-200 rounded-xl text-lg font-black text-blue-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    TND
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Raccourcis
                  </span>
                  <PresetButton onClick={() => setAdvanceTND(0)}>0</PresetButton>
                  <PresetButton onClick={() => setAdvanceTND(50)}>50</PresetButton>
                  <PresetButton onClick={() => setAdvanceTND(100)}>100</PresetButton>
                  <PresetButton
                    onClick={() =>
                      setAdvanceTND(Number(calcTotalDueTND.toFixed(3)))
                    }
                    variant="success"
                  >
                    Totalité ({calcTotalDueTND.toFixed(1)})
                  </PresetButton>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-3">
                <div className="space-y-2.5">
                  <SummaryRow
                    label="Total client (Articles + Port)"
                    value={`${calcTotalDueTND.toFixed(3)} TND`}
                    bold
                  />
                  <SummaryRow
                    label="Avance payée"
                    value={`${numAdvance.toFixed(3)} TND`}
                    valueClass="text-emerald-700"
                  />
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Reste à payer
                      </span>
                      <span
                        className={`text-lg font-black tracking-tight ${
                          calcRemainingTND === 0
                            ? 'text-emerald-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {calcRemainingTND.toFixed(3)} TND
                      </span>
                    </div>
                  </div>
                </div>

                <StatusBadge
                  isSettled={calcRemainingTND === 0 && numAdvance > 0}
                  hasAdvance={numAdvance > 0}
                  advancePercent={
                    numAdvance > 0
                      ? (numAdvance / (calcTotalDueTND || 1)) * 100
                      : 0
                  }
                />
              </div>
            </div>
          </section>

          {/* ── FOOTER ACTIONS ───────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              id="order-modal-submit"
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Enregistrement…
                </>
              ) : orderToEdit ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mettre à jour
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                  Enregistrer la commande
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
═══════════════════════════════════════════════════════════════ */

/* ── Titre de section ────────────────────────────────────── */
interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  icon,
  title,
  subtitle,
  badge,
}) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          {title}
        </h3>
        {badge && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[10px] text-slate-500">{subtitle}</p>
      )}
    </div>
  </div>
);

/* ── Champ de saisie avec icône ─────────────────────────── */
interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  mono?: boolean;
  id?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  mono,
  id,
}) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
          mono ? 'font-mono' : ''
        }`}
      />
    </div>
  </div>
);

/* ── Bloc financier (€ + taux → TND) ────────────────────── */
type FinancialAccent = 'blue' | 'amber' | 'sky';

interface FinancialBlockProps {
  step: string;
  title: string;
  accent: FinancialAccent;
  icon: React.ReactNode;
  foreignValue: number | string;
  onForeignChange: (val: string) => void;
  rateValue: number | string;
  onRateChange: (val: string) => void;
  totalTND: number;
}

const ACCENT_MAP: Record<
  FinancialAccent,
  { iconBox: string; title: string; total: string; ring: string }
> = {
  blue: {
    iconBox: 'bg-blue-100 text-blue-700',
    title: 'text-blue-800',
    total: 'text-blue-900',
    ring: 'focus:ring-blue-500 focus:border-blue-500',
  },
  amber: {
    iconBox: 'bg-amber-100 text-amber-700',
    title: 'text-amber-800',
    total: 'text-amber-900',
    ring: 'focus:ring-amber-500 focus:border-amber-500',
  },
  sky: {
    iconBox: 'bg-sky-100 text-sky-700',
    title: 'text-sky-800',
    total: 'text-sky-900',
    ring: 'focus:ring-sky-500 focus:border-sky-500',
  },
};

const FinancialBlock: React.FC<FinancialBlockProps> = ({
  step,
  title,
  accent,
  icon,
  foreignValue,
  onForeignChange,
  rateValue,
  onRateChange,
  totalTND,
}) => {
  const styles = ACCENT_MAP[accent];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.iconBox}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400">
              {step}.
            </span>
            <h4
              className={`text-[11px] font-bold uppercase tracking-wider truncate ${styles.title}`}
            >
              {title}
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Euro className="w-2.5 h-2.5" />
            Montant €
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={foreignValue}
            onChange={(e) => onForeignChange(e.target.value)}
            className={`w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${styles.ring}`}
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Percent className="w-2.5 h-2.5" />
            Taux
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={rateValue}
            onChange={(e) => onRateChange(e.target.value)}
            className={`w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${styles.ring}`}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Total TND
        </span>
        <span className={`text-sm font-black tracking-tight ${styles.total}`}>
          {totalTND.toFixed(3)}
        </span>
      </div>
    </div>
  );
};

/* ── Bouton preset ───────────────────────────────────────── */
interface PresetButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'success';
}

const PresetButton: React.FC<PresetButtonProps> = ({
  onClick,
  children,
  variant = 'default',
}) => {
  const styles =
    variant === 'success'
      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200'
      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${styles}`}
    >
      {children}
    </button>
  );
};

/* ── Ligne récap ─────────────────────────────────────────── */
interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  bold,
  valueClass = 'text-slate-900',
}) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-slate-500">{label}</span>
    <span className={`font-bold ${valueClass} ${bold ? 'text-sm' : ''}`}>
      {value}
    </span>
  </div>
);

/* ── Badge statut paiement ───────────────────────────────── */
interface StatusBadgeProps {
  isSettled: boolean;
  hasAdvance: boolean;
  advancePercent: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  isSettled,
  hasAdvance,
  advancePercent,
}) => {
  if (isSettled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-[11px] font-bold text-emerald-800">
          Commande soldée à 100%
        </span>
      </div>
    );
  }

  if (hasAdvance) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-blue-800">
          <span className="uppercase tracking-wider">Acompte versé</span>
          <span>{advancePercent.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(100, advancePercent)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
      <span className="text-[11px] font-bold text-amber-800">
        Paiement à la livraison
      </span>
    </div>
  );
};
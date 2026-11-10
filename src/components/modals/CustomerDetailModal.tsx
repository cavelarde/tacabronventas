import React, { useState } from 'react';
import { Customer } from '../../types';
import { formatCurrency, getTierBadgeColor, generateWhatsAppMessage, sanitizePhone } from '../../utils/loyalty';
import { X, Send, Award, Calendar, Receipt, Sparkles, Phone, FileText } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  onRedeemPoints: (customerDoc: string, pointsToRedeem: number, rewardDesc: string) => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onRedeemPoints,
  onEditCustomer,
}) => {
  const [selectedPromo, setSelectedPromo] = useState<'taco' | 'descuento' | 'puntos' | 'saludo'>('taco');

  if (!customer) return null;

  const badge = getTierBadgeColor(customer.nivel);
  const ticketPromedio = customer.visitas > 0 ? Math.round(customer.totalGastado / customer.visitas) : 0;
  const telLimpio = sanitizePhone(customer.phone || '');

  // Progress to next tier
  let nextTierName = '';
  let currentProgress = 100;
  let remainingVisitas = 0;
  let remainingGasto = 0;

  if (customer.nivel === 'Bronce') {
    nextTierName = 'Plata';
    currentProgress = Math.min(100, Math.round((customer.visitas / 3) * 100));
    remainingVisitas = Math.max(0, 3 - customer.visitas);
    remainingGasto = Math.max(0, 60000 - customer.totalGastado);
  } else if (customer.nivel === 'Plata') {
    nextTierName = 'Oro';
    currentProgress = Math.min(100, Math.round((customer.visitas / 6) * 100));
    remainingVisitas = Math.max(0, 6 - customer.visitas);
    remainingGasto = Math.max(0, 150000 - customer.totalGastado);
  } else if (customer.nivel === 'Oro') {
    nextTierName = 'VIP Diamante';
    currentProgress = Math.min(100, Math.round((customer.visitas / 10) * 100));
    remainingVisitas = Math.max(0, 10 - customer.visitas);
    remainingGasto = Math.max(0, 300000 - customer.totalGastado);
  }

  const handleSendWhatsApp = () => {
    if (!telLimpio) {
      alert('El cliente no tiene teléfono configurado.');
      return;
    }
    const msg = generateWhatsAppMessage(customer, selectedPromo);
    window.open(`https://wa.me/${telLimpio}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-2xl p-5 sm:p-6 space-y-4 border-amber-500/40 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
              {badge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{customer.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border} flex items-center gap-1`}>
                  <span>{badge.icon}</span>
                  <span>{customer.nivel}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                C.C. / Doc: <span className="font-mono text-slate-200 font-bold">{customer.doc}</span> · Tel:{' '}
                <span className="font-mono text-slate-200">{customer.phone || 'Sin registrar'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 KPIs de Fidelización (Compras + Visitas + Ticket Promedio + Puntos) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Visitas Totales</span>
            <p className="text-xl font-black font-mono text-white mt-0.5 flex items-baseline gap-1">
              <span>{customer.visitas}</span>
              <span className="text-[10px] font-normal text-slate-400">veces</span>
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Compras Acumuladas</span>
            <p className="text-lg font-black font-mono text-emerald-400 mt-0.5">
              {formatCurrency(customer.totalGastado)}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ticket Promedio</span>
            <p className="text-lg font-black font-mono text-amber-400 mt-0.5">
              {formatCurrency(ticketPromedio)}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 bg-amber-950/10">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Puntos Acumulados</span>
            <p className="text-xl font-black font-mono text-amber-300 mt-0.5 flex items-baseline gap-1">
              <span>{customer.puntos}</span>
              <span className="text-[10px] font-normal text-amber-400/80">pts</span>
            </p>
          </div>
        </div>

        {/* Barra de progreso de nivel */}
        {nextTierName ? (
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Progreso hacia nivel <b className="text-amber-400">{nextTierName}</b>
              </span>
              <span className="font-mono font-bold text-amber-400">{currentProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Faltan <b className="text-slate-200">{remainingVisitas} visita{remainingVisitas !== 1 ? 's' : ''}</b> o{' '}
              <b className="text-slate-200">{formatCurrency(remainingGasto)}</b> para subir de categoría.
            </p>
          </div>
        ) : (
          <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <Award className="w-4 h-4 shrink-0 text-amber-400" />
            <span>¡Cliente en la máxima categoría! Disfruta de beneficios VIP y cortesías de la casa.</span>
          </div>
        )}

        {/* Canje rápido de puntos */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Canje de Beneficios de Fidelidad (Saldo: {customer.puntos} pts)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onRedeemPoints(customer.doc, 30, 'Bebida o Agua Fresca')}
              disabled={customer.puntos < 30}
              className={`p-2 rounded-lg text-left border transition ${
                customer.puntos >= 30
                  ? 'bg-slate-950 border-amber-500/40 hover:border-amber-400 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-amber-300">🥤 Agua Fresca (30 pts)</div>
              <div className="text-[10px] text-slate-400">Horchata, Jamaica o Soda</div>
            </button>

            <button
              onClick={() => onRedeemPoints(customer.doc, 50, 'Taco Tradicional')}
              disabled={customer.puntos < 50}
              className={`p-2 rounded-lg text-left border transition ${
                customer.puntos >= 50
                  ? 'bg-slate-950 border-amber-500/40 hover:border-amber-400 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-amber-300">🌮 Taco Gratis (50 pts)</div>
              <div className="text-[10px] text-slate-400">Pastor, Birria o Carnitas</div>
            </button>

            <button
              onClick={() => onRedeemPoints(customer.doc, 100, 'Nachos o Quesadilla')}
              disabled={customer.puntos < 100}
              className={`p-2 rounded-lg text-left border transition ${
                customer.puntos >= 100
                  ? 'bg-slate-950 border-amber-500/40 hover:border-amber-400 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="font-bold text-amber-300">🧀 Nachos Cabrones (100 pts)</div>
              <div className="text-[10px] text-slate-400">Plato fuerte o quesadilla</div>
            </button>
          </div>
        </div>

        {/* Acciones de WhatsApp Fidelización */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              Enviar Promo o Saludo por WhatsApp
            </span>
            <span className="text-[11px] text-slate-400">
              Tel: {customer.phone || 'Sin número'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedPromo('taco')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPromo === 'taco'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🌮 Invitación Taco
            </button>
            <button
              onClick={() => setSelectedPromo('descuento')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPromo === 'descuento'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🎟️ 15% Descuento
            </button>
            <button
              onClick={() => setSelectedPromo('puntos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPromo === 'puntos'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Saldo Puntos
            </button>
            <button
              onClick={() => setSelectedPromo('saludo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedPromo === 'saludo'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              👋 Saludo Fidelidad
            </button>
          </div>

          <button
            onClick={handleSendWhatsApp}
            disabled={!telLimpio}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            <span>Abrir WhatsApp con Mensaje Personalizado de Fidelidad</span>
          </button>
        </div>

        {/* Notas y Platillos Favoritos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Platillos Favoritos</span>
            {customer.favoritos && customer.favoritos.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {customer.favoritos.map((fav, i) => (
                  <span key={i} className="bg-slate-900 border border-slate-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {fav}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-[11px]">Se registrarán con sus próximas compras.</p>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Notas del Cliente</span>
            <p className="text-slate-300 text-[11px] italic">
              {customer.notasFidelizacion || 'Sin notas especiales registradas.'}
            </p>
          </div>
        </div>

        {/* Historial de Compras */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              Historial de Comandas y Pagos ({customer.historialCompras?.length || 0})
            </h4>
            <span className="text-[10px] text-slate-400">
              Última visita: {customer.ultimaVisita || 'Hoy'}
            </span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-xs">
            {!customer.historialCompras || customer.historialCompras.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                Aún no hay comandas desglosadas archivadas para este cliente.
              </p>
            ) : (
              customer.historialCompras.map((h, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{h.orderId}</span>
                      <span className="text-slate-400 text-[11px]">· {h.mesa}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {h.metodoPago}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {h.items.join(', ')}
                    </p>
                    <p className="text-[10px] text-slate-500">{h.fecha}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {formatCurrency(h.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            onClick={() => onEditCustomer(customer)}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editar Datos / Notas</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

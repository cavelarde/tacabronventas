import React, { useState, useEffect } from 'react';
import { Order, Customer } from '../../types';
import { formatCurrency, calculateLoyaltyTier } from '../../utils/loyalty';
import confetti from 'canvas-confetti';
import { X, Check, CreditCard, Banknote, Smartphone, Crown, UserCheck } from 'lucide-react';

interface CheckoutModalProps {
  order: Order | null;
  customers: Customer[];
  onClose: () => void;
  onConfirmPayment: (
    paidOrder: Order,
    customerData: { doc: string; name: string; phone: string }
  ) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  order,
  customers,
  onClose,
  onConfirmPayment,
}) => {
  const [doc, setDoc] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [pagaCon, setPagaCon] = useState<string>('');
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setDoc(order.customer?.doc || '');
      setName(order.customer?.name || '');
      setPhone(order.customer?.phone || '');
      setPaymentMethod('Efectivo');
      setPagaCon('');
      setMatchedCustomer(null);
    }
  }, [order]);

  if (!order) return null;

  const total = order.total;
  const pagaConNum = parseFloat(pagaCon) || 0;
  const cambio = Math.max(0, pagaConNum - total);

  // Live autocomplete on customer search
  const handleDocChange = (val: string) => {
    setDoc(val);
    const query = val.trim().toLowerCase();
    if (query.length >= 3) {
      const match = customers.find(
        (c) =>
          c.doc.toLowerCase().includes(query) ||
          (c.phone && c.phone.includes(query)) ||
          c.name.toLowerCase().includes(query)
      );
      if (match) {
        setMatchedCustomer(match);
        setName(match.name);
        setPhone(match.phone || '');
        return;
      }
    }
    setMatchedCustomer(null);
  };

  const handleConsumidorFinal = () => {
    setDoc('222222222222');
    setName('Consumidor Final');
    setPhone('0000000');
    setMatchedCustomer(null);
  };

  const handlePay = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const cDoc = doc.trim() || '222222222222';
    const cName = name.trim() || 'Consumidor Final';
    const cPhone = phone.trim() || '0000000';

    const paidOrder: Order = {
      ...order,
      paymentStatus: 'paid',
      paymentMethod,
      paidAt: new Date().toISOString(),
      customer: {
        doc: cDoc,
        name: cName,
        phone: cPhone,
      },
    };

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      console.debug('Confetti error', e);
    }

    await onConfirmPayment(paidOrder, { doc: cDoc, name: cName, phone: cPhone });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-lg p-5 sm:p-6 space-y-4 border-amber-500/40 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-600 bg-[#c41212] shrink-0">
              <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-1.5">
              <span>Cobrar Mesa:</span>
              <span className="text-amber-400 font-mono">{order.tableName}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detalles de comanda */}
        <div className="space-y-1.5 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
          <div className="flex justify-between font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">
            <span>Orden: {order.id}</span>
            <span>
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between py-0.5">
              <span>
                {i.qty}x {i.name}
              </span>
              <span className="font-mono text-slate-300">{formatCurrency(i.price * i.qty)}</span>
            </div>
          ))}
        </div>

        {/* Fidelización: Datos del cliente con autocompletado y suma de compras/visitas */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1">
              <span>👤</span> Datos del Cliente (Fidelización & Factura)
            </label>
            <button
              type="button"
              onClick={handleConsumidorFinal}
              className="text-[10px] text-slate-400 hover:text-amber-300 underline font-semibold transition"
            >
              Consumidor Final (Sin datos)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">
                C.C. / NIT / Doc:
              </label>
              <input
                type="text"
                value={doc}
                onChange={(e) => handleDocChange(e.target.value)}
                placeholder="Ej. 10203040"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">
                Nombre Completo:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">
                Teléfono (WhatsApp):
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 3001234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {matchedCustomer && (
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Cliente Frecuente: <b>{matchedCustomer.name}</b> ({matchedCustomer.nivel})
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-300">
                {matchedCustomer.visitas} visitas previas · {formatCurrency(matchedCustomer.totalGastado)}
              </span>
            </div>
          )}

          {doc && doc !== '222222222222' && (
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Esta compra de {formatCurrency(total)} se sumará a su acumulado y sumará 1 visita.</span>
            </p>
          )}
        </div>

        {/* Método de Pago y Cambio */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Efectivo')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'Efectivo'
                    ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Tarjeta')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'Tarjeta'
                    ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tarjeta</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Transferencia')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'Transferencia'
                    ? 'border border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Transf.</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'Efectivo' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400">Paga con ($):</label>
              <input
                type="number"
                value={pagaCon}
                onChange={(e) => setPagaCon(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-between items-center text-xs font-bold bg-slate-900/60 p-2 rounded-lg">
                <span className="text-slate-400">Cambio / Vueltos:</span>
                <span className="text-emerald-400 font-mono text-base">{formatCurrency(cambio)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-extrabold pt-2 border-t border-slate-800">
            <span className="text-slate-400">TOTAL FACTURA:</span>
            <span className="text-2xl font-mono text-amber-400">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={isSubmitting}
            className="w-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Facturando...' : 'FACTURAR & PAGAR'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

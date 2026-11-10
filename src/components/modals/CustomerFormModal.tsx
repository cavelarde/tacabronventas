import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { calculateLoyaltyTier } from '../../utils/loyalty';
import { X, UserPlus, Save } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  customerToEdit: Customer | null;
  onClose: () => void;
  onSaveCustomer: (customer: Customer) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customerToEdit,
  onClose,
  onSaveCustomer,
}) => {
  const [doc, setDoc] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [visitas, setVisitas] = useState(1);
  const [totalGastado, setTotalGastado] = useState(0);
  const [notasFidelizacion, setNotasFidelizacion] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
    if (customerToEdit) {
      setDoc(customerToEdit.doc);
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone || '');
      setEmail(customerToEdit.email || '');
      setVisitas(customerToEdit.visitas || 1);
      setTotalGastado(customerToEdit.totalGastado || 0);
      setNotasFidelizacion(customerToEdit.notasFidelizacion || '');
    } else {
      setDoc('');
      setName('');
      setPhone('');
      setEmail('');
      setVisitas(1);
      setTotalGastado(0);
      setNotasFidelizacion('');
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!doc.trim() || !name.trim()) {
      setFormError('Por favor completa el documento y nombre completo del cliente.');
      return;
    }

    const calculatedTier = calculateLoyaltyTier(visitas, totalGastado);
    const puntos = Math.floor(totalGastado / 1000);

    const saved: Customer = {
      ...(customerToEdit || {}),
      doc: doc.trim(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      visitas: Number(visitas) || 1,
      totalGastado: Number(totalGastado) || 0,
      puntos: customerToEdit ? (customerToEdit.puntos || puntos) : puntos,
      nivel: calculatedTier,
      ultimaVisita: customerToEdit?.ultimaVisita || new Date().toISOString().replace('T', ' ').substring(0, 16),
      primeraVisita: customerToEdit?.primeraVisita || new Date().toISOString().split('T')[0],
      notasFidelizacion: notasFidelizacion.trim(),
      favoritos: customerToEdit?.favoritos || [],
      historialCompras: customerToEdit?.historialCompras || []
    };

    onSaveCustomer(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="glass-card w-full max-w-md p-5 sm:p-6 space-y-4 border-amber-500/40">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>{customerToEdit ? 'Editar Cliente Frecuente' : 'Registrar Nuevo Cliente'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              Cédula / NIT / Documento <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder="Ej. 10203040"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              Nombre Completo <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Teléfono (WhatsApp)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 3001234567"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Visitas Acumuladas</label>
              <input
                type="number"
                min="1"
                value={visitas}
                onChange={(e) => setVisitas(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-emerald-400 font-bold mb-1">Compras Acumuladas ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={totalGastado}
                onChange={(e) => setTotalGastado(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              Notas de Fidelización (Preferencias, Cumpleaños, Alergias)
            </label>
            <textarea
              rows={2}
              value={notasFidelizacion}
              onChange={(e) => setNotasFidelizacion(e.target.value)}
              placeholder="Ej. Le gusta extra picante, cumple el 15 de Octubre..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-900 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

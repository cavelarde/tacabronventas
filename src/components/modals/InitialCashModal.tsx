import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/loyalty';

interface InitialCashModalProps {
  isOpen: boolean;
  initialCash: number;
  onClose: () => void;
  onSave: (amount: number) => void;
}

export const InitialCashModal: React.FC<InitialCashModalProps> = ({
  isOpen,
  initialCash,
  onClose,
  onSave,
}) => {
  const [val, setVal] = useState<string>(initialCash.toString());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setError(null);
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      setError('Ingresa un monto de efectivo válido.');
      return;
    }
    onSave(num);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-sm p-5 space-y-3 border-amber-500/40">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Fijar Base Inicial de Caja</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">Monto de efectivo con el que abre la caja en el turno.</p>

        {error && (
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Monto en Efectivo ($)</label>
          <input
            type="number"
            step="1000"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="100000"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-base font-bold font-mono text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="w-1/2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2 rounded-xl text-xs transition"
          >
            Guardar Base
          </button>
        </div>
      </div>
    </div>
  );
};

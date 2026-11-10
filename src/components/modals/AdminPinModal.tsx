import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2 } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setError('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === '1234') {
          onSuccess();
          setPin('');
          setError('');
        } else {
          setError('PIN incorrecto. Intenta con 1234');
        }
      }
    }
  };

  const handleBackspace = () => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPin('');
  };

  const handleQuickUnlock = () => {
    onSuccess();
    setPin('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-xs p-5 space-y-4 border-amber-500/40 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Acceso a Caja & Admin</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 mx-auto rounded-xl overflow-hidden border-2 border-red-600 shadow-lg shadow-red-900/40 bg-[#c41212] flex items-center justify-center">
          <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
        </div>

        <p className="text-xs text-slate-400">
          Ingresa el PIN de Administrador para desbloquear el panel y control de fidelización:
        </p>

        {/* Display PIN */}
        <div>
          <div className="flex justify-center items-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-2xl">
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  idx < pin.length
                    ? 'bg-amber-400 shadow-md shadow-amber-500/40 scale-110'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>
          {error && <p className="text-rose-400 text-xs font-bold mt-1.5">{error}</p>}
        </div>

        {/* Teclado numérico táctil */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-black text-base text-white transition active:scale-95 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-rose-950/40 text-rose-400 font-bold text-xs transition"
          >
            Limpiar
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-black text-base text-white transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800 font-bold text-sm text-slate-300 transition"
          >
            ⌫
          </button>
        </div>

        {/* Botón de acceso rápido (1234) para conveniencia inmediata */}
        <button
          onClick={handleQuickUnlock}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Acceso Rápido Administrador (1234)</span>
        </button>
      </div>
    </div>
  );
};

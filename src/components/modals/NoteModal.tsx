import React, { useState, useEffect } from 'react';
import { X, Edit3, Check } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  itemName: string;
  initialNote: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  itemName,
  initialNote,
  onClose,
  onSave,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim());
    onClose();
  };

  const QUICK_NOTES = ['Sin cebolla', 'Salsa aparte', 'Extra picante', 'Término medio', 'Bien dorado', 'Para llevar'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-sm p-5 space-y-4 border-amber-500/40">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Nota de Cocina</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Especificaciones para <span className="text-amber-400 font-bold">{itemName}</span>:
        </p>

        {/* Sugerencias Rápidas */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_NOTES.map((qn) => (
            <button
              key={qn}
              type="button"
              onClick={() => setNote((prev) => (prev ? `${prev}, ${qn}` : qn))}
              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[10px] hover:text-amber-300 hover:border-amber-500/40 transition"
            >
              +{qn}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej. Sin cilantro, carne bien cocida..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Nota</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { PROTEINAS_COMBO, getComboTacosCount } from '../../data/initialData';
import { formatCurrency } from '../../utils/loyalty';
import { X, Sparkles, Check, Utensils } from 'lucide-react';

interface ComboProteinModalProps {
  isOpen: boolean;
  comboItem: MenuItem | null;
  tableName: string;
  onClose: () => void;
  onConfirm: (item: MenuItem, formattedNote: string) => void;
}

export const ComboProteinModal: React.FC<ComboProteinModalProps> = ({
  isOpen,
  comboItem,
  tableName,
  onClose,
  onConfirm,
}) => {
  const [tacoProteins, setTacoProteins] = useState<string[]>([]);
  const [extraNote, setExtraNote] = useState('');

  const tacosCount = comboItem ? getComboTacosCount(comboItem) : 4;

  useEffect(() => {
    if (comboItem) {
      const count = getComboTacosCount(comboItem);
      // Valores por defecto surtidos
      const defaults = [
        'Pastor (Bondiola de Cerdo)',
        'Suadero (Sobrebarriga)',
        'Carnitas (Pernil Cerdo)',
        'Birria (Costilla de Res)',
        'Tinga de Pollo',
        'Lengua de Res',
        'Chicharrón Crujiente',
        'Tripa (Chunchurria)'
      ];

      const initial: string[] = [];
      for (let i = 0; i < count; i++) {
        if (comboItem.name.toLowerCase().includes('birria')) {
          initial.push('Birria (Costilla de Res)');
        } else {
          initial.push(defaults[i % defaults.length]);
        }
      }
      setTacoProteins(initial);
      setExtraNote('');
    }
  }, [comboItem]);

  if (!isOpen || !comboItem) return null;

  const handleSelectProtein = (index: number, protein: string) => {
    setTacoProteins((prev) => {
      const updated = [...prev];
      updated[index] = protein;
      return updated;
    });
  };

  const handleSetAllTo = (protein: string) => {
    setTacoProteins(new Array(tacosCount).fill(protein));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Formatear nota compacta para cocina y ticket
    // Ejemplo: "T1: Pastor, T2: Suadero, T3: Carnitas, T4: Birria"
    const breakdown = tacoProteins
      .map((p, idx) => `T${idx + 1}: ${p.split('(')[0].trim()}`)
      .join(' · ');

    let finalNote = `🌮 ${breakdown}`;
    if (extraNote.trim()) {
      finalNote += ` [Nota: ${extraNote.trim()}]`;
    }

    onConfirm(comboItem, finalNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl my-auto text-slate-100">
        
        {/* Cabecera */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-slate-950">
              <img src={comboItem.image} alt={comboItem.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-white">{comboItem.name}</h3>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {formatCurrency(comboItem.price)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mesa: <strong className="text-amber-300">{tableName}</strong> · Elige las proteínas para los{' '}
                <strong className="text-emerald-400">{tacosCount} tacos</strong>:
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Atajo rápido: Todos iguales */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>¿Todos del mismo sabor?:</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {['Pastor', 'Suadero', 'Carnitas', 'Birria'].map((sabor) => {
              const fullProtein = PROTEINAS_COMBO.find((p) => p.toLowerCase().includes(sabor.toLowerCase())) || sabor;
              return (
                <button
                  key={sabor}
                  type="button"
                  onClick={() => handleSetAllTo(fullProtein)}
                  className="bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-200 px-2 py-1 rounded-md text-[11px] font-bold border border-slate-700 transition"
                >
                  Todos {sabor}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de desplegables (1 por cada taco del combo) */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
            {tacoProteins.map((currentProtein, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center gap-2 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor={`combo-taco-select-${idx}`} className="text-[11px] font-bold text-slate-300 block mb-0.5">
                    Taco {idx + 1}:
                  </label>
                  <select
                    id={`combo-taco-select-${idx}`}
                    value={currentProtein}
                    onChange={(e) => handleSelectProtein(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none transition"
                  >
                    {PROTEINAS_COMBO.map((prot) => (
                      <option key={prot} value={prot} className="bg-slate-900 text-white">
                        {prot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Nota opcional para cocina */}
          <div>
            <label htmlFor="combo-extra-note" className="text-[11px] font-bold text-slate-400 block mb-1">
              Observaciones adicionales para cocina (opcional):
            </label>
            <input
              id="combo-extra-note"
              type="text"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              placeholder="Ej: Sin cebolla, cilantro aparte, consomé extra caliente..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Agregar a {tableName}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

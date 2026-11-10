import React, { useState } from 'react';
import { MenuItem, CartItem, Order } from '../types';
import { TABLES, CATEGORIES, getComboTacosCount } from '../data/initialData';
import { formatCurrency } from '../utils/loyalty';
import { Search, Trash2, Edit3, Plus, Minus, Send, CheckCircle2 } from 'lucide-react';
import { ComboProteinModal } from './modals/ComboProteinModal';

interface PosViewProps {
  menu: MenuItem[];
  orders: Order[];
  selectedTable: string;
  onSelectTable: (table: string) => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem, customNote?: string) => void;
  onChangeQty: (itemId: number, delta: number, note?: string) => void;
  onEditNote: (itemId: number, note?: string) => void;
  onClearCart: () => void;
  onSendToKitchen: () => void;
  onOpenCheckout: (tableName: string) => void;
  tableCarts: { [table: string]: CartItem[] };
}

export const PosView: React.FC<PosViewProps> = ({
  menu,
  orders,
  selectedTable,
  onSelectTable,
  cart,
  onAddToCart,
  onChangeQty,
  onEditNote,
  onClearCart,
  onSendToKitchen,
  onOpenCheckout,
  tableCarts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [comboToCustomize, setComboToCustomize] = useState<MenuItem | null>(null);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const activeOrderForSelectedTable = orders.find(
    (o) => o.tableName === selectedTable && o.paymentStatus !== 'paid'
  );

  const getTableStatus = (tableName: string) => {
    const activeOrd = orders.find((o) => o.tableName === tableName && o.paymentStatus !== 'paid');
    const hasCart =
      (tableCarts[tableName] && tableCarts[tableName].length > 0) ||
      (selectedTable === tableName && cart.length > 0);

    if (activeOrd) {
      if (activeOrd.status === 'delivered') {
        return { label: 'Servida (Cobrar)', color: 'border-purple-500 bg-purple-950/40 text-purple-300' };
      }
      if (activeOrd.status === 'ready') {
        return { label: 'Lista en Cocina', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' };
      }
      return { label: 'En Cocina', color: 'border-amber-500 bg-amber-950/40 text-amber-300' };
    }
    if (hasCart) {
      return { label: 'Comanda Abierta', color: 'border-sky-500 bg-sky-950/40 text-sky-300' };
    }
    return { label: 'Libre', color: 'border-slate-800 bg-slate-900 text-slate-400' };
  };

  const filteredMenu = menu.filter((item) => {
    const matchCat = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 8 Mesas & Menú */}
      <div className="lg:col-span-8 space-y-3">
        {/* Selector de Mesas con Semáforo */}
        <div className="glass-card p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mesas (8) · Seleccionada: <span className="text-amber-400 font-extrabold">{selectedTable}</span>
            </h3>
            {activeOrderForSelectedTable && (
              <button
                onClick={() => onOpenCheckout(selectedTable)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-lg text-xs shadow-md transition flex items-center gap-1"
              >
                <span>💵</span>
                <span>
                  Cobrar {selectedTable} ({formatCurrency(activeOrderForSelectedTable.total)})
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {TABLES.map((t) => {
              const status = getTableStatus(t);
              const isSelected = selectedTable === t;
              return (
                <button
                  key={t}
                  onClick={() => onSelectTable(t)}
                  className={`p-2 rounded-xl text-center border transition ${
                    isSelected ? 'ring-2 ring-amber-400 font-extrabold' : ''
                  } ${status.color}`}
                >
                  <span className="block text-xs font-bold leading-tight">{t}</span>
                  <span className="block text-[9px] opacity-75 truncate">{status.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de Categorías & Buscador */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar platillo..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Platillos del Menú */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[62vh] overflow-y-auto pr-1">
          {filteredMenu.map((p) => {
            const tacosCount = getComboTacosCount(p);
            return (
              <div
                key={p.id}
                onClick={() => (tacosCount > 0 ? setComboToCustomize(p) : onAddToCart(p))}
                className="bg-zinc-900/95 border border-zinc-800 hover:border-amber-500/50 p-2.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm hover:shadow-amber-500/5"
              >
                <div className="flex gap-3">
                  <img
                    src={p.image}
                    className="w-20 h-20 rounded-xl object-cover bg-zinc-800 border border-zinc-700/50 shrink-0"
                    alt={p.name}
                    loading="lazy"
                  />
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-extrabold text-sm text-zinc-100 group-hover:text-amber-400 transition leading-snug">
                        {p.name}
                      </h4>
                      <span className="text-sm font-black font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                        {formatCurrency(p.price)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">{p.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500">
                  <span className="bg-zinc-800 px-2 py-0.5 rounded font-semibold text-zinc-400 uppercase tracking-wider">
                    {p.category}
                  </span>
                  <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                    {tacosCount > 0 ? `🌮 Elegir ${tacosCount} proteínas +` : 'Tocar para añadir +'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel de Comanda Lateral */}
      <div className="lg:col-span-4 glass-card p-4 flex flex-col justify-between border-amber-500/30 min-h-[500px]">
        <div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <div>
              <h3 className="font-black text-base text-white">Comanda: {selectedTable}</h3>
              <span className="text-[10px] text-slate-400">{cart.length} platillos agregados</span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <span className="text-4xl block">🌮</span>
                <p className="text-xs font-bold text-slate-400">Comanda vacía</p>
                <p className="text-[11px] text-slate-500">
                  Toca cualquier platillo o combo para agregarlo a {selectedTable}.
                </p>
              </div>
            ) : (
              cart.map((c, index) => (
                <div key={`${c.id}-${index}`} className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-100 block text-sm">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatCurrency(c.price)} c/u</span>
                    </div>
                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                      {formatCurrency(c.price * c.qty)}
                    </span>
                  </div>

                  {c.note && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-1.5 text-[11px] text-amber-300 font-medium leading-tight">
                      {c.note}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => onEditNote(c.id, c.note)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/30"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{c.note ? 'Editar nota' : 'Agregar nota'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onChangeQty(c.id, -1, c.note)}
                        className="w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-300 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-white">{c.qty}</span>
                      <button
                        onClick={() => onChangeQty(c.id, 1, c.note)}
                        className="w-6 h-6 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center justify-center font-bold text-black text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Total Comanda:</span>
            <span className="text-2xl font-black font-mono text-white">{formatCurrency(cartTotal)}</span>
          </div>

          <button
            onClick={onSendToKitchen}
            disabled={cart.length === 0}
            className={`w-full py-3 bg-gradient-to-r from-orange-600 via-amber-500 to-amber-400 hover:opacity-95 text-black font-black text-xs rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 ${
              cart.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-4 h-4" />
            <span>ENVIAR COMANDA A COCINA</span>
          </button>

          {activeOrderForSelectedTable && (
            <button
              onClick={() => onOpenCheckout(selectedTable)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Cobrar Cuenta de {selectedTable} ({formatCurrency(activeOrderForSelectedTable.total)})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Personalización de Proteínas para Combos */}
      <ComboProteinModal
        isOpen={comboToCustomize !== null}
        comboItem={comboToCustomize}
        tableName={selectedTable}
        onClose={() => setComboToCustomize(null)}
        onConfirm={(item, formattedNote) => onAddToCart(item, formattedNote)}
      />
    </div>
  );
};

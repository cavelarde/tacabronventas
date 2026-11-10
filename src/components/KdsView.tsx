import React from 'react';
import { Order } from '../types';
import { ChefHat, Flame, CheckCircle, Utensils, Clock, AlertTriangle } from 'lucide-react';

interface KdsViewProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, newStatus: Order['status']) => void;
}

export const KdsView: React.FC<KdsViewProps> = ({ orders, onUpdateOrderStatus }) => {
  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const now = Date.now();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span>PANTALLA DE COCINA (KDS)</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {activeOrders.length} comandas en preparación o listas
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Alarma visual (&gt;15 min)</span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500 space-y-2">
          <span className="text-5xl block">🎉</span>
          <p className="text-base font-bold text-slate-300">¡Cocina al día!</p>
          <p className="text-xs">No hay comandas pendientes en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.map((o) => {
            const elapsedMinutes = Math.floor((now - new Date(o.createdAt).getTime()) / 60000);
            const isLate = elapsedMinutes >= 15;

            return (
              <div
                key={o.id}
                className={`glass-card p-4 rounded-2xl flex flex-col justify-between border-2 transition ${
                  isLate
                    ? 'pulse-alert border-red-500'
                    : o.status === 'ready'
                    ? 'border-emerald-500'
                    : 'border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <div>
                      <span className="font-black text-amber-400 text-base block">{o.tableName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{o.id}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold flex items-center justify-end gap-1 ${
                          isLate ? 'text-red-400 font-mono' : 'text-slate-300 font-mono'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{elapsedMinutes} min</span>
                      </span>
                      <span
                        className={`block text-[9px] uppercase font-bold ${
                          o.status === 'ready' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {o.status === 'pending'
                          ? 'Por iniciar'
                          : o.status === 'preparing'
                          ? 'En cocción'
                          : 'Listo'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs py-1">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
                        <div className="flex justify-between font-extrabold text-slate-200">
                          <span>
                            {i.qty}x {i.name}
                          </span>
                        </div>
                        {i.note && (
                          <div className="mt-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            ⚠️ Nota: {i.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800">
                  {o.status === 'pending' && (
                    <button
                      onClick={() => onUpdateOrderStatus(o.id, 'preparing')}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>EMPEZAR PREPARACIÓN</span>
                    </button>
                  )}
                  {o.status === 'preparing' && (
                    <button
                      onClick={() => onUpdateOrderStatus(o.id, 'ready')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>MARCAR COMO LISTO</span>
                    </button>
                  )}
                  {o.status === 'ready' && (
                    <button
                      onClick={() => onUpdateOrderStatus(o.id, 'delivered')}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>ENTREGADO EN MESA</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

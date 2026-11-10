import React, { useState, useMemo } from 'react';
import { Customer, LoyaltyTier } from '../../types';
import { formatCurrency, getTierBadgeColor, sanitizePhone, generateWhatsAppMessage } from '../../utils/loyalty';
import { X, Search, Award, RefreshCw, Plus, Send, Eye, BarChart2 } from 'lucide-react';
import { CustomerLoyaltyCharts } from '../CustomerLoyaltyCharts';

interface TopClientesModalProps {
  isOpen: boolean;
  customers: Customer[];
  onClose: () => void;
  onOpenCustomerDetail: (customer: Customer) => void;
  onOpenNewCustomerModal: () => void;
  onSyncWithSheets: () => Promise<void>;
  onRecalculateLoyalty: () => void;
  isSyncing?: boolean;
}

export const TopClientesModal: React.FC<TopClientesModalProps> = ({
  isOpen,
  customers,
  onClose,
  onOpenCustomerDetail,
  onOpenNewCustomerModal,
  onSyncWithSheets,
  onRecalculateLoyalty,
  isSyncing = false,
}) => {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'gasto' | 'visitas' | 'reciente'>('gasto');
  const [showCharts, setShowCharts] = useState(false);

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.doc.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      );
    }

    if (filterTier !== 'all') {
      result = result.filter((c) => c.nivel === filterTier);
    }

    result.sort((a, b) => {
      if (sortBy === 'gasto') {
        return b.totalGastado - a.totalGastado;
      }
      if (sortBy === 'visitas') {
        return b.visitas - a.visitas;
      }
      if (sortBy === 'reciente') {
        return (b.ultimaVisita || '').localeCompare(a.ultimaVisita || '');
      }
      return 0;
    });

    return result;
  }, [customers, search, filterTier, sortBy]);

  if (!isOpen) return null;

  // Global KPIs for top bar inside modal
  const totalVisitas = customers.reduce((sum, c) => sum + (c.visitas || 0), 0);
  const totalFacturado = customers.reduce((sum, c) => sum + (c.totalGastado || 0), 0);
  const totalVIPs = customers.filter((c) => c.nivel === 'VIP Diamante' || c.nivel === 'Oro').length;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-4xl p-5 sm:p-6 space-y-4 border-amber-500/40 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-red-600 bg-[#c41212] shrink-0 shadow-md">
                <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-white">
                    Ranking de Clientes Frecuentes & Fidelización
                  </h3>
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    {customers.length} Registrados
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control de fidelidad con acumulación en tiempo real de compras ($) y visitas
                </p>
              </div>
            </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCharts((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                showCharts
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{showCharts ? 'Ocultar Gráficos' : 'Ver Gráficos Recharts'}</span>
            </button>
            <button
              onClick={onOpenNewCustomerModal}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cliente</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showCharts && (
          <div className="pt-1 pb-1">
            <CustomerLoyaltyCharts customers={customers} />
          </div>
        )}

        {/* Resumen Métricas Globales de Fidelización */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Clientes Frecuentes</span>
            <span className="text-base font-black text-white font-mono">{customers.length}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Visitas Sumadas</span>
            <span className="text-base font-black text-sky-400 font-mono">{totalVisitas} visitas</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">Total Compras Acumuladas</span>
            <span className="text-base font-black text-emerald-400 font-mono">{formatCurrency(totalFacturado)}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">Clientes VIP & Oro</span>
            <span className="text-base font-black text-amber-400 font-mono">👑 {totalVIPs}</span>
          </div>
        </div>

        {/* Filtros, Buscador y Botones de Acción */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, documento o teléfono..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Filtro por nivel */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Niveles</option>
              <option value="VIP Diamante">👑 VIP Diamante</option>
              <option value="Oro">🥇 Oro</option>
              <option value="Plata">🥈 Plata</option>
              <option value="Bronce">🥉 Bronce</option>
            </select>

            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'gasto' | 'visitas' | 'reciente')}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="gasto">💰 Mayor Facturación ($)</option>
              <option value="visitas">🎟️ Más Visitas</option>
              <option value="reciente">⏱️ Última Visita</option>
            </select>

            {/* Recalcular compras & visitas desde historial */}
            <button
              onClick={onRecalculateLoyalty}
              title="Consolidar y re-sumar todas las compras y visitas de clientes basadas en comandas archivadas"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Consolidar</span>
            </button>

            {/* Sincronizar Google Sheets */}
            <button
              onClick={onSyncWithSheets}
              disabled={isSyncing}
              className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Sheets'}</span>
            </button>
          </div>
        </div>

        {/* Lista del Ranking */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
          {filteredAndSortedCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Award className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="font-bold text-slate-400">No se encontraron clientes frecuentes</p>
              <p className="text-[11px] text-slate-500">
                Registra un cliente o factura comandas con número de documento para comenzar la fidelización.
              </p>
            </div>
          ) : (
            filteredAndSortedCustomers.map((c, index) => {
              const badge = getTierBadgeColor(c.nivel);
              const rankMedal =
                index === 0 ? '🥇 #1 VIP' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`;
              const telLimpio = sanitizePhone(c.phone || '');
              const ticketPromedio = c.visitas > 0 ? Math.round(c.totalGastado / c.visitas) : 0;

              return (
                <div
                  key={c.doc}
                  className={`border p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs transition hover:border-amber-500/50 ${
                    index === 0
                      ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900'
                      : 'border-slate-800 bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-amber-400 text-sm shrink-0 w-14">
                      {rankMedal}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{c.name}</span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.icon} {c.nivel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        C.C.: <b className="font-mono text-slate-200">{c.doc}</b> · Tel:{' '}
                        <b>{c.phone || 'Sin tel'}</b> · Última visita: {c.ultimaVisita || 'Hoy'}
                      </p>
                      {c.favoritos && c.favoritos.length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Favorito: <span className="text-amber-300 font-semibold">{c.favoritos[0]}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Métricas: Visitas, Total Compras, Ticket Promedio */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-sm font-black text-sky-400 font-mono">
                        {c.visitas} Visita{c.visitas !== 1 ? 's' : ''}
                      </span>
                      <span className="block text-xs font-black text-emerald-400 font-mono">
                        {formatCurrency(c.totalGastado)}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        Prom: {formatCurrency(ticketPromedio)}/visita
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenCustomerDetail(c)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
                        title="Ver ficha completa de fidelización e historial"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ficha</span>
                      </button>

                      {telLimpio && (
                        <button
                          onClick={() => {
                            const msg = generateWhatsAppMessage(c, 'taco');
                            window.open(`https://wa.me/${telLimpio}?text=${msg}`, '_blank');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition"
                          title="Enviar promo de fidelización por WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>Premiar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Pestaña de Google Sheets: <code className="text-amber-300 font-mono font-bold">Clientes_Frecuentes</code>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition"
          >
            Cerrar Ranking
          </button>
        </div>
      </div>
    </div>
  );
};

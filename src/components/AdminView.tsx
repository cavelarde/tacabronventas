import React, { useState, useMemo } from 'react';
import { Order, Expense, Customer, LoyaltyTier } from '../types';
import { formatCurrency, getTierBadgeColor, sanitizePhone, generateWhatsAppMessage } from '../utils/loyalty';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Crown,
  Search,
  Plus,
  RefreshCw,
  Send,
  Eye,
  FileText,
  AlertCircle,
  BarChart3,
  Settings,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { CustomerLoyaltyCharts } from './CustomerLoyaltyCharts';

interface AdminViewProps {
  initialCash: number;
  orders: Order[];
  expenses: Expense[];
  customers: Customer[];
  onOpenInitialCashModal: () => void;
  onOpenTopClientesModal: () => void;
  onOpenProductReportModal: () => void;
  onOpenSheetsConfigModal: () => void;
  onAddExpense: (concepto: string, monto: number) => Promise<void>;
  onCierreZ: () => void | Promise<void>;
  onOpenCheckout: (tableName: string) => void;
  onShowTicket: (order: Order) => void;
  onOpenCustomerDetail: (customer: Customer) => void;
  onOpenNewCustomerModal: () => void;
  onEditCustomer: (customer: Customer) => void;
  onRecalculateLoyalty: () => void;
  onSyncSheets: () => Promise<void>;
  isSyncingSheets: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({
  initialCash,
  orders,
  expenses,
  customers,
  onOpenInitialCashModal,
  onOpenTopClientesModal,
  onOpenProductReportModal,
  onOpenSheetsConfigModal,
  onAddExpense,
  onCierreZ,
  onOpenCheckout,
  onShowTicket,
  onOpenCustomerDetail,
  onOpenNewCustomerModal,
  onEditCustomer,
  onRecalculateLoyalty,
  onSyncSheets,
  isSyncingSheets,
}) => {
  const [gastoConcepto, setGastoConcepto] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(false);

  const handleCopyIndexHtml = async () => {
    try {
      const res = await fetch('/tacabron.html');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedIndex(true);
      setTimeout(() => setCopiedIndex(false), 3000);
    } catch (e) {
      console.error('Error al copiar:', e);
    }
  };

  // Loyalty panel state
  const [loyaltySearch, setLoyaltySearch] = useState('');
  const [loyaltyTierFilter, setLoyaltyTierFilter] = useState<string>('all');
  const [loyaltySortBy, setLoyaltySortBy] = useState<'gasto' | 'visitas' | 'promedio' | 'reciente'>('gasto');

  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const ventasEfectivo = paidOrders
    .filter((o) => o.paymentMethod === 'Efectivo')
    .reduce((acc, o) => acc + o.total, 0);
  const ventasDigitales = paidOrders
    .filter((o) => o.paymentMethod !== 'Efectivo')
    .reduce((acc, o) => acc + o.total, 0);
  const ventasTotalesBrutas = ventasEfectivo + ventasDigitales;
  const totalGastos = expenses.reduce((acc, g) => acc + g.monto, 0);
  const ventasNetas = ventasTotalesBrutas - totalGastos;
  const efectivoEnCaja = initialCash + ventasEfectivo - totalGastos;

  // Loyalty calculations
  const totalVisitasGlobal = customers.reduce((sum, c) => sum + (c.visitas || 0), 0);
  const totalFacturadoClientes = customers.reduce((sum, c) => sum + (c.totalGastado || 0), 0);
  const ticketPromedioGlobal =
    totalVisitasGlobal > 0 ? Math.round(totalFacturadoClientes / totalVisitasGlobal) : 0;
  const vipCount = customers.filter((c) => c.nivel === 'VIP Diamante').length;
  const oroCount = customers.filter((c) => c.nivel === 'Oro').length;
  const plataCount = customers.filter((c) => c.nivel === 'Plata').length;
  const bronceCount = customers.filter((c) => c.nivel === 'Bronce').length;

  const filteredCustomers = useMemo(() => {
    let list = [...customers];
    if (loyaltySearch.trim()) {
      const q = loyaltySearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.doc.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      );
    }
    if (loyaltyTierFilter !== 'all') {
      list = list.filter((c) => c.nivel === loyaltyTierFilter);
    }
    list.sort((a, b) => {
      if (loyaltySortBy === 'gasto') return b.totalGastado - a.totalGastado;
      if (loyaltySortBy === 'visitas') return b.visitas - a.visitas;
      if (loyaltySortBy === 'promedio') {
        const promA = a.visitas > 0 ? a.totalGastado / a.visitas : 0;
        const promB = b.visitas > 0 ? b.totalGastado / b.visitas : 0;
        return promB - promA;
      }
      if (loyaltySortBy === 'reciente') return (b.ultimaVisita || '').localeCompare(a.ultimaVisita || '');
      return 0;
    });
    return list;
  }, [customers, loyaltySearch, loyaltyTierFilter, loyaltySortBy]);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(gastoMonto);
    if (!gastoConcepto.trim() || isNaN(montoNum) || montoNum <= 0) {
      return;
    }
    await onAddExpense(gastoConcepto.trim(), montoNum);
    setGastoConcepto('');
    setGastoMonto('');
  };

  return (
    <div className="space-y-4">
      {/* Barra de Acciones Administrativas */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Base de Caja:</span>
          <span className="font-mono text-sky-400 font-extrabold text-sm">{formatCurrency(initialCash)}</span>
          <button
            onClick={onOpenInitialCashModal}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2 py-0.5 rounded-lg text-xs border border-amber-500/30 transition"
          >
            ✏️ Cambiar Base
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenTopClientesModal}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Top Clientes Frecuentes</span>
            <span className="bg-black/20 text-black px-1.5 py-0.2 rounded font-mono text-[10px]">
              {customers.length}
            </span>
          </button>

          <button
            onClick={onOpenProductReportModal}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Ranking Platillos</span>
          </button>

          <button
            onClick={onOpenSheetsConfigModal}
            title="Configurar URL de Google Apps Script para respaldo en Google Sheets"
            className="bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-500/50 shadow-sm transition"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>⚙️ URL Sheets</span>
          </button>

          <button
            onClick={onCierreZ}
            className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
          >
            <span>🔒 Cierre Z</span>
          </button>

          <button
            onClick={handleCopyIndexHtml}
            title="Copiar todo el código de index.html al portapapeles"
            className={`font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border ${
              copiedIndex
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                : 'bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border-amber-500/40'
            }`}
          >
            {copiedIndex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedIndex ? '¡Código Copiado!' : '📋 Copiar Código'}</span>
          </button>

          <a
            href="/tacabron.html"
            download="index.html"
            title="Descargar archivo index.html independiente para Netlify"
            className="bg-sky-950/50 hover:bg-sky-900/50 text-sky-300 border border-sky-500/40 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
          >
            <span>📥 Descargar index.html</span>
          </a>

          <a
            href="/netlify_tacabron.zip"
            download="netlify_tacabron.zip"
            title="Descargar ZIP listo para arrastrar y soltar en Netlify Drop"
            className="bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
          >
            <span>🚀 ZIP Netlify</span>
          </a>
        </div>
      </div>

      {/* 6 Tarjetas de Arqueo de Caja */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="glass-card p-3 border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">💵 Fondo Inicial</span>
          <p className="text-lg font-black font-mono text-sky-400 mt-0.5">{formatCurrency(initialCash)}</p>
        </div>
        <div className="glass-card p-3 border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">📥 Ventas Efectivo</span>
          <p className="text-lg font-black font-mono text-emerald-400 mt-0.5">+{formatCurrency(ventasEfectivo)}</p>
        </div>
        <div className="glass-card p-3 border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">💳 Tarjeta/Transf.</span>
          <p className="text-lg font-black font-mono text-indigo-400 mt-0.5">+{formatCurrency(ventasDigitales)}</p>
        </div>
        <div className="glass-card p-3 border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">💸 Gastos de Caja</span>
          <p className="text-lg font-black font-mono text-rose-400 mt-0.5">-{formatCurrency(totalGastos)}</p>
        </div>
        <div className="glass-card p-3 border-amber-500/30 bg-amber-950/20">
          <span className="text-[10px] text-amber-300 uppercase font-bold block">📈 Venta Neta Día</span>
          <p className="text-lg font-black font-mono text-amber-400 mt-0.5">{formatCurrency(ventasNetas)}</p>
        </div>
        <div className="glass-card p-3 border-emerald-500/40 bg-emerald-950/20">
          <span className="text-[10px] text-emerald-300 uppercase font-bold block">💰 Efectivo en Cajón</span>
          <p className="text-lg font-black font-mono text-white mt-0.5">{formatCurrency(efectivoEnCaja)}</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN DESTACADA: FIDELIZACIÓN & TOP CLIENTES FRECUENTES                */}
      {/* Sumando sus compras ($) y visitas con historial y premios por WhatsApp   */}
      {/* ========================================================================= */}
      <div className="glass-card p-4 sm:p-5 border-amber-500/40 space-y-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-red-600 bg-[#c41212] shrink-0 shadow-md">
                <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">
                    Fidelización & Top Clientes Frecuentes
                  </h2>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Sumando Compras & Visitas
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acumula automáticamente el valor gastado y las visitas en cada cobro para premiar la lealtad.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRecalculateLoyalty}
              title="Re-analizar todas las comandas pagadas para recalcular compras acumuladas y visitas"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Consolidar Compras & Visitas</span>
            </button>

            <button
              onClick={onSyncSheets}
              disabled={isSyncingSheets}
              className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'Sincronizando...' : 'Sincronizar Sheets'}</span>
            </button>

            <button
              onClick={onOpenNewCustomerModal}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* 4 Métricas Clave de Fidelización */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Clientes Registrados</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{customers.length}</p>
            <span className="text-[10px] text-slate-500">En base de datos</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-500/30">
            <span className="text-[10px] text-sky-400 font-bold uppercase block">Total Visitas Acumuladas</span>
            <p className="text-xl font-black font-mono text-sky-400 mt-0.5">{totalVisitasGlobal} visitas</p>
            <span className="text-[10px] text-slate-500">Sumadas en restaurante</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Total Compras Acumuladas</span>
            <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              {formatCurrency(totalFacturadoClientes)}
            </p>
            <span className="text-[10px] text-emerald-400/70">Sumando todas las comandas</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 bg-amber-950/10">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Ticket Promedio Global</span>
            <p className="text-xl font-black font-mono text-amber-300 mt-0.5">
              {formatCurrency(ticketPromedioGlobal)}
            </p>
            <span className="text-[10px] text-amber-400/70">Gasto promedio por visita</span>
          </div>
        </div>

        {/* Visual Charts Component (recharts): Crecimiento mensual & Distribución de Niveles */}
        <CustomerLoyaltyCharts customers={customers} />

        {/* Distribución de Niveles de Fidelidad */}
        <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Niveles:
          </span>
          <button
            onClick={() => setLoyaltyTierFilter('VIP Diamante')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              loyaltyTierFilter === 'VIP Diamante'
                ? 'bg-amber-500 text-black shadow'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span>👑 VIP Diamante</span>
            <span className="font-mono">({vipCount})</span>
          </button>

          <button
            onClick={() => setLoyaltyTierFilter('Oro')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              loyaltyTierFilter === 'Oro'
                ? 'bg-yellow-500 text-black shadow'
                : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/20'
            }`}
          >
            <span>🥇 Oro</span>
            <span className="font-mono">({oroCount})</span>
          </button>

          <button
            onClick={() => setLoyaltyTierFilter('Plata')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              loyaltyTierFilter === 'Plata'
                ? 'bg-slate-300 text-black shadow'
                : 'bg-slate-400/10 text-slate-300 border border-slate-400/30 hover:bg-slate-400/20'
            }`}
          >
            <span>🥈 Plata</span>
            <span className="font-mono">({plataCount})</span>
          </button>

          <button
            onClick={() => setLoyaltyTierFilter('Bronce')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              loyaltyTierFilter === 'Bronce'
                ? 'bg-orange-600 text-white shadow'
                : 'bg-orange-800/15 text-orange-300 border border-orange-700/30 hover:bg-orange-800/25'
            }`}
          >
            <span>🥉 Bronce</span>
            <span className="font-mono">({bronceCount})</span>
          </button>

          {loyaltyTierFilter !== 'all' && (
            <button
              onClick={() => setLoyaltyTierFilter('all')}
              className="text-xs text-slate-400 hover:text-white underline ml-auto"
            >
              Ver Todos ({customers.length})
            </button>
          )}
        </div>

        {/* Buscador y Ordenamiento */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={loyaltySearch}
              onChange={(e) => setLoyaltySearch(e.target.value)}
              placeholder="Buscar por nombre, documento o WhatsApp..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Ordenar:</span>
            <select
              value={loyaltySortBy}
              onChange={(e) =>
                setLoyaltySortBy(e.target.value as 'gasto' | 'visitas' | 'promedio' | 'reciente')
              }
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="gasto">💰 Mayor Facturación ($)</option>
              <option value="visitas">🎟️ Más Visitas</option>
              <option value="promedio">📈 Mayor Ticket Promedio</option>
              <option value="reciente">⏱️ Última Visita</option>
            </select>
          </div>
        </div>

        {/* Lista del Ranking de Clientes Frecuentes */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 text-xs">
          {filteredCustomers.length === 0 ? (
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 space-y-2">
              <Crown className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-bold text-slate-400">Sin clientes en este filtro</p>
              <p className="text-[11px]">Factura con cédula en el POS o registra un nuevo cliente.</p>
            </div>
          ) : (
            filteredCustomers.map((c, idx) => {
              const badge = getTierBadgeColor(c.nivel);
              const rankLabel =
                idx === 0 ? '🥇 #1 VIP' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;
              const ticketProm = c.visitas > 0 ? Math.round(c.totalGastado / c.visitas) : 0;
              const telLimpio = sanitizePhone(c.phone || '');

              return (
                <div
                  key={c.doc}
                  className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 transition hover:border-amber-500/50 ${
                    idx === 0
                      ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  {/* Posición & Info */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-amber-400 text-sm shrink-0 w-14">
                      {rankLabel}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{c.name}</span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.icon} {c.nivel}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.2 rounded">
                          ⭐ {c.puntos} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Doc: <b className="font-mono text-slate-200">{c.doc}</b> · WhatsApp:{' '}
                        <b className="text-slate-200">{c.phone || 'Sin tel'}</b> · Última visita:{' '}
                        {c.ultimaVisita || 'Hoy'}
                      </p>
                      {c.notasFidelizacion && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          Nota: {c.notasFidelizacion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cifras de fidelización: Visitas, Compras Sumadas, Ticket Promedio */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-sm font-black text-sky-400 font-mono">
                        {c.visitas} Visita{c.visitas !== 1 ? 's' : ''}
                      </span>
                      <span className="block text-xs font-black text-emerald-400 font-mono">
                        {formatCurrency(c.totalGastado)}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        Prom: {formatCurrency(ticketProm)}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenCustomerDetail(c)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
                        title="Ver detalle completo de compras y canje de puntos"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ficha</span>
                      </button>

                      <button
                        onClick={() => onEditCustomer(c)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1.5 rounded-xl text-xs transition"
                        title="Editar cliente"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {telLimpio && (
                        <button
                          onClick={() => {
                            const msg = generateWhatsAppMessage(c, 'taco');
                            window.open(`https://wa.me/${telLimpio}?text=${msg}`, '_blank');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition"
                          title="Enviar regalo o promo por WhatsApp"
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
      </div>

      {/* Grid: Registro de Gastos & Historial de Comandas del Turno */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Gastos de Caja */}
        <div className="lg:col-span-5 glass-card p-4 space-y-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
            <span>💸</span> Registrar Salida / Gasto de Caja
          </h3>
          <form onSubmit={handleExpenseSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Concepto del Gasto</label>
              <input
                type="text"
                required
                value={gastoConcepto}
                onChange={(e) => setGastoConcepto(e.target.value)}
                placeholder="Ej. Hielo, limones, servilletas..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Monto ($)</label>
              <input
                type="number"
                step="500"
                required
                value={gastoMonto}
                onChange={(e) => setGastoMonto(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition shadow-md"
            >
              Registrar Gasto
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-40 overflow-y-auto">
            <span className="text-[11px] text-slate-400 font-bold block">Gastos del Turno:</span>
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-500">Sin gastos reportados en este turno.</p>
            ) : (
              expenses.map((g) => (
                <div key={g.id} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg text-xs">
                  <span className="text-slate-300 font-medium">{g.concepto}</span>
                  <span className="text-rose-400 font-mono font-bold">-{formatCurrency(g.monto)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial de Comandas del Turno */}
        <div className="lg:col-span-7 glass-card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Historial de Comandas del Turno ({orders.length})</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Total cobradas: {paidOrders.length}</span>
              <button
                onClick={onCierreZ}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-bold transition flex items-center gap-1"
              >
                <span>🔒 Cierre Z</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No hay comandas registradas.</p>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-wrap justify-between items-center gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-400">{o.tableName}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{o.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {o.paymentStatus === 'paid' ? `Pagado (${o.paymentMethod})` : 'Por Cobrar'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {o.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </p>
                    {o.customer && o.customer.name !== 'Consumidor Final' && (
                      <p className="text-[10px] text-amber-300 font-bold mt-0.5 flex items-center gap-1">
                        <span>👤 {o.customer.name}</span>
                        <span className="font-mono text-slate-400">(CC: {o.customer.doc})</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black font-mono text-sm text-white">
                      {formatCurrency(o.total)}
                    </span>
                    {o.paymentStatus !== 'paid' ? (
                      <button
                        onClick={() => onOpenCheckout(o.tableName)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition"
                      >
                        Cobrar
                      </button>
                    ) : (
                      <button
                        onClick={() => onShowTicket(o)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
                      >
                        <span>🖨️ Ticket</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

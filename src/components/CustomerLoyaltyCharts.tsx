import React, { useMemo } from 'react';
import { Customer } from '../types';
import { formatCurrency, getTierBadgeColor } from '../utils/loyalty';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Users, Crown } from 'lucide-react';

interface CustomerLoyaltyChartsProps {
  customers: Customer[];
}

const TIER_COLORS: Record<string, string> = {
  'VIP Diamante': '#f59e0b', // Amber-500
  Oro: '#eab308',           // Yellow-500
  Plata: '#94a3b8',         // Slate-400
  Bronce: '#ea580c',        // Orange-600
};

export const CustomerLoyaltyCharts: React.FC<CustomerLoyaltyChartsProps> = ({ customers }) => {
  // 1. Data for Monthly Customer Growth (Crecimiento de clientes nuevos por mes)
  const growthData = useMemo(() => {
    // Map month names in Spanish
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Collect all months from customers or default to recent 6 months
    const monthlyMap: Record<string, { monthKey: string; label: string; nuevos: number; compras: number; orderVal: number }> = {};

    // Generate at least the last 5 months up to current
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = {
        monthKey: key,
        label,
        nuevos: 0,
        compras: 0,
        orderVal: d.getTime(),
      };
    }

    // Populate with actual customers
    customers.forEach((c) => {
      let dateStr = c.primeraVisita || c.ultimaVisita || new Date().toISOString();
      const parts = dateStr.split(/[- :T]/);
      let year = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10);

      if (isNaN(year) || isNaN(month)) {
        year = now.getFullYear();
        month = now.getMonth() + 1;
      }

      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        const mIdx = Math.max(0, Math.min(11, month - 1));
        monthlyMap[key] = {
          monthKey: key,
          label: `${monthNames[mIdx]} ${year}`,
          nuevos: 0,
          compras: 0,
          orderVal: new Date(year, month - 1, 1).getTime(),
        };
      }
      monthlyMap[key].nuevos += 1;
      monthlyMap[key].compras += c.totalGastado || 0;
    });

    const sortedMonths = Object.values(monthlyMap).sort((a, b) => a.orderVal - b.orderVal);

    // Calculate cumulative customers
    let runningTotal = 0;
    return sortedMonths.map((m) => {
      runningTotal += m.nuevos;
      return {
        ...m,
        acumulados: runningTotal,
      };
    });
  }, [customers]);

  // 2. Data for Loyalty Tier Distribution (Distribución de niveles en gráfico de pastel)
  const tierPieData = useMemo(() => {
    const counts: Record<string, { count: number; totalGastado: number; totalVisitas: number }> = {
      'VIP Diamante': { count: 0, totalGastado: 0, totalVisitas: 0 },
      Oro: { count: 0, totalGastado: 0, totalVisitas: 0 },
      Plata: { count: 0, totalGastado: 0, totalVisitas: 0 },
      Bronce: { count: 0, totalGastado: 0, totalVisitas: 0 },
    };

    customers.forEach((c) => {
      const tier = c.nivel || 'Bronce';
      if (!counts[tier]) {
        counts[tier] = { count: 0, totalGastado: 0, totalVisitas: 0 };
      }
      counts[tier].count += 1;
      counts[tier].totalGastado += c.totalGastado || 0;
      counts[tier].totalVisitas += c.visitas || 0;
    });

    const totalCusts = Math.max(1, customers.length);

    return Object.entries(counts)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        value: data.count,
        totalGastado: data.totalGastado,
        totalVisitas: data.totalVisitas,
        percentage: Math.round((data.count / totalCusts) * 100),
        color: TIER_COLORS[name] || '#94a3b8',
      }));
  }, [customers]);

  const totalNuevosUltimoMes = growthData.length > 0 ? growthData[growthData.length - 1].nuevos : 0;
  const mesActualLabel = growthData.length > 0 ? growthData[growthData.length - 1].label : 'Este mes';

  return (
    <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-4">
      {/* Header de la sección de analítica */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>Analítica Visual de Fidelización</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                recharts
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Crecimiento mensual de nuevos clientes registrados y distribución por nivel de lealtad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Nuevos en {mesActualLabel}:</span>
            <span className="font-mono font-black text-sky-400">+{totalNuevosUltimoMes}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Total en Base:</span>
            <span className="font-mono font-black text-amber-400">{customers.length}</span>
          </div>
        </div>
      </div>

      {/* Grid con los 2 gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Gráfico 1: Crecimiento de Clientes Nuevos por Mes (7 columnas) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Crecimiento de Nuevos Clientes por Mes</span>
            </span>
            <span className="text-[10px] text-slate-400">Barras: Nuevos · Área: Acumulado</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcumulados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="barNuevos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
                          <div className="flex justify-between gap-4 text-amber-300">
                            <span>Nuevos Clientes:</span>
                            <span className="font-mono font-bold">+{data.nuevos}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sky-400">
                            <span>Clientes Acumulados:</span>
                            <span className="font-mono font-bold">{data.acumulados}</span>
                          </div>
                          {data.compras > 0 && (
                            <div className="flex justify-between gap-4 text-emerald-400 pt-0.5 border-t border-slate-800 text-[10px]">
                              <span>Ventas asociadas:</span>
                              <span className="font-mono font-bold">{formatCurrency(data.compras)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="nuevos" name="Nuevos Clientes" fill="url(#barNuevos)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Area
                  type="monotone"
                  dataKey="acumulados"
                  name="Total Acumulado"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAcumulados)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribución de Niveles en Gráfico de Pastel (5 columnas) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Distribución por Nivel de Lealtad</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{customers.length} clientes</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {tierPieData.length === 0 ? (
              <p className="text-slate-500 text-xs">Sin datos de clientes</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tierPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-white border-b border-slate-800 pb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-slate-300">
                              <span>Clientes:</span>
                              <span className="font-mono font-bold">
                                {data.value} ({data.percentage}%)
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 text-sky-300">
                              <span>Visitas totales:</span>
                              <span className="font-mono font-bold">{data.totalVisitas}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-emerald-400">
                              <span>Facturación sumada:</span>
                              <span className="font-mono font-bold">{formatCurrency(data.totalGastado)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Leyenda y Desglose compacto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-center text-[10px]">
            {tierPieData.map((tier) => (
              <div
                key={tier.name}
                className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-center"
              >
                <div className="flex items-center justify-center gap-1 font-bold text-slate-300 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tier.color }} />
                  <span className="truncate">{tier.name.replace('VIP Diamante', 'VIP')}</span>
                </div>
                <div className="flex justify-center items-baseline gap-1 mt-0.5">
                  <span className="font-mono font-black text-white text-xs">{tier.value}</span>
                  <span className="text-slate-500 text-[9px]">({tier.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

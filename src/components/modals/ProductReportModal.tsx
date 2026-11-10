import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/loyalty';
import { X, BarChart3, TrendingUp } from 'lucide-react';

interface ProductReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  orders: Order[];
}

interface ProductStat {
  platillo: string;
  categoria: string;
  unidades: number;
  totalDinero: number;
}

export const ProductReportModal: React.FC<ProductReportModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  orders,
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [unidadesTotales, setUnidadesTotales] = useState(0);
  const [totalGlobal, setTotalGlobal] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const loadReport = async () => {
      setLoading(true);
      // First, try from Google Sheets if configured
      if (webAppUrl && !webAppUrl.includes('TU_URL_AQUI')) {
        try {
          const res = await fetch(`${webAppUrl}?action=getReporteProductos`);
          const data = await res.json();
          if (data && data.productos && data.productos.length > 0) {
            setProducts(data.productos);
            setUnidadesTotales(data.unidadesTotales);
            setTotalGlobal(data.totalGlobal);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.debug('Failed to fetch from sheets, fallback to local', e);
        }
      }

      // Local fallback calculation based on orders
      const map: { [name: string]: ProductStat } = {};
      let uTot = 0;
      let tGlob = 0;

      orders
        .filter((o) => o.paymentStatus === 'paid')
        .forEach((o) => {
          o.items.forEach((item) => {
            if (!map[item.name]) {
              map[item.name] = {
                platillo: item.name,
                categoria: item.category || 'General',
                unidades: 0,
                totalDinero: 0,
              };
            }
            map[item.name].unidades += item.qty;
            map[item.name].totalDinero += item.price * item.qty;
            uTot += item.qty;
            tGlob += item.price * item.qty;
          });
        });

      const list = Object.values(map).sort((a, b) => b.unidades - a.unidades);
      setProducts(list);
      setUnidadesTotales(uTot);
      setTotalGlobal(tGlob);
      setLoading(false);
    };

    loadReport();
  }, [isOpen, webAppUrl, orders]);

  if (!isOpen) return null;

  const maxUnidades = products.length > 0 ? products[0].unidades : 1;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-2xl p-5 sm:p-6 space-y-4 border-amber-500/40 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div>
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>Historial de Ventas por Producto</span>
            </h3>
            <p className="text-xs text-slate-400">Consolidado en tiempo real</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Cargando reporte de platillos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No hay ventas registradas aún.</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Platillos / Bebidas Vendidas
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">{unidadesTotales} unidades</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Recaudación Bruta</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatCurrency(totalGlobal)}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 text-xs">
              {products.map((p, idx) => {
                const medalla = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                const porcentaje = Math.round((p.unidades / maxUnidades) * 100);

                return (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white flex items-center gap-2">
                        <span className="font-mono text-amber-400">{medalla}</span> {p.platillo}
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-semibold">
                          {p.categoria}
                        </span>
                      </span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {formatCurrency(p.totalDinero)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{p.unidades} unidades vendidas</span>
                      <span>{porcentaje}% de popularidad</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Order, Expense } from '../../types';
import { formatCurrency } from '../../utils/loyalty';
import { X, Lock, Printer, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface CierreZModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCash: number;
  orders: Order[];
  expenses: Expense[];
  onConfirmCierre: (cierreSummary: CierreZSummary) => Promise<void>;
}

export interface CierreZSummary {
  fondoInicial: number;
  ventasEfectivo: number;
  ventasDigitales: number;
  ventasTotalesBrutas: number;
  totalGastos: number;
  ventasNetas: number;
  efectivoEnCaja: number;
  totalComandas: number;
  comandasCobradas: number;
  fechaCierre: string;
}

export const CierreZModal: React.FC<CierreZModalProps> = ({
  isOpen,
  onClose,
  initialCash,
  orders,
  expenses,
  onConfirmCierre,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cierreData, setCierreData] = useState<CierreZSummary | null>(null);

  if (!isOpen) return null;

  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const vEf = paidOrders.filter((o) => o.paymentMethod === 'Efectivo').reduce((a, b) => a + b.total, 0);
  const vDig = paidOrders.filter((o) => o.paymentMethod !== 'Efectivo').reduce((a, b) => a + b.total, 0);
  const vTot = vEf + vDig;
  const gTot = expenses.reduce((a, b) => a + b.monto, 0);
  const vNet = vTot - gTot;
  const efCaja = initialCash + vEf - gTot;

  const currentSummary: CierreZSummary = {
    fondoInicial: initialCash,
    ventasEfectivo: vEf,
    ventasDigitales: vDig,
    ventasTotalesBrutas: vTot,
    totalGastos: gTot,
    ventasNetas: vNet,
    efectivoEnCaja: efCaja,
    totalComandas: orders.length,
    comandasCobradas: paidOrders.length,
    fechaCierre: new Date().toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const handleExecuteCierre = async () => {
    setIsProcessing(true);
    setCierreData(currentSummary);
    await onConfirmCierre(currentSummary);
    setIsProcessing(false);
    setIsCompleted(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleFinish = () => {
    setIsCompleted(false);
    setCierreData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-lg p-5 sm:p-6 space-y-4 border-rose-500/50 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Cierre de Turno (Corte Z)</h3>
              <p className="text-[11px] text-slate-400">Liquidación de caja y balance general</p>
            </div>
          </div>
          <button onClick={handleFinish} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold block">¿Confirmar Cierre Z del Turno?</span>
                <span className="text-[11px] text-slate-300">
                  Se generará el balance final, se sincronizará con Google Sheets y se reiniciará el contador de comandas y gastos para el nuevo turno.
                </span>
              </div>
            </div>

            {/* Arqueo de Caja Detallado */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5 text-slate-400">
                <span className="font-bold uppercase text-[10px]">Concepto de Turno</span>
                <span className="font-bold uppercase text-[10px]">Monto</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 py-0.5">
                <span>💵 Base / Fondo Inicial:</span>
                <span className="font-mono font-bold text-sky-400">{formatCurrency(initialCash)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 py-0.5">
                <span>📥 Ventas en Efectivo:</span>
                <span className="font-mono font-bold text-emerald-400">+{formatCurrency(vEf)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 py-0.5">
                <span>💳 Ventas Digitales (Tarjeta / Transf.):</span>
                <span className="font-mono font-bold text-indigo-400">+{formatCurrency(vDig)}</span>
              </div>

              <div className="flex justify-between items-center font-bold text-white py-1 border-t border-slate-800/60">
                <span>Ventas Totales Brutas:</span>
                <span className="font-mono text-amber-400">{formatCurrency(vTot)}</span>
              </div>

              <div className="flex justify-between items-center text-rose-300 py-0.5">
                <span>💸 Gastos Reportados de Caja ({expenses.length}):</span>
                <span className="font-mono font-bold text-rose-400">-{formatCurrency(gTot)}</span>
              </div>

              <div className="flex justify-between items-center font-black text-amber-300 py-1.5 border-t border-slate-800">
                <span>Venta Neta del Turno:</span>
                <span className="font-mono text-sm">{formatCurrency(vNet)}</span>
              </div>

              <div className="flex justify-between items-center font-black text-white p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-sm">
                <span>💰 EFECTIVO FÍSICO EN CAJÓN:</span>
                <span className="font-mono text-emerald-300 text-base">{formatCurrency(efCaja)}</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>Total Comandas Atendidas:</span>
                <span className="font-mono font-bold text-slate-200">
                  {orders.length} ({paidOrders.length} pagadas)
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteCierre}
                disabled={isProcessing}
                className="w-1/2 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? 'Cerrando Turno...' : 'EJECUTAR CORTE Z'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Estado de éxito post-cierre con comprobante imprimible */
          <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-black text-lg text-white">¡Corte Z Realizado con Éxito!</h4>
              <p className="text-xs text-slate-300 mt-1">
                El balance de caja se ha archivado y enviado a Google Sheets.
              </p>
              <span className="inline-block mt-1 text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Caja reiniciada para el próximo turno
              </span>
            </div>

            {/* Comprobante térmico para imprimir */}
            {cierreData && (
              <div className="thermal-receipt text-xs text-left font-mono space-y-1.5 max-h-56 overflow-y-auto">
                <div className="text-center pb-1 border-b border-dashed border-zinc-400">
                  <div className="w-12 h-12 mx-auto mb-1 rounded-lg overflow-hidden border border-zinc-300 bg-red-600 flex items-center justify-center">
                    <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-black text-sm">TA' CABRÓN 🌮</h3>
                  <p className="text-[10px] font-bold">COMPROBANTE DE CORTE Z</p>
                  <p className="text-[9px]">{cierreData.fechaCierre}</p>
                </div>
                <div className="text-[11px] space-y-0.5 pt-1">
                  <div className="flex justify-between">
                    <span>Fondo Inicial:</span>
                    <span>{formatCurrency(cierreData.fondoInicial)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas Efectivo:</span>
                    <span>{formatCurrency(cierreData.ventasEfectivo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas Digitales:</span>
                    <span>{formatCurrency(cierreData.ventasDigitales)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed border-zinc-300 pt-0.5">
                    <span>Venta Bruta:</span>
                    <span>{formatCurrency(cierreData.ventasTotalesBrutas)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-700">
                    <span>Gastos Caja:</span>
                    <span>-{formatCurrency(cierreData.totalGastos)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Venta Neta:</span>
                    <span>{formatCurrency(cierreData.ventasNetas)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xs border-t border-b border-dashed border-zinc-400 py-1 my-1">
                    <span>EFECTIVO EN CAJÓN:</span>
                    <span>{formatCurrency(cierreData.efectivoEnCaja)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>Comandas Turno:</span>
                    <span>{cierreData.totalComandas}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Corte Z</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Finalizar y Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

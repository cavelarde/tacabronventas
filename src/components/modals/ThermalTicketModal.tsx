import React from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/loyalty';
import { Printer, X } from 'lucide-react';

interface ThermalTicketModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ThermalTicketModal: React.FC<ThermalTicketModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const fecha = new Date(order.paidAt || order.createdAt);
  const cli = order.customer || { name: 'Consumidor Final', doc: '222222222222', phone: '0000000' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm space-y-3">
        <div className="thermal-receipt text-xs space-y-2">
          <div className="text-center pb-2 border-b border-dashed border-zinc-400">
            <div className="w-14 h-14 mx-auto mb-1.5 rounded-lg overflow-hidden border border-zinc-300 bg-red-600 flex items-center justify-center">
              <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-base font-black tracking-wider">TA' CABRÓN 🌮</h2>
            <p className="text-[10px] font-bold">AUTÉNTICO SABOR CHINGÓN</p>
            <p className="text-[10px] text-zinc-600 font-bold">FACTURA DE VENTA / TICKET POS</p>
          </div>

          <div className="py-1 border-b border-dashed border-zinc-400 text-[11px] leading-tight space-y-0.5">
            <div className="flex justify-between">
              <span>Comanda:</span>
              <span className="font-bold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Mesa:</span>
              <span className="font-bold">{order.tableName}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>
                {fecha.toLocaleDateString()} {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Forma de Pago:</span>
              <span className="font-bold">{order.paymentMethod || 'Efectivo'}</span>
            </div>
          </div>

          <div className="py-1 border-b border-dashed border-zinc-400 text-[11px] leading-tight space-y-0.5 bg-zinc-50 p-1.5 rounded">
            <div className="text-[10px] font-bold text-zinc-700 uppercase">Datos del Cliente:</div>
            <div className="flex justify-between">
              <span>Nombre:</span>
              <span className="font-bold truncate max-w-[170px]">{cli.name}</span>
            </div>
            <div className="flex justify-between">
              <span>C.C. / DOC:</span>
              <span className="font-bold font-mono">{cli.doc}</span>
            </div>
            {cli.phone && cli.phone !== '0000000' && (
              <div className="flex justify-between">
                <span>Teléfono:</span>
                <span>{cli.phone}</span>
              </div>
            )}
          </div>

          <div className="py-1 space-y-1 border-b border-dashed border-zinc-400 text-[11px]">
            <div className="flex justify-between font-bold text-[10px] border-b pb-0.5">
              <span>CANT / DESCRIPCIÓN</span>
              <span>TOTAL</span>
            </div>
            {order.items.map((i, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between">
                  <span>
                    {i.qty}x {i.name}
                  </span>
                  <span className="font-mono">{formatCurrency(i.price * i.qty)}</span>
                </div>
                {i.note && <div className="text-[9px] text-zinc-500 pl-2">↳ Nota: {i.note}</div>}
              </div>
            ))}
          </div>

          <div className="pt-2 text-right text-xs">
            <div className="flex justify-between font-black text-sm">
              <span>TOTAL A PAGAR:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-zinc-600 leading-tight">
            <p>¡GRACIAS POR TU VISITA, CABRÓN!</p>
            <p>🌮 Vuelve pronto 🌮</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="w-1/2 bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-700 transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

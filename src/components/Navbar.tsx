import React from 'react';
import { TabType } from '../types';
import { ChefHat, Smartphone, BarChart3, Clock } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingKitchenCount: number;
  vipCustomersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingKitchenCount,
  vipCustomersCount,
}) => {
  return (
    <header className="glass-card mb-4 p-3 px-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 border-slate-800">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-red-600 shadow-md shadow-red-900/40 bg-[#c41212] flex items-center justify-center shrink-0">
          <img
            src="/logo.png"
            alt="TA' CABRÓN"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-xl select-none" style={{ display: 'none' }}>🌮</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2 leading-none tracking-tight">
            <span>TA' CABRÓN</span>
            <span className="text-[10px] bg-red-600/30 text-red-300 border border-red-500/50 px-2 py-0.5 rounded-full uppercase font-black tracking-wider">
              SABOR CHINGON
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">POS, Cocina & Fidelización de Clientes</p>
        </div>
      </div>

      <nav className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => onSelectTab('mesero')}
          className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'mesero'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mesero (POS)</span>
        </button>

        <button
          onClick={() => onSelectTab('cocina')}
          className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'cocina'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Cocina (KDS)</span>
          {pendingKitchenCount > 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-extrabold animate-pulse">
              {pendingKitchenCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('caja')}
          className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'caja'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Caja & Fidelización</span>
          {vipCustomersCount > 0 && (
            <span className="bg-amber-500/30 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              👑 {vipCustomersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('personal')}
          className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Personal & Nómina</span>
        </button>
      </nav>
    </header>
  );
};

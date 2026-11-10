/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  CartItem,
  Order,
  Customer,
  Employee,
  AttendanceRecord,
  Expense,
  TabType,
  NominaPeriod,
} from './types';
import {
  FULL_MENU,
  DEFAULT_EMPLOYEES,
  INITIAL_CUSTOMERS,
  INITIAL_ATTENDANCE,
  DEFAULT_WEB_APP_URL,
} from './data/initialData';
import { calculateLoyaltyTier } from './utils/loyalty';
import { playChimeSound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { PosView } from './components/PosView';
import { KdsView } from './components/KdsView';
import { AdminView } from './components/AdminView';
import { PersonalView } from './components/PersonalView';

import { CheckoutModal } from './components/modals/CheckoutModal';
import { ThermalTicketModal } from './components/modals/ThermalTicketModal';
import { CustomerDetailModal } from './components/modals/CustomerDetailModal';
import { CustomerFormModal } from './components/modals/CustomerFormModal';
import { TopClientesModal } from './components/modals/TopClientesModal';
import { ProductReportModal } from './components/modals/ProductReportModal';
import { SheetsConfigModal } from './components/modals/SheetsConfigModal';
import { InitialCashModal } from './components/modals/InitialCashModal';
import { EmployeeModal } from './components/modals/EmployeeModal';
import { AdminPinModal } from './components/modals/AdminPinModal';
import { NoteModal } from './components/modals/NoteModal';
import { CierreZModal, CierreZSummary } from './components/modals/CierreZModal';

export default function App() {
  // Navigation & admin lock
  const [activeTab, setActiveTab] = useState<TabType>('mesero');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [periodoNomina, setPeriodoNomina] = useState<NominaPeriod>('quincena');

  // POS State
  const [selectedTable, setSelectedTable] = useState('Mesa 1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableCarts, setTableCarts] = useState<{ [table: string]: CartItem[] }>({});

  // Core Data
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tc_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('tc_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('tc_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('tc_employees');
    return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('tc_attendance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore error
      }
    }
    return INITIAL_ATTENDANCE;
  });

  const [initialCash, setInitialCash] = useState<number>(() => {
    const saved = localStorage.getItem('tc_initial_cash');
    return saved ? parseFloat(saved) : 100000;
  });

  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('tc_sheets_url') || DEFAULT_WEB_APP_URL;
  });

  // Modals
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isTopClientesModalOpen, setIsTopClientesModalOpen] = useState(false);
  const [isProductReportModalOpen, setIsProductReportModalOpen] = useState(false);
  const [isSheetsConfigModalOpen, setIsSheetsConfigModalOpen] = useState(false);
  const [isInitialCashModalOpen, setIsInitialCashModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [noteModalItem, setNoteModalItem] = useState<{ id: number; name: string; note: string } | null>(null);
  const [isCierreZModalOpen, setIsCierreZModalOpen] = useState(false);

  // Broadcast channel for multi-tab sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('tc_pos_channel');
      channel.onmessage = (e) => {
        if (e.data?.type === 'SYNC_ALL') {
          const ord = localStorage.getItem('tc_orders');
          if (ord) setOrders(JSON.parse(ord));
          const exp = localStorage.getItem('tc_expenses');
          if (exp) setExpenses(JSON.parse(exp));
          const cust = localStorage.getItem('tc_customers');
          if (cust) setCustomers(JSON.parse(cust));
          const emp = localStorage.getItem('tc_employees');
          if (emp) setEmployees(JSON.parse(emp));
          const att = localStorage.getItem('tc_attendance');
          if (att) setAttendance(JSON.parse(att));
          const cash = localStorage.getItem('tc_initial_cash');
          if (cash) setInitialCash(parseFloat(cash));
          playChimeSound();
        }
      };
      return () => channel.close();
    } catch (e) {
      console.debug('BroadcastChannel not supported', e);
    }
  }, []);

  const notifySync = useCallback(
    (newOrders?: Order[], newExpenses?: Expense[], newCustomers?: Customer[], newEmployees?: Employee[], newAttendance?: AttendanceRecord[], newCash?: number) => {
      if (newOrders) localStorage.setItem('tc_orders', JSON.stringify(newOrders));
      if (newExpenses) localStorage.setItem('tc_expenses', JSON.stringify(newExpenses));
      if (newCustomers) localStorage.setItem('tc_customers', JSON.stringify(newCustomers));
      if (newEmployees) localStorage.setItem('tc_employees', JSON.stringify(newEmployees));
      if (newAttendance) localStorage.setItem('tc_attendance', JSON.stringify(newAttendance));
      if (newCash !== undefined) localStorage.setItem('tc_initial_cash', newCash.toString());

      try {
        const channel = new BroadcastChannel('tc_pos_channel');
        channel.postMessage({ type: 'SYNC_ALL' });
        channel.close();
      } catch (e) {
        console.debug(e);
      }
    },
    []
  );

  // Safe Google Sheets sender
  const sendToGoogleSheets = async (payload: Record<string, unknown>) => {
    if (!webAppUrl || webAppUrl.includes('TU_URL_AQUI')) {
      return { status: 'error', message: 'URL no configurada' };
    }
    try {
      const res = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return { status: 'success', fallback: true };
      } catch (e2: unknown) {
        const err = e2 as Error;
        return { status: 'error', message: err?.message };
      }
    }
  };

  // Tab switching with Admin PIN security (in-app modal, avoiding window.prompt)
  const handleSelectTab = (tab: TabType) => {
    if (tab === 'caja' && !isAdminUnlocked) {
      setIsAdminPinModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // POS Handlers
  const handleSelectTable = (table: string) => {
    setTableCarts((prev) => ({ ...prev, [selectedTable]: [...cart] }));
    setSelectedTable(table);
    setCart(tableCarts[table] || []);
  };

  const handleAddToCart = (item: MenuItem, customNote?: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && (c.note || '') === (customNote || ''));
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((c) => (c === existing ? { ...c, qty: c.qty + 1 } : c));
      } else {
        updated = [...prev, { ...item, qty: 1, note: customNote || '' }];
      }
      setTableCarts((tc) => ({ ...tc, [selectedTable]: updated }));
      return updated;
    });
  };

  const handleChangeQty = (itemId: number, delta: number, note?: string) => {
    setCart((prev) => {
      let found = false;
      const updated = prev
        .map((c) => {
          if (!found && c.id === itemId && (note === undefined || c.note === note)) {
            found = true;
            return { ...c, qty: c.qty + delta };
          }
          return c;
        })
        .filter((c) => c.qty > 0);
      setTableCarts((tc) => ({ ...tc, [selectedTable]: updated }));
      return updated;
    });
  };

  const handleEditNote = (itemId: number, note?: string) => {
    const item = cart.find((c) => c.id === itemId && (note === undefined || c.note === note));
    if (!item) return;
    setNoteModalItem({ id: item.id, name: item.name, note: item.note || '' });
  };

  const handleSaveNote = (noteText: string) => {
    if (!noteModalItem) return;
    setCart((prev) => {
      let updatedFirst = false;
      const updated = prev.map((c) => {
        if (!updatedFirst && c.id === noteModalItem.id && (c.note || '') === noteModalItem.note) {
          updatedFirst = true;
          return { ...c, note: noteText };
        }
        return c;
      });
      setTableCarts((tc) => ({ ...tc, [selectedTable]: updated }));
      return updated;
    });
    setNoteModalItem(null);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setTableCarts((prev) => {
      const copy = { ...prev };
      delete copy[selectedTable];
      return copy;
    });
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      tableName: selectedTable,
      items: [...cart],
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: '',
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setCart([]);
    setTableCarts((prev) => {
      const copy = { ...prev };
      delete copy[selectedTable];
      return copy;
    });

    notifySync(updatedOrders);
    playChimeSound();
  };

  const handleUpdateOrderStatus = (id: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
    setOrders(updated);
    notifySync(updated);
    if (newStatus === 'ready') playChimeSound();
  };

  const handleOpenCheckout = (tableName: string) => {
    const ord = orders.find((o) => o.tableName === tableName && o.paymentStatus !== 'paid');
    if (!ord) {
      alert(`La ${tableName} no tiene órdenes pendientes por cobrar.`);
      return;
    }
    setCheckoutOrder(ord);
  };

  // =========================================================================
  // CONFIRM PAYMENT & AUTOMATIC LOYALTY ACCUMULATION (COMPRAS & VISITAS)
  // =========================================================================
  const handleConfirmPayment = async (
    paidOrder: Order,
    customerData: { doc: string; name: string; phone: string }
  ) => {
    // 1. Update orders list
    const updatedOrders = orders.map((o) => (o.id === paidOrder.id ? paidOrder : o));
    setOrders(updatedOrders);

    // 2. Accumulate purchases and visits for frequent customer if not Consumidor Final
    let updatedCustomers = [...customers];
    const cDoc = customerData.doc.trim();

    if (cDoc && cDoc !== '222222222222') {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const existingIdx = updatedCustomers.findIndex(
        (c) => c.doc === cDoc || (customerData.phone && c.phone === customerData.phone)
      );

      const itemsSummary = paidOrder.items.map((i) => `${i.qty}x ${i.name}`);

      if (existingIdx !== -1) {
        const existing = updatedCustomers[existingIdx];
        const newVisitas = (existing.visitas || 0) + 1;
        const newTotalGastado = (existing.totalGastado || 0) + paidOrder.total;
        const newPuntos = (existing.puntos || 0) + Math.floor(paidOrder.total / 1000);
        const newNivel = calculateLoyaltyTier(newVisitas, newTotalGastado);

        // Update favorite items
        const combinedFavorites = [...(existing.favoritos || []), ...paidOrder.items.map((i) => i.name)];
        const counts: { [k: string]: number } = {};
        combinedFavorites.forEach((fav) => {
          counts[fav] = (counts[fav] || 0) + 1;
        });
        const topFavorites = Object.keys(counts)
          .sort((a, b) => counts[b] - counts[a])
          .slice(0, 3);

        const newHistory = [
          {
            orderId: paidOrder.id,
            fecha: nowStr,
            total: paidOrder.total,
            mesa: paidOrder.tableName,
            metodoPago: paidOrder.paymentMethod,
            items: itemsSummary,
          },
          ...(existing.historialCompras || []),
        ];

        updatedCustomers[existingIdx] = {
          ...existing,
          name: customerData.name || existing.name,
          phone: customerData.phone || existing.phone,
          visitas: newVisitas,
          totalGastado: newTotalGastado,
          puntos: newPuntos,
          nivel: newNivel,
          ultimaVisita: nowStr,
          favoritos: topFavorites,
          historialCompras: newHistory,
        };
      } else {
        // Register new customer with first purchase
        const initialVisitas = 1;
        const initialTotal = paidOrder.total;
        const initialPuntos = Math.floor(paidOrder.total / 1000);
        const initialNivel = calculateLoyaltyTier(initialVisitas, initialTotal);

        const newCustomer: Customer = {
          doc: cDoc,
          name: customerData.name,
          phone: customerData.phone,
          visitas: initialVisitas,
          totalGastado: initialTotal,
          puntos: initialPuntos,
          nivel: initialNivel,
          ultimaVisita: nowStr,
          primeraVisita: nowStr.split(' ')[0],
          favoritos: paidOrder.items.map((i) => i.name).slice(0, 3),
          historialCompras: [
            {
              orderId: paidOrder.id,
              fecha: nowStr,
              total: paidOrder.total,
              mesa: paidOrder.tableName,
              metodoPago: paidOrder.paymentMethod,
              items: itemsSummary,
            },
          ],
        };
        updatedCustomers.push(newCustomer);
      }

      setCustomers(updatedCustomers);

      // Async sync with Google Sheets
      sendToGoogleSheets({
        action: 'guardarClienteFrecuente',
        cliente: updatedCustomers.find((c) => c.doc === cDoc),
      });
    }

    notifySync(updatedOrders, undefined, updatedCustomers);

    // Sync order to Google Sheets
    sendToGoogleSheets({ action: 'registrarVenta', order: paidOrder });

    // Open ticket modal
    setTicketOrder(paidOrder);
  };

  // Consolidar Compras & Visitas (Recalcular sumas de todos los clientes basándose en las órdenes pagadas)
  const handleRecalculateLoyalty = () => {
    const custMap: { [doc: string]: Customer } = {};

    // Seed existing customers
    customers.forEach((c) => {
      custMap[c.doc] = {
        ...c,
        visitas: 0,
        totalGastado: 0,
        historialCompras: [],
      };
    });

    // Re-accumulate from all paid orders
    const allPaid = orders.filter((o) => o.paymentStatus === 'paid');
    let orderCount = 0;

    allPaid.forEach((ord) => {
      const doc = ord.customer?.doc?.trim();
      if (doc && doc !== '222222222222') {
        orderCount++;
        if (!custMap[doc]) {
          custMap[doc] = {
            doc,
            name: ord.customer?.name || 'Cliente ' + doc,
            phone: ord.customer?.phone || '',
            visitas: 0,
            totalGastado: 0,
            puntos: 0,
            nivel: 'Bronce',
            ultimaVisita: ord.paidAt || ord.createdAt,
            historialCompras: [],
          };
        }

        const c = custMap[doc];
        c.visitas += 1;
        c.totalGastado += ord.total;
        c.puntos = Math.floor(c.totalGastado / 1000);
        c.nivel = calculateLoyaltyTier(c.visitas, c.totalGastado);

        c.historialCompras = [
          {
            orderId: ord.id,
            fecha: ord.paidAt ? ord.paidAt.replace('T', ' ').substring(0, 16) : ord.createdAt,
            total: ord.total,
            mesa: ord.tableName,
            metodoPago: ord.paymentMethod || 'Efectivo',
            items: ord.items.map((i) => `${i.qty}x ${i.name}`),
          },
          ...(c.historialCompras || []),
        ];
      }
    });

    // Keep initial customer seeds if no orders yet, with their historical visits
    const updatedList = Object.values(custMap).map((c) => {
      if (c.visitas === 0) {
        const prev = customers.find((p) => p.doc === c.doc);
        return prev || c;
      }
      return c;
    });

    setCustomers(updatedList);
    notifySync(undefined, undefined, updatedList);
    alert(
      `✅ Consolidación completada:\nSe recalcularon las compras y visitas de ${updatedList.length} clientes frecuentes basadas en el historial de comandas.`
    );
  };

  // Sincronizar con Google Sheets pestaña Clientes_Frecuentes
  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await sendToGoogleSheets({
        action: 'guardarTopClientesBatch',
        clientes: customers,
      });

      if (res && res.status === 'success') {
        alert('☁️ ¡Clientes Frecuentes sincronizados con éxito en Google Sheets!');
      } else {
        alert('ℹ️ Sincronización enviada. Si la Web App no tiene endpoint batch, se almacenó en modo compatible.');
      }
    } catch (e: unknown) {
      const err = e as Error;
      alert('Error sincronizando con Sheets: ' + err.message);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Canjear Puntos de Fidelidad
  const handleRedeemPoints = (customerDoc: string, pointsToRedeem: number, rewardDesc: string) => {
    const cust = customers.find((c) => c.doc === customerDoc);
    if (!cust) return;
    if (cust.puntos < pointsToRedeem) {
      alert(`Puntos insuficientes. El cliente tiene ${cust.puntos} pts y requiere ${pointsToRedeem} pts.`);
      return;
    }

    // Direct redemption without blocking window.confirm in iframe sandbox

    const updated = customers.map((c) => {
      if (c.doc === customerDoc) {
        return {
          ...c,
          puntos: c.puntos - pointsToRedeem,
          notasFidelizacion: `${c.notasFidelizacion ? c.notasFidelizacion + ' · ' : ''}Canjeó ${pointsToRedeem}pts (${rewardDesc}) el ${new Date().toLocaleDateString()}`,
        };
      }
      return c;
    });

    setCustomers(updated);
    notifySync(undefined, undefined, updated);
    setSelectedCustomerDetail(updated.find((c) => c.doc === customerDoc) || null);
    alert(`🎉 ¡Canje Exitoso!\nSe entregó cortesía: "${rewardDesc}". Nuevo saldo: ${cust.puntos - pointsToRedeem} pts.`);
  };

  // Save/Edit Customer Modal
  const handleSaveCustomer = (customer: Customer) => {
    const idx = customers.findIndex((c) => c.doc === customer.doc);
    let updated: Customer[];
    if (idx !== -1) {
      updated = customers.map((c, i) => (i === idx ? customer : c));
    } else {
      updated = [customer, ...customers];
    }
    setCustomers(updated);
    notifySync(undefined, undefined, updated);
    sendToGoogleSheets({ action: 'guardarClienteFrecuente', cliente: customer });
    if (selectedCustomerDetail?.doc === customer.doc) {
      setSelectedCustomerDetail(customer);
    }
  };

  // Expenses & Cash
  const handleAddExpense = async (concepto: string, monto: number) => {
    const nuevoGasto: Expense = {
      id: 'GAS-' + Date.now(),
      concepto,
      monto,
      fecha: new Date().toISOString(),
    };
    const updated = [nuevoGasto, ...expenses];
    setExpenses(updated);
    notifySync(undefined, updated);
    sendToGoogleSheets({ action: 'guardarGasto', ...nuevoGasto });
  };

  const handleConfirmCierreZ = async (summary: CierreZSummary) => {
    await sendToGoogleSheets({
      action: 'guardarCierre',
      fondo_inicial: summary.fondoInicial,
      ventas_efectivo: summary.ventasEfectivo,
      ventas_digitales: summary.ventasDigitales,
      ventas_totales_brutas: summary.ventasTotalesBrutas,
      gastos: summary.totalGastos,
      ventas_netas: summary.ventasNetas,
      efectivo_en_caja: summary.efectivoEnCaja,
      total_comandas: summary.totalComandas,
      fecha_cierre: summary.fechaCierre,
    });

    setOrders([]);
    setExpenses([]);
    setCart([]);
    setTableCarts({});
    notifySync([], []);
  };

  // Staff and Attendance
  const handleRegisterClock = async (
    tipo: 'entrada' | 'salida',
    emp: Employee,
    photo: string
  ) => {
    const d = new Date();
    const fechaHoy = d.toISOString().split('T')[0];
    const horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const turnoActivo = attendance.find((a) => a.empId === emp.id && a.status === 'open');

    if (tipo === 'entrada') {
      if (turnoActivo) {
        return {
          success: false,
          type: 'warning' as const,
          title: 'Turno Ya Abierto',
          message: `${emp.name} ya tiene un turno abierto hoy desde las ${turnoActivo.inTime}. Debes marcar SALIDA para cerrar ese turno.`,
        };
      }
      const nuevoTurno: AttendanceRecord = {
        id: 'ATT-' + Date.now(),
        empId: emp.id,
        empName: emp.name,
        role: emp.role,
        date: fechaHoy,
        inTime: horaStr,
        inDateObj: d.toISOString(),
        outTime: '',
        hours: 0,
        pay: 0,
        status: 'open',
        photo,
      };
      const updated = [nuevoTurno, ...attendance];
      setAttendance(updated);
      notifySync(undefined, undefined, undefined, undefined, updated);
      playChimeSound();

      await sendToGoogleSheets({
        action: 'registrarAsistencia',
        tipo: 'entrada',
        empleado: emp,
        foto: photo,
      });

      return {
        success: true,
        type: 'success' as const,
        title: '¡Entrada Registrada!',
        message: `${emp.name} marcó entrada exitosamente a las ${horaStr}.`,
      };
    } else {
      let horasTrabajadas = 8.0;
      if (turnoActivo && turnoActivo.inDateObj) {
        const ms = d.getTime() - new Date(turnoActivo.inDateObj).getTime();
        horasTrabajadas = parseFloat(Math.max(0.01, ms / (1000 * 60 * 60)).toFixed(2));
      }
      const pagoDia = parseFloat((horasTrabajadas * emp.hourlyRate).toFixed(2));

      let updated: AttendanceRecord[];
      if (turnoActivo) {
        updated = attendance.map((a) =>
          a.id === turnoActivo.id
            ? { ...a, outTime: horaStr, hours: horasTrabajadas, pay: pagoDia, status: 'closed' }
            : a
        );
      } else {
        const turnoDirecto: AttendanceRecord = {
          id: 'ATT-' + Date.now(),
          empId: emp.id,
          empName: emp.name,
          role: emp.role,
          date: fechaHoy,
          inTime: 'Directa',
          inDateObj: d.toISOString(),
          outTime: horaStr,
          hours: horasTrabajadas,
          pay: pagoDia,
          status: 'closed',
          photo,
        };
        updated = [turnoDirecto, ...attendance];
      }

      setAttendance(updated);
      notifySync(undefined, undefined, undefined, undefined, updated);
      playChimeSound();

      await sendToGoogleSheets({
        action: 'registrarAsistencia',
        tipo: 'salida',
        empleado: emp,
        horasTrabajadas,
        foto: photo,
      });

      return {
        success: true,
        type: 'success' as const,
        title: '¡Salida Registrada!',
        message: `${emp.name}: ${horasTrabajadas} hrs acumuladas. Liquidación turno: $${pagoDia.toFixed(2)}.`,
      };
    }
  };

  const handleCloseShiftManual = async (recordId: string, hoursOverride?: number) => {
    const d = new Date();
    const horaStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const target = attendance.find((a) => a.id === recordId);
    if (!target) return;

    const emp = employees.find((e) => e.id === target.empId);
    const rate = emp ? emp.hourlyRate : 10;

    let horasTrabajadas = hoursOverride !== undefined ? hoursOverride : 8.0;
    if (target.inDateObj && hoursOverride === undefined) {
      const ms = d.getTime() - new Date(target.inDateObj).getTime();
      horasTrabajadas = parseFloat(Math.max(0.1, ms / (1000 * 60 * 60)).toFixed(2));
    }
    const pago = parseFloat((horasTrabajadas * rate).toFixed(2));

    const updated = attendance.map((a) =>
      a.id === recordId
        ? { ...a, outTime: horaStr, hours: horasTrabajadas, pay: pago, status: 'closed' as const }
        : a
    );
    setAttendance(updated);
    notifySync(undefined, undefined, undefined, undefined, updated);
    playChimeSound();
  };

  const handleDeleteAttendanceRecord = (recordId: string) => {
    const updated = attendance.filter((a) => a.id !== recordId);
    setAttendance(updated);
    notifySync(undefined, undefined, undefined, undefined, updated);
  };

  const handleSaveEmployee = async (emp: Employee) => {
    const idx = employees.findIndex((e) => e.id === emp.id);
    let updated: Employee[];
    if (idx !== -1) {
      updated = employees.map((e, i) => (i === idx ? emp : e));
    } else {
      updated = [...employees, emp];
    }
    setEmployees(updated);
    notifySync(undefined, undefined, undefined, updated);
    await sendToGoogleSheets({ action: 'guardarEmpleado', empleado: emp });
  };

  const handleDeleteEmployee = (empId: string) => {
    const updated = employees.filter((e) => e.id !== empId);
    setEmployees(updated);
    notifySync(undefined, undefined, undefined, updated);
  };

  const pendingKitchenCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const vipCount = customers.filter((c) => c.nivel === 'VIP Diamante' || c.nivel === 'Oro').length;

  return (
    <div className="min-h-screen p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        pendingKitchenCount={pendingKitchenCount}
        vipCustomersCount={vipCount}
      />

      {/* Main Tab Content */}
      <main id="app-content">
        {activeTab === 'mesero' && (
          <PosView
            menu={FULL_MENU}
            orders={orders}
            selectedTable={selectedTable}
            onSelectTable={handleSelectTable}
            cart={cart}
            onAddToCart={handleAddToCart}
            onChangeQty={handleChangeQty}
            onEditNote={handleEditNote}
            onClearCart={handleClearCart}
            onSendToKitchen={handleSendToKitchen}
            onOpenCheckout={handleOpenCheckout}
            tableCarts={tableCarts}
          />
        )}

        {activeTab === 'cocina' && (
          <KdsView orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />
        )}

        {activeTab === 'caja' && (
          <AdminView
            initialCash={initialCash}
            orders={orders}
            expenses={expenses}
            customers={customers}
            onOpenInitialCashModal={() => setIsInitialCashModalOpen(true)}
            onOpenTopClientesModal={() => setIsTopClientesModalOpen(true)}
            onOpenProductReportModal={() => setIsProductReportModalOpen(true)}
            onOpenSheetsConfigModal={() => setIsSheetsConfigModalOpen(true)}
            onAddExpense={handleAddExpense}
            onCierreZ={() => setIsCierreZModalOpen(true)}
            onOpenCheckout={handleOpenCheckout}
            onShowTicket={(order) => setTicketOrder(order)}
            onOpenCustomerDetail={(cust) => setSelectedCustomerDetail(cust)}
            onOpenNewCustomerModal={() => {
              setCustomerToEdit(null);
              setIsCustomerFormOpen(true);
            }}
            onEditCustomer={(cust) => {
              setCustomerToEdit(cust);
              setIsCustomerFormOpen(true);
            }}
            onRecalculateLoyalty={handleRecalculateLoyalty}
            onSyncSheets={handleSyncSheets}
            isSyncingSheets={isSyncingSheets}
          />
        )}

        {activeTab === 'personal' && (
          <PersonalView
            employees={employees}
            attendance={attendance}
            periodoNomina={periodoNomina}
            onSelectPeriod={setPeriodoNomina}
            onOpenNewEmployeeModal={() => {
              setEmployeeToEdit(null);
              setIsEmployeeModalOpen(true);
            }}
            onOpenEditEmployeeModal={(emp) => {
              setEmployeeToEdit(emp);
              setIsEmployeeModalOpen(true);
            }}
            onDeleteEmployee={handleDeleteEmployee}
            onRegisterClock={handleRegisterClock}
            onCloseShiftManual={handleCloseShiftManual}
            onDeleteAttendanceRecord={handleDeleteAttendanceRecord}
          />
        )}
      </main>

      {/* MODALS */}
      {checkoutOrder && (
        <CheckoutModal
          order={checkoutOrder}
          customers={customers}
          onClose={() => setCheckoutOrder(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {ticketOrder && (
        <ThermalTicketModal order={ticketOrder} onClose={() => setTicketOrder(null)} />
      )}

      {selectedCustomerDetail && (
        <CustomerDetailModal
          customer={selectedCustomerDetail}
          onClose={() => setSelectedCustomerDetail(null)}
          onRedeemPoints={handleRedeemPoints}
          onEditCustomer={(c) => {
            setSelectedCustomerDetail(null);
            setCustomerToEdit(c);
            setIsCustomerFormOpen(true);
          }}
        />
      )}

      {isCustomerFormOpen && (
        <CustomerFormModal
          isOpen={isCustomerFormOpen}
          customerToEdit={customerToEdit}
          onClose={() => {
            setIsCustomerFormOpen(false);
            setCustomerToEdit(null);
          }}
          onSaveCustomer={handleSaveCustomer}
        />
      )}

      {isTopClientesModalOpen && (
        <TopClientesModal
          isOpen={isTopClientesModalOpen}
          customers={customers}
          onClose={() => setIsTopClientesModalOpen(false)}
          onOpenCustomerDetail={(cust) => setSelectedCustomerDetail(cust)}
          onOpenNewCustomerModal={() => {
            setCustomerToEdit(null);
            setIsCustomerFormOpen(true);
          }}
          onSyncWithSheets={handleSyncSheets}
          onRecalculateLoyalty={handleRecalculateLoyalty}
          isSyncing={isSyncingSheets}
        />
      )}

      {isProductReportModalOpen && (
        <ProductReportModal
          isOpen={isProductReportModalOpen}
          onClose={() => setIsProductReportModalOpen(false)}
          webAppUrl={webAppUrl}
          orders={orders}
        />
      )}

      {isSheetsConfigModalOpen && (
        <SheetsConfigModal
          isOpen={isSheetsConfigModalOpen}
          webAppUrl={webAppUrl}
          onClose={() => setIsSheetsConfigModalOpen(false)}
          onSaveUrl={(url) => {
            setWebAppUrl(url);
            localStorage.setItem('tc_sheets_url', url);
          }}
        />
      )}

      {isInitialCashModalOpen && (
        <InitialCashModal
          isOpen={isInitialCashModalOpen}
          initialCash={initialCash}
          onClose={() => setIsInitialCashModalOpen(false)}
          onSave={(amount) => {
            setInitialCash(amount);
            notifySync(undefined, undefined, undefined, undefined, undefined, amount);
          }}
        />
      )}

      {isEmployeeModalOpen && (
        <EmployeeModal
          isOpen={isEmployeeModalOpen}
          employeeToEdit={employeeToEdit}
          onClose={() => {
            setIsEmployeeModalOpen(false);
            setEmployeeToEdit(null);
          }}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}

      {/* Modal de desbloqueo PIN Administrador */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setIsAdminPinModalOpen(false);
          setActiveTab('caja');
        }}
      />

      {/* Modal de nota de cocina */}
      {noteModalItem && (
        <NoteModal
          isOpen={Boolean(noteModalItem)}
          itemName={noteModalItem.name}
          initialNote={noteModalItem.note}
          onClose={() => setNoteModalItem(null)}
          onSave={handleSaveNote}
        />
      )}

      {/* Modal de Cierre Z (Arqueo y liquidación de turno) */}
      <CierreZModal
        isOpen={isCierreZModalOpen}
        onClose={() => setIsCierreZModalOpen(false)}
        initialCash={initialCash}
        orders={orders}
        expenses={expenses}
        onConfirmCierre={handleConfirmCierreZ}
      />
    </div>
  );
}

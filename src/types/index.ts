export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: 'Hamburguesas' | 'Combos' | 'Fuertes' | 'Proteínas' | 'Bebidas' | string;
  description: string;
  image: string;
}

export interface CartItem extends MenuItem {
  qty: number;
  note?: string;
}

export interface CustomerOrderHistory {
  orderId: string;
  fecha: string;
  total: number;
  mesa: string;
  metodoPago: string;
  items: string[];
}

export type LoyaltyTier = 'Bronce' | 'Plata' | 'Oro' | 'VIP Diamante';

export interface Customer {
  id?: string;
  doc: string;             // CC / NIT / Identificación
  name: string;            // Nombre Completo
  phone: string;           // Teléfono WhatsApp
  email?: string;
  visitas: number;         // Cantidad total de visitas
  totalGastado: number;    // Suma total de compras ($)
  puntos: number;          // Puntos acumulados de fidelización
  nivel: LoyaltyTier;      // Bronce, Plata, Oro, VIP Diamante
  ultimaVisita: string;    // Fecha de última compra
  primeraVisita?: string;  // Fecha de registro / primera visita
  favoritos?: string[];    // Platillos más ordenados
  historialCompras?: CustomerOrderHistory[];
  notasFidelizacion?: string; // Preferencias, alergias, cumpleaños, etc.
}

export interface Order {
  id: string;
  tableName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | '';
  customer?: {
    doc: string;
    name: string;
    phone: string;
  };
  createdAt: string;
  paidAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  pin: string;
  hourlyRate: number;
}

export interface AttendanceRecord {
  id: string;
  empId: string;
  empName: string;
  role: string;
  date: string;
  inTime: string;
  inDateObj: string;
  outTime: string;
  hours: number;
  pay: number;
  status: 'open' | 'closed';
  photo?: string;
}

export interface Expense {
  id: string;
  concepto: string;
  monto: number;
  fecha: string;
}

export type TabType = 'mesero' | 'cocina' | 'caja' | 'personal';
export type NominaPeriod = 'dia' | 'semana' | 'quincena' | 'mes';

import { MenuItem, Employee, Customer, AttendanceRecord } from '../types';

export const DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzENeK6Jl8okUPbuoUVB9c0T4VVyKa0RFTUXxRvJYShLMokrE4cyjIOE3EHUi6jcBindw/exec";

export const FULL_MENU: MenuItem[] = [
  { id: 1, name: 'La Cabrona', price: 28000, category: 'Hamburguesas', description: 'Pan artesanal 105gr de carne de alta calidad, 105gr de birria ahumada, lechuga fresca, queso mozzarella, tortilla de maíz crocante, mermelada de tocineta en reducción de tequila, crema agria con aceite de cilantro.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { id: 2, name: 'La Chingona', price: 28000, category: 'Hamburguesas', description: 'Pan artesanal de la abuela, queso mozzarella, queso de búfalo, guacamole de la casa, crema agria, encurtido de jalapeño, totopos de maíz, 190gr de doble carne de alta calidad, pico de gallo, lechuga fresca.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },
  { id: 3, name: 'La Catrina', price: 28000, category: 'Hamburguesas', description: 'Pan artesanal de la abuela, 150gr de carne con relleno de queso cheddar y queso mozzarella, bañada en salsa de tamarindo y cebolla dulce con amapola, aros de cebolla, lechuga y tomates frescos.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500' },
  { id: 4, name: 'La Mestiza', price: 28000, category: 'Hamburguesas', description: 'Pan artesanal, 105gr de carne de alta calidad bañada en mole artesanal, chicharrón apanado crujiente, cebolla morada encurtida, chips de plátano verde crocante, crema agria, salsa kentucky, glaseado honey.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500' },
  { id: 37, name: 'Papas Adicionales', price: 9000, category: 'Hamburguesas', description: 'Papas Fritas a la Francesa crocantes y sazonadas.', image: 'https://6af069e584dbf461b655aab7.imgix.net/sandbox/NanoBanana-2026-11-08.png' },
  { id: 5, name: 'Combo 1', price: 28000, category: 'Combos', description: '4 Tacos tradicionales + 1 Agua Fresca del día.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' },
  { id: 6, name: 'Combo 2', price: 50000, category: 'Combos', description: '8 Tacos tradicionales surtidos + 1 Agua Fresca grande.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500' },
  { id: 7, name: 'Combo 3', price: 53000, category: 'Combos', description: '4 Tacos + 1 Quesadilla con abundante queso + 2 Aguas Frescas.', image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500' },
  { id: 8, name: 'Combo 4', price: 50000, category: 'Combos', description: '4 Tacos + 1 Orden de Nachos con queso y frijoles + 2 Aguas Frescas.', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
  { id: 9, name: 'Combo Birria', price: 30000, category: 'Combos', description: '4 Tacos de Birria de costilla de res con consomé + 1 Agua Fresca.', image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=500' },
  { id: 10, name: 'Combo Queso', price: 30000, category: 'Combos', description: '4 Tacos con costra de queso fundido + 1 Agua Fresca.', image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=500' },
  { id: 36, name: 'Papitas Adicionales', price: 9000, category: 'Combos', description: 'Papitas Fritas a La Francesa crocantes sazonadas.', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500' },
  { id: 11, name: 'Tacos (Unidad)', price: 7000, category: 'Fuertes', description: 'Taco mexicano tradicional en tortilla de maíz caliente con cilantro, cebolla picada y limón.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' },
  { id: 12, name: 'Burros XL', price: 22000, category: 'Fuertes', description: 'Burro grande envuelto en tortilla de harina con arroz mexicano, frijol, queso fundido y proteína.', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500' },
  { id: 13, name: 'Quesadillas', price: 20000, category: 'Fuertes', description: 'Tortilla de harina dorada a la plancha rellena de abundante queso derretido y proteína.', image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500' },
  { id: 14, name: 'Nachos Cabrones', price: 20000, category: 'Fuertes', description: 'Totopos crujientes bañados en queso fundido, frijoles refritos, pico de gallo, crema agria y guacamole.', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
  { id: 15, name: 'Dorilocos', price: 22000, category: 'Fuertes', description: 'Bolsa de Doritos preparados con cueritos, cacahuates japoneses, pepino, jícama, limón, chamoy y salsas.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500' },
  { id: 16, name: 'Carnitas (Pernil Cerdo)', price: 7000, category: 'Proteínas', description: 'Pernil de cerdo confitado lentamente en su propia manteca con naranja y hierbas de olor.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500' },
  { id: 17, name: 'Suadero (Sobrebarriga)', price: 7000, category: 'Proteínas', description: 'Suave sobrebarriga de res cocida a fuego lento y dorada en el comal al momento de servir.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' },
  { id: 18, name: 'Pastor (Bondiola de Cerdo)', price: 7000, category: 'Proteínas', description: 'Bondiola de cerdo marinada en achiote tradicional, chiles secos, piña asada y especias.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' },
  { id: 19, name: 'Birria (Costilla de Res)', price: 9000, category: 'Proteínas', description: 'Costilla de res en adobo de chiles guajillo y ancho, cocinada hasta deshebrarse suavemente.', image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=500' },
  { id: 20, name: 'Lengua de Res', price: 9000, category: 'Proteínas', description: 'Lengua de res tierna y jugosa cocinada al vapor con laurel, cebolla y pimienta gorda.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500' },
  { id: 21, name: 'Chicharrón Crujiente', price: 9000, category: 'Proteínas', description: 'Chicharrón de cerdo apanado crujiente con toque salado y limón.', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500' },
  { id: 22, name: 'Tripa (Chunchurria)', price: 9000, category: 'Proteínas', description: 'Tripa de res bien lavada, cocida y frita al punto exacto de crocancia.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' },
  { id: 23, name: 'Tinga de Pollo', price: 7000, category: 'Proteínas', description: 'Pechuga deshebrada en sofrito de jitomate, cebolla caramelizada y ligero toque de chipotle.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500' },
  { id: 24, name: 'Oreja de Cerdo', price: 7000, category: 'Proteínas', description: 'Oreja de cerdo picada suave y pasada por la plancha con cebolla y cilantro.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' },
  { id: 25, name: 'Agua Fresca Mexicana', price: 8000, category: 'Bebidas', description: 'Sabores: Horchata cremosa, Tamarindo Michelado, Jamaica o Piña fresca.', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500' },
  { id: 26, name: 'Coca Cola', price: 5000, category: 'Bebidas', description: 'Refresco clásico 350ml bien frío.', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
  { id: 27, name: 'Postobón', price: 5000, category: 'Bebidas', description: 'Sabores tradicionales Manzana o Uva.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500' },
  { id: 28, name: 'Agua Natural', price: 4000, category: 'Bebidas', description: 'Botella de agua purificada fresca 500ml.', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500' },
  { id: 29, name: 'Agua con Gas', price: 4000, category: 'Bebidas', description: 'Agua mineral con gas refrescante 500ml.', image: 'https://images.unsplash.com/photo-1559839914-1b346d65588e?w=500' },
  { id: 30, name: 'Soda Hatsu', price: 6000, category: 'Bebidas', description: 'Soda saborizada artesanal con gas fino.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
  { id: 31, name: 'Cerveza Corona', price: 10000, category: 'Bebidas', description: 'Cerveza mexicana servida con limón.', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500' },
  { id: 32, name: 'Shot de Tequila', price: 7000, category: 'Bebidas', description: 'Tequila reposado 1.5 oz con sal y limón.', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500' },
  { id: 33, name: 'Adición: Guacamole', price: 3000, category: 'Bebidas', description: 'Porción de guacamole fresco con pico de gallo.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500' },
  { id: 34, name: 'Adición: Queso Extra', price: 6000, category: 'Bebidas', description: 'Porción extra de queso fundido o mozzarella.', image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500' },
  { id: 35, name: 'Adición: Salsas', price: 3000, category: 'Bebidas', description: 'Trío de salsas caseras verde, roja y habanero.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500' }
];

export const TABLES = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6', 'Mesa 7', 'Mesa 8'];
export const CATEGORIES = ['Todos', 'Hamburguesas', 'Combos', 'Fuertes', 'Proteínas', 'Bebidas'];

export const PROTEINAS_COMBO = [
  'Pastor (Bondiola de Cerdo)',
  'Suadero (Sobrebarriga)',
  'Carnitas (Pernil Cerdo)',
  'Birria (Costilla de Res)',
  'Tinga de Pollo',
  'Lengua de Res',
  'Chicharrón Crujiente',
  'Tripa (Chunchurria)',
  'Oreja de Cerdo',
  'Asada (Carne de Res)'
];

export function getComboTacosCount(item: MenuItem): number {
  if (item.category !== 'Combos') return 0;
  const name = item.name.toLowerCase();
  const desc = item.description.toLowerCase();
  if (name.includes('papitas') || name.includes('adicional')) return 0;
  if (name.includes('combo 2') || desc.includes('8 tacos')) return 8;
  if (desc.includes('4 tacos') || name.includes('combo')) return 4;
  const match = desc.match(/(\d+)\s*tacos/i);
  if (match) return parseInt(match[1], 10);
  return 4;
}

export const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'EMP-1', name: 'Carlos Martínez', role: 'Mesero', pin: '1001', hourlyRate: 10.00 },
  { id: 'EMP-2', name: 'Miguel Ángel Ruiz', role: 'Taquero / Cocina', pin: '1002', hourlyRate: 14.00 },
  { id: 'EMP-3', name: 'Ana Gómez', role: 'Cajera / Encargada', pin: '1003', hourlyRate: 12.00 },
  { id: 'EMP-4', name: 'Jorge López', role: 'Ayudante General', pin: '1004', hourlyRate: 9.00 }
];

const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-101',
    empId: 'EMP-1',
    empName: 'Carlos Martínez',
    role: 'Mesero',
    date: getPastDateStr(0),
    inTime: '08:00:00',
    inDateObj: new Date().toISOString(),
    outTime: '',
    hours: 0,
    pay: 0,
    status: 'open',
    photo: 'Sin captura',
  },
  {
    id: 'ATT-102',
    empId: 'EMP-1',
    empName: 'Carlos Martínez',
    role: 'Mesero',
    date: getPastDateStr(1),
    inTime: '08:00:00',
    inDateObj: new Date(Date.now() - 86400000).toISOString(),
    outTime: '16:00:00',
    hours: 8.0,
    pay: 80.0,
    status: 'closed',
    photo: 'Sin captura',
  },
  {
    id: 'ATT-103',
    empId: 'EMP-2',
    empName: 'Miguel Ángel Ruiz',
    role: 'Taquero / Cocina',
    date: getPastDateStr(0),
    inTime: '09:00:00',
    inDateObj: new Date().toISOString(),
    outTime: '17:30:00',
    hours: 8.5,
    pay: 119.0,
    status: 'closed',
    photo: 'Sin captura',
  },
  {
    id: 'ATT-104',
    empId: 'EMP-2',
    empName: 'Miguel Ángel Ruiz',
    role: 'Taquero / Cocina',
    date: getPastDateStr(1),
    inTime: '09:00:00',
    inDateObj: new Date(Date.now() - 86400000).toISOString(),
    outTime: '17:00:00',
    hours: 8.0,
    pay: 112.0,
    status: 'closed',
    photo: 'Sin captura',
  },
  {
    id: 'ATT-105',
    empId: 'EMP-3',
    empName: 'Ana Gómez',
    role: 'Cajera / Encargada',
    date: getPastDateStr(0),
    inTime: '08:30:00',
    inDateObj: new Date().toISOString(),
    outTime: '16:30:00',
    hours: 8.0,
    pay: 96.0,
    status: 'closed',
    photo: 'Sin captura',
  },
  {
    id: 'ATT-106',
    empId: 'EMP-4',
    empName: 'Jorge López',
    role: 'Ayudante General',
    date: getPastDateStr(1),
    inTime: '10:00:00',
    inDateObj: new Date(Date.now() - 86400000).toISOString(),
    outTime: '16:00:00',
    hours: 6.0,
    pay: 54.0,
    status: 'closed',
    photo: 'Sin captura',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    doc: '10203040',
    name: 'Carlos Mendoza',
    phone: '3001234567',
    email: 'carlos.mendoza@gmail.com',
    visitas: 14,
    totalGastado: 392000,
    puntos: 392,
    nivel: 'VIP Diamante',
    ultimaVisita: '2026-11-07 19:45',
    primeraVisita: '2026-08-15',
    favoritos: ['La Cabrona', 'Combo Birria', 'Cerveza Corona'],
    notasFidelizacion: 'Fanático de la birria con extra salsa habanero. Cumpleaños el 18 de Noviembre.',
    historialCompras: [
      { orderId: 'ORD-8821', fecha: '2026-11-07 19:45', total: 38000, mesa: 'Mesa 3', metodoPago: 'Tarjeta', items: ['1x La Cabrona', '1x Cerveza Corona'] },
      { orderId: 'ORD-8114', fecha: '2026-10-30 20:10', total: 58000, mesa: 'Mesa 3', metodoPago: 'Efectivo', items: ['1x Combo Birria', '1x La Cabrona'] },
      { orderId: 'ORD-7592', fecha: '2026-10-21 14:30', total: 30000, mesa: 'Mesa 1', metodoPago: 'Transferencia', items: ['1x Combo Birria'] }
    ]
  },
  {
    doc: '10987654',
    name: 'Valentina Restrepo',
    phone: '3109876543',
    email: 'vale.restrepo@outlook.com',
    visitas: 9,
    totalGastado: 252000,
    puntos: 252,
    nivel: 'Oro',
    ultimaVisita: '2026-11-06 21:15',
    primeraVisita: '2026-09-02',
    favoritos: ['La Chingona', 'Agua Fresca Mexicana (Horchata)', 'Nachos Cabrones'],
    notasFidelizacion: 'Siempre pide guacamole adicional y salsa suave.',
    historialCompras: [
      { orderId: 'ORD-8650', fecha: '2026-11-06 21:15', total: 36000, mesa: 'Mesa 5', metodoPago: 'Transferencia', items: ['1x La Chingona', '1x Agua Fresca Mexicana'] },
      { orderId: 'ORD-8012', fecha: '2026-10-28 13:40', total: 48000, mesa: 'Mesa 2', metodoPago: 'Tarjeta', items: ['1x Nachos Cabrones', '1x La Chingona'] }
    ]
  },
  {
    doc: '71234567',
    name: 'Andrés Morales',
    phone: '3205551234',
    visitas: 6,
    totalGastado: 168000,
    puntos: 168,
    nivel: 'Oro',
    ultimaVisita: '2026-11-05 20:30',
    primeraVisita: '2026-09-18',
    favoritos: ['Combo 2', 'Shot de Tequila'],
    notasFidelizacion: 'Viene con amigos los jueves en la noche.',
    historialCompras: [
      { orderId: 'ORD-8430', fecha: '2026-11-05 20:30', total: 57000, mesa: 'Mesa 4', metodoPago: 'Efectivo', items: ['1x Combo 2', '1x Shot de Tequila'] }
    ]
  },
  {
    doc: '10324567',
    name: 'Mariana Duarte',
    phone: '3154449876',
    visitas: 4,
    totalGastado: 112000,
    puntos: 112,
    nivel: 'Plata',
    ultimaVisita: '2026-11-04 15:20',
    primeraVisita: '2026-10-05',
    favoritos: ['Quesadillas', 'La Catrina'],
    notasFidelizacion: 'Prefiere mesa al aire libre o cerca de la ventana.',
    historialCompras: [
      { orderId: 'ORD-8210', fecha: '2026-11-04 15:20', total: 28000, mesa: 'Mesa 1', metodoPago: 'Efectivo', items: ['1x La Catrina'] }
    ]
  },
  {
    doc: '10456789',
    name: 'Mateo Gómez',
    phone: '3012223344',
    visitas: 2,
    totalGastado: 56000,
    puntos: 56,
    nivel: 'Bronce',
    ultimaVisita: '2026-11-03 19:10',
    primeraVisita: '2026-10-25',
    favoritos: ['Burros XL', 'Coca Cola'],
    historialCompras: [
      { orderId: 'ORD-8105', fecha: '2026-11-03 19:10', total: 27000, mesa: 'Mesa 6', metodoPago: 'Efectivo', items: ['1x Burros XL', '1x Coca Cola'] }
    ]
  }
];

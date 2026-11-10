import { Customer, LoyaltyTier } from '../types';

export function calculateLoyaltyTier(visitas: number, totalGastado: number): LoyaltyTier {
  if (visitas >= 10 || totalGastado >= 300000) return 'VIP Diamante';
  if (visitas >= 6 || totalGastado >= 150000) return 'Oro';
  if (visitas >= 3 || totalGastado >= 60000) return 'Plata';
  return 'Bronce';
}

export function getTierBadgeColor(tier: LoyaltyTier): { bg: string; text: string; border: string; icon: string } {
  switch (tier) {
    case 'VIP Diamante':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40', icon: '👑' };
    case 'Oro':
      return { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/40', icon: '🥇' };
    case 'Plata':
      return { bg: 'bg-slate-400/15', text: 'text-slate-300', border: 'border-slate-400/40', icon: '🥈' };
    case 'Bronce':
    default:
      return { bg: 'bg-orange-800/20', text: 'text-orange-300', border: 'border-orange-700/40', icon: '🥉' };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateWhatsAppMessage(customer: Customer, promoType: 'taco' | 'descuento' | 'puntos' | 'saludo'): string {
  const nombre = customer.name.split(' ')[0] || customer.name;
  const nivel = customer.nivel;
  const total = formatCurrency(customer.totalGastado);
  const visitas = customer.visitas;
  const puntos = customer.puntos;

  let msg = '';
  switch (promoType) {
    case 'taco':
      msg = `¡Hola *${nombre}*! 🌮 En *TA CABRÓN* valoramos mucho tu fidelidad. 
Has realizado *${visitas} visitas* con nosotros acumulando *${total}* en compras.
Como cliente *${nivel}*, ¡hoy queremos invitarte un *Taco Tradicional o Bebida Mexicana* de la casa en tu próxima visita! 🎉
Presenta este mensaje en caja. ¡Te esperamos para consentirte como te mereces! 🔥`;
      break;
    case 'descuento':
      msg = `¡Hola *${nombre}*! 🌮 En *TA CABRÓN* celebramos a nuestros clientes VIP.
Llevas *${visitas} visitas* y un acumulado de *${total}*. 
Por ser cliente nivel *${nivel}*, hoy tienes un *15% OFF* en toda tu comanda.
¡Ven hoy a saborear lo auténtico chingón! 🇲🇽`;
      break;
    case 'puntos':
      msg = `¡Hola *${nombre}*! 🌮 Tu saldo de fidelidad en *TA CABRÓN*:
⭐ *Nivel:* ${nivel}
🎟️ *Visitas:* ${visitas}
💰 *Total Compras:* ${total}
🎁 *Puntos Disponibles:* ${puntos} pts
Recuerda que puedes canjear tus puntos por tacos, quesadillas o nachos cabrones. ¡Te esperamos!`;
      break;
    case 'saludo':
    default:
      msg = `¡Hola *${nombre}*! 🌮 Desde *TA CABRÓN* queremos agradecerte por ser parte de nuestra familia taquera.
¡Ya son *${visitas} visitas* disfrutando el auténtico sabor chingón! ¿Cuándo nos vemos para unos buenos tacos al pastor y una birria calientita? 🔥`;
      break;
  }

  return encodeURIComponent(msg);
}

export function sanitizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = '57' + cleaned;
  }
  return cleaned;
}

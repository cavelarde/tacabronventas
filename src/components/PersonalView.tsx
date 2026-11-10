import React, { useState, useEffect, useRef } from 'react';
import { Employee, AttendanceRecord, NominaPeriod } from '../types';
import {
  Clock,
  Camera,
  Plus,
  Edit2,
  Send,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Copy,
  History,
  Trash2,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrency } from '../utils/loyalty';

interface ClockResult {
  success: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface PersonalViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  periodoNomina: NominaPeriod;
  onSelectPeriod: (p: NominaPeriod) => void;
  onOpenNewEmployeeModal: () => void;
  onOpenEditEmployeeModal: (emp: Employee) => void;
  onDeleteEmployee?: (empId: string) => void;
  onRegisterClock: (
    tipo: 'entrada' | 'salida',
    emp: Employee,
    photo: string
  ) => Promise<ClockResult | void>;
  onCloseShiftManual?: (recordId: string, hours?: number) => Promise<void>;
  onDeleteAttendanceRecord?: (recordId: string) => void;
}

export const PersonalView: React.FC<PersonalViewProps> = ({
  employees,
  attendance,
  periodoNomina,
  onSelectPeriod,
  onOpenNewEmployeeModal,
  onOpenEditEmployeeModal,
  onDeleteEmployee,
  onRegisterClock,
  onCloseShiftManual,
  onDeleteAttendanceRecord,
}) => {
  const [pin, setPin] = useState('');
  const [camAvailable, setCamAvailable] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedHistoryEmp, setSelectedHistoryEmp] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-dismiss feedback message after 6 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          setCamAvailable(false);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCamAvailable(true);
      } catch (e) {
        console.warn('Camera not available or permission denied', e);
        setCamAvailable(false);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const takePhotoSnapshot = (): string => {
    if (!videoRef.current || !canvasRef.current || !camAvailable) {
      return 'Sin captura';
    }
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, 160, 120);
        return canvas.toDataURL('image/jpeg', 0.5);
      }
      return 'Sin captura';
    } catch (e) {
      return 'Sin captura';
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleClearPin = () => {
    setPin('');
    setFeedback(null);
  };

  const handleBackspace = () => setPin((prev) => prev.slice(0, -1));

  // Matched employee by PIN
  const matchedEmp = pin.length === 4 ? employees.find((e) => e.pin === pin) : null;
  const activeTurno = matchedEmp
    ? attendance.find((a) => a.empId === matchedEmp.id && a.status === 'open')
    : null;

  const handleClockAction = async (tipo: 'entrada' | 'salida') => {
    if (!matchedEmp) {
      setFeedback({
        type: 'error',
        title: 'PIN No Reconocido',
        message: 'El PIN ingresado no pertenece a ningún miembro del equipo activo.',
      });
      return;
    }

    if (tipo === 'entrada' && activeTurno) {
      setFeedback({
        type: 'warning',
        title: 'Turno Ya Abierto',
        message: `${matchedEmp.name} ya tiene un turno activo hoy desde las ${activeTurno.inTime}. Debes registrar salida primero.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const photo = takePhotoSnapshot();
      const res = await onRegisterClock(tipo, matchedEmp, photo);

      if (res && res.message) {
        setFeedback({
          type: res.type || (res.success ? 'success' : 'error'),
          title: res.title || (res.success ? 'Operación Exitosa' : 'Aviso'),
          message: res.message,
        });
      } else {
        if (tipo === 'entrada') {
          setFeedback({
            type: 'success',
            title: '¡Entrada Registrada!',
            message: `Bienvenido(a) ${matchedEmp.name}. Tu turno ha comenzado exitosamente.`,
          });
        } else {
          setFeedback({
            type: 'success',
            title: '¡Salida Registrada!',
            message: `Turno cerrado para ${matchedEmp.name}. Horas registradas en la nómina.`,
          });
        }
      }
      setPin('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setFeedback({
        type: 'error',
        title: 'Error de Marcación',
        message: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Period calculations normalized to local midnight boundaries
  const calculatePeriodsForEmployee = (empId: string) => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    const diaMes = hoy.getDate();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();

    // Inicio de Quincena (1 o 16 del mes actual)
    const inicioQuincena = diaMes <= 15 ? new Date(anio, mes, 1) : new Date(anio, mes, 16);
    inicioQuincena.setHours(0, 0, 0, 0);

    // Fin de Quincena
    const finQuincena =
      diaMes <= 15
        ? new Date(anio, mes, 15, 23, 59, 59, 999)
        : new Date(anio, mes + 1, 0, 23, 59, 59, 999);

    // Inicio de Semana (Lunes de la semana en curso)
    const diaSemanaIndex = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1; // 0 = Lunes, 6 = Domingo
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - diaSemanaIndex);
    inicioSemana.setHours(0, 0, 0, 0);

    // Inicio de Mes (Día 1 del mes en curso a las 00:00:00)
    const inicioMes = new Date(anio, mes, 1, 0, 0, 0, 0);

    const empRecords = attendance.filter((a) => a.empId === empId);

    let hDia = 0;
    let hSemana = 0;
    let hQuincena = 0;
    let hMes = 0;
    let horasEnCurso = 0;

    empRecords.forEach((t) => {
      let h = 0;
      if (t.status === 'closed') {
        h = parseFloat(t.hours.toString()) || 0;
      } else if (t.status === 'open' && t.inDateObj) {
        // Horas acumuladas en el turno activo
        const ms = Math.max(0, Date.now() - new Date(t.inDateObj).getTime());
        const openH = parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
        horasEnCurso += openH;
        h = openH; // Se incluye en la estimación activa
      }

      // Convertir fecha del turno a medianoche local
      const fTurno = new Date(t.date + 'T00:00:00');

      if (t.date === hoyStr) {
        hDia += h;
      }
      if (fTurno >= inicioSemana) {
        hSemana += h;
      }
      if (fTurno >= inicioQuincena && fTurno <= finQuincena) {
        hQuincena += h;
      }
      if (fTurno >= inicioMes) {
        hMes += h;
      }
    });

    return {
      dia: parseFloat(hDia.toFixed(2)),
      semana: parseFloat(hSemana.toFixed(2)),
      quincena: parseFloat(hQuincena.toFixed(2)),
      mes: parseFloat(hMes.toFixed(2)),
      horasEnCurso: parseFloat(horasEnCurso.toFixed(2)),
    };
  };

  let totalHorasPeriodo = 0;
  let totalNominaPeriodo = 0;

  employees.forEach((emp) => {
    const h = calculatePeriodsForEmployee(emp.id);
    const hrs = h[periodoNomina];
    totalHorasPeriodo += hrs;
    totalNominaPeriodo += hrs * emp.hourlyRate;
  });

  const d = new Date();
  let nombrePeriodoTexto = 'Día de Hoy';
  if (periodoNomina === 'semana') {
    nombrePeriodoTexto = 'Semana en Curso';
  } else if (periodoNomina === 'quincena') {
    nombrePeriodoTexto =
      d.getDate() <= 15
        ? `1ª Quincena de ${d.toLocaleString('es', { month: 'long' })}`
        : `2ª Quincena de ${d.toLocaleString('es', { month: 'long' })}`;
  } else if (periodoNomina === 'mes') {
    nombrePeriodoTexto = `Mes de ${d.toLocaleString('es', { month: 'long' })}`;
  }

  const buildReceiptText = (emp: Employee) => {
    const horas = calculatePeriodsForEmployee(emp.id);
    const per = periodoNomina;
    const horasPeriodo = horas[per];
    const totalPagar = (horasPeriodo * emp.hourlyRate).toFixed(2);

    return `🧾 *DESPRENDIBLE DE PAGO (${nombrePeriodoTexto.toUpperCase()})*
📍 *TA CABRÓN 🌮*
👤 *Empleado:* ${emp.name}
💼 *Cargo:* ${emp.role}

⏱️ *RESUMEN DE HORAS TRABAJADAS:*
• Horas Hoy: ${horas.dia} hrs ($${(horas.dia * emp.hourlyRate).toFixed(2)})
• Horas Esta Semana: ${horas.semana} hrs ($${(horas.semana * emp.hourlyRate).toFixed(2)})
• Horas Esta Quincena: ${horas.quincena} hrs ($${(horas.quincena * emp.hourlyRate).toFixed(2)})
• Horas Este Mes: ${horas.mes} hrs ($${(horas.mes * emp.hourlyRate).toFixed(2)})

💵 *Tarifa por Hora:* $${emp.hourlyRate.toFixed(2)}
💰 *TOTAL A COBRAR (${nombrePeriodoTexto}):* *$${totalPagar}*

¡Gracias por tu entrega y dedicación en el equipo! 🔥`;
  };

  const sendWhatsAppReceipt = (emp: Employee) => {
    const texto = buildReceiptText(emp);
    try {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    } catch {
      // Fallback
    }
  };

  const copyReceiptToClipboard = async (emp: Employee) => {
    const texto = buildReceiptText(emp);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiedId(emp.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  // Filtered attendance records for history viewer
  const filteredAttendance = attendance.filter((a) => {
    if (selectedHistoryEmp === 'all') return true;
    return a.empId === selectedHistoryEmp;
  });

  return (
    <div className="space-y-4">
      {/* Banner de Retroalimentación / Toast en Pantalla */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-start justify-between gap-3 shadow-lg border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : feedback.type === 'warning'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              : feedback.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              : 'bg-sky-950/80 border-sky-500/50 text-sky-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {feedback.type === 'warning' && (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            {feedback.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            {feedback.type === 'info' && (
              <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-extrabold text-sm">{feedback.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{feedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selector Dinámico de Periodo Activo */}
      <div className="glass-card p-3 flex flex-wrap items-center justify-between gap-3 border-amber-500/30 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-black uppercase flex items-center gap-1">
            <span>📅</span> Periodo de Nómina:
          </span>
          <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['dia', 'semana', 'quincena', 'mes'] as NominaPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => onSelectPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize ${
                  periodoNomina === p
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-300 font-semibold bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            Liquidando: <b className="text-amber-400 font-extrabold">{nombrePeriodoTexto}</b>
          </div>
        </div>
      </div>

      {/* Tarjetas Resumen de Nómina */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">👥 Equipo Activo</span>
          <p className="text-xl font-black font-mono text-white mt-0.5">{employees.length} personas</p>
        </div>
        <div className="glass-card p-3 border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            ⌛ Horas ({periodoNomina.toUpperCase()})
          </span>
          <p className="text-xl font-black font-mono text-sky-400 mt-0.5">
            {totalHorasPeriodo.toFixed(1)} hrs
          </p>
        </div>
        <div className="glass-card p-3 border-amber-500/40 bg-amber-950/20">
          <span className="text-[10px] text-amber-300 uppercase font-bold block">
            💵 Total Nómina ({periodoNomina.toUpperCase()})
          </span>
          <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
            {formatCurrency(totalNominaPeriodo)}
          </p>
        </div>
        <div className="glass-card p-3 border-emerald-500/40 bg-emerald-950/20 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 uppercase font-bold block">⚙️ Gestión Personal</span>
          <button
            onClick={onOpenNewEmployeeModal}
            className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-1.5 px-2 rounded-lg transition shadow-sm flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo Empleado</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Reloj Checador Biométrico con Cámara & Teclado PIN */}
        <div className="lg:col-span-5 glass-card p-4 space-y-3 border-amber-500/30">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden border border-red-600 bg-[#c41212] shrink-0">
                <img src="/logo.png" alt="TA' CABRÓN" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <span>Reloj Checador Biométrico</span>
              </h3>
            </div>
            <span
              className={`text-[10px] border px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                camAvailable
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>{camAvailable ? '📸 Cámara Activa' : 'Cámara Apagada'}</span>
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!camAvailable ? 'hidden' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />
            {!camAvailable && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <Camera className="w-9 h-9 mb-1.5 text-slate-600" />
                <span className="text-xs font-bold text-slate-300">Cámara Biometría Desactivada</span>
                <span className="text-[10px] text-slate-500 max-w-xs mt-0.5">
                  La marcación por código PIN de 4 dígitos funciona directamente sin requerir cámara.
                </span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 text-[9px] bg-black/75 backdrop-blur-sm text-slate-300 px-2 py-0.5 rounded-full border border-white/10 font-mono">
              Biometría Facial POS
            </div>
          </div>

          {/* Display PIN */}
          <div>
            <div className="relative">
              <input
                type="password"
                readOnly
                value={pin}
                placeholder="Ingresa PIN (4 dígitos)"
                className="w-full text-center tracking-[0.6em] text-2xl font-mono font-black bg-slate-950 border border-slate-800 rounded-2xl py-2.5 text-amber-400 focus:outline-none focus:border-amber-500 transition shadow-inner"
              />
              {pin.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Info del empleado si PIN coincide */}
          {matchedEmp ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-amber-500/40 text-xs text-center space-y-1.5 shadow-md animate-in fade-in duration-150">
              <div className="flex items-center justify-center gap-2">
                <span className="font-black text-white text-sm">👤 {matchedEmp.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {matchedEmp.role}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                Tarifa asignada: <b className="text-emerald-400">${matchedEmp.hourlyRate.toFixed(2)}/hora</b>
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] ${
                    activeTurno
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {activeTurno
                    ? `🟢 Turno en curso desde las ${activeTurno.inTime} (${activeTurno.date})`
                    : '⚪ Sin turno activo (Listo para iniciar)'}
                </span>
              </div>
            </div>
          ) : pin.length === 4 ? (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>PIN 4 dígitos no coincide con ningún empleado.</span>
            </div>
          ) : null}

          {/* Teclado Numérico */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-black text-lg text-white transition active:scale-95 shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              className="py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-rose-950/40 text-rose-400 font-bold text-xs transition"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-black text-lg text-white transition active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800 font-bold text-base text-slate-300 transition"
            >
              ⌫
            </button>
          </div>

          {/* Botones Entrada / Salida */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleClockAction('entrada')}
              disabled={isProcessing || !matchedEmp || Boolean(activeTurno)}
              className={`py-3 rounded-xl font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-1.5 ${
                activeTurno || !matchedEmp || isProcessing
                  ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 active:scale-98'
              }`}
            >
              <span>🟢</span>
              <span>{isProcessing ? 'PROCESANDO...' : 'REGISTRAR ENTRADA'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleClockAction('salida')}
              disabled={isProcessing || !matchedEmp}
              className={`py-3 rounded-xl font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-1.5 ${
                !matchedEmp || isProcessing
                  ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                  : activeTurno
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 ring-2 ring-rose-400 active:scale-98'
                  : 'bg-rose-700/70 hover:bg-rose-600'
              }`}
            >
              <span>🔴</span>
              <span>{isProcessing ? 'PROCESANDO...' : 'REGISTRAR SALIDA'}</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-1">
            💡 Consejo: Cada empleado ingresa su PIN personal para registrar entrada o salida.
          </div>
        </div>

        {/* Planilla de Horas y Liquidación */}
        <div className="lg:col-span-7 glass-card p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Planilla de Horas y Liquidación</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Cálculo automático de salarios según turnos y marcaciones
              </p>
            </div>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg font-bold">
              Periodo: {periodoNomina.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No hay empleados registrados. Haz clic en "+ Nuevo Empleado" para comenzar.
              </div>
            ) : (
              employees.map((emp) => {
                const h = calculatePeriodsForEmployee(emp.id);
                const horasDelPeriodo = h[periodoNomina];
                const pagoPeriodo = horasDelPeriodo * emp.hourlyRate;
                const turnoActivo = attendance.find(
                  (a) => a.empId === emp.id && a.status === 'open'
                );

                return (
                  <div
                    key={emp.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition p-3.5 rounded-2xl space-y-2.5"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">{emp.name}</span>
                          <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-300 font-semibold">
                            {emp.role}
                          </span>
                          <span
                            className={`text-[10px] font-bold flex items-center gap-1 ${
                              turnoActivo ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            <span>{turnoActivo ? '🟢' : '⚪'}</span>
                            <span>{turnoActivo ? 'En Turno' : 'Fuera'}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-emerald-400 font-black">
                            Tarifa: ${emp.hourlyRate.toFixed(2)}/hr
                          </span>
                          <span className="text-slate-600 text-xs">·</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            PIN: <b className="text-amber-400 font-bold">{emp.pin}</b>
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenEditEmployeeModal(emp)}
                            className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-bold flex items-center gap-0.5 ml-1"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyReceiptToClipboard(emp)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition"
                          title="Copiar texto del desprendible"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === emp.id ? '¡Copiado!' : 'Copiar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => sendWhatsAppReceipt(emp)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition"
                          title="Enviar desprendible por WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    {/* Cuadrícula de periodos calculados */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <div
                        className={`p-1.5 rounded-lg transition ${
                          periodoNomina === 'dia'
                            ? 'bg-amber-500/20 border border-amber-500/50'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Hoy</span>
                        <span className="font-black text-slate-200 font-mono text-xs">{h.dia}h</span>
                        <span className="text-[10px] font-bold text-amber-300 block font-mono">
                          {formatCurrency(h.dia * emp.hourlyRate)}
                        </span>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg transition ${
                          periodoNomina === 'semana'
                            ? 'bg-amber-500/20 border border-amber-500/50'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Semana</span>
                        <span className="font-black text-sky-400 font-mono text-xs">{h.semana}h</span>
                        <span className="text-[10px] font-bold text-sky-300 block font-mono">
                          {formatCurrency(h.semana * emp.hourlyRate)}
                        </span>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg transition ${
                          periodoNomina === 'quincena'
                            ? 'bg-amber-500/20 border border-amber-500/50'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Quincena</span>
                        <span className="font-black text-amber-400 font-mono text-xs">{h.quincena}h</span>
                        <span className="text-[10px] font-bold text-amber-300 block font-mono">
                          {formatCurrency(h.quincena * emp.hourlyRate)}
                        </span>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg transition ${
                          periodoNomina === 'mes'
                            ? 'bg-amber-500/20 border border-amber-500/50'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Mes</span>
                        <span className="font-black text-emerald-400 font-mono text-xs">{h.mes}h</span>
                        <span className="text-[10px] font-bold text-emerald-300 block font-mono">
                          {formatCurrency(h.mes * emp.hourlyRate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-0.5 px-1 text-xs">
                      <span className="text-slate-400 font-semibold">
                        Liquidación {nombrePeriodoTexto}:
                      </span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {formatCurrency(pagoPeriodo)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Historial de Turnos y Marcaciones */}
      <div className="glass-card p-4 space-y-3 border-slate-800">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-sm text-white">Historial de Marcaciones & Turnos</h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {filteredAttendance.length} registros
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedHistoryEmp}
              onChange={(e) => setSelectedHistoryEmp(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los empleados</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-400 hover:text-white p-1 text-xs font-bold flex items-center gap-1"
            >
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="space-y-2">
            {filteredAttendance.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No hay marcaciones registradas para el filtro seleccionado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Empleado</th>
                      <th className="py-2 px-2">Fecha</th>
                      <th className="py-2 px-2">Entrada</th>
                      <th className="py-2 px-2">Salida</th>
                      <th className="py-2 px-2">Horas</th>
                      <th className="py-2 px-2">Pago Est.</th>
                      <th className="py-2 px-2">Captura</th>
                      <th className="py-2 px-2">Estado</th>
                      <th className="py-2 px-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredAttendance.slice(0, 15).map((att) => {
                      const emp = employees.find((e) => e.id === att.empId);
                      const isPhoto = att.photo && att.photo.startsWith('data:image');

                      return (
                        <tr key={att.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                            {att.empName}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {att.role}
                            </span>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap font-mono text-[11px]">
                            {att.date}
                          </td>
                          <td className="py-2 px-2 font-mono text-emerald-400 whitespace-nowrap">
                            {att.inTime || '—'}
                          </td>
                          <td className="py-2 px-2 font-mono text-rose-400 whitespace-nowrap">
                            {att.outTime || (att.status === 'open' ? 'En curso' : '—')}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-sky-400">
                            {att.hours > 0 ? `${att.hours}h` : att.status === 'open' ? 'Activo' : '0h'}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold text-amber-300">
                            {formatCurrency(att.pay || 0)}
                          </td>
                          <td className="py-2 px-2">
                            {isPhoto ? (
                              <button
                                type="button"
                                onClick={() => setPhotoPreview(att.photo || null)}
                                className="relative group rounded-lg overflow-hidden border border-slate-700 w-8 h-8 block"
                                title="Ver foto selfie de asistencia"
                              >
                                <img
                                  src={att.photo}
                                  alt="Selfie"
                                  className="w-full h-full object-cover group-hover:scale-110 transition"
                                />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">Sin foto</span>
                            )}
                          </td>
                          <td className="py-2 px-2">
                            {att.status === 'open' ? (
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 animate-pulse">
                                <span>●</span> En Turno
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-semibold">
                                Completado
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {att.status === 'open' && onCloseShiftManual && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (onCloseShiftManual) {
                                      await onCloseShiftManual(att.id);
                                      setFeedback({
                                        type: 'success',
                                        title: 'Turno Cerrado',
                                        message: `Turno de ${att.empName} cerrado correctamente por administración.`,
                                      });
                                    }
                                  }}
                                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-lg text-[10px] font-bold transition"
                                >
                                  Cerrar Turno
                                </button>
                              )}
                              {onDeleteAttendanceRecord && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteAttendanceRecord(att.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                                  title="Eliminar registro"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Vista Previa Foto Selfie */}
      {photoPreview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-card max-w-sm w-full p-4 space-y-3 border-amber-500/40 text-center">
            <div className="flex justify-between items-center pb-1">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Captura Biométrica del Marcado</span>
              </h4>
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
              <img src={photoPreview} alt="Captura Biometrica" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setPhotoPreview(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 rounded-xl text-xs transition"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

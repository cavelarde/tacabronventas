import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { X, UserCog, Trash2, AlertCircle } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  employeeToEdit: Employee | null;
  onClose: () => void;
  onSave: (employee: Employee) => Promise<void>;
  onDelete?: (employeeId: string) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  employeeToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Mesero');
  const [pin, setPin] = useState('');
  const [hourlyRate, setHourlyRate] = useState<string>('10.00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setRole(employeeToEdit.role);
      setPin(employeeToEdit.pin);
      setHourlyRate(employeeToEdit.hourlyRate.toString());
    } else {
      setName('');
      setRole('Mesero');
      setPin('');
      setHourlyRate('10.00');
    }
    setErrorMsg(null);
    setConfirmDelete(false);
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPin = pin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      setErrorMsg('El PIN debe contener exactamente 4 dígitos numéricos.');
      return;
    }

    const rateNum = parseFloat(hourlyRate);
    if (isNaN(rateNum) || rateNum < 0) {
      setErrorMsg('La tarifa por hora debe ser un valor numérico válido.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('El nombre del empleado es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const emp: Employee = {
        id: employeeToEdit ? employeeToEdit.id : 'EMP-' + Date.now(),
        name: name.trim(),
        role,
        pin: cleanPin,
        hourlyRate: rateNum,
      };
      await onSave(emp);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setErrorMsg(`Error al guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!employeeToEdit || !onDelete) return;
    onDelete(employeeToEdit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="glass-card w-full max-w-sm p-5 sm:p-6 space-y-4 border-amber-500/40 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amber-400" />
            <span>{employeeToEdit ? `Editar: ${employeeToEdit.name}` : 'Registrar Empleado'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-500/50 p-2.5 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Martínez"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Cargo / Puesto</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Mesero">Mesero / Salón</option>
              <option value="Taquero / Cocina">Taquero / Cocina</option>
              <option value="Cajero / Encargado">Cajero / Encargado</option>
              <option value="Ayudante General">Ayudante General</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-amber-400 mb-1">🔑 PIN (4 Dígitos)</label>
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="1001"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-0.5">Acceso al reloj</span>
            </div>
            <div>
              <label className="block font-bold text-emerald-400 mb-1">Tarifa Hora ($)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="10.00"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg font-mono font-black text-emerald-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-0.5">USD o tasa base</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Datos'}
            </button>
          </div>

          {employeeToEdit && onDelete && (
            <div className="pt-2 border-t border-slate-800">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Empleado</span>
                </button>
              ) : (
                <div className="bg-rose-950/40 border border-rose-800/60 p-2 rounded-xl text-center space-y-1.5">
                  <p className="text-[11px] text-rose-300 font-bold">¿Seguro de dar de baja a {employeeToEdit.name}?</p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                    >
                      No, mantener
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold rounded-lg"
                    >
                      Sí, dar de baja
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

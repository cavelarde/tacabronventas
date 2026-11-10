import React, { useState } from 'react';
import { X, Settings, Zap } from 'lucide-react';

interface SheetsConfigModalProps {
  isOpen: boolean;
  webAppUrl: string;
  onClose: () => void;
  onSaveUrl: (url: string) => void;
}

export const SheetsConfigModal: React.FC<SheetsConfigModalProps> = ({
  isOpen,
  webAppUrl,
  onClose,
  onSaveUrl,
}) => {
  const [url, setUrl] = useState(webAppUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({
        status: 'error',
        message: 'Ingresa una URL antes de probar.',
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${url}?action=test`);
      const json = await res.json();
      if (json.status === 'success') {
        setTestResult({
          status: 'success',
          message: '¡Conexión Exitosa con Google Sheets! ' + (json.message || ''),
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Respuesta: ' + JSON.stringify(json),
        });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setTestResult({
        status: 'error',
        message:
          'Error al conectar: ' +
          (err?.message || 'Fallo de red') +
          '. Asegúrate de que la Web App en Google Apps Script tenga acceso "Cualquier persona" (Anyone).',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setTestResult({
        status: 'error',
        message: 'URL inválida. Debe comenzar con https:// (por ejemplo: https://script.google.com/macros/s/.../exec)',
      });
      return;
    }
    onSaveUrl(trimmed);
    setTestResult({
      status: 'success',
      message: '¡URL Guardada Exitosamente!',
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card w-full max-w-md p-5 sm:p-6 space-y-4 border-amber-500/40">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Configurar Google Sheets Web App</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Pega la URL de tu Web App generada al implementar Google Apps Script (/exec):
        </p>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            URL de Implementación (/exec):
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {testResult && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium border ${
              testResult.status === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {testResult.message}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="w-1/2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{testing ? 'Probando...' : 'Probar Conexión'}</span>
          </button>
          <button
            onClick={handleSave}
            className="w-1/2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2 rounded-xl text-xs transition"
          >
            Guardar URL
          </button>
        </div>
      </div>
    </div>
  );
};

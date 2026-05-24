import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, className = '' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`glass-panel w-full max-w-3xl overflow-hidden ${className}`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-sky-100/70 px-6 py-4 dark:border-sky-900/40">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="rounded-full p-2 hover:bg-sky-100 dark:hover:bg-sky-500/10" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

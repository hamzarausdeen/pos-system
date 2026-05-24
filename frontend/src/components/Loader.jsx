export default function Loader({ fullScreen = false, label = 'Loading...' }) {
  return (
    <div className={fullScreen ? 'fixed inset-0 z-50 grid place-items-center bg-slate-950/50 backdrop-blur-sm' : 'grid place-items-center py-10'}>
      <div className="glass-panel flex items-center gap-3 px-5 py-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-500 dark:border-sky-300/30 dark:border-t-sky-500" />
        <span className="text-sm font-medium theme-subtitle">{label}</span>
      </div>
    </div>
  );
}

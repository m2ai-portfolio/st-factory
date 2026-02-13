interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="p-6">
      <div className="card border-red-500/30">
        <p className="text-sm text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs text-slate-300 hover:text-slate-100 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

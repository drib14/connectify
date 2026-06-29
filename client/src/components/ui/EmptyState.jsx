export default function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {Icon && (
        <div className="h-16 w-16 rounded-2xl bg-zinc-900/50 border border-zinc-900 flex items-center justify-center text-zinc-600 mb-4">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-zinc-300 mb-1">{title}</h4>
      {description && <p className="text-xs text-zinc-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function Alert({ 
  type = 'info',
  title,
  children,
  action,
  dismissible = false,
  onDismiss,
  className = '',
}) {
  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    info: 'bg-accent-500/10 border-accent-500/20 text-accent-700 dark:text-accent-400',
  };

  const [show, setShow] = React.useState(true);
  if (!show) return null;

  return (
    <div className={`
      flex gap-3 p-4 rounded-lg border
      ${colors[type]}
      ${className}
    `}>
      <div className="shrink-0 pt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {children && <p className="text-sm">{children}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {dismissible && (
        <button
          onClick={() => { setShow(false); onDismiss?.(); }}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}

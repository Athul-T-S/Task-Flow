// frontend/src/components/ui/index.jsx

import { useEffect, useRef, forwardRef } from 'react';
import { getInitials, getAvatarColor, getPriorityConfig, getStatusConfig } from '../../utils';

// ─── Button ──────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-200',
    secondary: 'bg-navy-100 text-navy-900 hover:bg-navy-200 focus:ring-2 focus:ring-navy-200',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-2 focus:ring-red-200',
    ghost: 'text-navy-600 hover:bg-navy-100',
    link: 'text-primary hover:underline p-0 h-auto',
  };

  const sizes = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <svg
      className={`animate-spin text-current ${sizes[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
export const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-5 h-5 text-2xs',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  if (!user) {
    return (
      <div className={`${sizes[size]} rounded-full bg-navy-200 flex items-center justify-center ${className}`}>
        <span className="text-navy-500">?</span>
      </div>
    );
  }

  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        title={user.name}
        className={`${sizes[size]} rounded-full object-cover border border-navy-100 ${className}`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  const color = getAvatarColor(user.name);
  const initials = getInitials(user.name);

  return (
    <div
      title={user.name}
      className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority, showLabel = false }) => {
  const config = getPriorityConfig(priority);
  return (
    <span className={`badge ${config.bg} ${config.color} border ${config.border} gap-1`} title={config.label}>
      <span className="font-bold text-2xs">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <span className={`badge ${config.bg} ${config.color} border ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', '2xl': 'max-w-3xl' };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(9,30,66,0.54)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`bg-white rounded-lg shadow-modal w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <h2 className="text-base font-semibold text-navy-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-navy-400 hover:text-navy-700 hover:bg-navy-100 p-1 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// ─── Input (with forwardRef to fix React Hook Form) ──────────────────────────
export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <input
      ref={ref}
      className={`input ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
));
Input.displayName = 'Input';

// ─── Textarea (with forwardRef) ───────────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, className = '', rows = 3, ...props }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <textarea
      ref={ref}
      rows={rows}
      className={`input resize-none ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ─── Select ──────────────────────────────────────────────────────────────────
export const Select = forwardRef(({ label, options, className = '', ...props }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={`input appearance-none cursor-pointer ${className}`} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
));
Select.displayName = 'Select';

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="text-5xl mb-4 text-navy-200">{icon}</div>}
    <h3 className="text-base font-semibold text-navy-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-navy-400 mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ─── Alert ───────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'error', message, className = '' }) => {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  if (!message) return null;
  return (
    <div className={`border rounded px-4 py-3 text-sm ${styles[type]} ${className}`}>
      {message}
    </div>
  );
};

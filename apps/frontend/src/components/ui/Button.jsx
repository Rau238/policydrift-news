const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden group
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
      text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40
      focus:ring-primary-500 active:scale-95
    `,
    secondary: `
      bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700
      text-white shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-500/40
      focus:ring-secondary-500 active:scale-95
    `,
    outline: `
      border-2 border-primary-500 text-primary-600 dark:text-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-950/30
      focus:ring-primary-500 active:scale-95
    `,
    ghost: `
      text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800
      focus:ring-slate-500 active:scale-95
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
      text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40
      focus:ring-red-500 active:scale-95
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
      text-white shadow-lg shadow-green-500/30 hover:shadow-xl shadow-green-500/40
      focus:ring-green-500 active:scale-95
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {/* Shine effect on hover */}
      <span className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-out bg-white/10"></span>
      
      {loading && (
        <svg 
          className="animate-spin h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && leftIcon && <span className="relative z-10">{leftIcon}</span>}
      <span className="relative z-10">{children}</span>
      {!loading && rightIcon && <span className="relative z-10">{rightIcon}</span>}
    </button>
  );
};

export default Button;

const Card = ({
  children,
  variant = 'default',
  hover = false,
  clickable = false,
  onClick,
  className = '',
  padding = 'default',
  shadow = 'default',
  ...props
}) => {
  const baseStyles = `
    bg-white dark:bg-slate-800 
    border border-slate-200 dark:border-slate-700
    rounded-xl
    transition-all duration-300
  `;

  const variants = {
    default: '',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50',
    gradient: 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900',
    outlined: 'bg-transparent border-2',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    xl: 'shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50',
  };

  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50' : '';
  const clickableStyles = clickable ? 'cursor-pointer active:scale-[0.98]' : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${shadows[shadow]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

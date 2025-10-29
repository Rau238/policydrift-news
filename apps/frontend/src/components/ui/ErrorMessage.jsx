import Button from './Button';

const ErrorMessage = ({ 
  message, 
  title = 'Oops! Something went wrong',
  onRetry,
  fullScreen = false,
  variant = 'error'
}) => {
  const variants = {
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500',
      title: 'text-red-900 dark:text-red-100',
      text: 'text-red-700 dark:text-red-300',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-500',
      title: 'text-yellow-900 dark:text-yellow-100',
      text: 'text-yellow-700 dark:text-yellow-300',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
      title: 'text-blue-900 dark:text-blue-100',
      text: 'text-blue-700 dark:text-blue-300',
    },
  };

  const style = variants[variant];

  const content = (
    <div className={`${style.bg} ${style.border} border-2 rounded-xl p-6 max-w-md mx-auto animate-slide-up`}>
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <div className={`${style.icon} p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg`}>
          <svg 
            className="w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {variant === 'error' && (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            )}
            {variant === 'warning' && (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            )}
            {variant === 'info' && (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            )}
          </svg>
        </div>

        {/* Title */}
        <h3 className={`${style.title} text-lg font-semibold`}>
          {title}
        </h3>

        {/* Message */}
        <p className={`${style.text} text-sm`}>
          {message || 'An unexpected error occurred. Please try again later.'}
        </p>

        {/* Retry Button */}
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant={variant === 'error' ? 'danger' : 'primary'}
            size="md"
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default ErrorMessage;

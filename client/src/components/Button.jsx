import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ButtonVariants = {
  primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  link: 'bg-transparent text-green-600 hover:underline hover:bg-transparent px-0 py-0 focus:ring-0'
};

const ButtonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-base'
};

const Button = forwardRef(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  href = undefined,
  to = undefined,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const baseClasses = "inline-flex justify-center items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const variantClasses = ButtonVariants[variant] || ButtonVariants.primary;
  const sizeClasses = ButtonSizes[size] || ButtonSizes.md;
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;
  
  const buttonClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`;
  
  const content = (
    <>
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );
  
  // If href is provided, render an anchor element
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {content}
      </a>
    );
  }
  
  // If to is provided, render a Link component
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {content}
      </Link>
    );
  }
  
  // Otherwise, render a button element
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      ref={ref}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 
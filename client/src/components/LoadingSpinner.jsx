const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-6',
    xl: 'h-16 w-16 border-8'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClass} ${className} rounded-full border-t-transparent border-green-600 animate-spin`} 
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default LoadingSpinner; 
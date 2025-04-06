import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ 
  title = 'No data available', 
  description = 'There is currently no data to display.', 
  icon = <FiInbox className="w-12 h-12 text-gray-400" />,
  actionButton = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg shadow-sm">
      <div className="text-center">
        <div className="mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
        {actionButton && (
          <div className="mt-6">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState; 
import { useState, useEffect } from 'react';
import { FiTruck, FiFilter, FiChevronDown, FiEye, FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { pickupService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

const Pickups = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setIsLoading(true);
      const response = await pickupService.getPickups();
      setPickups(response.data.data.pickups);
    } catch (error) {
      console.error('Error fetching pickups:', error);
      toast.error('Failed to load pickups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (pickupId) => {
    const pickup = pickups.find(p => p._id === pickupId);
    setSelectedPickup(pickup);
    setSelectedPickupId(pickupId);
    setShowDetailModal(true);
    setNewStatus(pickup.status); // Initialize with the current status
  };

  const handleUpdateStatus = async () => {
    if (!selectedPickupId || !newStatus || newStatus === selectedPickup.status) return;
    
    try {
      setIsUpdatingStatus(true);
      await pickupService.updatePickupStatus(selectedPickupId, newStatus);
      
      // Update local state
      setPickups(pickups.map(pickup => 
        pickup._id === selectedPickupId ? { ...pickup, status: newStatus } : pickup
      ));
      
      setSelectedPickup({ ...selectedPickup, status: newStatus });
      toast.success('Pickup status updated successfully');
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast.error(error.response?.data?.message || 'Failed to update pickup status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'REQUESTED': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <FiClock className="w-4 h-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <FiTruck className="w-4 h-4 text-indigo-500" />;
      case 'COMPLETED':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      case 'REJECTED':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPickups = statusFilter === 'ALL' 
    ? pickups 
    : pickups.filter(pickup => pickup.status === statusFilter);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if the current user is a Pickup Partner
  if (user.role !== 'PICKUP_PARTNER') {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-green-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Pickup Requests</h2>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white bg-opacity-20 text-white rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                <option value="ALL">All Pickups</option>
                <option value="REQUESTED">Requested</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FiChevronDown className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {filteredPickups.length === 0 ? (
          <EmptyState
            title={statusFilter === 'ALL' ? "No pickup requests yet" : `No ${statusFilter.toLowerCase()} pickups`}
            description={statusFilter === 'ALL' ? "You don't have any pickup requests yet" : `You don't have any pickups with status "${statusFilter.toLowerCase()}"`}
            icon={<FiTruck className="w-12 h-12 text-gray-400" />}
            actionButton={
              statusFilter !== 'ALL' ? (
                <Button 
                  onClick={() => setStatusFilter('ALL')}
                  variant="outline"
                  icon={<FiFilter />}
                >
                  Show All Pickups
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPickups.map((pickup) => (
                  <tr key={pickup._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{pickup._id.substring(pickup._id.length - 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(pickup.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiMapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {pickup.location?.address?.substring(0, 20)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pickup.status)}`}>
                        <span className="mr-1">{getStatusIcon(pickup.status)}</span>
                        {pickup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="link"
                        size="sm"
                        icon={<FiEye />}
                        onClick={() => handleViewDetails(pickup._id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pickup Detail Modal */}
      {showDetailModal && selectedPickup && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowDetailModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div>
                <div className="mt-3 sm:mt-0">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <FiTruck className="mr-2" /> Pickup Details
                  </h3>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Pickup ID:</span>
                      <span className="text-sm text-gray-900">#{selectedPickup._id}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Requested On:</span>
                      <span className="text-sm text-gray-900 flex items-center">
                        <FiCalendar className="mr-1 h-4 w-4" />
                        {formatDateTime(selectedPickup.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedPickup.status)}`}>
                        <span className="mr-1">{getStatusIcon(selectedPickup.status)}</span>
                        {selectedPickup.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Scheduled For:</span>
                      <span className="text-sm text-gray-900">
                        {selectedPickup.scheduledTime ? formatDateTime(selectedPickup.scheduledTime) : 'Not scheduled yet'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <FiMapPin className="mr-2" /> Pickup Location
                    </h4>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{selectedPickup.location?.address}</p>
                      {selectedPickup.location?.coordinates && (
                        <p className="text-xs text-gray-500">
                          Coordinates: {selectedPickup.location.coordinates.lat}, {selectedPickup.location.coordinates.lng}
                        </p>
                      )}
                      
                      <div className="mt-4">
                        <a 
                          href={`https://maps.google.com/?q=${selectedPickup.location?.coordinates?.lat},${selectedPickup.location?.coordinates?.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 text-sm hover:text-green-700 flex items-center"
                        >
                          <span>View on Google Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Materials to pickup */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Materials to Pickup</h4>
                    
                    <div className="space-y-2">
                      {selectedPickup.materials?.map((material, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{material.type || `Material #${index + 1}`}</p>
                            <p className="text-xs text-gray-500">Quantity: {material.quantity || 'N/A'} {material.unit || ''}</p>
                          </div>
                        </div>
                      ))}
                      
                      {(!selectedPickup.materials || selectedPickup.materials.length === 0) && (
                        <p className="text-sm text-gray-500 italic">No specific materials listed</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {selectedPickup.notes && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-700">{selectedPickup.notes}</p>
                    </div>
                  )}
                  
                  {/* Update Status section */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <FiClock className="mr-2" /> Update Pickup Status
                    </h4>
                    
                    <div className="flex space-x-2">
                      <select
                        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={isUpdatingStatus}
                      >
                        <option value="ACCEPTED">Accept Pickup</option>
                        <option value="IN_PROGRESS">Mark In Progress</option>
                        <option value="COMPLETED">Mark Completed</option>
                        <option value="REJECTED">Reject Pickup</option>
                      </select>
                      
                      <Button
                        onClick={handleUpdateStatus}
                        variant="primary"
                        size="sm"
                        disabled={isUpdatingStatus || newStatus === selectedPickup.status}
                        loading={isUpdatingStatus}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => setShowDetailModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pickups;
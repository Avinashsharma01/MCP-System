import { useState, useEffect } from 'react';
import { FiPackage, FiFilter, FiChevronDown, FiEye, FiCalendar, FiClock, FiShoppingBag, FiX } from 'react-icons/fi';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrders();
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    setSelectedOrder(order);
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
    setNewStatus(order.status); // Initialize with the current status
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !newStatus || newStatus === selectedOrder.status) return;
    
    try {
      setIsUpdatingStatus(true);
      await orderService.updateOrderStatus(selectedOrderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === selectedOrderId ? { ...order, status: newStatus } : order
      ));
      
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-green-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Orders</h2>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white bg-opacity-20 text-black rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 "
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FiChevronDown className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <EmptyState
            title={statusFilter === 'ALL' ? "No orders yet" : `No ${statusFilter.toLowerCase()} orders`}
            description={statusFilter === 'ALL' ? "You haven't placed any orders yet" : `You don't have any orders with status "${statusFilter.toLowerCase()}"`}
            icon={<FiPackage className="w-12 h-12 text-gray-400" />}
            actionButton={
              statusFilter !== 'ALL' ? (
                <Button 
                  onClick={() => setStatusFilter('ALL')}
                  variant="outline"
                  icon={<FiFilter />}
                >
                  Show All Orders
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
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.substring(order._id.length - 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatAmount(order.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="link"
                        size="sm"
                        icon={<FiEye />}
                        onClick={() => handleViewDetails(order._id)}
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

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
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
                    <FiPackage className="mr-2" /> Order Details
                  </h3>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Order ID:</span>
                      <span className="text-sm text-gray-900">#{selectedOrder._id}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Order Date:</span>
                      <span className="text-sm text-gray-900 flex items-center">
                        <FiCalendar className="mr-1 h-4 w-4" />
                        {formatDateTime(selectedOrder.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{formatAmount(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                  
                  {/* Items */}
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <FiShoppingBag className="mr-2" /> Order Items
                    </h4>
                    
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name || `Item #${index + 1}`}</p>
                            <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{formatAmount(item.price || 0)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Update Status section - visible only to MCP users or for specific statuses */}
                  {user && user.role === 'MCP' && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <FiClock className="mr-2" /> Update Order Status
                      </h4>
                      
                      <div className="flex space-x-2">
                        <select
                          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          disabled={isUpdatingStatus}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        
                        <Button
                          onClick={handleUpdateStatus}
                          variant="primary"
                          size="sm"
                          disabled={isUpdatingStatus || newStatus === selectedOrder.status}
                          loading={isUpdatingStatus}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  )}
                  
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

export default Orders; 
import { useState, useEffect } from 'react';
import { FiUser, FiUserPlus, FiMail, FiPhone, FiSearch, FiX, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { partnerService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

const Partners = () => {
  
  const { user, refreshTokenIfNeeded } = useAuth();
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const response = await partnerService.getPartners();
      
      // Handle the response structure from the backend
      let pickupPartners = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        pickupPartners = response.data.filter(
          partner => partner.role === 'PICKUP_PARTNER' && 
          (partner.mcpId === user.id || partner.mcpId === user._id)
        );
      } else if (response.data && response.data.data && response.data.data.partners) {
        // Nested data structure
        pickupPartners = response.data.data.partners.filter(
          partner => partner.role === 'PICKUP_PARTNER' && 
          (partner.mcpId === user.id || partner.mcpId === user._id)
        );
      } else if (response.data) {
        // Simple object response
        pickupPartners = Array.isArray(response.data) ? response.data : [response.data];
        pickupPartners = pickupPartners.filter(
          partner => partner.role === 'PICKUP_PARTNER' && 
          (partner.mcpId === user.id || partner.mcpId === user._id)
        );
      }
      
      setPartners(pickupPartners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{5,15}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Phone number must be between 5-15 digits';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Make sure we're using the correct ID format
      const mcpId = user.id || user._id;
      console.log('User object:', user);
      console.log('Using MCP ID:', mcpId);
      
      // Generate a timestamp to ensure uniqueness in phone and email
      const timestamp = new Date().getTime();
      const uniqueSuffix = timestamp.toString().substring(timestamp.toString().length - 6);
      
      const partnerData = {
        name: formData.name,
        email: formData.email,
        // Make phone unique with timestamp suffix if user didn't change the default
        phone: formData.phone.endsWith(uniqueSuffix) ? formData.phone : `${formData.phone}${uniqueSuffix}`,
        password: formData.password,
        role: 'PICKUP_PARTNER',
        mcpId: mcpId
      };
      
      console.log('Sending partner data:', partnerData);
      
      let response;
      try {
        // First attempt
        response = await partnerService.createPartner(partnerData);
      } catch (initialError) {
        if (initialError.response?.status === 401) {
          // Token might be expired, try to refresh and retry
          const refreshed = await refreshTokenIfNeeded();
          if (refreshed) {
            // Retry the request
            response = await partnerService.createPartner(partnerData);
          } else {
            throw initialError;
          }
        } else {
          throw initialError;
        }
      }
      
      console.log('Partner creation response:', response);
      toast.success('Partner created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchPartners();
    } catch (error) {
      console.error('Error creating partner:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Show specific error message from API if available
      let errorMessage = 'Failed to create partner';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleDeletePartner = async () => {
    if (!selectedPartner) return;
    
    try {
      await partnerService.deletePartner(selectedPartner._id);
      toast.success('Partner deleted successfully');
      setShowDeleteModal(false);
      setSelectedPartner(null);
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete partner');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setFormErrors({});
  };

  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.phone.includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if the current user is an MCP
  if (user.role !== 'MCP') {
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
            <h2 className="text-xl font-semibold">Pickup Partners</h2>
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="secondary"
              icon={<FiUserPlus />}
            >
              Add Partner
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm"
              placeholder="Search by name, email or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <FiX className="h-5 w-5 text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>

          {/* Partners List */}
          {partners.length === 0 ? (
            <EmptyState
              title="No pickup partners yet"
              description="You haven't added any pickup partners yet"
              icon={<FiUser className="w-12 h-12 text-gray-400" />}
              actionButton={
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  icon={<FiUserPlus />}
                >
                  Add Partner
                </Button>
              }
            />
          ) : filteredPartners.length === 0 ? (
            <EmptyState
              title="No results found"
              description={`No partners found matching "${searchQuery}"`}
              icon={<FiSearch className="w-12 h-12 text-gray-400" />}
              actionButton={
                <Button 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                >
                  Clear Search
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <div key={partner._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{partner.name}</h3>
                      <p className="text-sm text-gray-500">{partner.role}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit partner"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        title="Delete partner"
                        onClick={() => {
                          setSelectedPartner(partner);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{partner.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{partner.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Partner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowCreateModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiUserPlus className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add Pickup Partner</h3>
                  
                  <form className="mt-6 space-y-4" onSubmit={handleCreatePartner}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                          formErrors.name ? 'ring-red-300' : 'ring-gray-300'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                          formErrors.email ? 'ring-red-300' : 'ring-gray-300'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                      />
                      {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                          formErrors.phone ? 'ring-red-300' : 'ring-gray-300'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                      />
                      {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                          formErrors.password ? 'ring-red-300' : 'ring-gray-300'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                      />
                      {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:ml-3 sm:w-auto"
                      >
                        Create Partner
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3 w-full sm:mt-0 sm:w-auto"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPartner && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiTrash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Partner</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the partner <span className="font-medium">{selectedPartner.name}</span>? 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  className="w-full sm:ml-3 sm:w-auto"
                  onClick={handleDeletePartner}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners; 
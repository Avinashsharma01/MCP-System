import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { partnerService } from '../services/api';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'MCP',
    mcpId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mcpPartners, setMcpPartners] = useState([]);
  const [isLoadingMcps, setIsLoadingMcps] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.role === 'PICKUP_PARTNER') {
      fetchMcpPartners();
    }
  }, [formData.role]);

  const fetchMcpPartners = async () => {
    try {
      setIsLoadingMcps(true);
      const response = await partnerService.getPartners();
      // Filter only MCP partners
      const mcps = response.data.data.partners.filter(partner => partner.role === 'MCP');
      setMcpPartners(mcps);
    } catch (error) {
      console.error('Error fetching MCP partners:', error);
    } finally {
      setIsLoadingMcps(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (formData.role === 'PICKUP_PARTNER' && !formData.mcpId) {
      newErrors.mcpId = 'MCP selection is required for Pickup Partners';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Remove mcpId if role is not PICKUP_PARTNER
    const userData = { ...formData };
    if (userData.role !== 'PICKUP_PARTNER') {
      delete userData.mcpId;
    }
    
    try {
      const result = await register(userData);
      if (result.success) {
        navigate('/');
      } else {
        // Error is handled by the auth context (toast)
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 mx-auto">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Create new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ${
                    errors.name ? 'ring-red-300 placeholder:text-red-300' : 'ring-gray-300 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ${
                    errors.email ? 'ring-red-300 placeholder:text-red-300' : 'ring-gray-300 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ${
                    errors.password ? 'ring-red-300 placeholder:text-red-300' : 'ring-gray-300 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ${
                    errors.phone ? 'ring-red-300 placeholder:text-red-300' : 'ring-gray-300 placeholder:text-gray-400'
                  } focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="MCP">MCP (Material Collection Point)</option>
                <option value="PICKUP_PARTNER">Pickup Partner</option>
              </select>
            </div>
            
            {formData.role === 'PICKUP_PARTNER' && (
              <div>
                <label htmlFor="mcpId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select MCP Partner
                </label>
                <select
                  id="mcpId"
                  name="mcpId"
                  className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ${
                    errors.mcpId ? 'ring-red-300' : 'ring-gray-300'
                  } focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6`}
                  value={formData.mcpId}
                  onChange={handleChange}
                  disabled={isLoadingMcps || mcpPartners.length === 0}
                >
                  <option value="">Select MCP Partner</option>
                  {mcpPartners.map((mcp) => (
                    <option key={mcp._id} value={mcp._id}>
                      {mcp.name}
                    </option>
                  ))}
                </select>
                {errors.mcpId && <p className="mt-1 text-sm text-red-600">{errors.mcpId}</p>}
                {isLoadingMcps && <p className="mt-1 text-sm text-gray-500">Loading MCP partners...</p>}
                {!isLoadingMcps && mcpPartners.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">No MCP partners found. Please contact admin.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-green-300"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiUserPlus className="h-5 w-5 text-green-500 group-hover:text-green-400" />
              </span>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
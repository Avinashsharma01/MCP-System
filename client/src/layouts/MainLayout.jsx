import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUser, FiLogOut, FiMenu, FiX, FiCreditCard, FiTruck, FiPackage } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-green-600">MCP System</Link>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <FiHome className="w-4 h-4" />
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user && user.role === 'MCP' && (
                    <>
                      <Link to="/partners" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        Partners
                      </Link>
                    </>
                  )}
                  
                  <Link to="/wallet" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4" />
                    Wallet
                  </Link>
                  
                  {user && user.role === 'PICKUP_PARTNER' && (
                    <Link to="/pickups" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <FiTruck className="w-4 h-4" />
                      Pickups
                    </Link>
                  )}
                  
                  <Link to="/orders" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <FiPackage className="w-4 h-4" />
                    Orders
                  </Link>
                  
                  <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700">
                    Register
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiHome className="w-4 h-4" />
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user && user.role === 'MCP' && (
                    <Link 
                      to="/partners" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      Partners
                    </Link>
                  )}
                  
                  <Link 
                    to="/wallet" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiCreditCard className="w-4 h-4" />
                    Wallet
                  </Link>
                  
                  {user && user.role === 'PICKUP_PARTNER' && (
                    <Link 
                      to="/pickups" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiTruck className="w-4 h-4" />
                      Pickups
                    </Link>
                  )}
                  
                  <Link 
                    to="/orders" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiPackage className="w-4 h-4" />
                    Orders
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700 mx-3 my-2 py-2 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MCP System. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout; 
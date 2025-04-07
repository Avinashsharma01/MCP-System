import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiMail, FiUser, FiTruck, FiPackage, FiCreditCard } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="w-full">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-green-100 to-white py-16 sm:py-24 lg:py-32 rounded-lg">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to MCP System
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A platform for managing material collection and recycling partnerships
          </p>
          {!isAuthenticated && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Get started
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                Sign in <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="mt-12 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/profile"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiUser className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Profile</h3>
                  <p className="text-gray-600">View and edit your profile</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/wallet"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <FiCreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Wallet</h3>
                  <p className="text-gray-600">Manage your transactions</p>
                </div>
              </div>
            </Link>
            
            {user && user.role === 'MCP' && (
              <Link
                to="/partners"
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiUser className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Partners</h3>
                    <p className="text-gray-600">Manage your pickup partners</p>
                  </div>
                </div>
              </Link>
            )}
            
            {user && user.role === 'PICKUP_PARTNER' && (
              <Link
                to="/pickups"
                className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FiTruck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Pickups</h3>
                    <p className="text-gray-600">View and manage pickups</p>
                  </div>
                </div>
              </Link>
            )}
            
            <Link
              to="/orders"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FiPackage className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Orders</h3>
                  <p className="text-gray-600">Track and manage orders</p>
                </div>
              </div>
            </Link>
            
            <a
              href="mailto:support@mcpsystem.com"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <FiMail className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Support</h3>
                  <p className="text-gray-600">Contact our support team</p>
                </div>
              </div>
            </a>
            <Link
              to="/orders"
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FiPackage className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Overview</h3>
                  <p className="text-gray-600">Track and manage orders</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 
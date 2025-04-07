import { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiArrowUp, FiArrowDown, FiClock, FiFilter } from 'react-icons/fi';
import { walletService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CURRENCY = import.meta.env.VITE_DEFAULT_CURRENCY || 'INR';

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [walletData, setWalletData] = useState({ balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: 'all',
    status: '',
    page: 1,
    limit: 10
  });

  // Form states
  const [addFundsForm, setAddFundsForm] = useState({
    amount: '',
    paymentMethod: 'UPI'
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    }
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login to access your wallet');
        navigate('/login');
        return;
      }

      console.log('Fetching wallet data...');
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(filters)
      ]);
      
      console.log('Wallet Response:', walletResponse);
      console.log('Transactions Response:', transactionsResponse);

      if (walletResponse.data?.success) {
        setWalletData(walletResponse.data.data || { balance: 0 });
      } else {
        console.error('Invalid wallet response:', walletResponse);
        setError('Failed to load wallet data');
        toast.error('Failed to load wallet data');
      }

      if (transactionsResponse.data?.success) {
        setTransactions(transactionsResponse.data.transactions || []);
      } else {
        console.error('Invalid transactions response:', transactionsResponse);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        setError('Failed to load wallet data');
        toast.error('Failed to load wallet data');
      }
    } finally {
      setIsLoading(false);
      setIsTransactionsLoading(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateAmount = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid amount greater than 0');
    }
    if (numAmount > 100000) {
      throw new Error('Amount cannot exceed ₹1,00,000');
    }
    return true;
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      // Check if user is MCP
      if (user.role !== 'MCP') {
        toast.error('Only MCP users can add funds');
        return;
      }

      setIsSubmitting(true);
      validateAmount(addFundsForm.amount);
      
      console.log('Adding funds:', addFundsForm);
      const response = await walletService.addFunds(addFundsForm);
      console.log('Add funds response:', response);
      
      if (response.data?.success) {
        toast.success('Funds added successfully');
        setShowAddFundsModal(false);
        setAddFundsForm({ amount: '', paymentMethod: 'UPI' });
        await fetchData();
      } else {
        throw new Error(response.data?.message || 'Failed to add funds');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error.message || 'Failed to add funds');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      validateAmount(withdrawForm.amount);
      
      if (Number(withdrawForm.amount) > walletData.balance) {
        throw new Error('Insufficient balance');
      }
      
      console.log('Withdrawing funds:', withdrawForm);
      const response = await walletService.withdrawFunds(withdrawForm);
      console.log('Withdraw response:', response);
      
      if (response.data?.success) {
        toast.success('Withdrawal request submitted successfully');
        setShowWithdrawModal(false);
        setWithdrawForm({
          amount: '',
          bankDetails: {
            accountNumber: '',
            ifscCode: '',
            accountHolderName: ''
          }
        });
        await fetchData();
      } else {
        throw new Error(response.data?.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page only when changing other filters
    }));
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: 2
      }).format(amount || 0);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `₹0.00`;
    }
  };

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'processing': 'bg-blue-100 text-blue-800'
    };
    
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type) => {
    if (type?.toLowerCase() === 'credit') {
      return <FiArrowUp className="w-4 h-4 text-green-500" />;
    } else if (type?.toLowerCase() === 'debit') {
      return <FiArrowDown className="w-4 h-4 text-red-500" />;
    } else {
      return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            const fetchData = async () => {
              try {
                const [walletResponse, transactionsResponse] = await Promise.all([
                  walletService.getWallet(),
                  walletService.getTransactions(filters)
                ]);
                
                if (walletResponse.data?.success) {
                  setWalletData(walletResponse.data.data || { balance: 0 });
                }
                
                if (transactionsResponse.data?.success) {
                  setTransactions(transactionsResponse.data.transactions || []);
                }
              } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load wallet data');
                toast.error('Failed to load wallet data');
              } finally {
                setIsLoading(false);
              }
            };
            fetchData();
          }} 
          variant="primary" 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4">
      {/* Wallet Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Wallet</h2>
            <FiCreditCard className="w-8 h-8" />
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-green-100">Available Balance</p>
            <div className="flex items-baseline">
              <FiDollarSign className="w-6 h-6 mr-2" />
              <span className="text-3xl font-bold">
                {formatAmount(walletData.balance)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddFundsModal(true)}
            >
              Add Money
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholderText="Select end date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'credit', label: 'Credit' },
                  { value: 'debit', label: 'Debit' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={[
                  { value: '', label: 'All' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'failed', label: 'Failed' }
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Transaction History</h3>
        </div>
        
        {isTransactionsLoading ? (
          <div className="h-48 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Your transaction history will appear here"
            icon={<FiCreditCard className="w-12 h-12 text-gray-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description || 
                             (transaction.type === 'credit' ? 'Money Added' : 
                              transaction.type === 'debit' ? 'Payment' : 'Transaction')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.referenceId || transaction._id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'} {formatAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      <Modal
        isOpen={showAddFundsModal}
        onClose={() => !isSubmitting && setShowAddFundsModal(false)}
        title="Add Funds to Wallet"
      >
        <form onSubmit={handleAddFunds}>
          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              value={addFundsForm.amount}
              onChange={(e) => setAddFundsForm(prev => ({ ...prev, amount: e.target.value }))}
              required
              min="1"
              max="100000"
              disabled={isSubmitting}
            />
            <Select
              label="Payment Method"
              value={addFundsForm.paymentMethod}
              onChange={(e) => setAddFundsForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
              options={[
                { value: 'UPI', label: 'UPI' },
                { value: 'Card', label: 'Credit/Debit Card' },
                { value: 'NetBanking', label: 'Net Banking' }
              ]}
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddFundsModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Add Funds
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => !isSubmitting && setShowWithdrawModal(false)}
        title="Withdraw Funds"
      >
        <form onSubmit={handleWithdraw}>
          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              value={withdrawForm.amount}
              onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
              required
              min="1"
              max={walletData.balance}
              disabled={isSubmitting}
            />
            <Input
              label="Account Number"
              value={withdrawForm.bankDetails.accountNumber}
              onChange={(e) => setWithdrawForm(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
              }))}
              required
              disabled={isSubmitting}
            />
            <Input
              label="IFSC Code"
              value={withdrawForm.bankDetails.ifscCode}
              onChange={(e) => setWithdrawForm(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, ifscCode: e.target.value }
              }))}
              required
              disabled={isSubmitting}
              pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
              title="Please enter a valid IFSC code (e.g., HDFC0123456)"
            />
            <Input
              label="Account Holder Name"
              value={withdrawForm.bankDetails.accountHolderName}
              onChange={(e) => setWithdrawForm(prev => ({
                ...prev,
                bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value }
              }))}
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Wallet; 
import { useState, useEffect } from 'react';
import { FiCreditCard, FiDollarSign, FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import { walletService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await walletService.getWallet();
      setWalletData(response.data.data.wallet);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to load wallet data');
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsTransactionsLoading(true);
      const response = await walletService.getTransactions();
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  const formatDate = (dateString) => {
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

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PROCESSING': 'bg-blue-100 text-blue-800'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type) => {
    if (type === 'CREDIT') {
      return <FiArrowUp className="w-4 h-4 text-green-500" />;
    } else if (type === 'DEBIT') {
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
          onClick={fetchWalletData} 
          variant="primary" 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl">
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
                {walletData ? formatAmount(walletData.balance) : '₹0.00'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Add Money
            </Button>
            <Button variant="outline" size="sm">
              Withdraw
            </Button>
            <Button variant="outline" size="sm">
              Transactions
            </Button>
          </div>
        </div>
      </div>

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
                             (transaction.type === 'CREDIT' ? 'Money Added' : 
                              transaction.type === 'DEBIT' ? 'Payment' : 'Transaction')}
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
                      <span className={`text-sm font-medium ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'} {formatAmount(transaction.amount)}
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
    </div>
  );
};

export default Wallet; 
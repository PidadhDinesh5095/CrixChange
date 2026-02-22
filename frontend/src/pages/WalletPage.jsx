import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { depositFunds, getWalletBalance, withdrawFunds, getTransactionHistory } from '../store/slices/walletSlice';


 
import {
  Wallet,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  Building2,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { use } from 'react';

const WalletPage = () => {
   const [visibleTransactions, setVisibleTransactions] = useState(10);
  const tableEndRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  

  // Infinite scroll effect
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isLoading ,isDepositing,isWithdrawing,balance,frozenBalance,totalDeposited,totalWithdrawn,transactions} = useSelector((state) => state.wallet);
  
  

  const [walletData, setWalletData] = useState({
    balance:  0,
    frozenBalance:  0,  
    totalDeposited:  0, 
    totalWithdrawn:  0,
    transactions: []
  });
  
  useEffect(() => {
    console.log('WalletPage mounted, fetching wallet balance...');
    if (isAuthenticated) {
      dispatch(getWalletBalance());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if(balance !== undefined && frozenBalance !== undefined && totalDeposited !== undefined && totalWithdrawn !== undefined){
      setWalletData({
        balance: balance,
        frozenBalance: frozenBalance,
        totalDeposited: totalDeposited,
        totalWithdrawn: totalWithdrawn,
        transactions: transactions || []
      });
    }
  },[balance,frozenBalance,totalDeposited,totalWithdrawn,transactions]);
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
useEffect(() => {
    if (selectedTab === 'history') {
      const handleScroll = () => {
        if (tableEndRef.current) {
          const { bottom } = tableEndRef.current.getBoundingClientRect();
          if (bottom <= window.innerHeight + 100) {
            // Load 1 more transaction if available
            if (visibleTransactions < walletData.transactions.length) {
              setVisibleTransactions((prev) => prev + 1);
            } else if (walletData.transactions.length >= visibleTransactions) {
              // Fetch more from backend if available
              dispatch(getTransactionHistory({ skip: walletData.transactions.length, limit: 1 }));
            }
          }
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [selectedTab, visibleTransactions, walletData.transactions.length, dispatch]);
  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleDeposit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to deposit funds');
      navigate('/login', { replace: true });
      return;
    }
    if (!depositAmount  ) {
      toast.error('Please fill in all fields');
      return;
    }
    if(parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > 1000000){
      toast.error('Please enter a valid deposit amount (between ₹1 and ₹1,00,000)');
      return;
    }
    try {
      const formData = {
        amount: parseFloat(depositAmount),
        paymentMethod: selectedPaymentMethod
      };
      const result = await dispatch(depositFunds(formData));
      if (depositFunds.fulfilled.match(result)) {
        toast.success('Deposit successful!');
      } else if (depositFunds.rejected.match(result)) {
        toast.error(result.payload || 'Deposit failed. Please try again.');
      }
    }
    catch (error) {
      toast.error('Error occurred ');
    }


  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (parseFloat(withdrawAmount) > walletData.balance - walletData.frozenBalance) {
      toast.error('Insufficient funds');
      return;
    }
    const formData = {
      amount: parseFloat(withdrawAmount),
    };
    try {
      console.log('Dispatching withdrawFunds with:', formData);//debug log
      const result = await dispatch(withdrawFunds(formData));
      if (withdrawFunds.fulfilled.match(result)) {
        toast.success('Withdrawal successful!');
      } else if (withdrawFunds.rejected.match(result)) {
        toast.error(result.payload || 'Withdrawal failed. Please try again.');
      }
    }
    catch (error) {
      toast.error('Error occurred during withdrawal process');
    }
    
    
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Instant transfer via UPI' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Pay with your card' },
    { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'Direct bank transfer' }
  ];


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading wallet..." />
      </div>
    );
  }
  return (
    <div className="min-h-screen font-sans text-1xl bg-gray-50 dark:bg-[#000] py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#fff]">
                Wallet
              </h1>
              <p className="mt-2 text-gray-600 dark:text-[#fff]">
                Manage your funds and transaction history
              </p>
            </div>
          </div>
        </motion.div>

        {/* Wallet Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff]">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#fff]">
                  {formatCurrency(walletData.balance - walletData.frozenBalance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1">
                  Ready to trade
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff]">Frozen Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#fff]">
                  {formatCurrency(walletData.frozenBalance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1">
                  In pending orders
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff]">Total Deposited</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#fff]">
                  {formatCurrency(walletData.totalDeposited)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1">
                  All time
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-[#fff]">Total Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#fff]">
                  {formatCurrency(walletData.totalWithdrawn)}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff] mt-1">
                  All time
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-[#fff]">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'deposit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedTab('deposit')}
              >
                Deposit
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'withdraw'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedTab('withdraw')}
              >
                Withdraw
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                onClick={() => setSelectedTab('history')}
              >
                History
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff] mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedTab('deposit')}
                    className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">Add Money</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Deposit funds to your wallet</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setSelectedTab('withdraw')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Minus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">Withdraw Money</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Transfer funds to your bank</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff]">
                    Recent Transactions
                  </h3>
                  <button
                    onClick={() => setSelectedTab('history')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {walletData.transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#111] rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {transaction.type === 'deposit' ? 'Money Added' : 'Money Withdrawn'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${transaction.type === 'deposit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                          }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'deposit' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff] mb-6">
                  Add Money to Wallet
                </h3>

                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        className="form-input pl-8"
                        placeholder="Enter amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 flex space-x-2">
                      {[1000, 5000, 10000, 25000].map((amount) => (
                        <button
                          key={amount}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => setDepositAmount(amount.toString())}
                        >
                          ₹{amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div
                            key={method.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {method.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isDepositing
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : depositAmount && parseFloat(depositAmount) > 0
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isDepositing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-[#000] mr-2"></div>
                        Processing deposit...
                      </div>
                    ) : (
                      `Add ₹${depositAmount || '0'} to Wallet`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'withdraw' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff] mb-6">
                  Withdraw Money
                </h3>

                <div className="space-y-6">
                  {/* Available Balance Info */}
                  <div className="bg-blue-50 dark:bg-[#111] rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Available for withdrawal: <strong>{formatCurrency(walletData.balance - walletData.frozenBalance)}</strong>
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        className="form-input pl-8"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        max={walletData.balance - walletData.frozenBalance}
                      />
                    </div>
                  </div>

                  {/* Bank Account Info */}
                  <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-[#fff] mb-2">
                      Withdrawal will be processed to:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-[#fff]">
                      HDFC Bank - Account ending in 1234
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#fff] mt-1">
                      Processing time: 1-2 business days
                    </p>
                  </div>

                  {/* Withdraw Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (walletData.balance - walletData.frozenBalance)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isWithdrawing
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : withdrawAmount && parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= (walletData.balance - walletData.frozenBalance)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isWithdrawing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-[#000] mr-2"></div>
                        Processing withdrawal...
                      </div>
                    ) : (
                      `Withdraw ₹${withdrawAmount || '0'}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'history' && (
            <div className="bg-white dark:bg-[#000] rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#fff]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#fff]">
                  Transaction History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#fff]">
                  <thead className="bg-gray-50 dark:bg-[#111]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#000] divide-y divide-gray-200 dark:divide-[#fff]">
                    {walletData.transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-300">No transactions found</td>
                      </tr>
                    ) : (
                      walletData.transactions.slice(0, visibleTransactions).map((transaction) => (
                        <tr key={transaction._id || transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDateTime(transaction.createdAt || transaction.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {transaction.type === 'credit' ? (
                                <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                              )}
                              <span className="text-sm text-gray-900 dark:text-white capitalize">
                                {transaction.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {transaction.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${transaction.type === 'credit'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                              }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {transaction.reference}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr ref={tableEndRef}></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WalletPage;
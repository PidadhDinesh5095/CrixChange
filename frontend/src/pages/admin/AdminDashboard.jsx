import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  DollarSign, 
  BarChart3,
  Settings,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKYC: 0,
    totalVolume: 0,
    totalRevenue: 0,
    activeTrades: 0
  });

  useEffect(() => {
    // Simulate loading admin data
    setTimeout(() => {
      setDashboardStats({
        totalUsers: 12500,
        activeUsers: 8750,
        pendingKYC: 245,
        totalVolume: 15750000,
        totalRevenue: 125000,
        activeTrades: 1250
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const sidebarItems = [
    { path: '/admin', label: 'Overview', icon: BarChart3 },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/kyc', label: 'KYC Reviews', icon: Shield },
    { path: '/admin/transactions', label: 'Transactions', icon: DollarSign },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
          </div>
          <nav className="mt-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<AdminOverview stats={dashboardStats} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/kyc" element={<KYCReviews />} />
            <Route path="/transactions" element={<TransactionManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AdminOverview = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor platform performance and manage operations
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeUsers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +8% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingKYC}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Requires attention
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
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalVolume)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +25% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +18% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Trades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeTrades.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Live trading sessions
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'user', message: 'New user registration: john.doe@email.com', time: '2 minutes ago' },
              { type: 'kyc', message: 'KYC application submitted by user ID: 12345', time: '5 minutes ago' },
              { type: 'trade', message: 'Large trade executed: ₹50,000 volume', time: '8 minutes ago' },
              { type: 'withdrawal', message: 'Withdrawal request: ₹25,000 pending approval', time: '12 minutes ago' },
              { type: 'alert', message: 'System alert: High trading volume detected', time: '15 minutes ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'alert' ? 'bg-red-500' :
                  activity.type === 'kyc' ? 'bg-yellow-500' :
                  activity.type === 'trade' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Placeholder components for other admin routes
const UserManagement = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">User Management</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <p className="text-gray-600 dark:text-gray-400">User management interface would be implemented here.</p>
    </div>
  </div>
);

const KYCReviews = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">KYC Reviews</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <p className="text-gray-600 dark:text-gray-400">KYC review interface would be implemented here.</p>
    </div>
  </div>
);

const TransactionManagement = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Transaction Management</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <p className="text-gray-600 dark:text-gray-400">Transaction management interface would be implemented here.</p>
    </div>
  </div>
);

const Reports = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Reports</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <p className="text-gray-600 dark:text-gray-400">Reports interface would be implemented here.</p>
    </div>
  </div>
);

const AdminSettings = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Settings</h1>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <p className="text-gray-600 dark:text-gray-400">Admin settings interface would be implemented here.</p>
    </div>
  </div>
);

export default AdminDashboard;
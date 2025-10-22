import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, TrendingUp } from 'lucide-react';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const result = await dispatch(forgotPassword(email));
      if (forgotPassword.fulfilled.match(result)) {
        setIsSubmitted(true);
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#000] font-raleway flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-[#fff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600 dark:text-[#fff]" />
            </div>
            <h2 className="text-3xl font-bold text-black dark:text-[#fff] mb-4 font-raleway">
              Check Your Email
            </h2>
            <p className="text-gray-600 dark:text-[#fff] mb-8 font-raleway">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 rounded-sm text-sm font-bold font-raleway text-white bg-black dark:bg-[#fff] dark:text-[#000] hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Back to Login
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full flex justify-center py-3 px-4 rounded-sm text-sm font-bold font-raleway text-black dark:text-[#fff] bg-white dark:bg-[#000] border border-gray-300 dark:border-[#fff] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                Try Different Email
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] font-raleway flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white dark:text-black" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white tracking-tight">
                CRIXCHANGE
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-black dark:text-[#fff] font-raleway">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#fff] font-raleway">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
          <form className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway pl-10 border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-sm font-bold font-raleway text-white bg-black dark:bg-[#fff] dark:text-[#000] hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-[#000] mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-bold font-raleway text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
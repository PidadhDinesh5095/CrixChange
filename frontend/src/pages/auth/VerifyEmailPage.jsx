import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, TrendingUp } from 'lucide-react';
import { verifyEmail, resendVerification, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      console.log("Starting email verification with token:", token);
      handleVerification();
    }
  }, [token]);

  
  const handleVerification = async () => {
    try {
      console.log("Dispatching verifyEmail with token:", token);
      const result = await dispatch(verifyEmail(token));
      if (verifyEmail.fulfilled.match(result)) {
        setVerificationStatus('success');
        toast.success('Email verified successfully!');
        setTimeout(() => {
          if (isAuthenticated) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }, 3000);
      }
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const result = await dispatch(resendVerification(email));
      if (resendVerification.fulfilled.match(result)) {
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Verifying Your Email
            </h2>
            <p className="text-black dark:text-white">
              Please wait while we verify your email address...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Email Verified!
            </h2>
            <p className="text-black dark:text-white mb-8">
              Your email has been successfully verified. You can now access all features of CrixChange.
            </p>
            <div className="space-y-4">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="w-full flex justify-center py-3 px-4 border border-black dark:border-white rounded-md shadow-sm text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
              >
                {isAuthenticated ? "Go to Dashboard" : "Continue to Login"}
              </Link>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Verification Failed
            </h2>
            <p className="text-black dark:text-white mb-8">
              The verification link is invalid or has expired. Please request a new verification email.
            </p>
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-black dark:border-white rounded-md shadow-sm text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black dark:border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-black dark:border-white rounded-md shadow-sm text-sm font-medium text-black dark:text-white bg-white dark:bg-black hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white dark:text-black" />
            </div>
            <span className="text-3xl font-bold text-black dark:text-white">
              CrixChange
            </span>
          </Link>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
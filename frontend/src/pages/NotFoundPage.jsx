import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, TrendingUp } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            
              <Link to="/" className="flex flex-row justify-center space-x-3  text-6xl font-bold flex-shrink-0">
                <h1 >Crixchange<span className='text-red-500 ml-[0.5] font-bold'>.</span></h1>
              </Link>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-9xl font-bold text-red-500 dark:text-red-500 mb-4 font-sans"
            >
              404
            </motion.h1>
          </div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4 font-sans">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 font-sans">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <p className="text-md text-gray-500 dark:text-gray-500 font-sans">
              Don't worry, even the best traders sometimes take a wrong turn.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
          >
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-bold font-sans text-black dark:text-white bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold font-sans text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home Page
            </Link>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-black dark:text-white mb-4 font-sans">
              Looking for something specific?
            </h3>
            <div className="grid grid-cols-2 gap-4 text-base font-sans">
              <Link
                to="/trading"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-bold"
              >
                Trading Dashboard
              </Link>
              <Link
                to="/portfolio"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-bold"
              >
                Portfolio
              </Link>
              <Link
                to="/leaderboard"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-bold"
              >
                Leaderboard
              </Link>
              <Link
                to="/wallet"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-bold"
              >
                Wallet
              </Link>
            </div>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white font-sans"
                placeholder="Search for teams, matches, or features..."
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
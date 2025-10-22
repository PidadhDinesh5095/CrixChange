import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  TrendingUp,
  Wallet,
  BarChart3,
  Trophy,
  Bell,
  Activity
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const navLinks = [
    { to: '/dashboard', label: 'DASHBOARD', icon: BarChart3 },
    { to: '/trading', label: 'TRADING', icon: TrendingUp },
    { to: '/portfolio', label: 'PORTFOLIO', icon: User },
    { to: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
    { to: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    
  ];

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white dark:bg-black shadow-lg border-b-2 border-black dark:border-white sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center h-16 justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white dark:text-black" />
            </div>
            <span className="text-2xl font-bold text-black dark:text-white tracking-tight">
              CRIXCHANGE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${
                    isActiveLink(link.to)
                      ? 'text-white dark:text-black bg-black dark:bg-white'
                      : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Right Side (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Live Market Indicator */}
            

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-black dark:bg-white rounded-full"></span>
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <span className="text-white dark:text-black text-sm font-bold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-bold">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border-2 border-black dark:border-white rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-gray-800"
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm text-black dark:text-white font-bold">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {user?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-bold"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            PROFILE
                          </Link>
                          <Link
                            to="/wallet"
                            className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-bold"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Wallet className="w-4 h-4 mr-3" />
                            WALLET
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-bold"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            SETTINGS
                          </Link>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-bold"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            SIGN OUT
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t-2 border-black dark:border-white py-4"
            >
              <nav className="space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-bold transition-colors ${
                        isActiveLink(link.to)
                          ? 'text-white dark:text-black bg-black dark:bg-white'
                          : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                {/* Mobile: Theme toggle, profile/auth buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={handleThemeToggle}
                    className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  {isAuthenticated ? (
                    <>
                      <button className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-black dark:bg-white rounded-full"></span>
                      </button>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-bold rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        {user?.firstName} {user?.lastName}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 font-bold rounded-lg"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        SIGN OUT
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        LOGIN
                      </Link>
                      <Link
                        to="/register"
                        className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        REGISTER
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
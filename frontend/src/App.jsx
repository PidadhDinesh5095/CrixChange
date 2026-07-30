import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { useAppDispatch } from './hooks/redux';
import { initializeTheme } from './store/slices/themeSlice';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

import TradingPage from './pages/TradingPage';
import PortfolioPage from './pages/PortfolioPage';
import WalletPage from './pages/WalletPage';


import ProfilePage from './pages/ProfilePage';
import KYCPage from './pages/KYCPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import MatchPerformancePage from './pages/MatchPerformancePage';
import PrivacyPolicy from './pages/privacy-policy';
import TermsConditions from './pages/terms-conditions';
import IPOsPage from './pages/IPOsPage';
import IPODetailsPage from './pages/IPODetailsPage';
import CricketTradingChart from '../src/components/layout/CustomChart.jsx';
import AboutUs from './pages/AboutUs.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import RiskDisclosure from './pages/RiskDisclosure.jsx';
import Contact from './pages/ContactUs.jsx';


import './App.css';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error here
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500">
          Something went wrong.<br />
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize theme on app start
    dispatch(initializeTheme());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200 overflow-y-scroll no-scrollbar">
      <Router>
        <Header />
        <ErrorBoundary>
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <HomePage />
                  <Footer />
                </>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

              
              <Route
                path="/markets"
                element={
                 
                    
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <TradingPage />
                    </React.Suspense>
                 
                }
              />
             
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <PortfolioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ipos"
                element={
                
                    <IPOsPage />
                  
                }
              />
              <Route
                path="/ipos/:id"
                element={
                  <ProtectedRoute>
                    <IPODetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              
             
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={<AboutUs />}
              />
              <Route
                path="/how-it-works"
                element={<HowItWorks />}
              />
              <Route
                path="/risk"
                element={<RiskDisclosure />}
              />
              <Route
                path="/contact"
                element={<Contact />}
              />
              <Route
                path="/kyc"
                element={
                  <ProtectedRoute>
                    <KYCPage />
                  </ProtectedRoute>
                }
              />

              {/* Match Performance Route */}
              <Route
                path="/match-performance/:id"
                element={<CricketTradingChart />}
              />
               <Route
                path="/privacy"
                element={<PrivacyPolicy />}
              />
               <Route
                path="/terms"
                element={<TermsConditions />}
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </ErrorBoundary>
        {/* Footer only for home page */}
      </Router>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#000000',
            color: '#ffffff',
            border: '1px solid #ffffff',
            fontFamily: 'Darker Grotesque',
            fontWeight: 'bold',
          },
          success: {
            style: {
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #000000',
            },
          },
          error: {
            style: {
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #ffffff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent/>
    </Provider>
  );
}

export default App;
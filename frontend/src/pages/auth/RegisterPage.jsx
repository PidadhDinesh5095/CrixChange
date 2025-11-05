import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, TrendingUp } from 'lucide-react';
import { register, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
      !formData.password || !formData.dateOfBirth || !formData.gender) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    // Check age (must be 18+)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      toast.error('You must be at least 18 years old to register');
      return;
    }

    try {
      const result = await dispatch(register(formData));
      if (register.fulfilled.match(result)) {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is handled by the slice and shown via toast
    }
  };

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
            <Link to="/" className="flex flex-row justify-center space-x-3  text-6xl font-bold flex-shrink-0">
              <h1 >Crixchange<span className='text-red-500 ml-[0.5] font-bold'>.</span></h1>
            </Link>
            <h2 className="text-4xl font-bold text-black dark:text-[#fff]  font-grotesque">
              Create Account
            </h2>
            <p className="mt-2 text-md text-gray-600 dark:text-[#fff] font-raleway">
              Join thousands of traders on India's premier sports stock exchange
            </p>
          </div>

          {/* Form */}
          <form className="bg-gray-50 dark:bg-[#000] border border-gray-200 dark:border-[#fff] rounded-sm p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway pl-10 border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
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
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway pl-10 border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway pl-10 border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway pl-10 pr-10 border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-black dark:text-[#fff] mb-2 font-raleway">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-[#000] text-black dark:text-[#fff] rounded-sm font-raleway pl-10 pr-10 border border-gray-300 dark:border-[#fff] focus:ring-2 focus:ring-black dark:focus:ring-[#fff]"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-black dark:text-[#fff] font-raleway">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-[#fff] font-raleway">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-raleway"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
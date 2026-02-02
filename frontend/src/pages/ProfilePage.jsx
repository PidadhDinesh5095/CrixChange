import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Bell,
  Moon,
  Sun,
  Edit,
  Save,
  X,
  Camera,
  Settings,
  Lock
} from 'lucide-react';
import { updateProfile, changePassword } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { isDark } = useSelector((state) => state.theme);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    trades: true,
    deposits: true,
    withdrawals: true,
    kyc: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setNotifications(user.preferences?.notifications || notifications);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  const handleSaveProfile = async () => {
    try {
      const result = await dispatch(updateProfile({
        ...profileData,
        preferences: {
          ...user.preferences,
          notifications
        }
      }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const result = await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }));
      if (changePassword.fulfilled.match(result)) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const getKYCStatusBadge = () => {
    const status = user?.kycStatus || 'pending';
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Pending' },
      submitted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Rejected' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-black dark:text-white">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-black rounded-xl shadow-lg p-6">
              <div className="text-center">
                <div className="relative inline-block">
<<<<<<< HEAD
                  <div className="w-24 h-24 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white dark:text-black">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
=======
                  <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-black text-white dark:text-black">
                      {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
>>>>>>> master
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-black dark:text-white mb-4">
                  {user.email}
                </p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Shield className="w-4 h-4 text-black dark:text-white" />
                  <span className="text-sm text-black dark:text-white">KYC Status:</span>
                  {getKYCStatusBadge()}
                  {user.kycStatus === 'pending' && (
                    <button
                      onClick={() => window.location.href = '/kyc'}
                      className="ml-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      Complete KYC
                    </button>
                  )}
                </div>
                
              </div>
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Personal Information */}
            <div className="bg-white dark:bg-black rounded-xl shadow-lg">
              <div className="p-6 border-b border-black dark:border-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    {isEditing ? <X className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label text-black dark:text-white">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                      <input
                        type="text"
                        name="firstName"
                        className={`form-input pl-10 text-black dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-black' : ''}`}
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-black dark:text-white">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-input text-black dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-black' : ''}`}
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="form-label text-black dark:text-white">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                      <input
                        type="email"
                        name="email"
                        className="form-input pl-10 text-black dark:text-white bg-gray-100 dark:bg-black"
                        value={profileData.email}
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-black dark:text-white">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black dark:text-white" />
                      <input
                        type="tel"
                        name="phone"
                        className={`form-input pl-10 text-black dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-black' : ''}`}
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-black rounded-xl shadow-lg">
              <div className="p-6 border-b border-black dark:border-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Security Settings
                  </h3>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="inline-flex items-center px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Change Password
                  </button>
                </div>
              </div>
              {isChangingPassword && (
                <div className="p-6 border-b border-black dark:border-white">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label text-black dark:text-white">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="form-input text-black dark:text-white"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="form-label text-black dark:text-white">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-input text-black dark:text-white"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="form-label text-black dark:text-white">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-input text-black dark:text-white"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsChangingPassword(false)}
                        className="px-4 py-2 text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Preferences */}
            <div className="bg-white dark:bg-black rounded-xl shadow-lg">
              <div className="p-6 border-b border-black dark:border-white">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Notification Preferences
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-black dark:text-white" />
                        <div>
                          <p className="font-medium text-black dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-black dark:text-white">
                            Receive notifications for {key.toLowerCase()} activities
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-900'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* App Preferences */}
            <div className="bg-white dark:bg-black rounded-xl shadow-lg">
              <div className="p-6 border-b border-black dark:border-white">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  App Preferences
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isDark ? (
                      <Moon className="w-5 h-5 text-black" />
                    ) : (
                      <Sun className="w-5 h-5 text-black" />
                    )}
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        Dark Mode
                      </p>
                      <p className="text-sm text-black dark:text-white">
                        Switch between light and dark themes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(toggleTheme())}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-black' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
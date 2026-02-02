import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  CreditCard,
  Camera,
  FileText,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { submitKYC } from '../store/slices/kycSlice';

const KYCPage = () => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [employmentType, setEmploymentType] = useState('');
  const [kycData, setKycData] = useState({
    personalInfo: {
      fullName: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    documents: {
      aadhaar: {
        number: '',
        frontImage: null,
        backImage: null
      },
      pan: {
        number: '',
        image: null
      },
      selfie: null,
      bankStatement: null
    },
    bankAccount: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
      accountType: 'savings'
    },
    employment: {
      status: '',
      company: '',
      designation: '',
      annualIncome: '',
      incomeSource: ''
    },
    tradingExperience: {
      hasTraded: false,
      experience: 'beginner',
      riskTolerance: 'medium'
    }
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Document Upload', icon: FileText },
    { id: 3, title: 'Bank Details', icon: CreditCard },
    { id: 4, title: 'Employment Info', icon: Shield },
    { id: 5, title: 'Trading Experience', icon: CheckCircle }
  ];

  const handleInputChange = (section, field, value) => {
    if (section === 'address') {
      setKycData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          address: {
            ...prev.personalInfo.address,
            [field]: value
          }
        }
      }));
    } else if (typeof field === 'object') {
      setKycData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field.parent]: {
            ...prev[section][field.parent],
            [field.child]: value
          }
        }
      }));
    } else {
      setKycData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
    // Special handling for employment status to update employmentType state
    if (section === 'employment' && field === 'status') {
      setEmploymentType(value);
    }
  };

  const handleFileUpload = (section, field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    if (section === 'documents' && typeof field === 'object') {
      setKycData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field.parent]: {
            ...prev.documents[field.parent],
            [field.child]: file
          }
        }
      }));
    } else {
      setKycData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: file
        }
      }));
    }
  };

  // Validation helpers
  const validateField = (section, field, value) => {
    switch (field) {
      case 'fatherName':
      case 'motherName':
        if (!value || value.trim().length < 3) return 'Name must be at least 3 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name must contain only letters and spaces';
        return '';
      case 'maritalStatus':
        if (!value) return 'Marital status is required';
        return '';
      case 'city':
      case 'state':
        if (!value || value.trim().length < 2) return 'Required, min 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters and spaces allowed';
        return '';
      case 'street':
        if (!value || value.trim().length < 5) return 'Street address must be at least 5 characters';
        return '';
      case 'pincode':
        if (!/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
        return '';
      case 'aadhaarNumber':
        if (!/^\d{12}$/.test(value)) return 'Aadhaar number must be 12 digits';
        return '';
      case 'panNumber':
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return 'PAN must be in format ABCDE1234F';
        return '';
      case 'accountNumber':
        if (!/^\d{9,18}$/.test(value)) return 'Account number must be 9-18 digits';
        return '';
      case 'ifscCode':
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) return 'Invalid IFSC code';
        return '';
      case 'bankName':
        if (!value || value.trim().length < 3) return 'Bank name must be at least 3 characters';
        return '';
      case 'accountHolderName':
        if (!value || value.trim().length < 3) return 'Account holder name must be at least 3 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters and spaces allowed';
        return '';
      case 'accountType':
        if (!value) return 'Account type is required';
        return '';
      case 'status':
        if (!value) return 'Employment status is required';
        return '';
      case 'annualIncome':
        if (!value || isNaN(value) || Number(value) < 10000) return 'Enter valid annual income';
        return '';
      case 'incomeSource':
        if (!value) return 'Income source is required';
        return '';
      case 'company':
        if (value && value.length < 2) return 'Company name must be at least 2 characters';
        return '';
      case 'designation':
        if (value && value.length < 2) return 'Designation must be at least 2 characters';
        return '';
      case 'hasTraded':
        if (value !== true && value !== false) return 'Select yes or no';
        return '';
      case 'experience':
        if (!value) return 'Select experience level';
        return '';
      case 'riskTolerance':
        if (!value) return 'Select risk tolerance';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const errs = {};

    // Personal Info
    if (!kycData.personalInfo.fatherName || validateField('personalInfo', 'fatherName', kycData.personalInfo.fatherName))
      errs.fatherName = validateField('personalInfo', 'fatherName', kycData.personalInfo.fatherName);
    if (!kycData.personalInfo.motherName || validateField('personalInfo', 'motherName', kycData.personalInfo.motherName))
      errs.motherName = validateField('personalInfo', 'motherName', kycData.personalInfo.motherName);
    if (!kycData.personalInfo.maritalStatus || validateField('personalInfo', 'maritalStatus', kycData.personalInfo.maritalStatus))
      errs.maritalStatus = validateField('personalInfo', 'maritalStatus', kycData.personalInfo.maritalStatus);
    if (!kycData.personalInfo.address.street || validateField('address', 'street', kycData.personalInfo.address.street))
      errs.street = validateField('address', 'street', kycData.personalInfo.address.street);
    if (!kycData.personalInfo.address.city || validateField('address', 'city', kycData.personalInfo.address.city))
      errs.city = validateField('address', 'city', kycData.personalInfo.address.city);
    if (!kycData.personalInfo.address.state || validateField('address', 'state', kycData.personalInfo.address.state))
      errs.state = validateField('address', 'state', kycData.personalInfo.address.state);
    if (!kycData.personalInfo.address.pincode || validateField('address', 'pincode', kycData.personalInfo.address.pincode))
      errs.pincode = validateField('address', 'pincode', kycData.personalInfo.address.pincode);

    // Aadhaar
    if (!kycData.documents.aadhaar.number || validateField('aadhaar', 'aadhaarNumber', kycData.documents.aadhaar.number))
      errs.aadhaarNumber = validateField('aadhaar', 'aadhaarNumber', kycData.documents.aadhaar.number);
    if (!kycData.documents.aadhaar.frontImage)
      errs.aadhaarFront = 'Aadhaar front image required';
    if (!kycData.documents.aadhaar.backImage)
      errs.aadhaarBack = 'Aadhaar back image required';

    // PAN
    if (!kycData.documents.pan.number || validateField('pan', 'panNumber', kycData.documents.pan.number))
      errs.panNumber = validateField('pan', 'panNumber', kycData.documents.pan.number);
    if (!kycData.documents.pan.image)
      errs.panImage = 'PAN image required';

    // Selfie
    if (!kycData.documents.selfie)
      errs.selfie = 'Selfie is required';

    // Bank
    if (!kycData.bankAccount.accountNumber || validateField('bankAccount', 'accountNumber', kycData.bankAccount.accountNumber))
      errs.accountNumber = validateField('bankAccount', 'accountNumber', kycData.bankAccount.accountNumber);
    if (!kycData.bankAccount.ifscCode || validateField('bankAccount', 'ifscCode', kycData.bankAccount.ifscCode))
      errs.ifscCode = validateField('bankAccount', 'ifscCode', kycData.bankAccount.ifscCode);
    if (!kycData.bankAccount.bankName || validateField('bankAccount', 'bankName', kycData.bankAccount.bankName))
      errs.bankName = validateField('bankAccount', 'bankName', kycData.bankAccount.bankName);
    if (!kycData.bankAccount.accountHolderName || validateField('bankAccount', 'accountHolderName', kycData.bankAccount.accountHolderName))
      errs.accountHolderName = validateField('bankAccount', 'accountHolderName', kycData.bankAccount.accountHolderName);
    if (!kycData.bankAccount.accountType || validateField('bankAccount', 'accountType', kycData.bankAccount.accountType))
      errs.accountType = validateField('bankAccount', 'accountType', kycData.bankAccount.accountType);

    // Employment
    if (!kycData.employment.status || validateField('employment', 'status', kycData.employment.status))
      errs.status = validateField('employment', 'status', kycData.employment.status);
    if (!kycData.employment.annualIncome || validateField('employment', 'annualIncome', kycData.employment.annualIncome))
      errs.annualIncome = validateField('employment', 'annualIncome', kycData.employment.annualIncome);
    if (!kycData.employment.incomeSource || validateField('employment', 'incomeSource', kycData.employment.incomeSource))
      errs.incomeSource = validateField('employment', 'incomeSource', kycData.employment.incomeSource);
    if (kycData.employment.company && validateField('employment', 'company', kycData.employment.company))
      errs.company = validateField('employment', 'company', kycData.employment.company);
    if (kycData.employment.designation && validateField('employment', 'designation', kycData.employment.designation))
      errs.designation = validateField('employment', 'designation', kycData.employment.designation);

    // Trading
    if (typeof kycData.tradingExperience.hasTraded !== 'boolean')
      errs.hasTraded = 'Please select yes or no';
    if (!kycData.tradingExperience.experience)
      errs.experience = 'Select experience level';
    if (!kycData.tradingExperience.riskTolerance)
      errs.riskTolerance = 'Select risk tolerance';

    setErrors(errs);
    return errs;
  };

  const validateStep = (step) => {
    const errs = validateAll();
    switch (step) {
      case 1:
        return !errs.fatherName && !errs.motherName && !errs.maritalStatus && !errs.street && !errs.city && !errs.state && !errs.pincode;
      case 2:
        return !errs.aadhaarNumber && !errs.aadhaarFront && !errs.aadhaarBack && !errs.panNumber && !errs.panImage && !errs.selfie;
      case 3:
        return !errs.accountNumber && !errs.ifscCode && !errs.bankName && !errs.accountHolderName && !errs.accountType;
      case 4:
        return !errs.status && !errs.annualIncome && !errs.incomeSource && !errs.company && !errs.designation;
      case 5:
        return !errs.hasTraded && !errs.experience && !errs.riskTolerance;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please fix validation errors');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Prepare the complete KYC data object
      const completeKycData = {
        personalInfo: kycData.personalInfo,
        documents: kycData.documents,
        bankAccount: kycData.bankAccount,
        employment: kycData.employment,
        tradingExperience: kycData.tradingExperience
      };

      console.log('Complete KYC Data being submitted:', completeKycData);
      console.log('Documents:', kycData.documents);

      // Dispatch redux thunk with the complete data object
      const resultAction = await dispatch(submitKYC(completeKycData));
      if (submitKYC.fulfilled.match(resultAction)) {
        toast.success('KYC application submitted successfully!');
        // Optionally: redirect or update UI
      } else {
        toast.error(resultAction.payload || 'Failed to submit KYC application');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error('Failed to submit KYC application');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Removed Full Name, DOB, Gender */}
              <div>
                <label className="form-label">Father's Name *</label>
                <input
                  type="text"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.personalInfo.fatherName}
                  onChange={(e) => handleInputChange('personalInfo', 'fatherName', e.target.value)}
                  placeholder="Enter father's name"
                />
                {errors.fatherName && (
                  <div className="text-red-500 text-xs mt-1">{errors.fatherName}</div>
                )}
              </div>
              <div>
                <label className="form-label">Mother's Name *</label>
                <input
                  type="text"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.personalInfo.motherName}
                  onChange={(e) => handleInputChange('personalInfo', 'motherName', e.target.value)}
                  placeholder="Enter mother's name"
                />
                {errors.motherName && (
                  <div className="text-red-500 text-xs mt-1">{errors.motherName}</div>
                )}
              </div>
              <div>
                <label className="form-label">Marital Status *</label>
                <select
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.personalInfo.maritalStatus}
                  onChange={(e) => handleInputChange('personalInfo', 'maritalStatus', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                {errors.maritalStatus && (
                  <div className="text-red-500 text-xs mt-1">{errors.maritalStatus}</div>
                )}
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.personalInfo.address.street}
                    onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                    placeholder="Enter street address"
                  />
                  {errors.street && (
                    <div className="text-red-500 text-xs mt-1">{errors.street}</div>
                  )}
                </div>
                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.personalInfo.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <div className="text-red-500 text-xs mt-1">{errors.city}</div>
                  )}
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.personalInfo.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                    placeholder="Enter state"
                  />
                  {errors.state && (
                    <div className="text-red-500 text-xs mt-1">{errors.state}</div>
                  )}
                </div>
                <div>
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.personalInfo.address.pincode}
                    onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <div className="text-red-500 text-xs mt-1">{errors.pincode}</div>
                  )}
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.personalInfo.address.country}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Document Upload
            </h3>
            
            {/* Aadhaar Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Aadhaar Card *</h4>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Aadhaar Number *</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.documents.aadhaar.number}
                    onChange={(e) => handleInputChange('documents', { parent: 'aadhaar', child: 'number' }, e.target.value)}
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                  />
                  {errors.aadhaarNumber && (
                    <div className="text-red-500 text-xs mt-1">{errors.aadhaarNumber}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Front Image *</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('documents', { parent: 'aadhaar', child: 'frontImage' }, e.target.files[0])}
                        className="hidden"
                        id="aadhaar-front"
                      />
                      <label htmlFor="aadhaar-front" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700">
                        {kycData.documents.aadhaar.frontImage ? 'File Selected' : 'Upload Front Image'}
                      </label>
                    </div>
                    {errors.aadhaarFront && (
                      <div className="text-red-500 text-xs mt-1">{errors.aadhaarFront}</div>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Back Image *</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('documents', { parent: 'aadhaar', child: 'backImage' }, e.target.files[0])}
                        className="hidden"
                        id="aadhaar-back"
                      />
                      <label htmlFor="aadhaar-back" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700">
                        {kycData.documents.aadhaar.backImage ? 'File Selected' : 'Upload Back Image'}
                      </label>
                    </div>
                    {errors.aadhaarBack && (
                      <div className="text-red-500 text-xs mt-1">{errors.aadhaarBack}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PAN Card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">PAN Card *</h4>
              <div className="space-y-4">
                <div>
                  <label className="form-label">PAN Number *</label>
                  <input
                    type="text"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.documents.pan.number}
                    onChange={(e) => handleInputChange('documents', { parent: 'pan', child: 'number' }, e.target.value.toUpperCase())}
                    placeholder="Enter PAN number (e.g., ABCDE1234F)"
                    maxLength={10}
                  />
                  {errors.panNumber && (
                    <div className="text-red-500 text-xs mt-1">{errors.panNumber}</div>
                  )}
                </div>
                <div>
                  <label className="form-label">PAN Image *</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('documents', { parent: 'pan', child: 'image' }, e.target.files[0])}
                      className="hidden"
                      id="pan-image"
                    />
                    <label htmlFor="pan-image" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700">
                      {kycData.documents.pan.image ? 'File Selected' : 'Upload PAN Image'}
                    </label>
                  </div>
                  {errors.panImage && (
                    <div className="text-red-500 text-xs mt-1">{errors.panImage}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Selfie */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Selfie *</h4>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('documents', 'selfie', e.target.files[0])}
                  className="hidden"
                  id="selfie"
                />
                <label htmlFor="selfie" className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700">
                  {kycData.documents.selfie ? 'File Selected' : 'Upload Selfie'}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Please upload a clear selfie holding your PAN card
                </p>
              </div>
              {errors.selfie && (
                <div className="text-red-500 text-xs mt-1">{errors.selfie}</div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Account Number *</label>
                <input
                  type="text"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.bankAccount.accountNumber}
                  onChange={(e) => handleInputChange('bankAccount', 'accountNumber', e.target.value)}
                  placeholder="Enter account number"
                />
                {errors.accountNumber && (
                  <div className="text-red-500 text-xs mt-1">{errors.accountNumber}</div>
                )}
              </div>
              <div>
                <label className="form-label">IFSC Code *</label>
                <input
                  type="text"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.bankAccount.ifscCode}
                  onChange={(e) => handleInputChange('bankAccount', 'ifscCode', e.target.value.toUpperCase())}
                  placeholder="Enter IFSC code"
                />
                {errors.ifscCode && (
                  <div className="text-red-500 text-xs mt-1">{errors.ifscCode}</div>
                )}
              </div>
              <div>
                <label className="form-label">Bank Name *</label>
                <input
                  type="text"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.bankAccount.bankName}
                  onChange={(e) => handleInputChange('bankAccount', 'bankName', e.target.value)}
                  placeholder="Enter bank name"
                />
                {errors.bankName && (
                  <div className="text-red-500 text-xs mt-1">{errors.bankName}</div>
                )}
              </div>
              <div>
                <label className="form-label">Account Holder Name *</label>
                <input
                  type="text"
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.bankAccount.accountHolderName}
                  onChange={(e) => handleInputChange('bankAccount', 'accountHolderName', e.target.value)}
                  placeholder="Enter account holder name"
                />
                {errors.accountHolderName && (
                  <div className="text-red-500 text-xs mt-1">{errors.accountHolderName}</div>
                )}
              </div>
              <div>
                <label className="form-label">Account Type *</label>
                <select
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.bankAccount.accountType}
                  onChange={(e) => handleInputChange('bankAccount', 'accountType', e.target.value)}
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
                {errors.accountType && (
                  <div className="text-red-500 text-xs mt-1">{errors.accountType}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Employment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Employment Status *</label>
                <select
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.employment.status}
                  onChange={(e) => handleInputChange('employment', 'status', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self Employed</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
                {errors.status && (
                  <div className="text-red-500 text-xs mt-1">{errors.status}</div>
                )}
              </div>
              {/* Show company and designation only for employed/self-employed */}
              {(employmentType === 'employed' || employmentType === 'self-employed') && (
                <>
                  <div>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input bg-white dark:bg-black text-black dark:text-white"
                      value={kycData.employment.company}
                      onChange={(e) => handleInputChange('employment', 'company', e.target.value)}
                      placeholder="Enter company name"
                    />
                    {errors.company && (
                      <div className="text-red-500 text-xs mt-1">{errors.company}</div>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input bg-white dark:bg-black text-black dark:text-white"
                      value={kycData.employment.designation}
                      onChange={(e) => handleInputChange('employment', 'designation', e.target.value)}
                      placeholder="Enter designation"
                    />
                    {errors.designation && (
                      <div className="text-red-500 text-xs mt-1">{errors.designation}</div>
                    )}
                  </div>
                </>
              )}
              {/* Show annual income and income source for all except unemployed */}
              {employmentType !== 'unemployed' && (
                <>
                  <div>
                    <label className="form-label">Annual Income *</label>
                    <input
                      type="number"
                      className="form-input bg-white dark:bg-black text-black dark:text-white"
                      value={kycData.employment.annualIncome}
                      onChange={(e) => handleInputChange('employment', 'annualIncome', e.target.value)}
                      placeholder="Enter annual income"
                    />
                    {errors.annualIncome && (
                      <div className="text-red-500 text-xs mt-1">{errors.annualIncome}</div>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Income Source *</label>
                    <select
                      className="form-input bg-white dark:bg-black text-black dark:text-white"
                      value={kycData.employment.incomeSource}
                      onChange={(e) => handleInputChange('employment', 'incomeSource', e.target.value)}
                    >
                      <option value="">Select source</option>
                      <option value="salary">Salary</option>
                      <option value="business">Business</option>
                      <option value="investment">Investment</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.incomeSource && (
                      <div className="text-red-500 text-xs mt-1">{errors.incomeSource}</div>
                    )}
                  </div>
                </>
              )}
              {/* If unemployed, show only annual income (optional) */}
              {employmentType === 'unemployed' && (
                <div>
                  <label className="form-label">Annual Income *</label>
                  <input
                    type="number"
                    className="form-input bg-white dark:bg-black text-black dark:text-white"
                    value={kycData.employment.annualIncome}
                    onChange={(e) => handleInputChange('employment', 'annualIncome', e.target.value)}
                    placeholder="Enter annual income"
                  />
                  {errors.annualIncome && (
                    <div className="text-red-500 text-xs mt-1">{errors.annualIncome}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trading Experience
            </h3>
            <div className="space-y-6">
              <div>
                <label className="form-label">Have you traded before? *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasTraded"
                      value="true"
                      checked={kycData.tradingExperience.hasTraded === true}
                      onChange={(e) => handleInputChange('tradingExperience', 'hasTraded', e.target.value === 'true')}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasTraded"
                      value="false"
                      checked={kycData.tradingExperience.hasTraded === false}
                      onChange={(e) => handleInputChange('tradingExperience', 'hasTraded', e.target.value === 'true')}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                {errors.hasTraded && <span className="text-red-500 text-xs">{errors.hasTraded}</span>}
              </div>
              <div>
                <label className="form-label">Experience Level *</label>
                <select
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.tradingExperience.experience}
                  onChange={(e) => handleInputChange('tradingExperience', 'experience', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.experience && <span className="text-red-500 text-xs">{errors.experience}</span>}
              </div>
              <div>
                <label className="form-label">Risk Tolerance *</label>
                <select
                  className="form-input bg-white dark:bg-black text-black dark:text-white"
                  value={kycData.tradingExperience.riskTolerance}
                  onChange={(e) => handleInputChange('tradingExperience', 'riskTolerance', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {errors.riskTolerance && <span className="text-red-500 text-xs">{errors.riskTolerance}</span>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black dark:text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            KYC Verification
          </h1>
          <p className="mt-2 text-gray-600 dark:text-white text-sm sm:text-base">
            Complete your KYC verification to start trading
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 overflow-x-auto"
        >
          <div className="flex items-center justify-between min-w-[340px] sm:min-w-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-10 rounded-full ${
                    isCompleted
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-200 dark:bg-black text-gray-600 dark:text-white'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-black dark:text-white' : 'text-gray-600 dark:text-white'
                    }`}>
                      Step {step.id}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-white'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-black'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-8"
        >
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-white">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto ${
                currentStep === 1
                  ? 'bg-gray-100 dark:bg-black text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-black text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center px-4 py-2 bg-black hover:bg-white text-white hover:text-black rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-2 bg-black hover:bg-white text-white hover:text-black rounded-lg font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit KYC
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white dark:bg-black rounded-lg p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3">
            <AlertCircle className="w-5 h-5 text-black dark:text-white mt-0.5" />
            <div>
              <h4 className="font-medium text-black dark:text-white mb-2">
                Important Notes
              </h4>
              <ul className="text-sm text-black dark:text-white space-y-1">
                <li>• All documents should be clear and readable</li>
                <li>• File size should not exceed 5MB per document</li>
                <li>• Supported formats: JPG, PNG, PDF</li>
                <li>• KYC verification typically takes 24-48 hours</li>
                <li>• You'll receive email updates on your verification status</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KYCPage;
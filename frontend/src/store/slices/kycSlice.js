import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  kycData: null,
  status: 'pending',
  documents: [],
  isLoading: false,
  error: null,
};

// Helper to get token and set headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'multipart/form-data',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Async thunks
export const getKYCStatus = createAsyncThunk(
  'kyc/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/kyc/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const submitKYC = createAsyncThunk(
  'kyc/submit',
  async (kycData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      // --- PATCH: Don't nest objects, send all fields at root level ---
      // Personal Info
      if (kycData.personalInfo) {
        Object.entries(kycData.personalInfo).forEach(([key, value]) => {
          if (key === 'address') {
            // Flatten address fields
            if (value && typeof value === 'object') {
              Object.entries(value).forEach(([addrKey, addrVal]) => {
                formData.append(`address[${addrKey}]`, addrVal);
              });
            }
          } else if (value) {
            formData.append(key, value);
          }
        });
      }

      // Bank Account
      if (kycData.bankAccount) {
        Object.entries(kycData.bankAccount).forEach(([key, value]) => {
          formData.append(`bankAccount[${key}]`, value);
        });
      }

      // Employment
      if (kycData.employment) {
        Object.entries(kycData.employment).forEach(([key, value]) => {
          formData.append(`employment[${key}]`, value);
        });
      }

      // Trading Experience
      if (kycData.tradingExperience) {
        Object.entries(kycData.tradingExperience).forEach(([key, value]) => {
          formData.append(`tradingExperience[${key}]`, value);
        });
      }

      // Documents (files and numbers)
      if (kycData.documents) {
        const docs = kycData.documents;
        // Aadhaar
        if (docs.aadhaar) {
          if (docs.aadhaar.number) formData.append('aadhaarNumber', docs.aadhaar.number);
          if (docs.aadhaar.frontImage) formData.append('aadhaar_front', docs.aadhaar.frontImage);
          if (docs.aadhaar.backImage) formData.append('aadhaar_back', docs.aadhaar.backImage);
        }
        // PAN
        if (docs.pan) {
          if (docs.pan.number) formData.append('panNumber', docs.pan.number);
          if (docs.pan.image) formData.append('pan_image', docs.pan.image);
        }
        // Selfie
        if (docs.selfie) formData.append('selfie', docs.selfie);
        // Bank statement
        if (docs.bankStatement) formData.append('bankStatement', docs.bankStatement);
      }

      const token = localStorage.getItem('token');

      // Log form data entries for debugging
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.post('/kyc/submit', formData);
      return response.data;
    } catch (error) {
      console.error('KYC submission error:', error);
      return rejectWithValue(error.response?.data?.message || 'KYC submission failed');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'kyc/uploadDocument',
  async ({ documentType, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      const token = localStorage.getItem('token');
      const response = await api.post('/kyc/upload-document', formData, {
        headers: token ? { ...getAuthHeaders() } : { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Document upload failed');
    }
  }
);

export const getKYCData = createAsyncThunk(
  'kyc/getData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/kyc/data', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC data');
    }
  }
);

// KYC slice
const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateKYCStatus: (state, action) => {
      state.status = action.payload;
    },
    setKYCData: (state, action) => {
      state.kycData = action.payload;
    },
    addDocument: (state, action) => {
      state.documents.push(action.payload);
    },
    removeDocument: (state, action) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get KYC status
      .addCase(getKYCStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKYCStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = action.payload.data.status;
        state.kycData = action.payload.data.kycData;
        state.error = null;
      })
      .addCase(getKYCStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Submit KYC
      .addCase(submitKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = 'submitted';
        state.kycData = action.payload.data.kycData;
        state.error = null;
      })
      .addCase(submitKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents.push(action.payload.data.document);
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get KYC data
      .addCase(getKYCData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKYCData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kycData = action.payload.data.kycData;
        state.status = action.payload.data.status;
        state.documents = action.payload.data.documents || [];
        state.error = null;
      })
      .addCase(getKYCData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  updateKYCStatus,
  setKYCData,
  addDocument,
  removeDocument
} = kycSlice.actions;
export default kycSlice.reducer;
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

// Async thunks
export const getKYCStatus = createAsyncThunk(
  'kyc/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kyc/status');
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
      
      // Append text data
      Object.keys(kycData).forEach(key => {
        if (key !== 'documents') {
          if (typeof kycData[key] === 'object') {
            formData.append(key, JSON.stringify(kycData[key]));
          } else {
            formData.append(key, kycData[key]);
          }
        }
      });
      
      // Append files
      if (kycData.documents) {
        Object.keys(kycData.documents).forEach(docType => {
          if (typeof kycData.documents[docType] === 'object' && kycData.documents[docType] !== null) {
            if (kycData.documents[docType].frontImage) {
              formData.append(`${docType}_front`, kycData.documents[docType].frontImage);
            }
            if (kycData.documents[docType].backImage) {
              formData.append(`${docType}_back`, kycData.documents[docType].backImage);
            }
            if (kycData.documents[docType].image) {
              formData.append(`${docType}_image`, kycData.documents[docType].image);
            }
          } else if (kycData.documents[docType] instanceof File) {
            formData.append(docType, kycData.documents[docType]);
          }
        });
      }

      const response = await api.post('/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
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

      const response = await api.post('/kyc/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      const response = await api.get('/kyc/data');
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
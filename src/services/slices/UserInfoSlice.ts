import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import { getCookie, setCookie, deleteCookie } from '../../utils/cookie';
import {
  refreshToken,
  fetchWithRefresh,
  registerUserApi,
  loginUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi
} from '../../utils/burger-api';

import { TRegisterData } from '../../utils/burger-api';

export enum AuthStatus {
  IDLE = 'IDLE',
  CHECKING = 'CHECKING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED'
}

export type TStateUser = {
  authStatus: AuthStatus;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  user: TUser | null;
  loginUserError: null | string;
  loginUserRequest: boolean;
  lastUpdated: number | null;
  sessionExpiresAt: number | null;
};

const initialState: TStateUser = {
  authStatus: AuthStatus.IDLE,
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
  loginUserError: null,
  loginUserRequest: false,
  lastUpdated: null,
  sessionExpiresAt: null
};

// Helper functions
const handleAuthSuccess = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const handleAuthFailure = () => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

const calculateSessionExpiry = () =>
  // Set session expiry to 24 hours from now
  Date.now() + 24 * 60 * 60 * 1000;
// Async thunks
export const userApi = createAsyncThunk(
  'user/userApi',
  async (_, { rejectWithValue }) => {
    try {
      return await getUserApi();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch user data'
      );
    }
  }
);

export const toRegisterUser = createAsyncThunk(
  'user/register',
  async ({ email, password, name }: TRegisterData, { rejectWithValue }) => {
    try {
      const data = await registerUserApi({ email, password, name });
      handleAuthSuccess(data.accessToken, data.refreshToken);
      return data.user;
    } catch (error) {
      handleAuthFailure();
      return rejectWithValue(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }
);

export const logInUser = createAsyncThunk(
  'user/login',
  async (
    { email, password }: Omit<TRegisterData, 'name'>,
    { rejectWithValue }
  ) => {
    try {
      const data = await loginUserApi({ email, password });
      handleAuthSuccess(data.accessToken, data.refreshToken);
      return data.user;
    } catch (error) {
      handleAuthFailure();
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }
);

export const logOutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      handleAuthFailure();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Logout failed'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (userData: Partial<TUser>, { rejectWithValue }) => {
    try {
      return await updateUserApi(userData);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Update failed'
      );
    }
  }
);

export const userStateSlice = createSlice({
  name: 'userstate',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    },
    resetError: (state) => {
      state.loginUserError = null;
    },
    updateLastActive: (state) => {
      state.lastUpdated = Date.now();
    },
    refreshSession: (state) => {
      state.sessionExpiresAt = calculateSessionExpiry();
    }
  },
  extraReducers: (builder) => {
    builder
      // User API
      .addCase(userApi.pending, (state) => {
        state.authStatus = AuthStatus.CHECKING;
        state.loginUserError = null;
        state.loginUserRequest = true;
      })
      .addCase(userApi.fulfilled, (state, action) => {
        state.authStatus = AuthStatus.AUTHENTICATED;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isAuthChecked = true;
        state.loginUserRequest = false;
        state.lastUpdated = Date.now();
        state.sessionExpiresAt = calculateSessionExpiry();
      })
      .addCase(userApi.rejected, (state, action) => {
        state.authStatus = AuthStatus.UNAUTHENTICATED;
        state.loginUserError =
          action.error.message || 'Failed to fetch user data';
        state.isAuthenticated = false;
        state.user = null;
        state.isAuthChecked = true;
        state.loginUserRequest = false;
      })
      // Registration
      .addCase(toRegisterUser.pending, (state) => {
        state.authStatus = AuthStatus.CHECKING;
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(toRegisterUser.fulfilled, (state, action) => {
        state.authStatus = AuthStatus.AUTHENTICATED;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loginUserRequest = false;
        state.lastUpdated = Date.now();
        state.sessionExpiresAt = calculateSessionExpiry();
      })
      .addCase(toRegisterUser.rejected, (state, action) => {
        state.authStatus = AuthStatus.UNAUTHENTICATED;
        state.isAuthenticated = false;
        state.loginUserError = action.error.message || 'Registration failed';
        state.loginUserRequest = false;
      })
      // Login
      .addCase(logInUser.pending, (state) => {
        state.authStatus = AuthStatus.CHECKING;
        state.loginUserError = null;
        state.loginUserRequest = true;
      })
      .addCase(logInUser.fulfilled, (state, action) => {
        state.authStatus = AuthStatus.AUTHENTICATED;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loginUserRequest = false;
        state.isAuthChecked = true;
        state.lastUpdated = Date.now();
        state.sessionExpiresAt = calculateSessionExpiry();
      })
      .addCase(logInUser.rejected, (state, action) => {
        state.authStatus = AuthStatus.UNAUTHENTICATED;
        state.loginUserRequest = false;
        state.loginUserError = action.error.message || 'Login failed';
        state.isAuthChecked = true;
      })
      // Logout
      .addCase(logOutUser.pending, (state) => {
        state.loginUserRequest = true;
      })
      .addCase(logOutUser.fulfilled, (state) => {
        state.authStatus = AuthStatus.UNAUTHENTICATED;
        state.isAuthenticated = false;
        state.loginUserRequest = false;
        state.user = null;
        state.lastUpdated = null;
        state.sessionExpiresAt = null;
      })
      .addCase(logOutUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message || 'Logout failed';
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loginUserRequest = false;
        state.lastUpdated = Date.now();
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loginUserError = action.error.message || 'Update failed';
        state.loginUserRequest = false;
      });
  },
  selectors: {
    // Basic selectors
    selectUser: (state) => state.user,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectLoginUserError: (state) => state.loginUserError,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectLoginUserRequest: (state) => state.loginUserRequest,
    selectAuthStatus: (state) => state.authStatus,

    // Session selectors
    selectLastUpdated: (state) => state.lastUpdated,
    selectSessionExpiresAt: (state) => state.sessionExpiresAt,
    selectIsSessionValid: (state) => {
      if (!state.sessionExpiresAt) return false;
      return Date.now() < state.sessionExpiresAt;
    },

    // Combined selectors
    selectUserProfile: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      authStatus: state.authStatus,
      lastUpdated: state.lastUpdated
    })
  }
});

export const checkUserAuth = createAsyncThunk(
  'user/checkUser',
  async (_, { dispatch }) => {
    if (getCookie('accessToken')) {
      try {
        await dispatch(userApi()).unwrap();
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    dispatch(authChecked());
  }
);

export const { authChecked, resetError, updateLastActive, refreshSession } =
  userStateSlice.actions;
export default userStateSlice;

export const {
  selectUser,
  selectIsAuthenticated,
  selectLoginUserError,
  selectIsAuthChecked,
  selectLoginUserRequest,
  selectAuthStatus,
  selectLastUpdated,
  selectSessionExpiresAt,
  selectIsSessionValid,
  selectUserProfile
} = userStateSlice.selectors;

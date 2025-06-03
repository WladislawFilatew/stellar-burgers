//These tests are cheking reducers and actions statuses user info slice

import {
  TStateUser,
  toRegisterUser,
  logInUser,
  logOutUser,
  updateUser,
  userStateSlice,
  authChecked,
  userApi,
  selectUser,
  selectIsAuthenticated,
  selectLoginUserError,
  selectIsAuthChecked,
  selectLoginUserRequest,
  AuthStatus
} from './UserInfoSlice';

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

const testUser = {
  success: true,
  user: {
    email: 'test33@mail.ru',
    name: 'test',
    createdAt: '2023-12-25T10:00:00.000Z',
    updatedAt: '2023-12-25T10:00:00.000Z'
  },
  accessToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh'
};

const testLogIn = {
  email: 'test33@mail.ru',
  password: 'password123'
};

const testRegisterUser = {
  email: 'test33@mail.ru',
  name: 'test',
  password: 'password123'
};

const updatedUser = {
  success: true,
  user: {
    email: 'test33@mail.ru',
    name: 'test35',
    createdAt: '2023-12-25T10:00:00.000Z',
    updatedAt: '2023-12-25T10:05:00.000Z'
  }
};

describe('UserStateSlice', () => {
  describe('Reducers', () => {
    it('should handle authChecked', () => {
      const previousState = {
        ...initialState,
        isAuthChecked: false
      };

      const actualState = userStateSlice.reducer(previousState, authChecked());

      expect(actualState.isAuthChecked).toBe(true);
    });
  });

  describe('Extra Reducers', () => {
    describe('userApi', () => {
      it('should handle pending state', () => {
        const actualState = userStateSlice.reducer(
          initialState,
          userApi.pending('')
        );

        expect(actualState.isAuthenticated).toBe(false);
        expect(actualState.loginUserError).toBeNull();
        expect(actualState.user).toBeNull();
        expect(actualState.loginUserRequest).toBe(true);
      });

      it('should handle fulfilled state', () => {
        const actualState = userStateSlice.reducer(
          initialState,
          userApi.fulfilled(testUser, '')
        );

        expect(actualState.isAuthenticated).toBe(true);
        expect(actualState.user).toEqual(testUser.user);
        expect(actualState.isAuthChecked).toBe(true);
        expect(actualState.loginUserRequest).toBe(false);
      });

      it('should handle rejected state', () => {
        const error = new Error('Failed to fetch user data');
        const actualState = userStateSlice.reducer(
          initialState,
          userApi.rejected(error, '')
        );

        expect(actualState.loginUserError).toBe('Failed to fetch user data');
        expect(actualState.isAuthenticated).toBe(false);
        expect(actualState.user).toBeNull();
        expect(actualState.isAuthChecked).toBe(true);
        expect(actualState.loginUserRequest).toBe(false);
      });
    });

    describe('toRegisterUser', () => {
      it('should handle pending state', () => {
        const actualState = userStateSlice.reducer(
          initialState,
          toRegisterUser.pending('', testRegisterUser)
        );

        expect(actualState.isAuthenticated).toBe(false);
        expect(actualState.user).toBeNull();
        expect(actualState.loginUserRequest).toBe(true);
      });

      it('should handle fulfilled state', () => {
        const actualState = userStateSlice.reducer(
          initialState,
          toRegisterUser.fulfilled(testUser.user, '', testRegisterUser)
        );

        expect(actualState.isAuthenticated).toBe(true);
        expect(actualState.user).toEqual(testUser.user);
        expect(actualState.loginUserRequest).toBe(false);
      });

      it('should handle rejected state', () => {
        const error = new Error('Failed to fetch register user');
        const actualState = userStateSlice.reducer(
          initialState,
          toRegisterUser.rejected(error, '', testRegisterUser)
        );

        expect(actualState.isAuthenticated).toBe(false);
        expect(actualState.loginUserError).toBe(
          'Failed to fetch register user'
        );
        expect(actualState.loginUserRequest).toBe(false);
      });
    });

    describe('logInUser', () => {
      it('should handle pending state', () => {
        const actualState = userStateSlice.reducer(
          initialState,
          logInUser.pending('', testLogIn)
        );

        expect(actualState.loginUserError).toBeNull();
        expect(actualState.loginUserRequest).toBe(true);
      });

      it('should handle fulfilled state', () => {
        const actualState = userStateSlice.reducer(
          initialState,
          logInUser.fulfilled(testUser.user, '', testLogIn)
        );

        expect(actualState.isAuthenticated).toBe(true);
        expect(actualState.user).toEqual(testUser.user);
        expect(actualState.isAuthChecked).toBe(true);
        expect(actualState.loginUserRequest).toBe(false);
      });

      it('should handle rejected state', () => {
        const error = new Error('Failed to fetch Log in user');
        const actualState = userStateSlice.reducer(
          initialState,
          logInUser.rejected(error, '', testLogIn)
        );

        expect(actualState.loginUserRequest).toBe(false);
        expect(actualState.loginUserError).toBe('Failed to fetch Log in user');
        expect(actualState.isAuthChecked).toBe(true);
      });
    });

    describe('logOutUser', () => {
      const authenticatedState = {
        ...initialState,
        authStatus: AuthStatus.AUTHENTICATED,
        isAuthenticated: true,
        user: testUser.user
      };

      it('should handle pending state', () => {
        const actualState = userStateSlice.reducer(
          authenticatedState,
          logOutUser.pending('')
        );

        expect(actualState.loginUserRequest).toBe(true);
      });

      it('should handle fulfilled state', () => {
        const actualState = userStateSlice.reducer(
          authenticatedState,
          logOutUser.fulfilled(undefined, '')
        );

        expect(actualState.authStatus).toBe(AuthStatus.UNAUTHENTICATED);
        expect(actualState.isAuthenticated).toBe(false);
        expect(actualState.user).toBeNull();
        expect(actualState.loginUserRequest).toBe(false);
      });

      it('should handle rejected state', () => {
        const error = new Error('Failed to fetch Log Out user');
        const actualState = userStateSlice.reducer(
          authenticatedState,
          logOutUser.rejected(error, '')
        );

        expect(actualState.loginUserRequest).toBe(false);
        expect(actualState.loginUserError).toBe('Failed to fetch Log Out user');
      });
    });

    describe('updateUser', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: testUser.user
      };

      it('should handle pending state', () => {
        const actualState = userStateSlice.reducer(
          authenticatedState,
          updateUser.pending('', {})
        );

        expect(actualState.isAuthenticated).toBe(true);
        expect(actualState.loginUserRequest).toBe(true);
      });

      it('should handle fulfilled state', () => {
        const actualState = userStateSlice.reducer(
          authenticatedState,
          updateUser.fulfilled(updatedUser, '', { name: 'test35' })
        );

        expect(actualState.isAuthenticated).toBe(true);
        expect(actualState.user).toEqual(updatedUser.user);
        expect(actualState.loginUserRequest).toBe(false);
      });

      it('should handle rejected state', () => {
        const error = new Error('Failed to fetch update user');
        const actualState = userStateSlice.reducer(
          authenticatedState,
          updateUser.rejected(error, '', { name: 'test35' })
        );

        expect(actualState.loginUserError).toBe('Failed to fetch update user');
        expect(actualState.loginUserRequest).toBe(false);
      });
    });
  });

  describe('Selectors', () => {
    const state = {
      userstate: {
        ...initialState,
        isAuthenticated: true,
        user: testUser.user,
        loginUserError: 'Test error',
        isAuthChecked: true,
        loginUserRequest: true
      }
    };

    it('should select user', () => {
      expect(selectUser(state)).toEqual(testUser.user);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(state)).toBe(true);
    });

    it('should select loginUserError', () => {
      expect(selectLoginUserError(state)).toBe('Test error');
    });

    it('should select isAuthChecked', () => {
      expect(selectIsAuthChecked(state)).toBe(true);
    });

    it('should select loginUserRequest', () => {
      expect(selectLoginUserRequest(state)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple login attempts', () => {
      let state = userStateSlice.reducer(
        initialState,
        logInUser.fulfilled(testUser.user, '', testLogIn)
      );

      state = userStateSlice.reducer(
        state,
        logInUser.fulfilled(updatedUser.user, '', testLogIn)
      );

      expect(state.user).toEqual(updatedUser.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.authStatus).toBe(AuthStatus.AUTHENTICATED);
    });

    it('should handle logout during update', () => {
      let state = userStateSlice.reducer(
        initialState,
        logInUser.fulfilled(testUser.user, '', testLogIn)
      );

      state = userStateSlice.reducer(state, updateUser.pending('', {}));
      state = userStateSlice.reducer(
        state,
        logOutUser.fulfilled(undefined, '')
      );

      expect(state.authStatus).toBe(AuthStatus.UNAUTHENTICATED);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loginUserRequest).toBe(false);
    });

    it('should handle failed update after successful login', () => {
      let state = userStateSlice.reducer(
        initialState,
        logInUser.fulfilled(testUser.user, '', testLogIn)
      );

      const error = new Error('Update failed');
      state = userStateSlice.reducer(
        state,
        updateUser.rejected(error, '', { name: 'test35' })
      );

      expect(state.user).toEqual(testUser.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.authStatus).toBe(AuthStatus.AUTHENTICATED);
      expect(state.loginUserError).toBe('Update failed');
    });

    it('should maintain auth state during multiple operations', () => {
      let state = userStateSlice.reducer(
        initialState,
        logInUser.fulfilled(testUser.user, '', testLogIn)
      );

      state = userStateSlice.reducer(state, updateUser.pending('', {}));
      state = userStateSlice.reducer(
        state,
        updateUser.fulfilled(updatedUser, '', { name: 'test35' })
      );
      state = userStateSlice.reducer(state, userApi.pending('', undefined));

      expect(state.authStatus).toBe(AuthStatus.CHECKING);
      expect(state.loginUserRequest).toBe(true);
    });
  });
});

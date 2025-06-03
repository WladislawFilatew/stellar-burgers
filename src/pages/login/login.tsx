import { memo, useCallback, useState, Dispatch, SetStateAction } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { TLoginData } from '../../utils/burger-api';
import {
  logInUser,
  selectIsAuthenticated,
  TStateUser
} from '../../services/slices/UserInfoSlice';

interface LoginState {
  email: string;
  password: string;
  validationError?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Login = memo(() => {
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    validationError: undefined
  });

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loginError = useSelector(
    (state: { userstate: TStateUser }) => state.userstate.loginUserError
  );
  const isLoading = useSelector(
    (state: { userstate: TStateUser }) => state.userstate.loginUserRequest
  );

  const validateForm = useCallback(
    ({ email, password }: LoginState): string | undefined => {
      if (!email.trim()) {
        return 'Email обязателен';
      }
      if (!EMAIL_REGEX.test(email)) {
        return 'Некорректный формат email';
      }
      if (!password) {
        return 'Пароль обязателен';
      }
      if (password.length < 6) {
        return 'Пароль должен быть не менее 6 символов';
      }
      return undefined;
    },
    []
  );

  const handleEmailChange = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      const email = typeof value === 'function' ? value(state.email) : value;
      setState((prev) => ({
        ...prev,
        email,
        validationError: undefined
      }));
    },
    [state.email]
  );

  const handlePasswordChange = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      const password =
        typeof value === 'function' ? value(state.password) : value;
      setState((prev) => ({
        ...prev,
        password,
        validationError: undefined
      }));
    },
    [state.password]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isLoading) {
        return;
      }

      const validationError = validateForm(state);
      if (validationError) {
        setState((prev) => ({
          ...prev,
          validationError
        }));
        return;
      }

      const userLoginData: TLoginData = {
        email: state.email,
        password: state.password
      };

      dispatch(logInUser(userLoginData));
    },
    [state, validateForm, dispatch, isLoading]
  );

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const { email, password, validationError } = state;
  const errorText = validationError || loginError || undefined;

  return (
    <LoginUI
      email={email}
      setEmail={handleEmailChange}
      password={password}
      setPassword={handlePasswordChange}
      handleSubmit={handleSubmit}
      errorText={errorText}
    />
  );
});

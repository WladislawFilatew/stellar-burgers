import { memo, useCallback, useState, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '@api';
import { ForgotPasswordUI } from '@ui-pages';

interface ForgotPasswordState {
  email: string;
  error: string | undefined;
  isLoading: boolean;
  isSubmitted: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPassword = memo(() => {
  const navigate = useNavigate();
  const [state, setState] = useState<ForgotPasswordState>({
    email: '',
    error: undefined,
    isLoading: false,
    isSubmitted: false
  });

  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email обязателен';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Некорректный формат email';
    }
    return undefined;
  }, []);

  const handleEmailChange = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      const email = typeof value === 'function' ? value(state.email) : value;
      setState((prev) => ({
        ...prev,
        email,
        error: undefined
      }));
    },
    [state.email]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const { email } = state;
      const validationError = validateEmail(email);

      if (validationError) {
        setState((prev) => ({
          ...prev,
          error: validationError
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined
      }));

      try {
        await forgotPasswordApi({ email });
        localStorage.setItem('resetPassword', 'true');

        setState((prev) => ({
          ...prev,
          isSubmitted: true,
          isLoading: false
        }));

        setTimeout(() => {
          navigate('/reset-password', { replace: true });
        }, 1000);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error
              ? err.message
              : 'Произошла ошибка при отправке запроса',
          isLoading: false
        }));
      }
    },
    [state.email, validateEmail, navigate]
  );

  const { email, error } = state;

  return (
    <ForgotPasswordUI
      email={email}
      setEmail={handleEmailChange}
      handleSubmit={handleSubmit}
      errorText={error}
    />
  );
});

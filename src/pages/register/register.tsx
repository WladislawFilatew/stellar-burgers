import { memo, useCallback, useState, Dispatch, SetStateAction } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { RegisterUI } from '@ui-pages';
import { Preloader } from '@ui';
import { TRegisterData } from '@api';
import {
  toRegisterUser,
  selectLoginUserRequest,
  selectLoginUserError
} from '../../services/slices/UserInfoSlice';

interface RegisterFormState {
  userName: string;
  email: string;
  password: string;
  validationError?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 6;

export const Register = memo(() => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectLoginUserRequest);
  const error = useSelector(selectLoginUserError);

  const [formState, setFormState] = useState<RegisterFormState>({
    userName: '',
    email: '',
    password: '',
    validationError: undefined
  });

  const validateForm = useCallback(
    ({ userName, email, password }: RegisterFormState): string | undefined => {
      if (!userName.trim()) {
        return 'Имя обязательно';
      }
      if (userName.trim().length < NAME_MIN_LENGTH) {
        return `Имя должно быть не менее ${NAME_MIN_LENGTH} символов`;
      }
      if (!email.trim()) {
        return 'Email обязателен';
      }
      if (!EMAIL_REGEX.test(email)) {
        return 'Некорректный формат email';
      }
      if (!password) {
        return 'Пароль обязателен';
      }
      if (password.length < PASSWORD_MIN_LENGTH) {
        return `Пароль должен быть не менее ${PASSWORD_MIN_LENGTH} символов`;
      }
      return undefined;
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isLoading) {
        return;
      }

      const validationError = validateForm(formState);
      if (validationError) {
        setFormState((prev) => ({
          ...prev,
          validationError
        }));
        return;
      }

      const newUserData: TRegisterData = {
        name: formState.userName,
        email: formState.email,
        password: formState.password
      };

      try {
        await dispatch(toRegisterUser(newUserData)).unwrap();
      } catch (err) {
        console.error('Failed to register user:', err);
      }
    },
    [dispatch, formState, isLoading, validateForm]
  );

  const createInputHandler = useCallback(
    (field: keyof Omit<RegisterFormState, 'validationError'>) => {
      const handler: Dispatch<SetStateAction<string>> = (value) => {
        const newValue = typeof value === 'function' ? value('') : value;
        setFormState((prev) => ({
          ...prev,
          [field]: newValue,
          validationError: undefined
        }));
      };
      return handler;
    },
    []
  );

  if (isLoading && !error) {
    return <Preloader />;
  }

  const { userName, email, password, validationError } = formState;
  const errorText = validationError || error || undefined;

  return (
    <RegisterUI
      userName={userName}
      email={email}
      password={password}
      setUserName={createInputHandler('userName')}
      setEmail={createInputHandler('email')}
      setPassword={createInputHandler('password')}
      handleSubmit={handleSubmit}
      errorText={errorText}
    />
  );
});

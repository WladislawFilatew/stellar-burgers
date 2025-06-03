import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { ProfileUI } from '@ui-pages';
import { Preloader } from '@ui';
import {
  selectUser,
  updateUser,
  selectLoginUserRequest,
  selectLoginUserError
} from '../../services/slices/UserInfoSlice';
import { TUser } from '../../utils/types';

interface ProfileFormState {
  name: string;
  email: string;
  password: string;
  validationError?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 6;

export const Profile = memo(() => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser) as TUser;
  const isLoading = useSelector(selectLoginUserRequest);
  const error = useSelector(selectLoginUserError);

  const [formState, setFormState] = useState<ProfileFormState>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    validationError: undefined
  });

  useEffect(() => {
    if (user) {
      setFormState((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        validationError: undefined
      }));
    }
  }, [user]);

  const validateForm = useCallback(
    ({ name, email, password }: ProfileFormState): string | undefined => {
      if (!name.trim()) {
        return 'Имя обязательно';
      }
      if (name.trim().length < NAME_MIN_LENGTH) {
        return `Имя должно быть не менее ${NAME_MIN_LENGTH} символов`;
      }
      if (!email.trim()) {
        return 'Email обязателен';
      }
      if (!EMAIL_REGEX.test(email)) {
        return 'Некорректный формат email';
      }
      if (password && password.length < PASSWORD_MIN_LENGTH) {
        return `Пароль должен быть не менее ${PASSWORD_MIN_LENGTH} символов`;
      }
      return undefined;
    },
    []
  );

  const isFormChanged = useCallback(
    () =>
      formState.name !== user?.name ||
      formState.email !== user?.email ||
      !!formState.password,
    [formState.name, formState.email, formState.password, user]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        [name]: value,
        validationError: undefined
      }));
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

      const updateData: Partial<TUser> = {
        name: formState.name,
        email: formState.email
      };

      if (formState.password) {
        (updateData as any).password = formState.password;
      }

      try {
        await dispatch(updateUser(updateData)).unwrap();
        setFormState((prev) => ({
          ...prev,
          password: '',
          validationError: undefined
        }));
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    },
    [dispatch, formState, isLoading, validateForm]
  );

  const handleCancel = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        validationError: undefined
      });
    },
    [user]
  );

  if (!user) {
    return <Preloader />;
  }

  return (
    <ProfileUI
      formValue={formState}
      isFormChanged={isFormChanged()}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
});

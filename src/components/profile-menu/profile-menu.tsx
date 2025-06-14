import { FC, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileMenuUI } from '@ui';
import { useDispatch } from '../../services/store';
import { logOutUser } from '../../services/slices/UserInfoSlice';

export const ProfileMenu: FC = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      setLogoutError(null);
      await dispatch(logOutUser()).unwrap();
      navigate('/', { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при выходе из системы';
      setLogoutError(errorMessage);
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, navigate, isLoggingOut]);

  return (
    <ProfileMenuUI
      handleLogout={handleLogout}
      pathname={pathname}
      isLoggingOut={isLoggingOut}
      logoutError={logoutError}
    />
  );
};

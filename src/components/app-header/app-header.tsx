import { FC, memo } from 'react';
import { useSelector } from '../../services/store';
import { selectUser } from '../../services/slices/UserInfoSlice';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = memo(() => {
  const user = useSelector(selectUser);
  const userName = user?.name || '';

  return <AppHeaderUI userName={userName} />;
});

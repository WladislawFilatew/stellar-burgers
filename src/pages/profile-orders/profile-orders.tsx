import { memo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import {
  ordersHistory,
  getUserOrdersLoading,
  getUserOrdersHistory,
  getUserOrdersHistoryError,
  getWebSocketStatus,
  getCurrentPage,
  WebSocketStatus,
  clearError
} from '../../services/slices/UserOrdersHistory';

export const ProfileOrders = memo(() => {
  const dispatch = useDispatch();

  const orders = useSelector(getUserOrdersHistory);
  const isLoading = useSelector(getUserOrdersLoading);
  const error = useSelector(getUserOrdersHistoryError);
  const wsStatus = useSelector(getWebSocketStatus);
  const currentPage = useSelector(getCurrentPage);

  const loadOrders = useCallback(
    async (page: number) => {
      try {
        await dispatch(ordersHistory(page)).unwrap();
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadOrders(currentPage);

    return () => {
      dispatch(clearError());
    };
  }, [loadOrders, currentPage]);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (wsStatus === WebSocketStatus.OFFLINE) {
      refreshInterval = setInterval(() => {
        loadOrders(currentPage);
      }, 30000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [wsStatus, loadOrders, currentPage]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className='text text_type_main-medium text_color_error mt-10 mb-10'>
        {error}
        <button
          className='button button_type_primary mt-4'
          onClick={() => loadOrders(currentPage)}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
});

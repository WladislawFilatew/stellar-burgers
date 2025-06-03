import { memo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import {
  getFeedData,
  getFeedOrders,
  getLoading,
  getError,
  getWebSocketStatus,
  WebSocketStatus,
  clearError
} from '../../services/slices/FeedDataSlice';

export const Feed = memo(() => {
  const dispatch = useDispatch();
  const loading = useSelector(getLoading);
  const error = useSelector(getError);
  const orders = useSelector(getFeedOrders);
  const wsStatus = useSelector(getWebSocketStatus);

  const loadFeedData = useCallback(async () => {
    try {
      await dispatch(getFeedData(1)).unwrap();
    } catch (err) {
      console.error('Failed to load feed data:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadFeedData();

    return () => {
      dispatch(clearError());
    };
  }, [loadFeedData, dispatch]);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (wsStatus === WebSocketStatus.OFFLINE) {
      refreshInterval = setInterval(loadFeedData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [wsStatus, loadFeedData]);

  if (loading && !orders.length) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className='text text_type_main-medium text_color_error mt-10 mb-10'>
        {error}
        <button
          className='button button_type_primary mt-4'
          onClick={loadFeedData}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return <FeedUI orders={orders} handleGetFeeds={loadFeedData} />;
});

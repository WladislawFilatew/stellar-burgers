import { FC, useMemo } from 'react';
import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import {
  getFeedOrders,
  getTotalAmountOrders,
  getTotalAmountToday,
  getLoading,
  getError
} from '../../services/slices/FeedDataSlice';
import { useSelector } from '../../services/store';

const MAX_DISPLAYED_ORDERS = 20;
const ORDER_STATUSES = {
  DONE: 'done',
  PENDING: 'pending'
} as const;

const getOrdersByStatus = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, MAX_DISPLAYED_ORDERS);

export const FeedInfo: FC = () => {
  const orders = useSelector(getFeedOrders);
  const totalAmount = useSelector(getTotalAmountOrders);
  const totalAmountToday = useSelector(getTotalAmountToday);
  const isLoading = useSelector(getLoading);
  const error = useSelector(getError);

  const { readyOrders, pendingOrders } = useMemo(
    () => ({
      readyOrders: getOrdersByStatus(orders, ORDER_STATUSES.DONE),
      pendingOrders: getOrdersByStatus(orders, ORDER_STATUSES.PENDING)
    }),
    [orders]
  );

  if (isLoading) {
    return (
      <div className='text text_type_main-medium text_color_inactive'>
        Загрузка информации о заказах...
      </div>
    );
  }

  if (error) {
    return (
      <div className='text text_type_main-medium text_color_error'>
        Произошла ошибка при загрузке информации о заказах
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className='text text_type_main-medium text_color_inactive'>
        Нет доступных заказов
      </div>
    );
  }

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={{
        total: totalAmount,
        totalToday: totalAmountToday
      }}
    />
  );
};

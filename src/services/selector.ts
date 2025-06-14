import { RootState } from './store';
import { TOrder } from '@utils-types';

export const selectOrderById =
  (number: number) =>
  (state: RootState): TOrder | null => {
    const { feeddata, ordershistory } = state;

    if (feeddata.orderCache[number]) {
      return feeddata.orderCache[number];
    }

    const order =
      feeddata.orders.find((order) => order.number === number) ||
      ordershistory.orders.find((order) => order.number === number);

    if (order) {
      return order;
    }

    return feeddata.modalOrder?.number === number ? feeddata.modalOrder : null;
  };

export const selectOrdersCount = (state: RootState) => ({
  total: state.feeddata.total,
  totalToday: state.feeddata.totalToday
});

export const selectAllOrders = (state: RootState): TOrder[] => [
  ...state.feeddata.orders,
  ...state.ordershistory.orders
];

export const selectIsOrderLoading = (state: RootState): boolean =>
  state.feeddata.loading || state.ordershistory.loading;

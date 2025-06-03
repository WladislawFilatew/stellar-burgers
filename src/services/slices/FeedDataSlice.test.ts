//These tests check the Feed data slice reducers

import { error } from 'console';
import {
  getFeedData,
  getOrderByNum,
  TStateFeed,
  feedDataSlice,
  getFeedOrders,
  getTotalAmountOrders,
  getTotalAmountToday,
  getLoading,
  getError,
  WebSocketStatus
} from './FeedDataSlice';

const initialState: TStateFeed = {
  orders: [],
  total: 0,
  totalToday: 0,
  error: null,
  loading: false,
  modalOrder: null,
  status: WebSocketStatus.OFFLINE,
  currentPage: 1,
  itemsPerPage: 10,
  orderCache: {},
  lastUpdated: null
};

const testOrders = {
  success: true,
  orders: [
    {
      _id: '1',
      ingredients: [
        '643d69a5c3f7b9001cfa093c',
        '643d69a5c3f7b9001cfa093c',
        '643d69a5c3f7b9001cfa093e'
      ],
      status: 'done',
      name: 'Краторный люминесцентный бургер',
      createdAt: '2024-09-02T13:46:25.234Z',
      updatedAt: '2024-09-02T13:46:25.914Z',
      number: 1
    },
    {
      _id: '2',
      ingredients: ['643d69a5c3f7b9001cfa0941', '643d69a5c3f7b9001cfa093f'],
      status: 'pending',
      name: 'Антарианский краторный бургер',
      createdAt: '2024-09-02T07:36:55.648Z',
      updatedAt: '2024-09-02T07:36:56.126Z',
      number: 2
    },
    {
      _id: '3',
      ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0943'],
      status: 'created',
      name: 'Краторный space бургер',
      createdAt: '2024-09-02T07:34:44.831Z',
      updatedAt: '2024-09-02T07:34:45.280Z',
      number: 3
    }
  ],
  total: 3,
  totalToday: 3,
  page: 1
};

describe('FeedDataSlice', () => {
  describe('Reducers', () => {
    describe('getFeedData', () => {
      it('should handle pending state', () => {
        const actualState = feedDataSlice.reducer(
          { ...initialState, error: 'Test error' },
          getFeedData.pending('', 1)
        );

        expect(actualState.loading).toBe(true);
        expect(actualState.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const actualState = feedDataSlice.reducer(
          { ...initialState, loading: true },
          getFeedData.fulfilled(testOrders, '', 1)
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.orders).toEqual(testOrders.orders);
        expect(actualState.total).toBe(testOrders.total);
        expect(actualState.totalToday).toBe(testOrders.totalToday);
        expect(actualState.error).toBeNull();
      });

      it('should handle rejected state', () => {
        const error = new Error('Feed error');
        const actualState = feedDataSlice.reducer(
          { ...initialState, loading: true },
          getFeedData.rejected(error, '', 1)
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.error).toBe('Feed error');
        expect(actualState.orders).toEqual([]);
      });
    });

    describe('getOrderByNum', () => {
      it('should handle pending state', () => {
        const actualState = feedDataSlice.reducer(
          { ...initialState, error: 'Test error' },
          getOrderByNum.pending('', 1)
        );

        expect(actualState.loading).toBe(true);
        expect(actualState.error).toBeNull();
      });

      it('should handle fulfilled state', () => {
        const actualState = feedDataSlice.reducer(
          { ...initialState, loading: true },
          getOrderByNum.fulfilled(testOrders, '', 1)
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.modalOrder).toEqual(testOrders.orders[0]);
        expect(actualState.error).toBeNull();
      });

      it('should handle rejected state', () => {
        const error = new Error('Feed error');
        const actualState = feedDataSlice.reducer(
          { ...initialState, loading: true },
          getOrderByNum.rejected(error, '', 1)
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.error).toBe('Feed error');
        expect(actualState.modalOrder).toBeNull();
      });

      it('should handle non-existent order number', () => {
        const emptyOrders = { ...testOrders, orders: [] };
        const actualState = feedDataSlice.reducer(
          { ...initialState, loading: true },
          getOrderByNum.fulfilled(emptyOrders, '', 999)
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.modalOrder).toBeNull();
        expect(actualState.error).toBeNull();
      });
    });
  });

  describe('Selectors', () => {
    const state = {
      feeddata: {
        ...initialState,
        orders: testOrders.orders,
        total: testOrders.total,
        totalToday: testOrders.totalToday
      }
    };

    it('should select orders', () => {
      expect(getFeedOrders(state)).toEqual(testOrders.orders);
    });

    it('should select total', () => {
      expect(getTotalAmountOrders(state)).toBe(testOrders.total);
    });

    it('should select totalToday', () => {
      expect(getTotalAmountToday(state)).toBe(testOrders.totalToday);
    });

    it('should select loading status', () => {
      const loadingState = {
        feeddata: {
          ...state.feeddata,
          loading: true
        }
      };
      expect(getLoading(loadingState)).toBe(true);
    });

    it('should select error', () => {
      const errorState = {
        feeddata: {
          ...state.feeddata,
          error: 'Test error'
        }
      };
      expect(getError(errorState)).toBe('Test error');
    });
  });

  describe('Order Status Handling', () => {
    it('should correctly identify orders by status', () => {
      const state = feedDataSlice.reducer(
        initialState,
        getFeedData.fulfilled(testOrders, '', 1)
      );

      const doneOrders = state.orders.filter(
        (order) => order.status === 'done'
      );
      const pendingOrders = state.orders.filter(
        (order) => order.status === 'pending'
      );
      const createdOrders = state.orders.filter(
        (order) => order.status === 'created'
      );

      expect(doneOrders).toHaveLength(1);
      expect(pendingOrders).toHaveLength(1);
      expect(createdOrders).toHaveLength(1);
    });

    it('should maintain order timestamps', () => {
      const state = feedDataSlice.reducer(
        initialState,
        getFeedData.fulfilled(testOrders, '', 1)
      );

      state.orders.forEach((order) => {
        expect(order.createdAt).toBeDefined();
        expect(order.updatedAt).toBeDefined();
        expect(new Date(order.createdAt)).toBeInstanceOf(Date);
        expect(new Date(order.updatedAt)).toBeInstanceOf(Date);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty orders array', () => {
      const emptyOrders = {
        ...testOrders,
        orders: [],
        total: 0,
        totalToday: 0
      };
      const state = feedDataSlice.reducer(
        initialState,
        getFeedData.fulfilled(emptyOrders, '', 1)
      );

      expect(state.orders).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.totalToday).toBe(0);
    });

    it('should handle malformed order data', () => {
      const malformedOrder = {
        ...testOrders,
        orders: [{ ...testOrders.orders[0], ingredients: [] }]
      };

      const state = feedDataSlice.reducer(
        initialState,
        getFeedData.fulfilled(malformedOrder, '', 1)
      );

      expect(state.orders[0].ingredients).toEqual([]);
    });
  });
});

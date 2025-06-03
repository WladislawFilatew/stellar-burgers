//tests checks user order history slice reducers

import {
  TStateOrdersHistory,
  ordersHistory,
  userOrdersHistorySlice,
  getUserOrdersHistory,
  getUserOrdersHistoryError,
  getUserOrdersLoading,
  WebSocketStatus,
  wsConnecting,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
  setCurrentPage,
  setItemsPerPage,
  clearCache,
  clearError,
  getWebSocketStatus,
  getCurrentPage,
  getItemsPerPage,
  getTotalItems,
  getTotalPages,
  getOrderFromCache,
  getLastUpdated,
  getOrdersByStatus,
  getPaginatedOrders,
  getRecentOrders
} from './UserOrdersHistory';

import { TOrder, TOrdersData } from '../../utils/types';

const initialState: TStateOrdersHistory = {
  orders: [],
  loading: false,
  error: null,
  status: WebSocketStatus.OFFLINE,
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  orderCache: {},
  lastUpdated: null
};

const testOrders: TOrder[] = [
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
];

describe('UserOrdersHistory Slice', () => {
  describe('Reducers', () => {
    it('should handle pending state', () => {
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          error: 'Previous error'
        },
        ordersHistory.pending('ordersHistory', 1)
      );

      expect(actualState.loading).toBe(true);
      expect(actualState.error).toBeNull();
      expect(actualState.orders).toEqual([]);
    });

    it('should handle fulfilled state', () => {
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          loading: true
        },
        ordersHistory.fulfilled(
          { orders: testOrders, page: 1, total: testOrders.length },
          'ordersHistory',
          1
        )
      );

      expect(actualState.loading).toBe(false);
      expect(actualState.error).toBeNull();
      expect(actualState.orders).toEqual(testOrders);
      expect(actualState.currentPage).toBe(1);
      expect(actualState.totalItems).toBe(testOrders.length);
    });

    it('should handle rejected state', () => {
      const error = new Error('Test error');
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          loading: true
        },
        ordersHistory.rejected(error, 'ordersHistory', 1)
      );

      expect(actualState.loading).toBe(false);
      expect(actualState.error).toBe('Test error');
      expect(actualState.orders).toEqual([]);
    });
  });

  describe('Selectors', () => {
    const state = {
      ordershistory: {
        ...initialState,
        orders: testOrders,
        loading: true,
        error: 'Test error'
      }
    };

    it('should select orders', () => {
      expect(getUserOrdersHistory(state)).toEqual(testOrders);
    });

    it('should select loading status', () => {
      expect(getUserOrdersLoading(state)).toBe(true);
    });

    it('should select error', () => {
      expect(getUserOrdersHistoryError(state)).toBe('Test error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty orders array', () => {
      const actualState = userOrdersHistorySlice.reducer(
        initialState,
        ordersHistory.fulfilled(
          { orders: [], page: 1, total: 0 },
          'ordersHistory',
          1
        )
      );

      expect(actualState.orders).toEqual([]);
      expect(actualState.loading).toBe(false);
      expect(actualState.error).toBeNull();
      expect(actualState.totalItems).toBe(0);
    });

    it('should handle orders with different statuses', () => {
      const actualState = userOrdersHistorySlice.reducer(
        initialState,
        ordersHistory.fulfilled(
          { orders: testOrders, page: 1, total: testOrders.length },
          'ordersHistory',
          1
        )
      );

      const doneOrders = actualState.orders.filter(
        (order) => order.status === 'done'
      );
      const pendingOrders = actualState.orders.filter(
        (order) => order.status === 'pending'
      );
      const createdOrders = actualState.orders.filter(
        (order) => order.status === 'created'
      );

      expect(doneOrders).toHaveLength(1);
      expect(pendingOrders).toHaveLength(1);
      expect(createdOrders).toHaveLength(1);
    });

    it('should handle multiple state updates', () => {
      let state = userOrdersHistorySlice.reducer(
        initialState,
        ordersHistory.pending('ordersHistory', 1)
      );

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      state = userOrdersHistorySlice.reducer(
        state,
        ordersHistory.fulfilled(
          { orders: testOrders, page: 1, total: testOrders.length },
          'ordersHistory',
          1
        )
      );

      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(testOrders);

      const error = new Error('Test error');
      state = userOrdersHistorySlice.reducer(
        state,
        ordersHistory.rejected(error, 'ordersHistory', 1)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Test error');
    });

    it('should handle empty ingredients array', () => {
      const orderWithEmptyIngredients = {
        ...testOrders[0],
        ingredients: []
      };

      const actualState = userOrdersHistorySlice.reducer(
        initialState,
        ordersHistory.fulfilled(
          { orders: [orderWithEmptyIngredients], page: 1, total: 1 },
          'ordersHistory',
          1
        )
      );

      expect(actualState.orders).toEqual([orderWithEmptyIngredients]);
    });
  });

  describe('WebSocket Actions', () => {
    it('should handle wsConnecting', () => {
      const actualState = userOrdersHistorySlice.reducer(
        initialState,
        wsConnecting()
      );

      expect(actualState.status).toBe(WebSocketStatus.CONNECTING);
    });

    it('should handle wsOpen', () => {
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          status: WebSocketStatus.CONNECTING
        },
        wsOpen()
      );

      expect(actualState.status).toBe(WebSocketStatus.ONLINE);
      expect(actualState.error).toBeNull();
    });

    it('should handle wsClose', () => {
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          status: WebSocketStatus.ONLINE
        },
        wsClose()
      );

      expect(actualState.status).toBe(WebSocketStatus.OFFLINE);
    });

    it('should handle wsError', () => {
      const errorMessage = 'WebSocket connection error';
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          status: WebSocketStatus.ONLINE
        },
        wsError(errorMessage)
      );

      expect(actualState.status).toBe(WebSocketStatus.OFFLINE);
      expect(actualState.error).toBe(errorMessage);
    });

    it('should handle wsMessage', () => {
      const message: TOrdersData = {
        orders: testOrders,
        total: testOrders.length,
        totalToday: testOrders.length
      };

      const actualState = userOrdersHistorySlice.reducer(
        initialState,
        wsMessage(message)
      );

      expect(actualState.orders).toEqual(testOrders);
      expect(actualState.totalItems).toBe(testOrders.length);
      expect(actualState.lastUpdated).toBeDefined();
      expect(Object.keys(actualState.orderCache)).toHaveLength(
        testOrders.length
      );
    });
  });

  describe('Pagination Actions', () => {
    it('should handle setCurrentPage', () => {
      const newPage = 2;
      const actualState = userOrdersHistorySlice.reducer(
        initialState,
        setCurrentPage(newPage)
      );

      expect(actualState.currentPage).toBe(newPage);
    });

    it('should handle setItemsPerPage', () => {
      const newItemsPerPage = 20;
      const actualState = userOrdersHistorySlice.reducer(
        {
          ...initialState,
          currentPage: 2
        },
        setItemsPerPage(newItemsPerPage)
      );

      expect(actualState.itemsPerPage).toBe(newItemsPerPage);
      expect(actualState.currentPage).toBe(1); // Should reset to first page
    });
  });

  describe('Cache Management', () => {
    it('should handle clearCache', () => {
      const stateWithCache = {
        ...initialState,
        orderCache: { '1': testOrders[0] },
        lastUpdated: Date.now()
      };

      const actualState = userOrdersHistorySlice.reducer(
        stateWithCache,
        clearCache()
      );

      expect(actualState.orderCache).toEqual({});
      expect(actualState.lastUpdated).toBeNull();
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Test error'
      };

      const actualState = userOrdersHistorySlice.reducer(
        stateWithError,
        clearError()
      );

      expect(actualState.error).toBeNull();
    });
  });

  describe('Advanced Selectors', () => {
    const stateWithData = {
      ordershistory: {
        ...initialState,
        orders: testOrders,
        currentPage: 2,
        itemsPerPage: 2,
        totalItems: testOrders.length,
        orderCache: {
          '1': testOrders[0]
        },
        lastUpdated: 123456789,
        status: WebSocketStatus.ONLINE
      }
    };

    it('should select WebSocket status', () => {
      expect(getWebSocketStatus(stateWithData)).toBe(WebSocketStatus.ONLINE);
    });

    it('should select pagination data', () => {
      expect(getCurrentPage(stateWithData)).toBe(2);
      expect(getItemsPerPage(stateWithData)).toBe(2);
      expect(getTotalItems(stateWithData)).toBe(testOrders.length);
      expect(getTotalPages(stateWithData)).toBe(2);
    });

    it('should select paginated orders', () => {
      const paginatedOrders = getPaginatedOrders(stateWithData);
      expect(paginatedOrders).toHaveLength(1); // На второй странице 1 заказ
      expect(paginatedOrders[0]).toEqual(testOrders[2]);
    });

    it('should select orders by status', () => {
      const doneOrders = getOrdersByStatus(stateWithData, 'done');
      expect(doneOrders).toHaveLength(1);
      expect(doneOrders[0].status).toBe('done');
    });

    it('should select recent orders', () => {
      const recentOrders = getRecentOrders(stateWithData, 2);
      expect(recentOrders).toHaveLength(2);
      // Проверяем, что заказы отсортированы по дате
      expect(new Date(recentOrders[0].createdAt).getTime()).toBeGreaterThan(
        new Date(recentOrders[1].createdAt).getTime()
      );
    });

    it('should select order from cache', () => {
      expect(getOrderFromCache(stateWithData, '1')).toEqual(testOrders[0]);
      expect(getOrderFromCache(stateWithData, 'non-existent')).toBeUndefined();
    });

    it('should select last updated timestamp', () => {
      expect(getLastUpdated(stateWithData)).toBe(123456789);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle WebSocket reconnection sequence', () => {
      let state = userOrdersHistorySlice.reducer(initialState, wsConnecting());
      expect(state.status).toBe(WebSocketStatus.CONNECTING);

      state = userOrdersHistorySlice.reducer(state, wsOpen());
      expect(state.status).toBe(WebSocketStatus.ONLINE);

      const message: TOrdersData = {
        orders: testOrders,
        total: testOrders.length,
        totalToday: testOrders.length
      };
      state = userOrdersHistorySlice.reducer(state, wsMessage(message));
      expect(state.orders).toEqual(testOrders);

      state = userOrdersHistorySlice.reducer(state, wsClose());
      expect(state.status).toBe(WebSocketStatus.OFFLINE);
    });

    it('should handle pagination with cache updates', () => {
      // Начальное состояние с заказами
      let state = userOrdersHistorySlice.reducer(
        initialState,
        ordersHistory.fulfilled(
          { orders: testOrders, page: 1, total: testOrders.length },
          'ordersHistory',
          1
        )
      );

      // Изменяем размер страницы
      state = userOrdersHistorySlice.reducer(state, setItemsPerPage(2));
      expect(state.currentPage).toBe(1);
      expect(state.itemsPerPage).toBe(2);

      // Переходим на следующую страницу
      state = userOrdersHistorySlice.reducer(state, setCurrentPage(2));
      expect(state.currentPage).toBe(2);

      // Проверяем кэш
      expect(Object.keys(state.orderCache)).toHaveLength(testOrders.length);
    });

    it('should handle error recovery sequence', () => {
      // Сначала получаем ошибку
      let state = userOrdersHistorySlice.reducer(
        initialState,
        wsError('Connection failed')
      );
      expect(state.error).toBe('Connection failed');
      expect(state.status).toBe(WebSocketStatus.OFFLINE);

      // Очищаем ошибку
      state = userOrdersHistorySlice.reducer(state, clearError());
      expect(state.error).toBeNull();

      // Переподключаемся
      state = userOrdersHistorySlice.reducer(state, wsConnecting());
      expect(state.status).toBe(WebSocketStatus.CONNECTING);

      // Успешно подключаемся
      state = userOrdersHistorySlice.reducer(state, wsOpen());
      expect(state.status).toBe(WebSocketStatus.ONLINE);
    });
  });
});

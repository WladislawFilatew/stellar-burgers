import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOrdersApi, getOrderByNumberApi } from '../../utils/burger-api';
import { TOrder, TOrdersData } from '../../utils/types';

export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export type TStateOrdersHistory = {
  orders: TOrder[];
  loading: boolean;
  error: null | string | undefined;
  status: WebSocketStatus;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  orderCache: Record<string, TOrder>;
  lastUpdated: number | null;
};

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

// Async thunks
export const ordersHistory = createAsyncThunk(
  'user/orderHistory',
  async (page: number = 1) => {
    const orders = await getOrdersApi();
    return {
      orders,
      page,
      total: orders.length
    };
  }
);

export const getOrderById = createAsyncThunk(
  'user/getOrderById',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);
    if (!response.success || !response.orders.length) {
      throw new Error('Order not found');
    }
    return response.orders[0];
  }
);

// Slice
export const userOrdersHistorySlice = createSlice({
  name: 'ordershistory',
  initialState,
  reducers: {
    // WebSocket actions
    wsConnecting: (state) => {
      state.status = WebSocketStatus.CONNECTING;
    },
    wsOpen: (state) => {
      state.status = WebSocketStatus.ONLINE;
      state.error = null;
    },
    wsClose: (state) => {
      state.status = WebSocketStatus.OFFLINE;
    },
    wsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = WebSocketStatus.OFFLINE;
    },
    wsMessage: (state, action: PayloadAction<TOrdersData>) => {
      state.orders = action.payload.orders;
      state.totalItems = action.payload.total;
      state.lastUpdated = Date.now();

      // Update cache
      action.payload.orders.forEach((order) => {
        state.orderCache[order._id] = order;
      });
    },

    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing items per page
    },

    // Cache management
    clearCache: (state) => {
      state.orderCache = {};
      state.lastUpdated = null;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Orders history
      .addCase(ordersHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ordersHistory.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.totalItems = action.payload.total;
        state.currentPage = action.payload.page;
        state.loading = false;
        state.error = null;
        state.lastUpdated = Date.now();

        // Update cache
        action.payload.orders.forEach((order) => {
          state.orderCache[order._id] = order;
        });
      })
      .addCase(ordersHistory.rejected, (state, action) => {
        state.error = action.error.message || 'Error loading orders history';
        state.loading = false;
      })
      // Single order
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        const order = action.payload;
        state.orderCache[order._id] = order;
        state.loading = false;
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.error = action.error.message || 'Error loading order';
        state.loading = false;
      });
  },
  selectors: {
    // Basic selectors
    getUserOrdersHistory: (state) => state.orders,
    getUserOrdersHistoryError: (state) => state.error,
    getUserOrdersLoading: (state) => state.loading,
    getWebSocketStatus: (state) => state.status,

    // Pagination selectors
    getCurrentPage: (state) => state.currentPage,
    getItemsPerPage: (state) => state.itemsPerPage,
    getTotalItems: (state) => state.totalItems,
    getTotalPages: (state) => Math.ceil(state.totalItems / state.itemsPerPage),

    // Cache selectors
    getOrderFromCache: (state, id: string) => state.orderCache[id],
    getLastUpdated: (state) => state.lastUpdated,

    // Filtered selectors
    getOrdersByStatus: (state, status: string) =>
      state.orders.filter((order) => order.status === status),

    getPaginatedOrders: (state) => {
      const start = (state.currentPage - 1) * state.itemsPerPage;
      const end = start + state.itemsPerPage;
      return state.orders.slice(start, end);
    },

    getRecentOrders: (state, count: number = 5) =>
      [...state.orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, count)
  }
});

export const {
  wsConnecting,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
  setCurrentPage,
  setItemsPerPage,
  clearCache,
  clearError
} = userOrdersHistorySlice.actions;

export const {
  getUserOrdersHistory,
  getUserOrdersHistoryError,
  getUserOrdersLoading,
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
} = userOrdersHistorySlice.selectors;

export default userOrdersHistorySlice;

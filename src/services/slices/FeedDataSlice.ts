import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getFeedsApi, getOrderByNumberApi } from '../../utils/burger-api';
import { TOrder, TOrdersData } from '@utils-types';

export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export enum OrderStatus {
  DONE = 'done',
  PENDING = 'pending',
  CREATED = 'created'
}

export type TStateFeed = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  error: null | string;
  loading: boolean;
  modalOrder: TOrder | null;
  status: WebSocketStatus;
  currentPage: number;
  itemsPerPage: number;
  orderCache: Record<string, TOrder>;
  lastUpdated: number | null;
};

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

// Async actions
export const getFeedData = createAsyncThunk(
  'feed/data',
  async (page: number = 1) => {
    const response = await getFeedsApi();
    return {
      ...response,
      page
    };
  }
);

export const getOrderByNum = createAsyncThunk(
  'feed/getOrder',
  async (number: number, { rejectWithValue }) => {
    try {
      const response = await getOrderByNumberApi(number);
      if (!response.success || !response.orders.length) {
        throw new Error('Order not found');
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Error loading order'
      );
    }
  }
);

export const feedDataSlice = createSlice({
  name: 'feeddata',
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
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
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

    // Modal actions
    clearModalOrder: (state) => {
      state.modalOrder = null;
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
      // Feed data
      .addCase(getFeedData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeedData.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
        state.currentPage = action.payload.page;
        state.loading = false;
        state.error = null;
        state.lastUpdated = Date.now();

        // Update cache
        action.payload.orders.forEach((order) => {
          state.orderCache[order._id] = order;
        });
      })
      .addCase(getFeedData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading feed data';
      })
      // Single order
      .addCase(getOrderByNum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByNum.fulfilled, (state, action) => {
        const order = action.payload.orders[0];
        state.modalOrder = order || null;
        if (order) {
          state.orderCache[order._id] = order;
        }
        state.loading = false;
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(getOrderByNum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error loading order';
      });
  },
  selectors: {
    // Basic selectors
    getFeedOrders: (state) => state.orders,
    getTotalAmountOrders: (state) => state.total,
    getTotalAmountToday: (state) => state.totalToday,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,
    selectModalOrder: (state) => state.modalOrder,
    getWebSocketStatus: (state) => state.status,

    // Pagination selectors
    getCurrentPage: (state) => state.currentPage,
    getItemsPerPage: (state) => state.itemsPerPage,
    getTotalPages: (state) => Math.ceil(state.total / state.itemsPerPage),

    // Cache selectors
    getOrderFromCache: (state, id: string) => state.orderCache[id],
    getLastUpdated: (state) => state.lastUpdated,

    // Filtered selectors
    getOrdersByStatus: (state, status: OrderStatus) =>
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
        .slice(0, count),

    // Statistics selectors
    getDoneOrders: (state) =>
      state.orders.filter((order) => order.status === OrderStatus.DONE),

    getPendingOrders: (state) =>
      state.orders.filter((order) => order.status === OrderStatus.PENDING),

    getOrdersStats: (state) => ({
      done: state.orders.filter((order) => order.status === OrderStatus.DONE)
        .length,
      pending: state.orders.filter(
        (order) => order.status === OrderStatus.PENDING
      ).length,
      created: state.orders.filter(
        (order) => order.status === OrderStatus.CREATED
      ).length
    })
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
  clearModalOrder,
  clearCache,
  clearError
} = feedDataSlice.actions;

export const {
  getFeedOrders,
  getTotalAmountOrders,
  getTotalAmountToday,
  getLoading,
  getError,
  selectModalOrder,
  getWebSocketStatus,
  getCurrentPage,
  getItemsPerPage,
  getTotalPages,
  getOrderFromCache,
  getLastUpdated,
  getOrdersByStatus,
  getPaginatedOrders,
  getRecentOrders,
  getDoneOrders,
  getPendingOrders,
  getOrdersStats
} = feedDataSlice.selectors;

export default feedDataSlice;

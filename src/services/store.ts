import {
  configureStore,
  combineReducers,
  Middleware,
  isRejectedWithValue
} from '@reduxjs/toolkit';
import ingredientsSlice from './slices/IngredientsSlice';
import burgerConstructorSlice from './slices/BurgerConstructorSlice';
import userStateSlice from './slices/UserInfoSlice';
import feedDataSlice from './slices/FeedDataSlice';
import userOrdersHistorySlice from './slices/UserOrdersHistory';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

// Constants
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const APP_STATE_KEY = 'appState';

// Middleware
const errorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    console.error('Async operation failed:', action.error);
  }
  return next(action);
};

const cacheMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (
    action &&
    typeof action === 'object' &&
    'type' in action &&
    typeof action.type === 'string' &&
    (action.type.startsWith('ingredients/') || action.type.startsWith('feed/'))
  ) {
    const state = store.getState();
    try {
      localStorage.setItem(
        APP_STATE_KEY,
        JSON.stringify({
          ingredients: state.ingredients,
          feeddata: state.feeddata,
          timestamp: Date.now()
        })
      );
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  return result;
};

// Root reducer
const rootReducer = combineReducers({
  [burgerConstructorSlice.name]: burgerConstructorSlice.reducer,
  [feedDataSlice.name]: feedDataSlice.reducer,
  [ingredientsSlice.name]: ingredientsSlice.reducer,
  [userStateSlice.name]: userStateSlice.reducer,
  [userOrdersHistorySlice.name]: userOrdersHistorySlice.reducer
});

// State loading utility
const loadPreloadedState = () => {
  try {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      const { timestamp, ...state } = JSON.parse(savedState);
      if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
        return state;
      }
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage:', e);
  }
  return undefined;
};

// Store configuration
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorMiddleware, cacheMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: loadPreloadedState()
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useDispatch = () => dispatchHook<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export { rootReducer };
export default store;

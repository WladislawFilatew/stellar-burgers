import { expect, test } from '@jest/globals';
import { rootReducer } from './store';
import store from './store';
import { configureStore } from '@reduxjs/toolkit';
import ingredientsSlice from './slices/IngredientsSlice';
import { userStateSlice } from './slices/UserInfoSlice';
import { feedDataSlice } from './slices/FeedDataSlice';
import { userOrdersHistorySlice } from './slices/UserOrdersHistory';
import burgerConstructorSlice from './slices/BurgerConstructorSlice';

describe('Store Configuration', () => {
  test('should initialize with correct initial state', () => {
    const initialState = store.getState();

    expect(initialState).toHaveProperty('ingredients');
    expect(initialState).toHaveProperty('userstate');
    expect(initialState).toHaveProperty('feeddata');
    expect(initialState).toHaveProperty('ordershistory');
    expect(initialState).toHaveProperty('burgerconstructor');
  });

  test('should handle unknown action', () => {
    const initialState = store.getState();
    const testAction = { type: 'UNKNOWN_ACTION' };
    const newState = rootReducer(initialState, testAction);

    expect(newState).toEqual(initialState);
  });

  test('should combine all reducers correctly', () => {
    const testStore = configureStore({
      reducer: {
        ingredients: ingredientsSlice.reducer,
        userstate: userStateSlice.reducer,
        feeddata: feedDataSlice.reducer,
        ordershistory: userOrdersHistorySlice.reducer,
        burgerconstructor: burgerConstructorSlice.reducer
      }
    });

    expect(testStore.getState()).toEqual(store.getState());
  });
});

describe('Store Integration', () => {
  test('should maintain state shape after multiple actions', () => {
    const initialState = store.getState();
    const actions = [
      { type: 'ingredients/getIngredients/pending' },
      { type: 'user/userApi/pending' },
      { type: 'feed/data/pending' }
    ];

    let currentState = initialState;
    actions.forEach((action) => {
      currentState = rootReducer(currentState, action);
      expect(currentState).toHaveProperty('ingredients');
      expect(currentState).toHaveProperty('userstate');
      expect(currentState).toHaveProperty('feeddata');
      expect(currentState).toHaveProperty('ordershistory');
      expect(currentState).toHaveProperty('burgerconstructor');
    });
  });

  test('should handle state updates independently', () => {
    const initialState = store.getState();

    const ingredientsState = rootReducer(initialState, {
      type: 'ingredients/getIngredients/pending'
    });
    expect(ingredientsState.ingredients.loading).toBe(true);
    expect(ingredientsState.userstate).toEqual(initialState.userstate);
    expect(ingredientsState.burgerconstructor).toEqual(
      initialState.burgerconstructor
    );

    const userState = rootReducer(initialState, {
      type: 'user/userApi/pending'
    });
    expect(userState.userstate.loginUserRequest).toBe(true);
    expect(userState.ingredients).toEqual(initialState.ingredients);
    expect(userState.burgerconstructor).toEqual(initialState.burgerconstructor);
  });
});

describe('Store Type Safety', () => {
  test('should maintain correct types for each slice', () => {
    const state = store.getState();

    expect(Array.isArray(state.ingredients.ingredients)).toBe(true);
    expect(typeof state.ingredients.loading).toBe('boolean');

    expect(typeof state.userstate.isAuthenticated).toBe('boolean');
    expect(typeof state.userstate.isAuthChecked).toBe('boolean');

    expect(Array.isArray(state.feeddata.orders)).toBe(true);
    expect(typeof state.feeddata.total).toBe('number');

    expect(Array.isArray(state.ordershistory.orders)).toBe(true);
    expect(typeof state.ordershistory.loading).toBe('boolean');

    expect(
      Array.isArray(state.burgerconstructor.constructorItems.ingredients)
    ).toBe(true);
    expect(typeof state.burgerconstructor.orderRequest).toBe('boolean');
  });
});

describe('Store Performance', () => {
  test('should handle rapid state updates', () => {
    const actions = Array(100)
      .fill(null)
      .map((_, index) => ({
        type: `TEST_ACTION_${index}`
      }));

    const startTime = performance.now();
    let state = store.getState();

    actions.forEach((action) => {
      state = rootReducer(state, action);
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    expect(executionTime).toBeLessThan(100);
  });
});

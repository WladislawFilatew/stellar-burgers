// These tests check the burger constructor reducers

import {
  addIngredient,
  removeIngredient,
  moveUpIngredient,
  moveDownIngredient,
  clearOrder,
  createOrder
} from './BurgerConstructorSlice';

import burgerConstructorSlice from './BurgerConstructorSlice';
import type { TStateBurgerConstructor } from './BurgerConstructorSlice';
import { TConstructorIngredient, TOrder } from '@utils-types';

describe('BurgerConstructorSlice', () => {
  let initialState: TStateBurgerConstructor;
  let ingredient1: TConstructorIngredient;
  let ingredient2: TConstructorIngredient;
  let bun: TConstructorIngredient;
  let testOrder: TOrder;

  beforeEach(() => {
    initialState = {
      constructorItems: {
        bun: null,
        ingredients: []
      },
      orderRequest: false,
      orderModalData: null,
      loading: false,
      error: null
    };

    testOrder = {
      _id: 'test-order-id',
      number: 12345,
      name: 'Test Burger',
      status: 'done',
      createdAt: '2024-01-01T12:00:00.000Z',
      updatedAt: '2024-01-01T12:00:00.000Z',
      ingredients: ['ingredient1', 'ingredient2']
    };

    ingredient1 = {
      id: '1',
      _id: '1',
      name: 'Соус Spicy-X',
      type: 'sauce',
      proteins: 30,
      fat: 20,
      carbohydrates: 40,
      calories: 30,
      price: 90,
      image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png'
    };

    ingredient2 = {
      id: '2',
      _id: '2',
      name: 'Биокотлета из марсианской Магнолии',
      type: 'main',
      proteins: 420,
      fat: 142,
      carbohydrates: 242,
      calories: 4242,
      price: 424,
      image: 'https://code.s3.yandex.net/react/code/meat-01.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
    };

    bun = {
      id: '3',
      _id: '3',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'https://code.s3.yandex.net/react/code/bun-02.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
    };
  });

  describe('addIngredient', () => {
    it('should add regular ingredient to empty constructor', () => {
      const newState = burgerConstructorSlice.reducer(
        initialState,
        addIngredient(ingredient1)
      );

      expect(newState).toEqual({
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            {
              ...ingredient1,
              id: expect.any(String)
            }
          ]
        }
      });
    });

    it('should add bun to empty constructor', () => {
      const newState = burgerConstructorSlice.reducer(
        initialState,
        addIngredient(bun)
      );

      expect(newState).toEqual({
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          bun: {
            ...bun,
            id: expect.any(String)
          }
        }
      });
    });

    it('should replace existing bun with new one', () => {
      const stateWithBun = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          bun: { ...bun, id: 'existing-bun' }
        }
      };

      const newBun = { ...bun, _id: '4', name: 'Новая булка' };
      const newState = burgerConstructorSlice.reducer(
        stateWithBun,
        addIngredient(newBun)
      );

      expect(newState.constructorItems.bun).toEqual({
        ...newBun,
        id: expect.any(String)
      });
    });

    it('should add multiple ingredients in correct order', () => {
      let state = burgerConstructorSlice.reducer(
        initialState,
        addIngredient(ingredient1)
      );
      state = burgerConstructorSlice.reducer(state, addIngredient(ingredient2));

      expect(state.constructorItems.ingredients).toHaveLength(2);
      expect(state.constructorItems.ingredients[0].name).toBe(ingredient1.name);
      expect(state.constructorItems.ingredients[1].name).toBe(ingredient2.name);
    });

    it('should replace old bun when adding new bun', () => {
      const firstBun = { ...bun, _id: 'bun1', name: 'Первая булка' };
      const secondBun = { ...bun, _id: 'bun2', name: 'Вторая булка' };

      let state = burgerConstructorSlice.reducer(
        initialState,
        addIngredient(firstBun)
      );
      state = burgerConstructorSlice.reducer(state, addIngredient(secondBun));

      expect(state.constructorItems.bun).toEqual({
        ...secondBun,
        id: expect.any(String)
      });
    });

    it('should maintain correct order when adding multiple ingredients', () => {
      const ingredients = [
        { ...ingredient1, _id: 'ing1' },
        { ...ingredient2, _id: 'ing2' },
        { ...ingredient1, _id: 'ing3' }
      ];

      let state = initialState;
      ingredients.forEach((ing) => {
        state = burgerConstructorSlice.reducer(state, addIngredient(ing));
      });

      expect(state.constructorItems.ingredients).toHaveLength(3);
      expect(state.constructorItems.ingredients.map((i) => i._id)).toEqual([
        'ing1',
        'ing2',
        'ing3'
      ]);
    });
  });

  describe('removeIngredient', () => {
    it('should remove ingredient from constructor', () => {
      const stateWithIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            { ...ingredient1, id: 'test-id-1' },
            { ...ingredient2, id: 'test-id-2' }
          ]
        }
      };

      const newState = burgerConstructorSlice.reducer(
        stateWithIngredients,
        removeIngredient({ ...ingredient1, id: 'test-id-1' })
      );

      expect(newState.constructorItems.ingredients).toHaveLength(1);
      expect(newState.constructorItems.ingredients[0].id).toBe('test-id-2');
    });

    it('should handle removing non-existent ingredient', () => {
      const stateWithIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [{ ...ingredient1, id: 'test-id-1' }]
        }
      };

      const newState = burgerConstructorSlice.reducer(
        stateWithIngredients,
        removeIngredient({ ...ingredient2, id: 'non-existent' })
      );

      expect(newState).toEqual(stateWithIngredients);
    });
  });

  describe('moveIngredient', () => {
    let stateWithIngredients: TStateBurgerConstructor;

    beforeEach(() => {
      stateWithIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            { ...ingredient1, id: 'test-id-1' },
            { ...ingredient2, id: 'test-id-2' }
          ]
        }
      };
    });

    describe('moveUpIngredient', () => {
      it('should move ingredient up', () => {
        const newState = burgerConstructorSlice.reducer(
          stateWithIngredients,
          moveUpIngredient(1)
        );

        expect(newState.constructorItems.ingredients[0].id).toBe('test-id-2');
        expect(newState.constructorItems.ingredients[1].id).toBe('test-id-1');
      });

      it('should not move first ingredient up', () => {
        const newState = burgerConstructorSlice.reducer(
          stateWithIngredients,
          moveUpIngredient(0)
        );

        expect(newState).toEqual(stateWithIngredients);
      });
    });

    describe('moveDownIngredient', () => {
      it('should move ingredient down', () => {
        const newState = burgerConstructorSlice.reducer(
          stateWithIngredients,
          moveDownIngredient(0)
        );

        expect(newState.constructorItems.ingredients[0].id).toBe('test-id-2');
        expect(newState.constructorItems.ingredients[1].id).toBe('test-id-1');
      });

      it('should not move last ingredient down', () => {
        const newState = burgerConstructorSlice.reducer(
          stateWithIngredients,
          moveDownIngredient(1)
        );

        expect(newState).toEqual(stateWithIngredients);
      });
    });

    it('should maintain correct order after multiple moves', () => {
      const stateWithThreeIngredients = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [
            { ...ingredient1, id: 'id1', _id: 'ing1' },
            { ...ingredient2, id: 'id2', _id: 'ing2' },
            { ...ingredient1, id: 'id3', _id: 'ing3' }
          ]
        }
      };

      let state = stateWithThreeIngredients;

      state = burgerConstructorSlice.reducer(state, moveUpIngredient(1));
      state = burgerConstructorSlice.reducer(state, moveUpIngredient(2));
      state = burgerConstructorSlice.reducer(state, moveUpIngredient(1));

      expect(state.constructorItems.ingredients.map((i) => i._id)).toEqual([
        'ing3',
        'ing2',
        'ing1'
      ]);
    });
  });

  describe('clearOrder', () => {
    it('should clear constructor completely', () => {
      const filledState = {
        ...initialState,
        constructorItems: {
          bun: { ...bun, id: 'test-bun' },
          ingredients: [
            { ...ingredient1, id: 'test-id-1' },
            { ...ingredient2, id: 'test-id-2' }
          ]
        },
        orderRequest: true,
        orderModalData: testOrder,
        loading: true
      };

      const newState = burgerConstructorSlice.reducer(
        filledState,
        clearOrder()
      );

      expect(newState).toEqual(initialState);
    });

    it('should handle clearing empty constructor', () => {
      const newState = burgerConstructorSlice.reducer(
        initialState,
        clearOrder()
      );
      expect(newState).toEqual(initialState);
    });
  });

  describe('createOrder', () => {
    it('should handle pending state', () => {
      const action = { type: createOrder.pending.type };
      const newState = burgerConstructorSlice.reducer(initialState, action);

      expect(newState.orderRequest).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const action = {
        type: createOrder.fulfilled.type,
        payload: { order: testOrder }
      };
      const newState = burgerConstructorSlice.reducer(initialState, action);

      expect(newState.orderRequest).toBe(false);
      expect(newState.orderModalData).toEqual(testOrder);
      expect(newState.constructorItems).toEqual({
        bun: null,
        ingredients: []
      });
    });

    it('should handle rejected state', () => {
      const error = new Error('Failed to create order');
      const action = {
        type: createOrder.rejected.type,
        error: { message: error.message }
      };
      const newState = burgerConstructorSlice.reducer(initialState, action);

      expect(newState.orderRequest).toBe(false);
      expect(newState.error).toBe(error.message);
    });
  });

  describe('edge cases', () => {
    it('should handle removing ingredient when constructor is empty', () => {
      const newState = burgerConstructorSlice.reducer(
        initialState,
        removeIngredient({ ...ingredient1, id: 'non-existent' })
      );
      expect(newState).toEqual(initialState);
    });

    it('should handle moving ingredient in constructor with single ingredient', () => {
      const stateWithSingleIngredient = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: [{ ...ingredient1, id: 'test-id-1' }]
        }
      };

      const upState = burgerConstructorSlice.reducer(
        stateWithSingleIngredient,
        moveUpIngredient(0)
      );
      const downState = burgerConstructorSlice.reducer(
        stateWithSingleIngredient,
        moveDownIngredient(0)
      );

      expect(upState).toEqual(stateWithSingleIngredient);
      expect(downState).toEqual(stateWithSingleIngredient);
    });

    it('should handle clearing constructor with only bun', () => {
      const stateWithOnlyBun = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          bun: { ...bun, id: 'test-bun' }
        }
      };

      const newState = burgerConstructorSlice.reducer(
        stateWithOnlyBun,
        clearOrder()
      );
      expect(newState).toEqual(initialState);
    });
  });
});

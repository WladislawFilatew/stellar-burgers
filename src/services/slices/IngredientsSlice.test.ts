//These tests check the request ingredients reducers

import { error } from 'console';
import ingredientsSlice, {
  getIngredients,
  TStateIngredients,
  getIngredientsWithSelector,
  getLoadingStatus,
  IngredientType
} from './IngredientsSlice';

const initialState: TStateIngredients = {
  ingredients: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedIngredient: null,
  ingredientCache: {}
};

const testIngredients = [
  {
    _id: '60d3b41abdacab0026a733c6',
    name: 'Краторная булка N-200i',
    type: IngredientType.BUN,
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
  },
  {
    _id: '60d3b41abdacab0026a733cc',
    name: 'Соус Spicy-X',
    type: IngredientType.SAUCE,
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png'
  },
  {
    _id: '60d3b41abdacab0026a733c8',
    name: 'Филе Люминесцентного тетраодонтимформа',
    type: IngredientType.MAIN,
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'https://code.s3.yandex.net/react/code/meat-03.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-03-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-03-large.png'
  }
];

describe('IngredientsSlice', () => {
  describe('Reducers', () => {
    describe('getIngredients', () => {
      it('should handle pending state', () => {
        const actualState = ingredientsSlice.reducer(
          { ...initialState, error: 'Test error' },
          getIngredients.pending('', undefined)
        );

        expect(actualState.loading).toBe(true);
        expect(actualState.error).toBeNull();
        expect(actualState.ingredients).toEqual([]);
      });

      it('should handle fulfilled state', () => {
        const actualState = ingredientsSlice.reducer(
          { ...initialState, loading: true },
          getIngredients.fulfilled(testIngredients, '')
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.error).toBeNull();
        expect(actualState.ingredients).toEqual(testIngredients);
      });

      it('should handle rejected state', () => {
        const error = new Error('Failed to fetch ingredients');
        const actualState = ingredientsSlice.reducer(
          { ...initialState, loading: true },
          getIngredients.rejected(error, '')
        );

        expect(actualState.loading).toBe(false);
        expect(actualState.error).toBe('Failed to fetch ingredients');
        expect(actualState.ingredients).toEqual([]);
      });
    });
  });

  describe('Selectors', () => {
    const state = {
      ingredients: {
        ...initialState,
        ingredients: testIngredients
      }
    };

    it('should select all ingredients', () => {
      expect(getIngredientsWithSelector(state)).toEqual(testIngredients);
    });

    it('should select loading status', () => {
      const loadingState = {
        ingredients: {
          ...state.ingredients,
          loading: true
        }
      };
      expect(getLoadingStatus(loadingState)).toBe(true);
    });
  });

  describe('Ingredient Types', () => {
    const state = ingredientsSlice.reducer(
      initialState,
      getIngredients.fulfilled(testIngredients, '')
    );

    it('should contain ingredients of each type', () => {
      const buns = state.ingredients.filter(
        (item) => item.type === IngredientType.BUN
      );
      const sauces = state.ingredients.filter(
        (item) => item.type === IngredientType.SAUCE
      );
      const mains = state.ingredients.filter(
        (item) => item.type === IngredientType.MAIN
      );

      expect(buns).toHaveLength(1);
      expect(sauces).toHaveLength(1);
      expect(mains).toHaveLength(1);
    });

    it('should maintain ingredient structure', () => {
      state.ingredients.forEach((ingredient) => {
        expect(ingredient).toHaveProperty('_id');
        expect(ingredient).toHaveProperty('name');
        expect(ingredient).toHaveProperty('type');
        expect(ingredient).toHaveProperty('proteins');
        expect(ingredient).toHaveProperty('fat');
        expect(ingredient).toHaveProperty('carbohydrates');
        expect(ingredient).toHaveProperty('calories');
        expect(ingredient).toHaveProperty('price');
        expect(ingredient).toHaveProperty('image');
        expect(ingredient).toHaveProperty('image_mobile');
        expect(ingredient).toHaveProperty('image_large');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty ingredients array', () => {
      const actualState = ingredientsSlice.reducer(
        initialState,
        getIngredients.fulfilled([], '')
      );

      expect(actualState.ingredients).toEqual([]);
      expect(actualState.loading).toBe(false);
      expect(actualState.error).toBeNull();
    });

    it('should preserve existing ingredients on pending', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: testIngredients
      };

      const actualState = ingredientsSlice.reducer(
        stateWithIngredients,
        getIngredients.pending('')
      );

      expect(actualState.ingredients).toEqual(testIngredients);
      expect(actualState.loading).toBe(true);
      expect(actualState.error).toBeNull();
    });

    it('should handle multiple fulfilled calls', () => {
      let state = ingredientsSlice.reducer(
        initialState,
        getIngredients.fulfilled([testIngredients[0]], '')
      );

      state = ingredientsSlice.reducer(
        state,
        getIngredients.fulfilled(testIngredients, '')
      );

      expect(state.ingredients).toEqual(testIngredients);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

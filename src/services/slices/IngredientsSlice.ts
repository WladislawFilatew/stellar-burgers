import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';
import { getIngredientsApi } from '../../utils/burger-api';

export enum IngredientType {
  BUN = 'bun',
  SAUCE = 'sauce',
  MAIN = 'main'
}

export type TStateIngredients = {
  ingredients: Array<TIngredient>;
  loading: boolean;
  error: null | string;
  lastUpdated: number | null;
  selectedIngredient: TIngredient | null;
  ingredientCache: Record<string, TIngredient>;
};

const initialState: TStateIngredients = {
  ingredients: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedIngredient: null,
  ingredientCache: {}
};

// Async thunk with error handling and caching
export const getIngredients = createAsyncThunk(
  'ingredients/getIngredients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getIngredientsApi();
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch ingredients'
      );
    }
  }
);

// Helper functions
const calculateTotalPrice = (ingredients: TIngredient[]): number =>
  ingredients.reduce((total, item) => total + item.price, 0);

const groupIngredientsByType = (
  ingredients: TIngredient[]
): Record<IngredientType, TIngredient[]> =>
  ingredients.reduce(
    (acc, ingredient) => {
      const type = ingredient.type as IngredientType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(ingredient);
      return acc;
    },
    {} as Record<IngredientType, TIngredient[]>
  );

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    // Actions for ingredient selection
    selectIngredient: (state, action: PayloadAction<string>) => {
      state.selectedIngredient = state.ingredientCache[action.payload] || null;
    },
    clearSelectedIngredient: (state) => {
      state.selectedIngredient = null;
    },

    // Cache management
    clearCache: (state) => {
      state.ingredientCache = {};
      state.lastUpdated = null;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ingredients';
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload;
        state.lastUpdated = Date.now();

        // Update cache
        action.payload.forEach((ingredient: TIngredient) => {
          state.ingredientCache[ingredient._id] = ingredient;
        });
      });
  },
  selectors: {
    // Basic selectors
    getIngredientsWithSelector: (state) => state.ingredients,
    getLoadingStatus: (state) => state.loading,
    getError: (state) => state.error,
    getSelectedIngredient: (state) => state.selectedIngredient,
    getLastUpdated: (state) => state.lastUpdated,

    // Cache selectors
    getIngredientFromCache: (state, id: string) => state.ingredientCache[id],

    // Type-based selectors
    getBuns: (state) =>
      state.ingredients.filter((item) => item.type === IngredientType.BUN),
    getSauces: (state) =>
      state.ingredients.filter((item) => item.type === IngredientType.SAUCE),
    getMains: (state) =>
      state.ingredients.filter((item) => item.type === IngredientType.MAIN),

    // Advanced selectors
    getIngredientsByType: (state) => groupIngredientsByType(state.ingredients),

    // Price-related selectors
    getTotalPrice: (state, ingredients: TIngredient[]) =>
      calculateTotalPrice(ingredients),

    // Stats selectors
    getIngredientsStats: (state) => ({
      total: state.ingredients.length,
      buns: state.ingredients.filter((item) => item.type === IngredientType.BUN)
        .length,
      sauces: state.ingredients.filter(
        (item) => item.type === IngredientType.SAUCE
      ).length,
      mains: state.ingredients.filter(
        (item) => item.type === IngredientType.MAIN
      ).length
    })
  }
});

export const {
  selectIngredient,
  clearSelectedIngredient,
  clearCache,
  clearError
} = ingredientsSlice.actions;

export const {
  getIngredientsWithSelector,
  getLoadingStatus,
  getError,
  getSelectedIngredient,
  getLastUpdated,
  getIngredientFromCache,
  getBuns,
  getSauces,
  getMains,
  getIngredientsByType,
  getTotalPrice,
  getIngredientsStats
} = ingredientsSlice.selectors;

export default ingredientsSlice;

import { forwardRef, useMemo } from 'react';
import { TIngredientsCategoryProps } from './type';
import { TIngredient } from '@utils-types';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { useSelector } from '../../services/store';
import { getConstructorItems } from '../../services/slices/BurgerConstructorSlice';

type TIngredientCounters = {
  [key: string]: number;
};

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients = [], ...rest }, ref) => {
  const burgerConstructor = useSelector(getConstructorItems);

  const ingredientsCounters = useMemo<TIngredientCounters>(() => {
    const counters: TIngredientCounters = {};
    const { bun, ingredients: constructorIngredients } = burgerConstructor;

    constructorIngredients.forEach((ingredient: TIngredient) => {
      counters[ingredient._id] = (counters[ingredient._id] || 0) + 1;
    });

    if (bun) {
      counters[bun._id] = 2;
    }

    return counters;
  }, [burgerConstructor]);

  if (!title) {
    console.error('IngredientsCategory: title prop is required');
    return null;
  }

  if (!titleRef) {
    console.error('IngredientsCategory: titleRef prop is required');
    return null;
  }

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
      {...rest}
    />
  );
});

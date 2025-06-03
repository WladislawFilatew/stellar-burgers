import { FC, memo, useCallback, useMemo } from 'react';
import { BurgerConstructorElementUI } from '@ui';
import { BurgerConstructorElementProps } from './type';
import { useDispatch } from '../../services/store';
import {
  removeIngredient,
  moveUpIngredient,
  moveDownIngredient
} from '../../services/slices/BurgerConstructorSlice';

export const BurgerConstructorElement: FC<BurgerConstructorElementProps> = memo(
  ({ ingredient, index, totalItems }) => {
    const dispatch = useDispatch();

    const isValidIndex = useMemo(
      () => index >= 0 && index < totalItems,
      [index, totalItems]
    );

    if (!isValidIndex) {
      console.error(
        'Invalid index or totalItems value in BurgerConstructorElement'
      );
      return null;
    }

    const handleMoveDown = useCallback(() => {
      if (index < totalItems - 1) {
        dispatch(moveDownIngredient(index));
      }
    }, [dispatch, index, totalItems]);

    const handleMoveUp = useCallback(() => {
      if (index > 0) {
        dispatch(moveUpIngredient(index));
      }
    }, [dispatch, index]);

    const handleClose = useCallback(() => {
      if (ingredient) {
        dispatch(removeIngredient(ingredient));
      }
    }, [dispatch, ingredient]);

    return (
      <BurgerConstructorElementUI
        ingredient={ingredient}
        index={index}
        totalItems={totalItems}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleClose={handleClose}
      />
    );
  }
);

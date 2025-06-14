import { FC, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from '../../services/store';

import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';
import { BurgerConstructorUI } from '@ui';

import {
  getConstructorItems,
  getOrderRequest,
  getOrderModalData,
  createOrder,
  clearOrder
} from '../../services/slices/BurgerConstructorSlice';
import { selectIsAuthenticated } from '../../services/slices/UserInfoSlice';

interface ConstructorItems {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
}

const calculateTotalPrice = (items: ConstructorItems): number => {
  const bunPrice = items.bun ? items.bun.price * 2 : 0;
  const ingredientsPrice = items.ingredients.reduce(
    (sum, ingredient) => sum + ingredient.price,
    0
  );
  return bunPrice + ingredientsPrice;
};

const prepareOrderIngredients = (items: ConstructorItems): string[] => {
  if (!items.bun) return [];

  return [
    items.bun._id,
    ...items.ingredients.map((ingredient) => ingredient._id),
    items.bun._id
  ];
};

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector(getConstructorItems);
  const orderRequest = useSelector(getOrderRequest);
  const orderModalData = useSelector(getOrderModalData);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const totalPrice = useMemo(
    () => calculateTotalPrice(constructorItems),
    [constructorItems]
  );

  const handleOrderClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!constructorItems.bun || orderRequest) {
      return;
    }

    const orderIngredients = prepareOrderIngredients(constructorItems);
    if (orderIngredients.length > 0) {
      dispatch(createOrder(orderIngredients));
    }
  }, [isAuthenticated, constructorItems, orderRequest, dispatch, navigate]);

  const handleOrderModalClose = useCallback(() => {
    dispatch(clearOrder());
    navigate('/');
  }, [dispatch, navigate]);

  return (
    <BurgerConstructorUI
      price={totalPrice}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={handleOrderClick}
      closeOrderModal={handleOrderModalClose}
    />
  );
};

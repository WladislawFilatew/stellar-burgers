import { FC, memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { OrderCardProps } from './type';
import { TIngredient, TOrder } from '@utils-types';
import { OrderCardUI } from '../ui/order-card';
import { useSelector } from '../../services/store';
import { getIngredientsWithSelector } from '../../services/slices/IngredientsSlice';

const MAX_VISIBLE_INGREDIENTS = 6;

interface ExtendedOrderInfo {
  ingredientsInfo: TIngredient[];
  ingredientsToShow: TIngredient[];
  remains: number;
  total: number;
  date: Date;
}

type OrderInfo = TOrder & ExtendedOrderInfo;

export const OrderCard: FC<OrderCardProps> = memo(({ order }) => {
  const location = useLocation();
  const ingredients = useSelector(getIngredientsWithSelector);

  const orderInfo = useMemo<OrderInfo | null>(() => {
    if (!ingredients.length || !order.ingredients.length) {
      return null;
    }

    const ingredientsInfo = order.ingredients
      .map((id) => ingredients.find((ing) => ing._id === id))
      .filter(
        (ingredient): ingredient is TIngredient => ingredient !== undefined
      );

    if (!ingredientsInfo.length) {
      return null;
    }

    const total = ingredientsInfo.reduce((sum, item) => sum + item.price, 0);

    const ingredientsToShow = ingredientsInfo.slice(0, MAX_VISIBLE_INGREDIENTS);
    const remains = Math.max(
      0,
      ingredientsInfo.length - MAX_VISIBLE_INGREDIENTS
    );

    return {
      ...order,
      ingredientsInfo,
      ingredientsToShow,
      remains,
      total,
      date: new Date(order.createdAt)
    };
  }, [order, ingredients]);

  if (!orderInfo) {
    return (
      <div className='text text_type_main-default text_color_inactive'>
        Информация о заказе недоступна
      </div>
    );
  }

  return (
    <OrderCardUI
      orderInfo={orderInfo}
      maxIngredients={MAX_VISIBLE_INGREDIENTS}
      locationState={{ background: location }}
    />
  );
});

import { FC, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { getIngredientsWithSelector } from '../../services/slices/IngredientsSlice';
import { getOrderByNum } from '../../services/slices/FeedDataSlice';
import { useSelector, useDispatch } from '../../services/store';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { selectOrderById } from '../../services/selector';

interface TIngredientWithCount extends TIngredient {
  count: number;
}

interface ExtendedOrderInfo extends TOrder {
  ingredientsInfo: Record<string, TIngredientWithCount>;
  date: Date;
  total: number;
}

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const orderNumber = Number(number);
  const dispatch = useDispatch();

  const orderData = useSelector(selectOrderById(orderNumber));
  const ingredients = useSelector(getIngredientsWithSelector);

  useEffect(() => {
    if (!orderData && !isNaN(orderNumber)) {
      dispatch(getOrderByNum(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  const orderInfo = useMemo<ExtendedOrderInfo | null>(() => {
    if (!orderData || !ingredients.length) {
      return null;
    }

    const ingredientsInfo = orderData.ingredients.reduce<
      Record<string, TIngredientWithCount>
    >((acc, itemId) => {
      if (!acc[itemId]) {
        const ingredient = ingredients.find((ing) => ing._id === itemId);
        if (ingredient) {
          acc[itemId] = {
            ...ingredient,
            count: 1
          };
        }
      } else {
        acc[itemId].count++;
      }
      return acc;
    }, {});

    if (Object.keys(ingredientsInfo).length === 0) {
      return null;
    }

    const total = Object.values(ingredientsInfo).reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date: new Date(orderData.createdAt),
      total
    };
  }, [orderData, ingredients]);

  if (!number || isNaN(orderNumber)) {
    return (
      <div className='text text_type_main-default text_color_error'>
        Некорректный номер заказа
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className='text text_type_main-default text_color_inactive'>
        <Preloader />
        <div className='mt-4'>Загрузка информации о заказе...</div>
      </div>
    );
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};

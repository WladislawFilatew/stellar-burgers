import { FC, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from '../../services/store';
import {
  getIngredientsWithSelector,
  getLoadingStatus,
  getError
} from '../../services/slices/IngredientsSlice';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import styles from '../app/app.module.css';

export const IngredientDetails: FC = () => {
  const { id } = useParams();

  const ingredients = useSelector(getIngredientsWithSelector);
  const isLoading = useSelector(getLoadingStatus);
  const error = useSelector(getError);

  const ingredientData = useMemo(
    () => ingredients.find((item) => item._id === id),
    [ingredients, id]
  );

  if (isLoading) {
    return (
      <div className={styles.detailPageWrap}>
        <Preloader />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${styles.detailPageWrap} text text_type_main-medium text_color_error`}
      >
        Произошла ошибка при загрузке данных ингредиента
      </div>
    );
  }

  if (!ingredients.length) {
    return (
      <div
        className={`${styles.detailPageWrap} text text_type_main-medium text_color_inactive`}
      >
        Список ингредиентов пуст
      </div>
    );
  }

  if (!ingredientData) {
    return (
      <Navigate
        to='/ingredients'
        replace
        state={{ error: 'Ингредиент не найден' }}
      />
    );
  }

  return (
    <div className={styles.detailPageWrap}>
      <IngredientDetailsUI ingredientData={ingredientData} />
    </div>
  );
};

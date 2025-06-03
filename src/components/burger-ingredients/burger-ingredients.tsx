import { useState, useRef, useEffect, FC, useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { TTabMode, TIngredient } from '@utils-types';
import { BurgerIngredientsUI } from '../ui/burger-ingredients';
import { useSelector } from '../../services/store';
import {
  getIngredientsWithSelector,
  getLoadingStatus,
  getError,
  IngredientType
} from '../../services/slices/IngredientsSlice';
import { Preloader } from '../../components/ui';
import styles from './burger-ingredients.module.css';

export const BurgerIngredients: FC = () => {
  const ingredients = useSelector(getIngredientsWithSelector);
  const isLoading = useSelector(getLoadingStatus);
  const error = useSelector(getError);

  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');

  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);

  const [bunsRef, inViewBuns] = useInView({ threshold: 0 });
  const [mainsRef, inViewFilling] = useInView({ threshold: 0 });
  const [saucesRef, inViewSauces] = useInView({ threshold: 0 });

  const { buns, mains, sauces } = useMemo(
    () => ({
      buns: ingredients.filter((item) => item.type === IngredientType.BUN),
      mains: ingredients.filter((item) => item.type === IngredientType.MAIN),
      sauces: ingredients.filter((item) => item.type === IngredientType.SAUCE)
    }),
    [ingredients]
  );

  useEffect(() => {
    if (!isLoading && !error) {
      if (inViewBuns) {
        setCurrentTab('bun');
      } else if (inViewSauces) {
        setCurrentTab('sauce');
      } else if (inViewFilling) {
        setCurrentTab('main');
      }
    }
  }, [inViewBuns, inViewFilling, inViewSauces, isLoading, error]);

  const onTabClick = useCallback((tab: string) => {
    const tabMode = tab as TTabMode;
    setCurrentTab(tabMode);

    const scrollRefs = {
      bun: titleBunRef,
      main: titleMainRef,
      sauce: titleSaucesRef
    };

    scrollRefs[tabMode]?.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div
        className={`${styles.error_message} text text_type_main-medium text_color_error`}
      >
        Произошла ошибка при загрузке ингредиентов
      </div>
    );
  }

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={buns}
      mains={mains}
      sauces={sauces}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};

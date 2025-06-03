import { FC, memo } from 'react';
import {
  Button,
  ConstructorElement,
  CurrencyIcon
} from '@zlden/react-developer-burger-ui-components';
import { BurgerConstructorElement, Modal } from '@components';
import { Preloader, OrderDetailsUI } from '@ui';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUIProps } from './type';
import styles from './burger-constructor.module.css';

interface BunElementProps {
  bun: TConstructorIngredient | null;
  type: 'top' | 'bottom';
  className: string;
  dataCy: string;
}

const BunElement: FC<BunElementProps> = memo(
  ({ bun, type, className, dataCy }) => {
    if (!bun) {
      return (
        <div
          className={`${styles.noBuns} ${type === 'top' ? styles.noBunsTop : styles.noBunsBottom} ml-8 mb-4 mr-5 text text_type_main-default`}
          data-cy={dataCy}
        >
          Выберите булки
        </div>
      );
    }

    return (
      <div className={className} data-cy={dataCy}>
        <ConstructorElement
          type={type}
          isLocked
          text={`${bun.name} (${type === 'top' ? 'верх' : 'низ'})`}
          price={bun.price}
          thumbnail={bun.image}
        />
      </div>
    );
  }
);

const IngredientsSection: FC<{ ingredients: TConstructorIngredient[] }> = memo(
  ({ ingredients }) => {
    if (ingredients.length === 0) {
      return (
        <div
          className={`${styles.noBuns} ml-8 mb-4 mr-5 text text_type_main-default`}
        >
          Выберите начинку
        </div>
      );
    }

    return (
      <>
        {ingredients.map((item, index) => (
          <BurgerConstructorElement
            ingredient={item}
            index={index}
            totalItems={ingredients.length}
            key={item.id}
          />
        ))}
      </>
    );
  }
);

const OrderSection: FC<{
  price: number;
  onOrderClick: () => void;
  isDisabled?: boolean;
}> = memo(({ price, onOrderClick, isDisabled }) => (
  <div className={`${styles.total} mt-10 mr-4`} data-cy='order_button'>
    <div className={`${styles.cost} mr-10`}>
      <p className={`text ${styles.text} mr-2`}>{price}</p>
      <CurrencyIcon type='primary' />
    </div>
    <Button
      htmlType='button'
      type='primary'
      size='large'
      onClick={onOrderClick}
      disabled={isDisabled}
    >
      Оформить заказ
    </Button>
  </div>
));

export const BurgerConstructorUI: FC<BurgerConstructorUIProps> = memo(
  ({
    constructorItems,
    orderRequest,
    price,
    orderModalData,
    onOrderClick,
    closeOrderModal
  }) => {
    const isOrderDisabled = !constructorItems.bun || orderRequest;

    return (
      <section className={styles.burger_constructor} data-cy='constructor'>
        <BunElement
          bun={constructorItems.bun}
          type='top'
          className={`${styles.element} mb-4 mr-4`}
          dataCy='bun_1_constructor'
        />

        <ul className={styles.elements} data-cy='ingredient_constructor'>
          <IngredientsSection ingredients={constructorItems.ingredients} />
        </ul>

        <BunElement
          bun={constructorItems.bun}
          type='bottom'
          className={`${styles.element} mt-4 mr-4`}
          dataCy='bun_2_constructor'
        />

        <OrderSection
          price={price}
          onOrderClick={onOrderClick}
          isDisabled={isOrderDisabled}
        />

        {orderRequest && (
          <Modal onClose={closeOrderModal} title='Оформляем заказ...'>
            <Preloader />
          </Modal>
        )}

        {orderModalData && (
          <Modal
            onClose={closeOrderModal}
            title={orderRequest ? 'Оформляем заказ...' : ''}
          >
            <OrderDetailsUI orderNumber={orderModalData.number} />
          </Modal>
        )}
      </section>
    );
  }
);

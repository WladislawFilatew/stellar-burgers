import { FC, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from '../../services/store';

import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';

import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';
import { ProtectedRoute } from '../protected-route';

import { getIngredients } from '../../services/slices/IngredientsSlice';
import { checkUserAuth } from '../../services/slices/UserInfoSlice';

import '../../index.css';
import styles from './app.module.css';

interface LocationState {
  background?: Location;
}

const ROUTE_PATHS = {
  HOME: '/',
  INGREDIENTS: '/ingredients/:id',
  FEED: '/feed',
  FEED_ITEM: '/feed/:number',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  PROFILE_ORDERS: '/profile/orders',
  PROFILE_ORDER_ITEM: '/profile/orders/:number',
  NOT_FOUND: '*'
} as const;

const App: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const locationState = location.state as LocationState;
  const background = locationState?.background;

  useEffect(() => {
    Promise.all([dispatch(getIngredients()), dispatch(checkUserAuth())]).catch(
      (error) => {
        console.error('Failed to initialize app:', error);
      }
    );
  }, [dispatch]);

  const handleModalClose = () => {
    navigate(-1);
  };

  const renderProtectedRoute = (element: JSX.Element, onlyUnAuth?: boolean) => (
    <ProtectedRoute onlyUnAuth={onlyUnAuth}>{element}</ProtectedRoute>
  );

  const renderModalRoute = (
    path: string,
    element: JSX.Element,
    title?: string,
    isProtected?: boolean
  ) => {
    const modalContent = (
      <Modal title={title || ''} onClose={handleModalClose}>
        {element}
      </Modal>
    );

    return (
      <Route
        path={path}
        element={
          isProtected ? renderProtectedRoute(modalContent) : modalContent
        }
      />
    );
  };

  return (
    <div className={styles.app}>
      <AppHeader />

      <Routes location={background || location}>
        <Route path={ROUTE_PATHS.HOME} element={<ConstructorPage />} />
        <Route path={ROUTE_PATHS.INGREDIENTS} element={<IngredientDetails />} />
        <Route path={ROUTE_PATHS.FEED} element={<Feed />} />
        <Route
          path={ROUTE_PATHS.LOGIN}
          element={renderProtectedRoute(<Login />, true)}
        />
        <Route
          path={ROUTE_PATHS.REGISTER}
          element={renderProtectedRoute(<Register />, true)}
        />
        <Route
          path={ROUTE_PATHS.FORGOT_PASSWORD}
          element={renderProtectedRoute(<ForgotPassword />, true)}
        />
        <Route
          path={ROUTE_PATHS.RESET_PASSWORD}
          element={renderProtectedRoute(<ResetPassword />)}
        />
        <Route
          path={ROUTE_PATHS.PROFILE}
          element={renderProtectedRoute(<Profile />)}
        />
        <Route
          path={ROUTE_PATHS.PROFILE_ORDERS}
          element={renderProtectedRoute(<ProfileOrders />)}
        />
        <Route path={ROUTE_PATHS.FEED_ITEM} element={<OrderInfo />} />
        <Route path={ROUTE_PATHS.INGREDIENTS} element={<IngredientDetails />} />
        <Route
          path={ROUTE_PATHS.PROFILE_ORDER_ITEM}
          element={renderProtectedRoute(<OrderInfo />)}
        />
        <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          {renderModalRoute(ROUTE_PATHS.FEED_ITEM, <OrderInfo />)}
          {renderModalRoute(
            ROUTE_PATHS.INGREDIENTS,
            <IngredientDetails />,
            'Детали ингредиента'
          )}
          {renderModalRoute(
            ROUTE_PATHS.PROFILE_ORDER_ITEM,
            <OrderInfo />,
            '',
            true
          )}
          <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFound404 />} />
        </Routes>
      )}
    </div>
  );
};

export default App;

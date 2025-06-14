import { FC, memo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';
import { TAppHeaderUIProps } from './type';
import styles from './app-header.module.css';

interface NavItemProps {
  to: string;
  icon: JSX.Element;
  text: string;
  className?: string;
  'data-cy'?: string;
}

const NavItem: FC<NavItemProps> = memo(
  ({ to, icon, text, className = '', 'data-cy': dataCy }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.link} ${isActive ? styles.link_active : ''} ${className}`
      }
      data-cy={dataCy}
    >
      {icon}
      <p className='text text_type_main-default ml-2'>{text}</p>
    </NavLink>
  )
);

export const AppHeaderUI: FC<TAppHeaderUIProps> = memo(({ userName }) => (
  <header className={styles.header} data-cy='app-header'>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        <NavItem
          to='/'
          icon={<BurgerIcon type='primary' />}
          text='Конструктор'
          className='mr-10'
          data-cy='constructor-link'
        />
        <NavItem
          to='/feed'
          icon={<ListIcon type='primary' />}
          text='Лента заказов'
          data-cy='feed-link'
        />
      </div>

      <div className={styles.logo}>
        <Logo className={styles.logo_image} />
      </div>

      <div className={styles.link_position_last}>
        <NavItem
          to='/profile'
          icon={<ProfileIcon type='primary' />}
          text={userName || 'Личный кабинет'}
          data-cy='profile-link'
        />
      </div>
    </nav>
  </header>
));

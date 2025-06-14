import { ProfileMenuUI } from '@ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Example/ProfileMenu',
  component: ProfileMenuUI,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ProfileMenuUI>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultProfileMenu: Story = {
  args: {
    pathname: '/profile',
    handleLogout: () => {},
    isLoggingOut: false,
    logoutError: null
  }
};

export const LoadingState: Story = {
  args: {
    pathname: '/profile',
    handleLogout: () => {},
    isLoggingOut: true,
    logoutError: null
  }
};

export const ErrorState: Story = {
  args: {
    pathname: '/profile',
    handleLogout: () => {},
    isLoggingOut: false,
    logoutError: 'Произошла ошибка при выходе из системы'
  }
};

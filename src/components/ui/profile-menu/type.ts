export type ProfileMenuUIProps = {
  pathname: string;
  handleLogout: () => void;
  isLoggingOut: boolean;
  logoutError: string | null;
};

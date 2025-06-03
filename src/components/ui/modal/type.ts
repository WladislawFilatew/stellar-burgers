import { HTMLAttributes, ReactNode } from 'react';

export interface ModalUIProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  testId?: string;
}

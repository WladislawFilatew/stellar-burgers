import { memo } from 'react';
import styles from './modal-overlay.module.css';

interface ModalOverlayProps {
  onClick: () => void;
  testId?: string;
}

export const ModalOverlayUI = memo<ModalOverlayProps>(
  ({ onClick, testId = 'overlay' }) => (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClick();
        }
      }}
      data-cy={testId}
      role='presentation'
      aria-hidden='true'
    />
  )
);

ModalOverlayUI.displayName = 'ModalOverlayUI';

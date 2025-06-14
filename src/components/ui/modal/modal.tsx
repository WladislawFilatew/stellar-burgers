import { memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@zlden/react-developer-burger-ui-components';
import { ModalOverlayUI } from '@ui';
import { ModalUIProps } from './type';
import styles from './modal.module.css';

export const ModalUI = memo<ModalUIProps>(
  ({
    title,
    onClose,
    children,
    className,
    showCloseButton = true,
    testId = 'modal',
    ...rest
  }) => {
    const handleEscapeKey = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      },
      [onClose]
    );

    useEffect(() => {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }, [handleEscapeKey]);

    const modalContent = (
      <>
        <div
          className={`${styles.modal} ${className || ''}`}
          role='dialog'
          aria-modal='true'
          aria-labelledby={title ? 'modal-title' : undefined}
          data-cy={testId}
          {...rest}
        >
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h3
                  id='modal-title'
                  className={`${styles.title} text text_type_main-large`}
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  className={styles.button}
                  type='button'
                  onClick={onClose}
                  aria-label='Закрыть модальное окно'
                  data-cy='close_icon'
                >
                  <CloseIcon type='primary' />
                </button>
              )}
            </div>
          )}
          <div className={styles.content}>{children}</div>
        </div>
        <ModalOverlayUI onClick={onClose} />
      </>
    );

    return createPortal(
      modalContent,
      document.getElementById('modals') || document.body
    );
  }
);

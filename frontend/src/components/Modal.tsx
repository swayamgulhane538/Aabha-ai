import React from 'react';
import { ModalPortal } from './ModalPortal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      {children}
    </ModalPortal>
  );
};

export default Modal;

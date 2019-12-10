import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from 'evergreen-ui';
import { motion } from 'framer-motion';

import { Column } from './core';

const Overlay = styled(Column)`
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 64px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.blacks[5]};
`;

const Container = styled(Column)`
  position: relative;
  overflow: hidden;
  z-index: 9999;
`;

const CloseButton = styled.button`
  display: flex;
  appearance: none;
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid ${props => props.theme.colors.white};

  transition: background-color 200ms;

  &:hover {
    background-color: ${props => props.theme.colors.black};
  }

  & > svg {
    transition: fill 200ms;
  }

  &:hover > svg {
    fill: #fff !important;
  }
`;

const Popup = ({ children, show, onClose }) => {
  const node = useRef();

  const handleClick = e => {
    if (!node.current.contains(e.target)) {
      onClose();
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <Overlay>
      <Container ref={node}>
        {children}
        <CloseButton onClick={onClose}>
          <Icon icon="cross" size={12} />
        </CloseButton>
      </Container>
    </Overlay>
  );
};

export default Popup;

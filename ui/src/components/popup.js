import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from 'evergreen-ui';
import { motion } from 'framer-motion';

import { Column } from './core';

const Overlay = styled(Column)`
  position: absolute;
  z-index: 9999999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: ${props => props.theme.colors.overlay};
`;

const Container = styled(Column)`
  position: relative;
  max-height: 80vh;
  z-index: 9999999;
`;

const Content = styled(Column)`
  overflow: hidden;
  & > div {
    overflow: auto;
  }
`;

const CloseButton = styled.button`
  display: flex;
  appearance: none;
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0px;
  left: -64px;
  padding: 4px;
  border-radius: 999px;
  z-index: 9999999;
  cursor: pointer;
  border: 1px solid ${props => props.theme.colors.white};

  transition: background-color 200ms;
  background-color: transparent;

  &:hover {
    background-color: ${props => props.theme.colors.white};
  }

  & svg {
    transition: fill 200ms;
  }

  &:hover svg {
    fill: ${props => props.theme.colors.black} !important;
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
        <CloseButton onClick={onClose}>
          <Icon icon="cross" size={20} color="white" />
        </CloseButton>
        <Content>{children}</Content>
      </Container>
    </Overlay>
  );
};

export default Popup;

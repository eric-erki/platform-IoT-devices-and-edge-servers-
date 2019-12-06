import React from 'react';
import { default as Spinkit } from 'react-spinkit';
import styled from 'styled-components';

import { Column } from './core';

const Container = styled(Column)`
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Spinner = ({ fadeIn = 'full', name = 'grid', show = false }) => {
  if (!show) {
    return null;
  }
  return (
    <Container>
      <Spinkit fadeIn={fadeIn} name={name} />
    </Container>
  );
};

export default Spinner;

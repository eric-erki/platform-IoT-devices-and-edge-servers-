import React from 'react';
import { Icon } from 'evergreen-ui';

import { Column, Row } from './core';

const Alert = ({ show, type, children }) => {
  if (!show) {
    return null;
  }
  return (
    <Column bg="whites.5" padding={3}>
      <Row justifyContent="center">
        <Icon icon={type} color="black" />
        {children}
      </Row>
    </Column>
  );
};

export default Alert;

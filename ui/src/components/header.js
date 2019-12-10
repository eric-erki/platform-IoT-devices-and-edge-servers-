import React from 'react';
import styled from 'styled-components';

import { Row, Text } from './core';
import AvatarMenu from './avatar-menu';

const Title = styled(Text)`
  text-transform: capitalize;
`;

Title.defaultProps = {
  fontSize: 3,
  fontWeight: 2,
  color: 'white',
};

const Header = ({ title }) => (
  <Row
    alignItems="center"
    justifyContent="space-between"
    alignSelf="stretch"
    padding={4}
  >
    <Row flex={1} alignItems="center" />
    <Row justifyContent="center" flex={1}>
      <Title>{title}</Title>
    </Row>
    <Row justifyContent="flex-end" alignItems="flex-start" flex={1}>
      <AvatarMenu />
    </Row>
  </Row>
);

export default Header;

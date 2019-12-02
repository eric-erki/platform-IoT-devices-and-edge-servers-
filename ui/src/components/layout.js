import React from 'react';

import { Column, Row } from './core';
import Header from './header';
import Sidebar from './sidebar';

const Layout = ({ children, title, ...rest }) => (
  <Row minHeight="100%">
    <Sidebar />
    <Column flex={1}>
      <Header title={title} />
      <Column flex={1} {...rest} padding={4} paddingTop={2}>
        {children}
      </Column>
    </Column>
  </Row>
);

export default Layout;

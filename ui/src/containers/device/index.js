import React from 'react';
import { View } from 'react-navi';

import Layout from '../../components/layout';
import Tabs from '../../components/tabs';
import { Row } from '../../components/core';

const tabs = [
  {
    title: 'Overview',
    to: 'overview',
  },
  {
    title: 'SSH',
    to: 'ssh',
  },
  {
    title: 'Settings',
    to: 'settings',
  },
];

const Device = ({ route }) => {
  return (
    <Layout title={route.data.params.device}>
      <Row marginBottom={5}>
        <Tabs
          content={tabs.map(({ to, title }) => ({
            title,
            href: `/${route.data.params.project}/${to}`,
          }))}
        />
      </Row>
      <View />
    </Layout>
  );
};

export default Device;

import React from 'react';
import { View } from 'react-navi';

import Layout from '../../components/layout';
import Tabs from '../../components/tabs';
import { Row } from '../../components/core';

const tabs = [
  {
    title: 'Overview',
    to: '/overview',
  },
  {
    title: 'SSH',
    to: '/ssh',
  },
  {
    title: 'Settings',
    to: '/settings',
  },
];

const Device = ({ route }) => {
  return (
    <Layout title={`Device / ${route.data.params.device}`}>
      <Row marginBottom={4}>
        <Tabs content={tabs} />
      </Row>
      <View />
    </Layout>
  );
};

export default Device;

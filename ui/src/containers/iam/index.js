import React from 'react';
import { View } from 'react-navi';

import Layout from '../../components/layout';
import Tabs from '../../components/tabs';
import { Row } from '../../components/core';

const tabs = [
  {
    title: 'Members',
    to: 'iam/members',
  },
  {
    title: 'Service Accounts',
    to: 'iam/service-accounts',
  },
  {
    title: 'Roles',
    to: 'iam/roles',
  },
];

const Iam = ({ route }) => {
  if (!route) {
    return null;
  }
  return (
    <Layout title="IAM" alignItems="center">
      <Row marginBottom={4}>
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

export default Iam;

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
    title: 'Settings',
    to: 'settings',
  },
];

const DeviceRegistrationToken = ({ route }) => {
  if (!route) {
    return null;
  }

  return (
    <Layout
      title={`Device Registration Token / ${route.data.deviceRegistrationToken.name}`}
      alignItems="center"
    >
      <Row marginBottom={4}>
        <Tabs
          content={tabs.map(({ to, title }) => ({
            title,
            href: `/${route.data.params.project}/provisioning/device-registration-tokens/${route.data.deviceRegistrationToken.name}/${to}`,
          }))}
        />
      </Row>
      <View />
    </Layout>
  );
};

export default DeviceRegistrationToken;

import React from 'react';

import { Column, Text, Label } from '../../components/core';
import Card from '../../components/card';
import EditableLabelTable from '../../components/EditableLabelTable';

const DeviceRegistrationTokenOverview = ({
  route: {
    data: { params, deviceRegistrationToken },
  },
}) => {
  return (
    <>
      <Card
        title={deviceRegistrationToken.name}
        subtitle={deviceRegistrationToken.description}
      >
        <Column marginBottom={6}>
          <Label>ID</Label>
          <Text fontSize={3}>{deviceRegistrationToken.id}</Text>
        </Column>
        <Column marginBottom={6}>
          <Label>Devices Registered</Label>
          <Text fontSize={3}>
            {deviceRegistrationToken.deviceCounts.allCount}
          </Text>
        </Column>
        <Column>
          <Label>Maximum Device Registerations</Label>
          <Text fontSize={3}>
            {deviceRegistrationToken.maxRegistrations || 'Unlimited'}
          </Text>
        </Column>
      </Card>
      <Card marginTop={4}>
        <EditableLabelTable
          data={deviceRegistrationToken.labels}
          getEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}`}
          setEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}/labels`}
          deleteEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}/labels`}
        />
      </Card>
    </>
  );
};

export default DeviceRegistrationTokenOverview;

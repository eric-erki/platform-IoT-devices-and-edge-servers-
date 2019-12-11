import React from 'react';

import { Column, Text } from '../../components/core';
import Card from '../../components/card';
import EditableLabelTable from '../../components/EditableLabelTable';

const DeviceRegistrationTokenOverview = ({
  route: {
    data: { params, deviceRegistrationToken },
  },
}) => {
  return (
    <Card title={deviceRegistrationToken.name}>
      <Column marginBottom={4}>
        <Text fontWeight={4} fontSize={3} marginBottom={1}>
          ID
        </Text>
        <Text>{deviceRegistrationToken.id}</Text>
      </Column>
      <Column marginBottom={4}>
        <Text fontWeight={4} fontSize={2} marginBottom={1}>
          Description
        </Text>
        <Text>{deviceRegistrationToken.description}</Text>
      </Column>
      <Column marginBottom={4}>
        <Text fontWeight={4} fontSize={2} marginBottom={1}>
          Devices Registered
        </Text>
        <Text>{deviceRegistrationToken.deviceCounts.allCount}</Text>
      </Column>
      <Column marginBottom={4}>
        <Text fontWeight={4} fontSize={2} marginBottom={1}>
          Maximum Device Registerations
        </Text>
        <Text>{deviceRegistrationToken.maxRegistrations || 'Unlimited'}</Text>
      </Column>
      <Column>
        <EditableLabelTable
          data={deviceRegistrationToken.labels}
          getEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}`}
          setEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}/labels`}
          deleteEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}/labels`}
        />
      </Column>
    </Card>
  );
};

export default DeviceRegistrationTokenOverview;

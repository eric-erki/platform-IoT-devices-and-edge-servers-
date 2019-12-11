import React from 'react';

import { Column, Label, Value } from '../../components/core';
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
        size="xlarge"
        title={deviceRegistrationToken.name}
        subtitle={deviceRegistrationToken.description}
      >
        <Column marginBottom={6}>
          <Label>ID</Label>
          <Value>{deviceRegistrationToken.id}</Value>
        </Column>
        <Column marginBottom={6}>
          <Label>Devices Registered</Label>
          <Value>{deviceRegistrationToken.deviceCounts.allCount}</Value>
        </Column>
        <Column>
          <Label>Maximum Device Registerations</Label>
          <Value>
            {deviceRegistrationToken.maxRegistrations || 'Unlimited'}
          </Value>
        </Column>
      </Card>
      <Column marginTop={4}>
        <EditableLabelTable
          data={deviceRegistrationToken.labels}
          getEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}`}
          setEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}/labels`}
          deleteEndpoint={`projects/${params.project}/deviceregistrationtokens/${deviceRegistrationToken.id}/labels`}
        />
      </Column>
    </>
  );
};

export default DeviceRegistrationTokenOverview;

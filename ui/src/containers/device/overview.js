import React from 'react';
import { useCurrentRoute, useNavigation } from 'react-navi';
import { Table, Badge } from 'evergreen-ui';

import config from '../../config';
import Card from '../../components/card';
import { Button } from '../../components/core';
import { EditableLabelTable } from '../../components/EditableLabelTable';

const checkServices = applicationStatusInfo => {
  for (var i = 0; i < applicationStatusInfo.length; i++) {
    if (
      applicationStatusInfo[i].serviceStatuses &&
      applicationStatusInfo[i].serviceStatuses.length > 0
    ) {
      return true;
    }
  }
  return false;
};

const DeviceServices = ({ project, applicationStatusInfo }) => {
  if (!checkServices(applicationStatusInfo)) {
    return null;
  }

  return (
    <Table>
      <Table.Head>
        <Table.TextHeaderCell>Service</Table.TextHeaderCell>
        <Table.TextHeaderCell>Current Release</Table.TextHeaderCell>
      </Table.Head>
      {applicationStatusInfo.map(applicationInfo => (
        <Table.Body key={applicationInfo.application.id}>
          {applicationInfo.serviceStatuses.map((serviceStatus, index) => (
            <Table.Row key={index}>
              <Table.TextCell>
                <Button
                  title={`${applicationInfo.application.name} / ${serviceStatus.service}`}
                  variant="tertiary"
                  href={`/${project}/applications/${applicationInfo.application.name}`}
                />
              </Table.TextCell>
              <Table.TextCell>{serviceStatus.currentReleaseId}</Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      ))}
    </Table>
  );
};

const DeviceOverview = ({
  route: {
    data: { params, device },
  },
}) => {
  return (
    <>
      <Card title="Device Info" size="large">
        <Table>
          <Table.Head>
            <Table.TextHeaderCell flexBasis={90} flexShrink={0} flexGrow={0}>
              Status
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>IP Address</Table.TextHeaderCell>
            <Table.TextHeaderCell>OS</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.TextCell
                flexBasis={90}
                flexShrink={0}
                flexGrow={0}
                alignItems="center"
                paddingRight="0"
              >
                {device.status === 'offline' ? (
                  <Badge color="red">offline</Badge>
                ) : (
                  <Badge color="green">online</Badge>
                )}
              </Table.TextCell>
              <Table.TextCell>
                {device.info.hasOwnProperty('ipAddress')
                  ? device.info.ipAddress
                  : ''}
              </Table.TextCell>
              <Table.TextCell>
                {device.info.hasOwnProperty('osRelease') &&
                device.info.osRelease.hasOwnProperty('prettyName')
                  ? device.info.osRelease.prettyName
                  : '-'}
              </Table.TextCell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Card>
      <Card title="Labels" size="large">
        <EditableLabelTable
          getEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}`}
          setEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}/labels`}
          deleteEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}/labels`}
        />
      </Card>
      <Card title="Services" size="large">
        <DeviceServices project={params.project} device={device} />
      </Card>
    </>
  );
};

export default DeviceOverview;

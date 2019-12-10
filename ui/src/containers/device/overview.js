import React, { useMemo } from 'react';
import { Table, Badge } from 'evergreen-ui';

import config from '../../config';
import Card from '../../components/card';
import { Row, Column, Text, Button } from '../../components/core';
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
  // const columns = useMemo(
  //   () => [
  //     { Header: 'Service', accessor: 'user.email' },
  //     {
  //       Header: 'Current Release',
  //       Cell: ({
  //         row: {
  //           original: {
  //             user: { firstName, lastName },
  //           },
  //         },
  //       }) => `${firstName} ${lastName}`,
  //     },
  //     {
  //       Header: 'Roles',
  //       Cell: ({
  //         row: {
  //           original: { roles },
  //         },
  //       }) => roles.map(({ name }) => name).join(', '),
  //     },
  //   ],
  //   []
  // );
  // const tableData = useMemo(() => members, [members]);

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
    <Card size="large">
      <Row
        alignItems="flex-end"
        justifyContent="space-between"
        marginBottom={5}
      >
        <Text fontSize={5} fontWeight={3}>
          {device.name}
        </Text>
        {device.status === 'offline' ? (
          <Badge color="red">offline</Badge>
        ) : (
          <Badge color="green">online</Badge>
        )}
      </Row>
      <Column marginBottom={4}>
        <Text fontWeight={3} marginBottom={2}>
          IP Address
        </Text>
        <Text>
          {device.info.hasOwnProperty('ipAddress') ? device.info.ipAddress : ''}
        </Text>
      </Column>
      <Column marginBottom={4}>
        <Text fontWeight={3} marginBottom={2}>
          Operating System
        </Text>
        <Text>
          {device.info.hasOwnProperty('osRelease') &&
          device.info.osRelease.hasOwnProperty('prettyName')
            ? device.info.osRelease.prettyName
            : '-'}
        </Text>
      </Column>
      <Column marginBottom={4}>
        <Text fontWeight={3} marginBottom={2}>
          Labels
        </Text>
        <EditableLabelTable
          getEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}`}
          setEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}/labels`}
          deleteEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}/labels`}
        />
      </Column>
      <Column>
        <Text fontWeight={3} marginBottom={2}>
          Services
        </Text>
        <DeviceServices project={params.project} device={device} />
      </Column>
    </Card>
  );
};

export default DeviceOverview;

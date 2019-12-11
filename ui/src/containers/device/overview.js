import React, { useMemo } from 'react';

import { Row, Column, Text, Button, Badge, Link } from '../../components/core';
import Card from '../../components/card';
import Table from '../../components/table';
import EditableLabelTable from '../../components/EditableLabelTable';

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
  const columns = useMemo(
    () => [
      {
        Header: 'Service',
        Cell: ({ row: { original } }) => (
          <Link
            href={`/${project}/applications/${original.application.name}`}
          >{`${original.application.name} / ${original.service}`}</Link>
        ),
      },
      {
        Header: 'Current Release',
        Cell: ({ row: { original } }) => (
          <Link
            href={`/${project}/applications/${original.application.name}/releases/${original.currentReleaseId}`}
          >
            {original.currentReleaseId}
          </Link>
        ),
      },
    ],
    []
  );
  const tableData = useMemo(
    () =>
      applicationStatusInfo.reduce(
        (data, curr) => [
          ...data,
          ...curr.serviceStatuses.map(status => ({
            ...status,
            application: curr.application,
          })),
        ],
        []
      ),
    [applicationStatusInfo]
  );

  if (!checkServices(applicationStatusInfo)) {
    return null;
  }

  return <Table columns={columns} data={tableData} />;
};

const DeviceOverview = ({
  route: {
    data: { params, device },
  },
}) => {
  return (
    <Card size="xlarge" title={device.name}>
      <Row marginBottom={4}>
        {device.status === 'offline' ? (
          <Badge bg="whites.7">offline</Badge>
        ) : (
          <Badge bg="green">online</Badge>
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
        {/* <EditableLabelTable
          getEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}`}
          setEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}/labels`}
          deleteEndpoint={`${config.endpoint}/projects/${params.project}/devices/${device.id}/labels`}
        /> */}
      </Column>
      <Column>
        <Text fontWeight={3} marginBottom={2}>
          Services
        </Text>
        <DeviceServices
          project={params.project}
          applicationStatusInfo={device.applicationStatusInfo}
        />
      </Column>
    </Card>
  );
};

export default DeviceOverview;

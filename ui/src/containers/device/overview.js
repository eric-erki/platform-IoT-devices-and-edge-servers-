import React, { useMemo } from 'react';

import { Row, Column, Value, Badge, Link, Label } from '../../components/core';
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
    <>
      <Card size="xlarge" title={device.name} marginBottom={4}>
        <Row marginBottom={6}>
          {device.status === 'offline' ? (
            <Badge bg="green">offline</Badge>
          ) : (
            <Badge bg="green">online</Badge>
          )}
        </Row>
        <Column marginBottom={6}>
          <Label>IP Address</Label>
          <Value>
            {device.info.hasOwnProperty('ipAddress')
              ? device.info.ipAddress
              : ''}
          </Value>
        </Column>
        <Column>
          <Label>Operating System</Label>
          <Value>
            {device.info.hasOwnProperty('osRelease') &&
            device.info.osRelease.hasOwnProperty('prettyName')
              ? device.info.osRelease.prettyName
              : '-'}
          </Value>
        </Column>
      </Card>
      <Column marginBottom={4}>
        <EditableLabelTable
          data={device.labels}
          getEndpoint={`projects/${params.project}/devices/${device.id}`}
          setEndpoint={`projects/${params.project}/devices/${device.id}/labels`}
          deleteEndpoint={`projects/${params.project}/devices/${device.id}/labels`}
        />
      </Column>
      <Card title="Services" size="xlarge">
        <DeviceServices
          project={params.project}
          applicationStatusInfo={device.applicationStatusInfo}
        />
      </Card>
    </>
  );
};

export default DeviceOverview;

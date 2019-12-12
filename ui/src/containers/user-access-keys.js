import React, { useState, useEffect, useMemo } from 'react';
import { toaster, Icon } from 'evergreen-ui';

import theme from '../theme';
import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Table from '../components/table';
import Alert from '../components/alert';
import { Label, Button, Text, Code, Row } from '../components/core';

const UserAccessKeys = () => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [newAccessKey, setNewAccessKey] = useState();
  const [backendError, setBackendError] = useState();

  const columns = useMemo(
    () => [
      {
        Header: 'Access Key ID',
        accessor: 'id',
        style: {
          flex: 3,
        },
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        style: {
          flex: 2,
        },
      },
      {
        Header: ' ',
        Cell: ({ row }) => (
          <Button
            title={<Icon size={16} icon="trash" color={theme.colors.white} />}
            variant="icon"
            onClick={() => deleteAccessKey(row.original.id)}
          />
        ),
        cellStyle: {
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
        },
      },
    ],
    []
  );
  const tableData = useMemo(() => accessKeys, [accessKeys]);

  const fetchAccessKeys = async () => {
    try {
      const { data } = await api.userAccessKeys();
      setAccessKeys(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAccessKeys();
  }, []);

  const createAccessKey = async () => {
    setBackendError(null);
    try {
      const response = await api.createUserAccessKey();
      setAccessKeys([response.data, ...accessKeys]);
      setNewAccessKey(response.data.value);
      toaster.success('Access key created successfully.');
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Access key was not created.');
      console.log(error);
    }
  };

  const deleteAccessKey = async id => {
    try {
      await api.deleteUserAccessKey({ id });
      toaster.success('Access key deleted successfully.');
      fetchAccessKeys();
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Access key was not deleted.');
      console.log(error);
    }
  };

  return (
    <>
      <Card
        border
        title="User Access Keys"
        size="xlarge"
        actions={[{ title: 'Create Access Key', onClick: createAccessKey }]}
      >
        <Alert show={backendError} variant="error" description={backendError} />
        <Alert
          show={!!newAccessKey}
          title="Access Key Created"
          description=" Save this key! This is the only time you'll be able to view it. If
            you lose it, you'll need to create a new access key."
        >
          <Label>Access Key</Label>
          <Row>
            <Code>{newAccessKey}</Code>
          </Row>
        </Alert>
        <Table
          columns={columns}
          data={tableData}
          placeholder={
            <Text>
              There are no <strong>User Access Keys</strong>.
            </Text>
          }
        />
      </Card>
    </>
  );
};

export default UserAccessKeys;

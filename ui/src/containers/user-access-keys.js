import React, { useState, useEffect, useMemo } from 'react';
import { toaster, Alert, Code, Icon } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Table from '../components/table';
import Popup from '../components/popup';
import { Label, Button, Text } from '../components/core';

const UserAccessKeys = () => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [newAccessKey, setNewAccessKey] = useState();
  const [backendError, setBackendError] = useState();
  const [showPopup, setShowPopup] = useState();

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
            title={<Icon size={16} icon="trash" color="white" />}
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

  const fetchAccessKeys = () => {
    api
      .userAccessKeys()
      .then(({ data }) => setAccessKeys(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAccessKeys();
  }, []);

  const createAccessKey = () => {
    api
      .createUserAccessKey()
      .then(response => {
        setNewAccessKey(response.data.value);
        setShowPopup(true);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Access key was not created successfully.');
          console.log(error);
        }
      });
  };

  const deleteAccessKey = id => {
    api
      .deleteUserAccessKey({ id })
      .then(() => {
        toaster.success('Successfully deleted access key.');
        fetchAccessKeys();
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Access key was not deleted.');
          console.log(error);
        }
      });
  };

  return (
    <>
      <Card
        border
        title="User Access Keys"
        size="xlarge"
        actions={[{ title: 'Create Access Key', onClick: createAccessKey }]}
      >
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
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
      <Popup show={showPopup} onClose={() => setShowPopup(false)}>
        <Card border title="Access Key Created">
          <Alert
            intent="warning"
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            title="Save this key! This is the only time you'll be able to view it.  If you lose it, you'll need to create a new access key."
          />
          <Label>Access Key</Label>
          <Code background="white">{newAccessKey}</Code>
        </Card>
      </Popup>
    </>
  );
};

export default UserAccessKeys;

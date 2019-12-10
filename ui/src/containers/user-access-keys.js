import React, { useState, useEffect, useMemo } from 'react';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Table from '../components/table';
import Popup from '../components/popup';
import { Button } from '../components/core';

const UserAccessKeys = () => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [backendError, setBackendError] = useState();
  const [showPopup, setShowPopup] = useState();

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
      .then(fetchAccessKeys)
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

  const columns = useMemo(
    () => [
      {
        Header: 'Access Key ID',
        accessor: 'id',
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
      },
      {
        Header: ' ',
        Cell: ({ row }) => (
          <Button
            title="Delete"
            variant="tertiary"
            onClick={() => deleteAccessKey(row.original.id)}
          />
        ),
      },
    ],
    []
  );
  const tableData = useMemo(() => accessKeys, [accessKeys]);

  return (
    <>
      <Card
        border
        title="User Access Keys"
        size="large"
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
        <Table columns={columns} data={tableData} />
      </Card>
      <Popup show={true} onClose={() => setShowPopup(false)} />
    </>
  );
};

export default UserAccessKeys;

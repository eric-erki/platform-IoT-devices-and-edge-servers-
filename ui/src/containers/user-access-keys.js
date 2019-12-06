import React, { useState, useEffect } from 'react';
import { toaster, Alert, Table } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import { Row, Column, Button } from '../components/core';

const UserAccessKeys = () => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [backendError, setBackendError] = useState();

  const loadAccessKeys = () => {
    api
      .accessKeys()
      .then(({ data }) => setAccessKeys(data))
      .catch(console.error);
  };

  useEffect(loadAccessKeys, []);

  const createAccessKey = () => {
    api
      .createAccessKey()
      .then(loadAccessKeys)
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Access key was not created successfully.');
          console.log(error);
        }
      });
  };

  const deleteAccessKey = id => () => {
    api
      .deleteAccessKey(id)
      .then(() => {
        toaster.success('Successfully deleted access key.');
        loadAccessKeys();
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
        title="User Access Keys"
        size="large"
        border
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
        <Table>
          <Table.Head>
            <Table.TextHeaderCell>Access Key ID</Table.TextHeaderCell>
            <Table.TextHeaderCell>Created At</Table.TextHeaderCell>
            <Table.TextHeaderCell></Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {accessKeys.map(accessKey => (
              <Table.Row key={accessKey.id}>
                <Table.TextCell>{accessKey.id}</Table.TextCell>
                <Table.TextCell>{accessKey.createdAt}</Table.TextCell>
                <Table.TextCell>
                  <Button
                    title="Delete Access Key"
                    variant="tertiary"
                    onClick={deleteAccessKey(accessKey.id)}
                  />
                </Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </>
  );
};

export default UserAccessKeys;

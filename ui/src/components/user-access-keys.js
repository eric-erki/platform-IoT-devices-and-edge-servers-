import React from 'react';
import { toaster, Alert, Table, Dialog, Code } from 'evergreen-ui';

import api from '../api';
import Card from '../components/card';
import { Column, Button, Heading } from '../components/core';

const UserAccessKeys = () => {
  const [accessKeys, setAccessKeys] = React.useState([]);
  const [newAccessKey, setNewAccessKey] = React.useState();
  const [showDialog, setShowDialog] = React.useState();

  const loadAccessKeys = () => {
    api.accessKeys.then(({ data }) => setAccessKeys(data)).catch(console.error);
  };

  React.useEffect(loadAccessKeys, []);

  const closeDialog = () => {
    setShowDialog(false);
    loadAccessKeys();
  };

  const createAccessKey = () => {
    api
      .createAccessKey()
      .then(({ data }) => {
        setNewAccessKey(data.value);
        setShowDialog(true);
      })
      .catch(error => {
        // if (utils.is4xx(error.response.status)) {
        //   this.setState({
        //     backendError: utils.convertErrorMessage(error.response.data),
        //   });
        // } else {
        toaster.danger('Access key was not created successfully.');
        console.log(error);
        //}
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
        // if (utils.is4xx(error.response.status)) {
        //   this.setState({
        //     backendError: utils.convertErrorMessage(error.response.data),
        //   });
        // } else {
        toaster.danger('Access key was not deleted.');
        console.log(error);
        //}
      });
  };

  return (
    <>
      <Card title="User Access Keys">
        {/* {backendError && (
          <Alert
            marginBottom={24}
            paddingTop={24}
            paddingBottom={24}
            intent="warning"
            title={backendError}
          />
        )} */}
        <Button title="Create Access Key" onClick={createAccessKey} />
        {accessKeys.length > 0 && (
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
                      variant="tertiary"
                      onClick={deleteAccessKey(accessKey.id)}
                    >
                      Delete Access Key
                    </Button>
                  </Table.TextCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      <Dialog
        isShown={showDialog}
        title="Access Key Created"
        onCloseComplete={closeDialog}
        hasFooter={false}
      >
        <Column>
          <Heading paddingY={4}>{`Access Key: `}</Heading>
          <Column marginBottom={6}>
            <Code>{newAccessKey}</Code>
          </Column>
        </Column>
        <Alert
          intent="warning"
          title="Save the info above! This is the only time you'll be able to use it."
        >
          {`If you lose it, you'll need to create a new access key.`}
        </Alert>
        <Button title="Close" onClick={closeDialog} />
      </Dialog>
    </>
  );
};

export default UserAccessKeys;

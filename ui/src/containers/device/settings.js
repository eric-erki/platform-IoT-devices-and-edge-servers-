import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster, Badge } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import Dialog from '../../components/dialog';
import { Row, Text, Form, Button } from '../../components/core';

const DeviceSettings = ({
  route: {
    data: { params, device },
  },
}) => {
  const { register, handleSubmit, errors } = useForm();
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();
  const [showDialog, setShowDialog] = useState();

  const submit = data => {
    api
      .updateDevice({
        projectId: params.project,
        deviceId: params.device,
        data,
      })
      .then(() => {
        toaster.success('Device updated successfully.');
        navigation.navigate(`/${params.project}/devices/${data.name}`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Device was not updated.');
          console.log(error);
        }
      });
  };

  const submitDelete = () => {
    api
      .deleteDevice({ projectId: params.project, deviceId: params.device })
      .then(() => {
        toaster.success('Successfully deleted device.');
        navigation.navigate(`/${params.project}/devices`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Device was not removed.');
          console.log(error);
        }
      })
      .finally(() => {
        setShowDialog(false);
      });
  };

  return (
    <>
      <Card title="Device Settings">
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
        {device.status === 'offline' ? (
          <Badge color="red">offline</Badge>
        ) : (
          <Badge color="green">online</Badge>
        )}
        <Text>
          <strong>ID: </strong>
          {device.id}
        </Text>
        <Form onSubmit={handleSubmit(submit)}>
          <Field label="Name" name="name" ref={register} />
          <Button type="submit" title="Update Settings" />
        </Form>
        <Row marginTop={4}>
          <Button
            title="Remove Device"
            variant="tertiary"
            onClick={() => setShowDialog(true)}
          />
        </Row>
      </Card>
      <Dialog show={showDialog} onClose={() => setShowDialog(false)}>
        <Card title="Remove Device">
          <Text>
            You are about to remove the <strong>{device.name}</strong> device.
          </Text>

          <Row marginTop={4}>
            <Button title="Remove Device" onClick={submitDelete} />
            <Button title="Cancel" variant="tertiary" />
          </Row>
        </Card>
      </Dialog>
    </>
  );
};

export default DeviceSettings;

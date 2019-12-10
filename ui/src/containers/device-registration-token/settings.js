import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import Dialog from '../../components/dialog';
import { Text, Row, Button, Form } from '../../components/core';

const DeviceRegistrationTokenSettings = ({
  route: {
    data: { params, deviceRegistrationToken },
  },
}) => {
  const navigation = useNavigation();
  const { register, handleSubmit, formState, errors } = useForm({
    defaultValues: {
      name: deviceRegistrationToken.name,
      description: deviceRegistrationToken.description,
      maxRegistrations: deviceRegistrationToken.maxRegistrations,
    },
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState();
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    setBackendError(null);
    try {
      await api.updateDeviceRegistrationToken({
        projectId: params.project,
        tokenId: deviceRegistrationToken.id,
        data: {
          ...data,
          settings: deviceRegistrationToken.settings,
        },
      });
      navigation.navigate(`/${params.project}/provisioning`);
      toaster.success('Device Registration Token updated successfully.');
    } catch (error) {
      console.log(error);
      toaster.danger('Device Registration Token was not updated.');
    }
  };

  const submitDelete = async () => {
    setBackendError(null);
    try {
      await api.deleteDeviceRegistrationToken({
        projectId: params.project,
        tokenId: deviceRegistrationToken.id,
      });
      toaster.success('Successfully deleted Device Registration Token.');
      navigation.navigate(`/${params.project}/provisioning`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Device Registration Token was not deleted.');
        console.log(error);
      }
    }
    setShowDeleteDialog(false);
  };

  return (
    <Card title="Device Registration Token Settings">
      {backendError && (
        <Alert
          marginBottom={16}
          paddingTop={16}
          paddingBottom={16}
          intent="warning"
          title={backendError}
        />
      )}
      <Form onSubmit={handleSubmit(submit)}>
        <Field label="Name" name="name" ref={register} errors={errors.name} />
        <Field
          type="textarea"
          label="Description"
          name="description"
          ref={register}
          errors={errors.description}
        />
        <Field
          label="Maximum Device Registrations"
          name="maxRegistrations"
          description="Limit the number of devices that can be registered using this token"
          hint="Leave empty to allow unlimited registrations"
          errors={errors.maxRegistrations}
          ref={register}
        />
        <Button title="Update Settings" disabled={!formState.dirty} />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Delete Device Registration Token"
          variant="tertiary"
          onClick={() => setShowDeleteDialog(true)}
        />
      </Row>
      <Dialog
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <Card title="Delete Device Registration Token" border>
          <Text>
            You are about to delete the{' '}
            <strong>{deviceRegistrationToken.name}</strong> Device Registration
            Token.
          </Text>
          <Button
            title="Delete Device Registration Token"
            marginTop={4}
            onClick={submitDelete}
          />
        </Card>
      </Dialog>
    </Card>
  );
};

export default DeviceRegistrationTokenSettings;

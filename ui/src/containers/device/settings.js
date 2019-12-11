import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import Popup from '../../components/popup';
import {
  Row,
  Column,
  Text,
  Form,
  Button,
  Badge,
  Label,
  Value,
} from '../../components/core';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
});

const DeviceSettings = ({
  route: {
    data: { params, device },
  },
}) => {
  const { register, handleSubmit, formState, errors } = useForm({
    validationSchema,
    defaultValues: {
      name: device.name,
    },
  });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();
  const [showPopup, setShowPopup] = useState();

  const submit = data => {
    api
      .updateDevice({
        projectId: params.project,
        deviceId: device.id,
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
      .deleteDevice({ projectId: params.project, deviceId: device.id })
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
        setShowPopup(false);
      });
  };

  return (
    <>
      <Card
        title="Device Settings"
        actions={[
          {
            title: 'Remove',
            onClick: () => setShowPopup(true),
            variant: 'secondary',
          },
        ]}
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
        <Row marginBottom={6}>
          {device.status === 'offline' ? (
            <Badge bg="red">offline</Badge>
          ) : (
            <Badge bg="green">online</Badge>
          )}
        </Row>

        <Column marginBottom={6}>
          <Label>ID</Label>
          <Value>{device.id}</Value>
        </Column>

        <Form onSubmit={handleSubmit(submit)}>
          <Field
            required
            label="Name"
            name="name"
            ref={register}
            errors={errors.name}
          />
          <Button type="submit" title="Update" disabled={!formState.dirty} />
        </Form>
      </Card>
      <Popup show={showPopup} onClose={() => setShowPopup(false)}>
        <Card title="Remove Device" border>
          <Text>
            You are about to remove the <strong>{device.name}</strong> device.
          </Text>

          <Button marginTop={6} title="Remove" onClick={submitDelete} />
        </Card>
      </Popup>
    </>
  );
};

export default DeviceSettings;

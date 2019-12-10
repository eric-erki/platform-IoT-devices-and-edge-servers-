import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import { Row, Button, Form } from '../components/core';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
  maxRegistration: yup.number(),
});

const CreateDeviceRegistrationToken = ({
  route: {
    data: { params },
  },
}) => {
  const { register, handleSubmit } = useForm({ validationSchema });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    setBackendError(null);
    try {
      await api.createDeviceRegistrationToken({
        projectId: params.project,
        data,
      });
      toaster.success('Device Registration Token created successfully.');
      navigation.navigate(`/${params.project}/provisioning`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Device Registration Token was not updated.');
        console.log(error);
      }
    }
  };

  return (
    <Layout alignItems="center">
      <Card title="Create Device Registration Token" size="medium">
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
          <Field required autoFocus label="Name" name="name" ref={register} />
          <Field
            label="Description"
            type="textarea"
            name="description"
            ref={register}
          />
          <Field
            type="number"
            label="Maximum Device Registrations"
            name="maxRegistrations"
            description="Limit the number of devices that can be registered using this token"
            hint="Leave empty to allow unlimited registrations"
            ref={register}
          />
          <Button title="Create" type="submit" />
        </Form>

        <Row marginTop={4}>
          <Button
            title="Cancel"
            variant="tertiary"
            href={`/${params.project}/provisioning`}
          />
        </Row>
      </Card>
    </Layout>
  );
};

export default CreateDeviceRegistrationToken;

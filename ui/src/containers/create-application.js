import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import useForm from 'react-hook-form';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import { Button, Row, Form } from '../components/core';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
});

const CreateApplication = ({
  route: {
    data: { params },
  },
}) => {
  const { register, handleSubmit, errors } = useForm({ validationSchema });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api
      .createApplication({ projectId: params.project, data })
      .then(() => {
        navigation.navigate(`/${params.project}/applications/${data.name}`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Application was not created.');
          console.log(error);
        }
      });
  };

  return (
    <Layout alignItems="center">
      <Card title="Create Application">
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
          <Field
            required
            autoFocus
            label="Name"
            name="name"
            ref={register}
            errors={errors.name}
          />
          <Field
            label="Description"
            name="description"
            type="textarea"
            ref={register}
            errors={errors.description}
          />
          <Button type="submit" title="Create Application" />
          <Row marginTop={4}>
            <Button
              title="Cancel"
              variant="text"
              href={`/${params.project}/applications`}
            />
          </Row>
        </Form>
      </Card>
    </Layout>
  );
};

export default CreateApplication;

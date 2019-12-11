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
});

const ProjectCreate = () => {
  const navigation = useNavigation();
  const { register, handleSubmit, errors } = useForm({
    validationSchema,
  });
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api
      .createProject(data)
      .then(() => navigation.navigate(`/`))
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Project was not created.');
          console.log(error);
        }
      });
  };

  return (
    <Layout alignItems="center">
      <Card width={10} title="Create Project">
        <Form onSubmit={handleSubmit(submit)}>
          {backendError && (
            <Alert
              marginBottom={16}
              paddingTop={16}
              paddingBottom={16}
              intent="warning"
              title={backendError}
            />
          )}
          <Field
            required
            autoFocus
            label="Name"
            name="name"
            ref={register}
            errors={errors.name}
          />
          <Button type="submit" title="Create" />
          <Row marginTop={4}>
            <Button title="Cancel" variant="text" href="/projects" />
          </Row>
        </Form>
      </Card>
    </Layout>
  );
};

export default ProjectCreate;

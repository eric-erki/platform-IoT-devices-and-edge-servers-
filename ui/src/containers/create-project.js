import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import useForm from 'react-hook-form';
import { toaster } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import validators from '../validators';
import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import Alert from '../components/alert';
import { Button, Row, Form } from '../components/core';

const validationSchema = yup.object().shape({
  name: validators.name.required(),
});

const ProjectCreate = () => {
  const navigation = useNavigation();
  const { register, handleSubmit, errors } = useForm({
    mode: 'onBlur',
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
        <Alert show={backendError} variant="error" description={backendError} />
        <Form onSubmit={handleSubmit(submit)}>
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

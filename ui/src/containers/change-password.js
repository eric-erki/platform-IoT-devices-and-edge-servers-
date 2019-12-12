import React, { useState } from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { toaster } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import validators from '../validators';
import Card from '../components/card';
import Field from '../components/field';
import Alert from '../components/alert';
import { Form, Button } from '../components/core';

const validationSchema = yup.object().shape({
  currentPassword: yup.string().required(),
  password: validators.password.required(),
});

const ChangePassword = ({ close }) => {
  const { register, handleSubmit, errors } = useForm({ validationSchema });
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api
      .updateUser(data)
      .then(() => {
        toaster.success('Password updated.');
        close();
      })
      .catch(error => {
        if (utils.is4xx(error.response.status) && error.response.data) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Password was not updated.');
          console.log(error);
        }
      });
  };

  return (
    <Card title="Change Password" border>
      <Alert show={backendError} variant="error" description={backendError} />
      <Form onSubmit={handleSubmit(submit)}>
        <Field
          required
          autoFocus
          type="password"
          label="Current Password"
          name="currentPassword"
          ref={register}
          errors={errors.currentPassword}
        />
        <Field
          required
          type="password"
          label="New Password"
          name="password"
          ref={register}
          errors={errors.password}
        />
        <Button title="Change Password" type="submit" />
      </Form>
    </Card>
  );
};

export default ChangePassword;

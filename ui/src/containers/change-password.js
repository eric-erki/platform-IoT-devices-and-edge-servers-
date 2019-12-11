import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Field from '../components/field';
import { Form, Button } from '../components/core';

const ChangePassword = ({ close }) => {
  const { register, handleSubmit } = useForm();
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
          type="password"
          label="Current Password"
          name="currentPassword"
          ref={register}
        />
        <Field
          required
          type="password"
          label="New Password"
          name="password"
          hint="Password must be at least 8 characters, contain at least one lower case letter, one upper case letter, and no spaces."
          ref={register}
        />
        <Button title="Change Password" type="submit" />
      </Form>
    </Card>
  );
};

export default ChangePassword;

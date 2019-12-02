import React from 'react';
import useForm from 'react-hook-form';
import { toaster } from 'evergreen-ui';

import api from '../api';
import Card from './card';
import Field from './field';
import { Form, Button } from './core';

const ChangePassword = () => {
  const { register, handleSubmit } = useForm();

  const submit = data => {
    api
      .updateUser(data)
      .then(() => {
        toaster.success('Password updated.');
      })
      .catch(error => {
        // if (utils.is4xx(error.response.status)) {
        //   this.setState({
        //     changePasswordError: utils.convertErrorMessage(error.response.data),
        //   });
        // } else {
        toaster.danger('Password was not updated.');
        console.log(error);
        //}
      });
  };

  return (
    <Card title="Change Password" border>
      <Form onSubmit={handleSubmit(submit)}>
        <Field
          type="password"
          label="Current Password"
          name="currentPassword"
          ref={register}
        />
        <Field
          type="password"
          label="New Password"
          name="password"
          hint="Password must be at least 8 characters, contain at least one lower case letter, one upper case letter, and no spaces."
          ref={register}
        />
        <Button title="Change Password" />
      </Form>
    </Card>
  );
};

export default ChangePassword;

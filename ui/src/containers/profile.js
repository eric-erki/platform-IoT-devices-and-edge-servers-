import React, { useState } from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Field from '../components/field';
import { Form, Button } from '../components/core';

const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required()
    .max(64),
  lastName: yup
    .string()
    .required()
    .max(64),
  company: yup.string().max(64),
});

const Profile = ({ close }) => {
  let user = {};
  const { register, handleSubmit, formState } = useForm({
    validationSchema,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
    },
  });
  const [backendError, setBackendError] = useState();

  const submit = data =>
    api
      .updateUser(data)
      .then(response => {
        toaster.success('Profile updated.');
        close();
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Profile was not updated.');
          console.log(error);
        }
      });

  return (
    <Card title="Profile" border>
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
        <Field required label="First Name" name="firstName" ref={register} />
        <Field required label="Last Name" name="lastName" ref={register} />
        <Field label="Company" name="company" ref={register} />
        <Button
          title="Update Profile"
          type="submit"
          disabled={!formState.dirty}
        />
      </Form>
    </Card>
  );
};

export default Profile;

import React from 'react';
import useForm from 'react-hook-form';

import api from '../api';
import Card from './card';
import Field from './field';
import { Form, Button } from './core';

const EditProfile = () => {
  const { register, handleSubmit } = useForm();

  const submit = data => api.updateUser(data);

  return (
    <Card title="Edit Profile" border>
      <Form onSubmit={handleSubmit(submit)}>
        <Field required label="First Name" name="firstName" ref={register} />
        <Field required label="Last Name" name="lastName" ref={register} />
        <Field label="Company" name="company" ref={register} />
        <Button title="Update Profile" />
      </Form>
    </Card>
  );
};

export default EditProfile;

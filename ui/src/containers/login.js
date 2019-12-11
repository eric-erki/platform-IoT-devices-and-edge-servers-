import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import { useDispatch } from 'react-redux';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { Alert } from 'evergreen-ui';

import { login } from '../actions';
import Card from '../components/card';
import Field from '../components/field';
import { Column, Row, Form, Button } from '../components/core';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
});

const Login = () => {
  const { register, handleSubmit, errors } = useForm({
    validationSchema,
  });
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [backendError, setBackendError] = useState();

  const submit = data => {
    dispatch(login(data))
      .then(() => navigation.navigate('/'))
      .catch(error => {
        setBackendError('Invalid Username/Password');
        console.log(error);
      });
  };

  return (
    <Column flex={1} alignItems="center" paddingTop={9}>
      {backendError && (
        <Alert
          marginBottom={16}
          paddingTop={16}
          paddingBottom={16}
          intent="warning"
          title={backendError}
        />
      )}
      <Card
        logo
        title="Log in"
        actions={[{ href: '/signup', title: 'Sign up', variant: 'secondary' }]}
      >
        <Form onSubmit={handleSubmit(submit)}>
          <Field
            required
            autoFocus
            autoComplete="on"
            ref={register}
            name="email"
            type="email"
            label="Email address"
            errors={errors.email}
          />

          <Field
            required
            ref={register}
            name="password"
            type="password"
            label="Password"
            errors={errors.password}
          />

          <Button justifyContent="center" title="Log in" />
        </Form>
        <Row marginTop={4}>
          <Button variant="tertiary" href="/forgot" title="Forgot password?" />
        </Row>
      </Card>
    </Column>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { Alert } from 'evergreen-ui';

import api from '../api';
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

const Login = ({
  route: {
    data: { params },
  },
}) => {
  const { register, handleSubmit, errors } = useForm({
    validationSchema,
  });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api
      .login(data)
      .then(() =>
        navigation.navigate(
          params.redirectTo
            ? decodeURIComponent(params.redirectTo)
            : '/projects'
        )
      )
      .catch(error => {
        setBackendError('Invalid credentials');
        console.log(error);
      });
  };

  return (
    <Column flex={1} alignItems="center" paddingTop={9} paddingBottom={6}>
      <Card
        logo
        title="Log in"
        size="medium"
        actions={[{ href: '/signup', title: 'Sign up', variant: 'secondary' }]}
      >
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
        <Row marginTop={6}>
          <Button variant="text" href="/forgot" title="Forgot your password?" />
        </Row>
      </Card>
    </Column>
  );
};

export default Login;

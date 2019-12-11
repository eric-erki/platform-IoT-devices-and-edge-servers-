import React, { useState } from 'react';
import { toaster, Alert } from 'evergreen-ui';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import * as yup from 'yup';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Field from '../components/field';
import { Column, Button, Form, Text, Link } from '../components/core';

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
  email: yup
    .string()
    .email()
    .required()
    .max(64),
  password: yup
    .string()
    .required()
    .min(8)
    .max(64),
});

const Signup = () => {
  const { register, handleSubmit, errors } = useForm({
    validationSchema,
  });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api
      .signup(data)
      .then(() => {
        navigation.navigate('/login');
        toaster.success(
          'Please check your email to confirm your registration.'
        );
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger(
            'Something went wrong with your registration. Please contact us at support@deviceplane.com.'
          );
          console.log(error);
        }
      });
  };

  return (
    <Column alignItems="center" flex={1} paddingTop={9}>
      <Card
        logo
        width={10}
        title="Sign up"
        actions={[{ href: '/login', title: 'Log in', variant: 'secondary' }]}
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
            label="First Name"
            name="firstName"
            ref={register}
            errors={errors.firstName}
            maxLength={64}
          />
          <Field
            required
            autoComplete="on"
            label="Last Name"
            name="lastName"
            ref={register}
            errors={errors.lastName}
            maxLength={64}
          />
          <Field
            autoComplete="on"
            label="Company"
            name="company"
            ref={register}
            errors={errors.company}
            maxLength={64}
          />
          <Field
            required
            autoComplete="on"
            type="email"
            label="Email"
            name="email"
            ref={register}
            errors={errors.email}
            maxLength={64}
          />
          <Field
            required
            type="password"
            label="Password"
            name="password"
            ref={register}
            errors={errors.password}
            maxLength={64}
          />
          <Button title="Sign up" justifyContent="center" />
        </Form>
        <Text marginTop={5}>
          By signing up you agree to the{' '}
          <Link href="https://deviceplane.com/legal/terms">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="https://deviceplane.com/legal/privacy">
            Privacy Policy
          </Link>
        </Text>
      </Card>
    </Column>
  );
};

export default Signup;

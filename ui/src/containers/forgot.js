import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import Card from '../components/card';
import Field from '../components/field';
import { Text, Row, Column, Button, Form } from '../components/core';

const PasswordReset = () => {
  const { register, handleSubmit, errors } = useForm();
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api
      .resetPassword(data)
      .then(() => {
        navigation.navigate(`/login`);
        toaster.success(
          'Password recovery email sent. Please check your email to reset your password.'
        );
      })
      .catch(error => {
        if (error.response.status === 404) {
          setBackendError(true);
        } else {
          toaster.danger(
            'There was an error with your e-mail. Please contact us at info@deviceplane.com.'
          );
          console.log(error);
        }
      });
  };

  return (
    <Column flex={1} alignItems="center" paddingTop={9} paddingBottom={6}>
      <Card logo width={10} title="Reset Password">
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title="User doesn't exist"
          >
            There is no user with that email address.
          </Alert>
        )}
        <Text marginBottom={3}>
          You will receive an email with a link to reset your password.
        </Text>
        <Form onSubmit={handleSubmit(submit)}>
          <Field
            autoFocus
            autoComplete="on"
            type="email"
            label="Email address"
            name="email"
            errors={errors.email}
            ref={register}
          />
          <Button title="Reset Password" />
        </Form>

        <Row marginTop={4}>
          <Button href="/login" variant="text" title="Cancel" />
        </Row>
      </Card>
    </Column>
  );
};

export default PasswordReset;

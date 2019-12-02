import React, { useState, useEffect } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import { toaster, Alert } from 'evergreen-ui';

import api from '../api';
import Card from '../components/card';
import Field from '../components/field';
import { Column, Button, Form, Link } from '../components/core';

const isTokenExpired = expiration => {
  const expiratonTime = new Date(expiration).getTime();
  const currentTime = new Date().getTime();
  return currentTime > expiratonTime;
};

const PasswordRecovery = ({
  route: {
    data: {
      params: { token },
    },
  },
}) => {
  const navigation = useNavigation();
  const { register, handleSubmit, errors } = useForm();
  const [invalidToken, setInvalidToken] = useState();

  useEffect(() => {
    api
      .verifyPasswordResetToken({ token })
      .then(response => {
        if (isTokenExpired(response.data.expiresAt)) {
          setInvalidToken(true);
        }
      })
      .catch(error => {
        setInvalidToken(true);
        console.log(error);
      });
  }, []);

  const submit = ({ password }) => {
    api
      .updatePassword({ password, token })
      .then(() => {
        toaster.success('Password successfully changed.');
        navigation.navigate(`/login`);
      })
      .catch(error => {
        // if (utils.is4xx(error.response.status)) {
        //   this.setState({
        //     passwordRecoveryError: utils.convertErrorMessage(
        //       error.response.data
        //     )
        //   });
        // } else {
        toaster.danger(
          'Something went wrong with changing your password. Please contact us at support@deviceplane.com.'
        );
        console.log(error);
        //}
      });
  };

  if (invalidToken) {
    return (
      <Column flex={1} alignItems="center" paddingTop={9}>
        <Card title="Recover Password" logo>
          <Alert
            intent="warning"
            title="Your recovery token has expired. Please reset your password again."
          />
          <Button marginTop={3} href="/forgot" title="Reset your password" />
        </Card>
      </Column>
    );
  }

  return (
    <Column flex={1} alignItems="center" paddingTop={9}>
      <Card title="Recover Password" logo>
        {/* {this.state.passwordRecoveryError && (
      <Alert
        marginBottom={majorScale(2)}
        paddingTop={majorScale(2)}
        paddingBottom={majorScale(2)}
        intent="warning"
        title={this.state.passwordRecoveryError}
      />
    )} */}
        <Form onSubmit={handleSubmit(submit)}>
          <Field
            required
            type="password"
            label="New Password"
            name="password"
            hint="Password must be at least 8 characters, contain at least one lower case letter, one upper case letter, and no spaces."
            ref={register}
          />
          <Button justifyContent="center">Submit</Button>
        </Form>
      </Card>
    </Column>
  );
};

export default PasswordRecovery;

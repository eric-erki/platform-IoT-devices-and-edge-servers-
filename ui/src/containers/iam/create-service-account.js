import React from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';

import utils from '../../utils';
import api from '../../api';
import Field from '../../components/field';
import Card from '../../components/card';
import { Row, Form, Button } from '../../components/core';

const CreateServiceAccount = ({
  route: {
    data: { params },
  },
}) => {
  const { register, handleSubmit } = useForm();
  const navigation = useNavigation();

  const submit = data => {
    api
      .createServiceAccount(data)
      .then(() =>
        navigation.navigate(`/${params.project}/iam/serviceaccounts/`)
      );
    // .catch(error => {
    //   if (utils.is4xx(error.response.status)) {
    //     this.setState({
    //       backendError: utils.convertErrorMessage(error.response.data),
    //     });
    //   } else {
    //     toaster.danger('Service Account was not created.');
    //     console.log(error);
    //   }
    // });
  };

  return (
    <Card title="Create Service Account">
      <Form onSubmit={handleSubmit(submit)}>
        {/* {this.state.backendError && (
            <Alert
              marginBottom={majorScale(2)}
              paddingTop={majorScale(2)}
              paddingBottom={majorScale(2)}
              intent="warning"
              title={this.state.backendError}
            />
          )} */}
        <Field required autoFocus label="Name" name="name" />
        <Field label="Description" name="description" ref={register} />
        <Button title="Create service account" type="submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/iam/service-accounts/`}
        />
      </Row>
    </Card>
  );
};

export default CreateServiceAccount;

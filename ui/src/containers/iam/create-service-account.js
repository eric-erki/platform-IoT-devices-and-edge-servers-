import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import { toaster, Alert } from 'evergreen-ui';
import * as yup from 'yup';

import utils from '../../utils';
import api from '../../api';
import Field from '../../components/field';
import Card from '../../components/card';
import { Row, Form, Button } from '../../components/core';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
});

const CreateServiceAccount = ({
  route: {
    data: { params },
  },
}) => {
  const { register, handleSubmit } = useForm({ validationSchema });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    setBackendError(null);
    try {
      await api.createServiceAccount({ projectId: params.project, data });
      navigation.navigate(`/${params.project}/iam/service-accounts/`);
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Service Account was not created.');
        console.log(error);
      }
    }
  };

  return (
    <Card title="Create Service Account" size="medium">
      <Form onSubmit={handleSubmit(submit)}>
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
        <Field required autoFocus label="Name" name="name" ref={register} />
        <Field
          type="textarea"
          label="Description"
          name="description"
          ref={register}
        />
        <Button title="Create" type="submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="text"
          href={`/${params.project}/iam/service-accounts/`}
        />
      </Row>
    </Card>
  );
};

export default CreateServiceAccount;

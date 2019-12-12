import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { toaster } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import validators from '../../validators';
import Card from '../../components/card';
import Editor from '../../components/editor';
import Field from '../../components/field';
import Alert from '../../components/alert';
import { Row, Button, Form } from '../../components/core';

const validationSchema = yup.object().shape({
  name: validators.name.required(),
  description: yup.string(),
  config: yup.string().required(),
});

const CreateRole = ({
  route: {
    data: { params },
  },
}) => {
  const { handleSubmit, register, setValue } = useForm({
    validationSchema,
    mode: 'onBlur',
  });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    try {
      await api.createRole({ projectId: params.project, data });
      navigation.navigate(`/${params.project}/iam/roles`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Role was not created.');
        console.log(error);
      }
    }
  };

  return (
    <Card title="Create Role">
      <Alert show={backendError} variant="error" description={backendError} />
      <Form onSubmit={handleSubmit(submit)}>
        <Field required autoFocus label="Name" name="name" ref={register} />

        <Field
          type="textarea"
          label="Description"
          name="description"
          ref={register}
        />

        <Field
          as={<Editor width="100%" height="136px" />}
          label="Config"
          name="config"
          register={register}
          setValue={setValue}
        />
        <Button title="Create" type="submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="text"
          href={`/${params.project}/iam/roles`}
        />
      </Row>
    </Card>
  );
};

export default CreateRole;

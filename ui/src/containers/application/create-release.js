import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { toaster, Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Editor from '../../components/editor';
import Field from '../../components/field';
import { Form, Row, Button } from '../../components/core';

const CreateRelease = ({
  route: {
    data: { params, application },
  },
}) => {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      rawConfig: application.latestRelease.rawConfig,
    },
  });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    try {
      await api.createRelease({
        projectId: params.project,
        applicationId: application.id,
        data,
      });
      navigation.navigate(
        `/${params.project}/applications/${application.name}`
      );
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Release was not created.');
        console.log(error);
      }
    }
  };

  return (
    <Card title="Create Release">
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
        <Field
          as={<Editor width="100%" height="300px" />}
          label="Config"
          name="rawConfig"
          register={register}
          setValue={setValue}
        />
        <Button type="submit" title="Create" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/applications/${application.name}/releases`}
        />
      </Row>
    </Card>
  );
};

export default CreateRelease;

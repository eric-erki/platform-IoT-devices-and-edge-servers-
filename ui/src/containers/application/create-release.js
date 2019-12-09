import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import { toaster, Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Editor from '../../components/editor';
import { Form, Row, Button } from '../../components/core';

const CreateRelease = ({
  route: {
    data: { params, application },
  },
}) => {
  const navigation = useNavigation();
  const [rawConfig, setRawConfig] = useState();
  const [backendError, setBackendError] = useState();

  const handleSubmit = event => {
    event.preventDefault();
    api
      .createRelease({
        projectId: params.project,
        applicationId: application.id,
        data: { rawConfig },
      })
      .then(() => {
        navigation.navigate(
          `/${params.project}/applications/${params.application}`
        );
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Release was not created.');
          console.log(error);
        }
      });
  };

  return (
    <Card title="Create Release">
      <Form onSubmit={handleSubmit}>
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
        <Editor
          width="100%"
          height="300px"
          value={rawConfig}
          onChange={setRawConfig}
        />
        <Button marginTop={4} type="submit" title="Create Release" />
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

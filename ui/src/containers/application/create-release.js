import React, { useState } from 'react';
import { useNavigation } from 'react-navi';
import { Alert } from 'evergreen-ui';

import api from '../../api';
import Card from '../../components/card';
import Editor from '../../components/editor';
import { Form, Row, Button } from '../../components/core';

const CreateRelease = ({
  route: {
    data: { params, application },
  },
}) => {
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const submit = data => {
    api.createRelease(data).then(() => {
      navigation.navigate(
        `/${params.project}/applications/${params.application}`
      );
    });
  };

  return (
    <Card title="Create Release">
      <Form onSubmit={() => {}}>
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
          //value={rawConfig}
          //onChange={value => this.setState({ rawConfig: value })}
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

import React from 'react';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Editor from '../../components/editor';
import { Row, Button } from '../../components/core';
import api from '../../api';

const CreateRelease = ({
  route: {
    data: { params },
  },
}) => {
  const navigation = useNavigation();

  const submit = data => {
    api.createRelease(data).then(() => {
      navigation.navigate(
        `/${params.project}/applications/${params.application}`
      );
    });
  };

  return (
    <Card title="Config">
      <Form>
        {/* {this.state.backendError && (
                <Alert
                  marginBottom={majorScale(2)}
                  paddingTop={majorScale(2)}
                  paddingBottom={majorScale(2)}
                  intent="warning"
                  title={this.state.backendError}
                />
              )} */}
        <Editor
          width="100%"
          height="300px"
          value={this.state.rawConfig}
          onChange={value => this.setState({ rawConfig: value })}
        />
        <Button type="submit" title="Submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/applications/${params.application}`}
        />
      </Row>
    </Card>
  );
};

export default CreateRelease;

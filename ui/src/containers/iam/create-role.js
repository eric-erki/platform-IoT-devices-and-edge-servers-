import React from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';

import api from '../../api';
import Card from '../../components/card';
import Editor from '../../components/editor';
import Field from '../../components/field';
import { Row, Button, Form, Text } from '../../components/core';

const CreateRole = ({
  route: {
    data: { params },
  },
}) => {
  const { handleSubmit, register } = useForm();
  const navigation = useNavigation();

  const submit = data => {
    api
      .createRole(data)
      .then(() => navigation.navigate(`/${params.project}/iam/roles`));
  };

  return (
    <Card title="Create Role">
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
        <Field required autoFocus label="Name" name="name" ref={register} />

        <Field label="Description" name="description" ref={register} />

        <Text marginBottom={2} fontWeight={3}>
          Config
        </Text>
        <Editor
          width="100%"
          height="180px"
          //value={this.state.config}
          //onChange={value => this.setState({ config: value })}
        />
        <Button marginTop={4} title="Create" type="submit" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/iam/roles`}
        />
      </Row>
    </Card>
  );
};

export default CreateRole;

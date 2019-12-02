import React from 'react';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import useForm from 'react-hook-form';

import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import { Button, Row, Form } from '../components/core';
import api from '../api';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
});

const ProjectCreate = () => {
  const navigation = useNavigation();
  const { register, handleSubmit, errors } = useForm({
    validationSchema,
  });

  const submit = data => {
    api.createProject(data).then(response => navigation.navigate(`/`));
  };

  return (
    <Layout title="Create Project" alignItems="center">
      <Card width={10} title="Create project">
        <Form onSubmit={handleSubmit(submit)}>
          {/* {error && (
            <Alert
              marginBottom={majorScale(2)}
              paddingTop={majorScale(2)}
              paddingBottom={majorScale(2)}
              intent="warning"
              title={error}
            />
          )} */}
          <Field required autoFocus label="Name" name="name" ref={register} />
          <Button width="100%" type="submit" title="Create project" />
        </Form>
      </Card>
    </Layout>
  );
};

export default ProjectCreate;

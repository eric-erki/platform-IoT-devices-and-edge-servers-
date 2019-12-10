import React from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster } from 'evergreen-ui';
import * as yup from 'yup';

import api from '../api';
import utils from '../utils';
import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import Dialog from '../components/dialog';
import { Text, Row, Button, Form, Input } from '../components/core';

const validationSchema = {
  name: yup.string().required(),
  datadogApiKey: yup.string(),
};

const ProjectSettings = ({
  route: {
    data: { params, project },
  },
}) => {
  const { register, handleSubmit, errors, formState } = useForm({
    validationSchema,
    defaultValues: { name: project.name, datadogApiKey: project.datadogApiKey },
  });
  const navigation = useNavigation();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState();
  const [confirmation, setConfirmation] = React.useState();
  const [backendError, setBackendError] = React.useState();

  const submit = data => {
    setBackendError(null);
    api
      .updateProject(data)
      .then(() => {
        toaster.success('Successfully updated project.');
        navigation.navigate(`/${params.project}/settings`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Project was not updated.');
          console.log(error);
        }
      });
  };

  const submitDelete = e => {
    e.preventDefault();
    setBackendError(null);
    api
      .deleteProject({ projectId: params.project })
      .then(() => {
        toaster.success('Successfully deleted project.');
        navigation.navigate(`/projects`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Project was not deleted.');
          console.log(error);
        }
      })
      .finally(() => {
        setShowDeleteDialog(false);
      });
  };

  return (
    <Layout alignItems="center">
      <>
        <Card title="Project Settings">
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
              required
              label="Name"
              name="name"
              ref={register}
              errors={errors.name}
            />
            <Field
              label="Datadog API Key"
              name="datadogApiKey"
              ref={register}
              errors={errors.datadogApiKey}
            />
            <Button
              type="submit"
              title="Update Settings"
              disabled={!formState.dirty}
            />
          </Form>
          <Row marginTop={4}>
            <Button
              title="Delete Project"
              variant="tertiary"
              onClick={() => setShowDeleteDialog(true)}
            />
          </Row>
        </Card>
        <Dialog
          show={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <Card title="Delete Project" border>
            <Text>
              This action <strong>cannot</strong> be undone. This will
              permanently delete the <strong>{params.project}</strong> project.
              <p></p>Please type in the name of the project to confirm.
            </Text>
            <Form onSubmit={submitDelete}>
              <Input
                marginTop={4}
                placeholder="Project name"
                onChange={e => setConfirmation(e.target.value)}
                value={confirmation}
              />
              <Button
                marginTop={4}
                type="submit"
                title="Delete Project"
                disabled={confirmation !== project.name}
              />
            </Form>
          </Card>
        </Dialog>
      </>
    </Layout>
  );
};

export default ProjectSettings;

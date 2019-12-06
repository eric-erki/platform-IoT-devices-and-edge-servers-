import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Dialog from '../../components/dialog';
import Field from '../../components/field';
import { Row, Button, Text, Form } from '../../components/core';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
});

const ApplicationSettings = ({
  route: {
    data: { params, application },
  },
}) => {
  const { register, handleSubmit, errors, formState } = useForm({
    validationSchema,
    defaultValues: {
      name: application.name,
      description: application.description,
    },
  });
  const [backendError, setBackendError] = useState();
  const [showDeleteDialog, setShowDeleteDialog] = useState();
  const navigation = useNavigation();

  const submit = data => {
    setBackendError(false);
    api
      .updateApplication({
        projectId: params.project,
        applicationId: params.application,
        data,
      })
      .then(() => {
        toaster.success('Application updated successfully.');
        navigation.navigate(`/${params.project}/applications/${data.name}`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Application was not updated.');
          console.log(error);
        }
      });
  };

  const submitDelete = () => {
    api
      .deleteApplication({
        projectId: params.project,
        applicationId: application.name,
      })
      .then(() => {
        toaster.success('Successfully deleted application.');
        navigation.navigate(`/${params.project}/applications`);
      })
      .catch(error => {
        if (utils.is4xx(error.response.status)) {
          setBackendError(utils.convertErrorMessage(error.response.data));
        } else {
          toaster.danger('Application was not deleted.');
          console.log(error);
        }
      })
      .finally(() => setShowDeleteDialog(false));
  };

  return (
    <>
      <Card title="Application Settings">
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
        <Form onSubmit={handleSubmit(submit)}>
          <Field
            autoFocus
            required
            label="Application Name"
            name="name"
            ref={register}
            errors={errors.name}
          />
          <Field
            type="textarea"
            label="Description"
            name="description"
            ref={register}
            errors={errors.description}
          />
          <Button
            title="Update Settings"
            type="submit"
            disabled={!formState.dirty}
          >
            Update Settings
          </Button>
        </Form>
        <Row marginTop={4}>
          <Button
            title="Delete Applicaton"
            variant="tertiary"
            onClick={() => setShowDeleteDialog(true)}
          />
        </Row>
      </Card>
      <Dialog
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <Card title="Delete Application" border>
          <Text>
            You are about to delete the <strong>{application.name}</strong>{' '}
            application.
          </Text>
          <Button
            marginTop={4}
            title="Delete Application"
            onClick={submitDelete}
          />
        </Card>
      </Dialog>
    </>
  );
};

export default ApplicationSettings;

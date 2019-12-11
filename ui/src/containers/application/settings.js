import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import * as yup from 'yup';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Popup from '../../components/popup';
import Field from '../../components/field';
import { Button, Text, Form } from '../../components/core';

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
  const [showDeletePopup, setShowDeletePopup] = useState();
  const navigation = useNavigation();

  const submit = data => {
    setBackendError(false);
    api
      .updateApplication({
        projectId: params.project,
        applicationId: application.id,
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
      .finally(() => setShowDeletePopup(false));
  };

  return (
    <>
      <Card
        title="Application Settings"
        size="medium"
        actions={[
          {
            title: 'Delete',
            onClick: () => setShowDeletePopup(true),
            variant: 'secondary',
          },
        ]}
      >
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
            label="Name"
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
          <Button title="Update" type="submit" disabled={!formState.dirty} />
        </Form>
      </Card>
      <Popup show={showDeletePopup} onClose={() => setShowDeletePopup(false)}>
        <Card title="Delete Application" border size="medium">
          <Text>
            You are about to delete the <strong>{application.name}</strong>{' '}
            application.
          </Text>
          <Button marginTop={5} title="Delete" onClick={submitDelete} />
        </Card>
      </Popup>
    </>
  );
};

export default ApplicationSettings;

import React, { useState } from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';
import { useNavigation } from 'react-navi';
import { toaster, Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Editor from '../../components/editor';
import Card from '../../components/card';
import Field from '../../components/field';
import Popup from '../../components/popup';
import { Text, Button, Form } from '../../components/core';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
});

const Role = ({
  route: {
    data: { params, role },
  },
}) => {
  const { register, handleSubmit, errors, formState, setValue } = useForm({
    validationSchema,
    defaultValues: {
      name: role.name,
      description: role.description,
      config: role.config,
    },
  });
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();
  const [showDeletePopup, setShowDeletePopup] = useState();

  const submit = async data => {
    setBackendError(null);
    try {
      await api.updateRole({
        projectId: params.project,
        roleId: role.id,
        data,
      });
      toaster.success('Successfully updated role.');
      navigation.navigate(`/${params.project}/iam/roles`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Role was not updated.');
        console.log(error);
      }
    }
  };

  const submitDelete = async () => {
    setBackendError(null);
    try {
      await api.deleteRole({ projectId: params.project, roleId: role.id });
      toaster.success('Successfully deleted role.');
      navigation.navigate(`/${params.project}/iam/roles`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Role was not deleted.');
        console.log(error);
      }
    }
    setShowDeletePopup(false);
  };

  return (
    <>
      <Card
        title={role.name}
        actions={[
          {
            title: 'Delete',
            onClick: () => setShowDeletePopup(true),
            variant: 'secondary',
          },
        ]}
      >
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
          <Field
            as={<Editor width="100%" height="160px" />}
            label="Config"
            name="config"
            register={register}
            setValue={setValue}
          />
          <Button title="Update" type="submit" disabled={!formState.dirty} />
        </Form>
      </Card>
      <Popup
        show={showDeletePopup}
        title="Delete Role"
        onClose={() => setShowDeletePopup(false)}
      >
        <Card title="Delete Role" border>
          <Text>
            You are about to delete the <strong>{role.name}</strong> role.
          </Text>
          <Button marginTop={5} title="Delete" onClick={submitDelete} />
        </Card>
      </Popup>
    </>
  );
};

export default Role;

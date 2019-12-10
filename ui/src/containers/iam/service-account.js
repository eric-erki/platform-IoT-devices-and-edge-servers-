import React, { useState, useMemo, useEffect } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster, Checkbox, Code } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import Popup from '../../components/popup';
import Table from '../../components/table';
import { Text, Row, Button, Form } from '../../components/core';

const createRoleBindings = (serviceAccount, allRoles) => {
  let roleBindings = [];
  if (serviceAccount !== null) {
    for (let i = 0; i < allRoles.length; i++) {
      let hasRole = false;
      if (serviceAccount.roles && serviceAccount.roles.length > 0) {
        for (let j = 0; j < serviceAccount.roles.length; j++) {
          if (allRoles[i].id === serviceAccount.roles[j].id) {
            hasRole = true;
            break;
          }
        }
      }
      roleBindings.push({
        id: allRoles[i].id,
        name: allRoles[i].name,
        hasRoleBinding: hasRole,
      });
    }
  }
  return roleBindings;
};

const ServiceAccount = ({
  route: {
    data: { params, serviceAccount, roles },
  },
}) => {
  const { register, handleSubmit, errors, formState } = useForm({
    defaultValues: {
      name: serviceAccount.name,
      description: serviceAccount.description,
    },
  });
  const navigation = useNavigation();
  const [roleBindings, setRoleBindings] = useState(
    createRoleBindings(serviceAccount, roles)
  );
  const [showDeletePopup, setShowDeletePopup] = useState();

  const handleUpdateRoles = event => {
    let newRoleBindings = [];
    let hasRole = false;
    for (let i = 0; i < roleBindings.length; i++) {
      hasRole = roleBindings[i].hasRoleBinding;
      if (roleBindings[i].id === event.target.id) {
        hasRole = event.target.checked;
      }
      newRoleBindings.push({
        id: roleBindings[i].id,
        name: roleBindings[i].name,
        hasRoleBinding: hasRole,
      });
    }
    setRoleBindings(newRoleBindings);
  };

  const addRole = async roleId => {
    try {
      await api.addServiceAccountRoleBindings({
        projectId: params.project,
        serviceId: serviceAccount.id,
        roleId,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  };

  const removeRole = async roleId => {
    try {
      await api.removeServiceAccountRoleBindings({
        projectId: params.project,
        serviceId: serviceAccount.id,
        roleId,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  };

  const submit = async data => {
    let noError = true;

    try {
      await api.updateServiceAccount({
        projectId: params.project,
        serviceId: serviceAccount.id,
        data,
      });
    } catch (error) {
      noError = false;
      console.log(error);
    }

    const currentRoles = serviceAccount.roles;
    let addRoleBindings = [];
    let removeRoleBindings = [];

    for (let i = 0; i < roleBindings.length; i++) {
      let willAddRole = false;
      let willRemoveRole = false;
      // add role binding to service account
      if (roleBindings[i].hasRoleBinding) {
        willAddRole = true;
      }
      //check if role binding already exists on service account
      if (currentRoles && currentRoles.length > 0) {
        for (let j = 0; j < currentRoles.length; j++) {
          if (roleBindings[i].id === currentRoles[j].id) {
            if (roleBindings[i].hasRoleBinding) {
              //if role binding already exists on service account, do not re-add role to service account
              willAddRole = false;
              break;
            } else {
              //if role binding already exists on service account, remove the role binding
              willRemoveRole = true;
              break;
            }
          }
        }
      }
      if (willAddRole) {
        addRoleBindings.push(roleBindings[i]);
      }
      if (willRemoveRole) {
        removeRoleBindings.push(roleBindings[i]);
      }
    }

    for (let k = 0; k < addRoleBindings.length; k++) {
      const roleId = addRoleBindings[k].id;
      if (noError) {
        noError = await addRole(roleId);
      }
    }

    for (let l = 0; l < removeRoleBindings.length; l++) {
      const roleId = removeRoleBindings[l].id;
      if (noError) {
        noError = await removeRole(roleId);
      }
    }

    if (noError) {
      toaster.success('Service account updated successfully.');
    } else {
      toaster.danger('Service account was not updated.');
    }
  };

  const submitDelete = async () => {
    try {
      await api.deleteServiceAccount({
        projectId: params.project,
        serviceId: serviceAccount.id,
      });
      toaster.success('Successfully deleted service account.');
      navigation.navigate(`/${params.project}/iam/service-accounts`);
    } catch (error) {
      toaster.danger('Service account was not deleted.');
      console.log(error);
    }
    setShowDeletePopup(false);
  };

  return (
    <>
      <Row flex={1}>
        <Card
          title={serviceAccount.name}
          marginRight={5}
          actions={[
            {
              title: 'Delete',
              onClick: () => setShowDeletePopup(true),
              variant: 'secondary',
            },
          ]}
        >
          <Form onSubmit={handleSubmit(submit)}>
            <Field
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
            <Text fontSize={2} marginBottom={2}>
              Choose Individual Roles
            </Text>
            {roleBindings.map(role => (
              <Checkbox
                key={role.id}
                id={role.id}
                label={role.name}
                checked={role.hasRoleBinding}
                onChange={handleUpdateRoles}
              />
            ))}
            <Button
              title="Update"
              type="submit"
              marginTop={4}
              disabled={!formState.dirty}
            />
          </Form>
        </Card>

        <ServiceAccountAccessKeys
          projectId={params.project}
          serviceAccount={serviceAccount}
        />
      </Row>

      <Popup show={showDeletePopup} onClose={() => setShowDeletePopup(false)}>
        <Card title="Delete Service Account" border>
          <Text>
            You are about to delete the <strong>{serviceAccount.name}</strong>{' '}
            service account.
          </Text>
          <Button marginTop={4} title="Delete" onClick={submitDelete} />
        </Card>
      </Popup>
    </>
  );
};

export default ServiceAccount;

const ServiceAccountAccessKeys = ({ projectId, serviceAccount }) => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [newAccessKey, setNewAccessKey] = useState();
  const [showAccessKeyCreated, setShowAccessKeyCreated] = useState();
  const [backendError, setBackendError] = useState();

  const columns = useMemo(
    () => [
      { Header: 'Access Key ID', accessor: 'id' },
      {
        Header: 'Created At',
        accessor: 'createdAt',
      },
      {
        Header: ' ',
        Cell: ({ row }) => (
          <Button
            title="Delete"
            variant="tertiary"
            onClick={() => deleteAccessKey(row.original.id)}
          />
        ),
      },
    ],
    []
  );
  const tableData = useMemo(() => accessKeys, [accessKeys]);

  const fetchAccessKeys = async () => {
    try {
      const response = await api.serviceAccountAccessKeys({
        projectId,
        serviceId: serviceAccount.id,
      });
      setAccessKeys(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAccessKeys();
  }, []);

  const createAccessKey = async () => {
    setBackendError(null);
    try {
      const response = await api.createServiceAccountAccessKey({
        projectId,
        serviceId: serviceAccount.id,
      });
      setNewAccessKey(response.data.value);
      setShowAccessKeyCreated(true);
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Access key was not created successfully.');
        console.log(error);
      }
    }
  };

  const deleteAccessKey = async id => {
    setBackendError(null);
    try {
      await api.deleteServiceAccountAccessKey({
        projectId,
        serviceId: serviceAccount.id,
        accessKeyId: id,
      });
      toaster.success('Successfully deleted access key.');
      fetchAccessKeys();
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        toaster.danger('Access key was not deleted.');
        console.log(error);
      }
    }
  };

  const closeAccessKeyPopup = () => {
    setShowAccessKeyCreated(false);
    fetchAccessKeys();
  };

  return (
    <>
      <Card
        title="Access Keys"
        size="xlarge"
        actions={[{ title: 'Create', onClick: createAccessKey }]}
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
        <Table columns={columns} data={tableData} />
      </Card>

      <Popup
        show={showAccessKeyCreated}
        title="Access Key Created"
        onClose={closeAccessKeyPopup}
      >
        <Card title="Access Key Created" border>
          <Text fontWeight={3} marginBottom={2}>
            Access Key
          </Text>
          <Code>{newAccessKey}</Code>

          <Alert
            intent="warning"
            marginTop={16}
            paddingY={16}
            title="Save the info above! This is the only time you'll be able to use it."
          >
            {`If you lose it, you'll need to create a new access key.`}
          </Alert>
        </Card>
      </Popup>
    </>
  );
};

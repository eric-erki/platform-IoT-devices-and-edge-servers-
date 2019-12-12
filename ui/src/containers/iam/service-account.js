import React, { useState, useMemo, useEffect } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { toaster, Icon } from 'evergreen-ui';

import theme from '../../theme';
import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import Popup from '../../components/popup';
import Table from '../../components/table';
import Alert from '../../components/alert';
import {
  Row,
  Text,
  Button,
  Form,
  Label,
  Checkbox,
  Code,
} from '../../components/core';

const ServiceAccount = ({
  route: {
    data: { params, serviceAccount, roles },
  },
}) => {
  const { register, handleSubmit, errors, formState, setValue } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: serviceAccount.name,
      description: serviceAccount.description,
      roles: roles.reduce(
        (obj, role) => ({
          ...obj,
          [role.name]: !!serviceAccount.roles.find(
            ({ name }) => name === role.name
          ),
        }),
        {}
      ),
    },
  });
  const navigation = useNavigation();
  const [showDeletePopup, setShowDeletePopup] = useState();

  const submit = async data => {
    let error = false;

    try {
      await api.updateServiceAccount({
        projectId: params.project,
        serviceId: serviceAccount.id,
        data,
      });
    } catch (e) {
      error = true;
      console.log(e);
    }

    const roleArray = Object.keys(data.roles);
    for (let i = 0; i < roleArray.length; i++) {
      const role = roleArray[i];
      const choseRole = data.roles[role];
      const hasRole = serviceAccount.roles.find(({ name }) => name === role);
      const roleId = roles.find(({ name }) => name === role).id;
      if (choseRole && !hasRole) {
        try {
          await api.addServiceAccountRoleBindings({
            projectId: params.project,
            serviceId: serviceAccount.id,
            roleId,
          });
        } catch (e) {
          error = true;
          console.log(e);
        }
      } else if (!choseRole & hasRole) {
        try {
          await api.removeServiceAccountRoleBindings({
            projectId: params.project,
            serviceId: serviceAccount.id,
            roleId,
          });
        } catch (e) {
          error = true;
          console.log(e);
        }
      }
    }

    if (error) {
      toaster.danger('Service account was not updated.');
    } else {
      toaster.success('Service account updated successfully.');
      navigation.navigate(`/${params.project}/iam/service-accounts`);
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
      <Card
        title={serviceAccount.name}
        size="xlarge"
        actions={[
          {
            title: 'Delete',
            onClick: () => setShowDeletePopup(true),
            variant: 'secondary',
          },
        ]}
        marginBottom={6}
      >
        <Form onSubmit={handleSubmit(submit)}>
          <Field label="Name" name="name" ref={register} errors={errors.name} />
          <Field
            type="textarea"
            label="Description"
            name="description"
            ref={register}
            errors={errors.description}
          />
          <Label>Choose Individual Roles</Label>
          {roles.map(role => (
            <Field
              group
              key={role.id}
              name={`roles[${role.name}]`}
              as={<Checkbox label={role.name} />}
              register={register}
              setValue={setValue}
            />
          ))}
          <Button title="Update" type="submit" disabled={!formState.dirty} />
        </Form>
      </Card>

      <ServiceAccountAccessKeys
        projectId={params.project}
        serviceAccount={serviceAccount}
      />

      <Popup show={showDeletePopup} onClose={() => setShowDeletePopup(false)}>
        <Card title="Delete Service Account" border>
          <Text>
            You are about to delete the <strong>{serviceAccount.name}</strong>{' '}
            service account.
          </Text>
          <Button marginTop={5} title="Delete" onClick={submitDelete} />
        </Card>
      </Popup>
    </>
  );
};

export default ServiceAccount;

const ServiceAccountAccessKeys = ({ projectId, serviceAccount }) => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [newAccessKey, setNewAccessKey] = useState();
  const [backendError, setBackendError] = useState();

  const columns = useMemo(
    () => [
      { Header: 'Access Key ID', accessor: 'id', style: { flex: 3 } },
      {
        Header: 'Created At',
        accessor: 'createdAt',
      },
      {
        Header: ' ',
        Cell: ({ row }) => (
          <Button
            title={<Icon name="trash" size={18} color={theme.colors.white} />}
            variant="icon"
            onClick={() => deleteAccessKey(row.original.id)}
          />
        ),
        cellStyle: {
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
        },
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
      setAccessKeys([response.data, ...accessKeys]);
      setNewAccessKey(response.data.value);
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

  return (
    <Card
      title="Access Keys"
      size="xlarge"
      actions={[{ title: 'Create Access Key', onClick: createAccessKey }]}
    >
      <Alert show={backendError} variant="error" description={backendError} />
      <Alert
        show={!!newAccessKey}
        title="Access Key Created"
        description="Save the info above! This is the only time you'll be able to use it. If you lose it, you'll need to create a new access key."
      >
        <Label>Access Key</Label>
        <Row>
          <Code>{newAccessKey}</Code>
        </Row>
      </Alert>
      <Table
        columns={columns}
        data={tableData}
        placeholder={
          <Text>
            There are no <strong>Access Keys</strong>.
          </Text>
        }
      />
    </Card>
  );
};

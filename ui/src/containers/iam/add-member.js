import React, { useEffect, useState } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';

import { Checkbox, toaster, Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import { Text, Row, Form, Button } from '../../components/core';

const createRoleBindings = roles =>
  roles.map(({ id, name }) => ({ id, name, hasRoleBinding: false }));

const AddMember = ({
  route: {
    data: { params, roles },
  },
}) => {
  const navigation = useNavigation();
  const { register, handleSubmit } = useForm();
  const [roleBindings, setRoleBindings] = useState([]);
  const [backendError, setBackendError] = useState();

  useEffect(() => {
    setRoleBindings(createRoleBindings(roles));
  }, []);

  const submit = async data => {
    try {
      const { userId } = await api.addMember({
        projectId: params.project,
        data,
      });

      let noError = true;

      for (let i = 0; i < roleBindings.length; i++) {
        const roleId = roleBindings[i].id;
        if (roleBindings[i].hasRoleBinding && noError) {
          noError = await addRole(userId, roleId);
        }
      }

      if (noError) {
        navigation.navigate(`/${params.project}/iam/members`);
        toaster.success('Member was added successfully.');
      } else {
        toaster.warning(
          'Member was added successfully, but role bindings for the member were not updated properly. Please check the roles of the member.'
        );
      }
    } catch (error) {
      if (utils.is4xx(error.response.status)) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        console.log(error);
        toaster.danger('Member was not added.');
      }
    }
  };

  const handleAddRoleBindings = event => {
    const updatedRoleBindings = [];
    let hasRole = false;
    for (let i = 0; i < roleBindings.length; i++) {
      hasRole = roleBindings[i].hasRoleBinding;
      if (roleBindings[i].id === event.target.id) {
        hasRole = event.target.checked;
      }
      updatedRoleBindings.push({
        id: roleBindings[i].id,
        name: roleBindings[i].name,
        hasRoleBinding: hasRole,
      });
    }
    setRoleBindings(updatedRoleBindings);
  };

  const addRole = async (userId, roleId) => {
    try {
      await api.createRoleBindings({ userId, roleId });
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  };

  return (
    <Card title="Add Member">
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
          label="Email"
          type="email"
          name="email"
          ref={register}
        />
        <Text fontWeight={3}>Choose Individual Roles</Text>
        {roleBindings.map(role => (
          <Checkbox
            key={role.id}
            id={role.id}
            label={role.name}
            checked={role.hasRoleBinding}
            onChange={handleAddRoleBindings}
          />
        ))}
        <Button marginTop={2} type="submit" title="Add Member" />
      </Form>
      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/iam/members`}
        />
      </Row>
    </Card>
  );
};

export default AddMember;

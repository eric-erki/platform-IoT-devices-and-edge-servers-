import React, { useEffect, useState } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';

import { toaster, Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Card from '../../components/card';
import Field from '../../components/field';
import { Text, Row, Form, Button, Checkbox } from '../../components/core';

const AddMember = ({
  route: {
    data: { params, roles },
  },
}) => {
  const navigation = useNavigation();
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      roles: roles.reduce((obj, role) => ({ ...obj, [role.name]: false }), {}),
    },
  });
  const [backendError, setBackendError] = useState();

  const submit = async data => {
    try {
      const {
        data: { userId },
      } = await api.addMember({
        projectId: params.project,
        data: { email: data.email },
      });

      let error = false;

      const roleArray = Object.keys(data.roles);
      for (let i = 0; i < roleArray.length; i++) {
        const role = roleArray[i];
        const hasRole = data.roles[role];
        if (hasRole) {
          try {
            await api.addMembershipRoleBindings({
              projectId: params.project,
              userId,
              roleId: role,
            });
          } catch (error) {
            error = true;
            console.log(error);
          }
        }
      }

      if (error) {
        toaster.warning(
          'Member was added successfully, but roles for the member were not updated properly. Please check the roles of the member.'
        );
      } else {
        navigation.navigate(`/${params.project}/iam/members`);
        toaster.success('Member was added successfully.');
      }
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        console.log(error);
        toaster.danger('Member was not added.');
      }
    }
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
        <Text fontWeight={3} marginBottom={2}>
          Choose Individual Roles
        </Text>
        {roles.map(role => (
          <Field
            key={role.id}
            name={`roles[${role.name}]`}
            as={<Checkbox label={role.name} />}
            register={register}
            setValue={setValue}
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

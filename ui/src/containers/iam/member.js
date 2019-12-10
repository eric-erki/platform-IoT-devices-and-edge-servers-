import React, { useState } from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';
import { Alert, toaster } from 'evergreen-ui';

import api from '../../api';
import Card from '../../components/card';
import Dialog from '../../components/dialog';
import Field from '../../components/field';
import {
  Row,
  Text,
  Button,
  Checkbox,
  Heading,
  Form,
} from '../../components/core';

const Member = ({
  route: {
    data: { params, member, roles },
  },
}) => {
  const { register, handleSubmit, setValue, formState } = useForm({
    defaultValues: {
      roles: roles.reduce(
        (obj, role) => ({
          ...obj,
          [role.name]: !!member.roles.find(({ name }) => name === role.name),
        }),
        {}
      ),
    },
  });
  const [showRemoveDialog, setShowRemoveDialog] = useState();
  const navigation = useNavigation();

  const removeMember = async () => {
    try {
      await api.removeMember({
        projectId: params.project,
        userId: member.userId,
      });
      toaster.success('Successfully removed member.');
      navigation.navigate(`/${params.project}/iam/members`);
    } catch (error) {
      toaster.danger('Member was not removed.');
      console.log(error);
    }
  };

  const submit = async data => {
    let error = false;
    const roleArray = Object.keys(data.roles);
    for (let i = 0; i < roleArray.length; i++) {
      const role = roleArray[i];
      const hasRole = data.roles[role];
      if (member.roles[role] !== hasRole) {
        if (hasRole) {
          try {
            await api.addMembershipRoleBindings({
              projectId: params.project,
              userId: member.userId,
              roleId: role,
            });
          } catch (error) {
            console.log(error);
            error = true;
          }
        } else {
          try {
            await api.removeMembershipRoleBindings({
              projectId: params.project,
              userId: member.userId,
              roleId: role,
            });
          } catch (error) {
            console.log(error);
            error = true;
          }
        }
      }
    }

    if (error) {
      toaster.danger(
        'Roles for the member were not updated properly. Please check the roles of the member.'
      );
    } else {
      navigation.navigate(`/${params.project}/iam/members`);
      toaster.success('Member updated successfully.');
    }
  };

  return (
    <>
      <Card>
        <Heading
          fontSize={5}
        >{`${member.user.firstName} ${member.user.lastName}`}</Heading>
        <Text color="whites.7">{member.user.email}</Text>
        <Form onSubmit={handleSubmit(submit)}>
          <Text marginTop={4} marginBottom={2} fontWeight={3}>
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
          <Button
            marginTop={2}
            title="Update Member"
            type="submit"
            disabled={!formState.dirty}
          />
        </Form>
        <Row marginTop={4}>
          <Button
            variant="tertiary"
            title="Remove Member"
            onClick={() => setShowRemoveDialog(true)}
          />
        </Row>
      </Card>
      <Dialog
        show={showRemoveDialog}
        title="Remove Member"
        onClose={() => setShowRemoveDialog(false)}
      >
        <Card title="Remove Member" border>
          <Text>
            You are about to remove the member (
            <strong>
              {member.user.firstName} {member.user.lastName}
            </strong>
            ) from the project.
          </Text>
          <Button marginTop={4} title="Remove Member" onClick={removeMember} />
        </Card>
      </Dialog>
    </>
  );
};

export default Member;

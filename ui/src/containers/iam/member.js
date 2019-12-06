import React, { useState, useEffect } from 'react';
import { useNavigation } from 'react-navi';
import { Checkbox, toaster } from 'evergreen-ui';

import api from '../../api';
import Card from '../../components/card';
import Dialog from '../../components/dialog';
import { Box, Row, Text, Button, Heading } from '../../components/core';

const Member = ({
  route: {
    data: { params, member, roles },
  },
}) => {
  const [roleBindings, setRoleBindings] = useState([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState();
  const [changed, setChanged] = useState();
  const navigation = useNavigation();

  const setupRoleBindings = () => {
    const roleBindings = [];
    if (member !== null) {
      for (let i = 0; i < roles.length; i++) {
        let hasRole = false;
        if (member.roles && member.roles.length > 0) {
          for (let j = 0; j < member.roles.length; j++) {
            if (roles[i].id === member.roles[j].id) {
              hasRole = true;
              break;
            }
          }
        }
        roleBindings.push({
          id: roles[i].id,
          name: roles[i].name,
          hasRoleBinding: hasRole,
        });
      }
    }
    setRoleBindings(roleBindings);
  };

  useEffect(setupRoleBindings, []);

  const removeMember = () => {
    api
      .removeMember({})
      .then(() => {
        toaster.success('Successfully removed member.');
        navigation.navigate(`/${params.project}/iam/members`);
      })
      .catch(error => {
        toaster.danger('Member was not removed.');
        console.log(error);
      })
      .finally(() => setShowRemoveDialog(false));
  };

  const addRoleBindings = async () => {
    try {
      await api.addRoleBindings({ projectId: params.project });
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  };

  const removeRoleBindings = async () => {
    try {
      api.removeRoleBindings({ projectId: params.project });
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  };

  const updateRoleBindings = (id, hasRoleBinding) => () => {
    const newRoleBindings = [];
    let hasRole = false;
    for (let i = 0; i < roleBindings.length; i++) {
      hasRole = roleBindings[i].hasRoleBinding;
      if (roleBindings[i].id === id) {
        hasRole = hasRoleBinding;
      }
      newRoleBindings.push({
        id: roleBindings[i].id,
        name: roleBindings[i].name,
        hasRoleBinding: hasRole,
      });
    }
    setRoleBindings(newRoleBindings);
    setChanged(true);
  };

  const updateMember = async () => {
    const roleBindingsToAdd = [];
    const roleBindingsToRemove = [];

    for (let i = 0; i < roleBindings.length; i++) {
      let addRole = false;
      let removeRole = false;
      // add role binding to member
      if (roleBindings[i].hasRoleBinding) {
        addRole = true;
      }
      //check if role binding already exists on member
      if (member.roles && member.roles.length > 0) {
        for (let j = 0; j < member.roles.length; j++) {
          if (roleBindings[i].id === member.roles[j].id) {
            if (roleBindings[i].hasRoleBinding) {
              //if role binding already exists on member, do not re-add role to member
              addRole = false;
              break;
            } else {
              //if role binding already exists on member, remove the role binding
              removeRole = true;
              break;
            }
          }
        }
      }
      if (addRole) {
        roleBindingsToAdd.push(roleBindings[i]);
      }
      if (removeRole) {
        roleBindingsToRemove.push(roleBindings[i]);
      }
    }

    let noError = true;

    for (let i = 0; i < roleBindingsToAdd.length; i++) {
      const roleId = roleBindingsToAdd[i].id;
      if (noError) {
        noError = await addRoleBindings(roleId);
      }
    }

    for (let i = 0; i < roleBindingsToRemove.length; i++) {
      const roleId = roleBindingsToRemove[i].id;
      if (noError) {
        noError = await removeRoleBindings(roleId);
      }
    }

    if (noError) {
      toaster.success('Member updated successfully.');
    } else {
      toaster.danger('Member was not updated.');
    }
  };

  return (
    <Card>
      <Heading
        fontSize={5}
      >{`${member.user.firstName} ${member.user.lastName}`}</Heading>
      <Text color="whites.7">{member.user.email}</Text>
      <Text marginTop={4} fontWeight={3}>
        Select Individual Roles
      </Text>
      {roleBindings.map(role => (
        <Checkbox
          key={role.id}
          id={role.id}
          label={role.name}
          checked={role.hasRoleBinding}
          marginY={12}
          onChange={updateRoleBindings(role.id, role.hasRoleBinding)}
        />
      ))}

      <Button
        marginTop={2}
        title="Update Member"
        onClick={updateMember}
        disabled={!changed}
      />
      <Row marginTop={4}>
        <Button variant="tertiary" title="Remove Member" />
      </Row>
      <Dialog
        show={showRemoveDialog}
        title="Remove Member"
        onClose={() => showRemoveDialog(false)}
      >
        <Card title="Remove Member">
          <Text>
            You are about to remove the member (
            <strong>
              {member.user.firstName} {member.user.lastName}
            </strong>
            ) from the project.
          </Text>
          <Button marginY={4} title="Remove Member" onClick={removeMember} />
          <Button title="Cancel" onClick={() => showRemoveDialog(false)} />
        </Card>
      </Dialog>
    </Card>
  );
};

export default Member;

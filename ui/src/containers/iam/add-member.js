import React from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';

import { Checkbox, toaster } from 'evergreen-ui';

import api from '../../api';
import Card from '../../components/card';
import Field from '../../components/field';
import { Text, Row, Form, Button } from '../../components/core';

const AddMember = ({
  route: {
    data: { params, roles },
  },
}) => {
  const navigation = useNavigation();
  const { register, handleSubmit } = useForm();

  const submit = data => {
    api.addMember(data).then(({ userId }) => {
      const roleBindings = roleBindings;
      var noError = true;

      for (var i = 0; i < roleBindings.length; i++) {
        const roleId = roleBindings[i].id;
        if (roleBindings[i].hasRoleBinding && noError) {
          noError = this.addRole(userId, roleId);
        }
      }

      if (noError) {
        navigation.navigate(`/${params.project}/iam/members/`);
        toaster.success('Member was added successfully.');
      } else {
        toaster.warning(
          'Member was added successfully, but role bindings for the member were not updated properly. Please check the roles of the member.'
        );
      }
    });
    // .catch(error => {
    //   if (utils.is4xx(error.response.status)) {
    //     this.setState({
    //       backendError: utils.convertErrorMessage(error.response.data),
    //     });
    //   } else {
    //     console.log(error);
    //     toaster.danger('Member was not added.');
    //   }
    // });
  };

  const createRoleBindings = allRoles => {
    var roleBindings = [];
    for (var i = 0; i < allRoles.length; i++) {
      roleBindings.push({
        id: allRoles[i].id,
        name: allRoles[i].name,
        hasRoleBinding: false,
      });
    }
    return roleBindings;
  };

  const handleAddRoleBindings = event => {
    var updatedRoleBindings = [];
    var hasRole = false;
    for (var i = 0; i < roleBindings.length; i++) {
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
    this.setState({
      roleBindings: updatedRoleBindings,
    });
  };

  const addRole = (userId, roleId) => {
    api.createRoleBindings({ userId, roleId }).catch(error => {
      console.log(error);
      return false;
    });

    return true;
  };

  return (
    <Card title="Add Member">
      <Form onSubmit={handleSubmit(submit)}>
        {/* {backendError && (
      <Alert
        marginBottom={majorScale(2)}
        paddingTop={majorScale(2)}
        paddingBottom={majorScale(2)}
        intent="warning"
        title={backendError}
      />
    )} */}
        <Field label="Email" type="email" name="email" ref={register} />
        <Text marginBottom={2}>Choose Individual Roles</Text>
        {roleBindings.map(role => (
          <Checkbox
            key={role.id}
            id={role.id}
            label={role.name}
            checked={role.hasRoleBinding}
            onChange={handleAddRoleBindings}
          />
        ))}
        <Button type="submit" title="Add Member" />
      </Form>
      <Row marginTop={4}>
        <Button title="Cancel" href={`/${params.project}/iam/members`} />
      </Row>
    </Card>
  );
};

export default AddMember;

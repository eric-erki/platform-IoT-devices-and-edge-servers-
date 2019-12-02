import React, { useState } from 'react';
import useForm from 'react-hook-form';

import Editor from '../../components/editor';
import Card from '../../components/card';
import Field from '../../components/field';
import { Row, Text, Button, Form } from '../../components/core';

const Role = ({
  route: {
    data: { role },
  },
}) => {
  const { register, handleSubmit } = useForm();
  const [showDeleteDialog, setShowDeleteDialog] = useState();

  const submit = () => {};

  return (
    <Card title={`Role / ${role.name}`}>
      <Form onSubmit={handleSubmit(submit)}>
        {/* {this.state.backendError && (
          <Alert
            marginBottom={majorScale(2)}
            paddingTop={majorScale(2)}
            paddingBottom={majorScale(2)}
            intent="warning"
            title={this.state.backendError}
          />
        )} */}
        <Field autoFocus required label="Name" name="name" ref={register} />

        <Field label="Description" name="description" ref={register} />
        <Text marginBottom={2}>Config</Text>
        <Editor
          width="100%"
          height="200px"
          //value={this.state.config}
          //onChange={value => this.setState({ config: value, unchanged: false })}
        />
        <Button
          marginTop={4}
          title="Update role"
          type="submit"
          //disabled={this.state.unchanged}
        />
      </Form>
      <Row marginTop={4}>
        <Button
          variant="tertiary"
          title="Delete Role"
          onClick={() => showDeleteDialog(true)}
        />
      </Row>

      {/* <Dialog
          isShown={this.state.showDeleteDialog}
          title="Delete Role"
          intent="danger"
          onCloseComplete={() => this.setState({ showDeleteDialog: false })}
          onConfirm={() => this.handleDelete()}
          confirmLabel="Delete Role"
        >
          You are about to delete the <strong>{this.props.roleName}</strong>{' '}
          role.
        </Dialog> */}
    </Card>
  );
};

export default Role;

/*   state = {
//     role: null,
//     name: '',
//     nameValidationMessage: null,
//     description: '',
//     config: '',
//     unchanged: true,
//     showDeleteDialog: false,
//     backendError: null,
//   };

//   handleUpdateName = event => {
//     this.setState({
//       name: event.target.value,
//       unchanged: false,
//     });
//   };

//   handleUpdateDescription = event => {
//     this.setState({
//       description: event.target.value,
//       unchanged: false,
//     });
//   };

//   handleUpdate() {
//     var nameValidationMessage = utils.checkName('role', this.state.name);

//     //always set validation message for name
//     this.setState({
//       nameValidationMessage: nameValidationMessage,
//       backendError: null,
//     });

//     if (nameValidationMessage !== null) {
//       return;
//     }

//     api.updateRole({});
//     //.then(response => {
//     //   toaster.success('Successfully updated role.');
//     //   this.props.history.push(`/${this.props.projectName}/iam/roles`);
//     // })
//     // .catch(error => {
//     //   if (utils.is4xx(error.response.status)) {
//     //     this.setState({
//     //       backendError: utils.convertErrorMessage(error.response.data),
//     //     });
//     //   } else {
//     //     toaster.danger('Role was not updated.');
//     //     console.log(error);
//     //   }
//     // });
//   }

//   handleDelete() {
//     api.deleteRole();

//     // .then(response => {
//     //   this.setState({
//     //     showDeleteDialog: false,
//     //   });
//     //   toaster.success('Successfully deleted role.');
//     //   this.props.history.push(`/${this.props.projectName}/iam/roles`);
//     // })
//     // .catch(error => {
//     //   this.setState({
//     //     showDeleteDialog: false,
//     //   });
//     //   if (utils.is4xx(error.response.status)) {
//     //     this.setState({
//     //       backendError: utils.convertErrorMessage(error.response.data),
//     //     });
//     //   } else {
//     //     toaster.danger('Role was not deleted.');
//     //     console.log(error);
//     //   }
//     // });
//   }
// }
*/

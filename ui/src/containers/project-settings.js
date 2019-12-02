import React from 'react';
import useForm from 'react-hook-form';
import { useNavigation, useCurrentRoute } from 'react-navi';
import { Alert, Dialog, toaster } from 'evergreen-ui';

import api from '../api';
import Layout from '../components/layout';
import Card from '../components/card';
import Field from '../components/field';
import { Button, Form, Input } from '../components/core';

const ProjectSettings = () => {
  const r = useCurrentRoute();
  console.log(r);
  const projectId = 'test';
  const { register, handleSubmit } = useForm();
  const navigation = useNavigation();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState();
  const [confirmation, setConfirmation] = React.useState();

  const submit = data => {
    api
      .updateProject(data)
      .then(() => {
        toaster.success('Successfully updated project.');
        navigation.navigate(`/${projectId}/settings`);
      })
      .catch(error => {
        // if (utils.is4xx(error.response.status)) {
        //   this.setState({
        //     backendError: utils.convertErrorMessage(error.response.data),
        //   });
        // } else {
        toaster.danger('Project was not updated.');
        console.log(error);
        // }
      });
  };

  const submitDelete = () => {
    api
      .deleteProject({ projectId })
      .then(() => {
        toaster.success('Successfully deleted project.');
        navigation.navigate(`/`);
      })
      .catch(error => {
        // if (utils.is4xx(error.response.status)) {
        //   this.setState({
        //     backendError: utils.convertErrorMessage(error.response.data),
        //   });
        // } else {
        toaster.danger('Project was not deleted.');
        console.log(error);
        //}
      })
      .finally(() => {
        setShowDeleteDialog(false);
      });
  };

  return (
    <Layout alignItems="center">
      <Card title="Project Settings">
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
          <Field label="Project Name" name="name" ref={register} />
          <Field label="Datadog API Key" name="datadogApiKey" ref={register} />
          <Button type="submit" title="Update Settings" />
          <Button
            marginTop={4}
            title="Delete Project"
            variant="tertiary"
            onClick={() => setShowDeleteDialog(true)}
          />
        </Form>
        <Dialog
          isShown={showDeleteDialog}
          title="Delete Project"
          intent="danger"
          onCloseComplete={() => setShowDeleteDialog(false)}
          onConfirm={submitDelete}
          confirmLabel="Delete Project"
          //isConfirmDisabled={disableDeleteConfirm}
        >
          This action <strong>cannot</strong> be undone. This will permanently
          delete the <strong>{projectId}</strong> project.
          <p></p>Please type in the name of the project to confirm.
          <Input onChange={e => setConfirmation(e.target.value)} />
        </Dialog>
      </Card>
    </Layout>
  );
};

export default ProjectSettings;

// export default class ProjectSettings extends Component {
//   state = {
//     name: this.props.projectName,
//     nameValidationMessage: null,
//     datadogApiKey: '',
//     datadogApiKeyValidationMessage: null,
//     unchanged: true,
//     showDeleteDialog: false,
//     disableDeleteConfirm: true,
//     backendError: null,
//   };

//   componentDidMount() {
//     axios
//       .get(`${config.endpoint}/projects/${this.props.projectName}`, {
//         withCredentials: true,
//       })
//       .then(response => {
//         this.setState({
//           datadogApiKey: response.data.datadogApiKey,
//         });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }

//   handleUpdateName = event => {
//     this.setState({
//       name: event.target.value,
//       unchanged: false,
//     });
//   };

//   handleUpdateDatadogApiKey = event => {
//     this.setState({
//       datadogApiKey: event.target.value,
//       unchanged: false,
//     });
//   };

//   handleUpdate = () => {
//     var nameValidationMessage = utils.checkName('project', this.state.name);

//     //always set validation message for name
//     this.setState({
//       nameValidationMessage: nameValidationMessage,
//       backendError: null,
//     });

//     if (nameValidationMessage !== null) {
//       return;
//     }

//     var datadogApiKeyValidationMessage = utils.customValidate(
//       'Datadog API Key',
//       utils.nameRegex,
//       'numbers and lowercase letters',
//       100,
//       this.state.datadogApiKey
//     );

//     this.setState({
//       datadogApiKeyValidationMessage: datadogApiKeyValidationMessage,
//       backendError: null,
//     });

//     if (datadogApiKeyValidationMessage !== null) {
//       return;
//     }

//         {
//           withCredentials: true,
//         }
//       )

//   };

//   handleDelete() {
//     this.setState({
//       backendError: null,
//     });

//     .then(response => {
//       this.setState({
//         showDeleteDialog: false,
//       });
//       toaster.success('Successfully deleted project.');
//       this.props.history.push(`/`);
//     })
//     .catch(error => {
//       this.setState({
//         showDeleteDialog: false,
//       });
//       if (utils.is4xx(error.response.status)) {
//         this.setState({
//           backendError: utils.convertErrorMessage(error.response.data),
//         });
//       } else {
//         toaster.danger('Project was not deleted.');
//         console.log(error);
//       }
//     });
// }

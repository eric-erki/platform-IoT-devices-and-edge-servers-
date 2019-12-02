import React from 'react';
import useForm from 'react-hook-form';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Field from '../../components/field';
import { Button, Form } from '../../components/core';
import api from '../../api';

const CreateDeviceRegistrationToken = ({
  route: {
    data: { params },
  },
}) => {
  const { register, handleSubmit } = useForm();
  const navigation = useNavigation();

  const submit = data => {
    api.createDeviceRegistrationToken(data).then(() => {
      navigation.navigate(`${params.project}/provisioning`);
    });
  };

  return (
    <Card title="Device Registration Token Settings">
      <Form onSubmit={handleSubmit(submit)}>
        <Field label="Name" name="name" ref={register} />
        <Field
          label="Description"
          type="textarea"
          name="description"
          ref={register}
        />
        <Field
          label="Maximum Device Registrations"
          name="maxRegistrations"
          description="Limit the number of devices that can be registered using this token"
          hint="Leave empty to allow unlimited registrations"
          ref={register}
        />
        <Button title="Submit" type="submit" />
      </Form>

      <Row marginTop={4}>
        <Button
          title="Cancel"
          variant="tertiary"
          href={`/${params.project}/provisioning`}
        />
      </Row>
    </Card>
  );
};

export default CreateDeviceRegistrationToken;

// class  extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       name: '',
//       description: '',
//       maxRegistrations: '',
//       nameValidationMessage: null,
//       maxRegistrationsValidationMessage: null,
//       showDeleteDialog: false,
//       backendError: null
//     };
//   }

//   handleSubmit = () => {
//     var nameValidationMessage = utils.checkName(
//       'Device Registration Token',
//       this.state.name
//     );

//     //always set validation message for name
//     this.setState({
//       nameValidationMessage: nameValidationMessage,
//       backendError: null
//     });

//     if (nameValidationMessage !== null) {
//       return;
//     }

//     // Convert max registrations to int or undefined
//     var maxRegistrationsCleaned;
//     if (this.state.maxRegistrations === '') {
//       maxRegistrationsCleaned = null;
//     } else {
//       maxRegistrationsCleaned = Number(this.state.maxRegistrations);

//       if (isNaN(maxRegistrationsCleaned)) {
//         this.setState({
//           maxRegistrationsValidationMessage:
//             'Max Registrations should either be a number or be left empty.'
//         });
//         return;
//       }
//     }

//     axios
//         {
//
//         },
//         {
//           withCredentials: true
//         }
//       )
//       .then(response => {
//         toaster.success('Device Registration Token created successfully.');

//       })
//       .catch(error => {
//         if (utils.is4xx(error.response.status)) {
//           this.setState({
//             backendError: utils.convertErrorMessage(error.response.data)
//           });
//         } else {
//           toaster.danger('Device Registration Token was not updated.');
//           console.log(error);
//         }
//       });
//   };

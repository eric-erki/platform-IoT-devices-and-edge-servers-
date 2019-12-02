import React, { useEffect } from 'react';
import { Code, Icon } from 'evergreen-ui';

import config from '../../config';
import segment from '../../lib/segment';
import Card from '../../components/card';
import { Row, Text } from '../../components/core';

const getDockerCommand = ({ project, deviceRegistrationToken }) => {
  if (window.location.hostname === 'localhost') {
    return [
      'go run cmd/agent/main.go',
      '--controller=http://localhost:8080/api',
      '--conf-dir=./cmd/agent/conf',
      '--state-dir=./cmd/agent/state',
      '--log-level=debug',
      `--project=${project}`,
      `--registration-token=${deviceRegistrationToken.id}`,
      '# note, this is the local version',
    ].join(' ');
  } else {
    return [
      'docker run -d --restart=always',
      '--privileged',
      '--net=host',
      '--pid=host',
      '-v /etc/deviceplane:/etc/deviceplane',
      '-v /var/lib/deviceplane:/var/lib/deviceplane',
      '-v /var/run/docker.sock:/var/run/docker.sock',
      '-v /etc/os-release:/etc/os-release',
      `--label com.deviceplane.agent-version=${config.agentVersion}`,
      `deviceplane/agent:${config.agentVersion}`,
      `--project=${project}`,
      `--registration-token=${deviceRegistrationToken.id}`,
    ].join(' ');
  }
};

const CreateDevice = ({
  route: {
    data: { params, deviceRegistrationToken },
  },
}) => {
  useEffect(() => {
    segment.page(); //TODO: why is this only used on this page?
  }, []);

  return (
    <Card title="Device Registration">
      <Row marginBottom={4}>
        <Icon icon="info-sign" color="white" marginRight={8} />
        <Text>
          Default device registration token with ID{' '}
          <Code fontFamily="mono" background="#234361" color="white">
            {deviceRegistrationToken.id}
          </Code>{' '}
          is being used.
        </Text>
      </Row>
      <Text>Run the following command to register your device.</Text>
      <Code fontFamily="mono" color="white">
        {getDockerCommand({ project: params.project, deviceRegistrationToken })}
      </Code>
    </Card>
  );
};

// TODO: ADD THIS WARNING ABOUT DEFAULT TOKEN BEING DELETED

// var addDeviceButtonHolder;
// if (this.state.defaultDeviceRegistrationTokenExists) {
//   addDeviceButtonHolder = (
//     <Button
//       appearance="primary"
//       onClick={() => history.push(`/${projectName}/devices/add`)}
//     >
//       Add Device
//     </Button>
//   );
// } else {
//   addDeviceButtonHolder = (
//     <Popover
//       trigger="hover"
//       isShown={this.state.popoverShown}
//       content={
//         <Pane
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           flexDirection="column"
//           width="250px"
//           padding="20px"
//           onMouseOver={() => {
//             this.setState({ popoverShown: true });
//           }}
//           onMouseOut={() => {
//             this.setState({ popoverShown: false });
//           }}
//         >
//           <Text>
//             There is no "default" device registration token, so adding
//             devices from the UI is disabled.
//           </Text>
//           <Text paddingTop={minorScale(1)}>
//             Device registration tokens can be created on the{' '}
//             <Link
//               style={{ color: 'blue' }}
//               to={`/${projectName}/provisioning`}
//             >
//               Provisioning
//             </Link>{' '}
//             page.
//           </Text>
//         </Pane>
//       }
//     >
//       <Pane
//         appearance="primary"
//         onMouseOver={() => {
//           this.setState({ popoverShown: true });
//         }}
//         onMouseOut={() => {
//           this.setState({ popoverShown: false });
//         }}
//       >
//         <Button disabled={true}>Add Device</Button>
//       </Pane>
//     </Popover>
//   );
// }

export default CreateDevice;

// class AddDevice extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       deviceRegistrationToken: null,
//       project: null
//     };
//   }

//   componentDidMount() {
//     segment.page();

//     this.getRegistrationToken();
//     axios
//       .get(`${config.endpoint}/projects/${this.props.projectName}`, {
//         withCredentials: true
//       })
//       .then(response => {
//         this.setState({
//           project: response.data
//         });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }

//   getRegistrationToken = () => {
//     axios
//       .get(
//         `${config.endpoint}/projects/${this.props.projectName}/deviceregistrationtokens/default`,
//         {
//           withCredentials: true
//         }
//       )
//       .then(response => {
//         this.setState({
//           deviceRegistrationToken: response.data
//         });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   };

//   handleAddNewDevice = () => {
//     this.getRegistrationToken();
//     toaster.success('New device token and command generated.');
//   };

//   render() {
//     if (!this.state.deviceRegistrationToken || !this.state.project) {
//       return <CustomSpinner />;
//     }
//     const heading = 'Add Device';

//     var dockerCommand;

//     return (

//     );
//   }
// }

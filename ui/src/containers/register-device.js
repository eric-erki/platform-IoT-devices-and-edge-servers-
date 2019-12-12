import React from 'react';

import config from '../config';
import Layout from '../components/layout';
import Card from '../components/card';
import { Row, Text, Link, Code } from '../components/core';

const getDockerCommand = deviceRegistrationToken => {
  if (window.location.hostname === 'localhost') {
    return [
      'go run cmd/agent/main.go',
      '--controller=http://localhost:8080/api',
      '--conf-dir=./cmd/agent/conf',
      '--state-dir=./cmd/agent/state',
      '--log-level=debug',
      `--project=${deviceRegistrationToken.projectId}`,
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
      `--project=${deviceRegistrationToken.projectId}`,
      `--registration-token=${deviceRegistrationToken.id}`,
    ].join(' ');
  }
};

const AddDevice = ({
  route: {
    data: { params, deviceRegistrationToken },
  },
}) => {
  return (
    <Layout alignItems="center">
      <Card title="Register Device">
        {deviceRegistrationToken ? (
          <>
            <Row marginBottom={4}>
              <Text>
                Default device registration token with ID{' '}
                <Code>{deviceRegistrationToken.id}</Code> is being used.
              </Text>
            </Row>
            <Text marginBottom={2}>
              Run the following command on the device you want to register:
            </Text>
            <Code>{getDockerCommand(deviceRegistrationToken)}</Code>
          </>
        ) : (
          <>
            <Text>
              Create a <strong>default</strong> Device Registration Token from
              the{' '}
              <Link href={`/${params.project}/provisioning`}>Provisioning</Link>{' '}
              page to enable device registration from the UI.{' '}
            </Text>
          </>
        )}
      </Card>
    </Layout>
  );
};

export default AddDevice;

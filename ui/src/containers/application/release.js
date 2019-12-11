import React, { useState } from 'react';
import moment from 'moment';
import { useNavigation } from 'react-navi';
import { Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import Editor from '../../components/editor';
import Card from '../../components/card';
import Popup from '../../components/popup';
import {
  Row,
  Column,
  Text,
  Button,
  Link,
  Label,
  Value,
} from '../../components/core';

const ReleasedBy = ({ project, release }) => {
  if (release) {
    if (release.createdByUser) {
      return (
        <Link href={`/${project}/iam/members/${release.createdByUser.id}`}>
          {release.createdByUser.firstName} {release.createdByUser.lastName}
        </Link>
      );
    } else if (release.createdByServiceAccount) {
      return (
        <Link
          href={`/${project}/iam/service-accounts/${release.createdByServiceAccount.name}`}
        >
          {release.createdByServiceAccount.name}
        </Link>
      );
    }
  }
  return '-';
};

const Release = ({
  route: {
    data: { params, release, application },
  },
}) => {
  const [backendError, setBackendError] = useState();
  const [showConfirmPopup, setShowConfirmPopup] = useState();
  const navigation = useNavigation();

  const revertRelease = async () => {
    try {
      await api.createRelease({
        projectId: params.project,
        applicationId: application.id,
        data: { rawConfig: release.rawConfig },
      });
      navigation.navigate(`/${params.project}/applications/${application.id}`);
    } catch (error) {
      if (utils.is4xx(error.response.status) && error.response.data) {
        setBackendError(utils.convertErrorMessage(error.response.data));
      } else {
        console.log(error);
      }
    }
    setShowConfirmPopup(false);
  };

  return (
    <>
      <Card size="large">
        <Text fontWeight={3} fontSize={5} marginBottom={6}>
          {release.id}
        </Text>
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
        <Column marginBottom={6}>
          <Label>Released By</Label>
          <Row>
            <ReleasedBy project={params.project} release={release} />
          </Row>
        </Column>

        <Column marginBottom={6}>
          <Label>Started</Label>
          <Value>{moment(release.createdAt).fromNow()}</Value>
        </Column>

        <Label>Config</Label>
        <Editor
          readOnly
          width="100%"
          height="200px"
          value={release.rawConfig}
        />
        <Button
          marginTop={6}
          title="Revert to this Release"
          onClick={() => setShowConfirmPopup(true)}
        />
      </Card>

      <Popup show={showConfirmPopup} onClose={() => setShowConfirmPopup(false)}>
        <Card title="Revert Release" border>
          <Text>
            This will create a new release to application{' '}
            <strong>{params.application}</strong> using the config from release{' '}
            <strong>{release.id}</strong>.
          </Text>
          <Button marginTop={6} title="Revert" onClick={revertRelease} />
        </Card>
      </Popup>
    </>
  );
};

export default Release;

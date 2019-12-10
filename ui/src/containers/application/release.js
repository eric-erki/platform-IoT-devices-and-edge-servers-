import React, { useState } from 'react';
import moment from 'moment';
import { useNavigation } from 'react-navi';
import { Alert } from 'evergreen-ui';

import api from '../../api';
import utils from '../../utils';
import config from '../../config';
import Editor from '../../components/editor';
import Card from '../../components/card';
import Dialog from '../../components/dialog';
import { Column, Text, Button, Link } from '../../components/core';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState();
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
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Card size="large">
        <Text fontWeight={3} fontSize={5} marginBottom={5}>
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
        <Column marginBottom={4}>
          <Text fontWeight={3} marginBottom={2}>
            Released By
          </Text>
          <ReleasedBy project={params.project} release={release} />
        </Column>

        <Column marginBottom={4}>
          <Text fontWeight={3} marginBottom={2}>
            Started
          </Text>
          <Text>{moment(release.createdAt).fromNow()}</Text>
        </Column>

        <Text fontWeight={3} marginBottom={2}>
          Config
        </Text>
        <Editor
          readOnly
          width="100%"
          height="200px"
          value={release.rawConfig}
        />
        <Button
          marginTop={4}
          title="Revert to this Release"
          onClick={() => setShowConfirmDialog(true)}
        />
      </Card>

      <Dialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <Card title="Revert Release" border>
          <Text>
            This will create a new release to application{' '}
            <strong>{params.application}</strong> using the config from release{' '}
            <strong>{release.id}</strong>.
          </Text>
          <Button
            marginTop={4}
            title="Revert Release"
            onClick={revertRelease}
          />
        </Card>
      </Dialog>
    </>
  );
};

export default Release;

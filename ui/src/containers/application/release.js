import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Table, Alert } from 'evergreen-ui';

import utils from '../../utils';
import config from '../../config';
import Editor from '../../components/editor';
import Card from '../../components/card';
import Dialog from '../../components/dialog';
import { Text, Button, Link } from '../../components/core';

const Release = ({
  route: {
    data: { params },
  },
  release,
}) => {
  const [backendError, setBackendError] = useState();

  const revertRelease = () => {
    axios
      .post(
        `${config.endpoint}/projects/${this.props.projectName}/applications/${this.props.applicationName}/releases`,
        {
          rawConfig: this.props.release.rawConfig,
        },
        {
          withCredentials: true,
        }
      )
      .then(response => {
        this.setState({
          showConfirmDialog: false,
        });
        // segment.track('Release Created');
        this.props.history.push(
          `/${this.props.projectName}/applications/${this.props.applicationName}`
        );
      })
      .catch(error => {
        this.setState({
          showConfirmDialog: false,
        });
        if (utils.is4xx(error.response.status)) {
          this.setState({
            backendError: utils.convertErrorMessage(error.response.data),
          });
        } else {
          console.log(error);
        }
      });
  };

  const getReleasedBy = release => {
    if (release) {
      if (release.createdByUser) {
        return (
          <Link
            href={`/${params.project}/iam/members/${release.createdByUser.id}`}
          >
            {release.createdByUser.firstName} {release.createdByUser.lastName}
          </Link>
        );
      } else if (release.createdByServiceAccount) {
        return (
          <Link
            href={`/${params.project}/iam/service-accounts/${release.createdByServiceAccount.name}`}
          >
            {release.createdByServiceAccount.name}
          </Link>
        );
      }
    }
    return '-';
  };

  return (
    <>
      <Card title={release.id}>
        {backendError && (
          <Alert
            marginBottom={16}
            paddingTop={16}
            paddingBottom={16}
            intent="warning"
            title={backendError}
          />
        )}
        <Text>
          <strong>Released By:</strong> {this.getReleasedBy(release)}
        </Text>
        <Text>
          <strong>Started:</strong> {moment(release.createdAt).fromNow()}
        </Text>

        <Text fontWeight={3}>Config</Text>
        <Button title="Revert to this Release" onClick={() => {}} />
        <Editor
          width="100%"
          height="300px"
          value={release.rawConfig}
          readOnly
        />
      </Card>

      {/* <Dialog
          isShown={this.state.showConfirmDialog}
          title="Revert Release"
          onCloseComplete={() => this.setState({ showConfirmDialog: false })}
          onConfirm={() => this.revertRelease()}
          confirmLabel="Revert Release"
        >
          This will create a new release to application{' '}
          <strong>{this.props.applicationName}</strong> using the config from
          release <strong>{release.id}</strong>.
        </Dialog> */}
    </>
  );
};

export default Release;

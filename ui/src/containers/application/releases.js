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

const getReleasedBy = release => {
  if (release) {
    if (release.createdByUser) {
      const memberUrl = '../../iam/members/' + release.createdByUser.id;
      return (
        <Link color="neutral" href={memberUrl}>
          {release.createdByUser.firstName} {release.createdByUser.lastName}
        </Link>
      );
    } else if (release.createdByServiceAccount) {
      const serviceAccountUrl =
        '../../iam/serviceaccounts/' + release.createdByServiceAccount.name;
      return (
        <Link href={serviceAccountUrl}>
          {release.createdByServiceAccount.name}
        </Link>
      );
    }
  }
  return '-';
};

const Releases = ({
  route: {
    data: { params, application, releases },
  },
}) => {
  const [selectedRelease, setSelectedRelease] = useState();

  return (
    <>
      <Card
        title="Releases"
        size="large"
        actions={[
          {
            title: 'Create Release',
            href: `/${params.project}/applications/${application.name}/releases/create`,
          },
        ]}
      >
        <Table>
          <Table.Head>
            <Table.TextHeaderCell flexGrow={3} flexShrink={3}>
              Release
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexGrow={2} flexShrink={2}>
              Released By
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Started</Table.TextHeaderCell>
            <Table.TextHeaderCell>Device Count</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {releases.map(release => (
              <Table.Row
                key={release.id}
                isSelectable
                onSelect={() => setSelectedRelease(release)}
              >
                <Table.TextCell flexGrow={3} flexShrink={3}>
                  {release.id}
                </Table.TextCell>
                <Table.TextCell flexGrow={2} flexShrink={2}>
                  {this.getReleasedBy(release)}
                </Table.TextCell>
                <Table.TextCell>
                  {moment(release.createdAt).fromNow()}
                </Table.TextCell>
                <Table.TextCell>{release.deviceCounts.allCount}</Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
      <Dialog show={!!selectedRelease} onClose={() => setSelectedRelease(null)}>
        <Release release={selectedRelease} />
      </Dialog>
    </>
  );
};

export default Releases;

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

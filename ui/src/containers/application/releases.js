import React, { useState } from 'react';
import moment from 'moment';
import { Table, Alert } from 'evergreen-ui';

import Editor from '../../components/editor';
import Card from '../../components/card';
import Dialog from '../../components/dialog';
import { Text, Button, Link } from '../../components/core';
import Release from './release';

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

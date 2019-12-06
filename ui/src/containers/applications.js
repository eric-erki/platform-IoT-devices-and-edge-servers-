import React from 'react';
import { Table } from 'evergreen-ui';
import moment from 'moment';
import { useNavigation } from 'react-navi';

import Layout from '../components/layout';
import Card from '../components/card';

const Applications = ({
  route: {
    data: { params, applications },
  },
}) => {
  const navigation = useNavigation();
  return (
    <Layout title="Applications">
      <Card
        title="Applications"
        size="full"
        actions={[{ title: 'Create Application', href: 'create' }]}
      >
        <Table>
          <Table.Head>
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>Last Release</Table.TextHeaderCell>
            <Table.TextHeaderCell>Device Count</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {applications.map(application => (
              <Table.Row
                key={application.id}
                isSelectable
                onSelect={() =>
                  navigation.navigate(
                    `/${params.project}/applications/${application.name}`
                  )
                }
              >
                <Table.TextCell>{application.name}</Table.TextCell>
                <Table.TextCell>
                  {application.latestRelease
                    ? moment(application.latestRelease.createdAt).fromNow()
                    : '-'}
                </Table.TextCell>
                <Table.TextCell>
                  {application.deviceCounts.allCount}
                </Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </Layout>
  );
};

export default Applications;

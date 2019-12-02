import React from 'react';
import { Table } from 'evergreen-ui';
import { useNavigation, useCurrentRoute } from 'react-navi';

import Layout from '../components/layout';
import Card from '../components/card';

const Projects = ({
  route: {
    data: { projects },
  },
}) => {
  const navigation = useNavigation();

  return (
    <Layout title="Select project" alignItems="center">
      <Card
        size="full"
        title="Projects"
        actions={[
          {
            href: '/projects/create',
            title: 'Create',
            variant: 'primary',
          },
        ]}
      >
        <Table background="white">
          <Table.Head>
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>Devices</Table.TextHeaderCell>
            <Table.TextHeaderCell>Applications</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {projects.map(({ id, name, deviceCounts, applicationCounts }) => (
              <Table.Row
                key={id}
                isSelectable
                onSelect={() => navigation.navigate(`/${name}`)}
              >
                <Table.TextCell>{name}</Table.TextCell>
                <Table.TextCell>{deviceCounts.allCount}</Table.TextCell>
                <Table.TextCell>{applicationCounts.allCount}</Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </Layout>
  );
};

export default Projects;

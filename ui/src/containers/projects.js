import React, { useMemo } from 'react';
import { useNavigation } from 'react-navi';

import Layout from '../components/layout';
import Card from '../components/card';
import Table from '../components/table';

const Projects = ({
  route: {
    data: { projects },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        style: {
          flex: 2,
        },
      },
      {
        Header: 'Devices',
        accessor: 'deviceCounts.allCount',
      },
      {
        Header: 'Applications',
        accessor: 'applicationCounts.allCount',
      },
    ],
    []
  );
  const tableData = useMemo(() => projects, [projects]);

  return (
    <Layout alignItems="center">
      <Card
        title="Projects"
        size="xlarge"
        actions={[
          {
            href: '/projects/create',
            title: 'Create Project',
          },
        ]}
      >
        <Table
          columns={columns}
          data={tableData}
          onRowSelect={({ name }) => navigation.navigate(`${name}`)}
          placeholder="No Projects found."
        />
      </Card>
    </Layout>
  );
};

export default Projects;

import React, { useMemo } from 'react';
import moment from 'moment';
import { useNavigation } from 'react-navi';

import Layout from '../components/layout';
import Card from '../components/card';
import Table from '../components/table';

const Applications = ({
  route: {
    data: { params, applications },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      {
        Header: 'Last Release',
        Cell: ({ row: { original } }) =>
          original.latestRelease
            ? moment(original.latestRelease.createdAt).fromNow()
            : '-',
      },
      {
        Header: 'Device Count',
        accessor: 'deviceCounts.allCount',
      },
    ],
    []
  );
  const tableData = useMemo(() => applications, [applications]);
  return (
    <Layout title="Applications" alignItems="center">
      <Card
        title="Applications"
        size="xlarge"
        actions={[{ title: 'Create Application', href: 'create' }]}
      >
        <Table
          columns={columns}
          data={tableData}
          onRowSelect={row =>
            navigation.navigate(`/${params.project}/applications/${row.name}`)
          }
          placeholder="No Applications have been created."
        />
      </Card>
    </Layout>
  );
};

export default Applications;

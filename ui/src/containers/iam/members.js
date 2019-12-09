import React, { useMemo } from 'react';
import { useNavigation } from 'react-navi';

import { Table } from 'evergreen-ui';

import Card from '../../components/card';

const Members = ({
  route: {
    data: { params, members },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(
    () => [
      { Header: 'Email', accessor: 'email' },
      { Header: 'Name', accessor: 'name' },
      {
        Header: 'Roles',
        Cell: ({ roles }) => roles.map(({ name }) => name).join(','),
      },
    ],
    []
  );
  const tableData = useMemo(() => members, [members]);

  return (
    <Card
      title="Members"
      size="large"
      actions={[{ href: 'add', title: 'Add member' }]}
    >
      <Table
        columns={columns}
        data={tableData}
        onRowSelect={({ name }) =>
          navigation.navigate(`/${params.project}/iam/roles/${name}`)
        }
      />
    </Card>
  );
};

export default Members;

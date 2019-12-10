import React, { useMemo } from 'react';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Table from '../../components/table';

const ServiceAccounts = ({
  route: {
    data: { params, serviceAccounts },
  },
}) => {
  const navigation = useNavigation();
  const columns = useMemo(() => [{ Header: 'Name', accessor: 'name' }], []);
  const tableData = useMemo(() => serviceAccounts, [serviceAccounts]);

  return (
    <Card
      title="Service Accounts"
      size="large"
      actions={[
        {
          href: `create`,
          title: 'Create service account',
        },
      ]}
    >
      <Table
        columns={columns}
        data={tableData}
        onRowSelect={({ name }) =>
          navigation.navigate(`/${params.project}/iam/service-accounts/${name}`)
        }
      />
    </Card>
  );
};

export default ServiceAccounts;

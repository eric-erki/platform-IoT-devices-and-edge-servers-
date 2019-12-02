import React from 'react';
import { useNavigation } from 'react-navi';
import { Table } from 'evergreen-ui';

import Card from '../../components/card';

const ServiceAccounts = ({
  route: {
    data: { params, serviceAccounts },
  },
}) => {
  const navigation = useNavigation();

  return (
    <Card
      title="Service accounts"
      size="large"
      actions={[
        {
          href: `create`,
          title: 'Create service account',
        },
      ]}
    >
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>Service Account</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {serviceAccounts.map(serviceAccount => (
            <Table.Row
              key={serviceAccount.id}
              isSelectable
              onSelect={() => navigation.navigate(serviceAccount.name)}
            >
              <Table.TextCell>{serviceAccount.name}</Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

export default ServiceAccounts;

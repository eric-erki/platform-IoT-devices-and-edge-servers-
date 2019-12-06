import React from 'react';
import { Table } from 'evergreen-ui';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';

const Roles = ({
  route: {
    data: { params, roles },
  },
}) => {
  const navigation = useNavigation();

  return (
    <Card
      title="Roles"
      size="large"
      actions={[
        {
          href: `create`,
          title: 'Create role',
        },
      ]}
    >
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {roles.map(role => (
            <Table.Row
              key={role.id}
              isSelectable
              onSelect={() =>
                navigation.navigate(`/${params.project}/iam/roles/${role.name}`)
              }
            >
              <Table.TextCell>{role.name}</Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

export default Roles;

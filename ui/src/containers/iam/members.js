import React from 'react';
import { useNavigation } from 'react-navi';

import { Table } from 'evergreen-ui';

import Card from '../../components/card';

const Members = ({
  route: {
    data: { members },
  },
}) => {
  const navigation = useNavigation();
  return (
    <Card
      title="Members"
      size="large"
      actions={[{ href: 'add', title: 'Add member' }]}
    >
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>Email</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Roles</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {members.map(member => (
            <Table.Row
              key={member.userId}
              isSelectable
              onSelect={() => navigation.navigate(`members/${member.userId}`)}
            >
              <Table.TextCell>{member.user.email}</Table.TextCell>
              <Table.TextCell>{`${member.user.firstName} ${member.user.lastName}`}</Table.TextCell>
              <Table.TextCell>
                {member.roles.map(role => role.name).join(',')}
              </Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

export default Members;

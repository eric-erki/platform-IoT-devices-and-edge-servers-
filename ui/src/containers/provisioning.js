import React, { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import { useNavigation } from 'react-navi';

import { labelColors } from '../theme';
import { buildLabelColorMap, renderLabels } from '../helpers/labels';
import Layout from '../components/layout';
import Card from '../components/card';
import Table from '../components/table';

const Provisioning = ({
  route: {
    data: { params, deviceRegistrationTokens },
  },
}) => {
  const navigation = useNavigation();
  const [labelColorMap, setLabelColorMap] = useState();
  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      {
        Header: 'Created At',
        Cell: ({ row }) =>
          row.createdAt ? moment(row.createdAt).fromNow() : '-',
      },
      {
        Header: 'Devices Registered',
        accessor: 'deviceCounts.allCount',
      },
      {
        Header: 'Registration Limit',
        Cell: ({ row }) =>
          typeof row.maxRegistrations === 'number'
            ? row.maxRegistrations
            : 'Unlimited',
      },
      {
        Header: 'Labels',
        Cell: ({ row }) =>
          row.labels ? renderLabels(row.labels, labelColorMap) : null,
      },
    ],
    []
  );
  const tableData = useMemo(() => deviceRegistrationTokens, [
    deviceRegistrationTokens,
  ]);

  useEffect(() => {
    setLabelColorMap(
      buildLabelColorMap({}, labelColors, deviceRegistrationTokens)
    );
  }, []);

  return (
    <Layout title="Provisioning">
      <Card
        title="Device Registration Tokens"
        size="full"
        actions={[
          {
            href: 'device-registration-tokens/create',
            title: 'Create Device Registration Token',
          },
        ]}
      >
        <Table data={tableData} columns={columns} />
        {/* {deviceRegistrationTokens.map(token => (
              <Table.Row
                key={token.id}
                isSelectable
                flexGrow={1}
                height="auto"
                paddingY={majorScale(1)}
                alignItems="flex-start"
              >
                <Table.TextCell flexBasis={100}>{token.name}</Table.TextCell>
                <Table.TextCell flexBasis={50}>
                  
                </Table.TextCell>
                <Table.TextCell flexBasis={50}>
                  {token.deviceCounts.allCount}
                </Table.TextCell>
                <Table.TextCell flexBasis={50}>
                 
                </Table.TextCell>
                <Table.TextCell flexBasis={150}>
                  
                </Table.TextCell>
              </Table.Row>
            ))} */}
      </Card>
    </Layout>
  );
};

export default Provisioning;

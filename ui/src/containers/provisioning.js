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
        Cell: ({ row: { original } }) =>
          original.createdAt ? moment(original.createdAt).fromNow() : '-',
      },
      {
        Header: 'Devices Registered',
        accessor: 'deviceCounts.allCount',
      },
      {
        Header: 'Registration Limit',
        Cell: ({ row: { original } }) =>
          typeof original.maxRegistrations === 'number'
            ? original.maxRegistrations
            : 'Unlimited',
      },
      {
        Header: 'Labels',
        Cell: ({ row: { original } }) =>
          original.labels ? renderLabels(original.labels, labelColorMap) : null,
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
        <Table
          data={tableData}
          columns={columns}
          onRowSelect={({ name }) =>
            navigation.navigate(
              `/${params.project}/provisioning/device-registration-tokens/${name}`
            )
          }
          placeholder="No Device Registration Tokens have been created yet."
        />
      </Card>
    </Layout>
  );
};

export default Provisioning;

import React from 'react';

import Editor from '../../components/editor';
import Card from '../../components/card';
import { Column, Text, Link, Label, Value } from '../../components/core';
import { DevicesFilterButtons } from '../../components/DevicesFilterButtons';

const ApplicationOverview = ({
  route: {
    data: {
      params,
      application: { description, latestRelease, name, schedulingRule },
    },
  },
}) => {
  return (
    <Card size="large">
      <Column marginBottom={5}>
        <Text fontSize={6} fontWeight={3}>
          {name}
        </Text>
        <Text fontWeight={3} opacity={0.8}>
          {description}
        </Text>
      </Column>
      <Column marginBottom={6}>
        <Label>Scheduling Rule</Label>
        {schedulingRule.length ? (
          <DevicesFilterButtons
            query={schedulingRule}
            canRemoveFilter={false}
          />
        ) : (
          <Value>
            No scheduling rule set. You can set one in the{' '}
            <Link href={`/${params.project}/applications/${name}/scheduling`}>
              scheduling
            </Link>{' '}
            page.
          </Value>
        )}
      </Column>

      {latestRelease ? (
        <>
          <Column marginBottom={6}>
            <Label>Current Release ID</Label>
            <Link
              href={`/${params.project}/applications/${name}/releases/${latestRelease.id}`}
            >
              {latestRelease.id}
            </Link>
          </Column>

          <Column>
            <Label>Current Release Config</Label>
            <Editor
              width="100%"
              height="150px"
              value={latestRelease.rawConfig}
              readOnly
            />
          </Column>
        </>
      ) : (
        <Column>
          <Label>Current Release</Label>
          <Value>
            Create your first release on the{' '}
            <Link href={`/${params.project}/applications/${name}/releases`}>
              releases
            </Link>{' '}
            page.
          </Value>
        </Column>
      )}
    </Card>
  );
};

export default ApplicationOverview;

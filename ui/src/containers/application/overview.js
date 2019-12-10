import React from 'react';

import Editor from '../../components/editor';
import Card from '../../components/card';
import { Column, Text, Link, Heading } from '../../components/core';
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
      <Column marginBottom={4}>
        <Text fontSize={6} fontWeight={3}>
          {name}
        </Text>
        <Text fontWeight={3} opacity={0.8}>
          {description}
        </Text>
      </Column>
      <Column marginBottom={4}>
        <Text fontWeight={3} marginBottom={2}>
          Scheduling Rule
        </Text>
        {schedulingRule.length ? (
          <DevicesFilterButtons
            query={schedulingRule}
            canRemoveFilter={false}
          />
        ) : (
          <Text>
            No scheduling rule set. You can set one in the{' '}
            <Link href={`/${params.project}/applications/${name}/scheduling`}>
              scheduling
            </Link>{' '}
            page.
          </Text>
        )}
      </Column>

      <Column>
        <Text fontSize={4} fontWeight={3} marginBottom={2}>
          Current Release
        </Text>
      </Column>

      {latestRelease ? (
        <>
          <Column marginBottom={4}>
            <Text fontWeight={3} marginBottom={2}>
              ID
            </Text>
            <Link
              href={`/${params.project}/applications/${name}/releases/${latestRelease.id}`}
            >
              {latestRelease.id}
            </Link>
          </Column>

          <Column marginBottom={4}>
            <Text fontWeight={3} marginBottom={2}>
              Config
            </Text>
            <Editor
              width="100%"
              height="150px"
              value={latestRelease.rawConfig}
              readOnly
            />
          </Column>
        </>
      ) : (
        <Text>
          There are no releases. Create one on the{' '}
          <Link href={`/${params.project}/applications/${name}/releases`}>
            releases
          </Link>{' '}
          page.
        </Text>
      )}
    </Card>
  );
};

export default ApplicationOverview;

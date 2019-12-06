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
    <Card>
      <Column marginBottom={4}>
        <Heading>{name}</Heading>
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
            <Link href="scheduling">scheduling</Link> page.
          </Text>
        )}
      </Column>

      {latestRelease && (
        <>
          <Column marginBottom={4}>
            <Text fontWeight={3} marginBottom={2}>
              Current Release Name
            </Text>
            <Link
              href={`/${params.project}/applications/${name}/releases/${latestRelease.name}`}
            >
              {latestRelease.name}
            </Link>
          </Column>

          <Column marginBottom={4}>
            <Text fontWeight={3} marginBottom={2}>
              Current Release Config
            </Text>
            <Editor
              width="100%"
              height="150px"
              value={latestRelease.rawConfig}
              readOnly
            />
          </Column>
        </>
      )}
    </Card>
  );
};

export default ApplicationOverview;

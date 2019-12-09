// @ts-nocheck

import React from 'react';
import {
  Icon,
  // @ts-ignore
} from 'evergreen-ui';
import {
  Query,
  Condition,
  LabelValueCondition,
  LabelValueConditionParams,
  LabelExistenceCondition,
  LabelExistenceConditionParams,
  DevicePropertyCondition,
  DevicePropertyConditionParams,
} from './DevicesFilter';

import { Row, Text } from './core';

interface Props {
  query: Query;
  canRemoveFilter: boolean;
  removeFilter?: (index: number) => void;
}

interface State {}

const ConditionComp = ({ type, params }) => {
  switch (type) {
    case LabelValueCondition:
      return (
        <>
          <Text fontWeight={4} marginRight={2}>
            {params.key}
          </Text>

          <Text fontWeight={3} marginRight={2}>
            {params.operator}
          </Text>

          <Text fontWeight={4}>{params.value}</Text>
        </>
      );
    case LabelExistenceCondition:
      return (
        <>
          <Text fontWeight={4} marginRight={2}>
            {params.key}
          </Text>

          <Text fontWeight={500} marginRight={2}>
            {params.operator}
          </Text>
        </>
      );
    case DevicePropertyCondition:
      return (
        <>
          <Text
            fontWeight={4}
            marginRight={2}
            css={{ textTransform: 'capitalize' }}
          >
            {params.property}
          </Text>

          <Text fontWeight={500} marginRight={2}>
            {params.operator}
          </Text>

          <Text style={{ textTransform: 'capitalize' }} fontWeight={4}>
            {params.value}
          </Text>
        </>
      );
    default:
      return (
        <Text
          fontWeight={500}
          marginRight={2}
          style={{ textTransform: 'capitalize' }}
        >
          Error rendering label.
        </Text>
      );
  }
};

export const DevicesFilterButtons = ({
  query,
  removeFilter,
  canRemoveFilter,
}) => {
  return (
    <Row paddingX={4} paddingBottom={4} flexWrap="wrap" padding={5}>
      {query.map((filter, index) => (
        <Row alignItems="center" key={index} margin={3}>
          <Row bg="#B7D4EF" borderRadius={3} padding={2} alignItems="center">
            {filter.map((condition, i) => (
              <React.Fragment key={i}>
                <ConditionComp {...condition} />
                {i < filter.length - 1 && (
                  <Text fontSize={0} fontWeight={4} marginX={4}>
                    OR
                  </Text>
                )}
              </React.Fragment>
            ))}
            {canRemoveFilter && (
              <Icon
                marginLeft={4}
                icon="cross"
                cursor="pointer"
                color="white"
                size={14}
                onClick={() => (removeFilter ? removeFilter(index) : null)}
              />
            )}
          </Row>
        </Row>
      ))}
    </Row>
  );
};

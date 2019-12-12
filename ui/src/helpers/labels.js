import React from 'react';

import { Row, Box } from '../components/core';

export function buildLabelColorMap(oldLabelColorMap, labelColors, items) {
  var x = [];
  items.forEach(item => {
    Object.keys(item.labels).forEach(label => {
      x.push(label);
    });
  });
  const labelKeys = [...new Set(x)].sort();

  var labelColorMap = Object.assign({}, oldLabelColorMap);
  labelKeys.forEach((key, i) => {
    if (!labelColorMap[key]) {
      labelColorMap[key] = labelColors[i % (labelColors.length - 1)];
    }
  });
  return labelColorMap;
}

export function renderLabels(labels, labelColorMap) {
  return (
    <Row flexWrap="wrap">
      {Object.keys(labels).map((key, i) => (
        <Row marginRight={2} marginY={2} overflow="hidden" key={key}>
          <Box
            backgroundColor={labelColorMap[key]}
            paddingX={6}
            paddingY={2}
            color="white"
            borderTopLeftRadius={3}
            borderBottomLeftRadius={3}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {key}
          </Box>
          <Box
            backgroundColor="grays.10"
            paddingX={6}
            paddingY={2}
            borderTopRightRadius={3}
            borderBottomRightRadius={3}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {labels[key]}
          </Box>
        </Row>
      ))}
    </Row>
  );
}

import React from 'react';
import styled from 'styled-components';
import { variant } from 'styled-system';

import Logo from './icons/logo';
import { Column, Row, Text, Button, Link } from './core';

const Container = styled(Column)`
  ${variant({
    variants: {
      small: {
        width: 9,
      },
      medium: {
        width: 11,
        boxShadow: 1,
      },
      large: {
        width: 13,
        boxShadow: 1,
      },
      full: {
        width: 'unset',
        alignSelf: 'stretch',
      },
    },
  })}
`;

const Card = ({
  size = 'medium',
  title,
  top = null,
  border = false,
  logo,
  actions = [],
  children,
}) => {
  return (
    <Container
      bg="black"
      color="white"
      variant={size}
      borderRadius={2}
      padding={6}
      border={border ? 0 : undefined}
      borderColor="white"
      boxShadow={1}
    >
      {logo && (
        <Link href="https://deviceplane.com" marginX="auto" marginBottom={6}>
          <Logo size={50} />
        </Link>
      )}
      {top}
      {title && (
        <Row
          justifyContent="space-between"
          alignItems="flex-end"
          marginBottom={5}
          borderColor="white"
        >
          <Text fontSize={5} fontWeight={3}>
            {title}
          </Text>
          <Row>
            {actions.map(
              ({ href, variant = 'primary', title, onClick, show = true }) =>
                show && (
                  <Button
                    key={title}
                    title={title}
                    href={href}
                    variant={variant}
                    onClick={onClick}
                    marginLeft={4}
                  />
                )
            )}
          </Row>
        </Row>
      )}
      {children}
    </Container>
  );
};

export default Card;

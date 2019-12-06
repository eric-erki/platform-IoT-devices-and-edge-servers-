import React from 'react';
import styled from 'styled-components';
import { useActive, useLinkProps } from 'react-navi';

import { Row } from './core';

const Container = styled(Row)``;

const styles = `
    appearance: none;
    border: none;
    outline: none;
    text-decoration: none;
    border-radius: 0;
    background-color: transparent;
    transition: background-color 250ms;
    border-radius: 4px;
    padding: 8px;
    user-select: none;
    font-weight: 500;

    &:hover {
        background-color: black;
    }
    &:not(:last-child) {
        margin-right: 18px;
    }
`;

const LinkTab = styled.a`
  ${styles}

  color: ${props => (props.active ? '#57e3ff' : 'white')};
  background-color: ${props => (props.active ? 'black' : 'transparent')};
  cursor: ${props => (props.active ? 'default' : 'pointer')};
`;

const ButtonTab = styled.button`
  ${styles}

  color: ${props => (props.active ? '#57e3ff' : 'white')};
  background-color: ${props => (props.active ? 'black' : 'transparent')};
  cursor: ${props => (props.active ? 'default' : 'pointer')};
`;

const Tab = ({ title, href, onClick, active = true }) => {
  if (href) {
    return (
      <LinkTab
        {...useLinkProps({ href })}
        active={useActive(href, { exact: false })}
      >
        {title}
      </LinkTab>
    );
  }

  return (
    <ButtonTab onClick={onClick} active={active}>
      {title}
    </ButtonTab>
  );
};

const Tabs = ({ content = [] }) => {
  return (
    <Container>
      {content.map(tab => (
        <Tab key={tab.title} {...tab} />
      ))}
    </Container>
  );
};

export default Tabs;

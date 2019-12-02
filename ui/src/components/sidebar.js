import React from 'react';
import styled from 'styled-components';
import { useActive, useCurrentRoute } from 'react-navi';
import { Icon } from 'evergreen-ui';

import Logo from './icons/logo';
import { Row, Column, Link, Text } from './core';

const links = [
  {
    title: 'Devices',
    icon: 'desktop',
    to: '/devices',
  },
  {
    title: 'Provisioning',
    icon: 'box',
    to: '/provisioning',
  },
  {
    title: 'Applications',
    icon: 'application',
    to: '/applications',
  },
  {
    title: 'IAM',
    icon: 'user',
    to: '/iam',
  },
  {
    title: 'Settings',
    icon: 'settings',
    to: '/settings',
  },
];

const SidebarLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 250ms;
  border-radius: 4px;

  background-color: ${props => (props.active ? '#181818' : 'inherit')};
  color: ${props => (props.active ? '#57e3ff' : '#fff')};

  &:hover {
    background-color: #181818;
  }

  & > div > svg {
    fill: ${props => (props.active ? '#57e3ff' : '#fff')} !important;
  }

  &:last-child {
    margin-top: auto;
  }
`;

const Sidebar = () => {
  const route = useCurrentRoute();

  if (!route) {
    return null;
  }

  const projectSelected = !!route.data.params.project;

  return (
    <Column width={138} alignSelf="stretch" bg="black" alignItems="center">
      <Row paddingY={4}>
        <Link href="/">
          <Logo />
        </Link>
      </Row>
      {projectSelected &&
        links.map(({ to, title, icon }) => {
          const href = `/${route.data.params.project}${to}`;

          return (
            <SidebarLink
              href={href}
              width={8}
              paddingY={4}
              marginBottom={1}
              key={title}
              color="white"
              fontWeight={2}
              active={useActive(href, { exact: false })}
            >
              <Column alignItems="center">
                <Icon icon={icon} color="white" size={18} />
                <Text marginTop={2}>{title}</Text>
              </Column>
            </SidebarLink>
          );
        })}
    </Column>
  );
};

export default Sidebar;

import React from 'react';
import styled from 'styled-components';
import { space, layout, color, border, typography } from 'styled-system';
import { useNavigation, useActive, useCurrentRoute } from 'react-navi';

import { Row, Text } from './core';
import Popup from './popup';
import Popover from './popover';
import Avatar from './avatar';
import CliDownload from '../containers/cli-download';
import ChangePassword from '../containers/change-password';
import Profile from '../containers/profile';
import UserAccessKeys from '../containers/user-access-keys';
import api from '../api';

const MenuItem = styled.button`
  background: none;
  appearance: none;
  cursor: pointer;
  border: none;
  text-align: left;
  margin: 0;
  padding: 0;

  &:hover {
    background-color: #181818;
  }
  ${space} ${layout} ${color} ${border} ${typography}
`;

MenuItem.defaultProps = {
  paddingY: 1,
  color: 'white',
  fontSize: 2,
  paddingX: 3,
  marginX: 1,
  borderRadius: 1,
};

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  margin: 8px 0;
`;

const AvatarMenu = () => {
  const {
    data: {
      context: { currentUser },
    },
  } = useCurrentRoute();
  const [showCLI, setShowCLI] = React.useState();
  const [showUserProfile, setShowUserProfile] = React.useState();
  const [showUserAccessKeys, setShowUserAccessKeys] = React.useState();
  const [showChangePassword, setShowChangePassword] = React.useState();
  const navigation = useNavigation();
  const name = `${currentUser.firstName} ${currentUser.lastName}`;

  return (
    <>
      <Popup show={showCLI} onClose={() => setShowCLI(false)}>
        <CliDownload />
      </Popup>
      <Popup show={showUserProfile} onClose={() => setShowUserProfile(false)}>
        <Profile user={currentUser} close={() => setShowUserProfile(false)} />
      </Popup>
      <Popup
        show={showUserAccessKeys}
        onClose={() => setShowUserAccessKeys(false)}
      >
        <UserAccessKeys user={currentUser} />
      </Popup>
      <Popup
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      >
        <ChangePassword
          user={currentUser}
          close={() => setShowChangePassword(false)}
        />
      </Popup>
      <Popover
        content={({ close }) => (
          <>
            <Text
              fontSize={4}
              fontWeight={3}
              paddingX={3}
              marginX={1}
              paddingTop={2}
            >
              {name}
            </Text>
            <Text
              fontSize={2}
              marginBottom={1}
              paddingX={3}
              marginX={1}
              opacity={0.8}
            >
              {currentUser.email}
            </Text>
            <Divider />
            <MenuItem
              onClick={() => {
                close();
                setShowUserProfile(true);
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                close();
                setShowChangePassword(true);
              }}
            >
              Change Password
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                close();
                setShowUserAccessKeys(true);
              }}
            >
              Manage Access Keys
            </MenuItem>
            <MenuItem
              onClick={() => {
                close();
                setShowCLI(true);
              }}
            >
              Download CLI
            </MenuItem>
            <Divider />
            {!useActive('/projects') && (
              <MenuItem onClick={() => navigation.navigate('/projects')}>
                Switch Project
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                navigation.navigate('/login');
                api.logout();
              }}
              paddingBottom={3}
              marginBottom={2}
            >
              Logout
            </MenuItem>
          </>
        )}
      >
        <Row alignItems="center">
          <Avatar name={name} />
        </Row>
      </Popover>
    </>
  );
};

export default AvatarMenu;

import React from 'react';
import styled from 'styled-components';
import { space, layout, color, border, typography } from 'styled-system';
import { useNavigation } from 'react-navi';
import { useSelector, useDispatch } from 'react-redux';

import { logout } from '../actions';
import { Row, Text } from './core';
import Dialog from './dialog';
import Popover from './popover';
import Avatar from './avatar';
import CliDownload from './cli-download';
import ChangePassword from './change-password';
import EditProfile from './edit-profile';
import UserAccessKeys from './user-access-keys';

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
  const [showCLI, setShowCLI] = React.useState();
  const [showEditProfile, setShowEditProfile] = React.useState();
  const [showUserAccessKeys, setShowUserAccessKeys] = React.useState();
  const [showChangePassword, setShowChangePassword] = React.useState();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.user);
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <>
      <Dialog show={showCLI} onClose={() => setShowCLI(false)}>
        <CliDownload />
      </Dialog>
      <Dialog show={showEditProfile} onClose={() => setShowEditProfile(false)}>
        <EditProfile user={user} />
      </Dialog>
      <Dialog
        show={showUserAccessKeys}
        onClose={() => setShowUserAccessKeys(false)}
      >
        <UserAccessKeys user={user} />
      </Dialog>
      <Dialog
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      >
        <ChangePassword user={user} />
      </Dialog>
      <Popover
        content={({ close }) => (
          <>
            <Text
              fontSize={4}
              fontWeight={3}
              color="white"
              paddingX={3}
              marginX={1}
              paddingTop={2}
            >
              {name}
            </Text>
            <Text
              fontSize={2}
              color="white"
              marginBottom={1}
              paddingX={3}
              marginX={1}
              opacity={0.8}
            >
              {user.email}
            </Text>
            <Divider />
            <MenuItem
              onClick={() => {
                close();
                setShowEditProfile(true);
              }}
            >
              Edit Profile
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
            <MenuItem onClick={() => navigation.navigate('/projects')}>
              Switch Project
            </MenuItem>
            <MenuItem
              onClick={async () => {
                await navigation.navigate('/login');
                dispatch(logout);
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

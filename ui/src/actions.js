import { createAction } from '@reduxjs/toolkit';

import segment from './lib/segment';
import api from './api';
import storage from './storage';

export const setUser = createAction('SET_USER');

export const setProject = createAction('SET_PROJECT');

export const login = credentials => dispatch =>
  api.login(credentials).then(() =>
    api.user().then(({ data: user }) => {
      storage.set('user', user);
      segment.identify(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      dispatch(setUser(user));
    })
  );

export const logout = dispatch => {
  storage.remove('user');
  dispatch(setUser(null));
  return api.logout();
};

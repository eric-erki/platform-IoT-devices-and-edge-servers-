import { configureStore, createReducer } from '@reduxjs/toolkit';

import * as actions from './actions';
import storage from './storage';

const initialState = {
  user: storage.get('user'),
};

const reducer = createReducer(initialState, {
  [actions.setUser]: (state, action) => {
    state.user = action.payload;
  },
  [actions.setProject]: (state, action) => {
    state.project = action.payload;
  },
});

const store = configureStore({ reducer });

export default store;

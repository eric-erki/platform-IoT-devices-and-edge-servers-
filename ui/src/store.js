import { configureStore, createReducer } from '@reduxjs/toolkit';

import * as actions from './actions';

const initialState = {};

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

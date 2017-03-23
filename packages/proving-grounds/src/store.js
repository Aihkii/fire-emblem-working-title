// @flow
import { createStore } from 'redux';

import reducer from './reducer';
import type { HeroInstance } from './heroHelpers';

export type State = {
  host: string;
  activeHero: ?HeroInstance;
  activeSlot: 0 | 1 | void;
  leftHero: ?HeroInstance;
  rightHero: ?HeroInstance;
  searchString: string;
};

const emptyState: State = {
  activeHero: undefined,
  activeSlot: undefined,
  host: '',
  leftHero: undefined,
  rightHero: undefined,
  searchString: '',
};

const initStore = (initialState: State = emptyState) => {
  return createStore(reducer, initialState);
};

export default initStore;

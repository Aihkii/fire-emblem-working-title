// @flow
import {
  compose,
  filter,
  flatten,
  map,
  prop,
} from 'ramda';

import event1 from './2017.03.25-michalis';
import event2 from './2017.04.04-navarre';


export function getEventHeroes() {
  const now = new Date();
  return compose(
    flatten,
    map(prop('unitList')),
    filter((event) => now >= event.startTime && now <= event.endTime),
  )([event1, event2]);
}

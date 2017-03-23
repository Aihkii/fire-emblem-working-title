// @flow
import {
  compose,
  filter,
  find,
  indexBy,
  isNil,
  map,
  not,
  pathOr,
  propEq,
  test,
} from 'ramda';
import stats from 'fire-emblem-heroes-stats';
import type {
  Hero,
  AssistSkill,
  // MoveType,
  PassiveSkill,
  SpecialSkill,
  Skill,
  WeaponSkill,
  // WeaponType,
} from 'fire-emblem-heroes-stats';

import { getSkillInfo } from './skillHelpers';


export type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';

export type Rarity = 1 | 2 | 3 | 4 | 5;

export type InstanceSkills = {
  weapon: ?WeaponSkill;
  assist: ?AssistSkill;
  special: ?SpecialSkill;
  passiveA: ?PassiveSkill;
  passiveB: ?PassiveSkill;
  passiveC: ?PassiveSkill;
};

export type HeroInstance = {
  // custom: false,
  name: string;
  rarity: Rarity;
  boon: ?Stat;
  bane: ?Stat;
  skills: InstanceSkills;
};

// NOT USED YET: Just conjecture for potential future support of
// user custom unit creation.

// export type CustomHero = {
//   custom: true,
//   weaponType: WeaponType,
//   moveType: MoveType,
//   name: string;
//   hp: number;
//   atk: number;
//   spd: number;
//   def: number;
//   res: number;
//   weapon: WeaponSkill;
//   assist: AssistSkill;
//   special: SpecialSkill;
//   passiveA: PassiveSkill;
//   passiveB: PassiveSkill;
//   passiveC: PassiveSkill;
// };

export const lookupStats = (name: string): Hero => {
  // $FlowIssue: Flowtype for find is too generic
  const hero: ?Hero = find(propEq('name', name), stats.heroes);
  return hero || {
    name,
    weaponType: 'Red Sword',
    stats: { '1': {}, '40': {} },
    skills: [],
    moveType: 'Infantry',
    total: 0,
  };
};

// Returns a map from skill type to the name of the skill.
export function getDefaultSkills(name: string, rarity: 1 | 2 | 3 | 4 | 5): InstanceSkills {
  const hero = lookupStats(name);

  const skillKeys = {
    WEAPON: 'weapon',
    ASSIST: 'assist',
    SPECIAL: 'special',
    // TODO: We aren't splitting passives by slot yet.
    PASSIVE: 'passiveC',
  };

  // Flow can't follow this compose chain, so cast it to any.
  const skillsByType = (compose(
    indexBy((skill: Skill) => skillKeys[skill.type]),
    filter(compose(not, isNil)),
    map(skill => getSkillInfo(skill.name)),
    filter(skill => (skill.rarity == null || skill.rarity === '-' || skill.rarity <= rarity)),
  )(hero.skills): any);

  return {
    weapon: undefined,
    assist: undefined,
    special: undefined,
    passiveA: undefined,
    passiveB: undefined,
    passiveC: undefined,
    ...skillsByType,
  };
}

export const hasBraveWeapon: (instance: HeroInstance) => boolean = compose(
  test(/Brave|Dire/),
  pathOr('', ['weapon', 'name']),
);

/**
 * A helper for getting a stat value from a hero by key.
 * Defaults to level 40, 5 star, baseline variant.
 *
 * @param {*} hero Hero to look up stat on
 * @param {*} statKey Key of the stat to look up
 * @param {*} level Which level version of stat to look up
 * @param {*} rarity Which rarity version of stat to look up
 * @param {*} variance Which variant ('low', 'normal', 'high') to look up
 * @returns number the value of the stat
 */
export const getStat = (
  instance: HeroInstance,
  statKey: Stat,
  level: 1 | 40 = 40,
  // rarity: '1' | '2' | '3' | '4' | '5' = '5',
  // variance: 'low' | 'normal' | 'high' = 'normal',
): number => {
  const hero = lookupStats(instance.name);
  const { rarity } = instance;
  const variance = (instance.boon === statKey
    ? 'high'
    : instance.bane === statKey
      ? 'low'
      : 'normal');

  if (level === 1) {
    const value = parseInt(hero.stats[`${level}`][rarity][statKey], 10);
    return variance === 'normal'
      ? value
      : variance === 'low'
        ? value - 1
        : value + 1;
  }

  const values = hero.stats[`${level}`][rarity][statKey];
  const [low, normal, high] = values.length <= 1
    ? ['-', ...values]
    : values;
  const baseValue = variance === 'normal'
    ? parseInt(normal, 10)
    : variance === 'low'
      ? parseInt(low, 10)
      : parseInt(high, 10);
  const skillBonus = statKey === 'atk'
    // $FlowIssue: not sure why this is throwing an error
    ? pathOr(0, ['skills', 'weapon', 'damage(mt)'], instance)
    : hasBraveWeapon(instance)
      ? -5
      : 0;

  return baseValue + skillBonus;
};

export const getRange = (instance: HeroInstance) => {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Sword':
    case 'Green Axe':
    case 'Blue Lance':
    case 'Red Beast':
    case 'Green Beast':
    case 'Blue Beast':
      return 1;
    default:
      return 2;
  }
};

export const getMitigationType = (instance: HeroInstance) => {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Tome':
    case 'Red Beast':
    case 'Green Tome':
    case 'Green Beast':
    case 'Blue Tome':
    case 'Blue Beast':
    case 'Neutral Staff':
      return 'res';
    default:
      return 'def';
  }
};

export const getWeaponColor = (instance: HeroInstance) => {
  switch (lookupStats(instance.name).weaponType) {
    case 'Red Sword':
    case 'Red Tome':
    case 'Red Beast':
      return 'RED';
    case 'Green Axe':
    case 'Green Tome':
    case 'Green Beast':
      return 'GREEN';
    case 'Blue Lance':
    case 'Blue Tome':
    case 'Blue Beast':
      return 'BLUE';
    default:
      return 'NEUTRAL';
  }
};

export const hasStatsForRarity = (hero: Hero, rarity: Rarity/* , level?: 1 | 40 */): boolean => {
  return Boolean(hero.stats['1'][`${rarity}`] && hero.stats['40'][`${rarity}`]);
};

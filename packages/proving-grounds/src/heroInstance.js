// @flow
import type {
  AssistSkill,
  PassiveSkill,
  SpecialSkill,
  WeaponSkill,
  SealSkill,
} from 'fire-emblem-heroes-stats';

import { getDefaultSkills } from './heroHelpers';


export type Stat = 'hp' | 'atk' | 'spd' | 'def' | 'res';
export type Rarity = 1 | 2 | 3 | 4 | 5;
export type MergeLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type InstanceSkills = {
  +WEAPON: ?WeaponSkill;
  +ASSIST: ?AssistSkill;
  +SPECIAL: ?SpecialSkill;
  +PASSIVE_A: ?PassiveSkill;
  +PASSIVE_B: ?PassiveSkill;
  +PASSIVE_C: ?PassiveSkill;
  +SEAL: ?SealSkill;
};

export type HeroInstance = {
  // custom: false,
  +name: string;
  +rarity: Rarity;
  +boon: ?Stat;
  +bane: ?Stat;
  +mergeLevel: MergeLevel;
  +skills: InstanceSkills;
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

export const getDefaultInstance = (name: string, rarity: Rarity = 5): HeroInstance => ({
  name: name,
  bane: null,
  boon: null,
  rarity: rarity,
  mergeLevel: 0,
  skills: getDefaultSkills(name, rarity),
});

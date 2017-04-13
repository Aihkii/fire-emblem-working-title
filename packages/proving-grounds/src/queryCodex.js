// @flow
import SHA1 from 'crypto-js/sha1';
import lzString from 'lz-string';
import stats from 'fire-emblem-heroes-stats';
import {
  assoc,
  compose,
  flatten,
  invertObj,
  map,
  prepend,
  prop,
  range,
  tail,
  take,
  zipObj,
  zipWith,
} from 'ramda';

import { getSkillInfo } from './skillHelpers';
import type { HeroInstance, Rarity } from './heroInstance';
import { getDefaultInstance } from './heroInstance';


/**
 * Flattening/Unflattening
 */

// Convert no-stat to 6 to distinguish from null-skill which is hashed as 0
// The actual value doesn't matter too much because no-variant will be USE_DEFAULT.
const NO_VARIANT = 6;
// Rarity and bane/boon will never be 7, so use 7 when a hero has a default skill.
const USE_DEFAULT = 7; 

type SerialInstance = [
  string, // name
  6 | 1 | 2 | 3 | 4 | 5, // bane
  6 | 1 | 2 | 3 | 4 | 5, // boon
  Rarity, // rarity
  ?string, // assist
  ?string, // passive a
  ?string, // passive b
  ?string, // passive c
  ?string, // special
  ?string, // weapon
];

type SerialInstanceWithDefaults = [
  string, // name
  7 | 6 | 1 | 2 | 3 | 4 | 5, // bane
  7 | 6 | 1 | 2 | 3 | 4 | 5, // boon
  7 | Rarity, // rarity
  7 | ?string, // assist
  7 | ?string, // passive a
  7 | ?string, // passive b
  7 | ?string, // passive c
  7 | ?string, // special
  7 | ?string, // weapon
];

const statKeyToId = {'hp':1, 'atk':2, 'spd':3, 'def':4, 'res':5, 'null': NO_VARIANT};
const idToStatKey = assoc(NO_VARIANT.toString(), null, invertObj(statKeyToId));

export const flattenInstance = (instance: HeroInstance): SerialInstance => [
  instance.name,
  // $FlowIssue ... Computed property cannot be accessed with ... null
  statKeyToId[instance.bane],
  // $FlowIssue ... Computed property cannot be accessed with ... null
  statKeyToId[instance.boon],
  instance.rarity,
  // I'm avoiding Ramda path() calls here, just because flow
  // does better inference this way.  :(
  instance.skills && instance.skills.ASSIST && instance.skills.ASSIST.name,
  instance.skills && instance.skills.PASSIVE_A && instance.skills.PASSIVE_A.name,
  instance.skills && instance.skills.PASSIVE_B && instance.skills.PASSIVE_B.name,
  instance.skills && instance.skills.PASSIVE_C && instance.skills.PASSIVE_C.name,
  instance.skills && instance.skills.SPECIAL && instance.skills.SPECIAL.name,
  instance.skills && instance.skills.WEAPON && instance.skills.WEAPON.name,
];

export const extractInstance = ([
  name,
  bane,
  boon,
  rarity,
  assist,
  passiveA,
  passiveB,
  passiveC,
  special,
  weapon,
// $FlowIssue bane/boon string is incompatible with ?Stat
]: SerialInstance): HeroInstance => ({
  bane: idToStatKey[bane.toString()],
  boon: idToStatKey[boon.toString()],
  name,
  rarity,
  skills: {
    // Technically, if we get bogus skill names somehow, this could
    // return a corrupt hero instance.
    WEAPON: (weapon && getSkillInfo(weapon): any),
    ASSIST: (assist && getSkillInfo(assist): any),
    SPECIAL: (special && getSkillInfo(special): any),
    PASSIVE_A: (passiveA && getSkillInfo(passiveA): any),
    PASSIVE_B: (passiveB && getSkillInfo(passiveB): any),
    PASSIVE_C: (passiveC && getSkillInfo(passiveC): any),
  },
});

// Returns a map from skill type to the name of the skill.
// Default skills are not present and null means no-skill.
export function flattenAndIgnoreDefaults(instance: HeroInstance): SerialInstanceWithDefaults {
  const flatDefault = flattenInstance(getDefaultInstance(instance.name));
  const flatInstance = flattenInstance(instance);
  // $FlowIssue ... tuple type ... is incompatible with ... array type
  return prepend(instance.name, tail(zipWith(
    (defV, actualV) => (actualV === defV ? USE_DEFAULT : actualV),
    flatDefault,
    flatInstance,
  )));
}

// Sets the defaults before copying from the flattened instance.
export function extractWithDefaults(flattenedInstance: SerialInstanceWithDefaults): HeroInstance {
  const flatDefault = flattenInstance(getDefaultInstance(flattenedInstance[0]));
  // $FlowIssue ... tuple type ... is incompatible with ... array type
  const flatInstanceWithDefaults = zipWith(
    (defV, actualV) => (actualV === USE_DEFAULT ? defV : actualV),
    flatDefault,
    flattenedInstance,
  );
  return extractInstance(flatInstanceWithDefaults);
}

/**
 * Hashing
 */

export const hash = (value: any): string => (
  value == null
    ? '0'
    : (typeof value === 'number')
      ? value
      // 36^4 possible values and 500 items hashed => 5% chance of some collision existing.
      : take(4, SHA1(value).toString())
);

const values = flatten([
  // Explicitly add `null` to the hash table.
  // This is a workaround for issue #52
  null,
  range(1, 99), // Rarity, Bane/Boon ids, and USE_DEFAULT are 1-7
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), stats.skills),
  // $FlowIssue: flowtypes for ramda aren't precise
  map(prop('name'), stats.heroes),
]);

// A map from hash(x) to x 
// $FlowIssue: flowtypes for ramda aren't precise
export const hashTable = zipObj(map(hash, values), values);

/**
 * These do everything above.
 */

export const decodeHero = (heroCode: string): ?HeroInstance => (
  heroCode
    ? compose(
      extractWithDefaults,
      map(hashedValue => hashTable[hashedValue]),
      string => string.split('+'),
      lzString.decompressFromEncodedURIComponent,
    )(heroCode)
    : undefined
);

export const encodeHero = (instance: ?HeroInstance): string => (
  instance
    ? compose(
      lzString.compressToEncodedURIComponent,
      hashes => [...hashes].join('+'),
      map(hash),
      flattenAndIgnoreDefaults,
    )(instance)
    : ''
);

// @flow
import {
  map,
  max,
  multiply,
  replace,
  test,
} from 'ramda';

import {
  getMitigationType,
  getRange,
  getSkill,
  getSpecialCooldown,
  getSpecialType,
  getStat,
  getWeaponColor,
  hasBraveWeapon,
  hasSkill,
  lookupStats,
} from './heroHelpers';
import {
  doesDefenseSpecialApply,
  getSpecialNonLethalDamageAmount,
  getSpecialBonusDamageAmount,
  getSpecialOffensiveMultiplier,
  getSpecialDefensiveMultiplier,
  getSpecialMitigationMultiplier,
} from './skillHelpers';
import type { HeroInstance } from './store';
  
const truncate = (x: number) => x >= 0 ? Math.floor(x) : Math.ceil(x);

/**
 * Formula derived from:
 * http://feheroes.wiki/Damage_Calculation#Complete_formula
 *
 * @param {number} atk Hero's attack
 * @param {number} eff Effective against bonus (e.g. Bow vs Flying Unit)
 * @param {number} adv Color advantage bonus (red > green > blue)
 * @param {number} mit Damage mitigation value (comes from resist or defence)
 * @param {number} classModifier At this time, Neutral Staff has a 0.5x net damage reduction.
 * @param {number} precombatDamage = 0;   // From AOE specials
 * @param {number} bonusDamage = 0;       // From skills like Bonfire
 * @param {number} offensiveMult = 0.0;   // From skills like Glimmer
 * @param {number} defensiveMult = 0.0;   // From skills like Aegis
 * @param {number} mitigationMult = 0.0;  // From skills like Luna
 * @returns {number} the damage a single hit will effect
 */
const dmgFormula = (
  atk: number,
  eff: number = 1.0,
  adv: number = 0.0,
  mit: number = 0,
  classModifier: number = 1.0,
  precombatDamage: number = 0,   // From AOE specials
  bonusDamage: number = 0,       // From skills like Bonfire
  offensiveMult: number = 0.0,   // From skills like Glimmer
  defensiveMult: number = 0.0,   // From skills like Aegis
  mitigationMult: number = 0.0,  // From skills like Luna
) => Math.ceil(
  (1 - defensiveMult) * 
  truncate(
    (1 + offensiveMult) * 
    truncate(
      (classModifier) * 
      max(
        truncate(atk * eff)
        + truncate(truncate(atk * eff) * adv)
        + truncate(bonusDamage)
        - (mit + truncate(mit * mitigationMult)),
        0,
      ),
    ),
  )
);

const hasWeaponBreaker = (instanceA: HeroInstance, instanceB: HeroInstance) => {
  const heroB = lookupStats(instanceB.name);
  let necessaryBreaker = replace(/(Red|Green|Blue|Neutral)\s/, '', heroB.weaponType) + 'breaker';
  if (test(/Tome/, heroB.weaponType)) {
    // R Tomebreaker, G Tomebreaker, B Tomebreaker
    necessaryBreaker = heroB.weaponType[0] + ' ' + necessaryBreaker;
  }
  if (hasSkill(instanceA, 'PASSIVE_B', necessaryBreaker)) {
    return true;
  }
  if (necessaryBreaker === 'Daggerbreaker') {
    return hasSkill(instanceA, 'WEAPON', 'Assassin\'s Bow');
  }
  return false;
};

// Whether or not a unit will perform a follow-up attack.
const doesFollowUp = (instanceA: HeroInstance, instanceB: HeroInstance, isAttacker: boolean) => {
  // Supposedly x-breaker overrides wary-fighter, and multiple x-breakers cancel out.
  const aHasBreaker = hasWeaponBreaker(instanceA, instanceB);
  const bHasBreaker = hasWeaponBreaker(instanceB, instanceA);
  if (aHasBreaker && !bHasBreaker) {
    return true;
  } else if (bHasBreaker && !aHasBreaker) {
    return false;
  } else if (hasSkill(instanceA, 'PASSIVE_B', 'Wary Fighter')
             || hasSkill(instanceB, 'PASSIVE_B', 'Wary Fighter')) {
    return false;
  } else if (!isAttacker && (hasSkill(instanceA, 'WEAPON', 'Armads')
             || hasSkill(instanceA, 'PASSIVE_B', 'Quick Riposte'))) {
    return true;
  }
  return (
    (getStat(instanceA, 'spd', 40, isAttacker)
    - getStat(instanceB, 'spd', 40, !isAttacker))
    >= 5
  );
};

// Healers do half-damage
const classModifier = (instance: HeroInstance) => {
  const hero = lookupStats(instance.name);
  return (hero && (hero.weaponType === 'Neutral Staff')) ? 0.5 : 1;
};

const advantageBonus = (heroA: HeroInstance, heroB: HeroInstance) => {
  const colorA = getWeaponColor(heroA);
  const colorB = getWeaponColor(heroB);
  const weaponA = getSkill(heroA, 'WEAPON');
  const weaponB = getSkill(heroB, 'WEAPON');
  let advantage = 0;
  if (
    (colorA === 'RED' && colorB === 'GREEN')
    || (colorA === 'GREEN' && colorB === 'BLUE')
    || (colorA === 'BLUE' && colorB === 'RED')
  ) {
    advantage = 1;
  } else if (
    (colorA === 'RED' && colorB === 'BLUE')
    || (colorA === 'GREEN' && colorB === 'RED')
    || (colorA === 'BLUE' && colorB === 'GREEN')
  ) {
    advantage = -1;
  } else if (colorB === 'NEUTRAL' && test(/raven/, weaponA)) {
    advantage = 1;
  } else if (colorA === 'NEUTRAL' && test(/raven/, weaponB)) {
    advantage = -1;
  }
  const passiveA = getSkill(heroA, 'PASSIVE_A');
  const passiveB = getSkill(heroB, 'PASSIVE_A');
  // Weapon type advantage multipliers don't stack. Source:
  // https://feheroes.wiki/Damage_Calculation#Weapon_Triangle_Advantage
  let advantageMultiplier = 0.2;
  if (test(/(Ruby|Sapphire|Emerald)/, weaponA)
      || test(/(Ruby|Sapphire|Emerald)/, weaponB)
      || passiveA === 'Triangle Adept 3'
      || passiveB === 'Triangle Adept 3') {
    advantageMultiplier = 0.4;  // 20%
  } else if (passiveA === 'Triangle Adept 2' || passiveB === 'Triangle Adept 2') {
    advantageMultiplier = 0.35;  // 15%
  } else if (passiveA === 'Triangle Adept 1' || passiveB === 'Triangle Adept 1') {
    advantageMultiplier = 0.3;  // 10%
  }
  return advantage * advantageMultiplier;
};

const effectiveBonus = (attacker: HeroInstance, defender: HeroInstance) => {
  if (hasSkill(defender, 'PASSIVE_A', 'Shield')) {
    return 1;
  }
  const defenderMoveType = lookupStats(defender.name).moveType;
  if (
    lookupStats(attacker.name).weaponType === 'Neutral Bow'
    && defenderMoveType === 'Flying'
  ) {
    return 1.5;
  }
  const weaponName = getSkill(attacker, 'WEAPON');
  if ((test(/(Heavy Spear|Armorslayer|Hammer)/, weaponName) && defenderMoveType === 'Armored')
      || (test(/wolf/, weaponName) && defenderMoveType === 'Cavalry')
      || (test(/Poison Dagger/, weaponName) && defenderMoveType === 'Infantry')
      || (test(/Excalibur/, weaponName) && defenderMoveType === 'Flying')
      || (test(/(Falchion|Naga)/, weaponName)
          && test(/Beast/, lookupStats(defender.name).weaponType))
    ) {
    return 1.5;
  }
  else return 1;
};

const canRetaliate = (attacker: HeroInstance, defender: HeroInstance) => {
  if (getRange(defender) === getRange(attacker)) {
    return true;
  }
  const passiveA = getSkill(defender, 'PASSIVE_A');
  const weaponName = getSkill(defender, 'WEAPON');
  return (passiveA === 'Close Counter'
       || passiveA === 'Distant Counter'
       || weaponName === 'Raijinto'
       || weaponName === 'Lightning Breath'
       || weaponName === 'Lightning Breath+');
};

const hpRemaining = (dmg, hp) => max(hp - dmg, 0);

const hitDmg = (
  attacker: HeroInstance,
  defender: HeroInstance,
  isAttacker: boolean,
  attackerSpecial: ?string = null,
  defenderSpecial: ?string = null,
  attackerMissingHp: number = 0,
  defenderHpRemaining: number = 100,
) => dmgFormula(
  getStat(attacker, 'atk', 40, isAttacker),
  effectiveBonus(attacker, defender),
  advantageBonus(attacker, defender),
  getStat(defender, getMitigationType(attacker), 40, !isAttacker),
  classModifier(attacker),
  Math.min(
    getSpecialNonLethalDamageAmount(attackerSpecial, attacker, defender, isAttacker),
    defenderHpRemaining - 1,
  ),
  getSpecialBonusDamageAmount(attackerSpecial, attacker, isAttacker),
  getSpecialOffensiveMultiplier(attackerSpecial),
  getSpecialDefensiveMultiplier(defenderSpecial),
  getSpecialMitigationMultiplier(attackerSpecial),
);

/**
 * Calculate the resulting damage per hit, number of hits, and final HP for each hero.
 *
 * @param {Hero} attacker
 * @param {Hero} defender
 * @returns {object}
 */
export const calculateResult = (attacker: HeroInstance, defender: HeroInstance) => {
  // a list of 0s and 1s for attacker and defender.
  let attackOrder = [];
  // attacker hits defender
  attackOrder.push(0);
  if (hasBraveWeapon(attacker)) {
    attackOrder.push(0);
  }
  // defender retaliates
  if (canRetaliate(attacker, defender)) {
    attackOrder.push(1);
  }
  // attacker follow-up
  if (doesFollowUp(attacker, defender, true)) {
    attackOrder.push(0);
    if (hasBraveWeapon(attacker)) {
      attackOrder.push(0);
    }
  }
  // defender follow-up
  if (canRetaliate(attacker, defender)
    && doesFollowUp(defender, attacker, false)) {
    attackOrder.push(1);
  }
  // TODO: decide if Galeforce will trigger.

  const damages = [hitDmg(attacker, defender, true), hitDmg(defender, attacker, false)];
  const heroes = [attacker, defender];
  const specialNames = [getSkill(attacker, 'SPECIAL'), getSkill(defender, 'SPECIAL')];
  let specialCds = map(getSpecialCooldown, specialNames);
  let specialTypes = map(getSpecialType, specialNames);
  let numAttacks = [0, 0];
  let healths = [getStat(attacker, 'hp'), getStat(defender, 'hp')];
  for (let heroIndex of attackOrder) {
    // heroIndex hits otherHeroIndex.
    numAttacks[heroIndex]++;
    if (healths[heroIndex] > 0) {
      const otherHeroIndex = 1 - heroIndex;
      const stillFighting = healths[0] > 0 && healths[1] > 0;

      let lifestealAmount = 0;   // From Spring weapons
      let lifestealPercent = hasSkill(heroes[heroIndex], 'WEAPON', 'Absorb') ? 0.5 : 0.0;
            
      // Attacker Special
      let attackerSpecial = null;
      if (specialCds[heroIndex] == 0 && specialTypes[heroIndex] === 'ATTACK') {
        attackerSpecial = specialNames[heroIndex];
        console.log('Offensive Special triggers!', attackerSpecial);
        // TODO: Lifesteal specials
        specialCds[heroIndex] = getSpecialCooldown(specialNames[heroIndex]);
      } else if (specialTypes[heroIndex] !== 'HEAL') {
        specialCds[heroIndex]--;
      }
      // Defender Special
      let defenderSpecial = null;
      if (specialCds[otherHeroIndex] == 0 && specialTypes[otherHeroIndex] === 'ATTACKED') {
        const specialName = specialNames[otherHeroIndex];
        // TODO: Use tentative damage to decide if Miracle applies.
        // const tentativeDamage = hitDmg()
        // The unit that initiated combat decided the range of the battle.
        if (doesDefenseSpecialApply(getRange(attacker), specialName)) {
          defenderSpecial = specialName;
          console.log('Defensive Special triggers!', attackerSpecial);
          specialCds[otherHeroIndex] = getSpecialCooldown(specialName);
        }
      } else if (specialTypes[heroIndex] !== 'HEAL') {
        specialCds[otherHeroIndex]--;
      }
      // Compute and apply damage
      const dmg = hitDmg(
        heroes[heroIndex],
        heroes[otherHeroIndex],
        heroIndex === 0,
        attackerSpecial,
        defenderSpecial,
      );
      healths[otherHeroIndex] = hpRemaining(dmg, healths[otherHeroIndex]);
      if (stillFighting) {
        healths[heroIndex] = Math.min(
          healths[heroIndex] + Math.floor(damages[heroIndex] * lifestealPercent),
          getStat(heroes[heroIndex], 'hp'),
        );
        // TODO: Fury Pain and Poison Strike
      }
    }
  }

  return {
    aoeDamage: 0, // TODO: return a number for precombat damage
    attackerNumAttacks: numAttacks[0],
    attackerDamage: damages[0],
    attackerHpRemaining: healths[0],
    defenderNumAttacks: numAttacks[1],
    defenderDamage: damages[1],
    defenderHpRemaining: healths[1],
  };
};

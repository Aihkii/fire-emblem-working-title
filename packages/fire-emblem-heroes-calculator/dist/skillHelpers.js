'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpecialCooldown = undefined;
exports.getSkillNumbers = getSkillNumbers;
exports.hpRequirementSatisfied = hpRequirementSatisfied;
exports.getStatValue = getStatValue;
exports.isMaxTier = isMaxTier;
exports.isFreeSkill = isFreeSkill;
exports.getSpecialType = getSpecialType;
exports.doesDefenseSpecialApply = doesDefenseSpecialApply;
exports.getSpecialMitigationMultiplier = getSpecialMitigationMultiplier;
exports.getSpecialAOEDamageAmount = getSpecialAOEDamageAmount;
exports.getSpecialBonusDamageAmount = getSpecialBonusDamageAmount;
exports.getSpecialOffensiveMultiplier = getSpecialOffensiveMultiplier;
exports.getSpecialDefensiveMultiplier = getSpecialDefensiveMultiplier;
exports.getSpecialLifestealPercent = getSpecialLifestealPercent;
exports.getSpecialChargeForAttack = getSpecialChargeForAttack;
exports.getSpecialChargeWhenAttacked = getSpecialChargeWhenAttacked;

var _ramda = require('ramda');

var _fireEmblemHeroesStats = require('fire-emblem-heroes-stats');

var _heroHelpers = require('./heroHelpers');

var capitalize = (0, _ramda.compose)((0, _ramda.join)(''), (0, _ramda.juxt)([(0, _ramda.compose)(_ramda.toUpper, _ramda.head), _ramda.tail]));

// Returns a list of numbers from the effect of the skill, or [0].

function getSkillNumbers(hero, skillType) {
  var skill = (0, _fireEmblemHeroesStats.getSkillObject)(skillType, (0, _heroHelpers.getSkillName)(hero, skillType));
  if (skill === undefined) {
    return [0];
  }
  // $FlowIssue $Iterable. This type is incompatible with ... Array<number>
  return (0, _ramda.map)(parseInt, (0, _ramda.match)(/\d+/g, skill.effect));
}

function hpRequirementSatisfied(hero, skillType) {
  var skill = (0, _fireEmblemHeroesStats.getSkillObject)(skillType, (0, _heroHelpers.getSkillName)(hero, skillType));
  if (skill !== undefined) {
    if ((0, _ramda.test)(/≥\s*\d+%/, skill.effect)) {
      return (0, _heroHelpers.hpAboveThreshold)(hero, parseInt((0, _ramda.match)(/(\d+)%/, skill.effect)[1]));
    }
    if ((0, _ramda.test)(/≤\s*\d+%/, skill.effect)) {
      return (0, _heroHelpers.hpBelowThreshold)(hero, parseInt((0, _ramda.match)(/(\d+)%/, skill.effect)[1]));
    }
  }
  return true;
}

// Returns the value for a stat provided by a passive skill
function getStatValue(hero, skillType, statKey, isAttacker) {
  var skillName = (0, _heroHelpers.getSkillName)(hero, skillType);
  var skill = (0, _fireEmblemHeroesStats.getSkillObject)(skillType, skillName);
  if (skill === undefined) {
    return 0;
  } else if (skill.type === 'WEAPON') {
    if (statKey === 'atk') {
      // Flow does not like conversion directly to WeaponSkill so I convert to an any instead
      var anySkill = skill;
      var weaponMight = anySkill['damage(mt)'];
      if (isAttacker && skill.name === 'Durandal') {
        return weaponMight + 4;
      }
      return weaponMight;
    } else if (statKey === 'spd') {
      if (skill.name === 'Yato' && isAttacker) {
        return 4;
      }
      if ((0, _ramda.test)(/Brave|Dire/, skill.name)) {
        return -5;
      }
    } else if ((skill.name === 'Binding Blade' || skill.name === 'Naga') && !isAttacker) {
      return 2;
    }
    if (statKey === 'def' && skill.name === 'Tyrfing' && (0, _heroHelpers.hpBelowThreshold)(hero, 50)) {
      return 4;
    }
    if (statKey === 'res' && skill.name === 'Parthia' && isAttacker) {
      return 4;
    }
  } else if (skill.type === 'PASSIVE_A' || skill.type === 'SEAL') {
    var statRegex = new RegExp(statKey === 'hp' ? 'max HP' : capitalize(statKey));
    if ((0, _ramda.test)(statRegex, skill.effect)) {
      var skillNumbers = getSkillNumbers(hero, skillType);
      // Atk/Def/Spd/Res/HP+, 'Attack Def+', and Fury
      if ((0, _ramda.test)(/(Fury|\+)/, skillName)) {
        return skillNumbers[0];
      }
      // Fortress Def
      if ((0, _ramda.test)(/Fortress Def/, skillName)) {
        if (statKey === 'def') {
          return skillNumbers[0];
        } else if (statKey === 'atk') {
          return -skillNumbers[1];
        }
      }
      // Death/Darting/Armored/Warding Blow
      if (isAttacker && (0, _ramda.test)(/(Blow|Sparrow)/, skillName)) {
        return skillNumbers[0];
      }
      if ((0, _ramda.test)(/Life and Death/, skillName)) {
        if (statKey === 'atk' || statKey === 'spd') {
          return skillNumbers[0];
        } else if (statKey === 'def' || statKey === 'res') {
          return -skillNumbers[1];
        }
      }
    }
  }
  return 0;
}

/*
 * Helpers to check a property of a skill by name.
 */

// Checks whether or not a skill (ex: Wary Fighter 3) is the final form of the skill.
function isMaxTier(skillName) {
  if (isFreeSkill(skillName)) {
    return false;
  }
  if ((0, _ramda.test)(/(Swift Sparrow 2|Attack Def \+2)/, skillName)) {
    return true;
  }
  if ((0, _ramda.test)(/HP \+(3|4)$/, skillName)) {
    return false;
  }
  // TODO: for weapons check if a + version of the skill exists.
  return !(0, _ramda.test)(/(1|2)$/, skillName);
}

// Checks for skills that cost 0 SP.
function isFreeSkill(skillName) {
  return (0, _ramda.test)(/^(Iron|Steel|Fire Breath\+?$|Fire$|Flux$|Wind$|Thunder$)/, skillName);
}

/*
 * Special Related Helpers
 * https://feheroes.wiki/Specials
 */

// Returns the condition for the special to trigger. (Other is for Galefore)
function getSpecialType(instance) {
  if (instance.skills['SPECIAL'] === undefined) return undefined;
  if ((0, _ramda.test)(/When healing/, (0, _heroHelpers.getSkillEffect)(instance, 'SPECIAL'))) return 'HEAL';
  if ((0, _ramda.test)(/Galeforce/, (0, _heroHelpers.getSkillName)(instance, 'SPECIAL'))) return 'OTHER';
  if ((0, _ramda.test)(/Reduces damage/, (0, _heroHelpers.getSkillEffect)(instance, 'SPECIAL'))) return 'ATTACKED';
  if ((0, _ramda.test)(/Miracle/, (0, _heroHelpers.getSkillName)(instance, 'SPECIAL'))) return 'ATTACKED';
  if ((0, _ramda.test)(/(Blazing|Growing|Rising)/, (0, _heroHelpers.getSkillName)(instance, 'SPECIAL'))) return 'INITIATE';
  return 'ATTACK';
}

// Returns the cooldown of the special or -1. Accounts for killer weapons.
var getSpecialCooldown = exports.getSpecialCooldown = function getSpecialCooldown(instance) {
  var skill = (0, _fireEmblemHeroesStats.getSkillObject)('SPECIAL', (0, _heroHelpers.getSkillName)(instance, 'SPECIAL'));
  return !skill || typeof skill.cooldown !== 'number' ? -1 : skill.cooldown + ((0, _ramda.test)(/Accelerates S/, (0, _heroHelpers.getSkillEffect)(instance, 'WEAPON')) ? -1 : 0) + ((0, _ramda.test)(/Slows Special/, (0, _heroHelpers.getSkillEffect)(instance, 'WEAPON')) ? +1 : 0);
};

// Only considers damage reduction specials
function doesDefenseSpecialApply(skillName, attackRange) {
  return attackRange === 1 && (0, _ramda.test)(/(Pavise|Buckler|Escutcheon)/, skillName) || attackRange === 2 && (0, _ramda.test)(/(Aegis|Holy Vestments|Sacred Cowl)/, skillName);
}
// Returns the percent of defense reduced by a special.
function getSpecialMitigationMultiplier(skillName) {
  return (0, _ramda.test)(/(New Moon|Moonbow)/, skillName) ? 0.3 : (0, _ramda.test)(/(Luna|Aether)/, skillName) ? 0.5 : 0;
}
// Returns a flat amount of nonLethal damage for an AOE special.
function getSpecialAOEDamageAmount(skillName, attacker, defender) {
  var atk = (0, _heroHelpers.getStat)(attacker, 'atk', 40, true);
  var def = (0, _heroHelpers.getStat)(defender, (0, _heroHelpers.getMitigationType)(attacker), 40, false);
  var multiplier = (0, _ramda.test)(/(Blazing)/, skillName) ? 1.5 : (0, _ramda.test)(/(Growing|Rising)/, skillName) ? 1.0 : 0;
  return Math.floor(multiplier * (atk - def));
}
// Returns a flat amount of bonus damage for a stat-based special (or missing HP special)
function getSpecialBonusDamageAmount(skillName, attacker, isAttacker, attackerMissingHp) {
  var woDaoBonus = skillName !== '' && skillName !== undefined && getSpecialType(attacker) === 'ATTACK' && (0, _heroHelpers.hasSkill)(attacker, 'WEAPON', 'Wo Dao') ? 10 : 0;
  var stat = 'def';
  if ((0, _ramda.test)(/Dra(c|g)on/, skillName)) stat = 'atk';
  if ((0, _ramda.test)(/(Bonfire|Glowing E|Ignis)/, skillName)) stat = 'def';
  if ((0, _ramda.test)(/(Glacies|Chilling W|Iceberg)/, skillName)) stat = 'res';
  var ratio = 0.0;
  if ((0, _ramda.test)(/(Glacies|Ignis)/, skillName)) ratio = 0.8;
  if ((0, _ramda.test)(/(Bonfire|Glowing E|Chilling W|Iceberg|Dragon F|Vengeance)/, skillName)) ratio = 0.5;
  if ((0, _ramda.test)(/(Draconic A|Dragon G|Reprisal|Retribution)/, skillName)) ratio = 0.3;
  if ((0, _ramda.test)(/(Reprisal|Retribution|Vengeance)/, skillName)) {
    return woDaoBonus + Math.floor(attackerMissingHp * ratio);
  }
  return woDaoBonus + Math.floor((0, _heroHelpers.getStat)(attacker, stat, 40, isAttacker) * ratio);
}
// Returns the percent of damage increased by a special
function getSpecialOffensiveMultiplier(skillName) {
  return (0, _ramda.test)(/Astra/, skillName) ? 1.5 : (0, _ramda.test)(/(Glimmer|Night Sky)/, skillName) ? 0.5 : 0;
}
// Returns the percent of damage reduced by a special.
function getSpecialDefensiveMultiplier(skillName) {
  return (0, _ramda.test)(/(Pavise|Aegis)/, skillName) ? 0.5 : (0, _ramda.test)(/(Buckler|Escutcheon|Holy Vestments|Sacred Cowl)/, skillName) ? 0.3 : 0;
}
// Returns the percent of damage increased by a special
function getSpecialLifestealPercent(skillName) {
  return (0, _ramda.test)(/(Aether|Sol)/, skillName) ? 0.5 : (0, _ramda.test)(/(Daylight|Noontime)/, skillName) ? 0.3 : 0.0;
}

// Returns the number of special charges generated per attack (usually 1).
function getSpecialChargeForAttack(hero1, hero2, isAttacker) {
  var specialChargePerAtk = 1;
  if ((0, _heroHelpers.hasSkill)(hero1, 'PASSIVE_A', 'Heavy Blade')) {
    var atkReq = getSkillNumbers(hero1, 'PASSIVE_A')[0];
    if ((0, _heroHelpers.getStat)(hero1, 'atk', 40, isAttacker) - (0, _heroHelpers.getStat)(hero2, 'atk', 40, !isAttacker) >= atkReq) {
      specialChargePerAtk += 1;
    }
  }
  if ((0, _heroHelpers.hasSkill)(hero2, 'PASSIVE_B', 'Guard')) {
    specialChargePerAtk -= 1;
  }
  return specialChargePerAtk;
}

// Returns the number of special charges generated when opponent attacks you (usually 1).
// OtherHero is the one that is attacking you.
function getSpecialChargeWhenAttacked(otherHero) {
  return (0, _heroHelpers.hasSkill)(otherHero, 'PASSIVE_B', 'Guard') ? 0 : 1;
}